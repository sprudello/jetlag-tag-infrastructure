import apiService from './apiService';

/**
 * Service for user-related API calls
 */
const userService = {
  /**
   * Get all users
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - List of users
   */
  getAllUsers: async (token) => {
    return await apiService.get('/allUsers', token);
  },
  
  /**
   * Get a specific user by ID
   * @param {number} id - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - User data
   */
  getUserById: async (id, token) => {
    return await apiService.get(`/user/${id}`, token);
  },
  
  /**
   * Update an existing user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Updated user
   */
  updateUser: async (id, userData, token) => {
    return await apiService.put(`/editUser/${id}`, userData, token);
  },
  
  /**
   * Get challenge counts for a user
   * @param {number} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Challenge counts
   */
  getChallengeCounts: async (userId, token) => {
    return await apiService.get(`/challengeCounts/${userId}`, token);
  }
};

export default userService;
