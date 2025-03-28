import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import '../../styles/components/auth/auth.scss';

const Login = ({ onLogin, onNavigateToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onLogin(formData);
      // Successful login is handled by the parent component
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="auth-container">
      <Paper elevation={3} className="auth-paper">
        <Box className="auth-header">
          <LoginIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Login
          </Typography>
        </Box>
        
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            disabled={isLoading}
          />
          
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
          
          <Box className="auth-links">
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link 
                component="button" 
                variant="body2" 
                onClick={onNavigateToRegister}
                disabled={isLoading}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
