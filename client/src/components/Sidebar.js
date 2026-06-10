import React from 'react';
import { Filter } from 'lucide-react';
import CollapsibleSidebar from './CollapsibleSidebar';

function FilterPanelBody({
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  showPremiumOnly,
  onPremiumToggle,
  showFreeOnly,
  onFreeToggle,
  categories,
  difficulties,
  stats,
}) {
  return (
    <div className="space-y-6 p-4 pb-8 lg:flex-1 lg:overflow-y-auto">
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Difficulty</h3>
        <div className="space-y-2">
          {difficulties.map((difficulty) => (
            <label
              key={difficulty}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={selectedDifficulty === difficulty}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span
                className={`text-sm ${
                  difficulty === 'Beginner'
                    ? 'text-green-700 dark:text-green-400'
                    : difficulty === 'Intermediate'
                      ? 'text-yellow-700 dark:text-yellow-400'
                      : difficulty === 'Advanced'
                        ? 'text-sky-800 dark:text-sky-400'
                        : difficulty === 'Expert'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {difficulty}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Access type</h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={onFreeToggle}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Free only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800">
            <input
              type="checkbox"
              checked={showPremiumOnly}
              onChange={onPremiumToggle}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Premium only</span>
          </label>
        </div>
      </section>

      {stats != null ? (
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/80">
          <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Overview</h4>
          <dl className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between gap-2">
              <dt>This page</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{stats.listed ?? '—'}</dd>
            </div>
            {stats.total != null ? (
              <div className="flex justify-between gap-2">
                <dt>Total matching</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{stats.total}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar({
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  showPremiumOnly,
  onPremiumToggle,
  showFreeOnly,
  onFreeToggle,
  categories = ['All'],
  difficulties = ['All'],
  stats = null,
  panelKey = '',
}) {
  return (
    <CollapsibleSidebar
      title="Filters"
      icon={Filter}
      iconClassName="text-blue-600 dark:text-blue-400"
      panelKey={panelKey}
    >
      <FilterPanelBody
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={onDifficultyChange}
        showPremiumOnly={showPremiumOnly}
        onPremiumToggle={onPremiumToggle}
        showFreeOnly={showFreeOnly}
        onFreeToggle={onFreeToggle}
        categories={categories}
        difficulties={difficulties}
        stats={stats}
      />
    </CollapsibleSidebar>
  );
}
