import ipaddress
import re
from typing import Tuple, List
from backend.config import settings

def parse_allowed_networks() -> List[ipaddress.IPv4Network | ipaddress.IPv6Network]:
    raw_subnets = settings.ALLOWED_SUBNETS.split(",")
    networks = []
    for s in raw_subnets:
        s = s.strip()
        if s:
            try:
                networks.append(ipaddress.ip_network(s, strict=False))
            except ValueError:
                pass
    return networks

def validate_device_ip(ip_str: str, is_simulation: bool = False) -> Tuple[bool, str]:
    """
    Validates whether an IP address is allowed to be registered.
    Supports any valid IPv4, IPv6, or Hostname/Domain without restricting to campus subnets.
    """
    clean_ip = (ip_str or "").strip()
    if not clean_ip:
        return False, "กรุณากรอก IP Address หรือ Hostname ของอุปกรณ์"

    # Allow simulation / loopback
    is_loopback = clean_ip in ("127.0.0.1", "localhost", "::1") or clean_ip.startswith("127.")
    if is_loopback:
        return True, "IP ใช้งานได้ (Localhost / Simulation)"

    # Validate IP Address (IPv4 / IPv6) format
    try:
        ipaddress.ip_address(clean_ip)
        return True, "IP Address ถูกต้องและได้รับอนุญาต"
    except ValueError:
        pass

    # If it looks like an IPv4 with numeric octets but failed, it's an invalid IP
    if re.match(r"^\d+(\.\d+)+$", clean_ip):
        return False, f"รูปแบบ IP Address ไม่ถูกต้อง ('{clean_ip}') กรุณากรอกเป็น IPv4 ที่ถูกต้อง เช่น 10.153.1.10 หรือ 192.168.1.1"

    # Validate Hostname or Domain format (e.g. router.local, server.bru.ac.th, google.com, core-sw1)
    if re.match(r"^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$", clean_ip):
        return True, "Hostname / Domain ถูกต้องและได้รับอนุญาต"

    return False, f"รูปแบบ IP Address หรือ Hostname ไม่ถูกต้อง ('{clean_ip}')"
