#!/usr/bin/env node

/**
 * Database Utility Script
 * Use this to directly interact with the SQLite database
 * Run: node db.js <command>
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'SQLlite');
const dbPath = path.join(dbDir, 'SQLdatabase.db');

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const command = process.argv[2];

function printUsage() {
    console.log(`
📊 Database Utility

Commands:
  init              Create all tables and insert default data
  clear             Delete all data (keeps tables)
  reset             Drop and recreate all tables
  tables            List all tables
  describe <table>  Show table structure
  apartments        List all apartments
  bookings          List all bookings
  saved-data        List all key-value pairs
  set <key> <value> Save a key-value pair
  get <key>         Get value by key
  delete <key>      Delete a key-value pair
  shell             Open SQLite shell (requires sqlite3 CLI)

Examples:
  node db.js init
  node db.js apartments
  node db.js set welcome_message "Добро пожаловать!"
  node db.js get welcome_message
  node db.js tables
    `);
}

function init() {
    console.log('Creating tables...');

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

    // Insert default apartments if empty
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
        console.log(`✓ Inserted ${defaultApts.length} default apartments`);
    }

    console.log('✓ Database initialized successfully');
    console.log(`📁 Location: ${dbPath}`);
}

function clearData() {
    console.log('Clearing all data...');
    db.exec('DELETE FROM bookings; DELETE FROM apartments; DELETE FROM users; DELETE FROM saved_data;');
    console.log('✓ All data cleared');
}

function reset() {
    console.log('Dropping and recreating tables...');
    db.exec('DROP TABLE IF EXISTS bookings; DROP TABLE IF EXISTS apartments; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS saved_data;');
    init();
    console.log('✓ Database reset complete');
}

function listTables() {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('Tables in database:');
    tables.forEach(t => console.log(`  - ${t.name}`));
}

function describeTable(tableName) {
    const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
    if (rows.length === 0) {
        console.log(`Table '${tableName}' not found`);
        return;
    }
    console.log(`Structure of table '${tableName}':`);
    rows.forEach(row => {
        console.log(`  ${row.name} (${row.type})${row.notnull ? ' NOT NULL' : ''}${row.dflt_value ? ` DEFAULT ${row.dflt_value}` : ''}${row.pk ? ' PRIMARY KEY' : ''}`);
    });
}

function listApartments() {
    const apartments = db.prepare('SELECT * FROM apartments ORDER BY id').all();
    console.log(`\n📋 Apartments (${apartments.length}):\n`);
    apartments.forEach(apt => {
        console.log(`  ID: ${apt.id}`);
        console.log(`  Title: ${apt.title}`);
        console.log(`  Address: ${apt.address}`);
        console.log(`  Price: ${apt.price} ₸`);
        console.log(`  Guests: ${apt.guests}`);
        console.log(`  Created: ${apt.created_at}\n`);
    });
}

function listBookings() {
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY id DESC LIMIT 20').all();
    console.log(`\n📅 Recent Bookings (${bookings.length}):\n`);
    bookings.forEach(b => {
        console.log(`  ID: ${b.id} | Apt: ${b.apartment_id} | Guest: ${b.guest_name}`);
        console.log(`  Dates: ${b.check_in_date} → ${b.check_out_date}`);
        console.log(`  Total: ${b.total_price} ₸ | Status: ${b.status}\n`);
    });
}

function listSavedData() {
    const data = db.prepare('SELECT * FROM saved_data ORDER BY timestamp DESC').all();
    console.log(`\n💾 Saved Data (${data.length}):\n`);
    data.forEach(item => {
        console.log(`  [${item.key}] = ${item.value}`);
        console.log(`    Saved: ${item.timestamp}\n`);
    });
}

function setKey(key, value) {
    const existing = db.prepare('SELECT id FROM saved_data WHERE key = ?').get(key);
    if (existing) {
        db.prepare('UPDATE saved_data SET value = ?, timestamp = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);
        console.log(`✓ Updated key '${key}'`);
    } else {
        db.prepare('INSERT INTO saved_data (key, value) VALUES (?, ?)').run(key, value);
        console.log(`✓ Saved key '${key}'`);
    }
}

function getKey(key) {
    const item = db.prepare('SELECT * FROM saved_data WHERE key = ?').get(key);
    if (item) {
        console.log(`Key: ${item.key}`);
        console.log(`Value: ${item.value}`);
        console.log(`Timestamp: ${item.timestamp}`);
    } else {
        console.log(`Key '${key}' not found`);
    }
}

function deleteKey(key) {
    const result = db.prepare('DELETE FROM saved_data WHERE key = ?').run(key);
    if (result.changes > 0) {
        console.log(`✓ Deleted key '${key}'`);
    } else {
        console.log(`Key '${key}' not found`);
    }
}

// Main switch
switch (command) {
    case 'init':
        init();
        break;
    case 'clear':
        clearData();
        break;
    case 'reset':
        reset();
        break;
    case 'tables':
        listTables();
        break;
    case 'describe':
        describeTable(process.argv[3]);
        break;
    case 'apartments':
        listApartments();
        break;
    case 'bookings':
        listBookings();
        break;
    case 'saved-data':
        listSavedData();
        break;
    case 'set':
        setKey(process.argv[3], process.argv[4]);
        break;
    case 'get':
        getKey(process.argv[3]);
        break;
    case 'delete':
        deleteKey(process.argv[3]);
        break;
    case 'shell':
        console.log('Opening SQLite shell. Type .exit to quit.');
        const { execSync } = require('child_process');
        execSync(`sqlite3 "${dbPath}"`);
        break;
    default:
        printUsage();
}

db.close();
