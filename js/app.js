// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    loadApartments();
});

// Show notification (reusable error/success/info display)
function showNotification(message, type = 'error') {
    const grid = document.getElementById('grid');

    // Remove existing notifications
    const existing = grid.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add styles
    Object.assign(notification.style, {
        gridColumn: '1 / -1',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        animation: 'slideInDown 0.3s ease',
        borderLeft: '4px solid',
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    });

    const colors = {
        error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
        success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        info: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
    };
    notification.style.background = colors[type] || colors.error;

    grid.insertBefore(notification, grid.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideOutDown {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: white;
        font-weight: 500;
    }
    .notification-icon {
        font-size: 1.25rem;
    }
    .notification-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.8;
        transition: 0.2s;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    .notification-close:hover {
        opacity: 1;
        background: rgba(255,255,255,0.2);
    }
`;
document.head.appendChild(style);

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
            grid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🏠</div>
                    <p>Квартиры не найдены</p>
                    <small>Попробуйте изменить фильтры поиска</small>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        apartments.forEach(apt => {
            const card = createApartmentCard(apt);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading apartments:', error);
        grid.innerHTML = `
            <div class="error">
                <div class="error-icon">⚠️</div>
                <p>Не удалось загрузить квартиры</p>
                <small>Проверьте соединение с интернетом и попробуйте позже</small>
            </div>
        `;
        showNotification('Ошибка загрузки данных. Пожалуйста, обновите страницу.', 'error');
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
