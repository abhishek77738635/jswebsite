import React from 'react';
import { Code, Menu, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { isAdminUser } from '../constants/admin';

const Header = ({ onMenuToggle }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const showAdmin = isAdminUser(currentUser);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-gray-800 bg-gray-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Code className="h-8 w-8 shrink-0 text-blue-400" aria-hidden />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold sm:text-xl">JS Interview Prep</h1>
            <p className="hidden truncate text-xs text-gray-300 sm:block">Master JavaScript Interviews</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {showAdmin && (
            <Link
              to="/admin"
              className="hidden items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm font-medium hover:bg-gray-700 sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
          {currentUser ? (
            <div className="hidden md:flex md:items-center md:gap-2">
              <div className="flex max-w-[200px] items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt=""
                    className="h-6 w-6 shrink-0 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                )}
                <span className="truncate text-sm font-medium" title={currentUser.email}>
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-700 md:flex"
            >
              <User className="h-4 w-4" />
              Sign in
            </Link>
          )}

          {showAdmin && (
            <Link
              to="/admin"
              className="rounded-lg border border-gray-600 bg-gray-800 p-2 sm:hidden"
              aria-label="Admin panel"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}

          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg p-2 hover:bg-gray-800 lg:hidden"
            aria-label={onMenuToggle ? 'Open filters' : 'Toggle menu'}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
