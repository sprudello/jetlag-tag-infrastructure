import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  FormControlLabel
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
  const { currentUser } = useAuth();
  
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
          const formattedData = data.map(transport => ({
            id: transport.id,
            name: transport.name,
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
  
  const handleSubmit = () => {
    if (editingTransport) {
      // Update existing transportation
      setTransportations(transportations.map(transport => 
        transport.id === editingTransport.id ? { ...transport, ...formData } : transport
      ));
    } else {
      // Add new transportation
      const newTransport = {
        id: transportations.length > 0 ? Math.max(...transportations.map(t => t.id)) + 1 : 1,
        ...formData
      };
      setTransportations([...transportations, newTransport]);
    }
    handleCloseDialog();
  };
  
  const handleDelete = (id) => {
    setTransportations(transportations.filter(transport => transport.id !== id));
  };
  
  const handleToggleActive = (id) => {
    setTransportations(transportations.map(transport => 
      transport.id === id ? { ...transport, active: !transport.active } : transport
    ));
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
              <TableCell>Status</TableCell>
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
                <TableCell>
                  {transport.active ? (
                    <Typography color="primary">Active</Typography>
                  ) : (
                    <Typography color="error">Inactive</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(transport)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleToggleActive(transport.id)} color={transport.active ? "success" : "default"}>
                    {transport.active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
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
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleInputChange}
              >
                <MenuItem value="bus">Bus</MenuItem>
                <MenuItem value="train">Train</MenuItem>
                <MenuItem value="bike">Bike</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="baseTime"
              label="Base Time (minutes)"
              type="number"
              fullWidth
              value={1}
              disabled
              helperText="Base time is fixed at 1 minute"
            />
            <TextField
              name="baseCost"
              label="Base Cost (coins)"
              type="number"
              fullWidth
              value={formData.baseCost}
              onChange={handleInputChange}
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
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTransport ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransportationManager;
