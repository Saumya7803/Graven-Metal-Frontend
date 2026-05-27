import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { App } from './App';
import { AuthProvider } from './components/auth/AuthProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              background: '#0d1218',
              color: '#f4deb3',
              border: '1px solid rgba(214,182,118,0.35)',
              boxShadow: '0 14px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(217,182,106,0.18)',
              borderRadius: '12px',
              padding: '12px 14px',
            },
            iconTheme: {
              primary: '#d9b66a',
              secondary: '#0d1218',
            },
            success: {
              style: {
                border: '1px solid rgba(52, 211, 153, 0.4)',
              },
            },
            error: {
              duration: 4200,
              style: {
                border: '1px solid rgba(248, 113, 113, 0.45)',
              },
            },
          }}
        />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
