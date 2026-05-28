import React, { useEffect, useMemo, useState } from 'react';
import { BookmarkCheck, NotebookPen, Save, TerminalSquare, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import Spinner from './Spinner';

export default function BookmarksPanel({
  items = [],
  loading = false,
  error = '',
  onReload,
  onOpenCompiler,
  onRemoveBookmark,
  onSaveNote,
  onToggleSolved,
  isActionPending = () => false,
}) {
  const [noteDrafts, setNoteDrafts] = useState({});

  const keyedItems = useMemo(
    () => items.map((item) => ({ ...item, questionId: item?.question?.id })).filter((item) => item.questionId != null),
    [items],
  );

  useEffect(() => {
    const next = {};
    for (const item of keyedItems) {
      next[item.questionId] = item.note || '';
    }
    setNoteDrafts(next);
  }, [keyedItems]);

  const handleSaveNote = async (questionId) => {
    const note = noteDrafts[questionId] ?? '';
    await onSaveNote?.(questionId, note);
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Spinner className="h-10 w-10 text-blue-600 dark:text-blue-400" label="Loading bookmarks…" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Bookmarks + Notes</h3>
        <button
          type="button"
          onClick={onReload}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {!keyedItems.length ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          No bookmarks yet. Bookmark questions from the Questions tab to revisit them here.
        </div>
      ) : (
        <div className="grid gap-4">
          {keyedItems.map((item) => {
            const qid = item.questionId;
            const solvedLoading = isActionPending(qid, 'solved');
            const bookmarkLoading = isActionPending(qid, 'bookmark');
            const noteLoading = isActionPending(qid, 'note');

            return (
            <article
              key={`bookmark-${qid}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.question.title}</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.question.category} {item.question.difficulty ? `• ${item.question.difficulty}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={solvedLoading || bookmarkLoading}
                    onClick={() => onToggleSolved?.(qid, !item.solved)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                      item.solved
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {solvedLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {solvedLoading ? 'Saving…' : item.solved ? 'Solved' : 'Mark solved'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenCompiler?.(item.question)}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
                  >
                    <TerminalSquare className="h-3.5 w-3.5" />
                    Open compiler
                  </button>
                  <button
                    type="button"
                    disabled={bookmarkLoading || solvedLoading}
                    onClick={() => onRemoveBookmark?.(qid)}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-950/50 dark:text-rose-200"
                  >
                    {bookmarkLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {bookmarkLoading ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
                <div className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <NotebookPen className="h-3.5 w-3.5" />
                  Personal note
                </div>
                <textarea
                  value={noteDrafts[item.questionId] ?? ''}
                  onChange={(event) =>
                    setNoteDrafts((prev) => ({
                      ...prev,
                      [item.questionId]: event.target.value,
                    }))
                  }
                  className="h-24 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Write your approach, edge-cases, and mistakes to avoid..."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={noteLoading}
                    onClick={() => handleSaveNote(qid)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {noteLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {noteLoading ? 'Saving…' : 'Save note'}
                  </button>
                </div>
              </div>

              <div className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <BookmarkCheck className="h-3.5 w-3.5" />
                Last updated {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'recently'}
              </div>
            </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
