import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, RotateCcw, Sparkles } from 'lucide-react';

export default function TopicMcqQuiz({ mcqs = [], topicId }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [topicId]);

  if (!mcqs.length) return null;

  const total = mcqs.length;
  const correctCount = mcqs.reduce((sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const allAnswered = mcqs.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-gray-900 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Topic quiz</h4>
        </div>
        {submitted ? (
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            Score: {correctCount}/{total}
            {correctCount === total ? ' — Perfect!' : ''}
          </p>
        ) : null}
      </div>

      <div className="space-y-5">
        {mcqs.map((mcq, qIndex) => {
          const picked = answers[qIndex];
          const isCorrect = submitted && picked === mcq.correctIndex;
          const isWrong = submitted && picked !== undefined && picked !== mcq.correctIndex;

          return (
            <fieldset
              key={mcq.question}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <legend className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {qIndex + 1}. {mcq.question}
              </legend>
              <div className="space-y-2">
                {mcq.options.map((option, oIndex) => {
                  const selected = picked === oIndex;
                  const showCorrect = submitted && oIndex === mcq.correctIndex;
                  const showWrong = submitted && selected && oIndex !== mcq.correctIndex;

                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                        showCorrect
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
                          : showWrong
                            ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
                            : selected
                              ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40'
                              : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mcq-${topicId}-${qIndex}`}
                        checked={selected}
                        disabled={submitted}
                        onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="text-gray-800 dark:text-gray-200">{option}</span>
                      {showCorrect ? (
                        <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      ) : null}
                    </label>
                  );
                })}
              </div>
              {submitted && isWrong ? (
                <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Why: </span>
                  {mcq.explanation}
                </p>
              ) : null}
              {submitted && isCorrect ? (
                <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">{mcq.explanation}</p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Circle className="h-4 w-4" />
            Check answers
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            Retry quiz
          </button>
        )}
      </div>
    </section>
  );
}
