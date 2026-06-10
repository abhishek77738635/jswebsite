import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BookOpen, Code2 } from 'lucide-react';
import { JS_THEORY_TOPICS } from '../constants/jsTheory';
import TheoryDiagram from './TheoryDiagram';
import TopicMcqQuiz from './TopicMcqQuiz';

const LEVEL_STYLES = {
  Beginner: 'bg-green-100 text-green-800 ring-1 ring-green-200/80 dark:bg-green-950/80 dark:text-green-300 dark:ring-green-800/60',
  Intermediate: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:ring-amber-800/60',
  Advanced: 'bg-red-100 text-red-800 ring-1 ring-red-200/80 dark:bg-red-950/80 dark:text-red-300 dark:ring-red-800/60',
};

const LEVEL_TITLE_STYLES = {
  Beginner: 'text-green-950 dark:text-green-50',
  Intermediate: 'text-amber-950 dark:text-amber-50',
  Advanced: 'text-red-950 dark:text-red-50',
};

export default function LearnTheoryPanel({ activeTopicId, onTryExample }) {
  const topic = JS_THEORY_TOPICS.find((t) => t.id === activeTopicId) || JS_THEORY_TOPICS[0];
  const titleStyle = LEVEL_TITLE_STYLES[topic.level] || LEVEL_TITLE_STYLES.Beginner;

  return (
    <article className="min-w-0 flex-1 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className={`text-xl font-bold leading-tight sm:text-2xl ${titleStyle}`}>
                    {topic.title}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${LEVEL_STYLES[topic.level] || LEVEL_STYLES.Beginner}`}
                  >
                    {topic.level}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{topic.summary}</p>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100">
              <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
              Explanation
            </div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{topic.explanation}</p>
          </div>

          <TheoryDiagram type={topic.diagram} />

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Examples ({topic.examples.length})
              </h4>
            </div>
            <div className="space-y-4">
              {topic.examples.map((example, index) => (
                <div
                  key={example.title}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {index + 1}. {example.title}
                    </p>
                    {onTryExample ? (
                      <button
                        type="button"
                        onClick={() => onTryExample(example.code, `${topic.title}: ${example.title}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        Try in compiler
                      </button>
                    ) : null}
                  </div>
                  <div className="code-block overflow-x-auto text-sm">
                    <SyntaxHighlighter
                      language="javascript"
                      style={tomorrow}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.8125rem',
                      }}
                      showLineNumbers
                    >
                      {example.code}
                    </SyntaxHighlighter>
                  </div>
                  <p className="border-t border-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-600 dark:border-gray-800 dark:text-gray-400">
                    {example.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <TopicMcqQuiz mcqs={topic.mcqs} topicId={topic.id} />
    </article>
  );
}
