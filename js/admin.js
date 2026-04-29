// Admin panel logic
let allApartments = [];
let apartToDelete = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadApartments();
});

// Load all apartments
async function loadApartments() {
    try {
        const response = await api.getApartments({ limit: 100 });
        allApartments = response.data;
        renderTable(allApartments);
    } catch (error) {
        console.error('Error loading apartments:', error);
        showError('Ошибка загрузки данных');
    }
}

// Render table
function renderTable(apartments) {
    const tbody = document.getElementById('apartments-tbody');
    const noData = document.getElementById('no-data');

    if (apartments.length === 0) {
        tbody.innerHTML = '';
        noData.style.display = 'block';
        return;
    }

    noData.style.display = 'none';
    tbody.innerHTML = apartments.map(apt => `
        <tr>
            <td>${apt.id}</td>
            <td>
                <img src="${apt.image || 'https://via.placeholder.com/60x40?text=Нет'}"
                     class="table-img"
                     alt="фото"
                     onerror="this.src='https://via.placeholder.com/60x40?text=Нет'">
            </td>
            <td><strong>${escapeHtml(apt.title)}</strong></td>
            <td>${escapeHtml(apt.address)}</td>
            <td><strong class="price">${apt.price.toLocaleString()} ₸</strong></td>
            <td>${apt.guests}</td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="editApartment(${apt.id})">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteApartment(${apt.id}, '${escapeHtml(apt.title)}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Filter apartments
function filterApartments() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filtered = allApartments.filter(apt =>
        apt.title.toLowerCase().includes(searchTerm) ||
        apt.address.toLowerCase().includes(searchTerm)
    );
    renderTable(filtered);
}

// Sort apartments
function sortApartments() {
    const sortValue = document.getElementById('sort-select').value;
    let sorted = [...allApartments];

    switch (sortValue) {
        case 'newest':
            sorted.sort((a, b) => b.id - a.id);
            break;
        case 'oldest':
            sorted.sort((a, b) => a.id - b.id);
            break;
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
    }

    renderTable(sorted);
}

// Open modal for adding/editing
function openModal(apartment = null) {
    const modal = document.getElementById('apartment-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('apartment-form');

    form.reset();

    if (apartment) {
        title.textContent = 'Редактировать квартиру';
        document.getElementById('apartment-id').value = apartment.id;
        document.getElementById('title').value = apartment.title;
        document.getElementById('address').value = apartment.address;
        document.getElementById('price').value = apartment.price;
        document.getElementById('guests').value = apartment.guests;
        document.getElementById('image').value = apartment.image || '';
        document.getElementById('description').value = apartment.description || '';
    } else {
        title.textContent = 'Добавить квартиру';
        document.getElementById('apartment-id').value = '';
        document.getElementById('guests').value = 2;
    }

    modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('apartment-modal').style.display = 'none';
}

// Edit apartment
function editApartment(id) {
    const apartment = allApartments.find(apt => apt.id === id);
    if (apartment) {
        openModal(apartment);
    }
}

// Delete apartment
function deleteApartment(id, name) {
    apartToDelete = id;
    document.getElementById('delete-item-name').textContent = name;
    document.getElementById('delete-modal').style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    apartToDelete = null;
}

// Confirm delete
async function confirmDelete() {
    if (!apartToDelete) return;

    try {
        await api.deleteApartment(apartToDelete);
        closeDeleteModal();
        await loadApartments();
        showSuccess('Квартира удалена');
    } catch (error) {
        console.error('Delete error:', error);
        showError('Ошибка при удалении');
    }
}

// Handle form submit
async function handleSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('apartment-id').value;
    const apartmentData = {
        title: document.getElementById('title').value,
        address: document.getElementById('address').value,
        price: parseInt(document.getElementById('price').value),
        guests: parseInt(document.getElementById('guests').value) || 1,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value,
    };

    try {
        if (id) {
            await api.updateApartment(id, apartmentData);
            showSuccess('Квартира обновлена');
        } else {
            await api.createApartment(apartmentData);
            showSuccess('Квартира добавлена');
        }

        closeModal();
        await loadApartments();
    } catch (error) {
        console.error('Save error:', error);
        showError('Ошибка при сохранении');
    }
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: '10001',
        animation: 'slideIn 0.3s ease',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        minWidth: '300px',
        maxWidth: '500px',
    });

    const colors = {
        success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
        info: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
    };
    notification.style.background = colors[type] || colors.error;
    notification.style.color = 'white';

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .admin-main {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .admin-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        overflow: hidden;
    }

    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background: var(--gradient-primary, linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%));
        color: white;
    }

    .admin-header h1 {
        font-size: 1.5rem;
        margin: 0;
    }

    .admin-filters {
        padding: 1rem 1.5rem;
        display: flex;
        gap: 1rem;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
    }

    .admin-filters input,
    .admin-filters select {
        padding: 0.75rem 1rem;
        border: 2px solid #dee2e6;
        border-radius: 6px;
        font-size: 0.9rem;
    }

    .admin-filters input {
        flex: 1;
    }

    .table-container {
        overflow-x: auto;
    }

    .admin-table {
        width: 100%;
        border-collapse: collapse;
    }

    .admin-table th,
    .admin-table td {
        padding: 1rem 1.5rem;
        text-align: left;
        border-bottom: 1px solid #e9ecef;
    }

    .admin-table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #495057;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.5px;
    }

    .admin-table tr:hover {
        background: #f8f9fa;
    }

    .table-img {
        width: 60px;
        height: 40px;
        object-fit: cover;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .admin-table .price {
        color: var(--primary-color, #ff6b35);
        font-weight: 700;
        font-size: 1.1rem;
    }

    .admin-table .actions {
        display: flex;
        gap: 0.5rem;
    }

    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        min-height: auto;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .no-data {
        padding: 3rem;
        text-align: center;
        color: #6c757d;
    }

    .modal-lg .modal-content {
        max-width: 600px;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .badge {
        background: rgba(255,255,255,0.15);
        padding: 0.5rem 1rem;
        border-radius: 50px;
        font-size: 0.85rem;
        font-weight: 600;
        border: 1px solid rgba(255,255,255,0.25);
        backdrop-filter: blur(10px);
        letter-spacing: 0.3px;
    }

    @media (max-width: 768px) {
        .admin-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .admin-filters {
            flex-direction: column;
        }

        .admin-table th,
        .admin-table td {
            padding: 0.75rem;
        }
    }
`;
document.head.appendChild(style);
