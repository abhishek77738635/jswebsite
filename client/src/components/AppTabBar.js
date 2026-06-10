import React from 'react';
import { ListChecks, Code2, Bookmark, BarChart3, CalendarDays, GraduationCap } from 'lucide-react';

const TABS = [
  { id: 'questions', label: 'Questions', icon: ListChecks },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
  { id: 'compiler', label: 'Compiler', icon: Code2 },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'daily', label: 'Daily', icon: CalendarDays },
];

const TAB_HINTS = {
  questions: 'Browse challenges and open any in the compiler.',
  learn: 'JS Forge — theory, diagrams, examples & quizzes from basics to advanced.',
  compiler: 'Advanced playground with snippets, assertions, and console helpers.',
  bookmarks: 'Save questions, write notes, and revisit later.',
  dashboard: 'Track streaks, solved counts, and weak areas.',
  daily: 'One curated question per day with ranking.',
};

export default function AppTabBar({ activeTab, onTabChange }) {
  return (
    <div className="border-t border-gray-100 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto max-w-[1600px] px-4">
        <div className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <p className="hidden border-t border-gray-100 pt-1 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:block">
          {TAB_HINTS[activeTab] || ''}
        </p>
      </div>
    </div>
  );
}
