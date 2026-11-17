import asyncio
import platform
import re
import socket
import subprocess
import time
from typing import Tuple, Optional, Dict, Any
import httpx
from backend.config import settings

IS_WINDOWS = platform.system().lower() == "windows"

def _sync_ping(cmd: list, timeout_sec: float) -> Tuple[int, str]:
    try:
        kwargs: Dict[str, Any] = {
            "stdout": subprocess.PIPE,
            "stderr": subprocess.PIPE,
            "text": True,
            "timeout": timeout_sec + 1.0,
        }
        if IS_WINDOWS:
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        res = subprocess.run(cmd, **kwargs)
        return res.returncode, res.stdout or ""
    except subprocess.TimeoutExpired:
        return -1, "Ping timed out"
    except Exception as e:
        return -2, str(e)

async def check_ping(host: str, timeout_sec: float = 2.0) -> Tuple[bool, Optional[float], str]:
    """
    Executes ICMP ping asynchronously using a thread pool.
    Guaranteed compatibility with all Windows event loops (Proactor & Selector).
    Returns: (is_online, latency_ms, message)
    """
    start_time = time.perf_counter()
    timeout_ms = int(timeout_sec * 1000)
    
    if IS_WINDOWS:
        cmd = ["ping", "-n", "1", "-w", str(timeout_ms), host]
    else:
        cmd = ["ping", "-c", "1", "-W", str(int(timeout_sec)), host]
        
    try:
        code, output = await asyncio.to_thread(_sync_ping, cmd, timeout_sec)
        
        # Check for reply indicators across languages
        upper_out = output.upper()
        lower_out = output.lower()
        has_reply = ("TTL=" in upper_out) or ("TIME=" in upper_out) or ("TIME<" in upper_out) or ("เวลา=" in output) or ("เวลา<" in output)
        is_unreachable = ("unreachable" in lower_out) or ("timed out" in lower_out) or ("100% loss" in lower_out) or ("ไม่สามารถเข้าถึง" in output)

        if code == 0 and has_reply and not is_unreachable:
            match = re.search(r"(?:time|เวลา)[<=]?\s*(\d+(?:\.\d+)?)\s*ms", output, re.IGNORECASE)
            if match:
                latency = float(match.group(1))
            else:
                latency = round((time.perf_counter() - start_time) * 1000, 2)
            return True, latency, f"Ping OK ({latency:.1f} ms)"
        else:
            return False, None, "Ping timeout / Destination host unreachable"
    except Exception as e:
        return False, None, f"Ping error: {str(e)}"

async def check_tcp_port(host: str, port: int, timeout_sec: float = 2.5) -> Tuple[bool, Optional[float], str]:
    """
    Tests TCP connection to host:port.
    Returns: (is_online, latency_ms, message)
    """
    start_time = time.perf_counter()
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=timeout_sec
        )
        latency = round((time.perf_counter() - start_time) * 1000, 2)
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass
        return True, latency, f"TCP Port {port} Open ({latency:.1f} ms)"
    except asyncio.TimeoutError:
        return False, None, f"TCP Port {port} Connection Timed Out ({timeout_sec}s)"
    except ConnectionRefusedError:
        return False, None, f"TCP Port {port} Connection Refused"
    except Exception as e:
        return False, None, f"TCP Port {port} Error: {str(e)}"

async def check_http(
    host: str, 
    port: Optional[int] = None, 
    path: Optional[str] = None, 
    expected_code: int = 200, 
    timeout_sec: float = 3.5
) -> Tuple[bool, Optional[float], str]:
    """
    Tests HTTP/HTTPS endpoint.
    """
    start_time = time.perf_counter()
    scheme = "https" if port == 443 else "http"
    port_str = f":{port}" if port and port not in (80, 443) else ""
    path_str = path if path else "/"
    if not path_str.startswith("/"):
        path_str = "/" + path_str
        
    url = f"{scheme}://{host}{port_str}{path_str}"
    
    try:
        async with httpx.AsyncClient(timeout=timeout_sec, verify=False) as client:
            resp = await client.get(url)
            latency = round((time.perf_counter() - start_time) * 1000, 2)
            if resp.status_code == expected_code:
                return True, latency, f"HTTP {resp.status_code} OK ({latency:.1f} ms)"
            else:
                return False, latency, f"HTTP Status {resp.status_code} (Expected {expected_code})"
    except asyncio.TimeoutError:
        return False, None, f"HTTP Request Timed Out ({timeout_sec}s)"
    except Exception as e:
        return False, None, f"HTTP Error: {str(e)}"

