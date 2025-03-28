import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Divider
} from '@mui/material';
import { 
  AccountCircle as AccountIcon,
  MonetizationOn as CurrencyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/profile.scss';

const AdminProfile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setUserData({
        username: currentUser.username || 'Admin',
        currency: currentUser.currency || 0,
        isAdmin: true
      });
    }
  }, [currentUser]);

  return (
    <Box className="profile-container">
      <Paper elevation={3} className="profile-paper">
        <Box className="profile-header">
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'secondary.main',
              fontSize: '3rem'
            }}
          >
            {userData?.username?.charAt(0).toUpperCase() || <AccountIcon fontSize="large" />}
          </Avatar>
          <Box className="profile-info">
            <Typography variant="h4" component="h1">
              {userData?.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Administrator
            </Typography>
            <Box className="currency-display">
              <CurrencyIcon sx={{ color: 'gold' }} />
              <Typography variant="h6">
                {userData?.currency} coins
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box className="profile-info" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1">
            Manage users, challenges, items, and system settings.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminProfile;
