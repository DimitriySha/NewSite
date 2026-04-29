// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    loadApartments();
});

// Load and display apartments
async function loadApartments() {
    const grid = document.getElementById('grid');
    const guestFilter = document.getElementById('guest-filter').value;
    const priceFilter = document.getElementById('price-filter').value;

    try {
        grid.innerHTML = '<div class="loading">Загрузка...</div>';

        const filters = { guests: guestFilter };
        if (priceFilter) {
            filters.maxPrice = parseInt(priceFilter);
        }

        const response = await api.getApartments(filters);
        const apartments = response.data;

        if (apartments.length === 0) {
            grid.innerHTML = '<div class="no-results">Квартиры не найдены</div>';
            return;
        }

        grid.innerHTML = '';
        apartments.forEach(apt => {
            const card = createApartmentCard(apt);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading apartments:', error);
        grid.innerHTML = '<div class="error">Ошибка загрузки. Пожалуйста, попробуйте позже.</div>';
    }
}

// Create apartment card element
function createApartmentCard(apartment) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <img src="${apartment.image || 'https://via.placeholder.com/500x300?text=Нет+фото'}"
             class="card-img" alt="${apartment.title}"
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/500x300?text=Фото+не+доступно'">
        <div class="card-content">
            <h3 class="card-title">${apartment.title}</h3>
            <p class="card-address">${apartment.address}</p>
            <p class="card-guests">👥 Вместимость: до ${apartment.guests} чел.</p>
            <div class="card-footer">
                <span class="card-price">${apartment.price.toLocaleString()} ₸ / сутки</span>
                <a href="pages/apartment.html?id=${apartment.id}" class="btn btn-secondary">Подробнее</a>
            </div>
        </div>
    `;
    return card;
}

// Search on enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.closest('.search-bar')) {
        loadApartments();
    }
});
