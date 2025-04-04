import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  ShoppingCart as ShopIcon
} from '@mui/icons-material';
import GameRules from './GameRules';
import { useAuth } from '../contexts/AuthContext';
import itemService from '../services/itemService';
import '../styles/pages/items.scss';

const Items = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await itemService.getAllItems(currentUser?.token);
        setItems(data.filter(item => item.isActive));
      } catch (err) {
        setError('Failed to load items: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.token) {
      fetchItems();
    }
  }, [currentUser]);
  
  const handleBuyItem = async (itemId) => {
    try {
      setLoading(true);
      const purchaseData = {
        userId: currentUser.userId,
        itemId: itemId
      };
      
      const result = await itemService.buyItem(purchaseData, currentUser?.token);
      
      setNotification({
        open: true,
        message: 'Item purchased successfully!',
        severity: 'success'
      });
      
      // Update user currency in UI if needed
      // This would typically be handled by refreshing the user data
      
    } catch (err) {
      setNotification({
        open: true,
        message: `Purchase failed: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

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
    <Box className="items-container">
      <Paper elevation={1} className="page-header">
        <ShopIcon color="secondary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">
          Shop
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <GameRules />
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        {items.length === 0 ? (
          <Typography sx={{ p: 2 }}>
            No items available
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {items.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card className="item-card">
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="card-description">
                      {item.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box className="card-details">
                      <Chip 
                        label={`${item.price} coins`} 
                        color="secondary" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="secondary" 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleBuyItem(item.id)}
                      disabled={loading}
                    >
                      Purchase
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Items;
