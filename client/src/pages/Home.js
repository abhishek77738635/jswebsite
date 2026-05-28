import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import QuestionCard from '../components/QuestionCard';
import CodeRunnerSandbox from '../components/CodeRunnerSandbox';
import BookmarksPanel from '../components/BookmarksPanel';
import ProgressDashboardPanel from '../components/ProgressDashboardPanel';
import DailyChallengePanel from '../components/DailyChallengePanel';
import Spinner from '../components/Spinner';
import apiService from '../services/api';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import AppTabBar from '../components/AppTabBar';
import { useAuth } from '../contexts/AuthContext';
import { openCashfreeCheckout } from '../utils/cashfreeCheckout';
import toast from 'react-hot-toast';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const PAGE_SIZE = 20;
const FREE_PREVIEW_COUNT = 10;
const TAB_KEYS = ['questions', 'compiler', 'bookmarks', 'dashboard', 'daily'];

const DIFFICULTY_SORT_ORDER = { All: 0, Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

function sortDifficultyList(list) {
  return [...list].sort((a, b) => (DIFFICULTY_SORT_ORDER[a] ?? 99) - (DIFFICULTY_SORT_ORDER[b] ?? 99));
}

function buildQuestionParams(filters, page, debouncedSearch) {
  const params = {
    page,
    limit: PAGE_SIZE,
    sortBy: 'id',
    sortOrder: 'asc',
  };
  if (filters.selectedCategory !== 'All') params.category = filters.selectedCategory;
  if (filters.selectedDifficulty !== 'All') params.difficulty = filters.selectedDifficulty;
  if (filters.showPremiumOnly) params.isPremium = 'true';
  if (filters.showFreeOnly) params.isPremium = 'false';
  if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
  return params;
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFiltersDesktopOpen, setIsFiltersDesktopOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: PAGE_SIZE,
  });
  const [categories, setCategories] = useState(['All']);
  const [difficulties, setDifficulties] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [page, setPage] = useState(1);
  const [hasPaid, setHasPaid] = useState(false);
  const [activeTab, setActiveTab] = useState(
    TAB_KEYS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'questions',
  );
  const [compilerSeed, setCompilerSeed] = useState(null);
  const [questionStates, setQuestionStates] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarksError, setBookmarksError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [dailyChallengeData, setDailyChallengeData] = useState(null);
  const [dailyChallengeLoading, setDailyChallengeLoading] = useState(false);
  const [dailyChallengeError, setDailyChallengeError] = useState('');
  const [dailySubmitLoading, setDailySubmitLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState({});

  const skipPaginationScrollOnce = useRef(true);

  const actionKeyFromPayload = (payload) => {
    if (payload.bookmarked !== undefined) return 'bookmark';
    if (payload.solved !== undefined) return 'solved';
    if (payload.note !== undefined) return 'note';
    return 'state';
  };

  const setActionPending = (questionId, action, isPending) => {
    const key = `${questionId}:${action}`;
    setPendingActions((prev) => {
      if (!isPending) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: true };
    });
  };

  const isActionPending = (questionId, action) => Boolean(pendingActions[`${questionId}:${action}`]);

  const { currentUser } = useAuth();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (TAB_KEYS.includes(tabParam)) {
      setActiveTab(tabParam);
      return;
    }
    setActiveTab('questions');
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedDifficulty, showPremiumOnly, showFreeOnly, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      const params = buildQuestionParams(
        {
          selectedCategory,
          selectedDifficulty,
          showPremiumOnly,
          showFreeOnly,
        },
        page,
        debouncedSearch,
      );

      try {
        const [questionsRes, categoriesRes, difficultiesRes] = await Promise.all([
          apiService.getQuestions(params),
          apiService.getCategoryList(),
          apiService.getDifficulties(),
        ]);

        if (cancelled) return;

        if (!questionsRes.success) {
          throw new Error(questionsRes.message || 'Failed to load questions');
        }
        if (!categoriesRes.success) {
          throw new Error(categoriesRes.message || 'Failed to load categories');
        }
        if (!difficultiesRes.success) {
          throw new Error(difficultiesRes.message || 'Failed to load difficulties');
        }

        setQuestions(questionsRes.data || []);

        const rawCats = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        const withAllCats = rawCats.includes('All') ? rawCats : ['All', ...rawCats];
        setCategories(withAllCats);

        const rawDiff = Array.isArray(difficultiesRes.data) ? difficultiesRes.data : [];
        const withAllDiff = rawDiff.includes('All') ? rawDiff : ['All', ...rawDiff];
        setDifficulties(sortDifficultyList(withAllDiff));

        if (questionsRes.pagination) {
          setPagination(questionsRes.pagination);
        }

        setHasPaid(Boolean(questionsRes.access?.hasPaid));
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError(e.message || 'Could not reach the API');
          setQuestions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, selectedDifficulty, showPremiumOnly, showFreeOnly, debouncedSearch, page, retryNonce]);

  useEffect(() => {
    if (skipPaginationScrollOnce.current) {
      skipPaginationScrollOnce.current = false;
      return;
    }
    document.getElementById('questions')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [page]);

  useEffect(() => {
    let cancelled = false;

    const loadStates = async () => {
      if (!currentUser || !questions.length) {
        if (!cancelled) setQuestionStates({});
        return;
      }

      try {
        const ids = questions.map((q) => q.id);
        const res = await apiService.getQuestionStates(ids);
        if (!cancelled) {
          setQuestionStates(res?.data || {});
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setQuestionStates({});
        }
      }
    };

    loadStates();
    return () => {
      cancelled = true;
    };
  }, [currentUser, questions]);

  const verifyOrderAndUnlock = useCallback(async (orderId) => {
    if (!orderId) return;
    toast.loading('Verifying payment…', { id: 'verify' });
    try {
      const verifyRes = await apiService.verifyPayment(orderId);
      toast.dismiss('verify');
      if (verifyRes.success) {
        toast.success('Payment successful! Premium content is unlocked.');
        setRetryNonce((n) => n + 1);
      } else {
        toast.error(verifyRes.message || 'Verification failed.');
      }
    } catch (err) {
      toast.dismiss('verify');
      console.error(err);
      toast.error('Unable to verify payment. Contact support if you were charged.');
    }
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const paymentSuccess = searchParams.get('payment_success');
    if (!currentUser || !orderId || paymentSuccess !== 'true') return;

    const params = new URLSearchParams(searchParams);
    params.delete('order_id');
    params.delete('payment_success');
    setSearchParams(params, { replace: true });

    verifyOrderAndUnlock(orderId);
  }, [currentUser, searchParams, setSearchParams, verifyOrderAndUnlock]);

  const handlePremiumClick = useCallback(
    async () => {
      if (!currentUser) {
        navigate('/login', {
          state: { from: location, reason: 'premium' },
        });
        return;
      }

      toast.loading('Opening checkout…', { id: 'pay' });

      try {
        setPaymentLoading(true);
        const res = await apiService.createPaymentOrder();

        if (!res.success || !res.data?.payment_session_id) {
          toast.dismiss('pay');
          toast.error(typeof res.message === 'string' ? res.message : 'Could not start payment.');
          return;
        }

        const mode = res.data.mode === 'production' ? 'production' : 'sandbox';
        const orderId = res.data.order_id;

        toast.dismiss('pay');

        const result = await openCashfreeCheckout({
          paymentSessionId: res.data.payment_session_id,
          mode,
        });

        if (result?.usedRedirect || result?.redirect) {
          toast('Opening secure payment page…', { icon: '🔒' });
          return;
        }

        if (result?.error) {
          console.error(result.error);
          toast.error(
            result.error.message
              ? `Payment: ${result.error.message}`
              : 'Payment was cancelled or failed.',
          );
          return;
        }

        if (result?.paymentDetails) {
          await verifyOrderAndUnlock(orderId);
        }
      } catch (err) {
        toast.dismiss('pay');
        console.error(err);
        toast.error(err.message || 'Error starting payment.');
      } finally {
        setPaymentLoading(false);
      }
    },
    [currentUser, verifyOrderAndUnlock, navigate, location],
  );

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setShowPremiumOnly(false);
    setShowFreeOnly(false);
    setSearchTerm('');
    setPage(1);
    toast.success('Filters cleared.');
  };

  const retryConnection = () => setRetryNonce((c) => c + 1);

  const switchTab = useCallback(
    (nextTab, questionId = null) => {
      setActiveTab(nextTab);
      const params = new URLSearchParams(searchParams);
      if (nextTab === 'questions') {
        params.delete('tab');
        params.delete('questionId');
      } else {
        params.set('tab', nextTab);
        if (nextTab === 'compiler' && questionId != null) {
          params.set('questionId', String(questionId));
        } else {
          params.delete('questionId');
        }
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const openQuestionInCompiler = useCallback(
    (question) => {
      const seed = {
        id: question.id,
        title: question.title,
        prompt: question.question,
        starterCode: typeof question.code === 'string' ? question.code : '',
      };
      setCompilerSeed(seed);
      switchTab('compiler', question.id);
    },
    [switchTab],
  );

  const updateQuestionState = useCallback(
    async (questionId, payload, successMessage = 'Saved') => {
      if (!currentUser) {
        toast.error('Please sign in to use this feature.');
        return;
      }
      const action = actionKeyFromPayload(payload);
      setActionPending(questionId, action, true);
      try {
        const res = await apiService.updateQuestionState(questionId, payload);
        if (res?.success) {
          const nextState = {
            bookmarked: Boolean(res.data?.bookmarked),
            solved: Boolean(res.data?.solved),
            note: typeof res.data?.note === 'string' ? res.data.note : '',
            updatedAt: res.data?.updatedAt || null,
            firstSolvedAt: res.data?.firstSolvedAt || null,
          };
          setQuestionStates((prev) => ({ ...prev, [questionId]: nextState }));
          if (successMessage) toast.success(successMessage);
        }
      } catch (e) {
        console.error(e);
        toast.error(e.message || 'Failed to save');
      } finally {
        setActionPending(questionId, action, false);
      }
    },
    [currentUser],
  );

  const reloadBookmarks = useCallback(async () => {
    if (!currentUser) return;
    setBookmarksLoading(true);
    setBookmarksError('');
    try {
      const res = await apiService.getBookmarks();
      if (!res.success) throw new Error(res.message || 'Failed to load bookmarks');
      setBookmarks(res.data || []);
    } catch (e) {
      console.error(e);
      setBookmarks([]);
      setBookmarksError(e.message || 'Failed to load bookmarks');
    } finally {
      setBookmarksLoading(false);
    }
  }, [currentUser]);

  const reloadDashboard = useCallback(async () => {
    if (!currentUser) return;
    setDashboardLoading(true);
    setDashboardError('');
    try {
      const res = await apiService.getProgressDashboard();
      if (!res.success) throw new Error(res.message || 'Failed to load dashboard');
      setDashboardData(res.data || null);
    } catch (e) {
      console.error(e);
      setDashboardData(null);
      setDashboardError(e.message || 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, [currentUser]);

  const reloadDailyChallenge = useCallback(async () => {
    setDailyChallengeLoading(true);
    setDailyChallengeError('');
    try {
      const res = await apiService.getDailyChallenge();
      if (!res.success) throw new Error(res.message || 'Failed to load daily challenge');
      setDailyChallengeData(res.data || null);
    } catch (e) {
      console.error(e);
      setDailyChallengeData(null);
      setDailyChallengeError(e.message || 'Failed to load daily challenge');
    } finally {
      setDailyChallengeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'bookmarks' && currentUser) {
      reloadBookmarks();
    }
    if (activeTab === 'dashboard' && currentUser) {
      reloadDashboard();
    }
    if (activeTab === 'daily') {
      reloadDailyChallenge();
    }
  }, [activeTab, currentUser, reloadBookmarks, reloadDashboard, reloadDailyChallenge]);

  const handleDailySubmit = useCallback(
    async (questionId) => {
      if (!currentUser) {
        toast.error('Please sign in to join the leaderboard.');
        return;
      }
      setDailySubmitLoading(true);
      try {
        const res = await apiService.submitDailyChallenge(questionId);
        if (!res.success) throw new Error(res.message || 'Submit failed');
        toast.success(
          res.data?.yourRank
            ? `Challenge submitted. Your rank is #${res.data.yourRank}`
            : 'Challenge submitted successfully!',
        );
        setQuestionStates((prev) => ({
          ...prev,
          [questionId]: {
            ...(prev[questionId] || {}),
            solved: true,
          },
        }));
        await reloadDailyChallenge();
        await reloadDashboard();
      } catch (e) {
        console.error(e);
        toast.error(e.message || 'Failed to submit challenge');
      } finally {
        setDailySubmitLoading(false);
      }
    },
    [currentUser, reloadDailyChallenge, reloadDashboard],
  );

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'All' ||
    showPremiumOnly ||
    showFreeOnly ||
    searchTerm;

  const sidebarStats = loading ? null : { listed: questions.length, total: pagination.totalCount };

  const handleFiltersToggle = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setIsFiltersDesktopOpen((open) => !open);
      return;
    }
    setIsSidebarOpen((open) => !open);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-50 shrink-0 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Header
          onMenuToggle={handleFiltersToggle}
          showFiltersMenu={activeTab === 'questions'}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isSearching={searchTerm !== debouncedSearch}
        />
        <AppTabBar activeTab={activeTab} onTabChange={switchTab} />
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1">
        {activeTab === 'questions' ? (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            desktopOpen={isFiltersDesktopOpen}
            onDesktopClose={() => setIsFiltersDesktopOpen(false)}
            selectedCategory={selectedCategory}
            onCategoryChange={(v) => setSelectedCategory(v)}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={(v) => setSelectedDifficulty(v)}
            showPremiumOnly={showPremiumOnly}
            onPremiumToggle={() => {
              setShowPremiumOnly(!showPremiumOnly);
              setShowFreeOnly(false);
            }}
            showFreeOnly={showFreeOnly}
            onFreeToggle={() => {
              setShowFreeOnly(!showFreeOnly);
              setShowPremiumOnly(false);
            }}
            categories={categories}
            difficulties={difficulties}
            stats={sidebarStats}
          />
        ) : null}

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'compiler' ? (
            <div id="compiler" className="space-y-4">
              <CodeRunnerSandbox seed={compilerSeed} />
              <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
                <p>&copy; 2026 Upchallenges. Level Up Your Logic.</p>
              </footer>
            </div>
          ) : activeTab === 'bookmarks' ? (
            <div className="space-y-4">
              {!currentUser ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  Sign in to save bookmarks and personal notes.
                </div>
              ) : (
                <BookmarksPanel
                  items={bookmarks}
                  loading={bookmarksLoading}
                  error={bookmarksError}
                  onReload={reloadBookmarks}
                  onOpenCompiler={openQuestionInCompiler}
                  isActionPending={isActionPending}
                  onRemoveBookmark={(questionId) =>
                    updateQuestionState(questionId, { bookmarked: false }, 'Bookmark removed').then(reloadBookmarks)
                  }
                  onSaveNote={(questionId, note) =>
                    updateQuestionState(questionId, { note }, 'Note saved').then(reloadBookmarks)
                  }
                  onToggleSolved={(questionId, solved) =>
                    updateQuestionState(questionId, { solved }, solved ? 'Marked solved' : 'Marked unsolved').then(
                      reloadBookmarks,
                    )
                  }
                />
              )}
              <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
                <p>&copy; 2026 Upchallenges. Level Up Your Logic.</p>
              </footer>
            </div>
          ) : activeTab === 'dashboard' ? (
            <div className="space-y-4">
              {!currentUser ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  Sign in to view your personalized progress dashboard.
                </div>
              ) : (
                <ProgressDashboardPanel
                  data={dashboardData}
                  loading={dashboardLoading}
                  error={dashboardError}
                  onReload={reloadDashboard}
                />
              )}
              <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
                <p>&copy; 2026 Upchallenges. Level Up Your Logic.</p>
              </footer>
            </div>
          ) : activeTab === 'daily' ? (
            <div className="space-y-4">
              <DailyChallengePanel
                data={dailyChallengeData}
                loading={dailyChallengeLoading}
                error={dailyChallengeError}
                hasPaid={hasPaid}
                onReload={reloadDailyChallenge}
                onOpenCompiler={openQuestionInCompiler}
                onSubmitSolved={handleDailySubmit}
                submitLoading={dailySubmitLoading}
              />
              <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
                <p>&copy; 2026 Upchallenges. Level Up Your Logic.</p>
              </footer>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 id="questions" className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                      JavaScript challenges
                    </h2>
                    {!isFiltersDesktopOpen ? (
                      <button
                        type="button"
                        onClick={() => setIsFiltersDesktopOpen(true)}
                        className="hidden items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 lg:inline-flex"
                      >
                        <Filter className="h-4 w-4" aria-hidden />
                        Show filters
                      </button>
                    ) : null}
                  </div>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>

                {!loading && !hasPaid ? (
                  <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100">
                    First {FREE_PREVIEW_COUNT} questions are free. Browse the full list — upgrade to unlock the rest.
                  </p>
                ) : null}

                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" aria-hidden />
                        Loading…
                      </span>
                    ) : (
                      <>
                        Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{questions.length}</span>{' '}
                        on this page
                        {pagination.totalCount > 0 ? (
                          <>
                            {' '}
                            of <span className="font-semibold text-gray-900 dark:text-gray-100">{pagination.totalCount}</span>{' '}
                            matching
                          </>
                        ) : null}
                      </>
                    )}
                  </p>
                  {error ? <span className="max-w-xl text-sm text-red-600 dark:text-red-400">{error}</span> : null}
                </div>

                {loading && !questions.length ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-16">
                    <Spinner className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {paymentLoading ? 'Preparing checkout…' : 'Loading questions…'}
                    </p>
                  </div>
                ) : null}
              </div>

              {!loading && !error && questions.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <Search className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden />
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">No questions match these filters</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Try a different search phrase or broaden your filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Reset filters
                  </button>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50/90 p-8 text-center dark:border-red-900/50 dark:bg-red-950/40">
                  <p className="font-medium text-red-900 dark:text-red-200">Could not load data</p>
                  <button
                    type="button"
                    onClick={retryConnection}
                    className="mt-4 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500"
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              <div className="relative pb-24">
                {loading && questions.length ? (
                  <div
                    className="absolute inset-0 z-10 flex justify-center rounded-2xl bg-white/65 pt-8 backdrop-blur-[2px] dark:bg-gray-950/70"
                    aria-live="polite"
                    aria-busy="true"
                    role="status"
                  >
                    <div className="flex h-fit flex-col items-center gap-3 rounded-2xl border border-blue-100 bg-white px-8 py-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                      <Spinner className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Loading this page…</p>
                      <p className="max-w-[16rem] text-center text-xs text-gray-500 dark:text-gray-400">
                        Hang on while questions load.
                      </p>
                    </div>
                  </div>
                ) : null}
                <div className="grid gap-6">
                  {questions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      onPremiumClick={handlePremiumClick}
                      onOpenCompiler={openQuestionInCompiler}
                      userState={questionStates[q.id] || null}
                      onBookmarkToggle={(questionId, bookmarked) =>
                        updateQuestionState(
                          questionId,
                          { bookmarked },
                          bookmarked ? 'Question bookmarked' : 'Bookmark removed',
                        )
                      }
                      onSolvedToggle={(questionId, solved) =>
                        updateQuestionState(questionId, { solved }, solved ? 'Marked solved' : 'Marked unsolved')
                      }
                      onSaveNote={(questionId, note) => updateQuestionState(questionId, { note }, 'Note saved')}
                      isActionPending={isActionPending}
                    />
                  ))}
                </div>
              </div>

              {!loading && !error && pagination.totalPages > 1 ? (
                <nav
                  className="sticky bottom-4 z-20 mx-auto flex max-w-md items-center justify-center gap-4 rounded-full border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 sm:bottom-8"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Prev
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page <strong className="text-gray-900 dark:text-gray-100">{pagination.currentPage}</strong> of{' '}
                    <strong className="text-gray-900 dark:text-gray-100">{pagination.totalPages}</strong>
                  </span>
                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </nav>
              ) : null}

              <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
                <p>&copy; 2026 Upchallenges. Level Up Your Logic.</p>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;
