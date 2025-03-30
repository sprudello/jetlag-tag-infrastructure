import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import penaltyService from '../../services/penaltyService';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const PenaltyManager = () => {
  const [penalties, setPenalties] = useState([]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPenalty, setEditingPenalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Since there's no specific endpoint to get penalties, we'll use a default value
    // In a real app, you would fetch this from the API
    const fetchPenalty = async () => {
      try {
        setPenalties([
          { id: 1, name: 'Standard Delay', description: 'Standard time penalty', minutes: 30, active: true }
        ]);
      } catch (err) {
        setError('Error loading penalty configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchPenalty();
  }, [currentUser]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minutes: 5,
    active: true
  });
  
  const handleOpenDialog = (penalty = null) => {
    if (penalty) {
      setEditingPenalty(penalty);
      setFormData({
        name: penalty.name,
        description: penalty.description,
        minutes: penalty.minutes,
        active: penalty.active
      });
    } else {
      setEditingPenalty(null);
      setFormData({
        name: '',
        description: '',
        minutes: 5,
        active: true
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'active' ? checked : value
    });
  };
  
  const handleSliderChange = (event, newValue) => {
    setFormData({
      ...formData,
      minutes: newValue
    });
  };
  
  const handleSubmit = async () => {
    // Functionality disabled as the standard penalty cannot be changed
    setNotification({
      open: true,
      message: 'Standard penalty cannot be modified',
      severity: 'info'
    });
    handleCloseDialog();
  };
  
  // Penalty actions are disabled as the standard 30-minute penalty cannot be changed
  const handleDelete = (id) => {
    // Functionality disabled
    setNotification({
      open: true,
      message: 'Standard penalty cannot be deleted',
      severity: 'info'
    });
  };
  
  const handleToggleActive = async (id) => {
    // Functionality disabled
    setNotification({
      open: true,
      message: 'Standard penalty status cannot be changed',
      severity: 'info'
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Penalty Time Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Standard penalty is fixed at 30 minutes
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ p: 3 }}>
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Time (minutes)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {penalties.map((penalty) => (
              <TableRow key={penalty.id}>
                <TableCell>{penalty.id}</TableCell>
                <TableCell>{penalty.name}</TableCell>
                <TableCell>{penalty.description}</TableCell>
                <TableCell>{penalty.minutes}</TableCell>
                <TableCell>
                  {penalty.active ? (
                    <Typography color="primary">Active</Typography>
                  ) : (
                    <Typography color="error">Inactive</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    Standard penalty cannot be modified
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPenalty ? 'Edit Penalty' : 'Add New Penalty'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Penalty Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
              error={!formData.name}
              helperText={!formData.name ? "Name is required" : ""}
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
              required
              error={!formData.description}
              helperText={!formData.description ? "Description is required" : ""}
            />
            <TextField
              name="minutes"
              label="Time (minutes)"
              type="number"
              fullWidth
              value={30}
              disabled
              sx={{ 
                "& .MuiInputBase-input.Mui-disabled": { 
                  WebkitTextFillColor: "rgba(255, 255, 255, 0.3)",
                  bgcolor: "rgba(0, 0, 0, 0.3)" 
                },
                "& .Mui-disabled": {
                  opacity: 0.7
                }
              }}
              helperText="Standard penalty time is fixed at 30 minutes and cannot be changed"
            />
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained" 
            color="primary"
          >
            Close
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

export default PenaltyManager;
