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
  Paper
} from '@mui/material';
import { 
  ShoppingCart as ShopIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/items.scss';

const Items = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5296';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/AllItems`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setItems(data.filter(item => item.isActive));
        } else {
          setError('Failed to load items');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
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
    <Box className="items-container">
      <Paper elevation={1} className="page-header">
        <ShopIcon color="secondary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">
          Shop Items
        </Typography>
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
                    <Button size="small" color="secondary" variant="contained" fullWidth>
                      Purchase
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Items;
