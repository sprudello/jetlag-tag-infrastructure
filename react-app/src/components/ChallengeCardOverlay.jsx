import { Button, Typography, Box } from '@mui/material';
import '../styles/components/challenge-card-overlay.scss';

const ChallengeCardOverlay = ({ 
  onClose, 
  onOpenShop, 
  onSelectCard, 
  selectedCard, 
  revealedCards,
  cardValues,
  multiplier
}) => {
  return (
    <div className="overlay challenge-overlay">
      <div className="overlay-content">
        <Typography variant="h4" component="h2" gutterBottom>
          Select a Challenge Card
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Choose one card to reveal your challenge
        </Typography>
        
        <Box className="challenge-cards">
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              className={`challenge-card ${selectedCard === index ? 'selected' : ''} ${revealedCards[index] ? 'flipped' : ''}`}
              onClick={() => !revealedCards[index] && onSelectCard(index)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <span className="question-mark">?</span>
                  <div className="multiplier-badge">{multiplier.toFixed(1)}x</div>
                </div>
                <div className="card-back">
                  <span className="challenge-value">{Math.round(cardValues[index] * multiplier)}</span>
                  <div className="multiplier-badge">{multiplier.toFixed(1)}x</div>
                </div>
              </div>
            </div>
          ))}
        </Box>
        
        <Box className="overlay-actions">
          <Button 
            variant="contained" 
            color="secondary"
            onClick={onOpenShop}
            className="shop-btn"
          >
            Open Shop
          </Button>
          <Button 
            variant="outlined"
            onClick={onClose}
            className="close-btn"
          >
            Close
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default ChallengeCardOverlay;
