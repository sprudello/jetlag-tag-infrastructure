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
  DirectionsCar as TransportIcon,
  DirectionsBus as BusIcon,
  Train as TrainIcon,
  DirectionsBike as BikeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/transportations.scss';

const Transportations = () => {
  const { currentUser } = useAuth();
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = 'http://localhost:5296';

  useEffect(() => {
    const fetchTransportations = async () => {
      try {
        const response = await fetch(`${API_URL}/allTransportationTypes`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTransportations(data.filter(transport => transport.isActive));
        } else {
          setError('Failed to load transportations');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchTransportations();
  }, [currentUser]);

  const getTransportIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'bus': return <BusIcon fontSize="large" />;
      case 'train': return <TrainIcon fontSize="large" />;
      case 'bike': return <BikeIcon fontSize="large" />;
      default: return <TransportIcon fontSize="large" />;
    }
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
    <Box className="transportations-container">
      <Paper elevation={1} className="page-header">
        <TransportIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">
          Available Transportations
        </Typography>
      </Paper>

      <Box sx={{ mt: 4 }}>
        {transportations.length === 0 ? (
          <Typography sx={{ p: 2 }}>
            No transportations available
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {transportations.map(transport => (
              <Grid item xs={12} sm={6} md={4} key={transport.id}>
                <Card className="transportation-card">
                  <CardContent>
                    <Box className="card-icon">
                      {getTransportIcon(transport.name)}
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {transport.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="card-description">
                      {transport.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box className="card-details">
                      <Chip 
                        label={`${transport.pricePerMinute} coins/min`} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" variant="contained" fullWidth>
                      Use Transportation
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

export default Transportations;
