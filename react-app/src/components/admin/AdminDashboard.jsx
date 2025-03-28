import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EmojiEvents as ChallengesIcon,
  ShoppingCart as ShopIcon,
  DirectionsCar as TransportIcon,
  Timer as PenaltyIcon
} from '@mui/icons-material';
import '../../styles/components/admin/admin-dashboard.scss';

const AdminDashboard = () => {
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
      </Box>
    </Container>
  );
};

export default AdminDashboard;
