import { useState, useEffect } from 'react';
import { Button, Typography, Box, Paper, Snackbar, Alert } from '@mui/material';
import ChallengeCardOverlay from './ChallengeCardOverlay';
import ShopOverlay from './ShopOverlay';
import ChallengeDetailsOverlay from './ChallengeDetailsOverlay';
import '../styles/components/challenge-game.scss';

const ChallengeGame = () => {
  const [coins, setCoins] = useState(500);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [showChallengeOverlay, setShowChallengeOverlay] = useState(false);
  const [showShopOverlay, setShowShopOverlay] = useState(false);
  const [showDetailsOverlay, setShowDetailsOverlay] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [revealedCards, setRevealedCards] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Challenge card values
  const cardValues = [25, 50, 100];

  const handleOpenChallengeOverlay = () => {
    setShowChallengeOverlay(true);
    setSelectedCard(null);
    setRevealedCards({});
  };

  const handleCloseChallengeOverlay = () => {
    setShowChallengeOverlay(false);
  };

  const handleOpenShop = () => {
    setShowShopOverlay(true);
  };

  const handleCloseShop = () => {
    setShowShopOverlay(false);
  };

  const handleBuyMultiplier = (multiplier, cost) => {
    if (coins >= cost) {
      setCoins(coins - cost);
      setCurrentMultiplier(parseFloat(multiplier));
      setShowShopOverlay(false);
    }
  };

  const handleSelectCard = (cardIndex) => {
    setSelectedCard(cardIndex);
    setRevealedCards({
      ...revealedCards,
      [cardIndex]: true
    });
    
    // Show challenge details overlay after selecting a card
    setShowDetailsOverlay(true);
    setShowChallengeOverlay(false);
  };
  
  const handleCloseDetailsOverlay = () => {
    setShowDetailsOverlay(false);
  };
  
  const handleCollectReward = () => {
    if (selectedCard !== null) {
      const reward = Math.round(cardValues[selectedCard] * currentMultiplier);
      setCoins(coins + reward);
      setShowDetailsOverlay(false);
      
      // Only show notification if multiplier was greater than 1
      if (currentMultiplier > 1) {
        setNotification({
          open: true,
          message: 'Multiplier has been reset to 1.0x',
          severity: 'info'
        });
        // Reset multiplier to 1 after collecting reward
        setCurrentMultiplier(1);
      }
    }
  };
  
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <div className="challenge-game">
      {/* Challenge game content will go here */}

      {showChallengeOverlay && (
        <ChallengeCardOverlay 
          onClose={handleCloseChallengeOverlay}
          onOpenShop={handleOpenShop}
          onSelectCard={handleSelectCard}
          selectedCard={selectedCard}
          revealedCards={revealedCards}
          cardValues={cardValues}
          multiplier={currentMultiplier}
        />
      )}

      {showShopOverlay && (
        <ShopOverlay 
          onClose={handleCloseShop}
          onBuyMultiplier={handleBuyMultiplier}
          coins={coins}
          currentMultiplier={currentMultiplier}
        />
      )}
      
      {showDetailsOverlay && selectedCard !== null && (
        <ChallengeDetailsOverlay
          onClose={handleCloseDetailsOverlay}
          onContinue={handleCollectReward}
          cardValue={cardValues[selectedCard]}
          multiplier={currentMultiplier}
        />
      )}
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
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
    </div>
  );
};

export default ChallengeGame;
