import { useState } from 'react'
import { 
  Container,
  Box
} from '@mui/material'
import './App.scss'
import ChallengeGame from './components/ChallengeGame'
import Header from './components/Header'
import Footer from './components/Footer'
import AdminDashboard from './components/admin/AdminDashboard'
import AuthPage from './components/auth/AuthPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('Home');
  const { isAuthenticated, currentUser } = useAuth();
  
  // This would be used to render different pages based on navigation
  const renderPage = () => {
    // If not authenticated, show auth page
    if (!isAuthenticated) {
      return <AuthPage />;
    }
    
    // If authenticated, check if admin
    if (currentUser?.isAdmin) {
      return <AdminDashboard />;
    }
    
    // Regular user mode
    switch(currentPage) {
      case 'Home':
      case 'Challenges':
      default:
        return <ChallengeGame />;
    }
  };
  
  return (
    <div className="app">
      <Header onPageChange={setCurrentPage} />
      
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        {renderPage()}
      </Container>
      
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
