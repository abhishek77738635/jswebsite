import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AdminPortal from './pages/AdminPortal';
import Login from './pages/Login';
import HelpCenter from './pages/HelpCenter';
import Terms from './pages/Terms';
import { useAuth } from './contexts/AuthContext';
import { isAdminUser } from './constants/admin';
import toast from 'react-hot-toast';
import Spinner from './components/Spinner';
import './App.css';

function RequireAuth({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    if (!isAdminUser(currentUser)) {
      toast.error('Only the site admin can open this panel.', { id: 'admin-deny' });
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />;
  }

  if (!isAdminUser(currentUser)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950">
        <Spinner className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Checking access…</p>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminPortal />
            </RequireAdmin>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
