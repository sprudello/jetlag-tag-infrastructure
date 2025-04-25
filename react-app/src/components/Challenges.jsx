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
import API_CONFIG from '../config/apiConfig';
import { 
  EmojiEvents as ChallengeIcon,
  FlashOn as MultiplierIcon,
  Block as VetoIcon,
  MoreVert as MoreIcon,
  QuestionMark as QuestionIcon
} from '@mui/icons-material';
import GameRules from './GameRules';
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

  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [hasActivePenalty, setHasActivePenalty] = useState(false);
  
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
    
    // Check if user has an active challenge
    const checkActiveChallenge = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/UserChallenges/currentChallenge/${currentUser.userId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.activeChallenge) {
            setHasActiveChallenge(true);
            return;
          }
        }
        
        // If we get here, user has no active challenge
        setHasActiveChallenge(false);
      } catch (err) {
        console.error("Error checking active challenge:", err);
        setHasActiveChallenge(false);
      }
    };
    
    // Check if user has an active penalty
    const checkActivePenalty = () => {
      // Check localStorage first
      const storedPenalty = localStorage.getItem(`penalty_${currentUser.userId}`);
      if (storedPenalty) {
        try {
          const penaltyData = JSON.parse(storedPenalty);
          const endTime = new Date(penaltyData.endTime);
          
          // Only set the penalty if it hasn't expired yet
          if (endTime > new Date()) {
            setHasActivePenalty(true);
            return;
          } else {
            // Clear expired penalty
            localStorage.removeItem(`penalty_${currentUser.userId}`);
          }
        } catch (e) {
          console.error("Error parsing stored penalty:", e);
        }
      }
      
      // If no local penalty, check the API
      try {
        fetch(`${API_CONFIG.BASE_URL}/UserPenalties/active/${currentUser.userId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        }).then(response => {
          if (response.ok) {
            return response.json();
          }
          return { hasActivePenalty: false };
        }).then(data => {
          if (data.hasActivePenalty) {
            setHasActivePenalty(true);
            
            // Store in localStorage for persistence
            const penalty = {
              endTime: new Date(data.endTime),
              durationInMinutes: data.durationInMinutes
            };
            localStorage.setItem(`penalty_${currentUser.userId}`, JSON.stringify(penalty));
          }
        });
      } catch (err) {
        console.error("Error checking active penalty:", err);
      }
    };

    const fetchUserItems = async () => {
      try {
        // In a real app, we would fetch user items from the API
        // For now, we'll use an empty array since the API endpoint isn't available yet
        const userItemsData = [];
        setUserItems(userItemsData);
        setMultiplierItems(userItemsData.filter(item => item.type === "multiplier"));
        setVetoItems(userItemsData.filter(item => item.type === "veto"));
      } catch (err) {
        console.error("Error fetching user items:", err);
      }
    };

    if (currentUser?.token) {
      fetchChallenges();
      fetchUserItems();
      checkActiveChallenge();
      checkActivePenalty();
    }
  }, [currentUser]);
  
  // Removed hasActiveChallenge state

  const handleCardClick = () => {
    if (hasActivePenalty) {
      setNotification({
        open: true,
        message: 'You have an active penalty. You cannot draw a challenge until the penalty expires.',
        severity: 'warning'
      });
      return;
    }
    
    if (hasActiveChallenge) {
      setNotification({
        open: true,
        message: 'You already have an active challenge. Complete it first!',
        severity: 'warning'
      });
      return;
    }
    
    if (!cardFlipped) {
      // Show loading animation before revealing the challenge
      setLoading(true);
      
      // Add a slight delay to simulate drawing a card
      setTimeout(() => {
        // If challenges are loaded, select a random one
        if (challenges.length > 0) {
          const randomIndex = Math.floor(Math.random() * challenges.length);
          const challenge = challenges[randomIndex];
          setRandomChallenge(challenge);
          setCardFlipped(true);
          
          // Automatically accept the challenge after a short delay
          setTimeout(() => {
            handleAcceptChallenge(challenge);
          }, 2000);
        } else {
          // If no challenges are available, show notification
          setCardFlipped(false);
          setNotification({
            open: true,
            message: 'Oops, no challenges available.',
            severity: 'info'
          });
        }
        
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
      
      // Redirect to home page to see the active challenge
      setNotification({
        open: true,
        message: 'Challenge accepted! Redirecting to overview...',
        severity: 'success'
      });
      
      // Reset the card
      setCardFlipped(false);
      setRandomChallenge(null);
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/'; // This will refresh the page and go to home
      }, 1500);
      
    } catch (err) {
      if (err.message.includes('already has an active challenge')) {
        setNotification({
          open: true,
          message: 'You already have an active challenge. Complete it first!',
          severity: 'warning'
        });
      } else {
        setNotification({
          open: true,
          message: `Failed to start challenge: ${err.message}`,
          severity: 'error'
        });
      }
      
      // Reset the card
      setCardFlipped(false);
      setRandomChallenge(null);
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
      
      // Call API to use veto item
      // For now, just update local state
      const vetoItem = vetoItems[0];
      setVetoItems(vetoItems.filter(item => item.id !== vetoItem.id));
      setUserItems(userItems.filter(item => item.id !== vetoItem.id));
      
    } else {
      // Apply penalty for vetoing without a veto item
      setNotification({
        open: true,
        message: 'You don\'t have a veto item! Drawing a new challenge instead.',
        severity: 'warning'
      });
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
    
    // In a real app, we would call the API to apply the multiplier
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

  // Remove the loading check that was preventing the card from showing
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
        <Box sx={{ ml: 'auto' }}>
          <GameRules />
        </Box>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Always show the card, even if challenges are loading or empty */}
          <>
            <Typography variant="h6" gutterBottom>
              Click the card to draw a random challenge
            </Typography>
            
            {currentMultiplier > 1 ? (
              <Chip 
                icon={<MultiplierIcon />}
                label={`${currentMultiplier}x Multiplier Active`}
                color="secondary"
                sx={{ mb: 2 }}
              />
            ) : multiplierItems.length > 0 && !cardFlipped && !hasActiveChallenge && !hasActivePenalty && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<MultiplierIcon />}
                onClick={handleOpenMultiplierMenu}
                sx={{ mb: 2 }}
              >
                Use Multiplier
              </Button>
            )}
            
            {hasActiveChallenge && (
              <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
                You already have an active challenge. Complete it before drawing a new one.
              </Alert>
            )}
            
            {hasActivePenalty && (
              <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
                You have an active penalty. You cannot draw a challenge until the penalty expires.
              </Alert>
            )}
            
            <Box className="challenge-card-container" sx={{ mb: 4 }}>
              <Box 
                className={`challenge-card-flip ${cardFlipped ? 'flipped' : ''}`}
                onClick={!cardFlipped && !hasActiveChallenge && !hasActivePenalty ? handleCardClick : undefined}
                sx={{
                  width: 280,
                  height: 400,
                  perspective: '1000px',
                  cursor: cardFlipped || hasActiveChallenge || hasActivePenalty ? 'default' : 'pointer',
                  transition: 'transform 0.3s ease',
                  opacity: hasActiveChallenge || hasActivePenalty ? 0.6 : 1,
                  '&:hover': {
                    transform: !cardFlipped && !hasActiveChallenge && !hasActivePenalty ? 'translateY(-10px)' : 'none'
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
                          {currentMultiplier > 1 && (
                            <Chip 
                              icon={<MultiplierIcon />}
                              label={`${currentMultiplier}x Multiplier Active`}
                              color="secondary"
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          )}
                        </Box>
                        {/* Buttons removed - challenge is automatically accepted when drawn */}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Challenge will be automatically accepted
                          </Typography>
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
      </Box>
      {/* Challenge Dialog removed - redirecting to overview instead */}
      
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
