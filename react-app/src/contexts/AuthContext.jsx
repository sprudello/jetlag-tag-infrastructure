import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

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
        // In a real app, you would validate the token and get user data
        // For now, we'll just set authenticated to true
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setIsAuthenticated(true);
      setCurrentUser({
        username: credentials.username,
        token: data.token,
        isAdmin: data.isAdmin
      });
      return data;
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
