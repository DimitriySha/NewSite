import sqlite3

conn = sqlite3.connect('SQLlite/SQLdatabase.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()
print("=== ALL TABLES IN DATABASE ===")
for table in tables:
    print(f"  {table[0]}")

# Show schema for each table
print("\n=== TABLE SCHEMAS ===")
for table in tables:
    cursor.execute(f"PRAGMA table_info({table[0]})")
    cols = cursor.fetchall()
    print(f"\nTable: {table[0]}")
    for col in cols:
        print(f"  {col[1]}  {col[2]}{' NOT NULL' if col[3] else ''}{' PRIMARY KEY' if col[5] else ''}")

# Count records
print("\n=== RECORD COUNTS ===")
for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
    count = cursor.fetchone()[0]
    print(f"  {table[0]}: {count} records")

conn.close()
