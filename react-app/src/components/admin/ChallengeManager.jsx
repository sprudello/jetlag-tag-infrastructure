import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import challengeService from '../../services/challengeService';
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
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const ChallengeManager = () => {
  const [challenges, setChallenges] = useState([]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const data = await challengeService.getAllChallenges(currentUser?.token);
        const formattedData = data.map(challenge => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          reward: challenge.reward,
          active: challenge.isActive
        }));
        setChallenges(formattedData);
      } catch (err) {
        setError('Error loading challenges: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.token) {
      fetchChallenges();
    }
  }, [currentUser]);
  
  const handleOpenDialog = (challenge = null) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData({
        title: challenge.title,
        description: challenge.description,
        reward: challenge.reward,
        active: challenge.active
      });
    } else {
      setEditingChallenge(null);
      setFormData({
        title: '',
        description: '',
        reward: 0,
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
  
  const handleSubmit = async () => {
    try {
      if (editingChallenge) {
        // Update existing challenge
        const updateData = {
          title: formData.title,
          description: formData.description,
          reward: parseInt(formData.reward),
          isActive: formData.active
        };
        
        await challengeService.updateChallenge(editingChallenge.id, updateData, currentUser?.token);
        
        setChallenges(challenges.map(challenge => 
          challenge.id === editingChallenge.id ? { ...challenge, ...formData } : challenge
        ));
        
        setNotification({
          open: true,
          message: 'Challenge updated successfully',
          severity: 'success'
        });
      } else {
        // Add new challenge
        const createData = {
          title: formData.title,
          description: formData.description,
          reward: parseInt(formData.reward),
          isActive: formData.active
        };
        
        const result = await challengeService.createChallenge(createData, currentUser?.token);
        
        const newChallenge = {
          id: result.id,
          title: result.title,
          description: result.description,
          reward: result.reward,
          active: result.isActive
        };
        
        setChallenges([...challenges, newChallenge]);
        
        setNotification({
          open: true,
          message: 'Challenge created successfully',
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
      await challengeService.deleteChallenge(id, currentUser?.token);
      setChallenges(challenges.filter(challenge => challenge.id !== id));
      setNotification({
        open: true,
        message: 'Challenge deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Error deleting challenge: ${err.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleToggleActive = async (id) => {
    try {
      const challenge = challenges.find(c => c.id === id);
      if (!challenge) return;
      
      const updateData = {
        title: challenge.title,
        description: challenge.description,
        reward: challenge.reward,
        isActive: !challenge.active
      };
      
      await challengeService.updateChallenge(id, updateData, currentUser?.token);
      
      setChallenges(challenges.map(challenge => 
        challenge.id === id ? { ...challenge, active: !challenge.active } : challenge
      ));
      
      setNotification({
        open: true,
        message: `Challenge ${!challenge.active ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Error updating challenge: ${err.message}`,
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
        <Typography variant="h5">Challenge Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Challenge
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
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Reward</TableCell>
              {/* Status column removed */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell>{challenge.id}</TableCell>
                <TableCell>{challenge.title}</TableCell>
                <TableCell>{challenge.description}</TableCell>
                <TableCell>{challenge.reward} coins</TableCell>
                {/* Status cell removed */}
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(challenge)} color="primary">
                    <EditIcon />
                  </IconButton>
                  {/* Toggle active button removed */}
                  <IconButton onClick={() => handleDelete(challenge.id)} color="error">
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
        <DialogTitle>{editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="title"
              label="Challenge Title"
              fullWidth
              value={formData.title}
              onChange={handleInputChange}
              required
              error={!formData.title}
              helperText={!formData.title ? "Title is required" : ""}
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              required
              error={!formData.description}
              helperText={!formData.description ? "Description is required" : ""}
            />
            <TextField
              name="reward"
              label="Reward (coins)"
              type="number"
              fullWidth
              value={formData.reward}
              onChange={handleInputChange}
              required
              error={formData.reward <= 0}
              helperText={formData.reward <= 0 ? "Reward must be greater than 0" : ""}
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
            disabled={!formData.title || !formData.description || formData.reward <= 0}
          >
            {editingChallenge ? 'Update' : 'Add'}
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

export default ChallengeManager;
