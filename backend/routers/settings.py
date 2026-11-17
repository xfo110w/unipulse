from fastapi import APIRouter, HTTPException
from backend.config import settings
from backend.alerts.telegram_notify import send_telegram_message

router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])

@router.get("/notifications")
async def get_notification_config():
    """
    Returns current Telegram notification configuration status loaded from .env.
    Tokens and IDs are configured via .env file only (not via web forms).
    """
    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    
    is_configured = bool(
        bot_token
        and chat_id
        and bot_token != "your_telegram_bot_token_here"
        and chat_id != "your_telegram_chat_id_here"
    )

    masked_token = ""
    if is_configured and bot_token:
        masked_token = (
            f"{bot_token[:6]}...{bot_token[-4:]}"
            if len(bot_token) > 10
            else "********"
        )

    return {
        "channel": "telegram",
        "telegram_configured": is_configured,
        "telegram_chat_id": chat_id if is_configured else "",
        "telegram_bot_token_masked": masked_token,
        "config_source": ".env file"
    }

@router.post("/test-notification")
async def test_notification():
    """
    Sends a test notification via Telegram Bot using TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from .env.
    """
    test_msg = (
        "🔔 <b>[ทดสอบการแจ้งเตือน / Notification Test]</b>\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        "ระบบ <b>Campus Equipment & Infrastructure Monitoring System</b> สามารถเชื่อมต่อและส่งข้อความแจ้งเตือนผ่าน Telegram ได้สำเร็จ!\n"
        "มหาวิทยาลัยของคุณพร้อมสำหรับการเฝ้าระวังอุปกรณ์แล้ว\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        "🎓 <i>Campus Equipment & Infrastructure Monitoring System</i>"
    )
    success, detail = await send_telegram_message(test_msg, parse_mode="HTML")
    if not success:
        raise HTTPException(
            status_code=400,
            detail=detail or "ไม่สามารถส่งข้อความ Telegram ได้ กรุณาตรวจสอบ TELEGRAM_BOT_TOKEN และ TELEGRAM_CHAT_ID ในไฟล์ .env"
        )
    return {"status": "ok", "message": "ส่งข้อความทดสอบไปยัง Telegram สำเร็จเรียบร้อยแล้ว!"}
