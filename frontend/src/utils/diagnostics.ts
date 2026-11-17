/**
 * Intelligent Network Connection Troubleshooter & Root Cause Diagnostics for UniPulse.
 * Provides clear, actionable explanations when real IP connections fail.
 */

import { Device, HealthLog } from '../types';

export interface DiagnosticResult {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  summary: string;
  causes: string[];
  recommendations: string[];
}

export const analyzeDeviceIssue = (
  device: Device, 
  lastLog?: HealthLog | null
): DiagnosticResult => {
  const checkType = device.check_type || 'PING';
  const logMsg = lastLog?.message || '';
  const ip = device.ip_address;

  // 1. SNMP Failure
  if (checkType === 'SNMP') {
    return {
      severity: 'CRITICAL',
      title: 'ส่งคำสั่ง SNMP v2c (พอร์ต 161) ไปยังอุปกรณ์ไม่สำเร็จ',
      summary: logMsg || 'SNMP Timed Out on port 161',
      causes: [
        'ตัวสวิตช์หรือ Access Point ไม่ได้เปิดใช้งานบริการ SNMP Service (พอร์ต 161 UDP ปิดอยู่)',
        `รหัส Community String ไม่ตรง (ปัจจุบันตั้งไว้เป็น "${device.snmp_community || 'public'}" แต่สวิตช์จริงอาจใช้รหัสเฉพาะขององค์กร)`,
        'สวิตช์จริงตั้งค่า Access Control List (ACL) อนุญาตให้เฉพาะ IP เครื่องแม่ข่ายของศูนย์คอมพิวเตอร์ดึงข้อมูลได้เท่านั้น',
        'เครื่องคอมพิวเตอร์ของคุณไม่ได้อยู่ในวง Management VLAN เดียวกับสวิตช์'
      ],
      recommendations: [
        '💡 วิธีแก้ด่วน: หากต้องการตรวจเช็คแค่ว่าสวิตช์เปิดใช้งานอยู่หรือไม่ ให้กด "แก้ไขอุปกรณ์ (Edit)" แล้วเปลี่ยนวิธีตรวจเป็น "PING" จะเชื่อมต่อได้ทันที',
        'หากต้องการใช้ SNMP เพื่อดึง Uptime: สอบถามฝ่ายเครือข่าย/แอดมินว่าสวิตช์ตัวนี้ใช้ Community String อะไร และอนุญาตให้ IP เครื่องนี้ดึงข้อมูลหรือไม่'
      ]
    };
  }

  // 2. ICMP PING Failure
  if (checkType === 'PING') {
    return {
      severity: 'CRITICAL',
      title: `ไม่ได้รับสัญญาณตอบกลับจาก IP ${ip} (Ping Timeout / Unreachable)`,
      summary: logMsg || 'Ping Timeout / Destination Host Unreachable',
      causes: [
        'เครื่องคอมพิวเตอร์ของคุณอยู่คนละวง Subnet / VLAN กับอุปกรณ์ (โดยเฉพาะสวิตช์และ WiFi AP ของมหาวิทยาลัยที่มักอยู่ใน Management VLAN ซึ่ง WiFi ทั่วไปจะเข้าไม่ถึง)',
        'อุปกรณ์ปลายทางถูกตั้งค่า Firewall ปิดรับคำสั่ง ICMP Ping เพื่อความปลอดภัย (แม้เครื่องเปิดอยู่ก็จะไม่ตอบ Ping)',
        'อุปกรณ์ปิดอยู่, ไฟดับ, หรือสาย LAN/ไฟเลี้ยง PoE หลุด',
        'ระบุหมายเลข IP Address ไม่ถูกต้อง'
      ],
      recommendations: [
        'ทดสอบด้วยตนเอง: เปิด PowerShell แล้วลองพิมพ์ ping ' + ip + ' เพื่อดูว่าเครื่องของคุณตอบสนองไหม',
        'หากต่อ WiFi ทั่วไปอยู่: ลองต่อสาย LAN เข้าพอร์ตระบบเครือข่าย หรือเชื่อมต่อ VPN ของฝ่ายเทคโนโลยีสารสนเทศเพื่อเข้าสู่วงเครือข่ายภายใน',
        'หากสวิตช์บล็อก Ping: กด "แก้ไขอุปกรณ์" แล้วเปลี่ยนวิธีตรวจเป็น "PORT" แล้วใส่พอร์ตหน้าเว็บจัดการ เช่น 80 หรือ 443 หรือพอร์ต SSH 22'
      ]
    };
  }

  // 3. TCP Port Failure
  if (checkType === 'PORT') {
    const port = device.port || 80;
    return {
      severity: 'CRITICAL',
      title: `ไม่สามารถเชื่อมต่อ TCP พอร์ต ${port} ของ ${ip} ได้`,
      summary: logMsg || `Connection Refused / Timed Out on Port ${port}`,
      causes: [
        `พอร์ต ${port} บนอุปกรณ์ปลายทางไม่ได้เปิดให้บริการ หรือ Service ปิดอยู่`,
        'ถูกบล็อกโดย Network Firewall หรือ Access-list ระหว่างทาง',
        'หมายเลข IP Address หรือหมายเลขพอร์ตไม่ถูกต้อง'
      ],
      recommendations: [
        'ตรวจสอบหมายเลขพอร์ตที่เปิดใช้งานจริงของอุปกรณ์ (เช่น พอร์ต 80 หรือ 443 สำหรับหน้าเว็บจัดการ, พอร์ต 22 สำหรับ SSH)',
        'ลองเปลี่ยนวิธีตรวจสอบเป็น "PING" เพื่อทดสอบการเชื่อมต่อระดับพื้นฐานก่อน'
      ]
    };
  }

  // Default fallback
  return {
    severity: 'WARNING',
    title: `ตรวจพบความผิดปกติในการเชื่อมต่อไปยัง ${ip}`,
    summary: logMsg || 'สัญญาณขาดหาย ไม่สามารถเชื่อมต่อได้',
    causes: [
      'อุปกรณ์ไม่มีการตอบสนองตามวิธีตรวจจับที่กำหนด',
      'สัญญาณเครือข่ายขัดข้องชั่วคราว หรือค่า Latency สูงเกินกำหนด'
    ],
    recommendations: [
      'ตรวจสอบสถานะอุปกรณ์จริงว่าเปิดเครื่องและสายสัญญาณเชื่อมต่อแน่นหนาหรือไม่',
      'กดปุ่ม "Ping Now" เพื่อทดสอบการเชื่อมต่อใหม่อีกครั้ง'
    ]
  };
};
