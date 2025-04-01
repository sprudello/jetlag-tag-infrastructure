import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  EmojiEvents as ChallengeIcon,
  FlashOn as MultiplierIcon,
  Block as VetoIcon,
  MoreVert as MoreIcon,
  QuestionMark as QuestionIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import challengeService from '../services/challengeService';
import penaltyService from '../services/penaltyService';
import itemService from '../services/itemService';
import '../styles/pages/challenges.scss';

const Challenges = () => {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userChallengeId, setUserChallengeId] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [userItems, setUserItems] = useState([]);
  const [multiplierItems, setMultiplierItems] = useState([]);
  const [vetoItems, setVetoItems] = useState([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [randomChallenge, setRandomChallenge] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showMultiplierMenu, setShowMultiplierMenu] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await challengeService.getAllChallenges(currentUser?.token);
        setChallenges(data.filter(challenge => challenge.isActive));
      } catch (err) {
        setError('Failed to load challenges: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserItems = async () => {
      try {
        // This would be replaced with an actual API call to get user's items
        // For now, we'll simulate user-specific items based on user ID
        const userId = currentUser.userId || 0;
        let mockItems = [];
        
        // Only add items if they "belong" to this user (based on user ID)
        if (userId % 2 === 0) { // Even user IDs get 2x multiplier
          mockItems.push({ id: 1, name: "2x Multiplier", type: "multiplier", value: 2, userId: userId });
        }
        
        if (userId % 5 === 0) { // User IDs divisible by 5 get 5x multiplier
          mockItems.push({ id: 2, name: "5x Multiplier", type: "multiplier", value: 5, userId: userId });
        }
        
        if (userId % 3 === 0) { // User IDs divisible by 3 get veto
          mockItems.push({ id: 3, name: "Challenge Veto", type: "veto", userId: userId });
        }
        
        setUserItems(mockItems);
        setMultiplierItems(mockItems.filter(item => item.type === "multiplier"));
        setVetoItems(mockItems.filter(item => item.type === "veto"));
      } catch (err) {
        console.error("Error fetching user items:", err);
      }
    };

    if (currentUser?.token) {
      fetchChallenges();
      fetchUserItems();
    }
  }, [currentUser]);
  
  // Removed hasActiveChallenge state

  const handleCardClick = () => {
    if (!cardFlipped && challenges.length > 0) {
      // Show loading animation before revealing the challenge
      setLoading(true);
      
      // Add a slight delay to simulate drawing a card
      setTimeout(() => {
        // Select a random challenge from the available ones
        const randomIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[randomIndex];
        setRandomChallenge(challenge);
        setCardFlipped(true);
        setLoading(false);
        
        // Play a card flip sound effect if available
        // const flipSound = new Audio('/sounds/card-flip.mp3');
        // flipSound.play().catch(e => console.log('Audio play failed:', e));
      }, 300);
    }
  };
  
  const handleAcceptChallenge = async (challenge) => {
    try {
      setLoading(true);
      setSelectedChallenge(challenge);
      
      // Pull a challenge card
      const result = await penaltyService.pullCard(currentUser.userId, currentUser?.token);
      
      if (!result || !result.userChallengeId) {
        throw new Error('Failed to assign challenge to user');
      }
      
      setUserChallengeId(result.userChallengeId);
      
      // User has accepted the challenge - it will show in the overview
      
      // Open dialog to show challenge details
      setOpenDialog(true);
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to start challenge: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVetoChallenge = () => {
    // Check if user has veto items
    if (vetoItems.length > 0) {
      // Use a veto item without penalty
      setNotification({
        open: true,
        message: 'Challenge vetoed successfully! No penalty applied.',
        severity: 'success'
      });
      
      // Challenge vetoed
    } else {
      // Apply penalty for vetoing without a veto item
      handleCompleteFail();
    }
    
    // Reset the card
    setCardFlipped(false);
    setRandomChallenge(null);
  };
  
  const handleOpenMultiplierMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setShowMultiplierMenu(true);
  };
  
  const handleCloseMultiplierMenu = () => {
    setAnchorEl(null);
    setShowMultiplierMenu(false);
  };
  
  const handleSelectMultiplier = (multiplier) => {
    setCurrentMultiplier(multiplier);
    handleCloseMultiplierMenu();
    
    setNotification({
      open: true,
      message: `${multiplier}x multiplier applied!`,
      severity: 'success'
    });
  };
  
  const handleCompleteSuccess = async () => {
    try {
      setLoading(true);
      
      const data = {
        userChallengeId: userChallengeId
      };
      
      await penaltyService.completeSuccess(currentUser.userId, data, currentUser?.token);
      
      // Calculate reward with multiplier
      const baseReward = selectedChallenge?.reward || 0;
      const totalReward = baseReward * currentMultiplier;
      
      setNotification({
        open: true,
        message: `Challenge completed successfully! ${totalReward} coins added to your account.`,
        severity: 'success'
      });
      
      // Reset multiplier after use
      setCurrentMultiplier(1);
      
      setOpenDialog(false);
      setCardFlipped(false);
      setRandomChallenge(null);
    } catch (err) {
      setNotification({
        open: true,
        message: `Error completing challenge: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteFail = async () => {
    try {
      setLoading(true);
      
      const data = {
        userChallengeId: userChallengeId
      };
      
      await penaltyService.completeFail(currentUser.userId, data, currentUser?.token);
      
      setNotification({
        open: true,
        message: 'Challenge failed. A penalty has been applied.',
        severity: 'warning'
      });
      
      setOpenDialog(false);
      setCardFlipped(false);
      setRandomChallenge(null);
    } catch (err) {
      setNotification({
        open: true,
        message: `Error reporting challenge failure: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // resetCard function removed as it's no longer needed

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 3 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box className="challenges-container">
      <Paper elevation={1} className="page-header">
        <ChallengeIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">
          Draw a Challenge
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {challenges.length === 0 ? (
          <Typography sx={{ p: 2 }}>
            No challenges available to draw
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Click the card to draw a random challenge
            </Typography>
            
            {currentMultiplier > 1 && (
              <Chip 
                icon={<MultiplierIcon />}
                label={`${currentMultiplier}x Multiplier Active`}
                color="secondary"
                sx={{ mb: 2 }}
              />
            )}
            
            <Box className="challenge-card-container" sx={{ mb: 4 }}>
              <Box 
                className={`challenge-card-flip ${cardFlipped ? 'flipped' : ''}`}
                onClick={!cardFlipped ? handleCardClick : undefined}
                sx={{
                  width: 280,
                  height: 400,
                  perspective: '1000px',
                  cursor: cardFlipped ? 'default' : 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: !cardFlipped ? 'translateY(-10px)' : 'none'
                  }
                }}
              >
                <Box 
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Card Front */}
                  <Paper 
                    elevation={5}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
                      borderRadius: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <QuestionIcon sx={{ 
                      fontSize: 100, 
                      color: 'white',
                      filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
                      animation: !cardFlipped ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }} />
                    <Typography variant="h5" color="white" sx={{ 
                      mt: 2,
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Tap to Draw Challenge
                    </Typography>
                  </Paper>
                  
                  {/* Card Back */}
                  <Paper 
                    elevation={5}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
                      border: '2px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {randomChallenge && (
                      <>
                        <Typography variant="h5" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          color: '#fff',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {randomChallenge.title}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          flex: 1, 
                          overflow: 'auto',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          padding: 2,
                          borderRadius: 2,
                          marginY: 1
                        }}>
                          {randomChallenge.description}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={`${randomChallenge.reward} coins`} 
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                          />
                          {multiplierItems.length > 0 && (
                            <Button
                              startIcon={<MultiplierIcon />}
                              onClick={handleOpenMultiplierMenu}
                              color="secondary"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            >
                              Apply Multiplier
                            </Button>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Button 
                            variant="outlined" 
                            color="error"
                            onClick={handleVetoChallenge}
                            sx={{ fontWeight: 'bold' }}
                          >
                            Veto
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleAcceptChallenge(randomChallenge)}
                            sx={{ fontWeight: 'bold' }}
                          >
                            Accept
                          </Button>
                        </Box>
                      </>
                    )}
                  </Paper>
                </Box>
              </Box>
            </Box>
            
            {!cardFlipped && (
              <Typography variant="body2" color="text.secondary">
                Draw a card to see your next challenge!
              </Typography>
            )}
          </>
        )}
      </Box>
      {/* Challenge Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="challenge-dialog-title"
        aria-describedby="challenge-dialog-description"
      >
        <DialogTitle id="challenge-dialog-title">
          {selectedChallenge?.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="challenge-dialog-description">
            {selectedChallenge?.description}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Base Reward: {selectedChallenge?.reward} coins
            </Typography>
            {currentMultiplier > 1 && (
              <Typography variant="subtitle1" color="secondary" gutterBottom>
                Multiplier: {currentMultiplier}x
              </Typography>
            )}
            {currentMultiplier > 1 && (
              <Typography variant="h6" color="primary" gutterBottom>
                Total Reward: {selectedChallenge?.reward * currentMultiplier} coins
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Complete this challenge to earn the reward. If you fail, a time penalty will be applied.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCompleteFail} color="error">
            Failed
          </Button>
          <Button onClick={handleCompleteSuccess} color="success" variant="contained">
            Completed
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Multiplier Menu */}
      <Menu
        anchorEl={anchorEl}
        open={showMultiplierMenu}
        onClose={handleCloseMultiplierMenu}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Select Multiplier
        </Typography>
        <Divider />
        {multiplierItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handleSelectMultiplier(item.value)}>
            <ListItemIcon>
              <MultiplierIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary={`${item.value}x Multiplier`} />
          </MenuItem>
        ))}
      </Menu>
      
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

export default Challenges;
