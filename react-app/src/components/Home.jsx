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
      
      // Fetch challenges
      try {
        const data = await challengeService.getAllChallenges(currentUser?.token);
        // Make sure we're only showing active challenges
        const activeData = data.filter(challenge => challenge.isActive === true);
        setChallenges(activeData.slice(0, 3));
      } catch (err) {
        setError(prev => ({ ...prev, challenges: 'Failed to load challenges: ' + err.message }));
      } finally {
        setLoading(prev => ({ ...prev, challenges: false }));
      }

      // Fetch transportations
      try {
        const data = await transportationService.getAllTransportationTypes(currentUser?.token);
        setTransportations(data.filter(transport => transport.isActive).slice(0, 3));
      } catch (err) {
        setError(prev => ({ ...prev, transportations: 'Failed to load transportations: ' + err.message }));
      } finally {
        setLoading(prev => ({ ...prev, transportations: false }));
      }

      // Fetch shop items
      try {
        const data = await itemService.getAllItems(currentUser?.token);
        setShopItems(data.filter(item => item.isActive).slice(0, 3));
      } catch (err) {
        setError(prev => ({ ...prev, shopItems: 'Failed to load shop items: ' + err.message }));
      } finally {
        setLoading(prev => ({ ...prev, shopItems: false }));
      }
      
      // Fetch user's owned items
      try {
        // For demonstration, we'll fetch a specific item by ID
        // In a real app, you would fetch all user items from a dedicated endpoint
        const itemId = 1; // Example item ID
        const item = await itemService.getItemById(itemId, currentUser?.token);
        if (item) {
          setUserItems([item]);
        }
      } catch (err) {
        setError(prev => ({ ...prev, userItems: 'Failed to load user items: ' + err.message }));
      } finally {
        setLoading(prev => ({ ...prev, userItems: false }));
      }
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
              Ready for your next challenge? Check out what's available below.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {userItems.length > 0 && renderSection(
        "Your Items", 
        <InventoryIcon color="success" sx={{ mr: 1 }} />, 
        userItems, 
        loading.userItems, 
        error.userItems, 
        renderUserItemItem
      )}

      {renderSection(
        "Active Challenges", 
        <ChallengeIcon color="primary" sx={{ mr: 1 }} />, 
        challenges, 
        loading.challenges, 
        error.challenges, 
        renderChallengeItem
      )}

      {renderSection(
        "Available Transportations", 
        <TransportIcon color="primary" sx={{ mr: 1 }} />, 
        transportations, 
        loading.transportations, 
        error.transportations, 
        renderTransportationItem
      )}

      {renderSection(
        "Shop Items", 
        <ShopIcon color="secondary" sx={{ mr: 1 }} />, 
        shopItems, 
        loading.shopItems, 
        error.shopItems, 
        renderShopItem
      )}
    </Box>
  );
};

export default Home;
