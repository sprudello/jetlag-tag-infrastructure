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
import Home from './components/Home'
import Challenges from './components/Challenges'
import Transportations from './components/Transportations'
import Items from './components/Items'
import Profile from './components/Profile'
import AdminProfile from './components/admin/AdminProfile'
import UsersManager from './components/admin/UsersManager'
import ChallengeManager from './components/admin/ChallengeManager'
import ShopItemManager from './components/admin/ShopItemManager'
import TransportationManager from './components/admin/TransportationManager'
import PenaltyManager from './components/admin/PenaltyManager'
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
      switch(currentPage) {
        case 'Dashboard':
          return <AdminDashboard />;
        case 'Challenges':
          return <ChallengeManager />;
        case 'Shop Items':
          return <ShopItemManager />;
        case 'Transportation':
          return <TransportationManager />;
        case 'Penalty Time':
          return <PenaltyManager />;
        case 'Users':
          return <UsersManager />;
        case 'AdminProfile':
          return <AdminProfile />;
        default:
          return <AdminDashboard />;
      }
    }
    
    // Regular user mode
    switch(currentPage) {
      case 'Home':
        return <Home />;
      case 'Challenges':
        return <Challenges />;
      case 'Transportations':
        return <Transportations />;
      case 'Items':
        return <Items />;
      case 'Profile':
        return <Profile />;
      case 'AdminProfile':
        return <AdminProfile />;
      case 'Users':
        return <UsersManager />;
      default:
        return <Home />;
    }
  };
  
  return (
    <div className="app">
      {isAuthenticated && <Header onPageChange={setCurrentPage} />}
      
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        {renderPage()}
      </Container>
      
      {isAuthenticated && <Footer />}
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
