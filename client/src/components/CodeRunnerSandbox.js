import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Terminal,
  Shield,
  Clock3,
  Copy,
  Download,
  Trash2,
  WrapText,
  Type,
  Braces,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  WORKER_SOURCE,
  EXECUTION_TIMEOUT_MS,
  MAX_CODE_SIZE,
  MAX_LOG_LINES,
  MAX_LOG_CHARS,
} from '../lib/sandboxWorker';
import { COMPILER_SNIPPETS, DEFAULT_SNIPPET_ID } from '../constants/compilerSnippets';
import SyntaxCodeEditor from './SyntaxCodeEditor';

const STORAGE_KEY = 'js-forge-compiler-draft';
const FONT_SIZES = { sm: '0.75rem', base: '0.875rem', lg: '1rem' };

const OUTPUT_LEVEL_STYLES = {
  error: 'text-red-300',
  warn: 'text-amber-300',
  result: 'text-emerald-300',
  info: 'text-sky-300',
  debug: 'text-violet-300',
  pass: 'text-emerald-300',
  log: 'text-gray-100',
};

const OUTPUT_LEVEL_LABELS = {
  error: 'ERR',
  warn: 'WARN',
  result: 'RET',
  info: 'INFO',
  debug: 'DBG',
  pass: 'PASS',
  log: 'LOG',
};

function buildStarterCode(seed) {
  if (seed?.starterCode?.trim()) {
    return seed.starterCode;
  }

  const snippet = COMPILER_SNIPPETS.find((item) => item.id === DEFAULT_SNIPPET_ID);
  const base = snippet?.code || '';

  const prompt = seed?.prompt?.trim();
  if (!prompt) return base;

  return [`// ${prompt}`, '', base].join('\n');
}

function loadDraft() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function saveDraft(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore quota errors
  }
}

function countLines(value) {
  if (!value) return 1;
  return value.split('\n').length;
}

