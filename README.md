# Уют - Агентство по аренде квартир

Современный веб-сайт для аренды квартир в Астане сSQLite базой данных и административной панелью.

## 🚀 Функциональность

- **Каталог квартир** с фильтрацией по гостям и цене
- **Детальная страница квартиры** с формой бронирования
- **Административная панель** для управления объектами (CRUD)
- **База данных SQLite** для хранения данных
- **Современный дизайн** с адаптивной версткой
- **API на Node.js/Express** для backend-логики

## 📁 Структура проекта

```
/
├── server.js           # Node.js сервер с API
├── package.json        # Зависимости проекта
├── index.html          # Главная страница
├── pages/
│   ├── apartment.html  # Страница квартиры
│   ├── admin.html      # Админ-панель
│   └── register.html   # Регистрация
├── css/
│   └── style.css       # Стили сайта
├── js/
│   ├── api.js          # API клиент
│   ├── app.js          # Логика главной страницы
│   ├── apartment-detail.js
│   ├── admin.js        # Админ-панель
│   └── auth.js         # Аутентификация
└── SQLlite/
    └── SQLdatabase.db   # Файл базы данных SQLite
```

## ⚙️ Установка и запуск

### 1. Требования
- **Node.js** (версия 14 или выше) - [скачать](https://nodejs.org/)
- **npm** (обычно устанавливается вместе с Node.js)

### 2. Установка зависимостей

Откройте терминал/командную строку в папке проекта и выполните:

```bash
npm install
```

### 3. Запуск сервера

```bash
npm start
```

или

```bash
node server.js
```

Сервер запустится по адресу: **http://localhost:3000**

## 📊 База данных

### Создаваемые таблицы:

1. **apartments** - объекты недвижимости
   - id, title, address, price, guests, image, description, timestamps

2. **users** - пользователи
   - id, full_name, email, phone, password_hash, created_at

3. **bookings** - бронирования
   - id, apartment_id, user_id, check_in_date, check_out_date, guest_name, guest_phone, total_price, status

### Начальные данные

При первом запуске в таблицу `apartments` автоматически добавляются 2 тестовые квартиры.

## 🔗 API Endpoints

### Apartments
- `GET    /api/apartments` - Получить все квартиры (с фильтрами)
- `GET    /api/apartments/:id` - Получить одну квартиру
- `POST   /api/apartments` - Создать квартиру
- `PUT    /api/apartments/:id` - Обновить квартиру
- `DELETE /api/apartments/:id` - Удалить квартиру

### Bookings
- `POST   /api/bookings` - Создать бронь
- `GET    /api/bookings/:apartment_id` - Бронирования квартиры

## 🎨 Дизайн

Сайт использует современный минималистичный дизайн с:
- Orange accent color (#e67e22)
- Clean typography (Inter font)
- Smooth animations
- Fully responsive layout
- Card-based apartment grid

## 📝 Пример использования

### Добавление новой квартиры через API:

```javascript
fetch('/api/apartments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: 'Новая квартира',
        address: 'г. Астана, ул. Новая, 1',
        price: 18000,
        guests: 3,
        image: 'https://example.com/photo.jpg',
        description: 'Уютная квартира'
    })
});
```

### Бронирование:

```javascript
fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        apartment_id: 1,
        check_in_date: '2024-12-01',
        check_out_date: '2024-12-05',
        guest_name: 'Иван Иванов',
        guest_phone: '+7 777 123 45 67',
        total_price: 60000
    })
});
```

## 🛠️ Технологии

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Fonts**: Google Fonts (Inter)

## 📄 Лицензия

MIT
