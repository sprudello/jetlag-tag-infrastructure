import { Button, Typography, Box, Paper } from '@mui/material';
import '../styles/components/challenge-details-overlay.scss';

const ChallengeDetailsOverlay = ({ 
  onClose, 
  cardValue,
  multiplier,
  onContinue
}) => {
  const baseReward = cardValue;
  const multipliedReward = Math.round(cardValue * multiplier);
  
  return (
    <div className="overlay challenge-details-overlay">
      <div className="overlay-content">
        <Typography variant="h4" component="h2" gutterBottom>
          Challenge Details
        </Typography>
        
        <Paper elevation={3} className="challenge-details">
          <Typography variant="h5" gutterBottom>
            Challenge Value: {baseReward}
          </Typography>
          
          <Box className="reward-details">
            <Typography variant="body1">
              Base Reward: {baseReward} coins
            </Typography>
            
            <Typography variant="h6" className="multiplier-info">
              Multiplier: <span className="multiplier-value">{multiplier.toFixed(1)}x</span>
            </Typography>
            
            <Typography variant="h5" className="total-reward">
              Total Reward: <span className="reward-value">{multipliedReward}</span> coins
            </Typography>
          </Box>
        </Paper>
        
        <Box className="overlay-actions">
          <Button 
            variant="contained" 
            color="primary"
            onClick={onContinue}
          >
            Collect Reward
          </Button>
          <Button 
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default ChallengeDetailsOverlay;
