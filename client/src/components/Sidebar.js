import React from 'react';
import { Filter, X } from 'lucide-react';

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
    <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-8">
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Difficulty</h3>
        <div className="space-y-2">
          {difficulties.map((difficulty) => (
            <label key={difficulty} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50">
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
                    ? 'text-green-700'
                    : difficulty === 'Intermediate'
                      ? 'text-yellow-700'
                      : difficulty === 'Advanced'
                        ? 'text-sky-800'
                      : difficulty === 'Expert'
                        ? 'text-red-700'
                        : 'text-gray-700'
                }`}
              >
                {difficulty}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Access type</h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={onFreeToggle}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Free only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showPremiumOnly}
              onChange={onPremiumToggle}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Premium only</span>
          </label>
        </div>
      </section>

      {stats != null ? (
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50/50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-800">Overview</h4>
          <dl className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between gap-2">
              <dt>This page</dt>
              <dd className="font-medium text-gray-900">{stats.listed ?? '—'}</dd>
            </div>
            {stats.total != null && (
              <div className="flex justify-between gap-2">
                <dt>Total matching</dt>
                <dd className="font-medium text-gray-900">{stats.total}</dd>
              </div>
            )}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
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
}) {
  const panelProps = {
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
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close filters backdrop"
          onClick={onClose}
        />
      ) : null}

      {/* Mobile drawer */}
      <aside
        className={[
          'fixed left-0 top-0 z-50 flex h-full w-[min(88vw,18rem)] -translate-x-full flex-col bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : '',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        <div className="shrink-0 border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" aria-hidden />
              <h2 className="font-semibold text-gray-900">Filters</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100" aria-label="Close filters">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        <FilterPanelBody {...panelProps} />
      </aside>

      {/* Desktop: sticky column */}
      <aside
        className="relative hidden shrink-0 border-r border-gray-200 bg-white shadow-sm lg:sticky lg:top-[4rem] lg:z-30 lg:flex lg:h-[calc(100vh-4rem)] lg:w-64 lg:flex-col lg:self-start lg:overflow-hidden"
      >
        <div className="shrink-0 border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" aria-hidden />
            <h2 className="font-semibold text-gray-900">Filters</h2>
          </div>
        </div>
        <FilterPanelBody {...panelProps} />
      </aside>
    </>
  );
}
