import { useState, useEffect } from 'react'
import { 
  Container,
  Box
} from '@mui/material'
import './App.scss'
import ChallengeGame from './components/ChallengeGame'
import Header from './components/Header'
import Footer from './components/Footer'
import ModeSelection from './components/ModeSelection'
import AdminDashboard from './components/admin/AdminDashboard'

function App() {
  const [mode, setMode] = useState(null); // 'admin' or 'user' or null
  const [currentPage, setCurrentPage] = useState('Home');
  
  // Check if mode is already selected in localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('appMode');
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);
  
  const handleSelectMode = (selectedMode) => {
    if (selectedMode) {
      setMode(selectedMode);
      localStorage.setItem('appMode', selectedMode);
    } else {
      setMode(null);
      localStorage.removeItem('appMode');
    }
  };
  
  // This would be used to render different pages based on navigation
  const renderPage = () => {
    if (!mode) {
      return <ModeSelection onSelectMode={handleSelectMode} />;
    }
    
    if (mode === 'admin') {
      return <AdminDashboard />;
    }
    
    // User mode
    switch(currentPage) {
      case 'Home':
      case 'Challenges':
      default:
        return <ChallengeGame />;
    }
  };
  
  return (
    <div className="app">
      <Header mode={mode} onModeChange={handleSelectMode} />
      
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        {renderPage()}
      </Container>
      
      <Footer />
    </div>
  )
}

export default App
