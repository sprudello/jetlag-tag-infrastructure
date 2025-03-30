import apiService from './apiService';
import API_CONFIG from '../config/apiConfig';

// Base API URL
const API_URL = API_CONFIG.BASE_URL;

/**
 * Service for challenge-related API calls
 */
const challengeService = {
  /**
   * Get all challenges
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - List of challenges
   */
  getAllChallenges: async (token) => {
    return await apiService.get('/allChallenges', token);
  },
  
  /**
   * Get a specific challenge by ID
   * @param {number} id - Challenge ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Challenge data
   */
  getChallengeById: async (id, token) => {
    return await apiService.get(`/challenge/${id}`, token);
  },
  
  /**
   * Create a new challenge
   * @param {Object} challengeData - Challenge data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Created challenge
   */
  createChallenge: async (challengeData, token) => {
    return await apiService.post('/createChallenge', challengeData, token);
  },
  
  /**
   * Update an existing challenge
   * @param {number} id - Challenge ID
   * @param {Object} challengeData - Updated challenge data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Updated challenge
   */
  updateChallenge: async (id, challengeData, token) => {
    try {
      const response = await fetch(`${API_URL}/editChallenge/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(challengeData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json().catch(() => ({})); // Handle empty responses
    } catch (error) {
      console.error(`PUT request failed: /editChallenge/${id}`, error);
      throw error;
    }
  },
  
  /**
   * Delete a challenge
   * @param {number} id - Challenge ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response data
   */
  deleteChallenge: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/deleteChallenge/${id}`, {
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
      console.error(`DELETE request failed: /deleteChallenge/${id}`, error);
      throw error;
    }
  }
};

export default challengeService;
