import API_CONFIG from '../config/apiConfig';

/**
 * Base HTTP request service
 */
const API_URL = API_CONFIG.BASE_URL;

const apiService = {
  /**
   * Performs GET request
   * @param {string} endpoint - API endpoint
   * @param {string} token - JWT token
   * @returns {Promise<any>} - Response data
   */
  get: async (endpoint, token) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`GET request failed: ${endpoint}`, error);
      throw error;
    }
  },
  
  /**
   * Performs POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {string} token - JWT token
   * @returns {Promise<any>} - Response data
   */
  post: async (endpoint, data, token) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`POST request failed: ${endpoint}`, error);
      throw error;
    }
  },
  
  /**
   * Performs PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {string} token - JWT token
   * @returns {Promise<any>} - Response data
   */
  put: async (endpoint, data, token) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`PUT request failed: ${endpoint}`, error);
      throw error;
    }
  },
  
  /**
   * Performs DELETE request
   * @param {string} endpoint - API endpoint
   * @param {string} token - JWT token
   * @returns {Promise<any>} - Response data
   */
  delete: async (endpoint, token) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`DELETE request failed: ${endpoint}`, error);
      throw error;
    }
  }
};

export default apiService;