async def check_pjlink(host: str, port: int = 4352, timeout_sec: float = 3.0) -> Tuple[bool, Optional[float], str]:
    """
    PJLink protocol check for classroom projectors (standard port 4352).
    """
    start_time = time.perf_counter()
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=timeout_sec
        )
        banner = await asyncio.wait_for(reader.read(128), timeout=1.5)
        latency = round((time.perf_counter() - start_time) * 1000, 2)
        
        banner_str = banner.decode("utf-8", errors="ignore").strip()
        status_msg = f"Projector Online (PJLink: {banner_str or 'Connected'})"
        
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass
        return True, latency, status_msg
    except Exception:
        is_open, lat, msg = await check_tcp_port(host, port, timeout_sec)
        if is_open:
            return True, lat, f"Projector Network Port {port} Open"
        return False, None, f"Projector PJLink port {port} Unreachable"

# -------------------------------------------------------------
# SNMP v2c Protocol Helpers (Lightweight ASN.1 BER Encoder/Decoder)
# -------------------------------------------------------------
def _encode_length(length: int) -> bytes:
    if length < 0x80:
        return bytes([length])
    len_bytes = []
    while length > 0:
        len_bytes.insert(0, length & 0xff)
        length >>= 8
    return bytes([0x80 | len(len_bytes)]) + bytes(len_bytes)

def _encode_oid(oid_str: str) -> bytes:
    parts = [int(p) for p in oid_str.strip('.').split('.')]
    res = bytes([40 * parts[0] + parts[1]])
    for p in parts[2:]:
        if p < 0x80:
            res += bytes([p])
        else:
            chunks = [p & 0x7f]
            v = p >> 7
            while v > 0:
                chunks.insert(0, 0x80 | (v & 0x7f))
                v >>= 7
            res += bytes(chunks)
    return b'\x06' + _encode_length(len(res)) + res

def _build_snmp_get(community: str, oid: str, req_id: int = 1001) -> bytes:
    oid_bytes = _encode_oid(oid)
    varbind = b'\x30' + _encode_length(len(oid_bytes) + 2) + oid_bytes + b'\x05\x00'
    varbind_list = b'\x30' + _encode_length(len(varbind)) + varbind
    req_id_bytes = req_id.to_bytes(4, 'big')
    pdu_body = b'\x02\x04' + req_id_bytes + b'\x02\x01\x00\x02\x01\x00' + varbind_list
    pdu = b'\xa0' + _encode_length(len(pdu_body)) + pdu_body
    comm_bytes = community.encode('utf-8')
    comm_encoded = b'\x04' + _encode_length(len(comm_bytes)) + comm_bytes
    version = b'\x02\x01\x01' # SNMPv2c
    snmp_body = version + comm_encoded + pdu
    return b'\x30' + _encode_length(len(snmp_body)) + snmp_body

def _read_tlv(data: bytes, offset: int):
    tag = data[offset]
    offset += 1
    length = data[offset]
    offset += 1
    if length & 0x80:
        num_bytes = length & 0x7f
        length = int.from_bytes(data[offset:offset+num_bytes], 'big')
        offset += num_bytes
    val = data[offset:offset+length]
    return tag, val, offset + length

