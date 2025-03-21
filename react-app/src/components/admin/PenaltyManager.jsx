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
  Timer as TimerIcon
} from '@mui/icons-material';

const PenaltyManager = () => {
  const [penalties, setPenalties] = useState([
    { id: 1, name: 'Standard Delay', description: 'Standard time penalty', minutes: 30, active: true }
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPenalty, setEditingPenalty] = useState(null);
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
  
  const handleSubmit = () => {
    if (editingPenalty) {
      // Update existing penalty
      setPenalties(penalties.map(penalty => 
        penalty.id === editingPenalty.id ? { ...penalty, ...formData } : penalty
      ));
    } else {
      // Add new penalty
      const newPenalty = {
        id: penalties.length > 0 ? Math.max(...penalties.map(p => p.id)) + 1 : 1,
        ...formData
      };
      setPenalties([...penalties, newPenalty]);
    }
    handleCloseDialog();
  };
  
  const handleDelete = (id) => {
    setPenalties(penalties.filter(penalty => penalty.id !== id));
  };
  
  const handleToggleActive = (id) => {
    setPenalties(penalties.map(penalty => 
      penalty.id === id ? { ...penalty, active: !penalty.active } : penalty
    ));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Penalty Time Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Penalty
        </Button>
      </Box>
      
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
                  <IconButton onClick={() => handleOpenDialog(penalty)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleToggleActive(penalty.id)} color={penalty.active ? "success" : "default"}>
                    {penalty.active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <IconButton onClick={() => handleDelete(penalty.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
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
              name="minutes"
              label="Time (minutes)"
              type="number"
              fullWidth
              value={30}
              disabled
              helperText="Standard penalty time is fixed at 30 minutes"
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
            {editingPenalty ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PenaltyManager;
