import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import itemService from '../../services/itemService';
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
  FlashOn as PowerUpIcon
} from '@mui/icons-material';

const ShopItemManager = () => {
  const [shopItems, setShopItems] = useState([]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null); // 'multiplier', 'veto', 'custom'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await itemService.getAllItems(currentUser?.token);
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          cost: item.price,
          multiplier: null, // API doesn't provide multiplier info
          active: item.isActive
        }));
        setShopItems(formattedData);
      } catch (err) {
        setError('Error loading items: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.token) {
      fetchItems();
    }
  }, [currentUser]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: 0,
    multiplier: null,
    active: true
  });
  
  const handleOpenTypeDialog = () => {
    setOpenTypeDialog(true);
  };
  
  const handleCloseTypeDialog = () => {
    setOpenTypeDialog(false);
  };
  
  // For debugging
  console.log("Dialog states:", { openDialog, openTypeDialog });
  
  const handleSelectItemType = (type) => {
    setSelectedItemType(type);
    
    // Set default values based on type
    if (type === 'multiplier') {
      setFormData({
        name: 'Coin Multiplier',
        description: 'Multiply your challenge rewards',
        cost: 200,
        multiplier: 2,
        active: true
      });
    } else if (type === 'veto') {
      setFormData({
        name: 'Challenge Veto',
        description: 'Skip a challenge without penalty',
        cost: 300,
        multiplier: null,
        active: true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        cost: 0,
        multiplier: null,
        active: true
      });
    }
    
    // Close type dialog and open the main dialog
    setOpenTypeDialog(false);
    setTimeout(() => {
      setOpenDialog(true);
    }, 100); // Small delay to ensure proper rendering
  };
  
  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        cost: item.cost,
        multiplier: item.multiplier || null,
        active: item.active
      });
      setOpenDialog(true);
    } else {
      setEditingItem(null);
      // Directly open the type selection dialog
      setOpenTypeDialog(true);
    }
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
  
  const handleSubmit = async () => {
    try {
      if (editingItem) {
        // Update existing item
        const updateData = {
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.cost),
          isActive: formData.active
        };
        
        await itemService.updateItem(editingItem.id, updateData, currentUser?.token);
        
        setShopItems(shopItems.map(item => 
          item.id === editingItem.id ? { ...item, ...formData } : item
        ));
        
        setNotification({
          open: true,
          message: 'Item updated successfully',
          severity: 'success'
        });
      } else {
        // Add new item
        const createData = {
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.cost),
          isActive: formData.active
        };
        
        const result = await itemService.createItem(createData, currentUser?.token);
        
        const newItem = {
          id: result.id,
          name: result.name,
          description: result.description,
          cost: result.price,
          multiplier: formData.multiplier,
          active: result.isActive
        };
        
        setShopItems([...shopItems, newItem]);
        
        setNotification({
          open: true,
          message: 'Item created successfully',
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
      await itemService.deleteItem(id, currentUser?.token);
      setShopItems(shopItems.filter(item => item.id !== id));
      setNotification({
        open: true,
        message: 'Item deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Error deleting item: ${err.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleToggleActive = async (id) => {
    try {
      const item = shopItems.find(i => i.id === id);
      if (!item) return;
      
      const updateData = {
        name: item.name,
        description: item.description,
        price: item.cost,
        isActive: !item.active
      };
      
      await itemService.updateItem(id, updateData, currentUser?.token);
      
      setShopItems(shopItems.map(item => 
        item.id === id ? { ...item, active: !item.active } : item
      ));
      
      setNotification({
        open: true,
        message: `Item ${!item.active ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Error updating item: ${err.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const renderShopItemsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Multiplier</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shopItems && shopItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.cost} coins</TableCell>
              <TableCell>{item.multiplier ? `${item.multiplier}x` : 'N/A'}</TableCell>
              <TableCell>
                {item.active ? (
                  <Typography color="primary">Active</Typography>
                ) : (
                  <Typography color="error">Inactive</Typography>
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpenDialog(item)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleToggleActive(item.id)} color={item.active ? "success" : "default"}>
                  {item.active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Shop Item Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
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
        renderShopItemsTable()
      )}
      
      <Dialog open={openTypeDialog} onClose={handleCloseTypeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Select Item Type</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" gutterBottom>
              Choose the type of shop item you want to create:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => handleSelectItemType('multiplier')}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '120px',
                  width: '120px'
                }}
              >
                <Typography variant="body1">Coin Multiplier</Typography>
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => handleSelectItemType('veto')}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '120px',
                  width: '120px'
                }}
              >
                <Typography variant="body1">Challenge Veto</Typography>
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => handleSelectItemType('custom')}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '120px',
                  width: '120px'
                }}
              >
                <Typography variant="body1">Custom Item</Typography>
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTypeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Shop Item' : `Add New ${selectedItemType === 'multiplier' ? 'Coin Multiplier' : selectedItemType === 'veto' ? 'Challenge Veto' : 'Custom Item'}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Item Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              disabled={!editingItem && selectedItemType === 'veto'}
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
              name="cost"
              label="Cost (coins)"
              type="number"
              fullWidth
              value={formData.cost}
              onChange={handleInputChange}
              required
              error={formData.cost <= 0}
              helperText={formData.cost <= 0 ? "Cost must be greater than 0" : ""}
            />
            
            {(editingItem ? formData.multiplier !== null : selectedItemType === 'multiplier') && (
              <Box>
                <Typography gutterBottom>
                  Multiplier Value: {formData.multiplier ? formData.multiplier.toFixed(1) : '1.0'}x
                </Typography>
                <Slider
                  name="multiplier"
                  value={formData.multiplier || 1}
                  min={1.0}
                  max={10.0}
                  step={0.5}
                  marks={[
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' },
                    { value: 5, label: '5x' },
                    { value: 10, label: '10x' }
                  ]}
                  onChange={(e, newValue) => setFormData({...formData, multiplier: newValue})}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value.toFixed(1)}x`}
                />
              </Box>
            )}
            
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
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name || !formData.description || formData.cost <= 0}
          >
            {editingItem ? 'Update' : 'Add'}
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

export default ShopItemManager;
