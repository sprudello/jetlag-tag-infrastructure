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
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/GetUserPenalty/${currentUser.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
          },
        }
      );

      if (response.ok) {
        const penaltyData = await response.json();

        // parse UTC end time
        const utcEndTime = new Date(penaltyData.endTime);

        // (optional) local conversion, if you ever need to display it:
        const offsetMinutes = new Date().getTimezoneOffset();
        const localEndTime = new Date(
          utcEndTime.getTime() - offsetMinutes * 60_000
        );

        // ── THE KEY CHANGE ──
        // Convert remainingMinutes → totalSeconds
        const totalSeconds = Math.round(penaltyData.remainingMinutes * 60);
        const initMin = Math.floor(totalSeconds / 60);
        const initSec = totalSeconds % 60;

        // Store the canonical UTC endTime + full seconds count
        setActivePenalty({
          endTime: utcEndTime,
          localEndTime,
          durationInMinutes: penaltyData.durationInMinutes,
          remainingMinutes: penaltyData.remainingMinutes,
          seconds: totalSeconds,
        });

        // Initialize the display immediately
        setPenaltyTimeRemaining({
          minutes: initMin,
          seconds: initSec,
          formatted: `${initMin}:${initSec.toString().padStart(2, '0')}`,
          hasExpired: false,
        });

        // Persist in localStorage using full seconds
        localStorage.setItem(
          `penalty_${currentUser.userId}`,
          JSON.stringify({
            endTime: utcEndTime.toISOString(),
            seconds: totalSeconds,
            durationInMinutes: penaltyData.durationInMinutes,
            timestamp: Date.now(),
          })
        );
      } else if (response.status === 404) {
        setActivePenalty(null);
        setPenaltyTimeRemaining(null);
        localStorage.removeItem(`penalty_${currentUser.userId}`);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (err) {
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
        const remainingSeconds = penaltyData.seconds - elapsedSeconds;
        
        if (remainingSeconds > 0) {
          // Penalty is still active
          setActivePenalty({
            ...penaltyData,
            seconds: remainingSeconds
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

  useEffect(() => {
    // only start ticking when there *is* an active penalty
    if (!activePenalty) {
      setPenaltyTimeRemaining(null);
      return;
    }
  
    // set up a single interval that runs every 1,000ms
    const timerId = setInterval(() => {
      setActivePenalty(prev => {
        // if somehow it's gone, clear the interval
        if (!prev) {
          clearInterval(timerId);
          return null;
        }
  
        const newTotalSeconds = prev.seconds - 1;
        // expired?
        if (newTotalSeconds <= 0) {
          clearInterval(timerId);
          setPenaltyTimeRemaining(null);
          localStorage.removeItem(`penalty_${currentUser?.userId}`);
          return null;
        }
  
        // compute display values
        const minutes = Math.floor(newTotalSeconds / 60);
        const seconds = newTotalSeconds % 60;
  
        // update the formatted remaining time
        setPenaltyTimeRemaining({
          minutes,
          seconds,
          formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          hasExpired: false
        });
  
        // persist the tick
        if (currentUser?.userId) {
          const stored = localStorage.getItem(`penalty_${currentUser.userId}`);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              localStorage.setItem(
                `penalty_${currentUser.userId}`,
                JSON.stringify({
                  ...data,
                  seconds: newTotalSeconds,
                  timestamp: Date.now()
                })
              );
            } catch {/* ignore */}
          }
        }
  
        // return the updated penalty
        return { ...prev, seconds: newTotalSeconds };
      });
    }, 1000);
  
    // clean up once the penalty ends or the component unmounts
    return () => clearInterval(timerId);
  
    // only re-run this setup when a *new* penalty arrives
    // (we key off a stable property that won’t change on every tick,
    // e.g. the original endTime)
  }, [activePenalty?.endTime, currentUser?.userId]);

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
    fetchPenaltyData,
  };
};

export default usePenaltyTimer;