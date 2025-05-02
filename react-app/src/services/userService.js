import apiService from './apiService';

/**
 * User API service
 */
const userService = {
  /**
   * Fetches all users
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - User list
   */
  getAllUsers: async (token) => {
    return await apiService.get('/allUsers', token);
  },
  
  /**
   * Fetches user by ID
   * @param {number} id - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - User data
   */
  getUserById: async (id, token) => {
    return await apiService.get(`/user/${id}`, token);
  },
  
  /**
   * Updates existing user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Updated user
   */
  updateUser: async (id, userData, token) => {
    return await apiService.put(`/editUser/${id}`, userData, token);
  },
  
  /**
   * Fetches user challenge statistics
   * @param {number} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Challenge counts
   */
  getChallengeCounts: async (userId, token) => {
    return await apiService.get(`/challengeCounts/${userId}`, token);
  }
};

export default userService;
