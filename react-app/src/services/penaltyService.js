import apiService from './apiService';
import API_CONFIG from '../config/apiConfig';

// Base API URL
const API_URL = API_CONFIG.BASE_URL;

/**
 * Service for penalty-related API calls
 */
const penaltyService = {
  /**
   * Update penalty duration
   * @param {Object} penaltyData - Penalty data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Updated penalty
   */
  updatePenalty: async (penaltyData, token) => {
    try {
      const response = await fetch(`${API_URL}/Penalty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(penaltyData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json().catch(() => ({})); // Handle empty responses
    } catch (error) {
      console.error(`PUT request failed: /Penalty`, error);
      throw error;
    }
  },
  
  /**
   * Complete challenge with success
   * @param {number} userId - User ID
   * @param {Object} data - Challenge completion data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Completion result
   */
  completeSuccess: async (userId, data, token) => {
    return await apiService.post(`/success/${userId}`, data, token);
  },
  
  /**
   * Complete challenge with failure
   * @param {number} userId - User ID
   * @param {Object} data - Challenge failure data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Failure result
   */
  completeFail: async (userId, data, token) => {
    return await apiService.post(`/fail/${userId}`, data, token);
  },
  
  /**
   * Pull a challenge card
   * @param {number} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Challenge card
   */
  pullCard: async (userId, token) => {
    return await apiService.get(`/pullCard/${userId}`, token);
  }
};

export default penaltyService;
