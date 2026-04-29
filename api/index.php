<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = explode('/', trim($path, '/'));

if ($segments[0] !== 'api') {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

$table = $segments[1] ?? null;

try {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            if ($table === 'apartments') {
                $stmt = $db->query('SELECT * FROM apartments');
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($table === 'bookings') {
                $stmt = $db->query('SELECT * FROM bookings');
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($table === 'users') {
                $stmt = $db->query('SELECT id, name, email, phone, role FROM users');
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } else {
                echo json_encode(['error' => 'Unknown table']);
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if ($table === 'users') {
                $stmt = $db->prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)');
                $stmt->execute([$input['name'], $input['email'], $input['phone'], password_hash($input['password'], PASSWORD_DEFAULT), 'user']);
                echo json_encode(['id' => $db->lastInsertId(), 'message' => 'User created']);
            } elseif ($table === 'apartments') {
                $stmt = $db->prepare('INSERT INTO apartments (name, location, price, rating, guests, bedrooms, bathrooms, amenities, photos, description, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $input['name'], $input['location'], $input['price'], $input['rating'],
                    $input['guests'], $input['bedrooms'], $input['bathrooms'],
                    json_encode($input['amenities']), json_encode($input['photos']),
                    $input['description'], $input['popularity']
                ]);
                echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Apartment created']);
            } elseif ($table === 'bookings') {
                $stmt = $db->prepare('INSERT INTO bookings (user_id, apartment_id, checkin, checkout, guests, total_price) VALUES (?, ?, ?, ?, ?, ?)');
                $stmt->execute([$input['user_id'], $input['apartment_id'], $input['checkin'], $input['checkout'], $input['guests'], $input['total_price']]);
                echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Booking created']);
            }
            break;
            
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $segments[2] ?? null;
            
            if ($table === 'apartments' && $id) {
                $stmt = $db->prepare('UPDATE apartments SET name=?, location=?, price=?, rating=?, guests=?, bedrooms=?, bathrooms=?, amenities=?, photos=?, description=?, popularity=? WHERE id=?');
                $stmt->execute([$input['name'], $input['location'], $input['price'], $input['rating'], $input['guests'], $input['bedrooms'], $input['bathrooms'], json_encode($input['amenities']), json_encode($input['photos']), $input['description'], $input['popularity'], $id]);
                echo json_encode(['message' => 'Apartment updated']);
            }
            break;
            
        case 'DELETE':
            $id = $segments[2] ?? null;
            if ($id && $table === 'apartments') {
                $stmt = $db->prepare('DELETE FROM apartments WHERE id=?');
                $stmt->execute([$id]);
                echo json_encode(['message' => 'Apartment deleted']);
            }
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}