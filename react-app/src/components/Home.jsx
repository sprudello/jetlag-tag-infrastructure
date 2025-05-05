import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  EmojiEvents as ChallengeIcon,
  DirectionsCar as TransportIcon,
  ShoppingCart as ShopIcon,
  Inventory as InventoryIcon,
  Timer as TimerIcon,
  Block as VetoIcon
} from '@mui/icons-material';
import GameRules from './GameRules';
import { useAuth } from '../contexts/AuthContext';
import challengeService from '../services/challengeService';
import transportationService from '../services/transportationService';
import itemService from '../services/itemService';
import apiService from '../services/apiService';
import API_CONFIG from '../config/apiConfig';
import usePenaltyTimer from '../hooks/usePenaltyTimer';
import '../styles/pages/home.scss';

const Home = () => {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [vetoItems, setVetoItems] = useState([]);
  const [loading, setLoading] = useState({
    challenges: true,
    transportations: true,
    shopItems: true,
    userItems: true
  });
  const [error, setError] = useState({
    challenges: null,
    transportations: null,
    shopItems: null,
    userItems: null
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const { 
    activePenalty, 
    penaltyTimeRemaining, 
    loading: penaltyLoading, 
    error: penaltyError 
  } = usePenaltyTimer(currentUser);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.token) return;
      
      // Fetch active challenge
      try {
        // Use the endpoint that returns challenge details directly
        const response = await fetch(`${API_CONFIG.BASE_URL}/currentChallenge/${currentUser.userId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
            
        if (!response.ok) {
          throw new Error(`Failed to fetch current challenge: ${response.status}`);
        }
            
        const data = await response.json();
            
        // The backend returns the UserChallenge object directly
        if (data) {
          setChallenges([{
            id: data.challengeCard.id,
            title: data.challengeCard.title,
            description: data.challengeCard.description,
            reward: data.challengeCard.reward,
            isActive: data.challengeCard.isActive,
            isUserActive: true,
            startTime: data.startTime,
            userChallengeId: data.id,
            status: data.status
          }]);
        } else {
          setChallenges([]);
        }
      } catch (err) {
        console.error("Error fetching active challenge:", err);
        // Don't set error for new users with no challenges
        // Just set empty challenges array instead
        setChallenges([]);
      } finally {
        setLoading(prev => ({ ...prev, challenges: false }));
      }

      // Fetch purchased items
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/UserItems/GetAllUserItems/${currentUser.userId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user items: ${response.status}`);
        }
        
        const userItemsData = await response.json();
        setUserItems(userItemsData);
        
        // Filter out veto items based on item name
        setVetoItems(userItemsData.filter(item => 
          item.item.name.toLowerCase().includes('veto') || 
          item.item.description.toLowerCase().includes('veto')
        ));
      } catch (err) {
        setError(prev => ({ ...prev, userItems: 'Failed to load user items: ' + err.message }));
      } finally {
        setLoading(prev => ({ ...prev, userItems: false }));
      }
      
    };

    fetchData();
  }, [currentUser]);
  
  // Penalty timer is now handled by usePenaltyTimer hook

  const renderSection = (title, icon, items, loadingState, errorState, itemRenderer) => (
    <Box className="home-section">
      <Box className="section-header">
        {icon}
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      
      {loadingState ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : errorState ? (
        <Typography color="error" sx={{ p: 2 }}>
          {errorState}
        </Typography>
      ) : items.length === 0 ? (
        <Typography sx={{ p: 2 }}>
          No active {title.toLowerCase()}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map(item => itemRenderer(item))}
        </Grid>
      )}
    </Box>
  );

  const [openChallengeDialog, setOpenChallengeDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeActionLoading, setChallengeActionLoading] = useState(false);
  
  const handleOpenChallengeDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setOpenChallengeDialog(true);
  };
  
  const handleCloseChallengeDetails = () => {
    setOpenChallengeDialog(false);
  };
  
  const handleChallengeComplete = async () => {
    try {
      setChallengeActionLoading(true);
      
      // Create the request data
      const requestData = {
        userId: currentUser.userId,
        userChallengeId: selectedChallenge.userChallengeId
      };
      
      // Call the API endpoint to mark challenge as successful
      const response = await fetch(`${API_CONFIG.BASE_URL}/success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete challenge');
      }
      
      const result = await response.json();
      
      setNotification({
        open: true,
        message: `Challenge completed successfully! ${selectedChallenge.reward} coins added to your account.`,
        severity: 'success'
      });
      
      // Close dialog and refresh data
      setOpenChallengeDialog(false);
      setChallenges([]);
      
      // Navigate to jetlag-tag-infrastructure after a short delay
      setTimeout(() => {
        window.location.href = '/jetlag-tag-infrastructure/';
      }, 1500);
      
    } catch (err) {
      setNotification({
        open: true,
        message: `Error completing challenge: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setChallengeActionLoading(false);
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
      
      // In a real app, we would remove the veto item from the user's inventory here
      // For now, we'll just simulate it by removing it from the local state
      const vetoItem = vetoItems[0];
      setVetoItems(vetoItems.filter(item => item.id !== vetoItem.id));
      setUserItems(userItems.filter(item => item.id !== vetoItem.id));
      
      // Close dialog and redirect to challenges page
      setOpenChallengeDialog(false);
      setChallenges([]);
      
      // Navigate to jetlag-tag-infrastructure after a short delay
      setTimeout(() => {
        window.location.href = '/jetlag-tag-infrastructure/';
      }, 1500);
    }
  };
  
  const handleChallengeFail = async () => {
    try {
      setChallengeActionLoading(true);
      
      // Create the request data
      const requestData = {
        userId: currentUser.userId,
        userChallengeId: selectedChallenge.userChallengeId
      };
      
      // The penalty will be fetched automatically by the usePenaltyTimer hook
      
      // Call the API endpoint to mark challenge as failed
      // This will automatically create a penalty record
      const response = await fetch(`${API_CONFIG.BASE_URL}/fail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report challenge failure');
      }
      
      // After reporting failure, fetch the updated penalty details
      try {
        const penaltyResponse = await fetch(`${API_CONFIG.BASE_URL}/GetUserPenalty/${currentUser.userId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        if (penaltyResponse.ok) {
          const penaltyData = await penaltyResponse.json();
          // Update the local penalty data with the actual data from the server
          const updatedPenalty = {
            endTime: new Date(penaltyData.endTime),
            durationInMinutes: penaltyData.durationInMinutes
          };
          
          // Update state and localStorage
          setActivePenalty(updatedPenalty);
          localStorage.setItem(`penalty_${currentUser.userId}`, JSON.stringify(updatedPenalty));
        }
      } catch (penaltyErr) {
        console.error('Error fetching updated penalty:', penaltyErr);
      }
      
      setNotification({
        open: true,
        message: 'Challenge failed. A 30-minute penalty has been applied.',
        severity: 'warning'
      });
      
      // Close dialog and refresh data
      setOpenChallengeDialog(false);
      setChallenges([]);
      
      // Navigate to jetlag-tag-infrastructure after a short delay
      setTimeout(() => {
        window.location.href = '/jetlag-tag-infrastructure/';
      }, 1500);
      
    } catch (err) {
      setNotification({
        open: true,
        message: `Error reporting challenge failure: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setChallengeActionLoading(false);
    }
  };
  
  const renderChallengeItem = (challenge) => (
    <Grid item xs={12} md={4} key={challenge.id}>
      <Card className="item-card challenge-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {challenge.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {challenge.description}
          </Typography>
          <Chip 
            label={`${challenge.reward} coins`} 
            color="primary" 
            size="small" 
            sx={{ mt: 2 }} 
          />
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            color="primary"
            onClick={() => handleOpenChallengeDetails(challenge)}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderTransportationItem = (transportation) => (
    <Grid item xs={12} md={4} key={transportation.id}>
      <Card className="item-card transportation-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {transportation.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {transportation.description}
          </Typography>
          <Chip 
            label={`${transportation.pricePerMinute} coins/min`} 
            color="primary" 
            size="small" 
            sx={{ mt: 2 }} 
          />
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            View Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderShopItem = (item) => (
    <Grid item xs={12} md={4} key={item.id}>
      <Card className="item-card shop-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {item.description}
          </Typography>
          <Chip 
            label={`${item.price} coins`} 
            color="secondary" 
            size="small" 
            sx={{ mt: 2 }} 
          />
        </CardContent>
        <CardActions>
          <Button size="small" color="secondary">
            Buy
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderUserItemItem = (userItem) => (
    <Grid item xs={12} md={4} key={userItem.id}>
      <Card className="item-card user-item-card">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {userItem.item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="card-description">
            {userItem.item.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip 
              label="Owned" 
              color="success" 
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              Purchased: {new Date(userItem.purchaseDate).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box className="home-container">
      <Paper elevation={2} className="welcome-section">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: currentUser?.isAdmin
                  ? "secondary.main"
                  : "primary.main",
                fontSize: "1.5rem",
              }}
            >
              {currentUser?.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome, {currentUser?.username || "User"}!
              </Typography>
              <Typography variant="body1">
                Here's an overview of your current activity.
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  color: penaltyTimeRemaining ? "error.main" : "success.main",
                  animation: penaltyTimeRemaining ? "pulse 2s infinite" : "none",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.7 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.7 },
                  },
                }}
              >
                <TimerIcon color={penaltyTimeRemaining ? "error" : "success"} sx={{ mr: 1 }} />
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={penaltyTimeRemaining ? "error.main" : "success.main"}
                >
                  {penaltyTimeRemaining 
                    ? `Penalty: ${penaltyTimeRemaining.formatted} remaining` 
                    : "User has no penalty"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <GameRules />
          </Box>
        </Box>
      </Paper>

      <Box className="home-section">
        <Box className="section-header">
          <ChallengeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            Your Active Challenge
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Loading state */}
        {loading.challenges && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {error.challenges && (
          <Typography color="error" sx={{ p: 2 }}>
            {error.challenges}
          </Typography>
        )}

        {/* Empty state */}
        {!loading.challenges &&
          !error.challenges &&
          challenges.length === 0 && (
            <Typography sx={{ p: 2 }}>
              No challenge accepted. Visit the Challenges tab to accept one!
            </Typography>
          )}

        {/* Content */}
        {!loading.challenges && !error.challenges && challenges.length > 0 && (
          <>
            <Grid container spacing={3}>
              {challenges.map((challenge) => renderChallengeItem(challenge))}
            </Grid>

            {/* Status chip */}
            {challenges[0]?.status !== undefined && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Chip
                  label={`Status: ${
                    challenges[0].status === 0
                      ? "In Progress"
                      : challenges[0].status === 1
                      ? "Completed"
                      : "Failed"
                  }`}
                  color={
                    challenges[0].status === 0
                      ? "primary"
                      : challenges[0].status === 1
                      ? "success"
                      : "error"
                  }
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {renderSection(
        "Purchased Items",
        <InventoryIcon color="secondary" sx={{ mr: 1 }} />,
        userItems,
        loading.userItems,
        error.userItems,
        renderUserItemItem
      )}

      {/* Challenge Details Dialog */}
      <Dialog
        open={openChallengeDialog}
        onClose={handleCloseChallengeDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedChallenge && (
          <>
            <DialogTitle
              sx={{
                bgcolor: "primary.dark",
                color: "white",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChallengeIcon sx={{ mr: 1 }} />
              {selectedChallenge.title}
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Typography variant="body1" paragraph>
                {selectedChallenge.description}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Chip
                  label={`Reward: ${selectedChallenge.reward} coins`}
                  color="primary"
                  size="medium"
                  sx={{ fontWeight: "bold" }}
                />

                <Typography variant="body2" color="text.secondary">
                  Started:{" "}
                  {new Date(selectedChallenge.startTime).toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Have you completed this challenge?
              </Typography>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                {vetoItems.length > 0 && (
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    onClick={handleVetoChallenge}
                    disabled={challengeActionLoading}
                    startIcon={
                      challengeActionLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <VetoIcon />
                      )
                    }
                    sx={{ width: "32%" }}
                  >
                    Veto
                  </Button>
                )}

                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={handleChallengeFail}
                  disabled={challengeActionLoading}
                  startIcon={
                    challengeActionLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  sx={{ width: vetoItems.length > 0 ? "32%" : "48%" }}
                >
                  Failed
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleChallengeComplete}
                  disabled={challengeActionLoading}
                  startIcon={
                    challengeActionLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  sx={{ width: vetoItems.length > 0 ? "32%" : "48%" }}
                >
                  Completed
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
