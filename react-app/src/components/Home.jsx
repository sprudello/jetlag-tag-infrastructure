import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  EmojiEvents as ChallengeIcon,
  DirectionsCar as TransportIcon,
  ShoppingCart as ShopIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import challengeService from '../services/challengeService';
import transportationService from '../services/transportationService';
import itemService from '../services/itemService';
import apiService from '../services/apiService';
import API_CONFIG from '../config/apiConfig';
import '../styles/pages/home.scss';

const Home = () => {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState({
    challenges: true,
    transportations: true,
    shopItems: true,
    userItems: true
  });
  const [error, setError] = useState({
    challenges: null,
    transportations: null,
    shopItems: null,
    userItems: null
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.token) return;
      
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
          setChallenges([{
            id: data.activeChallenge.card.id,
            title: data.activeChallenge.card.title,
            description: data.activeChallenge.card.description,
            reward: data.activeChallenge.card.reward,
            isActive: data.activeChallenge.card.isActive,
            isUserActive: true,
            startTime: data.activeChallenge.startTime,
            userChallengeId: data.activeChallenge.id
          }]);
        } else {
          setChallenges([]);
        }
      } catch (err) {
        console.error("Error fetching active challenge:", err);
        setError(prev => ({ ...prev, challenges: 'Failed to load active challenge: ' + err.message }));
      } finally {
        setLoading(prev => ({ ...prev, challenges: false }));
      }

      // Fetch user's purchased items
      try {
        // In a real app, you would fetch all user items from a dedicated endpoint
        // For now, we'll simulate user-specific purchased items based on user ID
        // This ensures different users see different items
        const userId = currentUser.userId || 0;
        
        // Generate user-specific items based on user ID
        const userSpecificItems = [];
        
        // Only add items if they "belong" to this user (based on user ID)
        if (userId % 2 === 0) { // Even user IDs get multiplier
          userSpecificItems.push({ 
            id: 1, 
            name: "2x Multiplier", 
            description: "Doubles your challenge rewards", 
            price: 200, 
            isActive: true,
            userId: userId
          });
        }
        
        if (userId % 3 === 0) { // User IDs divisible by 3 get veto
          userSpecificItems.push({ 
            id: 2, 
            name: "Challenge Veto", 
            description: "Skip a challenge without penalty", 
            price: 300, 
            isActive: true,
            userId: userId
          });
        }
        
        setUserItems(userSpecificItems);
      } catch (err) {
        setError(prev => ({ ...prev, userItems: 'Failed to load user items: ' + err.message }));
      } finally {
        setLoading(prev => ({ ...prev, userItems: false }));
      }
      
      // We no longer need to fetch shop items for preview
      // Instead, we'll just show all user's purchased items
    };

    fetchData();
  }, [currentUser]);

  const renderSection = (title, icon, items, loadingState, errorState, itemRenderer) => (
    <Box className="home-section">
      <Box className="section-header">
        {icon}
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      
      {loadingState ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : errorState ? (
        <Typography color="error" sx={{ p: 2 }}>
          {errorState}
        </Typography>
      ) : items.length === 0 ? (
        <Typography sx={{ p: 2 }}>
          No active {title.toLowerCase()}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map(item => itemRenderer(item))}
        </Grid>
      )}
    </Box>
  );

  const renderChallengeItem = (challenge) => (
    <Grid item xs={12} md={4} key={challenge.id}>
      <Card className="item-card challenge-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {challenge.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {challenge.description}
          </Typography>
          <Chip 
            label={`${challenge.reward} coins`} 
            color="primary" 
            size="small" 
            sx={{ mt: 2 }} 
          />
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            View Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderTransportationItem = (transportation) => (
    <Grid item xs={12} md={4} key={transportation.id}>
      <Card className="item-card transportation-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {transportation.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {transportation.description}
          </Typography>
          <Chip 
            label={`${transportation.pricePerMinute} coins/min`} 
            color="primary" 
            size="small" 
            sx={{ mt: 2 }} 
          />
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            View Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderShopItem = (item) => (
    <Grid item xs={12} md={4} key={item.id}>
      <Card className="item-card shop-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {item.description}
          </Typography>
          <Chip 
            label={`${item.price} coins`} 
            color="secondary" 
            size="small" 
            sx={{ mt: 2 }} 
          />
        </CardContent>
        <CardActions>
          <Button size="small" color="secondary">
            Buy
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderUserItemItem = (item) => (
    <Grid item xs={12} md={4} key={item.id}>
      <Card className="item-card user-item-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {item.description}
          </Typography>
          <Chip 
            label="Owned" 
            color="success" 
            size="small" 
            sx={{ mt: 2 }} 
          />
        </CardContent>
        <CardActions>
          <Button size="small" color="success">
            Use Item
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box className="home-container">
      <Paper elevation={2} className="welcome-section">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: currentUser?.isAdmin ? 'secondary.main' : 'primary.main',
              fontSize: '1.5rem'
            }}
          >
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {currentUser?.username || 'User'}!
            </Typography>
            <Typography variant="body1">
              Here's an overview of your current activity.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box className="home-section">
        <Box className="section-header">
          <ChallengeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            Your Active Challenge
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        
        {loading.challenges ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error.challenges ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error.challenges}
          </Typography>
        ) : challenges.length === 0 ? (
          <Typography sx={{ p: 2 }}>
            No challenge accepted. Visit the Challenges tab to accept one!
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {challenges.map(challenge => renderChallengeItem(challenge))}
          </Grid>
        )}
      </Box>

      {/* We've moved the Purchased Items section to replace the Shop Preview */}

      {renderSection(
        "Purchased Items", 
        <InventoryIcon color="secondary" sx={{ mr: 1 }} />, 
        userItems, 
        loading.userItems, 
        error.userItems, 
        renderUserItemItem
      )}
    </Box>
  );
};

export default Home;
