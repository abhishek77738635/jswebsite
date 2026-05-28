import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon,
  Sun,
  ArrowLeft,
  BookOpen,
  BarChart3,
  Bookmark,
  Calendar,
  Code2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import BrandLogo from '../components/BrandLogo';
import { formatPremiumPrice } from '../constants/pricing';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Premium interview questions',
    description: 'Full answers, explanations, and curated JS challenges.',
  },
  {
    icon: BarChart3,
    title: 'Progress dashboard',
    description: 'Streaks, heatmaps, and weak-area insights.',
  },
  {
    icon: Bookmark,
    title: 'Bookmarks & notes',
    description: 'Save questions and add private notes as you practice.',
  },
  {
    icon: Calendar,
    title: 'Daily challenge',
    description: 'One focused challenge every day with a leaderboard.',
  },
  {
    icon: Code2,
    title: 'In-browser compiler',
    description: 'Run snippets safely without leaving the app.',
  },
];

function Login() {
  const { loginWithGoogle, currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const loginReason = location.state?.reason;
  const isPremiumIntent = loginReason === 'premium';

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, from, navigate]);

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      toast.success(
        isPremiumIntent ? 'Signed in — you can complete payment next.' : 'Signed in successfully.',
      );
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Sign-in failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950">
        <Spinner className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/10" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-600/10" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to challenges
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 pt-2 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:pb-16 lg:pt-6">
        <section className="flex-1 lg:py-8">
          <BrandLogo
            titleClassName="text-3xl sm:text-4xl"
            sloganClassName="mt-1 text-base text-gray-600 dark:text-gray-400"
          />
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Practice JavaScript with curated challenges, track your progress, and level up your
            interview prep — all in one place.
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-orange-400/15 text-violet-600 ring-1 ring-violet-500/20 dark:from-violet-400/10 dark:to-orange-400/10 dark:text-violet-300 dark:ring-violet-400/20">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full shrink-0 lg:max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-8">
            {isPremiumIntent ? (
              <div className="mb-6 flex gap-3 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/30">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 text-gray-950">
                  <Shield className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Sign in to unlock premium
                  </p>
                  <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/80">
                    After signing in, you can pay {formatPremiumPrice()} once to access all premium questions,
                    answers, and explanations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Sparkles className="h-5 w-5" aria-hidden />
                <p className="text-sm font-medium">Free to sign in · No password required</p>
              </div>
            )}

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {isPremiumIntent ? 'Sign in to continue' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Use your Google account. We only use it to save your progress and payment status.
            </p>

            {error ? (
              <div
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {loading ? (
                <Spinner className="h-5 w-5" label={null} />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>

            <p className="mt-6 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-500">
              By continuing, you agree to use Upchallenges for personal learning. Payment is
              processed securely via Cashfree.
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Already exploring?{' '}
            <Link to="/" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
              Browse free questions
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;
