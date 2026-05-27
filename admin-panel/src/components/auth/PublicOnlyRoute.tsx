import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LoadingOverlay } from '../ui/LoadingOverlay';

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, defaultRoute } = useAuth();

  if (!isReady) return <LoadingOverlay />;
  if (isAuthenticated) return <Navigate to={defaultRoute} replace />;

  return <>{children}</>;
}
