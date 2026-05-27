import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LoadingOverlay } from '../ui/LoadingOverlay';

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export function ProtectedRoute({ children, allowedRoles = [] }: Props) {
  const { isReady, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
