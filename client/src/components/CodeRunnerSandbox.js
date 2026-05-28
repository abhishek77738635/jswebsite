import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Square, RotateCcw, Terminal, Shield, Clock3 } from 'lucide-react';

const EXECUTION_TIMEOUT_MS = 2000;
const MAX_CODE_SIZE = 15000;
const MAX_LOG_LINES = 80;
const MAX_LOG_CHARS = 400;

const WORKER_SOURCE = `
const truncate = (value, maxLength) => {
  const str = typeof value === 'string' ? value : String(value);
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
};

const stringifyArg = (arg, maxLength) => {
  if (typeof arg === 'string') return truncate(arg, maxLength);
  try {
    return truncate(JSON.stringify(arg), maxLength);
  } catch (error) {
    return truncate(String(arg), maxLength);
  }
};

const block = (name) => () => {
  throw new Error(name + ' is disabled in the sandbox');
};

self.fetch = block('fetch');
self.importScripts = block('importScripts');
self.XMLHttpRequest = block('XMLHttpRequest');
self.WebSocket = block('WebSocket');
self.EventSource = block('EventSource');

self.onmessage = async (event) => {
  const { code, maxLogs, maxLogChars } = event.data || {};
  let count = 0;

  const sendLog = (level, args) => {
    if (count >= maxLogs) return;
    count += 1;
    const line = args.map((arg) => stringifyArg(arg, maxLogChars)).join(' ');
    self.postMessage({ type: 'log', level, message: line });
  };

  const safeConsole = {
    log: (...args) => sendLog('log', args),
    info: (...args) => sendLog('info', args),
    warn: (...args) => sendLog('warn', args),
    error: (...args) => sendLog('error', args),
    debug: (...args) => sendLog('debug', args),
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const wrappedCode = '"use strict";\\n' + code;
    const runner = new AsyncFunction('console', wrappedCode);
    const result = await runner(safeConsole);

    self.postMessage({
      type: 'done',
      result: result === undefined ? null : stringifyArg(result, maxLogChars),
      truncated: count >= maxLogs,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error && error.stack ? String(error.stack) : String(error),
    });
  }
};
`;

function buildStarterCode(seed) {
  if (seed?.starterCode?.trim()) {
    return seed.starterCode;
  }

  const prompt = seed?.prompt?.trim();
  return [
    '// Run your JavaScript snippet safely in-browser.',
    prompt ? `// Question: ${prompt}` : '// Question: Add your logic below.',
    '',
    'function solve() {',
    "  return 'Ready';",
    '}',
    '',
    'console.log(solve());',
  ].join('\n');
}

export default function CodeRunnerSandbox({ seed = null }) {
  const seedIdentity = useMemo(() => {
    if (!seed) return null;
    return [seed.id ?? '', seed.title ?? '', seed.starterCode ?? ''].join('::');
  }, [seed]);

  const [code, setCode] = useState(() => buildStarterCode(seed));
  const [status, setStatus] = useState('idle');
  const [runtimeMs, setRuntimeMs] = useState(0);
  const [output, setOutput] = useState([]);

  const workerRef = useRef(null);
  const timeoutRef = useRef(null);
  const startedAtRef = useRef(null);
  const lastSeedIdentityRef = useRef(seedIdentity);
  const defaultCodeRef = useRef(buildStarterCode(seed));

  useEffect(() => {
    if (seedIdentity === lastSeedIdentityRef.current) return;
    const nextCode = buildStarterCode(seed);
    defaultCodeRef.current = nextCode;
    setCode(nextCode);
    setOutput([]);
    setStatus('idle');
    setRuntimeMs(0);
    lastSeedIdentityRef.current = seedIdentity;
  }, [seed, seedIdentity]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const stopWorker = (nextStatus = 'idle') => {
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
  };

  const runCode = () => {
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

    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);

    workerRef.current = worker;
    startedAtRef.current = performance.now();

    worker.onmessage = (event) => {
      const data = event.data || {};

      if (data.type === 'log') {
        setOutput((previous) => [...previous, { level: data.level || 'log', text: data.message }]);
        return;
      }

      if (data.type === 'error') {
        setOutput((previous) => [...previous, { level: 'error', text: data.message || 'Execution failed.' }]);
        if (startedAtRef.current != null) {
          setRuntimeMs(Math.round(performance.now() - startedAtRef.current));
        }
        stopWorker('error');
        return;
      }

      if (data.type === 'done') {
        setOutput((previous) => {
          const resultLines = [...previous];
          if (data.result != null) {
            resultLines.push({ level: 'result', text: `Return value: ${data.result}` });
          }
          if (data.truncated) {
            resultLines.push({ level: 'warn', text: `Output limited to ${MAX_LOG_LINES} lines.` });
          }
          return resultLines;
        });
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
  };

  const stopExecution = () => {
    if (status !== 'running') return;
    setOutput((previous) => [...previous, { level: 'warn', text: 'Execution stopped by user.' }]);
    if (startedAtRef.current != null) {
      setRuntimeMs(Math.round(performance.now() - startedAtRef.current));
    }
    stopWorker('idle');
  };

  const resetToStarter = () => {
    setCode(defaultCodeRef.current);
    setOutput([]);
    setRuntimeMs(0);
    stopWorker('idle');
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Standard JS Compiler</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Run snippets directly in-browser with a worker sandbox, output caps, and timeout protection.
            </p>
            {seed?.title ? (
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Loaded question: <span className="font-semibold">{seed.title}</span>
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Shield className="h-3.5 w-3.5" aria-hidden />
              Sandbox guardrails
            </div>
            <p className="mt-1">No network APIs, {EXECUTION_TIMEOUT_MS}ms timeout, and limited output size.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400" htmlFor="sandbox-code">
            JavaScript code
          </label>
          <textarea
            id="sandbox-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-[420px] w-full rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400"
            spellCheck={false}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={runCode}
              disabled={status === 'running'}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="h-4 w-4" aria-hidden />
              Run code
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
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-gray-950 text-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4 text-emerald-300" aria-hidden />
              Output
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-gray-400">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {runtimeMs ? `${runtimeMs}ms` : '—'}
            </div>
          </div>

          <div className="min-h-[360px] flex-1 overflow-y-auto p-4 font-mono text-sm leading-6">
            {output.length === 0 ? (
              <p className="text-gray-500">No output yet. Click “Run code”.</p>
            ) : (
              output.map((line, index) => (
                <p
                  key={`${index}-${line.level}`}
                  className={
                    line.level === 'error'
                      ? 'text-red-300'
                      : line.level === 'warn'
                        ? 'text-amber-300'
                        : line.level === 'result'
                          ? 'text-emerald-300'
                          : 'text-gray-100'
                  }
                >
                  {line.text}
                </p>
              ))
            )}
          </div>

          <div className="border-t border-gray-800 px-4 py-2 text-xs text-gray-400">
            Status: <span className="font-medium text-gray-200">{status}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
