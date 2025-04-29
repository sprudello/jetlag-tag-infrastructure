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
import '../styles/pages/profile.scss';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [challengeStats, setChallengeStats] = useState({ successCount: 0, failedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePenalty, setActivePenalty] = useState(null);
  const [penaltyTimeRemaining, setPenaltyTimeRemaining] = useState(null);

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
          
          // Check for active penalty in localStorage first
          const storedPenalty = localStorage.getItem(`penalty_${currentUser.userId}`);
          if (storedPenalty) {
            try {
              const penaltyData = JSON.parse(storedPenalty);
              const endTime = new Date(penaltyData.endTime);
          
              // Only set the penalty if it hasn't expired yet
              if (endTime > new Date()) {
                setActivePenalty({
                  endTime: endTime,
                  durationInMinutes: penaltyData.durationInMinutes
                });
              } else {
                // Clear expired penalty
                localStorage.removeItem(`penalty_${currentUser.userId}`);
              }
            } catch (e) {
              console.error("Error parsing stored penalty:", e);
            }
          }
      
          // If no local penalty, check the API
          if (!activePenalty) {
            try {
              const penaltyResponse = await fetch(`${API_CONFIG.BASE_URL}/GetUserPenalty/${currentUser.userId}`, {
                headers: {
                  'Authorization': `Bearer ${currentUser.token}`
                }
              });
          
              if (penaltyResponse.ok) {
                const penaltyData = await penaltyResponse.json();
                const penalty = {
                  endTime: new Date(penaltyData.endTime),
                  durationInMinutes: penaltyData.durationInMinutes
                };
                setActivePenalty(penalty);
            
                // Store in localStorage for persistence
                localStorage.setItem(`penalty_${currentUser.userId}`, JSON.stringify(penalty));
              }
            } catch (penaltyErr) {
              // 404 is expected if no penalty exists
              if (!penaltyErr.message.includes('404')) {
                console.error('Error fetching active penalty:', penaltyErr);
              }
            }
          }
          
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
            // Use the endpoint that returns challenge details directly
            const response = await fetch(`${API_CONFIG.BASE_URL}/UserChallenges/currentChallenge/${currentUser.userId}`, {
              headers: {
                'Authorization': `Bearer ${currentUser.token}`
              }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch current challenge: ${response.status}`);
            }
            
            const data = await response.json();
            
            // The backend returns the UserChallenge object directly
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
  
  // Update penalty timer
  useEffect(() => {
    if (!activePenalty) {
      setPenaltyTimeRemaining(null);
      return;
    }
    
    const updateRemainingTime = () => {
      const now = new Date();
      const endTime = new Date(activePenalty.endTime);
      const diffMs = endTime - now;
      
      if (diffMs <= 0) {
        // Penalty has expired
        setActivePenalty(null);
        setPenaltyTimeRemaining(null);
        
        // Clear from localStorage when expired
        localStorage.removeItem(`penalty_${currentUser?.userId}`);
        return;
      }
      
      // Calculate remaining time in minutes and seconds
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffSeconds = Math.floor((diffMs % 60000) / 1000);
      
      setPenaltyTimeRemaining({
        minutes: diffMinutes,
        seconds: diffSeconds,
        total: diffMs
      });
    };
    
    // Update immediately
    updateRemainingTime();
    
    // Then update every second
    const timerId = setInterval(updateRemainingTime, 1000);
    
    return () => clearInterval(timerId);
  }, [activePenalty, currentUser]);

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
            
            {penaltyTimeRemaining && (
              <Box 
                sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'error.main',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.7 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.7 }
                  }
                }}
              >
                <TimerIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body1" fontWeight="bold" color="error.main">
                  Penalty: {penaltyTimeRemaining.minutes}:{penaltyTimeRemaining.seconds.toString().padStart(2, '0')} remaining
                </Typography>
              </Box>
            )}
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
