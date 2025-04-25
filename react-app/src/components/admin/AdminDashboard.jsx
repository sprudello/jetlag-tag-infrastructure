import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EmojiEvents as ChallengesIcon,
  ShoppingCart as ShopIcon,
  DirectionsCar as TransportIcon,
  Timer as PenaltyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/apiConfig';
import '../../styles/components/admin/admin-dashboard.scss';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    challenges: null,
    items: null,
    transportations: null,
    penalties: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = API_CONFIG.BASE_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch challenges count
        const challengesResponse = await fetch(`${API_URL}/allChallenges`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        // Fetch items count
        const itemsResponse = await fetch(`${API_URL}/AllItems`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        // Fetch transportations count
        const transportationsResponse = await fetch(`${API_URL}/allTransportationTypes`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (challengesResponse.ok && itemsResponse.ok && transportationsResponse.ok) {
          const challengesData = await challengesResponse.json();
          const itemsData = await itemsResponse.json();
          const transportationsData = await transportationsResponse.json();
          
          setStats({
            challenges: challengesData.length,
            items: itemsData.length,
            transportations: transportationsData.length,
            penalties: 1 // There's typically only one penalty configuration
          });
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.token) {
      fetchStats();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Container maxWidth="lg" className="admin-dashboard">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="admin-dashboard">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography color="error" sx={{ p: 3 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="admin-dashboard">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box className="admin-dashboard__content">
        <Box className="admin-dashboard__overview">
          <Typography variant="h5" gutterBottom>
            Admin Dashboard Overview
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="admin-dashboard__stat-card">
                <ChallengesIcon color="primary" fontSize="large" />
                <Typography variant="h6">Challenges</Typography>
                <Typography variant="h4">{stats.challenges}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="admin-dashboard__stat-card">
                <ShopIcon color="secondary" fontSize="large" />
                <Typography variant="h6">Shop Items</Typography>
                <Typography variant="h4">{stats.items}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="admin-dashboard__stat-card">
                <TransportIcon color="info" fontSize="large" />
                <Typography variant="h6">Transports</Typography>
                <Typography variant="h4">{stats.transportations}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="admin-dashboard__stat-card">
                <PenaltyIcon color="warning" fontSize="large" />
                <Typography variant="h6">Penalties</Typography>
                <Typography variant="h4">{stats.penalties}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
