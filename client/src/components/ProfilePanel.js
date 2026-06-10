import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  User,
  Mail,
  Phone,
  LogOut,
  Trophy,
  Bookmark,
  Flame,
  Crown,
  Loader2,
  Save,
} from 'lucide-react';
import Spinner from './Spinner';

function normalizePhoneInput(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

export default function ProfilePanel({
  isOpen,
  onClose,
  currentUser,
  profile,
  profileLoading,
  dashboard,
  dashboardLoading,
  onSavePhone,
  onLogout,
  savingPhone = false,
}) {
  const [phoneDraft, setPhoneDraft] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPhoneDraft(profile?.phone || '');
    }
  }, [isOpen, profile?.phone]);

  if (!isOpen) return null;

  const displayName = profile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const email = profile?.email || currentUser?.email || '';
  const hasPaid = Boolean(profile?.hasPaid);
  const phoneSaved = Boolean(profile?.phone);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40"
        aria-label="Close profile"
        onClick={onClose}
      />

      <aside
        className="fixed right-0 top-0 z-[70] flex h-full w-[min(92vw,24rem)] flex-col bg-white shadow-2xl dark:bg-gray-900"
        aria-label="User profile"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close profile panel"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {!currentUser ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="font-medium">Sign in to view your profile and progress.</p>
              <Link
                to="/login"
                onClick={onClose}
                className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
              >
                Sign in with Google
              </Link>
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      <User className="h-7 w-7" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {email}
                    </p>
                    {hasPaid ? (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        <Crown className="h-3 w-3" aria-hidden />
                        Premium
                      </span>
                    ) : (
                      <span className="mt-2 inline-block rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        Free tier
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Phone for payments</h3>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  Required for Cashfree checkout. Use your 10-digit Indian mobile number.
                </p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="9876543210"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(normalizePhoneInput(e.target.value))}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => onSavePhone(phoneDraft)}
                    disabled={savingPhone || phoneDraft.length !== 10}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
                  >
                    {savingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                  </button>
                </div>
                {phoneSaved ? (
                  <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">Saved: {profile.phone}</p>
                ) : (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">Add your phone before upgrading to premium.</p>
                )}
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Your progress</h3>
                {profileLoading || dashboardLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8 text-violet-600 dark:text-violet-400" label="Loading progress…" />
                  </div>
                ) : dashboard ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-900/50 dark:bg-blue-950/40">
                      <Trophy className="mx-auto h-4 w-4 text-blue-700 dark:text-blue-300" aria-hidden />
                      <p className="mt-1 text-lg font-bold text-blue-950 dark:text-blue-100">{dashboard.solvedCount || 0}</p>
                      <p className="text-xs text-blue-800 dark:text-blue-300">Solved</p>
                    </div>
                    <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center dark:border-violet-900/50 dark:bg-violet-950/40">
                      <Bookmark className="mx-auto h-4 w-4 text-violet-700 dark:text-violet-300" aria-hidden />
                      <p className="mt-1 text-lg font-bold text-violet-950 dark:text-violet-100">{dashboard.bookmarkedCount || 0}</p>
                      <p className="text-xs text-violet-800 dark:text-violet-300">Saved</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-900/50 dark:bg-emerald-950/40">
                      <Flame className="mx-auto h-4 w-4 text-emerald-700 dark:text-emerald-300" aria-hidden />
                      <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-100">{dashboard.streakCurrent || 0}</p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">Day streak</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start solving questions to track progress here.</p>
                )}
              </section>
            </>
          )}
        </div>

        {currentUser ? (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
