import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Rule as RuleIcon
} from '@mui/icons-material';
import gameRules from '../data/gameRules.json';

const GameRules = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<RuleIcon />}
        onClick={handleOpen}
        sx={{ my: 2 }}
      >
        Game Rules
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RuleIcon sx={{ mr: 1 }} />
            Game Rules
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Ziel</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {gameRules.rules.goal.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={rule} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Spielverlauf</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {gameRules.rules.gameFlow.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={rule} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Während des Spiels</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {gameRules.rules.duringGame.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={rule} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameRules;