def _parse_snmp_response(data: bytes) -> Tuple[bool, Optional[Dict[str, Any]], str]:
    try:
        tag, val, _ = _read_tlv(data, 0)
        curr = 0
        t, ver, curr = _read_tlv(val, curr)
        t, comm, curr = _read_tlv(val, curr)
        pdu_tag, pdu_val, _ = _read_tlv(val, curr)
        pcurr = 0
        t, req_id, pcurr = _read_tlv(pdu_val, pcurr)
        t, err_status, pcurr = _read_tlv(pdu_val, pcurr)
        t, err_idx, pcurr = _read_tlv(pdu_val, pcurr)
        err_code = int.from_bytes(err_status, 'big')
        if err_code != 0:
            return False, None, f"SNMP Error code {err_code}"
        t, vb_list, _ = _read_tlv(pdu_val, pcurr)
        t, vb, _ = _read_tlv(vb_list, 0)
        t, oid_bytes, vb_curr = _read_tlv(vb, 0)
        val_tag, val_bytes, _ = _read_tlv(vb, vb_curr)

        if val_tag == 0x43: # TimeTicks (1/100 sec)
            ticks = int.from_bytes(val_bytes, 'big')
            sec = ticks / 100.0
            days = int(sec // 86400)
            hours = int((sec % 86400) // 3600)
            mins = int((sec % 3600) // 60)
            s = int(sec % 60)
            uptime_str = f"{days}d {hours}h {mins}m {s}s" if days > 0 else f"{hours}h {mins}m {s}s"
            telemetry = {
                "uptime_seconds": int(sec),
                "uptime_formatted": uptime_str,
                "timeticks": ticks
            }
            return True, telemetry, uptime_str
        elif val_tag == 0x04: # Octet String
            val_str = val_bytes.decode('utf-8', 'ignore')
            return True, {"value": val_str}, val_str
        elif val_tag in (0x80, 0x81, 0x82):
            return False, None, "SNMP OID not supported on device"
        else:
            return True, {"raw_tag": val_tag}, f"Tag 0x{val_tag:02x}"
    except Exception as e:
        return False, None, f"SNMP parse error: {str(e)}"

async def check_snmp(
    host: str, 
    port: int = 161, 
    community: str = "public", 
    timeout_sec: float = 2.5
) -> Tuple[bool, Optional[float], str, Optional[dict]]:
    """
    Sends SNMP v2c GetRequest to query sysUpTime (1.3.6.1.2.1.1.3.0).
    Returns: (is_online, latency_ms, message, telemetry_dict)
    """
    start_time = time.perf_counter()
    loop = asyncio.get_running_loop()
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setblocking(False)

    packet = _build_snmp_get(community or "public", "1.3.6.1.2.1.1.3.0")

    try:
        sock.connect((host, port or 161))
        sock.send(packet)
        response_data = await asyncio.wait_for(loop.sock_recv(sock, 2048), timeout=timeout_sec)
        latency = round((time.perf_counter() - start_time) * 1000, 2)
        
        ok, telemetry, uptime_or_err = _parse_snmp_response(response_data)
        if ok and telemetry:
            msg = f"SNMP v2c OK (Uptime: {uptime_or_err}, {latency:.1f} ms)"
            return True, latency, msg, telemetry
        else:
            return False, latency, f"SNMP Error: {uptime_or_err}", None
    except asyncio.TimeoutError:
        return False, None, f"SNMP Timed Out ({timeout_sec}s) on port {port or 161}", None
    except ConnectionRefusedError:
        return False, None, f"SNMP Port {port or 161} Connection Refused", None
    except Exception as e:
        return False, None, f"SNMP Error: {str(e)}", None
    finally:
        sock.close()

async def check_device_health(device) -> Tuple[bool, Optional[float], str, bool, Optional[dict]]:
    """
    Dispatches check based on device.check_type:
    Returns: (is_online, latency_ms, message, is_warning, telemetry_dict)
    """
    check_type = (device.check_type or "PING").upper()
    telemetry = None
    
    if check_type == "PING":
        is_online, latency, msg = await check_ping(device.ip_address, settings.PING_TIMEOUT)
    elif check_type == "SNMP":
        port = device.port or 161
        community = getattr(device, "snmp_community", "public") or "public"
        is_online, latency, msg, telemetry = await check_snmp(device.ip_address, port, community, settings.PORT_TIMEOUT)
    elif check_type == "PORT":
        port = device.port or 80
        is_online, latency, msg = await check_tcp_port(device.ip_address, port, settings.PORT_TIMEOUT)
    elif check_type == "HTTP":
        is_online, latency, msg = await check_http(
            device.ip_address, 
            device.port, 
            device.http_path, 
            device.http_expected_code or 200, 
            settings.HTTP_TIMEOUT
        )
    elif check_type == "PJLINK":
        port = device.port or 4352
        is_online, latency, msg = await check_pjlink(device.ip_address, port, settings.PORT_TIMEOUT)
    elif check_type == "AGENT":
        if not device.last_seen:
            return False, None, "No heartbeat received yet", False, None
        diff_sec = (time.time() - device.last_seen.timestamp())
        if diff_sec > (device.check_interval * 2.5):
            return False, None, f"Agent Heartbeat Missed ({int(diff_sec)}s ago)", False, None
        return True, device.response_time_ms or 1.0, f"Agent Healthy (Last seen {int(diff_sec)}s ago)", False, None
    else:
        is_online, latency, msg = await check_ping(device.ip_address, settings.PING_TIMEOUT)
        
    is_warning = False
    if is_online and latency and latency > 150.0:
        is_warning = True
        msg += " [High Latency Warning]"
        
    return is_online, latency, msg, is_warning, telemetry