function getCursorPosition(textarea) {
  if (!textarea) return { line: 1, column: 1 };
  const before = textarea.value.slice(0, textarea.selectionStart);
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

export default function CodeRunnerSandbox({ seed = null }) {
  const seedIdentity = useMemo(() => {
    if (!seed) return null;
    return [seed.id ?? '', seed.title ?? '', seed.starterCode ?? ''].join('::');
  }, [seed]);

  const [code, setCode] = useState(() => {
    const starter = buildStarterCode(seed);
    if (seed?.starterCode?.trim()) return starter;
    const draft = loadDraft();
    return draft.trim() ? draft : starter;
  });
  const [status, setStatus] = useState('idle');
  const [runtimeMs, setRuntimeMs] = useState(0);
  const [output, setOutput] = useState([]);
  const [passCount, setPassCount] = useState(0);
  const [snippetId, setSnippetId] = useState(DEFAULT_SNIPPET_ID);
  const [fontSize, setFontSize] = useState('base');
  const [wordWrap, setWordWrap] = useState(true);
  const tabSize = 2;
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

  const workerRef = useRef(null);
  const timeoutRef = useRef(null);
  const startedAtRef = useRef(null);
  const lastSeedIdentityRef = useRef(seedIdentity);
  const defaultCodeRef = useRef(buildStarterCode(seed));
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const saveTimerRef = useRef(null);

  const lineCount = useMemo(() => countLines(code), [code]);

  useEffect(() => {
    if (seedIdentity === lastSeedIdentityRef.current) return;
    const nextCode = buildStarterCode(seed);
    defaultCodeRef.current = nextCode;
    setCode(nextCode);
    setOutput([]);
    setStatus('idle');
    setRuntimeMs(0);
    setPassCount(0);
    lastSeedIdentityRef.current = seedIdentity;
  }, [seed, seedIdentity]);

  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => saveDraft(code), 400);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [code]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const stopWorker = useCallback((nextStatus = 'idle') => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    startedAtRef.current = null;
    setStatus(nextStatus);
  }, []);

  const runCode = useCallback(() => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setOutput([{ level: 'error', text: 'Code is empty. Add a snippet first.' }]);
      setStatus('error');
      return;
    }
    if (code.length > MAX_CODE_SIZE) {
      setOutput([{ level: 'error', text: `Code is too long. Limit is ${MAX_CODE_SIZE} characters.` }]);
      setStatus('error');
      return;
    }

    stopWorker('running');
    setOutput([]);
    setRuntimeMs(0);
    setPassCount(0);

    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);

    workerRef.current = worker;
    startedAtRef.current = performance.now();

    worker.onmessage = (event) => {
      const data = event.data || {};

      if (data.type === 'clear') {
        setOutput([]);
        return;
      }

      if (data.type === 'log') {
        const prefix = data.meta?.kind === 'group' ? '  '.repeat(Math.max(0, (data.meta.depth || 1) - 1)) : '';
        setOutput((previous) => [
          ...previous,
          { level: data.level || 'log', text: prefix + (data.message || ''), meta: data.meta },
        ]);
        return;
      }

      if (data.type === 'error') {
        setOutput((previous) => [...previous, { level: 'error', text: data.message || 'Execution failed.' }]);
        if (data.passCount) setPassCount(data.passCount);
        if (startedAtRef.current != null) {
          setRuntimeMs(Math.round(performance.now() - startedAtRef.current));
        }
        stopWorker('error');
        return;
      }

      if (data.type === 'done') {
        setOutput((previous) => {
          const resultLines = [...previous];
          if (data.passCount > 0) {
            resultLines.push({
              level: 'pass',
              text: `${data.passCount} assertion${data.passCount === 1 ? '' : 's'} passed`,
            });
          }
          if (data.result != null) {
            resultLines.push({ level: 'result', text: `Return value: ${data.result}` });
          }
          if (data.truncated) {
            resultLines.push({ level: 'warn', text: `Output limited to ${MAX_LOG_LINES} lines.` });
          }
          return resultLines;
        });
        if (data.passCount) setPassCount(data.passCount);
        if (startedAtRef.current != null) {
          setRuntimeMs(Math.round(performance.now() - startedAtRef.current));
        }
        stopWorker('success');
      }
    };

    worker.onerror = (event) => {
      const message = event?.message || 'Sandbox worker crashed.';
      setOutput((previous) => [...previous, { level: 'error', text: message }]);
      if (startedAtRef.current != null) {
        setRuntimeMs(Math.round(performance.now() - startedAtRef.current));
      }
      stopWorker('error');
    };

    timeoutRef.current = window.setTimeout(() => {
      setOutput((previous) => [
        ...previous,
        {
          level: 'error',
          text: `Execution timed out after ${EXECUTION_TIMEOUT_MS}ms (possible infinite loop).`,
        },
      ]);
      setRuntimeMs(EXECUTION_TIMEOUT_MS);
      stopWorker('timeout');
    }, EXECUTION_TIMEOUT_MS);

    worker.postMessage({
      code: trimmedCode,
      maxLogs: MAX_LOG_LINES,
      maxLogChars: MAX_LOG_CHARS,
    });
  }, [code, stopWorker]);

  const stopExecution = useCallback(() => {
    if (status !== 'running') return;
    setOutput((previous) => [...previous, { level: 'warn', text: 'Execution stopped by user.' }]);
    if (startedAtRef.current != null) {
      setRuntimeMs(Math.round(performance.now() - startedAtRef.current));
    }
    stopWorker('idle');
  }, [status, stopWorker]);

  const resetToStarter = useCallback(() => {
    setCode(defaultCodeRef.current);
    setOutput([]);
    setRuntimeMs(0);
    setPassCount(0);
    stopWorker('idle');
  }, [stopWorker]);

  const clearOutput = useCallback(() => {
    setOutput([]);
    setRuntimeMs(0);
    setPassCount(0);
  }, []);

  const applySnippet = useCallback((id) => {
    const snippet = COMPILER_SNIPPETS.find((item) => item.id === id);
    if (!snippet) return;
    setSnippetId(id);
    setCode(snippet.code);
    setOutput([]);
    setPassCount(0);
    stopWorker('idle');
  }, [stopWorker]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied');
    } catch {
      toast.error('Could not copy code');
    }
  }, [code]);

  const copyOutput = useCallback(async () => {
    if (!output.length) return;
    const text = output.map((line) => line.text).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Output copied');
    } catch {
      toast.error('Could not copy output');
    }
  }, [output]);

  const downloadCode = useCallback(() => {
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'snippet.js';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [code]);

  const syncEditorScroll = useCallback((event) => {
    const { scrollTop, scrollLeft } = event.target;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    setCursor(getCursorPosition(event.target));
  }, []);

  const handleEditorKeyDown = useCallback(
    (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        runCode();
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        stopExecution();
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const insertion = ' '.repeat(tabSize);
        const nextCode = code.slice(0, start) + insertion + code.slice(end);
        setCode(nextCode);
        requestAnimationFrame(() => {
          textarea.selectionStart = start + insertion.length;
          textarea.selectionEnd = start + insertion.length;
        });
      }
    },
    [code, runCode, stopExecution, tabSize],
  );

  const cycleFontSize = useCallback(() => {
    setFontSize((current) => (current === 'sm' ? 'base' : current === 'base' ? 'lg' : 'sm'));
  }, []);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced JS Playground</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Syntax highlighting, snippets, assertions, and console helpers.
            </p>
            {seed?.title ? (
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Loaded: <span className="font-semibold">{seed.title}</span>
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Shield className="h-3.5 w-3.5" aria-hidden />
              Sandbox guardrails
            </div>
            <p className="mt-1">
              No network APIs · {EXECUTION_TIMEOUT_MS / 1000}s timeout · {MAX_LOG_LINES} log lines max
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="compiler-snippet">
            Load snippet
          </label>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
            <Braces className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
            <select
              id="compiler-snippet"
              value={snippetId}
              onChange={(event) => applySnippet(event.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none dark:text-gray-100"
            >
              {COMPILER_SNIPPETS.map((snippet) => (
                <option key={snippet.id} value={snippet.id}>
                  {snippet.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={cycleFontSize}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            title="Cycle font size"
          >
            <Type className="h-3.5 w-3.5" aria-hidden />
            Font {fontSize}
          </button>

          <button
            type="button"
            onClick={() => setWordWrap((value) => !value)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
              wordWrap
                ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle word wrap"
          >
            <WrapText className="h-3.5 w-3.5" aria-hidden />
            Wrap
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Keyboard className="h-3.5 w-3.5" aria-hidden />
            Ctrl/Cmd+Enter run · Esc stop · Tab indent
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400" htmlFor="sandbox-code">
              JavaScript editor
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {code.length} chars · {lineCount} lines
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">
            <div className="flex max-h-[480px] min-h-[420px]">
              <div
                ref={lineNumbersRef}
                aria-hidden
                className="select-none overflow-hidden border-r border-gray-200 bg-gray-100 px-3 py-3 text-right font-mono text-xs leading-6 text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500"
                style={{ fontSize: FONT_SIZES[fontSize], minWidth: '3rem' }}
              >
                {Array.from({ length: lineCount }, (_, index) => (
                  <div key={index + 1} className={cursor.line === index + 1 ? 'text-blue-500 dark:text-blue-400' : ''}>
                    {index + 1}
                  </div>
                ))}
              </div>

              <SyntaxCodeEditor
                id="sandbox-code"
                value={code}
                textareaRef={textareaRef}
                highlightRef={highlightRef}
                fontSize={FONT_SIZES[fontSize]}
                wordWrap={wordWrap}
                tabSize={tabSize}
                minHeight={420}
                onChange={(event) => {
                  setCode(event.target.value);
                  setCursor(getCursorPosition(event.target));
                }}
                onKeyDown={handleEditorKeyDown}
                onKeyUp={(event) => setCursor(getCursorPosition(event.target))}
                onClick={(event) => setCursor(getCursorPosition(event.target))}
                onScroll={syncEditorScroll}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <span>
                Ln {cursor.line}, Col {cursor.column}
              </span>
              <span className="hidden flex-wrap items-center gap-2 sm:flex">
                <span className="text-purple-600 dark:text-purple-400">keyword</span>
                <span className="text-blue-600 dark:text-blue-400">function</span>
                <span className="text-pink-600 dark:text-pink-400">variable</span>
                <span className="text-green-600 dark:text-green-400">string</span>
              </span>
              <span>Tab: {tabSize} spaces</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={runCode}
              disabled={status === 'running'}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="h-4 w-4" aria-hidden />
              Run
            </button>
            <button
              type="button"
              onClick={stopExecution}
              disabled={status !== 'running'}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <Square className="h-4 w-4" aria-hidden />
              Stop
            </button>
            <button
              type="button"
              onClick={resetToStarter}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <Copy className="h-4 w-4" aria-hidden />
              Copy
            </button>
            <button
              type="button"
              onClick={downloadCode}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4" aria-hidden />
              .js
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-gray-950 text-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4 text-emerald-300" aria-hidden />
              Console
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {passCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {passCount} passed
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                {runtimeMs ? `${runtimeMs}ms` : '—'}
              </span>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output.length}
                className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={clearOutput}
                disabled={!output.length}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40"
              >
                <Trash2 className="h-3 w-3" aria-hidden />
                Clear
              </button>
            </div>
          </div>

          <div className="min-h-[360px] flex-1 overflow-y-auto p-4 font-mono text-sm leading-6">
            {output.length === 0 ? (
              <p className="text-gray-500">
                No output yet. Use <code className="text-gray-400">console.log</code>,{' '}
                <code className="text-gray-400">console.table</code>, or <code className="text-gray-400">expect()</code>.
              </p>
            ) : (
              output.map((line, index) => (
                <div key={`${index}-${line.level}`} className="flex gap-2">
                  <span className="w-10 shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    {OUTPUT_LEVEL_LABELS[line.level] || 'LOG'}
                  </span>
                  <p className={`min-w-0 flex-1 whitespace-pre-wrap break-words ${OUTPUT_LEVEL_STYLES[line.level] || OUTPUT_LEVEL_STYLES.log}`}>
                    {line.text}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-800 px-4 py-2 text-xs text-gray-400">
            <span>
              Status: <span className="font-medium text-gray-200">{status}</span>
            </span>
            <span>
              APIs: log · table · dir · time · group · expect()
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
