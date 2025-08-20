// src/services/authService.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class AuthService {
    constructor() {
        this.baseURL = API_BASE;
        this.tokenKey = 'taskflow_token';
        this.userKey = 'taskflow_user';
    }

    // Helper method to get auth headers
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    // Helper method for API calls with automatic token handling
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);

            // Handle token expiration
            if (response.status === 401) {
                const errorData = await response.json().catch(() => ({}));
                
                if (errorData.code === 'TOKEN_EXPIRED') {
                    // Try to refresh token first
                    try {
                        await this.refreshToken();
                        // Retry the original request with new token
                        const retryConfig = {
                            ...config,
                            headers: this.getAuthHeaders()
                        };
                        const retryResponse = await fetch(url, retryConfig);
                        
                        if (!retryResponse.ok) {
                            const retryErrorData = await retryResponse.json().catch(() => ({}));
                            throw new Error(retryErrorData.message || `HTTP error! status: ${retryResponse.status}`);
                        }
                        
                        return await retryResponse.json();
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        this.logout();
                        window.location.href = '/login';
                        throw new Error('Session expired. Please log in again.');
                    }
                } else {
                    // Other auth errors
                    this.logout();
                    throw new Error(errorData.message || 'Authentication failed');
                }
            }

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

    // Login with JWT
    async login(credentials) {
        try {
            console.log('Logging in user with credentials:', { email: credentials.email });
            
            const response = await fetch(`${this.baseURL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email.trim().toLowerCase(),
                    password: credentials.password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            const result = await response.json();
            
            if (result.token && result.user) {
                // Store token and user data
                this.setToken(result.token);
                this.setUser(result.user);
                
                console.log('Login successful for user:', result.user.id);
                return result;
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Register with JWT
    async register(userData) {
        try {
            console.log('Registering user with data:', { 
                name: userData.name, 
                email: userData.email,
                company: userData.company,
                role: userData.role 
            });
            
            const response = await fetch(`${this.baseURL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData.name.trim(),
                    email: userData.email.trim().toLowerCase(),
                    password: userData.password,
                    company: userData.company,
                    role: userData.role || 'member'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Registration failed');
            }

            const result = await response.json();
            
            if (result.token && result.user) {
                // Store token and user data
                this.setToken(result.token);
                this.setUser(result.user);
                
                console.log('Registration successful for user:', result.user.id);
                return result;
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Get current user (protected)
    async getCurrentUser() {
        try {
            const response = await this.apiCall('/users/me');
            
            if (response.user) {
                // Update stored user data
                this.setUser(response.user);
                return response.user;
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No token to refresh');
            }

            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Token refresh failed');
            }

            const result = await response.json();
            
            if (result.token && result.user) {
                this.setToken(result.token);
                this.setUser(result.user);
                return result;
            } else {
                throw new Error('Invalid refresh response');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }

    // Update profile (protected)
    async updateProfile(userData) {
        return await this.apiCall('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Change password (protected)
    async changePassword(passwordData) {
        return await this.apiCall('/users/change-password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    }

    // Forgot password
    async forgotPassword(email) {
        const response = await fetch(`${this.baseURL}/users/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email.trim().toLowerCase() })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Forgot password request failed');
        }

        return await response.json();
    }

    // Reset password
    async resetPassword(token, newPassword) {
        const response = await fetch(`${this.baseURL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Password reset failed');
        }

        return await response.json();
    }

    // Settings API methods (protected)
    async getUserSettings() {
        return await this.apiCall('/users/settings');
    }

    async updateSettings(settings) {
        return await this.apiCall('/users/settings', {
            method: 'PUT',
            body: JSON.stringify({ settings })
        });
    }

    async updateNotificationSettings(notifications) {
        return await this.apiCall('/users/settings/notifications', {
            method: 'PUT',
            body: JSON.stringify({ notifications })
        });
    }

    async updateAppearanceSettings(preferences) {
        return await this.apiCall('/users/settings/appearance', {
            method: 'PUT',
            body: JSON.stringify({ preferences })
        });
    }

    async updatePrivacySettings(privacy) {
        return await this.apiCall('/users/settings/privacy', {
            method: 'PUT',
            body: JSON.stringify({ privacy })
        });
    }

    async exportUserData() {
        const token = this.getToken();
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${this.baseURL}/users/settings/export`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to export data');
        }

        // For file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskflow-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return { message: 'Data exported successfully' };
    }

    async deleteAccount(password) {
        const result = await this.apiCall('/users/settings/delete-account', {
            method: 'DELETE',
            body: JSON.stringify({ confirmPassword: password })
        });

        // Clear local storage after account deletion
        this.logout();
        return result;
    }

    async deleteAllData(password) {
        const result = await this.apiCall('/users/settings/delete-all-data', {
            method: 'DELETE',
            body: JSON.stringify({ confirmPassword: password })
        });

        // Clear local storage after data deletion
        this.logout();
        return result;
    }

    // Token management
    setToken(token) {
        try {
            localStorage.setItem(this.tokenKey, token);
        } catch (error) {
            console.error('Error storing token:', error);
        }
    }

    getToken() {
        try {
            return localStorage.getItem(this.tokenKey);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    removeToken() {
        try {
            localStorage.removeItem(this.tokenKey);
        } catch (error) {
            console.error('Error removing token:', error);
        }
    }

    // User data management
    setUser(user) {
        try {
            localStorage.setItem(this.userKey, JSON.stringify(user));
        } catch (error) {
            console.error('Error storing user data:', error);
        }
    }

    getUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    removeUser() {
        try {
            localStorage.removeItem(this.userKey);
        } catch (error) {
            console.error('Error removing user data:', error);
        }
    }

    // Logout
    logout() {
        this.removeToken();
        this.removeUser();
    }

    // Check authentication status
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    // Check if token is expired (basic check)
    isTokenExpired() {
        const token = this.getToken();
        if (!token) return true;

        try {
            // Basic JWT token expiration check
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    // Auto-refresh token before expiration
    startTokenRefreshTimer() {
        const token = this.getToken();
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            const refreshTime = timeUntilExpiration - (5 * 60 * 1000); // Refresh 5 minutes before expiration

            if (refreshTime > 0) {
                setTimeout(async () => {
                    try {
                        await this.refreshToken();
                        this.startTokenRefreshTimer(); // Start timer again for new token
                    } catch (error) {
                        console.error('Auto token refresh failed:', error);
                        this.logout();
                        window.location.href = '/login';
                    }
                }, refreshTime);
            }
        } catch (error) {
            console.error('Error setting up token refresh timer:', error);
        }
    }
}

export const authService = new AuthService();