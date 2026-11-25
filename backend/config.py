import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / ".env"
example_env = BASE_DIR / ".env.example"

# โหลด .env เป็นหลัก หากไม่มีให้ fallback ไปหา .env.example เผื่อกรณีเผลอแก้ที่ไฟล์ตัวอย่าง
if env_file.exists():
    load_dotenv(env_file, override=True)
elif example_env.exists():
    load_dotenv(example_env, override=True)

class Settings:
    PROJECT_NAME: str = "Campus Equipment & Infrastructure Monitoring System"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "University Equipment & IT Infrastructure Health Monitoring System"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./unipulse.db")
    
    # Scheduler defaults
    DEFAULT_CHECK_INTERVAL: int = int(os.getenv("DEFAULT_CHECK_INTERVAL", "30")) # seconds
    ALERT_CONSECUTIVE_FAILURES: int = int(os.getenv("ALERT_CONSECUTIVE_FAILURES", "2"))
    
    # Timeouts
    PING_TIMEOUT: float = float(os.getenv("PING_TIMEOUT", "1.5"))
    PORT_TIMEOUT: float = float(os.getenv("PORT_TIMEOUT", "1.5"))
    HTTP_TIMEOUT: float = float(os.getenv("HTTP_TIMEOUT", "2.5"))
    
    # Security & IP Validation (SSRF Protection)
    ALLOWED_SUBNETS: str = os.getenv(
        "ALLOWED_SUBNETS",
        "10.153.0.0/16,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
    )
    ALLOW_SIMULATION_MOCK: bool = os.getenv("ALLOW_SIMULATION_MOCK", "true").lower() in ("true", "1", "yes")
    
    # Telegram Notification Settings (Configured via .env)
    @property
    def TELEGRAM_BOT_TOKEN(self) -> str:
        if env_file.exists():
            load_dotenv(env_file, override=True)
        return os.getenv("TELEGRAM_BOT_TOKEN", "").strip()

    @property
    def TELEGRAM_CHAT_ID(self) -> str:
        if env_file.exists():
            load_dotenv(env_file, override=True)
        return os.getenv("TELEGRAM_CHAT_ID", "").strip()

    # BRU SSO Login Configuration (Configured via .env)
    BRU_SSO_LOGIN_URL: str = os.getenv("BRU_SSO_LOGIN_URL", "https://sso.bru.ac.th/api/login")

    @property
    def ALLOW_STUDENT_LOGIN(self) -> bool:
        if env_file.exists():
            load_dotenv(env_file, override=True)
        return os.getenv("ALLOW_STUDENT_LOGIN", "false").lower() in ("true", "1", "yes")

    @property
    def ALLOWED_STUDENT_WHITELIST(self) -> str:
        if env_file.exists():
            load_dotenv(env_file, override=True)
        return os.getenv("ALLOWED_STUDENT_WHITELIST", "660112230046").strip()

    @property
    def BRU_SSO_API_KEY(self) -> str:
        if env_file.exists():
            load_dotenv(env_file, override=True)
        raw_key = os.getenv("BRU_SSO_API_KEY", "").strip()
        return raw_key.strip("'\"")

settings = Settings()
