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
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const ChallengeManager = () => {
  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Verwirrter', description: 'Dreh dich zehn mal im Kreis und zeige in eine zufällige richtung. Laufe nun einen Kilometer in diese Richung.', reward: 1000, active: true },
    { id: 2, title: 'Lokaler Gourmet Chef', description: 'Finde eine lokale Spezialität und konsumiere diese.', reward: 200, active: true }
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: 0,
    active: true
  });
  
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
  
  const handleSubmit = () => {
    if (editingChallenge) {
      // Update existing challenge
      setChallenges(challenges.map(challenge => 
        challenge.id === editingChallenge.id ? { ...challenge, ...formData } : challenge
      ));
    } else {
      // Add new challenge
      const newChallenge = {
        id: challenges.length > 0 ? Math.max(...challenges.map(c => c.id)) + 1 : 1,
        ...formData
      };
      setChallenges([...challenges, newChallenge]);
    }
    handleCloseDialog();
  };
  
  const handleDelete = (id) => {
    setChallenges(challenges.filter(challenge => challenge.id !== id));
  };
  
  const handleToggleActive = (id) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === id ? { ...challenge, active: !challenge.active } : challenge
    ));
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Reward</TableCell>
              <TableCell>Status</TableCell>
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
                <TableCell>
                  {challenge.active ? (
                    <Typography color="primary">Active</Typography>
                  ) : (
                    <Typography color="error">Inactive</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(challenge)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleToggleActive(challenge.id)} color={challenge.active ? "success" : "default"}>
                    {challenge.active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <IconButton onClick={() => handleDelete(challenge.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
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
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
            <TextField
              name="reward"
              label="Reward (coins)"
              type="number"
              fullWidth
              value={formData.reward}
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
            {editingChallenge ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChallengeManager;
