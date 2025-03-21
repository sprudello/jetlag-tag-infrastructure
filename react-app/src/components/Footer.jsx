import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import '../styles/components/footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Challenges', path: '/challenges' },
    { name: 'Transportations', path: '/transportations' },
    { name: 'Items', path: '/items' },
    { name: 'Profile', path: '/profile' }
  ];
  
  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} sx={{ fontSize: '0.875rem' }}>
          <Grid item xs={12} md={4} className="footer-section">
            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box component="ul" className="footer-links">
              <Grid container spacing={1}>
                {navItems.map((item) => (
                  <Grid item xs={4} key={item.name}>
                    <Box component="li">
                      <Link href={item.path} color="inherit">
                        {item.name}
                      </Link>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          
          <Grid item xs={12} md={3} className="footer-section" sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.875rem' }}
            >
              © {currentYear} All rights reserved.
            </Typography>
          </Grid>
          
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          
          <Grid item xs={12} md={4} className="footer-section" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              Credits
            </Typography>
            <Box component="ul" className="footer-links" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box component="li">
                <Link href="https://github.com/sprudello" target="_blank" rel="noopener">
                  Sprudello
                </Link>
              </Box>
              <Box component="li">
                <Link href="https://github.com/timog06" target="_blank" rel="noopener">
                  Timog
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
