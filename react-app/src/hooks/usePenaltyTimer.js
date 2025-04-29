import { useState, useEffect } from 'react';
import API_CONFIG from '../config/apiConfig';

/**
 * Custom hook to fetch and manage penalty timer
 * @param {Object} currentUser - Current user object with userId and token
 * @returns {Object} - Penalty timer state and functions
 */
const usePenaltyTimer = (currentUser) => {
  const [activePenalty, setActivePenalty] = useState(null);
  const [penaltyTimeRemaining, setPenaltyTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch penalty data from API
  const fetchPenaltyData = async () => {
    if (!currentUser?.userId || !currentUser?.token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/GetUserPenalty/${currentUser.userId}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      
      if (response.ok) {
        const penaltyData = await response.json();
        
        // Convert UTC endTime to local time for display purposes only
        const utcEndTime = new Date(penaltyData.endTime);
        const localEndTime = new Date(utcEndTime);
        
        // Log the conversion for debugging
        console.log('Penalty end time (UTC):', utcEndTime.toISOString());
        console.log('Penalty end time (Local):', localEndTime.toLocaleString());
        console.log('User timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        
        // Use the remainingMinutes from the API for the timer
        const remainingMinutes = penaltyData.remainingMinutes;
        const totalSeconds = Math.round(remainingMinutes * 60);
        
        setActivePenalty({
          endTime: utcEndTime,
          durationInMinutes: penaltyData.durationInMinutes,
          remainingMinutes: remainingMinutes,
          totalSeconds: totalSeconds
        });
        
        // Store in localStorage for persistence
        localStorage.setItem(`penalty_${currentUser.userId}`, JSON.stringify({
          endTime: utcEndTime.toISOString(),
          durationInMinutes: penaltyData.durationInMinutes,
          remainingMinutes: remainingMinutes,
          totalSeconds: totalSeconds,
          timestamp: Date.now() // Add timestamp for local countdown
        }));
      } else if (response.status === 404) {
        // No active penalty - clear any stored penalty
        setActivePenalty(null);
        localStorage.removeItem(`penalty_${currentUser.userId}`);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (err) {
      // Only set error for non-404 responses
      if (!err.message.includes('404')) {
        setError(err.message);
        console.error('Error fetching penalty data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check localStorage for cached penalty on initial load
  useEffect(() => {
    if (!currentUser?.userId) return;
    
    const storedPenalty = localStorage.getItem(`penalty_${currentUser.userId}`);
    if (storedPenalty) {
      try {
        const penaltyData = JSON.parse(storedPenalty);
        const now = Date.now();
        const storedTime = penaltyData.timestamp || 0;
        const elapsedSeconds = Math.floor((now - storedTime) / 1000);
        
        // Calculate remaining seconds based on elapsed time since storage
        const remainingSeconds = penaltyData.totalSeconds - elapsedSeconds;
        
        if (remainingSeconds > 0) {
          // Penalty is still active
          setActivePenalty({
            ...penaltyData,
            totalSeconds: remainingSeconds
          });
        } else {
          // Penalty has expired locally, clear it
          localStorage.removeItem(`penalty_${currentUser.userId}`);
          setActivePenalty(null);
        }
      } catch (e) {
        console.error("Error parsing stored penalty:", e);
      }
    }
    
    // Fetch fresh penalty data from API
    fetchPenaltyData();
  }, [currentUser?.userId]);

  // Update countdown timer
  useEffect(() => {
    if (!activePenalty) {
      setPenaltyTimeRemaining(null);
      return;
    }
    
    const updateRemainingTime = () => {
      if (!activePenalty.totalSeconds) return;
      
      // Decrement the total seconds
      const newTotalSeconds = activePenalty.totalSeconds - 1;
      
      if (newTotalSeconds <= 0) {
        // Penalty has expired
        setActivePenalty(null);
        setPenaltyTimeRemaining(null);
        localStorage.removeItem(`penalty_${currentUser?.userId}`);
        return;
      }
      
      // Calculate minutes and seconds
      const minutes = Math.floor(newTotalSeconds / 60);
      const seconds = newTotalSeconds % 60;
      
      // Update the active penalty with new total seconds
      setActivePenalty(prev => ({
        ...prev,
        totalSeconds: newTotalSeconds
      }));
      
      // Update the formatted time remaining
      setPenaltyTimeRemaining({
        minutes,
        seconds,
        formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        hasExpired: false
      });
      
      // Update localStorage
      if (currentUser?.userId) {
        const storedPenalty = localStorage.getItem(`penalty_${currentUser.userId}`);
        if (storedPenalty) {
          try {
            const penaltyData = JSON.parse(storedPenalty);
            localStorage.setItem(`penalty_${currentUser.userId}`, JSON.stringify({
              ...penaltyData,
              totalSeconds: newTotalSeconds,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error("Error updating stored penalty:", e);
          }
        }
      }
    };
    
    // Initial update
    updateRemainingTime();
    
    // Update every second
    const timerId = setInterval(updateRemainingTime, 1000);
    
    return () => clearInterval(timerId);
  }, [activePenalty, currentUser?.userId]);

  // Refresh penalty data periodically
  useEffect(() => {
    if (!currentUser?.userId || !currentUser?.token) return;
    
    // Refresh every minute to ensure sync with server
    const refreshInterval = setInterval(fetchPenaltyData, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [currentUser?.userId, currentUser?.token]);

  return {
    activePenalty,
    penaltyTimeRemaining,
    loading,
    error,
    fetchPenaltyData
  };
};

export default usePenaltyTimer;
