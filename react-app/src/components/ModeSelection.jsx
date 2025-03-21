import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container,
  Grid,
  Avatar
} from '@mui/material';
import { 
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import '../styles/components/mode-selection.scss';

const ModeSelection = ({ onSelectMode }) => {
  const [previousMode, setPreviousMode] = useState(null);
  
  useEffect(() => {
    // Check if there was a previous mode
    const savedMode = localStorage.getItem('appMode');
    if (savedMode) {
      setPreviousMode(savedMode);
    }
  }, []);
  
  const handleClearMode = () => {
    localStorage.removeItem('appMode');
    setPreviousMode(null);
  };
  
  return (
    <Container maxWidth="md" className="mode-selection">
      <Paper elevation={3} className="mode-selection__paper">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Welcome to Challenge Game
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Please select your view mode to continue
        </Typography>
        
        <Grid container spacing={4} className="mode-selection__options">
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              className="mode-selection__option"
              onClick={() => onSelectMode('user')}
            >
              <Avatar className="mode-selection__avatar user">
                <UserIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                User Mode
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Play challenges, earn coins, and use the shop
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              className="mode-selection__option"
              onClick={() => onSelectMode('admin')}
            >
              <Avatar className="mode-selection__avatar admin">
                <AdminIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Admin Mode
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage challenges, shop items, and game settings
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {previousMode && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={handleClearMode}
              variant="outlined"
              color="secondary"
            >
              Clear Saved Mode
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Previous mode: {previousMode === 'admin' ? 'Admin' : 'User'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ModeSelection;
