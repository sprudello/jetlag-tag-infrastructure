import { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Tabs, 
  Tab,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EmojiEvents as ChallengesIcon,
  ShoppingCart as ShopIcon,
  DirectionsCar as TransportIcon,
  Timer as PenaltyIcon
} from '@mui/icons-material';
import ChallengeManager from './ChallengeManager';
import ShopItemManager from './ShopItemManager';
import TransportationManager from './TransportationManager';
import PenaltyManager from './PenaltyManager';
import '../../styles/components/admin/admin-dashboard.scss';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return (
          <Box className="admin-dashboard__overview">
            <Typography variant="h5" gutterBottom>
              Admin Dashboard Overview
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="admin-dashboard__stat-card">
                  <ChallengesIcon color="primary" fontSize="large" />
                  <Typography variant="h6">Challenges</Typography>
                  <Typography variant="h4">12</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="admin-dashboard__stat-card">
                  <ShopIcon color="secondary" fontSize="large" />
                  <Typography variant="h6">Shop Items</Typography>
                  <Typography variant="h4">24</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="admin-dashboard__stat-card">
                  <TransportIcon color="info" fontSize="large" />
                  <Typography variant="h6">Transports</Typography>
                  <Typography variant="h4">8</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="admin-dashboard__stat-card">
                  <PenaltyIcon color="warning" fontSize="large" />
                  <Typography variant="h6">Penalties</Typography>
                  <Typography variant="h4">5</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case 1: // Challenges
        return <ChallengeManager />;
      case 2: // Shop Items
        return <ShopItemManager />;
      case 3: // Transportation
        return <TransportationManager />;
      case 4: // Penalty
        return <PenaltyManager />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" className="admin-dashboard">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="admin dashboard tabs"
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<ChallengesIcon />} label="Challenges" />
          <Tab icon={<ShopIcon />} label="Shop Items" />
          <Tab icon={<TransportIcon />} label="Transportation" />
          <Tab icon={<PenaltyIcon />} label="Penalty Time" />
        </Tabs>
      </Box>
      
      <Box className="admin-dashboard__content">
        {renderTabContent()}
      </Box>
    </Container>
  );
};

export default AdminDashboard;
