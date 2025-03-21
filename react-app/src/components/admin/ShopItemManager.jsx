import { useState } from 'react';
import {
  Box,
  Typography,
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
  Slider
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
  const [shopItems, setShopItems] = useState([
    { id: 1, name: 'Coin Doubler', description: 'Double your challenge rewards', cost: 200, multiplier: 2, active: true },
    { id: 2, name: 'Triple Boost', description: 'Triple your challenge rewards', cost: 500, multiplier: 3, active: true },
    { id: 3, name: 'Quadruple Power', description: 'Quadruple your challenge rewards', cost: 800, multiplier: 4, active: true },
    { id: 4, name: 'Challenge Veto', description: 'Skip a challenge without penalty', cost: 300, multiplier: null, active: true }
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null); // 'multiplier', 'veto', 'custom'
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
  
  const handleSubmit = () => {
    if (editingItem) {
      // Update existing item
      setShopItems(shopItems.map(item => 
        item.id === editingItem.id ? { ...item, ...formData } : item
      ));
    } else {
      // Add new item
      const newItem = {
        id: shopItems.length > 0 ? Math.max(...shopItems.map(i => i.id)) + 1 : 1,
        ...formData
      };
      setShopItems([...shopItems, newItem]);
    }
    handleCloseDialog();
  };
  
  const handleDelete = (id) => {
    setShopItems(shopItems.filter(item => item.id !== id));
  };
  
  const handleToggleActive = (id) => {
    setShopItems(shopItems.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
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
      
      {renderShopItemsTable()}
      
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
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
            />
            <TextField
              name="cost"
              label="Cost (coins)"
              type="number"
              fullWidth
              value={formData.cost}
              onChange={handleInputChange}
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
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShopItemManager;
