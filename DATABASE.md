# 🗄️ Database Schema Reference

## Tables Overview

### 1. apartments
Main table for rental properties.

```sql
CREATE TABLE apartments (
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
```

**Indexes:** `idx_apartments_price`, `idx_apartments_guests`

---

### 2. users
User accounts for the system.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. bookings
Reservation records linking users/apartments with dates.

```sql
CREATE TABLE bookings (
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
```

**Indexes:** `idx_bookings_apartment`, `idx_bookings_dates`

---

### 4. saved_data
Flexible key-value storage for configuration, settings, or any arbitrary data.

```sql
CREATE TABLE saved_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:** `idx_saved_data_key`

**Use cases:**
- Site settings (theme, currency, contact info)
- Feature flags
- User preferences
- API keys / webhooks (encrypted in production)
- Any flexible data that doesn't warrant its own table

---

## Common Operations

### Get all apartments with filters
```sql
SELECT * FROM apartments
WHERE price >= 10000
  AND guests >= 2
ORDER BY created_at DESC;
```

### Get apartment with available dates
```sql
SELECT a.*,
       b.check_in_date, b.check_out_date
FROM apartments a
LEFT JOIN bookings b ON a.id = b.apartment_id
WHERE b.status != 'cancelled';
```

### Get user's bookings
```sql
SELECT b.*, a.title, a.address
FROM bookings b
JOIN apartments a ON b.apartment_id = a.id
WHERE b.user_id = ?
ORDER BY b.check_in_date DESC;
```

### Get a saved setting
```sql
SELECT value FROM saved_data WHERE key = 'site_theme';
```

### Save/update a setting (UPSERT)
```sql
INSERT INTO saved_data (key, value)
VALUES ('welcome_message', 'Добро пожаловать!')
ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    timestamp = CURRENT_TIMESTAMP;
```

---

## Database File Location

```
SQLlite/SQLdatabase.db
```

The database file is automatically created when the server first starts.

---

## Direct SQLite Access

```bash
# Using the provided utility
npm run db shell

# Using sqlite3 directly
sqlite3 SQLlite/SQLdatabase.db

# Inside SQLite shell
.tables               -- List all tables
.schema apartments    -- Show CREATE statement
SELECT * FROM apartments;
.exit
```

---

## Backups

To backup the database:

```bash
# Copy the file
cp SQLlite/SQLdatabase.db SQLlite/SQLdatabase.db.backup

# Or use SQLite dump
sqlite3 SQLlite/SQLdatabase.db ".backup backup.db"
```

---

## Notes

- All timestamps are stored in UTC by default (SQLite doesn't store timezone)
- `ON DELETE CASCADE` on bookings means deleting an apartment removes its bookings
- `ON DELETE SET NULL` on user_id allows keeping booking history even if user is deleted
- The `saved_data.key` column has a UNIQUE constraint for O(1) lookups
- Indexes automatically improve query performance for filtered/sorted columns
