import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Avatar, 
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon
} from '@mui/material';
import { 
  Home as HomeIcon,
  DirectionsCar as TransportIcon,
  EmojiEvents as ChallengesIcon,
  Inventory as ItemsIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import '../styles/components/header.scss';

const Header = ({ mode = null, onModeChange }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState('Home');
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleSwitchMode = () => {
    if (mode) {
      onModeChange(mode === 'admin' ? 'user' : 'admin');
    }
    handleClose();
  };
  
  const navItems = [
    { name: 'Home', icon: <HomeIcon fontSize="small" /> },
    { name: 'Challenges', icon: <ChallengesIcon fontSize="small" /> },
    { name: 'Transportations', icon: <TransportIcon fontSize="small" /> },
    { name: 'Items', icon: <ItemsIcon fontSize="small" /> },
    { name: 'Profile', icon: <ProfileIcon fontSize="small" /> }
  ];
  
  return (
    <AppBar position="static" color="default" elevation={1} className="header">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          Challenge Game
        </Typography>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button 
              key={item.name}
              startIcon={item.icon}
              color={currentPage === item.name ? "primary" : "inherit"}
              onClick={() => handlePageChange(item.name)}
              sx={{ mx: 1 }}
              disabled={!mode}
            >
              {item.name}
            </Button>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            disabled={!mode}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: mode === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main }}>
              {mode ? (mode === 'admin' ? 'A' : 'U') : '?'}
            </Avatar>
          </IconButton>
          
          {mode === 'admin' && (
            <Chip 
              label="Admin" 
              color="secondary" 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1">
              Username
            </Typography>
            {mode === 'admin' && (
              <Chip 
                label="Admin" 
                color="secondary" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <ProfileIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSwitchMode}>
            <ListItemIcon>
              {mode === 'admin' ? <ProfileIcon fontSize="small" /> : <AdminIcon fontSize="small" />}
            </ListItemIcon>
            Switch to {mode === 'admin' ? 'User' : 'Admin'} Mode
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
