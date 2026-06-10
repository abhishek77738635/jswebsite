import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CollapsibleSidebar({
  title,
  icon: Icon,
  iconClassName = 'text-blue-600 dark:text-blue-400',
  children,
  panelKey = '',
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [panelKey]);

  return (
    <aside className="w-full shrink-0 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-[7.75rem] lg:z-30 lg:flex lg:h-[calc(100vh-7.75rem)] lg:w-64 lg:flex-col lg:self-start lg:border-b-0 lg:border-r lg:overflow-hidden">
      <button
        type="button"
        onClick={() => setMobileOpen((value) => !value)}
        aria-expanded={mobileOpen}
        className="flex w-full shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 text-left dark:border-gray-800 lg:pointer-events-none lg:cursor-default"
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconClassName}`} aria-hidden />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{mobileOpen ? 'Hide' : 'Show'}</span>
          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform dark:text-gray-400 ${mobileOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </div>
      </button>

      <div
        className={`lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden ${
          mobileOpen ? 'block max-h-[min(55vh,28rem)] overflow-y-auto' : 'hidden lg:flex'
        }`}
      >
        {children}
      </div>
    </aside>
  );
}
