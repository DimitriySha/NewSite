import sqlite3
import os

# Ensure the SQLite directory exists
os.makedirs('SQLlite', exist_ok=True)

# Connect to the SQLite database (creates it if it doesn't exist)
conn = sqlite3.connect('SQLlite/SQLdatabase.db')
cursor = conn.cursor()

# Create a table to store data (adjust columns as needed; this is a generic example)
cursor.execute('''
    CREATE TABLE IF NOT EXISTS saved_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
''')

# Insert some sample data
data_to_insert = [
    ('site_name', 'Уют'),
    ('default_currency', '₸'),
    ('contact_phone', '+7 (700) 123-45-67'),
    ('welcome_message', 'Добро пожаловать в наш сервис!')
]
cursor.executemany('INSERT OR REPLACE INTO saved_data (key, value) VALUES (?, ?)', data_to_insert)

# Commit the changes
conn.commit()

# Verify tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()
print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Verify saved_data
cursor.execute('SELECT id, key, value FROM saved_data')
rows = cursor.fetchall()
print(f"\nSaved data records: {len(rows)}")
for row in rows:
    print(f"  ID:{row[0]} | Key: {row[1]} | Value: {row[2]}")

# Close the connection
conn.close()
print("\n✓ Table 'saved_data' created successfully!")
