import { decodeToken } from '../utils/jwtUtils';

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
   * @returns {Promise<Object>} - User data with token and user info
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
      const token = data.token;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Decode token to get user information
      const decodedToken = decodeToken(token);
      
      // Extract user info from token
      const userId = decodedToken?.UserId || null;
      const username = decodedToken?.unique_name || credentials.username;
      const role = decodedToken?.role || '';
      const isAdmin = role === 'Admin';
      
      // Store user info in localStorage
      const userInfo = { userId, username, isAdmin };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Fetch user data including currency
      let userData = { token, userId, username, isAdmin };
      
      if (userId) {
        try {
          const userResponse = await fetch(`${API_URL}/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userResponse.ok) {
            const userDetails = await userResponse.json();
            userData = { 
              ...userData, 
              currency: userDetails.currency 
            };
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      }
      
      return userData;
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
   * Logout user by removing token and user info
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
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
