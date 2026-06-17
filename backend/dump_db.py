import sqlite3
import os

db_paths = ["database/vastrasilai.db", "test_vastrasilai.db"]

for path in db_paths:
    if os.path.exists(path):
        print(f"\n=== Inspecting {path} ===")
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        
        # Get tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        print("Tables:", tables)
        
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            cols = [c[1] for c in cursor.fetchall()]
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            count = cursor.fetchone()[0]
            print(f"  Table '{table}': {count} rows. Columns: {cols}")
            
            if count > 0:
                cursor.execute(f"SELECT * FROM {table} LIMIT 3;")
                rows = cursor.fetchall()
                print(f"    Sample rows:")
                for r in rows:
                    print(f"      {r}")
        conn.close()
    else:
        print(f"Path not found: {path}")
