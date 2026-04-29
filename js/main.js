const API_BASE = '/api';
const STORAGE_KEY_USER = 'uyut_user';
const STORAGE_KEY_FAVORITES = 'uyut_favorites';

const sampleApartments = [
    {
        id: 1,
        name: 'Modern Studio in CBD',
        location: 'Central Business District, Astana',
        price: 8500,
        rating: 4.8,
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Parking'],
        photos: ['https://via.placeholder.com/600x400?text=Apartment+1', 'https://via.placeholder.com/600x400?text=Apartment+2'],
        description: 'Beautiful modern studio apartment in the heart of Astana CBD. Fully equipped kitchen, air conditioning, and high-speed WiFi.',
        popularity: 95
    },
    {
        id: 2,
        name: 'Luxury 1-Bedroom near Expo',
        location: 'Near EXPO 2017, Astana',
        price: 12000,
        rating: 4.9,
        guests: 4,
        bedrooms: 1,
        bathrooms: 2,
        amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Balcony', 'Gym Access'],
        photos: ['https://via.placeholder.com/600x400?text=Apartment+3', 'https://via.placeholder.com/600x400?text=Apartment+4'],
        description: 'Spacious luxury apartment with panoramic views. Walking distance to EXPO 2017 landmarks.',
        popularity: 88
    },
    {
        id: 3,
        name: 'Cozy 2-Bedroom in Altay',
        location: 'Altay District, Astana',
        price: 15000,
        rating: 4.7,
        guests: 6,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Laundry', 'Parking'],
        photos: ['https://via.placeholder.com/600x400?text=Apartment+5', 'https://via.placeholder.com/600x400?text=Apartment+6'],
        description: 'Comfortable family apartment in quiet residential area. Close to parks and shopping centers.',
        popularity: 72
    },
    {
        id: 4,
        name: 'Budget-Friendly Studio',
        location: 'Seyfullin District, Astana',
        price: 5500,
        rating: 4.3,
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['WiFi', 'Kitchen', 'Heating'],
        photos: ['https://via.placeholder.com/600x400?text=Apartment+7', 'https://via.placeholder.com/600x400?text=Apartment+8'],
        description: 'Affordable studio apartment perfect for short stays. Good location with easy transport access.',
        popularity: 65
    }
];

let currentUser = null;
let currentApartmentId = null;

document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    currentUser = JSON.parse(localStorage.getItem(STORAGE_KEY_USER));
    if (window.location.pathname.includes('admin.html')) {
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }
        loadAdminDashboard();
    }
    if (window.location.pathname.includes('profile.html') || 
        window.location.pathname.includes('bookings.html') || 
        window.location.pathname.includes('favorites.html') ||
        window.location.pathname.includes('messages.html')) {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
    }
    setupEventListeners();
    loadPageContent();
}

function setupEventListeners() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', handleFilter);
    }
    
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
    
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    const addApartmentBtn = document.getElementById('add-apartment-btn');
    if (addApartmentBtn) {
        addApartmentBtn.addEventListener('click', openAddApartmentModal);
    }
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
}

function loadPageContent() {
    if (window.location.pathname.includes('listings.html')) {
        loadListings();
    } else if (window.location.pathname.includes('apartment.html')) {
        loadApartmentDetail();
    } else if (window.location.pathname.includes('bookings.html')) {
        loadBookings();
    } else if (window.location.pathname.includes('favorites.html')) {
        loadFavorites();
    } else if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    } else if (window.location.pathname.includes('admin.html')) {
        loadAdminDashboard();
    }
}

function handleSearch(e) {
    e.preventDefault();
    window.location.href = 'listings.html';
}

function handleFilter(e) {
    e.preventDefault();
    loadListings();
}

function handleSort(e) {
    loadListings();
}

