import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SiteFooter from './SiteFooter';

export default function StaticPageLayout({ title, subtitle, children }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/10" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-600/10" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:px-6">
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

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">{subtitle}</p>
          ) : null}
        </div>

        <div className="space-y-6">{children}</div>

        <SiteFooter className="mt-16" />
      </main>
    </div>
  );
}
