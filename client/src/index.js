import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import App from './App';

const routerBasename = (process.env.PUBLIC_URL || '').replace(/\/$/, '') || undefined;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className: 'text-sm shadow-lg',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
