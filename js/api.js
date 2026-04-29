// API Client for communicating with backend
const API_BASE = '/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Apartments
    async getApartments(filters = {}) {
        const params = new URLSearchParams();
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.guests) params.append('guests', filters.guests);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);

        const queryString = params.toString();
        return this.request(queryString ? `/apartments?${queryString}` : '/apartments');
    }

    async getApartment(id) {
        return this.request(`/apartments/${id}`);
    }

    async createApartment(apartment) {
        return this.request('/apartments', {
            method: 'POST',
            body: JSON.stringify(apartment),
        });
    }

    async updateApartment(id, apartment) {
        return this.request(`/apartments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(apartment),
        });
    }

    async deleteApartment(id) {
        return this.request(`/apartments/${id}`, {
            method: 'DELETE',
        });
    }

    // Bookings
    async createBooking(booking) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(booking),
        });
    }

    async getBookings(apartmentId) {
        return this.request(`/bookings/${apartmentId}`);
    }

    // Saved Data (Key-Value Store)
    async getSavedData(key = null) {
        if (key) {
            return this.request(`/saved-data/${encodeURIComponent(key)}`);
        }
        return this.request('/saved-data');
    }

    async saveData(key, value) {
        return this.request('/saved-data', {
            method: 'POST',
            body: JSON.stringify({ key, value }),
        });
    }

    async updateSavedData(key, value) {
        return this.request(`/saved-data/${encodeURIComponent(key)}`, {
            method: 'PUT',
            body: JSON.stringify({ value }),
        });
    }

    async deleteSavedData(key) {
        return this.request(`/saved-data/${encodeURIComponent(key)}`, {
            method: 'DELETE',
        });
    }
}

// Create global instance
const api = new ApiClient();
