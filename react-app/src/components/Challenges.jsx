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
        // For now, we'll simulate having some items
        const mockItems = [
          { id: 1, name: "2x Multiplier", type: "multiplier", value: 2 },
          { id: 2, name: "5x Multiplier", type: "multiplier", value: 5 },
          { id: 3, name: "Challenge Veto", type: "veto" }
        ];
        
        setUserItems(mockItems);
        setMultiplierItems(mockItems.filter(item => item.type === "multiplier"));
        setVetoItems(mockItems.filter(item => item.type === "veto"));
      } catch (err) {
        console.error("Error fetching user items:", err);
      }
    };
    
    const checkActiveChallenge = async () => {
      try {
        // This would be an API call to check if user has active challenges
        // For now, we'll set it to false by default
        setHasActiveChallenge(false);
        
        // In a real implementation, you would do something like:
        // const activeChallenge = await challengeService.getUserActiveChallenge(currentUser.userId, currentUser?.token);
        // setHasActiveChallenge(!!activeChallenge);
      } catch (err) {
        console.error("Error checking active challenges:", err);
      }
    };

    if (currentUser?.token) {
      fetchChallenges();
      fetchUserItems();
      checkActiveChallenge();
    }
  }, [currentUser]);
  
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);

  const handleCardClick = () => {
    if (!cardFlipped && challenges.length > 0 && !hasActiveChallenge) {
      // Select a random challenge from the available ones
      const randomIndex = Math.floor(Math.random() * challenges.length);
      const challenge = challenges[randomIndex];
      setRandomChallenge(challenge);
      setCardFlipped(true);
    } else if (hasActiveChallenge) {
      setNotification({
        open: true,
        message: 'You already have an active challenge. Complete it first!',
        severity: 'warning'
      });
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
      
      // Mark that user has an active challenge
      setHasActiveChallenge(true);
      
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
      
      // Reset active challenge status
      setHasActiveChallenge(false);
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
      
      // Reset active challenge status
      setHasActiveChallenge(false);
      
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
      
      // Reset active challenge status
      setHasActiveChallenge(false);
      
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
          Available Challenges
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {challenges.length === 0 ? (
          <Typography sx={{ p: 2 }}>
            No active challenges
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Click the card to reveal a random challenge
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
                  cursor: cardFlipped ? 'default' : 'pointer'
                }}
              >
                <Box 
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Card Front */}
                  <Paper 
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#646cff',
                      borderRadius: '16px'
                    }}
                  >
                    <QuestionIcon sx={{ fontSize: 80, color: 'white' }} />
                    <Typography variant="h5" color="white" sx={{ mt: 2 }}>
                      Tap to reveal
                    </Typography>
                  </Paper>
                  
                  {/* Card Back */}
                  <Paper 
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 3,
                      borderRadius: '16px'
                    }}
                  >
                    {randomChallenge && (
                      <>
                        <Typography variant="h5" gutterBottom>
                          {randomChallenge.title}
                        </Typography>
                        <Typography variant="body1" sx={{ flex: 1, overflow: 'auto' }}>
                          {randomChallenge.description}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={`${randomChallenge.reward} coins`} 
                            color="primary" 
                          />
                          {multiplierItems.length > 0 && (
                            <Button
                              startIcon={<MultiplierIcon />}
                              onClick={handleOpenMultiplierMenu}
                              color="secondary"
                              variant="outlined"
                              size="small"
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
                          >
                            Veto
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleAcceptChallenge(randomChallenge)}
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
            
            {/* Draw New Card button removed - user must accept or veto */}
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
