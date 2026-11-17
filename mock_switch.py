#!/usr/bin/env python3
"""
Mock SNMP Switch Simulator
==========================
Simulates a network switch (e.g. Cisco Catalyst / Aruba Switch) 
listening for SNMP v2c queries on UDP port 161 (127.0.0.1) for testing.

Usage:
    python mock_switch.py
    (or specify port: python mock_switch.py --port 161 --community public)
"""

import sys
import time
import socket
import signal
import argparse
from datetime import datetime

def encode_length(length: int) -> bytes:
    if length < 0x80:
        return bytes([length])
    len_bytes = []
    while length > 0:
        len_bytes.insert(0, length & 0xff)
        length >>= 8
    return bytes([0x80 | len(len_bytes)]) + bytes(len_bytes)

def read_tlv(data: bytes, offset: int):
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

def build_snmp_response(request_data: bytes, uptime_hundredths: int) -> bytes:
    try:
        tag, val, _ = read_tlv(request_data, 0)
        curr = 0
        t, ver, curr = read_tlv(val, curr)
        t, comm, curr = read_tlv(val, curr)
        pdu_tag, pdu_val, _ = read_tlv(val, curr)
        pcurr = 0
        t, req_id, pcurr = read_tlv(pdu_val, pcurr)
        t, err_status, pcurr = read_tlv(pdu_val, pcurr)
        t, err_idx, pcurr = read_tlv(pdu_val, pcurr)
        t, vb_list, _ = read_tlv(pdu_val, pcurr)
        t, vb, _ = read_tlv(vb_list, 0)
        t, oid, _ = read_tlv(vb, 0)

        # Build response packet with sysUpTime (TimeTicks tag 0x43)
        val_bytes = uptime_hundredths.to_bytes(4, 'big')
        val_encoded = b'\x43' + encode_length(len(val_bytes)) + val_bytes
        oid_encoded = b'\x06' + encode_length(len(oid)) + oid
        res_vb = b'\x30' + encode_length(len(oid_encoded) + len(val_encoded)) + oid_encoded + val_encoded
        res_vbl = b'\x30' + encode_length(len(res_vb)) + res_vb
        res_pdu_body = b'\x02\x04' + req_id + b'\x02\x01\x00\x02\x01\x00' + res_vbl
        res_pdu = b'\xa2' + encode_length(len(res_pdu_body)) + res_pdu_body
        comm_encoded = b'\x04' + encode_length(len(comm)) + comm
        res_body = b'\x02\x01\x01' + comm_encoded + res_pdu
        return b'\x30' + encode_length(len(res_body)) + res_body
    except Exception:
        return b""

def format_uptime(sec: float) -> str:
    days = int(sec // 86400)
    hours = int((sec % 86400) // 3600)
    mins = int((sec % 3600) // 60)
    s = int(sec % 60)
    if days > 0:
        return f"{days}d {hours:02d}h {mins:02d}m {s:02d}s"
    return f"{hours:02d}h {mins:02d}m {s:02d}s"

def main():
    parser = argparse.ArgumentParser(description="Mock SNMP Switch Simulator")
    parser.add_argument("--host", default="127.0.0.1", help="Binding host IP (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=161, help="UDP port (default: 161)")
    parser.add_argument("--community", default="public", help="SNMP Community (default: public)")
    parser.add_argument("--simulated-days", type=int, default=14, help="Simulated initial uptime in days (default: 14)")
    args = parser.parse_args()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.bind((args.host, args.port))
    except PermissionError:
        print(f"[!] Permission denied on port {args.port}. Try running as Administrator or use a different port (e.g. 1161).")
        sys.exit(1)
    except Exception as e:
        print(f"[!] Error binding to port {args.port}: {e}")
        sys.exit(1)

    # Set non-blocking timeout so Windows can catch Ctrl+C (KeyboardInterrupt) instantly
    sock.settimeout(0.5)

    boot_timestamp = time.time() - (args.simulated_days * 86400)

    print("=" * 62)
    print("  Mock SNMP Network Switch Simulator")
    print("=" * 62)
    print(f"  * Status            : Running (Cisco Catalyst 3850 Switch)")
    print(f"  * Address (Host:Port): {args.host}:{args.port} (UDP)")
    print(f"  * Community String  : {args.community}")
    print(f"  * Simulated Uptime  : ~{args.simulated_days} days")
    print("-" * 62)
    print("  [Tip] Want to test both Switch and WiFi AP simultaneously?")
    print("        Use command: python mock_devices.py")
    print("-" * 62)
    print("  Testing in Web UI:")
    print(f"     1. Category       : Network Switch / Router")
    print(f"     2. IP Address     : {args.host}")
    print(f"     3. Check Type     : SNMP v2c Check")
    print(f"     4. Port / Comm    : {args.port} / {args.community}")
    print("=" * 62)
    print("Listening for SNMP requests... (Press Ctrl + C to stop)")
    print()

    running = True

    def signal_handler(signum, frame):
        nonlocal running
        running = False

    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, signal_handler)

    try:
        while running:
            try:
                data, addr = sock.recvfrom(2048)
            except (socket.timeout, TimeoutError):
                continue
            except (KeyboardInterrupt, SystemExit):
                break

            now_sec = time.time() - boot_timestamp
            uptime_ticks = int(now_sec * 100)
            response = build_snmp_response(data, uptime_ticks)
            if response:
                sock.sendto(response, addr)
                uptime_str = format_uptime(now_sec)
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Received SNMP GET from {addr[0]}:{addr[1]} -> Response OK (Uptime: {uptime_str})")
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        sock.close()
        print("\n" + "=" * 62)
        print("Mock Switch Stopped (Simulating Switch Power Down / OFFLINE)")
        print("The system will detect unreachable status and trigger alert.")
        print("=" * 62)

if __name__ == "__main__":
    main()
