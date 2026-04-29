// Quick script to add saved_data table to existing database
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'SQLlite', 'SQLdatabase.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`Opening database: ${dbPath}`);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Create saved_data table
db.exec(`
    CREATE TABLE IF NOT EXISTS saved_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_saved_data_key ON saved_data(key);
`);

console.log('✓ Table saved_data created successfully');

// Verify
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\nTables in database:');
tables.forEach(t => console.log(`  - ${t.name}`));

// Show saved_data structure if it exists
const saved = db.prepare("SELECT * FROM saved_data LIMIT 5").all();
console.log(`\nSaved data records: ${saved.length}`);

db.close();
console.log('✓ Done');
