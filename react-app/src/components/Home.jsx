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
  CircularProgress
} from '@mui/material';
import { 
  EmojiEvents as ChallengeIcon,
  DirectionsCar as TransportIcon,
  ShoppingCart as ShopIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/home.scss';

const Home = () => {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState({
    challenges: true,
    transportations: true,
    shopItems: true
  });
  const [error, setError] = useState({
    challenges: null,
    transportations: null,
    shopItems: null
  });

  const API_URL = 'http://localhost:5296';

  useEffect(() => {
    const fetchData = async () => {
      // Fetch challenges
      try {
        const challengesResponse = await fetch(`${API_URL}/allChallenges`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (challengesResponse.ok) {
          const data = await challengesResponse.json();
          setChallenges(data.filter(challenge => challenge.isActive).slice(0, 3));
        } else {
          setError(prev => ({ ...prev, challenges: 'Failed to load challenges' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, challenges: 'Error connecting to server' }));
      } finally {
        setLoading(prev => ({ ...prev, challenges: false }));
      }

      // Fetch transportations
      try {
        const transportationsResponse = await fetch(`${API_URL}/allTransportationTypes`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (transportationsResponse.ok) {
          const data = await transportationsResponse.json();
          setTransportations(data.filter(transport => transport.isActive).slice(0, 3));
        } else {
          setError(prev => ({ ...prev, transportations: 'Failed to load transportations' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, transportations: 'Error connecting to server' }));
      } finally {
        setLoading(prev => ({ ...prev, transportations: false }));
      }

      // Fetch shop items
      try {
        const shopItemsResponse = await fetch(`${API_URL}/AllItems`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (shopItemsResponse.ok) {
          const data = await shopItemsResponse.json();
          setShopItems(data.filter(item => item.isActive).slice(0, 3));
        } else {
          setError(prev => ({ ...prev, shopItems: 'Failed to load shop items' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, shopItems: 'Error connecting to server' }));
      } finally {
        setLoading(prev => ({ ...prev, shopItems: false }));
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
          No {title.toLowerCase()} available
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

  return (
    <Box className="home-container">
      <Box className="welcome-section">
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {currentUser?.username || 'User'}!
        </Typography>
        <Typography variant="body1">
          Ready for your next challenge? Check out what's available below.
        </Typography>
      </Box>

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
