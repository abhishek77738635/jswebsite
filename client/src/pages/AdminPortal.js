import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { Trash2, Plus, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const ADMIN_PAGE_LIMIT = 30;

function AdminPortal() {
  const [questions, setQuestions] = useState([]);
  const [adminPage, setAdminPage] = useState(1);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [adminPagination, setAdminPagination] = useState(() => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: ADMIN_PAGE_LIMIT,
    hasPrevPage: false,
    hasNextPage: false,
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Beginner',
    isPremium: false,
    category: '',
    companies: '',
    code: '',
    question: '',
    answer: '',
    explanation: '',
    tags: '',
  });

  /** Re-fetch admin list without changing page (handled by dependency array). */
  const triggerRefresh = () => setRefreshNonce((n) => n + 1);

  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      let redirectedToLowerPage = false;
      try {
        const res = await apiService.getQuestions({
          limit: ADMIN_PAGE_LIMIT,
          page: adminPage,
          sortBy: 'id',
          sortOrder: 'asc',
        });
        if (cancelled) return;

        if (!res.success) {
          throw new Error(res.message || 'Failed to load questions');
        }

        const p = res.pagination;
        if (p && p.totalCount > 0 && adminPage > p.totalPages && p.totalPages >= 1) {
          redirectedToLowerPage = true;
          setAdminPage(p.totalPages);
          return;
        }

        setQuestions(res.data || []);
        if (p) setAdminPagination(p);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          toast.error(err.message || 'Failed to load questions');
        }
      } finally {
        if (!cancelled && !redirectedToLowerPage) {
          setLoading(false);
        }
      }
    };

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [adminPage, refreshNonce]);

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this question?');
    if (!ok) return;
    try {
      setDeletingId(id);
      const res = await apiService.deleteQuestion(id);
      if (res.success) {
        toast.success('Question deleted.');
        triggerRefresh();
      } else {
        toast.error(res.message || 'Could not delete');
      }
    } catch (err) {
      toast.error('Error deleting question');
    } finally {
      setDeletingId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        companies: formData.companies.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = await apiService.createQuestion(payload);

      if (res.success) {
        toast.success('Question added.');
        setShowForm(false);
        setFormData({
          title: '',
          difficulty: 'Beginner',
          isPremium: false,
          category: '',
          companies: '',
          code: '',
          question: '',
          answer: '',
          explanation: '',
          tags: '',
        });
        triggerRefresh();
      } else {
        toast.error(res.message || 'Failed to add question');
      }
    } catch (err) {
      toast.error(err.message || 'Error adding question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMergePackagedBulk = async () => {
    const ok = window.confirm(
      'Import the packaged bulk question set from the server (skips titles that already exist)? This can take a few seconds.',
    );
    if (!ok) return;
    setBulkImporting(true);
    try {
      const res = await apiService.mergePackagedBulkQuestions({
        skipDuplicateTitles: true,
        upsertCategories: true,
      });
      if (res.success) {
        const d = res.data || {};
        toast.success(
          `Bulk import: ${d.inserted ?? 0} added, ${d.skippedDuplicates ?? 0} duplicates skipped, ${d.categoryDocsAdded ?? 0} new categories.`,
        );
        triggerRefresh();
      } else {
        toast.error(res.message || 'Bulk import failed');
      }
    } catch (err) {
      toast.error(err.message || 'Bulk import error');
    } finally {
      setBulkImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin portal</h1>
            <p className="text-gray-600">Manage interview questions in Firestore</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
              {!loading && !error ? (
                <p className="mt-1 text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-800">{questions.length}</span> on this page
                  {adminPagination.totalCount > 0 ? (
                    <>
                      {' '}
                      of <span className="font-semibold text-gray-800">{adminPagination.totalCount}</span> total
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMergePackagedBulk}
                disabled={bulkImporting}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-900 hover:bg-violet-100 disabled:opacity-60"
              >
                {bulkImporting ? <Spinner className="h-4 w-4" /> : null}
                Import bulk pack
              </button>
              <button
                type="button"
                onClick={() => triggerRefresh()}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setShowForm((s) => !s)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                {showForm ? 'Cancel' : 'Add question'}
              </button>
            </div>
          </div>

          {showForm ? (
            <div className="mb-10 rounded-xl border border-gray-100 bg-gray-50/80 p-6">
              <h3 className="mb-4 font-medium text-gray-900">New question</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                  <input
                    required
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                  <input
                    required
                    type="text"
                    name="category"
                    placeholder="Arrays, Functions…"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Companies</label>
                  <input
                    type="text"
                    name="companies"
                    placeholder="Amazon, Meta, Google (comma separated)"
                    value={formData.companies}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Prompt</label>
                  <input
                    required
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Code (optional)</label>
                  <textarea
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    rows={4}
                    className="font-mono w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Answer</label>
                  <input required type="text" name="answer" value={formData.answer} onChange={handleInputChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="comma separated"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Explanation</label>
                  <textarea
                    required
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="premium" name="isPremium" checked={formData.isPremium} onChange={handleInputChange} />
                  <label htmlFor="premium" className="text-sm text-gray-700">
                    Premium question
                  </label>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Saving…
                      </>
                    ) : (
                      'Save question'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Spinner className="h-12 w-12 text-blue-600" />
              <p className="text-sm text-gray-500">Loading questions…</p>
            </div>
          ) : error ? (
            <p className="py-12 text-center text-red-600">{error}</p>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 font-semibold text-gray-600">ID</th>
                    <th className="p-3 font-semibold text-gray-600">Title</th>
                    <th className="p-3 font-semibold text-gray-600">Companies</th>
                    <th className="p-3 font-semibold text-gray-600">Category</th>
                    <th className="p-3 font-semibold text-gray-600">Difficulty</th>
                    <th className="p-3 font-semibold text-gray-600">Type</th>
                    <th className="p-3 text-right font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No questions.
                      </td>
                    </tr>
                  ) : (
                    questions.map((q) => (
                      <tr key={q.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{q.id}</td>
                        <td className="max-w-[200px] truncate p-3 font-medium">{q.title}</td>
                        <td className="max-w-[140px] truncate p-3 text-gray-600">
                          {q.companies?.length ? q.companies.join(', ') : '—'}
                        </td>
                        <td className="p-3">{q.category}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              q.difficulty === 'Expert'
                                ? 'bg-red-100 text-red-800'
                                : q.difficulty === 'Advanced'
                                  ? 'bg-sky-100 text-sky-900'
                                : q.difficulty === 'Intermediate'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="p-3">{q.isPremium ? <span className="text-amber-700">Premium</span> : <span className="text-gray-500">Free</span>}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            disabled={deletingId === q.id}
                            onClick={() => handleDelete(q.id)}
                            className="inline-flex rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === q.id ? <Spinner className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && !error && adminPagination.totalPages > 1 ? (
              <nav
                className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                aria-label="Admin question pagination"
              >
                <button
                  type="button"
                  disabled={!adminPagination.hasPrevPage}
                  onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Prev
                </button>
                <span className="text-sm text-gray-600">
                  Page <strong className="text-gray-900">{adminPagination.currentPage}</strong> of{' '}
                  <strong className="text-gray-900">{adminPagination.totalPages}</strong>
                </span>
                <button
                  type="button"
                  disabled={!adminPagination.hasNextPage}
                  onClick={() => setAdminPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </nav>
            ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;
