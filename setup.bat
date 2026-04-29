@echo off
echo ========================================
echo   Уют - Установка зависимостей
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Node.js не найден!
    echo.
    echo Пожалуйста, установите Node.js:
    echo 1. Перейдите на https://nodejs.org/
    echo 2. Скачайте и установите LTS версию
    echo 3. Перезапустите командную строку
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js найден
node --version
echo.

REM Install dependencies
echo Установка зависимостей...
echo.
npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ОШИБКА] Не удалось установить зависимости
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Установка завершена!
echo ========================================
echo.
echo Для запуска сервера выполните:
echo   npm start
echo.
echo Или:
echo   node server.js
echo.
echo Сервер будет доступен по адресу: http://localhost:3000
echo.
pause
