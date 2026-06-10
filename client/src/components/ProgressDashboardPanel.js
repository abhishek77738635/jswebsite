import React from 'react';
import { Flame, Bookmark, StickyNote, Trophy, ChartBar, AlertTriangle, RefreshCw, TrendingUp, CalendarDays } from 'lucide-react';
import Spinner from './Spinner';
import {
  ProgressDonut,
  DailyActivityChart,
  CumulativeProgressChart,
  DifficultyProgressChart,
  CategoryProgressChart,
} from './DashboardCharts';

function percentage(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

export default function ProgressDashboardPanel({ data, loading = false, error = '', onReload }) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Spinner className="h-10 w-10 text-blue-600 dark:text-blue-400" label="Loading progress dashboard…" />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Progress Dashboard</h3>
        <button
          type="button"
          onClick={onReload}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {!data ? null : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/40">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
                <Trophy className="h-4 w-4" />
                Solved
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-950 dark:text-blue-100">{data.solvedCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/50 dark:bg-violet-950/40">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-violet-900 dark:text-violet-200">
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </div>
              <p className="mt-2 text-2xl font-bold text-violet-950 dark:text-violet-100">{data.bookmarkedCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                <StickyNote className="h-4 w-4" />
                Notes
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-100">{data.notesCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/40">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                <Flame className="h-4 w-4" />
                Streak
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-950 dark:text-emerald-100">{data.streakCurrent || 0} days</p>
              <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-200/80">Best: {data.streakBest || 0}</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Overall progress
              </div>
              <ProgressDonut
                percent={data.overallProgress?.percent ?? 0}
                solved={data.overallProgress?.solved ?? data.solvedCount ?? 0}
                total={data.overallProgress?.total ?? 0}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <CalendarDays className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Daily activity
              </div>
              <DailyActivityChart data={data.dailyActivity || []} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Cumulative progress
            </div>
            <CumulativeProgressChart data={data.cumulativeProgress || []} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <ChartBar className="h-4 w-4" />
                Progress by topic
              </div>
              <CategoryProgressChart rows={data.solvedByCategory || []} />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <ChartBar className="h-4 w-4" />
                Progress by difficulty
              </div>
              <DifficultyProgressChart rows={data.solvedByDifficulty || []} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              <ChartBar className="h-4 w-4" />
              Weak-area heatmap
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(data.heatmap || []).slice(0, 18).map((cell) => {
                const bg =
                  cell.solveRate >= 0.7
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                    : cell.solveRate >= 0.4
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                      : 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200';
                return (
                  <div key={`${cell.category}-${cell.difficulty}`} className={`rounded-xl p-3 ${bg}`}>
                    <p className="text-xs font-semibold">{cell.category}</p>
                    <p className="text-xs opacity-80">{cell.difficulty}</p>
                    <p className="mt-1 text-sm font-bold">
                      {cell.solved}/{cell.total} ({percentage(cell.solveRate)})
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              <AlertTriangle className="h-4 w-4" />
              Top weak topics
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.weakAreas || []).map((item) => (
                <span
                  key={`weak-${item.name}`}
                  className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
                >
                  {item.name} • {item.solved}/{item.total}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
