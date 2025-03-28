import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Base API URL - should be configured from environment variables in a real app
const API_URL = 'http://localhost:5296';

// Create context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = () => {
      const token = authService.getToken();
      if (token) {
        setIsAuthenticated(true);
        
        // Get stored user info
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr);
            
            // Fetch user data including currency
            const fetchUserData = async () => {
              try {
                const response = await fetch(`${API_URL}/user/${userInfo.userId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (response.ok) {
                  const userData = await response.json();
                  setCurrentUser({
                    ...userInfo,
                    token,
                    currency: userData.currency
                  });
                } else {
                  // If we can't fetch user data, still use the stored info
                  setCurrentUser({
                    ...userInfo,
                    token
                  });
                }
              } catch (err) {
                console.error('Error fetching user data:', err);
                setCurrentUser({
                  ...userInfo,
                  token
                });
              }
            };
            
            fetchUserData();
          } catch (err) {
            console.error('Error parsing user info:', err);
          }
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
      setIsAuthenticated(true);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      // Optionally auto-login after registration
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
