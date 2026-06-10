import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter({ className = '' }) {
  return (
    <footer
      className={`border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500 ${className}`}
    >
      <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Site links">
        <Link
          to="/help"
          className="font-medium text-gray-600 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
        >
          Help Center
        </Link>
        <Link
          to="/terms"
          className="font-medium text-gray-600 transition hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
        >
          Terms &amp; Conditions
        </Link>
      </nav>
      <p>&copy; 2026 Upchallenges. Level Up Your Logic.</p>
    </footer>
  );
}
