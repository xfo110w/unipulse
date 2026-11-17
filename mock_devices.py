#!/usr/bin/env python3
"""
Campus Network Simulator (Switch & WiFi AP Interactive Tester)
==============================================================
Simulates both a Network Switch (Cisco) and an Access Point (Aruba WiFi)
on local loopback (127.0.0.1) for live demonstration and testing.

Ports:
  - Port 161 (UDP): Cisco Catalyst 3850 Switch (SNMP v2c)
  - Port 162 (UDP): Aruba AP-515 Campus WiFi AP (SNMP v2c)

Interactive Controls:
  - Press [1]: Toggle Switch (ONLINE <-> OFFLINE)
  - Press [2]: Toggle WiFi AP (ONLINE <-> OFFLINE)
  - Press [3]: Reboot Switch (Reset Uptime to 0s)
  - Press [4]: Reboot WiFi AP (Reset Uptime to 0s)
  - Press [s]: Show Status Summary
  - Press [q]: Quit Simulator
"""

import sys
import os
import time
import socket
import select
from datetime import datetime

# Windows non-blocking keyboard input
try:
    import msvcrt
    HAS_MSVCRT = True
except ImportError:
    HAS_MSVCRT = False

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
        val_bytes = int(uptime_hundredths).to_bytes(4, 'big')
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

class SimulatedDevice:
    def __init__(self, name: str, category: str, port: int, initial_days: int):
        self.name = name
        self.category = category
        self.port = port
        self.is_online = True
        self.boot_time = time.time() - (initial_days * 86400)
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setblocking(False)
        self.sock.bind(('127.0.0.1', port))

    def get_uptime_sec(self) -> float:
        return max(0.0, time.time() - self.boot_time)

    def reboot(self):
        self.boot_time = time.time()
        self.is_online = True

    def toggle(self):
        self.is_online = not self.is_online
        return self.is_online

def print_banner(switch: SimulatedDevice, ap: SimulatedDevice):
    print("=" * 66)
    print("  [Campus Network Simulator] Switch & WiFi Interactive Tester")
    print("=" * 66)
    sw_st = "ONLINE (UP)" if switch.is_online else "OFFLINE (DOWN)"
    ap_st = "ONLINE (UP)" if ap.is_online else "OFFLINE (DOWN)"
    print(f"  [1] Cisco Catalyst 3850 (Switch) : {sw_st}")
    print(f"      - Address: 127.0.0.1:{switch.port} (UDP SNMP) | Uptime: {format_uptime(switch.get_uptime_sec())}")
    print(f"  [2] Aruba AP-515 (WiFi AP)       : {ap_st}")
    print(f"      - Address: 127.0.0.1:{ap.port} (UDP SNMP) | Uptime: {format_uptime(ap.get_uptime_sec())}")
    print("-" * 66)
    print("  Interactive Key Controls (Press any key directly on keyboard):")
    print("     [1] : Toggle Switch (ONLINE <-> OFFLINE)")
    print("     [2] : Toggle WiFi AP (ONLINE <-> OFFLINE)")
    print("     [3] : Reboot Switch (Simulate Power Flick / Reset Uptime to 0)")
    print("     [4] : Reboot WiFi AP (Simulate Power Flick / Reset Uptime to 0)")
    print("     [s] : Show Current Status Summary")
    print("     [q] : Quit Simulator")
    print("=" * 66)
    print("Listening for SNMP requests from UniPulse... (Press keys anytime)")
    print()

def main():
    try:
        switch = SimulatedDevice("Cisco Switch 3850", "NETWORK_SWITCH", 161, initial_days=14)
        ap = SimulatedDevice("Aruba AP-515 WiFi", "ACCESS_POINT", 162, initial_days=5)
    except PermissionError:
        print("[!] Permission denied on port 161/162. Try running PowerShell as Administrator.")
        sys.exit(1)
    except Exception as e:
        print(f"[!] Error binding ports: {e}")
        sys.exit(1)

    print_banner(switch, ap)
    running = True

    sockets = [switch.sock, ap.sock]

    while running:
        # Check keyboard inputs on Windows
        if HAS_MSVCRT and msvcrt.kbhit():
            try:
                ch = msvcrt.getch().decode('utf-8', errors='ignore').lower()
            except Exception:
                ch = ''
            if ch == '1':
                st = switch.toggle()
                status_str = "ONLINE (UP - Device Powered ON)" if st else "OFFLINE (DOWN - Cable Unplugged / Power Cut)"
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [Action] Cisco Switch -> {status_str}")
            elif ch == '2':
                st = ap.toggle()
                status_str = "ONLINE (UP - Device Powered ON)" if st else "OFFLINE (DOWN - Cable Unplugged / Power Cut)"
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [Action] Aruba WiFi AP -> {status_str}")
            elif ch == '3':
                switch.reboot()
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [Action] Cisco Switch -> REBOOTED (Uptime reset to 0s)")
            elif ch == '4':
                ap.reboot()
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [Action] Aruba WiFi AP -> REBOOTED (Uptime reset to 0s)")
            elif ch == 's':
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Status: Switch={'UP' if switch.is_online else 'DOWN'} ({format_uptime(switch.get_uptime_sec())}), AP={'UP' if ap.is_online else 'DOWN'} ({format_uptime(ap.get_uptime_sec())})")
            elif ch == 'q':
                print("\nStopped network simulation.")
                running = False
                break

        # Check network sockets with 0.1s timeout
        try:
            readable, _, _ = select.select(sockets, [], [], 0.1)
        except (ValueError, select.error):
            break

        for s in readable:
            try:
                data, addr = s.recvfrom(2048)
            except Exception:
                continue

            target_device = switch if s == switch.sock else ap
            
            # If device is OFFLINE, ignore request completely (simulates dropped packet)
            if not target_device.is_online:
                continue

            # Device is ONLINE -> respond with SNMP GetResponse
            uptime_ticks = int(target_device.get_uptime_sec() * 100)
            res = build_snmp_response(data, uptime_ticks)
            if res:
                s.sendto(res, addr)
                now_str = datetime.now().strftime('%H:%M:%S')
                print(f"[{now_str}] SNMP Response OK to {addr[0]}:{addr[1]} -> [{target_device.name}] (Uptime: {format_uptime(target_device.get_uptime_sec())})")

    switch.sock.close()
    ap.sock.close()

if __name__ == "__main__":
    main()
