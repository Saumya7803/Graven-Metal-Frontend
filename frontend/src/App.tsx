import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RouteLoader } from './components/ui/RouteLoader';

const Layout = lazy(() => import('./layout/Layout').then((m) => ({ default: m.Layout })));
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const ProductDetailsPage = lazy(() =>
  import('./pages/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const LivePricesPage = lazy(() =>
  import('./pages/LivePricesPage').then((m) => ({ default: m.LivePricesPage }))
);
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const QuoteRequestPage = lazy(() =>
  import('./pages/QuoteRequestPage').then((m) => ({ default: m.QuoteRequestPage }))
);
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then((m) => ({ default: m.FAQPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const PrivacyPolicyPage = lazy(() =>
  import('./pages/policies/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsConditionsPage = lazy(() =>
  import('./pages/policies/TermsConditionsPage').then((m) => ({ default: m.TermsConditionsPage }))
);
const ShippingPolicyPage = lazy(() =>
  import('./pages/policies/ShippingPolicyPage').then((m) => ({ default: m.ShippingPolicyPage }))
);
const ReturnPolicyPage = lazy(() =>
  import('./pages/policies/ReturnPolicyPage').then((m) => ({ default: m.ReturnPolicyPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/system/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const RouteErrorPage = lazy(() =>
  import('./pages/system/RouteErrorPage').then((m) => ({ default: m.RouteErrorPage }))
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<RouteLoader />}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<Layout />),
    errorElement: withSuspense(<RouteErrorPage />),
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'products', element: withSuspense(<ProductsPage />) },
      { path: 'products/:id', element: withSuspense(<ProductDetailsPage />) },
      { path: 'categories', element: withSuspense(<CategoriesPage />) },
      { path: 'live-prices', element: withSuspense(<LivePricesPage />) },
      { path: 'about', element: withSuspense(<AboutPage />) },
      { path: 'quote-request', element: withSuspense(<QuoteRequestPage />) },
      { path: 'contact', element: withSuspense(<ContactPage />) },
      { path: 'faq', element: withSuspense(<FAQPage />) },
      { path: 'blog', element: withSuspense(<BlogPage />) },
      { path: 'privacy-policy', element: withSuspense(<PrivacyPolicyPage />) },
      { path: 'terms-conditions', element: withSuspense(<TermsConditionsPage />) },
      { path: 'shipping-policy', element: withSuspense(<ShippingPolicyPage />) },
      { path: 'return-policy', element: withSuspense(<ReturnPolicyPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export function App() {
  return <RouterProvider router={router} />;
}
