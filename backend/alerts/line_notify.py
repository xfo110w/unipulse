"""
Backward compatibility layer redirecting all alert calls to Telegram.
"""
from typing import Optional
from backend.alerts.telegram_notify import send_telegram_message, dispatch_device_alert

async def send_line_message(message: str, access_token: Optional[str] = None, target_id: Optional[str] = None) -> bool:
    """Redirects or no-op since Telegram is the designated notification channel."""
    return False

async def send_discord_webhook(message: str, webhook_url: Optional[str] = None) -> bool:
    """Redirects or no-op since Telegram is the designated notification channel."""
    return False
