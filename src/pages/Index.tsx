import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  // Check if user is already authenticated
  const isAuthenticated = localStorage.getItem('nchs_auth');
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm />;
};

export default Index;
