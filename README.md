# Uyut - Short-term Apartment Rentals in Astana

A complete web application for short-term apartment rentals in Astana, Kazakhstan.

## Project Structure

```
├── index.html          # Homepage
├── listings.html       # Apartment listings
├── apartment.html      # Apartment details
├── bookings.html       # User bookings
├── messages.html       # Messaging system
├── favorites.html      # User favorites
├── profile.html        # User profile
├── login.html          # Login page
├── register.html       # Registration page
├── admin.html          # Admin dashboard
├── css/
│   └── style.css       # Styles
├── js/
│   └── main.js         # JavaScript
├── api/
│   ├── index.php       # API endpoints
│   └── database.php    # Database setup
├── .htaccess           # URL routing
└── database.sqlite     # SQLite database
```

## Features

### Guest Mode
- Homepage with search form
- Apartment listings with filters (city, dates, guests)
- Sorting by price, popularity, rating
- Apartment detail view with photos and amenities
- Booking system
- User profile management
- Favorites list
- Messaging with admin

### Admin Mode
- Dashboard with analytics
- Apartment management (add, edit, delete)
- Booking management
- User management

## Setup

1. Install OpenServer or XAMPP
2. Place project in `www` directory
3. Start Apache and PHP
4. Database will be created automatically on first access

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: SQLite
- Deployment: GitHub Pages (frontend) / Any PHP hosting (backend)