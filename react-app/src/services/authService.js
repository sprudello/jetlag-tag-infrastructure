// Base API URL - should be configured from environment variables in a real app
const API_URL = 'http://localhost:5296';

/**
 * Service to handle authentication API calls
 */
const authService = {
  /**
   * Login user and get JWT token
   * @param {Object} credentials - User credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} - User data with token and isAdmin flag
   */
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid username or password');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      return {
        token: data.token,
        isAdmin: data.isAdmin
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @returns {Promise<Object>} - Registration result
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout user by removing token
   */
  logout: () => {
    localStorage.removeItem('authToken');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get current auth token
   * @returns {string|null} - Auth token or null
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  }
};

export default authService;
