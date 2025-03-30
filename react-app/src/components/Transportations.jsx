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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  DirectionsCar as TransportIcon,
  DirectionsBus as BusIcon,
  Train as TrainIcon,
  DirectionsBike as BikeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import transportationService from '../services/transportationService';
import '../styles/pages/transportations.scss';

const Transportations = () => {
  const { currentUser } = useAuth();
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [duration, setDuration] = useState(10); // Default 10 minutes
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchTransportations = async () => {
      try {
        const data = await transportationService.getAllTransportationTypes(currentUser?.token);
        setTransportations(data.filter(transport => transport.isActive));
      } catch (err) {
        setError('Failed to load transportations: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.token) {
      fetchTransportations();
    }
  }, [currentUser]);
  
  const handleUseTransportation = (transport) => {
    setSelectedTransport(transport);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleDurationChange = (event, newValue) => {
    setDuration(newValue);
  };
  
  const handlePurchaseTransportation = async () => {
    try {
      setLoading(true);
      
      const purchaseData = {
        userId: currentUser.userId,
        transportationTypeId: selectedTransport.id,
        durationInMinutes: duration
      };
      
      await transportationService.purchaseTransportation(purchaseData, currentUser?.token);
      
      setNotification({
        open: true,
        message: `Transportation purchased for ${duration} minutes!`,
        severity: 'success'
      });
      
      setOpenDialog(false);
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
                    <Button 
                      size="small" 
                      color="primary" 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleUseTransportation(transport)}
                      disabled={loading}
                    >
                      Use Transportation
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {/* Transportation Purchase Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="transport-dialog-title"
      >
        <DialogTitle id="transport-dialog-title">
          Purchase {selectedTransport?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <Typography variant="subtitle1" gutterBottom>
              Price: {selectedTransport?.pricePerMinute} coins per minute
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography id="duration-slider" gutterBottom>
                Duration (minutes): {duration}
              </Typography>
              <Slider
                value={duration}
                onChange={handleDurationChange}
                aria-labelledby="duration-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={5}
                max={60}
              />
            </Box>
            
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total Cost: {selectedTransport ? selectedTransport.pricePerMinute * duration : 0} coins
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handlePurchaseTransportation} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            Purchase
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default Transportations;
