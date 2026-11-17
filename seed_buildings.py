import sqlite3
from datetime import datetime, timezone

def seed_buildings_1_to_23():
    conn = sqlite3.connect("unipulse.db")
    cur = conn.cursor()
    
    # Check existing buildings
    cur.execute("SELECT id, name, code FROM buildings")
    existing = {row[2]: row[0] for row in cur.fetchall()} # code -> id
    
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    added_buildings = 0

    for i in range(1, 24):
        code = str(i)
        name = f"อาคาร {i}"
        desc = f"อาคารเรียนและปฏิบัติการ {i} ประจำมหาวิทยาลัย"
        
        if code not in existing:
            cur.execute(
                "INSERT INTO buildings (name, code, description, created_at) VALUES (?, ?, ?, ?)",
                (name, code, desc, now_str)
            )
            added_buildings += 1

    # Clean any remaining rooms
    cur.execute("UPDATE devices SET room_id = NULL")
    cur.execute("DELETE FROM rooms")
    conn.commit()
    
    cur.execute("SELECT COUNT(*) FROM buildings")
    total_b = cur.fetchone()[0]
    
    print(f"Success! Added {added_buildings} buildings. Total buildings: {total_b}. All rooms removed.")
    conn.close()

if __name__ == "__main__":
    seed_buildings_1_to_23()
