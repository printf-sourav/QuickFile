import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PrivateRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Only pass 'from' if it's not already /login or /signup to avoid loops
    const shouldPassFrom = location.pathname !== '/login' && location.pathname !== '/signup';
    return (
      <Navigate 
        to="/login" 
        replace 
        state={shouldPassFrom ? { from: location.pathname } : undefined} 
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