function loadListings() {
    const container = document.getElementById('listings-container');
    if (!container) return;
    
    let filtered = [...sampleApartments];
    
    const sortValue = document.getElementById('sort')?.value;
    if (sortValue === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'popularity') {
        filtered.sort((a, b) => b.popularity - a.popularity);
    }
    
    container.innerHTML = filtered.map(apt => `
        <div class="apartment-card">
            <img src="${apt.photos[0]}" alt="${apt.name}">
            <div class="apartment-card-content">
                <h3>${apt.name}</h3>
                <div class="price">${apt.price} ₸/night</div>
                <div class="rating">★ ${apt.rating}</div>
                <div class="amenities">
                    ${apt.amenities.slice(0, 3).map(a => `<span>${a}</span>`).join('')}
                </div>
                <a href="apartment.html?id=${apt.id}" class="btn">View Details</a>
            </div>
        </div>
    `).join('');
}

function loadApartmentDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || '1';
    const apt = sampleApartments.find(a => a.id == id);
    
    if (!apt) return;
    
    document.querySelector('.main-photo img').src = apt.photos[0];
    document.querySelector('.main-photo img').alt = apt.name;
    
    const thumbsContainer = document.querySelector('.thumbnail-photos');
    thumbsContainer.innerHTML = apt.photos.map((p, i) => 
        `<img src="${p}" alt="Thumbnail ${i+1}" ${i === 0 ? 'class="active"' : ''} onclick="updateMainPhoto(this)">`
    ).join('');
    
    document.querySelector('.apartment-name').textContent = apt.name;
    document.querySelector('.price-per-night').textContent = apt.price.toLocaleString();
    document.querySelector('.apartment-rating').innerHTML = '★ '.repeat(5);
    document.querySelector('.apartment-amenities').innerHTML = apt.amenities.map(a => `<span>${a}</span>`).join('');
    document.querySelector('.apartment-description').textContent = apt.description;
}

function updateMainPhoto(el) {
    const mainPhoto = document.querySelector('.main-photo img');
    mainPhoto.src = el.src;
    mainPhoto.alt = el.alt;
    document.querySelectorAll('.thumbnail-photos img').forEach(img => img.classList.remove('active'));
    el.classList.add('active');
}

function loadBookings() {
    const activeTab = document.getElementById('active-bookings');
    const pastTab = document.getElementById('past-bookings');
    
    if (activeTab) {
        activeTab.innerHTML = '<div class="booking-card"><h4>Modern Studio in CBD</h4><p>April 30 - May 3, 2026</p><p>Status: Active</p></div>';
    }
    if (pastTab) {
        pastTab.innerHTML = '<div class="booking-card"><h4>Luxury 1-Bedroom near Expo</h4><p>March 15 - March 18, 2026</p><p>Status: Completed</p></div>';
    }
}

function loadFavorites() {
    const container = document.querySelector('.favorites-list');
    if (!container) return;
    
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES) || '[]');
    if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No favorite apartments yet</p></div>';
        return;
    }
    
    container.innerHTML = favorites.map(apt => `
        <div class="apartment-card">
            <img src="${apt.photos[0]}" alt="${apt.name}">
            <div class="apartment-card-content">
                <h3>${apt.name}</h3>
                <div class="price">${apt.price} ₸/night</div>
                <a href="apartment.html?id=${apt.id}" class="btn">View Details</a>
            </div>
        </div>
    `).join('');
}

function loadProfile() {
    if (!currentUser) return;
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-email').value = currentUser.email;
    document.getElementById('edit-phone').value = currentUser.phone || '';
}

function loadAdminDashboard() {
    document.getElementById('total-apartments').textContent = sampleApartments.length;
    document.getElementById('total-bookings').textContent = '24';
    document.getElementById('total-users').textContent = '156';
    document.getElementById('total-revenue').textContent = '345 000 ₸';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const user = { id: 1, name: email.split('@')[0], email: email, role: 'user' };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    window.location.href = 'profile.html';
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    
    const user = { id: Date.now(), name: name, email: email, phone: phone, role: 'user' };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    window.location.href = 'profile.html';
}

function handleBooking(e) {
    e.preventDefault();
    const checkin = document.getElementById('booking-checkin').value;
    const checkout = document.getElementById('booking-checkout').value;
    
    alert('Booking request submitted! You will receive confirmation shortly.');
    window.location.href = 'bookings.html';
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    alert('Profile updated successfully!');
}

function switchTab(e) {
    const tab = e.target.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tabContent => tabContent.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById(`${tab}-bookings`).classList.add('active');
}

function openAddApartmentModal() {
    alert('Add apartment form would open here');
}