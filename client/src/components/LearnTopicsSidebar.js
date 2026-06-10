import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { JS_THEORY_TOPICS } from '../constants/jsTheory';
import CollapsibleSidebar from './CollapsibleSidebar';

const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced'];

const LEVEL_NAV_STYLES = {
  Beginner: 'text-green-700 dark:text-green-400',
  Intermediate: 'text-amber-700 dark:text-amber-400',
  Advanced: 'text-red-700 dark:text-red-400',
};

const LEVEL_NAV_DOTS = {
  Beginner: 'bg-green-500',
  Intermediate: 'bg-amber-500',
  Advanced: 'bg-red-500',
};

function TopicsPanelBody({ activeTopicId, onTopicChange }) {
  return (
    <nav className="space-y-4 p-4 pb-8 lg:flex-1 lg:overflow-y-auto" aria-label="Theory topics">
      {LEVEL_ORDER.map((level) => {
        const items = JS_THEORY_TOPICS.filter((t) => t.level === level);
        if (!items.length) return null;
        return (
          <section key={level}>
            <h3
              className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${LEVEL_NAV_STYLES[level]}`}
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_NAV_DOTS[level]}`} aria-hidden />
              {level}
            </h3>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTopicChange(item.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                    activeTopicId === item.id
                      ? 'bg-violet-600 font-semibold text-white dark:bg-violet-500'
                      : 'font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="truncate leading-snug">{item.title}</span>
                  {activeTopicId === item.id ? <ChevronRight className="h-4 w-4 shrink-0 opacity-90" /> : null}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </nav>
  );
}

export default function LearnTopicsSidebar({ activeTopicId, onTopicChange, panelKey = '' }) {
  return (
    <CollapsibleSidebar
      title="Topics"
      icon={BookOpen}
      iconClassName="text-violet-600 dark:text-violet-400"
      panelKey={`${panelKey}-${activeTopicId}`}
    >
      <TopicsPanelBody activeTopicId={activeTopicId} onTopicChange={onTopicChange} />
    </CollapsibleSidebar>
  );
}
