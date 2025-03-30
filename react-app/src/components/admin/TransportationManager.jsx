import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import transportationService from '../../services/transportationService';
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
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DirectionsBus as BusIcon,
  Train as TrainIcon,
  LocalTaxi as TaxiIcon,
  DirectionsBike as BikeIcon,
  DirectionsWalk as WalkIcon
} from '@mui/icons-material';

const TransportationManager = () => {
  const [transportations, setTransportations] = useState([]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchTransportations = async () => {
      try {
        const data = await transportationService.getAllTransportationTypes(currentUser?.token);
        const formattedData = data.map(transport => ({
          id: transport.id,
          name: transport.name,
          description: transport.description,
          type: transport.name.toLowerCase().includes('bus') ? 'bus' : 
                transport.name.toLowerCase().includes('train') ? 'train' : 
                transport.name.toLowerCase().includes('bike') ? 'bike' : 'bus',
          baseTime: 1,
          baseCost: transport.pricePerMinute,
          icon: transport.name.toLowerCase().includes('bus') ? 'bus' : 
                transport.name.toLowerCase().includes('train') ? 'train' : 
                transport.name.toLowerCase().includes('bike') ? 'bike' : 'bus',
          active: transport.isActive
        }));
        setTransportations(formattedData);
      } catch (err) {
        setError('Error loading transportations: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.token) {
      fetchTransportations();
    }
  }, [currentUser]);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'bus',
    baseTime: 30,
    baseCost: 10,
    icon: 'bus',
    active: true
  });
  
  const getTransportIcon = (iconType) => {
    switch (iconType) {
      case 'bus': return <BusIcon />;
      case 'train': return <TrainIcon />;
      case 'taxi': return <TaxiIcon />;
      case 'bike': return <BikeIcon />;
      case 'walk': return <WalkIcon />;
      default: return <BusIcon />;
    }
  };
  
  const handleOpenDialog = (transport = null) => {
    if (transport) {
      setEditingTransport(transport);
      setFormData({
        name: transport.name,
        type: transport.type,
        baseTime: transport.baseTime,
        baseCost: transport.baseCost,
        icon: transport.icon,
        active: transport.active
      });
    } else {
      setEditingTransport(null);
      setFormData({
        name: '',
        type: 'bus',
        baseTime: 1,
        baseCost: 10,
        icon: 'bus',
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
    
    // Auto-update icon when type changes
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        icon: value
      }));
    }
  };
  
  const handleSubmit = async () => {
    try {
      if (editingTransport) {
        // Update existing transportation
        const updateData = {
          name: formData.name,
          description: formData.description || `${formData.name} transportation service`,
          pricePerMinute: parseInt(formData.baseCost),
          isActive: formData.active
        };
        
        await transportationService.updateTransportationType(editingTransport.id, updateData, currentUser?.token);
        
        setTransportations(transportations.map(transport => 
          transport.id === editingTransport.id ? { 
            ...transport, 
            name: formData.name,
            description: formData.description || `${formData.name} transportation service`,
            type: formData.type,
            baseCost: formData.baseCost,
            icon: formData.icon,
            active: formData.active
          } : transport
        ));
        
        setNotification({
          open: true,
          message: 'Transportation updated successfully',
          severity: 'success'
        });
      } else {
        // Add new transportation
        const createData = {
          name: formData.name,
          description: formData.description || `${formData.name} transportation service`,
          pricePerMinute: parseInt(formData.baseCost),
          isActive: formData.active
        };
        
        const result = await transportationService.createTransportationType(createData, currentUser?.token);
        
        const newTransport = {
          id: result.id,
          name: result.name,
          description: result.description,
          type: formData.type,
          baseTime: 1,
          baseCost: result.pricePerMinute,
          icon: formData.icon,
          active: result.isActive
        };
        
        setTransportations([...transportations, newTransport]);
        
        setNotification({
          open: true,
          message: 'Transportation created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (err) {
      setNotification({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await transportationService.deleteTransportationType(id, currentUser?.token);
      setTransportations(transportations.filter(transport => transport.id !== id));
      setNotification({
        open: true,
        message: 'Transportation deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Error deleting transportation: ${err.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleToggleActive = async (id) => {
    try {
      const transport = transportations.find(t => t.id === id);
      if (!transport) return;
      
      const updateData = {
        name: transport.name,
        description: transport.description || `${transport.name} transportation service`,
        pricePerMinute: transport.baseCost,
        isActive: !transport.active
      };
      
      await transportationService.updateTransportationType(id, updateData, currentUser?.token);
      
      setTransportations(transportations.map(transport => 
        transport.id === id ? { ...transport, active: !transport.active } : transport
      ));
      
      setNotification({
        open: true,
        message: `Transportation ${!transport.active ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Error updating transportation: ${err.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Transportation Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Transportation
        </Button>
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
              <TableCell>Icon</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Base Time (min)</TableCell>
              <TableCell>Base Cost</TableCell>
              {/* Status column removed */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transportations.map((transport) => (
              <TableRow key={transport.id}>
                <TableCell>{transport.id}</TableCell>
                <TableCell>{getTransportIcon(transport.icon)}</TableCell>
                <TableCell>{transport.name}</TableCell>
                <TableCell>{transport.type}</TableCell>
                <TableCell>{transport.baseTime}</TableCell>
                <TableCell>{transport.baseCost} coins</TableCell>
                {/* Status cell removed */}
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(transport)} color="primary">
                    <EditIcon />
                  </IconButton>
                  {/* Toggle active button removed */}
                  <IconButton onClick={() => handleDelete(transport.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTransport ? 'Edit Transportation' : 'Add New Transportation'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Transportation Name"
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
              value={formData.description || `${formData.name || ''} transportation service`}
              onChange={handleInputChange}
            />
            {/* Type selection removed as requested */}
            <TextField
              name="baseTime"
              label="Base Time (minutes)"
              type="number"
              fullWidth
              value={1}
              disabled
              sx={{ 
                "& .MuiInputBase-input.Mui-disabled": { 
                  WebkitTextFillColor: "rgba(255, 255, 255, 0.3)",
                  bgcolor: "rgba(0, 0, 0, 0.2)" 
                }
              }}
              helperText="Base time is fixed at 1 minute"
            />
            <TextField
              name="baseCost"
              label="Base Cost (coins)"
              type="number"
              fullWidth
              value={formData.baseCost}
              onChange={handleInputChange}
              required
              error={formData.baseCost <= 0}
              helperText={formData.baseCost <= 0 ? "Cost must be greater than 0" : ""}
            />
            {/* Active switch removed */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name || formData.baseCost <= 0}
          >
            {editingTransport ? 'Update' : 'Add'}
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

export default TransportationManager;
