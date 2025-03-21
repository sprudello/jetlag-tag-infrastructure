import { useState, useEffect } from 'react';
import { Button, Typography, Box, Slider, Paper } from '@mui/material';
import '../styles/components/shop-overlay.scss';

const ShopOverlay = ({ onClose, onBuyMultiplier, coins, currentMultiplier }) => {
  const [selectedMultiplier, setSelectedMultiplier] = useState(currentMultiplier);
  
  // Calculate cost based on multiplier value
  const calculateCost = (multiplier) => {
    return Math.round(multiplier * 100); // 10x would cost 1000 coins
  };
  
  const handleSliderChange = (event, newValue) => {
    setSelectedMultiplier(newValue);
  };
  
  const handleBuy = () => {
    const cost = calculateCost(selectedMultiplier);
    onBuyMultiplier(selectedMultiplier, cost);
  };
  
  const isAffordable = (multiplier) => {
    return calculateCost(multiplier) <= coins;
  };
  
  // Generate marks for the slider
  const marks = [];
  for (let i = 1; i <= 10; i++) {
    marks.push({ value: i, label: `${i}.0x` });
  }
  
  return (
    <div className="overlay shop-overlay">
      <div className="overlay-content">
        <Typography variant="h4" component="h2" gutterBottom>
          Multiplier Shop
        </Typography>
        
        <Typography variant="h6" className="coin-display">
          <span className="coin-icon">🪙</span> {coins} coins
        </Typography>
        
        <Box className="multiplier-selector">
          <Typography variant="h6" gutterBottom>
            Select Multiplier: <span className="selected-multiplier">{selectedMultiplier.toFixed(1)}x</span>
          </Typography>
          
          <Paper elevation={3} className="slider-container">
            <Slider
              value={selectedMultiplier}
              min={1.0}
              max={10.0}
              step={0.2}
              marks={marks}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value.toFixed(1)}x`}
              className="multiplier-slider"
            />
          </Paper>
          
          <Typography variant="h6" className="cost-display" color={isAffordable(selectedMultiplier) ? "primary" : "error"}>
            Cost: {calculateCost(selectedMultiplier)} coins
          </Typography>
        </Box>
        
        <Box className="shop-actions">
          <Button 
            variant="contained" 
            onClick={handleBuy}
            disabled={!isAffordable(selectedMultiplier) || selectedMultiplier === currentMultiplier}
            color={isAffordable(selectedMultiplier) ? "primary" : "error"}
          >
            Buy Multiplier
          </Button>
          <Button 
            variant="outlined"
            onClick={onClose}
          >
            Close Shop
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default ShopOverlay;
