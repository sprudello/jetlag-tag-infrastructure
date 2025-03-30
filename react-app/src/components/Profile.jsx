import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  AccountCircle as AccountIcon,
  EmojiEvents as ChallengeIcon,
  DirectionsCar as TransportIcon,
  ShoppingCart as ShopIcon,
  MonetizationOn as CurrencyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import '../styles/pages/profile.scss';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [challengeStats, setChallengeStats] = useState({ successCount: 0, failedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser?.token) {
          // Get user data from API
          const user = await userService.getUserById(currentUser.userId, currentUser.token);
          
          setUserData({
            username: user.username,
            currency: user.currency,
            isAdmin: user.isAdmin
          });
          
          // Get challenge statistics
          try {
            const stats = await userService.getChallengeCounts(currentUser.userId, currentUser.token);
            setChallengeStats({
              successCount: stats.successCount,
              failedCount: stats.failedCount
            });
          } catch (statsErr) {
            console.error('Error fetching challenge stats:', statsErr);
            // Continue with default values if stats fetch fails
          }
        } else {
          setUserData({
            username: 'User',
            currency: 0,
            isAdmin: false
          });
        }
      } catch (err) {
        setError('Failed to load user data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 3 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box className="profile-container">
      <Paper elevation={3} className="profile-paper">
        <Box className="profile-header">
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: userData?.isAdmin ? 'secondary.main' : 'primary.main',
              fontSize: '3rem'
            }}
          >
            {userData?.username?.charAt(0).toUpperCase() || <AccountIcon fontSize="large" />}
          </Avatar>
          <Box className="profile-info">
            <Typography variant="h4" component="h1">
              {userData?.username}
            </Typography>
            {userData?.isAdmin && (
              <Chip 
                label="Admin" 
                color="secondary" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
            <Box className="currency-display">
              <CurrencyIcon sx={{ color: 'gold' }} />
              <Typography variant="h6">
                {userData?.currency} coins
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box className="profile-stats">
          <Typography variant="h5" component="h2" gutterBottom>
            Your Stats
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card className="stat-card">
                <CardContent>
                  <ChallengeIcon color="primary" fontSize="large" />
                  <Typography variant="h6">Challenges</Typography>
                  <Typography variant="h4">{challengeStats.successCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card className="stat-card">
                <CardContent>
                  <ChallengeIcon color="error" fontSize="large" />
                  <Typography variant="h6">Challenges</Typography>
                  <Typography variant="h4">{challengeStats.failedCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card className="stat-card">
                <CardContent>
                  <ShopIcon color="success" fontSize="large" />
                  <Typography variant="h6">Items</Typography>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Purchased
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
