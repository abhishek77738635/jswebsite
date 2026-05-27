import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Eye, EyeOff, Crown, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const LOCK_MARKERS = '// Premium content locked';

const QuestionCard = ({ question, onPremiumClick }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const { currentUser } = useAuth();

  const codeStr = typeof question.code === 'string' ? question.code.trim() : '';
  const isLocked =
    question.isPremium && (codeStr === LOCK_MARKERS || codeStr.endsWith('Premium content locked'));

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Intermediate':
        return 'bg-amber-100 text-amber-950 border-amber-200';
      case 'Advanced':
        return 'bg-sky-100 text-sky-950 border-sky-200';
      case 'Expert':
        return 'bg-red-100 text-red-950 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md">
      {/* Header */}
      <div className="border-b border-gray-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">{question.title}</h3>
              {question.isPremium ? <Crown className="h-5 w-5 shrink-0 text-amber-500" aria-hidden /> : null}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-900">{question.category}</span>
              {question.companies?.length ? (
                <span className="flex flex-wrap items-center gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Companies</span>
                  {question.companies.map((c, idx) => (
                    <span
                      key={`${question.id}-co-${idx}-${c}`}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200/80"
                    >
                      {c}
                    </span>
                  ))}
                </span>
              ) : null}
              {question.isPremium ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                  <Sparkles className="h-3 w-3" aria-hidden /> Premium
                </span>
              ) : null}
            </div>
            <p className="leading-relaxed text-gray-700">{question.question}</p>

            {!currentUser && question.isPremium ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                <strong className="font-semibold">Sign in required.</strong> To view this premium prompt and code sample, please sign in with Google first.
              </p>
            ) : null}

            {currentUser && question.isPremium && isLocked ? (
              <p className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-950">
                <strong className="font-semibold">Payment required.</strong> Unlock full code, answers, and explanations once your payment succeeds.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Code</h4>
          <div style={{height: isLocked ? '25em' : 'auto'}} className={`relative rounded-xl overflow-hidden ${isLocked ? 'ring-2 ring-offset-2 ring-violet-300/70' : ''}`}>
            <SyntaxHighlighter
              language="javascript"
              style={tomorrow}
              customStyle={{
                margin: 0,
                borderRadius: '0.75rem',
                fontSize: '14px',
              }}
            >
              {question.code}
            </SyntaxHighlighter>

            {isLocked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-950/95 via-gray-950/90 to-indigo-950/90 backdrop-blur-[2px] p-6" >
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-gray-950 shadow-lg">
                    <Shield className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">Premium content</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {!currentUser ? 'Sign in to continue' : 'Complete payment to unlock'}
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    Answers, explanations, and the full runnable snippet stay on the server until you have access—this helps keep paid content fairly distributed.
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    {!currentUser ? (
                      <Link
                        to="/login"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-gray-50 sm:flex-none"
                      >
                        Sign in with Google <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPremiumClick(question.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 sm:flex-none"
                      >
                        Pay to unlock <ArrowRight className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Answer */}
        {!isLocked ? (
          <div>
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {showAnswer ? (
                <>
                  <EyeOff className="h-4 w-4" aria-hidden /> Hide answer
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden /> Show answer
                </>
              )}
            </button>

            {showAnswer ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <h5 className="mb-1 text-sm font-semibold text-emerald-900">Answer</h5>
                  <code className="break-words font-mono text-sm text-emerald-900">{question.answer}</code>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h5 className="mb-2 text-sm font-semibold text-blue-900">Explanation</h5>
                  <p className="text-sm leading-relaxed text-blue-950">{question.explanation}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isLocked && question.tags?.length ? (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag, idx) => (
                <span
                  key={`${question.id}-tag-${idx}-${tag}`}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default QuestionCard;
