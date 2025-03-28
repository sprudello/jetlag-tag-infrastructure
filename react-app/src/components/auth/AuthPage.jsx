import { useState } from 'react';
import { Box, Container } from '@mui/material';
import Login from './Login';
import Register from './Register';
import { useAuth } from '../../contexts/AuthContext';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, register } = useAuth();

  const handleLogin = async (credentials) => {
    await login(credentials);
    // Navigation will be handled by the App component based on auth state
  };

  const handleRegister = async (userData) => {
    await register(userData);
    // After successful registration, switch to login view
    setIsLoginView(true);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {isLoginView ? (
          <Login 
            onLogin={handleLogin} 
            onNavigateToRegister={toggleView} 
          />
        ) : (
          <Register 
            onRegister={handleRegister} 
            onNavigateToLogin={toggleView} 
          />
        )}
      </Box>
    </Container>
  );
};

export default AuthPage;
