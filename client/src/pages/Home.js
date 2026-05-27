import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import QuestionCard from '../components/QuestionCard';
import Spinner from '../components/Spinner';
import apiService from '../services/api';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const PAGE_SIZE = 10;
const FREE_PREVIEW_COUNT = 10;

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const skipPaginationScrollOnce = useRef(true);

  const { currentUser } = useAuth();

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

  const handlePremiumClick = useCallback(
    async () => {
      if (!currentUser) {
        toast.error('Please sign in to unlock premium questions.');
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

        const cashfreeEnv = process.env.REACT_APP_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';

        const cashfree = await load({ mode: cashfreeEnv });

        const checkoutOptions = {
          paymentSessionId: res.data.payment_session_id,
          redirectTarget: '_modal',
        };

        toast.dismiss('pay');

        cashfree.checkout(checkoutOptions).then(async (result) => {
          if (result.error) {
            console.error(result.error);
            toast.error(
              result.error.message ? `Payment: ${result.error.message}` : 'Payment was cancelled or failed.',
            );
            return;
          }
          if (result.paymentDetails) {
            toast.loading('Verifying payment…', { id: 'verify' });
            try {
              const verifyRes = await apiService.verifyPayment(res.data.order_id);
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
          }
        });
      } catch (err) {
        toast.dismiss('pay');
        console.error(err);
        toast.error(err.message || 'Error starting payment.');
      } finally {
        setPaymentLoading(false);
      }
    },
    [currentUser],
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

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'All' ||
    showPremiumOnly ||
    showFreeOnly ||
    searchTerm;

  const sidebarStats = loading ? null : { listed: questions.length, total: pagination.totalCount };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Header
        onMenuToggle={() => setIsSidebarOpen((o) => !o)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isSearching={searchTerm !== debouncedSearch}
      />

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
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

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="questions" className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                JavaScript interview questions
              </h2>
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
                Showing the first {FREE_PREVIEW_COUNT} free questions. Sign in and upgrade to unlock the full library.
              </p>
            ) : null}

            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" aria-hidden />
                    Loading…
                  </span>
                ) : (
                  <>
                    Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{questions.length}</span> on
                    this page
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
                <QuestionCard key={q.id} question={q} onPremiumClick={handlePremiumClick} />
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
            <p>&copy; 2026 JS Interview Prep. Built with React.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Home;
