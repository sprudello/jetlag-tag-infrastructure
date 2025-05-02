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
  MonetizationOn as CurrencyIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import challengeService from '../services/challengeService';
import apiService from '../services/apiService';
import API_CONFIG from '../config/apiConfig';
import usePenaltyTimer from '../hooks/usePenaltyTimer';
import '../styles/pages/profile.scss';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [challengeStats, setChallengeStats] = useState({ successCount: 0, failedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    activePenalty, 
    penaltyTimeRemaining, 
    loading: penaltyLoading, 
    error: penaltyError 
  } = usePenaltyTimer(currentUser);

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
          
          // Penalty handled by usePenaltyTimer hook
          
          // Fetch challenge statistics
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
          
          // Fetch active challenge
          try {
            // Get challenge details
            const response = await fetch(`${API_CONFIG.BASE_URL}/currentChallenge/${currentUser.userId}`, {
              headers: {
                'Authorization': `Bearer ${currentUser.token}`
              }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch current challenge: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process challenge data
            if (data) {
              setActiveChallenge({
                id: data.challengeCard.id,
                title: data.challengeCard.title,
                description: data.challengeCard.description,
                reward: data.challengeCard.reward,
                isActive: data.challengeCard.isActive,
                startTime: data.startTime,
                userChallengeId: data.id,
                status: data.status
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
  
  // Penalty timer is now handled by usePenaltyTimer hook

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
            
            <Box 
              sx={{ 
                mt: 1, 
                display: 'flex', 
                alignItems: 'center', 
                color: penaltyTimeRemaining ? 'error.main' : 'success.main',
                animation: penaltyTimeRemaining ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 }
                }
              }}
            >
              <TimerIcon color={penaltyTimeRemaining ? "error" : "success"} sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="bold" color={penaltyTimeRemaining ? "error.main" : "success.main"}>
                {penaltyTimeRemaining 
                  ? `Penalty: ${penaltyTimeRemaining.formatted} remaining` 
                  : "User has no penalty"}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Started: {new Date(activeChallenge.startTime).toLocaleString()}
                    </Typography>
                    {activeChallenge.status !== undefined && (
                      <Chip 
                        label={`Status: ${activeChallenge.status === 0 ? 'In Progress' : activeChallenge.status === 1 ? 'Completed' : 'Failed'}`}
                        color={activeChallenge.status === 0 ? 'primary' : activeChallenge.status === 1 ? 'success' : 'error'}
                        size="small"
                      />
                    )}
                  </Box>
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
