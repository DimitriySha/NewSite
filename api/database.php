<?php
function getDB() {
    $dbPath = __DIR__ . '/database.sqlite';
    
    if (!file_exists($dbPath)) {
        $db = new PDO('sqlite:' . $dbPath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $db->exec('CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT "user",
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        $db->exec('CREATE TABLE IF NOT EXISTS apartments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            price INTEGER NOT NULL,
            rating REAL DEFAULT 4.5,
            guests INTEGER DEFAULT 2,
            bedrooms INTEGER DEFAULT 1,
            bathrooms INTEGER DEFAULT 1,
            amenities TEXT,
            photos TEXT,
            description TEXT,
            popularity INTEGER DEFAULT 50,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        $db->exec('CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            apartment_id INTEGER NOT NULL,
            checkin DATE NOT NULL,
            checkout DATE NOT NULL,
            guests INTEGER NOT NULL,
            total_price INTEGER NOT NULL,
            status TEXT DEFAULT "pending",
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (apartment_id) REFERENCES apartments(id)
        )');
        
        $db->exec('INSERT INTO apartments (name, location, price, rating, guests, bedrooms, bathrooms, amenities, photos, description, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            'Modern Studio in CBD',
            'Central Business District, Astana',
            8500,
            4.8,
            2,
            1,
            1,
            json_encode(['WiFi', 'Kitchen', 'Air Conditioning', 'Parking']),
            json_encode(['https://via.placeholder.com/600x400?text=Apartment+1']),
            'Beautiful modern studio apartment in the heart of Astana CBD.',
            95
        ]);
        
        $db->exec('INSERT INTO apartments (name, location, price, rating, guests, bedrooms, bathrooms, amenities, photos, description, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            'Luxury 1-Bedroom near Expo',
            'Near EXPO 2017, Astana',
            12000,
            4.9,
            4,
            1,
            2,
            json_encode(['WiFi', 'Kitchen', 'Air Conditioning', 'Balcony', 'Gym Access']),
            json_encode(['https://via.placeholder.com/600x400?text=Apartment+3']),
            'Spacious luxury apartment with panoramic views.',
            88
        ]);
    }
    
    return $db;
}
?>