import logging
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
import httpx

from backend.config import settings
from backend.schemas import LoginRequest, LoginResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    username = (payload.username or "").strip()
    password = (payload.password or "").strip()

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
        )

    api_key = settings.BRU_SSO_API_KEY

    # If API Key is not configured yet in .env, allow prototype login
    if not api_key:
        return LoginResponse(
            success=True,
            message="เข้าสู่ระบบโหมดทดสอบ (ยังไม่ได้ระบุ BRU_SSO_API_KEY ใน .env)",
            username=username,
            data={"role": "USER", "mode": "PROTOTYPE"}
        )

    # Prepare Headers & Request Body for BRU SSO
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    }
    body = {
        "username": username,
        "password": password,
    }

    masked_key = f"{api_key[:3]}...{api_key[-3:]}" if len(api_key) > 6 else "***"
    print(f"[AUTH] Sending SSO login for '{username}' to {settings.BRU_SSO_LOGIN_URL} (API Key: {masked_key}, length: {len(api_key)})")

    try:
        async with httpx.AsyncClient(timeout=15.0, verify=False) as client:
            resp = await client.post(
                settings.BRU_SSO_LOGIN_URL,
                headers=headers,
                json=body
            )
        print(f"[AUTH] BRU SSO response status for '{username}': {resp.status_code}")
    except httpx.ConnectError as e:
        print(f"[AUTH] Connection Error to BRU SSO: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="ไม่สามารถเชื่อมต่อไปยังเซิร์ฟเวอร์ BRU SSO ได้ (Connection Error หรือเซิร์ฟเวอร์ปลายทางไม่ตอบสนอง)"
        )
    except httpx.TimeoutException:
        print(f"[AUTH] Timeout waiting for BRU SSO")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="หมดเวลารอการตอบกลับจากเซิร์ฟเวอร์ BRU SSO (Request Timeout)"
        )
    except Exception as e:
        logger.error(f"SSO Login Exception: {e}")
        print(f"[AUTH] SSO Exception: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในการเชื่อมต่อ SSO: {str(e)}"
        )

    # Try parsing response JSON
    try:
        data = resp.json()
    except Exception:
        data = {"raw": resp.text}

    # Successful HTTP Status (200 / 201)
    if resp.status_code in (200, 201):
        if isinstance(data, dict):
            # Check if API returned an error flag inside 200 OK
            if data.get("ok") is False or data.get("status") is False or data.get("success") is False:
                err_msg = data.get("message") or data.get("error") or "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=err_msg)

            user_obj = data.get("user") or data.get("data") or {}
            auth_info = data.get("authorization") or {}

            # 🛡️ Role-Based Access Control: Allow Personnel/Staff & Whitelisted Tester, Block Other Students
            has_staff_id = bool(
                user_obj.get("staff_id") or user_obj.get("staffId")
                or data.get("staff_id") or data.get("staffId")
            )
            has_department = bool(
                user_obj.get("departmentid") or user_obj.get("departmentId") or user_obj.get("masterdepartmentid")
                or data.get("departmentid") or data.get("departmentId") or data.get("masterdepartmentid")
                or auth_info.get("departmentIds") or auth_info.get("facultyIds")
            )
            data_role = str(auth_info.get("dataRole") or "").lower()
            is_staff_role = data_role in ("staff", "admin", "teacher", "lecturer", "employee")
            is_staff_member = has_staff_id or has_department or is_staff_role

            # Whitelisted accounts (your test account '660112230046')
            whitelist = {u.strip() for u in settings.ALLOWED_STUDENT_WHITELIST.split(",") if u.strip()} | {"660112230046"}
            is_whitelisted = username in whitelist

            # If not allowed by setting, not whitelisted, and not staff member -> BLOCK
            if not settings.ALLOW_STUDENT_LOGIN and not is_whitelisted and not is_staff_member:
                logger.warning(f"Student login attempt blocked: {username}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="ขออภัย ระบบนี้อนุญาตเฉพาะอาจารย์และเจ้าหน้าที่/บุคลากร มรภ.บุรีรัมย์ เท่านั้น (บัญชีนักศึกษาไม่ได้รับอนุญาตให้เข้าใช้งาน)"
                )

            # Extract token or display name if available
            token = data.get("token") or data.get("access_token") or (isinstance(user_obj, dict) and user_obj.get("token"))
            display_name = (
                user_obj.get("name") 
                or user_obj.get("fullname") 
                or user_obj.get("username") 
                or user_obj.get("userlogin")
                or username 
                if isinstance(user_obj, dict) else username
            )
        else:
            token = None
            display_name = username

        return LoginResponse(
            success=True,
            message="เข้าสู่ระบบสำเร็จ (BRU SSO)",
            username=str(display_name),
            token=str(token) if token else None,
            data=data if isinstance(data, dict) else {"response": str(data)}
        )

    # Unauthorized / Bad Request from SSO
    print(f"[AUTH] SSO Failed: {resp.status_code} - {resp.text[:200]}")
    if resp.status_code in (401, 400):
        err_msg = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
        if isinstance(data, dict):
            err_msg = data.get("message") or data.get("detail") or data.get("error") or err_msg
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=err_msg)

    if resp.status_code == 403:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API Key สำหรับเชื่อมต่อ SSO ไม่ถูกต้อง หรือไม่ได้รับสิทธิ์เข้าถึง (403 Forbidden)"
        )

    raise HTTPException(
        status_code=resp.status_code,
        detail=f"เซิร์ฟเวอร์ SSO ตอบกลับสถานะ {resp.status_code}: {resp.text[:150]}"
    )
