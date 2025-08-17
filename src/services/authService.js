// 2. Fix authService.js - Update API endpoints
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_URL = `${API_BASE}/users/`;

class AuthService {
    constructor() {
        this.baseURL = API_BASE;
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Auth API call failed: ${endpoint}`, error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            const response = await axios.post(API_URL + "login", credentials);
            
            // Since your backend doesn't return a token yet, let's simulate one
            const token = 'dummy-token-' + Date.now();
            const result = {
                token: token,
                user: response.data.user
            };
            
            return result;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await axios.post(API_URL + "register", userData);
            
            // Since your backend doesn't return a token yet, let's simulate one
            const token = 'dummy-token-' + Date.now();
            const result = {
                token: token,
                user: response.data
            };
            
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        // Use the correct endpoint that exists in your backend
        const response = await this.apiCall('/users/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.user || response;
    }

    async updateProfile(userData) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await this.apiCall('/users/profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        return response;
    }

    logout() {
        localStorage.removeItem('token');
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }
}

export const authService = new AuthService();