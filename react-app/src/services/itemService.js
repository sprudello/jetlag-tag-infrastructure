import apiService from './apiService';
import API_CONFIG from '../config/apiConfig';

// Base API URL
const API_URL = API_CONFIG.BASE_URL;

/**
 * Item API service
 */
const itemService = {
  /**
   * Fetches all items
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - Item list
   */
  getAllItems: async (token) => {
    return await apiService.get('/AllItems', token);
  },
  
  /**
   * Fetches item by ID
   * @param {number} id - Item ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Item data
   */
  getItemById: async (id, token) => {
    try {
      const item = await apiService.get(`/Item/${id}`, token);
      console.log(`Fetched item by ID ${id}:`, item);
      return item;
    } catch (error) {
      console.error(`Error fetching item with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Creates new item
   * @param {Object} itemData - Item data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Created item
   */
  createItem: async (itemData, token) => {
    return await apiService.post('/createItem', itemData, token);
  },
  
  /**
   * Updates existing item
   * @param {number} id - Item ID
   * @param {Object} itemData - Updated item data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Updated item
   */
  updateItem: async (id, itemData, token) => {
    try {
      const response = await fetch(`${API_URL}/editItem/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json().catch(() => ({})); // Handle empty responses
    } catch (error) {
      console.error(`PUT request failed: /editItem/${id}`, error);
      throw error;
    }
  },
  
  /**
   * Deletes item
   * @param {number} id - Item ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response data
   */
  deleteItem: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/deleteItem/${id}`, {
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
      console.error(`DELETE request failed: /deleteItem/${id}`, error);
      throw error;
    }
  },
  
  /**
   * Purchases item
   * @param {Object} purchaseData - Purchase data (userId, itemId)
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Purchase result
   */
  buyItem: async (purchaseData, token) => {
    try {
      const response = await fetch(`${API_URL}/UserItems/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(purchaseData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Buy item error response:', errorText);
        throw new Error(errorText || 'Failed to purchase item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Buy item error:', error);
      throw error;
    }
  }
};

export default itemService;
