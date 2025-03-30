import apiService from './apiService';
import API_CONFIG from '../config/apiConfig';

// Base API URL
const API_URL = API_CONFIG.BASE_URL;

/**
 * Service for transportation-related API calls
 */
const transportationService = {
  /**
   * Get all transportation types
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - List of transportation types
   */
  getAllTransportationTypes: async (token) => {
    return await apiService.get('/allTransportationTypes', token);
  },
  
  /**
   * Get a specific transportation type by ID
   * @param {number} id - Transportation type ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Transportation type data
   */
  getTransportationTypeById: async (id, token) => {
    return await apiService.get(`/transportationType/${id}`, token);
  },
  
  /**
   * Create a new transportation type
   * @param {Object} transportationData - Transportation type data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Created transportation type
   */
  createTransportationType: async (transportationData, token) => {
    return await apiService.post('/createTransportationType', transportationData, token);
  },
  
  /**
   * Update an existing transportation type
   * @param {number} id - Transportation type ID
   * @param {Object} transportationData - Updated transportation type data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Updated transportation type
   */
  updateTransportationType: async (id, transportationData, token) => {
    try {
      const response = await fetch(`${API_URL}/updateTransportationType/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transportationData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json().catch(() => ({})); // Handle empty responses
    } catch (error) {
      console.error(`PUT request failed: /updateTransportationType/${id}`, error);
      throw error;
    }
  },
  
  /**
   * Delete a transportation type
   * @param {number} id - Transportation type ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response data
   */
  deleteTransportationType: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/deleteTransportationType/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json().catch(() => ({})); // Handle empty responses
    } catch (error) {
      console.error(`DELETE request failed: /deleteTransportationType/${id}`, error);
      throw error;
    }
  },
  
  /**
   * Purchase transportation
   * @param {Object} purchaseData - Purchase data (userId, transportationTypeId, durationInMinutes)
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Purchase result
   */
  purchaseTransportation: async (purchaseData, token) => {
    return await apiService.post('/buyTransportation', purchaseData, token);
  }
};

export default transportationService;
