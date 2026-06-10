import React, { useCallback, useEffect, useState } from 'react';
import { Menu, User, LayoutDashboard, Search, Moon, Sun, RefreshCw, LifeBuoy } from 'lucide-react';
import BrandLogo from './BrandLogo';
import ProfilePanel from './ProfilePanel';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { isAdminUser } from '../constants/admin';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const Header = ({ searchTerm, onSearchChange, isSearching }) => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const showAdmin = isAdminUser(currentUser);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!currentUser) {
      setProfile(null);
      setDashboard(null);
      return;
    }

    setProfileLoading(true);
    setDashboardLoading(true);
    try {
      const [profileRes, dashboardRes] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getProgressDashboard(),
      ]);
      if (profileRes?.success) setProfile(profileRes.data);
      if (dashboardRes?.success) setDashboard(dashboardRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
      setDashboardLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (profileOpen) {
      loadProfileData();
    }
  }, [profileOpen, loadProfileData]);

  useEffect(() => {
    const openProfile = () => setProfileOpen(true);
    window.addEventListener('open-profile', openProfile);
    return () => window.removeEventListener('open-profile', openProfile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setProfileOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleSavePhone = async (phone) => {
    try {
      setSavingPhone(true);
      const res = await apiService.updateUserProfile({ phone });
      if (res?.success) {
        setProfile(res.data);
        toast.success('Phone number saved.');
      }
    } catch (err) {
      toast.error(err.message || 'Could not save phone number.');
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <>
      <header className="shrink-0 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="flex min-w-0 shrink-0">
              <BrandLogo showSlogan sloganClassName="hidden truncate text-xs md:block" />
            </Link>

            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search title, prompt, tags..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400"
              />
              {isSearching ? (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" aria-hidden />
                </span>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link
                to="/help"
                className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800 sm:hidden"
                aria-label="Help center"
              >
                <LifeBuoy className="h-5 w-5" />
              </Link>
              <Link
                to="/help"
                className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 sm:flex"
              >
                <LifeBuoy className="h-4 w-4" />
                Help
              </Link>

              {showAdmin ? (
                <Link
                  to="/admin"
                  className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 sm:flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}

              {!currentUser ? (
                <Link
                  to="/login"
                  className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 md:flex"
                >
                  <User className="h-4 w-4" />
                  Sign in
                </Link>
              ) : null}

              {showAdmin ? (
                <Link
                  to="/admin"
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800 sm:hidden"
                  aria-label="Admin panel"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              ) : null}

              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open profile"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <ProfilePanel
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        currentUser={currentUser}
        profile={profile}
        profileLoading={profileLoading}
        dashboard={dashboard}
        dashboardLoading={dashboardLoading}
        onSavePhone={handleSavePhone}
        onLogout={handleLogout}
        savingPhone={savingPhone}
      />
    </>
  );
};

export default Header;
