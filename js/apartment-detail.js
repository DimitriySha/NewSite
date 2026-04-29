// Apartment detail page logic
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const apartmentId = urlParams.get('id');

    if (!apartmentId) {
        showError('Не указан ID квартиры. Пожалуйста, выберите квартиру из каталога.');
        return;
    }

    await loadApartment(apartmentId);
});

function showError(message) {
    const container = document.getElementById('details-container');
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h2>Ошибка</h2>
            <p>${message}</p>
            <a href="../index.html" class="btn btn-primary">Вернуться на главную</a>
        </div>
    `;
}

async function loadApartment(id) {
    const container = document.getElementById('details-container');

    try {
        container.innerHTML = `
            <div class="loading" style="min-height: 400px;">
                <div>Загрузка данных...</div>
            </div>
        `;

        const response = await api.getApartment(id);
        const apartment = response.data;

        if (!apartment) {
            showError('Квартира не найдена. Возможно, она была удалена.');
            return;
        }

        renderApartmentDetails(apartment);
    } catch (error) {
        console.error('Error loading apartment:', error);
        showError('Не удалось загрузить информацию о квартире. Проверьте соединение с интернетом и попробуйте снова.');
    }
}

function renderApartmentDetails(apartment) {
    const container = document.getElementById('details-container');
    const checkInDate = new Date();
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    container.innerHTML = `
        <img src="${apartment.image || 'https://via.placeholder.com/600x400?text=Нет+фото'}"
             class="details-img" alt="${apartment.title}"
             onerror="this.src='https://via.placeholder.com/600x400?text=Фото+не+доступно'">
        <div class="details-info">
            <h1>${apartment.title}</h1>
            <p class="card-address">📍 ${apartment.address}</p>

            ${apartment.description ? `<p class="description">${apartment.description}</p>` : ''}

            <div class="details-stats">
                <div class="stat">
                    <span class="stat-label">Вместимость</span>
                    <span class="stat-value">👥 ${apartment.guests} гост.</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Цена за сутки</span>
                    <span class="stat-value price">${apartment.price.toLocaleString()} ₸</span>
                </div>
            </div>

            <div class="booking-form">
                <h3>Забронировать</h3>
                <form id="booking-form" onsubmit="handleBooking(event, ${apartment.id}, ${apartment.price})">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Дата заезда</label>
                            <input type="date" name="check_in" min="${formatDate(new Date())}" required>
                        </div>
                        <div class="form-group">
                            <label>Дата выезда</label>
                            <input type="date" name="check_out" min="${formatDate(checkOutDate)}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ваше имя</label>
                        <input type="text" name="guest_name" placeholder="ФИО" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон</label>
                        <input type="tel" name="guest_phone" placeholder="+7 (xxx) xxx-xx-xx" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Оформить бронь</button>
                </form>
                <div id="booking-result"></div>
            </div>

            <div class="actions">
                <a href="../index.html" class="btn btn-outline">← Назад к списку</a>
            </div>
        </div>
    </div>
}

async function handleBooking(event, apartmentId, pricePerNight) {
    event.preventDefault();
    const form = event.target;
    const resultDiv = document.getElementById('booking-result');

    const formData = new FormData(form);
    const checkIn = new Date(formData.get('check_in'));
    const checkOut = new Date(formData.get('check_out'));

    // Validate dates
    if (checkOut <= checkIn) {
        resultDiv.innerHTML = '<div class="error-message">Дата выезда должна быть позже даты заезда</div>';
        return;
    }

    // Calculate nights and total price
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
        resultDiv.innerHTML = '<div class="error-message">Неверные даты</div>';
        return;
    }

    const totalPrice = pricePerNight * nights;

    const booking = {
        apartment_id: apartmentId,
        check_in_date: formData.get('check_in'),
        check_out_date: formData.get('check_out'),
        guest_name: formData.get('guest_name'),
        guest_phone: formData.get('guest_phone'),
        total_price: totalPrice,
    };

    try {
        resultDiv.innerHTML = '<div class="loading">Обработка бронирования...</div>';
        const response = await api.createBooking(booking);

        resultDiv.innerHTML = `
            <div class="success-message">
                <strong>✅ Бронь подтверждена!</strong>
                <div style="margin-top: 0.5rem; line-height: 1.6;">
                    Номер брони: <strong>#${response.data.booking_id}</strong><br>
                    Сумма: ${totalPrice.toLocaleString()} ₸ (${nights} суток)<br>
                    <small>На ваши номера телефона придет подтверждение</small>
                </div>
            </div>
        `;

        // Reset form
        form.reset();
        // Set default dates again
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        form.check_in.value = formatDate(new Date());
        form.check_out.value = formatDate(tomorrow);

    } catch (error) {
        console.error('Booking error:', error);
        resultDiv.innerHTML = `
            <div class="error-message">
                <strong>❌ Ошибка бронирования</strong><br>
                ${error.message || 'Попробуйте позже или свяжитесь с нами'}
            </div>
        `;
    }
}

function showError(message) {
    const container = document.getElementById('details-container');
    container.innerHTML = `
        <div class="error-state">
            <h2>${message}</h2>
            <a href="../index.html" class="btn">Вернуться на главную</a>
        </div>
    `;
}
