import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { RouteLoader } from './components/ui/RouteLoader';

const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const ProductManagementPage = lazy(() =>
  import('./pages/ProductManagementPage').then((m) => ({ default: m.ProductManagementPage }))
);
const SuperAdminPage = lazy(() =>
  import('./pages/SuperAdminPage').then((m) => ({ default: m.SuperAdminPage }))
);
const OperationsDashboardPage = lazy(() =>
  import('./pages/OperationsDashboardPage').then((m) => ({ default: m.OperationsDashboardPage }))
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
    path: '/admin/products',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['admin', 'editor', 'developer', 'data_entry', 'super_admin']}>
        <ProductManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lqt',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['lqt', 'super_admin']}>
        <OperationsDashboardPage kind="lqt" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sales',
    element: <Navigate to="/cro" replace />,
  },
  {
    path: '/cro',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['sales', 'super_admin']}>
        <OperationsDashboardPage kind="sales" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/procurement',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['procurement', 'super_admin']}>
        <OperationsDashboardPage kind="procurement" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cct',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['cct', 'super_admin']}>
        <OperationsDashboardPage kind="cct" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['inventory', 'super_admin']}>
        <OperationsDashboardPage kind="inventory" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dispatch',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['dispatch', 'super_admin']}>
        <OperationsDashboardPage kind="dispatch" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/finance',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
        <OperationsDashboardPage kind="finance" />
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
