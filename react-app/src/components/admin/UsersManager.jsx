import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Person as UserIcon 
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const UsersManager = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    isAdmin: false,
    currency: 0
  });

  const API_URL = 'http://localhost:5296';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/allUsers`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      isAdmin: user.isAdmin,
      currency: user.currency
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'isAdmin' ? checked : value
    }));
  };

  const handleSaveUser = async () => {
    try {
      const response = await fetch(`${API_URL}/editUser/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          username: editFormData.username,
          isAdmin: editFormData.isAdmin,
          currency: editFormData.currency
        })
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...editFormData } 
            : user
        ));
        handleCloseEditDialog();
      } else {
        const errorData = await response.json();
        console.error('Failed to update user:', errorData);
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.currency} coins</TableCell>
                <TableCell>
                  {user.isAdmin ? 'Admin' : 'User'}
                </TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenEditDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="username"
              label="Username"
              fullWidth
              value={editFormData.username}
              onChange={handleInputChange}
            />
            <TextField
              name="currency"
              label="Currency"
              type="number"
              fullWidth
              value={editFormData.currency}
              onChange={handleInputChange}
            />
            <FormControlLabel
              control={
                <Switch
                  name="isAdmin"
                  checked={editFormData.isAdmin}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Admin User"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManager;
