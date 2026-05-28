import React from 'react';
import { CalendarDays, Crown, Medal, TerminalSquare, Flag, RefreshCw, Loader2 } from 'lucide-react';
import Spinner from './Spinner';

export default function DailyChallengePanel({
  data,
  loading = false,
  error = '',
  hasPaid = false,
  onReload,
  onOpenCompiler,
  onSubmitSolved,
  submitLoading = false,
}) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Spinner className="h-10 w-10 text-blue-600 dark:text-blue-400" label="Loading daily challenge…" />
      </div>
    );
  }

  const question = data?.question || null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Daily Challenge</h3>
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

      {!hasPaid ? (
        <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100">
          Today&apos;s challenge uses free questions only. Upgrade to unlock premium questions in daily challenges.
        </p>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {!question ? null : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
            <CalendarDays className="h-3.5 w-3.5" />
            Challenge for {data.challengeKey}
          </div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{question.title}</h4>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{question.question}</p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {question.category} {question.difficulty ? `• ${question.difficulty}` : ''}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpenCompiler?.(question)}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
            >
              <TerminalSquare className="h-4 w-4" />
              Solve in compiler
            </button>
            <button
              type="button"
              onClick={() => onSubmitSolved?.(question.id)}
              disabled={submitLoading}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Flag className="h-4 w-4" />
              )}
              {submitLoading ? 'Submitting…' : 'Mark challenge solved'}
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Solved today: <span className="font-semibold">{data.solvedTodayCount || 0}</span>
            {data.yourRank ? (
              <>
                {' '}
                • Your rank: <span className="font-semibold">#{data.yourRank}</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <Crown className="h-4 w-4 text-amber-500" />
          Leaderboard
        </div>
        {!data?.leaderboard?.length ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No submissions yet. Be the first to solve today's challenge.</p>
        ) : (
          <div className="space-y-2">
            {data.leaderboard.slice(0, 10).map((entry) => (
              <div
                key={`${entry.uid}-${entry.rank}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
              >
                <div className="inline-flex items-center gap-2">
                  <Medal className={`h-4 w-4 ${entry.rank <= 3 ? 'text-amber-500' : 'text-gray-400'}`} />
                  <span className="font-semibold text-gray-700 dark:text-gray-200">#{entry.rank}</span>
                  <span className="text-gray-700 dark:text-gray-200">{entry.displayName}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.solvedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
