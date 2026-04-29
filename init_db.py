import sqlite3

conn = sqlite3.connect('SQLlite/SQLdatabase.db')
cursor = conn.cursor()

print("Creating all tables...")

# Create all tables
cursor.executescript('''
    CREATE TABLE IF NOT EXISTS apartments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        address TEXT NOT NULL,
        price INTEGER NOT NULL,
        guests INTEGER NOT NULL DEFAULT 1,
        image TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        apartment_id INTEGER NOT NULL,
        user_id INTEGER,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        guest_name TEXT NOT NULL,
        guest_phone TEXT NOT NULL,
        total_price INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS saved_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_apartments_price ON apartments(price);
    CREATE INDEX IF NOT EXISTS idx_apartments_guests ON apartments(guests);
    CREATE INDEX IF NOT EXISTS idx_bookings_apartment ON bookings(apartment_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
    CREATE INDEX IF NOT EXISTS idx_saved_data_key ON saved_data(key);
''')

# Insert sample apartments if empty
cursor.execute("SELECT COUNT(*) FROM apartments")
if cursor.fetchone()[0] == 0:
    print("Inserting sample apartments...")
    sample_apartments = [
        ("Студия в ЖК Хайвилл", "г. Астана, пр. Р. Кошкарбаева, 10", 15000, 2,
         "https://images.unsplash.com/photo-1502672260266-1c1e52f15909?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
         "Уютная студия в современном жилом комплексе. Полностью меблирована, есть вся необходимая техника."),
        ("Двухкомнатная на Левом берегу", "г. Астана, ул. Сыганак, 18", 22000, 4,
         "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
         "Просторная двухкомнатная квартира с видом на реку. Идеально для семьи или компании друзей."),
    ]
    cursor.executemany('''
        INSERT INTO apartments (title, address, price, guests, image, description)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', sample_apartments)
    print(f"  Inserted {len(sample_apartments)} apartments")

# Insert sample saved_data if empty
cursor.execute("SELECT COUNT(*) FROM saved_data")
if cursor.fetchone()[0] == 0:
    print("Inserting sample settings...")
    settings = [
        ('site_name', 'Уют'),
        ('default_currency', '₸'),
        ('contact_phone', '+7 (700) 123-45-67'),
        ('welcome_message', 'Добро пожаловать!'),
    ]
    cursor.executemany('INSERT INTO saved_data (key, value) VALUES (?, ?)', settings)
    print(f"  Inserted {len(settings)} settings")

conn.commit()

# Verify
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [row[0] for row in cursor.fetchall()]
print(f"\nDatabase ready! Tables: {', '.join(tables)}")

for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"  {table}: {count} records")

conn.close()
print("\nAll done! Database is fully initialized.")
