# 🚀 Запуск проекта

## 1. Установка Node.js

**Важно:** Для работы проекта требуется Node.js 14+.

1. Скачайте Node.js с официального сайта: https://nodejs.org/
2. Выберите LTS-версию и установите
3. После установки перезапустите терминал/командную строку

Проверьте установку:
```bash
node --version
npm --version
```

## 2. Установка зависимостей

В папке проекта выполните:

```bash
npm install
```

или запустите `setup.bat` ( Windows)

## 3. Запуск сервера

```bash
npm start
```

Сервер запустится на:
- **Локально**: http://localhost:3000
- **Сети**: http://[ваш-IP]:3000

## 4. Доступные страницы

| Страница | URL | Описание |
|---------|-----|---------|
| Главная | http://localhost:3000 | Каталог квартир с фильтрами |
| Квартира | http://localhost:3000/pages/apartment.html?id=1 | Детали и бронирование |
| Админка | http://localhost:3000/pages/admin.html | Управление объектами |
| Регистрация | http://localhost:3000/pages/register.html | Создать аккаунт |

## 🔧 API Endpoints

```
GET    /api/apartments           # Все квартиры ( ?guests=2&maxPrice=20000 )
GET    /api/apartments/:id       # Одна квартира
POST   /api/apartments           # Добавить
PUT    /api/apartments/:id       # Обновить
DELETE /api/apartments/:id       # Удалить

POST   /api/bookings             # Создать бронь
GET    /api/bookings/:apartment_id  # Бронирования квартиры
```

## 🗄️ База данных

- Файл: `SQLlite/SQLdatabase.db`
- Автоматически создается при первом запуске
- При отсутствии записей добавляются 2 тестовые квартиры

### Структура таблиц:

**apartments**
```sql
id, title, address, price, guests, image, description, created_at, updated_at
```

**users**
```sql
id, full_name, email, phone, password_hash, created_at
```

**bookings**
```sql
id, apartment_id, user_id, check_in_date, check_out_date, guest_name, guest_phone, total_price, status, created_at
```

## 🎨 Изменения в дизайне

- Современная配色 scheme с orange акцентом
- Typography: Inter font
- Карточки квартир с hover-анимациями
- Адаптивный дизайн для мобильных
- Плавные переходы и тени
- Модальные окна с backdrop blur
- Уведомления (success/error)

## 📱 responsive breakpoints

- Desktop: >768px
- Tablet: 768px
- Mobile: <480px

## 🐛 Решение проблем

### "Cannot find module 'express'"
```bash
npm install
```

### Port 3000 already in use
```bash
# Используйте другой порт
PORT=3001 npm start
```
или измените в `server.js`:
```javascript
const PORT = 3001;
```

### Database locked
Убедитесь, что нет других процессов, использующих SQLite файл.

## 📦 Дополнительные возможности

- Интеграция с платежными системами (платно)
- Отправка email-уведомлений (платно)
- Мультиязычность (ru/kz/en)
- RSS-лента новых объектов
- API для мобильного приложения

## 📝 TODO (для доработки)

- Реализовать хеширование паролей (bcrypt)
- Добавить валидацию форм на backend
- Пагинация результатов
- Кэширование запросов
- Docker-контейнеризация
- Автоматическое резервное копирование БД

---

**Вопросы?** Создайте issue в репозитории.
