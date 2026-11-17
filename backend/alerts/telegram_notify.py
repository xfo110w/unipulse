import html
import logging
from typing import Optional, Tuple
import httpx
from backend.config import settings

logger = logging.getLogger("unipulse.alerts")

async def send_telegram_message(
    message: str,
    bot_token: Optional[str] = None,
    chat_id: Optional[str] = None,
    parse_mode: Optional[str] = "HTML"
) -> Tuple[bool, str]:
    """
    Sends message via Telegram Bot API using token and chat_id configured in .env.
    Returns: (success: bool, detail_message: str)
    """
    token = (bot_token or settings.TELEGRAM_BOT_TOKEN or "").strip()
    chat = (chat_id or settings.TELEGRAM_CHAT_ID or "").strip()

    # Skip if token is missing or placeholder default
    if not token or token == "your_telegram_bot_token_here":
        return False, "TELEGRAM_BOT_TOKEN not configured"

    if not chat or chat == "your_telegram_chat_id_here":
        return False, "TELEGRAM_CHAT_ID not configured"

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat,
        "text": message,
    }
    if parse_mode:
        payload["parse_mode"] = parse_mode

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                logger.info("Successfully sent Telegram alert message.")
                return True, "ส่งข้อความ Telegram สำเร็จแล้ว"
            else:
                try:
                    resp_json = resp.json()
                    err_desc = resp_json.get("description", resp.text)
                except Exception:
                    err_desc = resp.text
                err_msg = f"Telegram API Error ({resp.status_code}): {err_desc}"
                logger.error(err_msg)
                return False, err_msg
    except Exception as e:
        err_msg = f"เกิดข้อผิดพลาดในการเชื่อมต่อ Telegram: {str(e)}"
        logger.error(err_msg)
        return False, err_msg


async def dispatch_device_alert(
    event_type: str, # "OFFLINE" or "RECOVERED" or "WARNING"
    device_name: str,
    ip_address: str,
    location_str: str,
    category: str,
    reason: str,
    incident_id: Optional[int] = None
) -> None:
    """
    Constructs a structured alert notification and broadcasts exclusively to Telegram.
    """
    if event_type == "OFFLINE":
        icon = "🔴 <b>[อุปกรณ์ขัดข้อง / OFFLINE]</b>"
        status_text = "ไม่สามารถเชื่อมต่อได้ (Unreachable)"
    elif event_type == "RECOVERED":
        icon = "🟢 <b>[อุปกรณ์กลับมาออนไลน์ / RECOVERED]</b>"
        status_text = "กลับมาทำงานตามปกติแล้ว (Online)"
    else:
        icon = "🟡 <b>[แจ้งเตือนสถานะ / WARNING]</b>"
        status_text = "พบความผิดปกติหรือความล่าช้าสูง"

    safe_device = html.escape(str(device_name))
    safe_cat = html.escape(str(category))
    safe_loc = html.escape(str(location_str))
    safe_ip = html.escape(str(ip_address))
    safe_status = html.escape(str(status_text))
    safe_reason = html.escape(str(reason))

    msg_lines = [
        f"{icon}",
        "━━━━━━━━━━━━━━━━━━━━",
        f"📌 <b>อุปกรณ์:</b> {safe_device} ({safe_cat})",
        f"📍 <b>พิกัด:</b> {safe_loc}",
        f"🌐 <b>IP/Host:</b> <code>{safe_ip}</code>",
        f"⚡ <b>สถานะ:</b> {safe_status}",
        f"📝 <b>รายละเอียด:</b> {safe_reason}",
    ]
    if incident_id:
        msg_lines.append(f"🎫 <b>Incident ID:</b> #{incident_id}")
    msg_lines.append("━━━━━━━━━━━━━━━━━━━━")
    msg_lines.append("🎓 <i>Campus Equipment & Infrastructure Monitoring System</i>")

    full_message = "\n".join(msg_lines)
    await send_telegram_message(full_message, parse_mode="HTML")
