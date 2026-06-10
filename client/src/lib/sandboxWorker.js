export const EXECUTION_TIMEOUT_MS = 5000;
export const MAX_CODE_SIZE = 20000;
export const MAX_LOG_LINES = 120;
export const MAX_LOG_CHARS = 600;

export const WORKER_SOURCE = `
const truncate = (value, maxLength) => {
  const str = typeof value === 'string' ? value : String(value);
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
};

const stringifyArg = (arg, maxLength) => {
  if (typeof arg === 'string') return truncate(arg, maxLength);
  if (typeof arg === 'function') return truncate('[Function]', maxLength);
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  try {
    return truncate(JSON.stringify(arg, null, 2), maxLength);
  } catch (error) {
    return truncate(String(arg), maxLength);
  }
};

const deepEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (typeof a === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(a[key], b[key]));
  }
  return false;
};

const block = (name) => () => {
  throw new Error(name + ' is disabled in the sandbox');
};

self.fetch = block('fetch');
self.importScripts = block('importScripts');
self.XMLHttpRequest = block('XMLHttpRequest');
self.WebSocket = block('WebSocket');
self.EventSource = block('EventSource');

const createExpect = (onPass) => (actual) => {
  const fail = (message) => {
    throw new Error('Assertion failed: ' + message);
  };

  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        fail('Expected ' + stringifyArg(expected, 200) + ' but received ' + stringifyArg(actual, 200));
      }
      onPass();
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) {
        fail('Expected ' + stringifyArg(expected, 200) + ' but received ' + stringifyArg(actual, 200));
      }
      onPass();
    },
    toBeTruthy() {
      if (!actual) fail('Expected value to be truthy but received ' + stringifyArg(actual, 200));
      onPass();
    },
    toBeNull() {
      if (actual !== null) fail('Expected null but received ' + stringifyArg(actual, 200));
      onPass();
    },
    toContain(item) {
      if (typeof actual === 'string' && !actual.includes(item)) {
        fail('Expected string to contain ' + stringifyArg(item, 120));
      } else if (Array.isArray(actual) && !actual.some((entry) => Object.is(entry, item))) {
        fail('Expected array to contain ' + stringifyArg(item, 120));
      } else if (typeof actual !== 'string' && !Array.isArray(actual)) {
        fail('toContain() expects a string or array');
      } else {
        onPass();
      }
    },
    toThrow() {
      if (typeof actual !== 'function') fail('toThrow() expects a function');
      let threw = false;
      try {
        actual();
      } catch (error) {
        threw = true;
      }
      if (!threw) fail('Expected function to throw');
      onPass();
    },
  };
};

self.onmessage = async (event) => {
  const { code, maxLogs, maxLogChars } = event.data || {};
  let count = 0;
  let passCount = 0;

  const sendLog = (level, args, meta) => {
    if (count >= maxLogs) return;
    count += 1;
    const line = args.map((arg) => stringifyArg(arg, maxLogChars)).join(' ');
    self.postMessage({ type: 'log', level, message: line, meta: meta || null });
  };

  const timers = new Map();
  let groupDepth = 0;

  const safeConsole = {
    log: (...args) => sendLog('log', args),
    info: (...args) => sendLog('info', args),
    warn: (...args) => sendLog('warn', args),
    error: (...args) => sendLog('error', args),
    debug: (...args) => sendLog('debug', args),
    clear: () => self.postMessage({ type: 'clear' }),
    dir: (value) => sendLog('log', [value], { kind: 'dir' }),
    table: (value) => {
      if (Array.isArray(value)) {
        sendLog('log', [JSON.stringify(value, null, 2)], { kind: 'table' });
        return;
      }
      if (value && typeof value === 'object') {
        sendLog('log', [JSON.stringify(value, null, 2)], { kind: 'table' });
        return;
      }
      sendLog('log', [value], { kind: 'table' });
    },
    group: (label) => {
      groupDepth += 1;
      sendLog('log', [label || 'console.group'], { kind: 'group', depth: groupDepth });
    },
    groupEnd: () => {
      groupDepth = Math.max(0, groupDepth - 1);
      sendLog('log', ['console.groupEnd'], { kind: 'group-end', depth: groupDepth });
    },
    time: (label = 'default') => {
      timers.set(label, performance.now());
      sendLog('info', ['Timer "' + label + '" started'], { kind: 'time-start', label });
    },
    timeEnd: (label = 'default') => {
      const started = timers.get(label);
      if (started == null) {
        sendLog('warn', ['Timer "' + label + '" does not exist']);
        return;
      }
      const elapsed = Math.round(performance.now() - started);
      timers.delete(label);
      sendLog('info', ['Timer "' + label + '": ' + elapsed + 'ms'], { kind: 'time-end', label, elapsed });
    },
  };

  const expect = createExpect(() => {
    passCount += 1;
  });

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const wrappedCode = '"use strict";\\n' + code;
    const runner = new AsyncFunction('console', 'expect', wrappedCode);
    const result = await runner(safeConsole, expect);

    self.postMessage({
      type: 'done',
      result: result === undefined ? null : stringifyArg(result, maxLogChars),
      truncated: count >= maxLogs,
      passCount,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error && error.stack ? String(error.stack) : String(error),
      passCount,
    });
  }
};
`;
