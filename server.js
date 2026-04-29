const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Ensure SQLite directory exists
const dbDir = path.join(__dirname, 'SQLlite');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const dbPath = path.join(dbDir, 'SQLdatabase.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
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
`);

// Insert default apartments if table is empty
const count = db.prepare('SELECT COUNT(*) as cnt FROM apartments').get();
if (count.cnt === 0) {
    const insert = db.prepare(`
        INSERT INTO apartments (title, address, price, guests, image, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const defaultApts = [
        {
            title: "Студия в ЖК Хайвилл",
            address: "г. Астана, пр. Р. Кошкарбаева, 10",
            price: 15000,
            guests: 2,
            image: "https://images.unsplash.com/photo-1502672260266-1c1e52f15909?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            description: "Уютная студия в современном жилом комплексе. Полностью меблирована, есть вся необходимая техника."
        },
        {
            title: "Двухкомнатная на Левом берегу",
            address: "г. Астана, ул. Сыганак, 18",
            price: 22000,
            guests: 4,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            description: "Просторная двухкомнатная квартира с видом на реку. Идеально для семьи или компании друзей."
        }
    ];

    for (const apt of defaultApts) {
        insert.run(apt.title, apt.address, apt.price, apt.guests, apt.image, apt.description);
    }
    console.log('✓ Default apartments inserted');
}

// API Routes

// GET all apartments with optional filters
app.get('/api/apartments', (req, res) => {
    try {
        const { minPrice, maxPrice, guests, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM apartments WHERE 1=1';
        const params = [];

        if (minPrice) {
            query += ' AND price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(maxPrice);
        }
        if (guests) {
            query += ' AND guests >= ?';
            params.push(guests);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const apartments = db.prepare(query).all(...params);
        res.json({ success: true, data: apartments });
    } catch (err) {
        console.error('Error fetching apartments:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single apartment by ID
app.get('/api/apartments/:id', (req, res) => {
    try {
        const apartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(req.params.id);
        if (!apartment) {
            return res.status(404).json({ success: false, error: 'Apartment not found' });
        }
        res.json({ success: true, data: apartment });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create new apartment
app.post('/api/apartments', (req, res) => {
    try {
        const { title, address, price, guests, image, description } = req.body;

        if (!title || !address || !price) {
            return res.status(400).json({ success: false, error: 'Title, address, and price are required' });
        }

        const result = db.prepare(`
            INSERT INTO apartments (title, address, price, guests, image, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(title, address, price, guests || 1, image || '', description || '');

        const newApartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(result.lastInsertRowid);
        res.json({ success: true, data: newApartment });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT update apartment
app.put('/api/apartments/:id', (req, res) => {
    try {
        const { title, address, price, guests, image, description } = req.body;
        const id = req.params.id;

        const existing = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Apartment not found' });
        }

        db.prepare(`
            UPDATE apartments
            SET title = ?, address = ?, price = ?, guests = ?, image = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            title || existing.title,
            address || existing.address,
            price || existing.price,
            guests || existing.guests,
            image !== undefined ? image : existing.image,
            description !== undefined ? description : existing.description,
            id
        );

        const updated = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE apartment
app.delete('/api/apartments/:id', (req, res) => {
    try {
        const id = req.params.id;
        const existing = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Apartment not found' });
        }

        db.prepare('DELETE FROM apartments WHERE id = ?').run(id);
        res.json({ success: true, message: 'Apartment deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Booking endpoints
app.post('/api/bookings', (req, res) => {
    try {
        const { apartment_id, check_in_date, check_out_date, guest_name, guest_phone, total_price, user_id } = req.body;

        if (!apartment_id || !check_in_date || !check_out_date || !guest_name || !guest_phone || !total_price) {
            return res.status(400).json({ success: false, error: 'All booking fields are required' });
        }

        const result = db.prepare(`
            INSERT INTO bookings (apartment_id, check_in_date, check_out_date, guest_name, guest_phone, total_price, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(apartment_id, check_in_date, check_out_date, guest_name, guest_phone, total_price, user_id || null);

        res.json({ success: true, data: { booking_id: result.lastInsertRowid } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/bookings/:apartment_id', (req, res) => {
    try {
        const bookings = db.prepare(`
            SELECT * FROM bookings
            WHERE apartment_id = ?
            AND status != 'cancelled'
            ORDER BY check_in_date DESC
        `).all(req.params.apartment_id);
        res.json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Saved Data (Key-Value store) endpoints
app.get('/api/saved-data', (req, res) => {
    try {
        const { key } = req.query;
        let query = 'SELECT * FROM saved_data';
        const params = [];

        if (key) {
            query += ' WHERE key = ?';
            params.push(key);
        }

        query += ' ORDER BY timestamp DESC';
        const data = db.prepare(query).all(...params);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/saved-data/:key', (req, res) => {
    try {
        const item = db.prepare('SELECT * FROM saved_data WHERE key = ?').get(req.params.key);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Key not found' });
        }
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/saved-data', (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            return res.status(400).json({ success: false, error: 'Key is required' });
        }

        // UPSERT: insert or update
        const existing = db.prepare('SELECT id FROM saved_data WHERE key = ?').get(key);

        if (existing) {
            db.prepare('UPDATE saved_data SET value = ?, timestamp = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);
            const updated = db.prepare('SELECT * FROM saved_data WHERE key = ?').get(key);
            res.json({ success: true, data: updated, action: 'updated' });
        } else {
            const result = db.prepare('INSERT INTO saved_data (key, value) VALUES (?, ?)').run(key, value);
            const inserted = db.prepare('SELECT * FROM saved_data WHERE id = ?').get(result.lastInsertRowid);
            res.json({ success: true, data: inserted, action: 'created' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/saved-data/:key', (req, res) => {
    try {
        const key = req.params.key;
        const { value } = req.body;

        const existing = db.prepare('SELECT * FROM saved_data WHERE key = ?').get(key);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Key not found' });
        }

        db.prepare('UPDATE saved_data SET value = ?, timestamp = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);
        const updated = db.prepare('SELECT * FROM saved_data WHERE key = ?').get(key);
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/saved-data/:key', (req, res) => {
    try {
        const key = req.params.key;
        const existing = db.prepare('SELECT * FROM saved_data WHERE key = ?').get(key);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Key not found' });
        }

        db.prepare('DELETE FROM saved_data WHERE key = ?').run(key);
        res.json({ success: true, message: 'Data deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api/`);
    console.log(`✓ SQLite database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close();
    process.exit(0);
});
