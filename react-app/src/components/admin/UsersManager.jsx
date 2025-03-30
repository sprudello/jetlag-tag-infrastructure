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
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Person as UserIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';

const UsersManager = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [visibleCurrencies, setVisibleCurrencies] = useState({});
  const [editFormData, setEditFormData] = useState({
    username: '',
    isAdmin: false,
    currency: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers(currentUser?.token);
        setUsers(data);
      } catch (err) {
        setError('Error loading users: ' + err.message);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.token) {
      fetchUsers();
    }
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
      const updateData = {
        username: editFormData.username,
        isAdmin: editFormData.isAdmin,
        currency: parseInt(editFormData.currency)
      };
      
      await userService.updateUser(selectedUser.id, updateData, currentUser?.token);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...editFormData } 
          : user
      ));
      
      setNotification({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
      
      handleCloseEditDialog();
    } catch (err) {
      setNotification({
        open: true,
        message: `Error updating user: ${err.message}`,
        severity: 'error'
      });
      console.error('Error updating user:', err);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      
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
                  <TableCell>
                    {visibleCurrencies[user.id] ? `${user.currency} coins` : '••••••'}
                    <IconButton 
                      size="small" 
                      onClick={() => setVisibleCurrencies(prev => ({
                        ...prev,
                        [user.id]: !prev[user.id]
                      }))}
                    >
                      {visibleCurrencies[user.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
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
      )}

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
              required
              error={!editFormData.username}
              helperText={!editFormData.username ? "Username is required" : ""}
            />
            <TextField
              name="currency"
              label="Currency"
              type="number"
              fullWidth
              value={editFormData.currency}
              onChange={handleInputChange}
              required
              error={editFormData.currency < 0}
              helperText={editFormData.currency < 0 ? "Currency cannot be negative" : ""}
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
            disabled={!editFormData.username || editFormData.currency < 0}
          >
            Save Changes
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

export default UsersManager;
