/**
 * Decodes JWT token payload
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // JWT tokens are made of three parts: header.payload.signature
    // We only need the payload which is the second part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
