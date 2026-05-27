import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { RouteLoader } from './components/ui/RouteLoader';

const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const SuperAdminPage = lazy(() =>
  import('./pages/SuperAdminPage').then((m) => ({ default: m.SuperAdminPage }))
);
const AuthPage = lazy(() => import('./pages/auth/AuthPage').then((m) => ({ default: m.AuthPage })));
const NotFoundPage = lazy(() =>
  import('./pages/system/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const RouteErrorPage = lazy(() =>
  import('./pages/system/RouteErrorPage').then((m) => ({ default: m.RouteErrorPage }))
);
const UnauthorizedPage = lazy(() =>
  import('./pages/system/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<RouteLoader />}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(
      <PublicOnlyRoute>
        <AuthPage />
      </PublicOnlyRoute>
    ),
    errorElement: withSuspense(<RouteErrorPage />),
  },
  {
    path: '/auth',
    element: withSuspense(
      <PublicOnlyRoute>
        <AuthPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/admin',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['admin', 'editor', 'super_admin']}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/super-admin',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['super_admin']}>
        <SuperAdminPage />
      </ProtectedRoute>
    ),
  },
  { path: '/unauthorized', element: withSuspense(<UnauthorizedPage />) },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export function App() {
  return <RouterProvider router={router} />;
}
