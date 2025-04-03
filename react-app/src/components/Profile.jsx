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
import challengeService from '../services/challengeService';
import apiService from '../services/apiService';
import API_CONFIG from '../config/apiConfig';
import '../styles/pages/profile.scss';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [challengeStats, setChallengeStats] = useState({ successCount: 0, failedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userItems, setUserItems] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  
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
          
          // Fetch user's active challenge
          try {
            // Use the new endpoint that returns challenge details directly
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/UserChallenges/currentChallenge/${currentUser.userId}`, {
              headers: {
                'Authorization': `Bearer ${currentUser.token}`
              }
            });
            
            // If we get a 404, try the alternative endpoint format
            if (response.status === 404) {
              console.log("Trying alternative endpoint format...");
              const altResponse = await fetch(`${API_CONFIG.BASE_URL}/UserChallenges/currentChallenge/${currentUser.userId}`, {
                headers: {
                  'Authorization': `Bearer ${currentUser.token}`
                }
              });
              
              if (altResponse.ok) {
                return altResponse;
              }
            }
            
            if (!response.ok) {
              throw new Error(`Failed to fetch current challenge: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.activeChallenge) {
              // The challenge details are already included in the response
              setActiveChallenge({
                id: data.activeChallenge.card.id,
                title: data.activeChallenge.card.title,
                description: data.activeChallenge.card.description,
                reward: data.activeChallenge.card.reward,
                isActive: data.activeChallenge.card.isActive,
                startTime: data.activeChallenge.startTime,
                userChallengeId: data.activeChallenge.id
              });
            }
          } catch (challengeErr) {
            console.error('Error fetching active challenge:', challengeErr);
          }
          
          // Fetch user's purchased items
          try {
            // In a real app, you would fetch all user items from a dedicated endpoint
            // For now, we'll simulate user-specific purchased items based on user ID
            const userId = currentUser.userId || 0;
            const userSpecificItems = [];
            
            // Only add items if they "belong" to this user (based on user ID)
            if (userId % 2 === 0) { // Even user IDs get multiplier
              userSpecificItems.push({ 
                id: 1, 
                name: "2x Multiplier", 
                description: "Doubles your challenge rewards", 
                purchaseDate: new Date().toISOString(),
                userId: userId
              });
            }
            
            if (userId % 3 === 0) { // User IDs divisible by 3 get veto
              userSpecificItems.push({ 
                id: 2, 
                name: "Challenge Veto", 
                description: "Skip a challenge without penalty", 
                purchaseDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                userId: userId
              });
            }
            
            setUserItems(userSpecificItems);
          } catch (itemsErr) {
            console.error('Error fetching user items:', itemsErr);
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
                  <Typography variant="h4">{userItems.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Purchased
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {activeChallenge && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Active Challenge
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6">{activeChallenge.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeChallenge.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Chip 
                    label={`${activeChallenge.reward} coins`} 
                    color="primary" 
                    size="small" 
                  />
                  <Typography variant="body2" color="text.secondary">
                    Started: {new Date(activeChallenge.startTime).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
        
        {userItems.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Items
            </Typography>
            <Grid container spacing={2}>
              {userItems.map(item => (
                <Grid item xs={12} sm={6} key={item.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Profile;
