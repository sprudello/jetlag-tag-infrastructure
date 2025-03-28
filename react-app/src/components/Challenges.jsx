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
  Paper
} from '@mui/material';
import { 
  EmojiEvents as ChallengeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/challenges.scss';

const Challenges = () => {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5296';

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch(`${API_URL}/allChallenges`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setChallenges(data.filter(challenge => challenge.isActive));
        } else {
          setError('Failed to load challenges');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [currentUser]);

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

      <Box sx={{ mt: 4 }}>
        {challenges.length === 0 ? (
          <Typography sx={{ p: 2 }}>
            No challenges available
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {challenges.map(challenge => (
              <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                <Card className="challenge-card">
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {challenge.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="card-description">
                      {challenge.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box className="card-details">
                      <Chip 
                        label={`${challenge.reward} coins`} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" variant="contained" fullWidth>
                      Accept Challenge
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Challenges;
