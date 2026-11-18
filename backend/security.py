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
    Protects against SSRF (Server-Side Request Forgery) and unauthorized network probing.
    
    Rules:
    1. If is_simulation is True:
       - Loopback addresses (127.0.0.1, localhost, ::1) are allowed if ALLOW_SIMULATION_MOCK is enabled.
    2. If is_simulation is False:
       - Loopback addresses are blocked (prompts user to toggle simulation mode).
       - Link-local (169.254.x.x - AWS/Cloud metadata) and Multicast are blocked.
       - Public Internet IPs (e.g. 8.8.8.8, 1.1.1.1) are blocked.
       - Only designated campus / private subnets (e.g. 10.153.0.0/16, 10.x.x.x, 192.168.x.x) are allowed.
    """
    clean_ip = (ip_str or "").strip()
    if not clean_ip:
        return False, "กรุณากรอก IP Address ของอุปกรณ์"

    # Simulation / Mock Mode Handling
    is_loopback = clean_ip in ("127.0.0.1", "localhost", "::1") or clean_ip.startswith("127.")
    if is_loopback:
        if is_simulation:
            if settings.ALLOW_SIMULATION_MOCK:
                return True, "อนุญาตสำหรับอุปกรณ์จำลอง (Simulator)"
            else:
                return False, "ระบบปิดการใช้งานโหมดอุปกรณ์จำลองบนเซิร์ฟเวอร์นี้"
        else:
            return False, (
                "ไม่อนุญาตให้ใช้ IP เครื่องตนเอง (127.0.0.1) ในโหมดอุปกรณ์จริง "
                "หากต้องการทดสอบด้วย mock_switch.py หรือ mock_devices.py "
                "กรุณาติ๊กเลือกช่อง 'อุปกรณ์จำลองสำหรับทดสอบ (Simulator)'"
            )

    # Validate IP Address or Hostname format
    try:
        ip_obj = ipaddress.ip_address(clean_ip)
    except ValueError:
        # Check if it's an allowed internal hostname (.bru.ac.th or .local)
        if re.match(r"^[a-zA-Z0-9\-\.]+\.bru\.ac\.th$", clean_ip) or clean_ip.endswith(".local"):
            return True, "Hostname ภายในมหาวิทยาลัยได้รับอนุญาต"
        return False, f"รูปแบบ IP Address ไม่ถูกต้อง ('{clean_ip}') กรุณากรอกเป็น IPv4 เช่น 10.153.1.10"

    # Disallow Link-local (e.g. 169.254.x.x - cloud metadata SSRF attack vector)
    if ip_obj.is_link_local:
        return False, f"ไม่อนุญาตให้ใช้ Link-Local IP ({clean_ip}) เพื่อความปลอดภัย (SSRF Protection)"

    # Disallow Multicast
    if ip_obj.is_multicast:
        return False, f"ไม่อนุญาตให้ใช้ Multicast IP ({clean_ip})"

    # Disallow loopback if not simulation
    if ip_obj.is_loopback and not is_simulation:
        return False, (
            "ไม่อนุญาต Loopback IP ในโหมดอุปกรณ์จริง "
            "กรุณาติ๊กเลือก 'อุปกรณ์จำลองสำหรับทดสอบ (Simulator)'"
        )

    # Check allowed subnets
    allowed_networks = parse_allowed_networks()
    in_allowed_subnet = any(ip_obj in net for net in allowed_networks)

    if not in_allowed_subnet:
        return False, (
            f"ไม่อนุญาต: IP '{clean_ip}' อยู่นอกวงเครือข่ายของมหาวิทยาลัย "
            f"(อนุญาตเฉพาะวงภายใน เช่น 10.153.0.0/16 มรภ.บุรีรัมย์ หรือวง LAN ภายใน) "
            "เพื่อป้องกันช่องโหว่ความปลอดภัย SSRF และการสแกนระบบภายนอก"
        )

    return True, "IP ถูกต้องและอยู่ในวงเครือข่ายที่ได้รับอนุญาต"
