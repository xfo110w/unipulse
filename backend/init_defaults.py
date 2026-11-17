from datetime import datetime, timezone
from sqlalchemy import text

def ensure_default_buildings(sync_conn):
    """
    Ensures Buildings 1 to 23 exist in the database.
    If the buildings table is empty, seeds Buildings 1 to 23.
    """
    count = sync_conn.execute(text("SELECT COUNT(*) FROM buildings")).scalar()
    if count == 0:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        for i in range(1, 24):
            code = str(i)
            name = f"อาคาร {i}"
            desc = f"อาคารเรียนและปฏิบัติการ {i} ประจำมหาวิทยาลัย"
            sync_conn.execute(
                text("INSERT INTO buildings (name, code, description, created_at) VALUES (:name, :code, :desc, :now)"),
                {"name": name, "code": code, "desc": desc, "now": now_str}
            )
