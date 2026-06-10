const KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete',
  'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in',
  'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof',
  'var', 'void', 'while', 'with', 'yield', 'async', 'await', 'of', 'static', 'get', 'set',
  'from', 'as', 'null', 'true', 'false', 'undefined', 'NaN', 'Infinity',
]);

const BUILTINS = new Set([
  'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp',
  'Map', 'Set', 'Promise', 'Error', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'setTimeout',
  'setInterval', 'clearTimeout', 'clearInterval', 'expect',
]);

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isIdentifierStart(char) {
  return /[A-Za-z_$]/.test(char);
}

function isIdentifierPart(char) {
  return /[\w$]/.test(char);
}

function wrap(type, value) {
  return `<span class="js-hl-${type}">${escapeHtml(value)}</span>`;
}

function readString(code, start) {
  const quote = code[start];
  let i = start + 1;
  while (i < code.length) {
    if (code[i] === '\\') {
      i += 2;
      continue;
    }
    if (code[i] === quote) {
      return { value: code.slice(start, i + 1), end: i + 1 };
    }
    i += 1;
  }
  return { value: code.slice(start), end: code.length };
}

function readLineComment(code, start) {
  let i = start + 2;
  while (i < code.length && code[i] !== '\n') i += 1;
  return { value: code.slice(start, i), end: i };
}

function readBlockComment(code, start) {
  let i = start + 2;
  while (i < code.length - 1) {
    if (code[i] === '*' && code[i + 1] === '/') {
      return { value: code.slice(start, i + 2), end: i + 2 };
    }
    i += 1;
  }
  return { value: code.slice(start), end: code.length };
}

function readNumber(code, start) {
  let i = start;
  if (code[i] === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
    i += 2;
    while (i < code.length && /[0-9a-fA-F_]/.test(code[i])) i += 1;
    return { value: code.slice(start, i), end: i };
  }
  while (i < code.length && /[0-9._]/.test(code[i])) i += 1;
  if (code[i] === 'n') i += 1;
  return { value: code.slice(start, i), end: i };
}

function readIdentifier(code, start) {
  let i = start + 1;
  while (i < code.length && isIdentifierPart(code[i])) i += 1;
  return { value: code.slice(start, i), end: i };
}

function classifyIdentifier(name, pendingRole, nextNonSpaceChar) {
  if (KEYWORDS.has(name)) return { type: 'keyword', nextRole: null };
  if (pendingRole === 'function-name') return { type: 'function', nextRole: null };
  if (pendingRole === 'variable-name') return { type: 'variable', nextRole: null };
  if (pendingRole === 'class-name') return { type: 'class', nextRole: null };
  if (BUILTINS.has(name)) return { type: 'builtin', nextRole: null };
  if (nextNonSpaceChar === '(') return { type: 'function', nextRole: null };
  return { type: 'variable', nextRole: null };
}

function nextNonSpaceChar(code, index) {
  let i = index;
  while (i < code.length && /\s/.test(code[i])) i += 1;
  return code[i] || '';
}

export function highlightJavaScript(code) {
  if (!code) return '&nbsp;';

  let html = '';
  let i = 0;
  let pendingRole = null;

  while (i < code.length) {
    const char = code[i];

    if (char === '\n') {
      html += '\n';
      i += 1;
      continue;
    }

    if (/\s/.test(char)) {
      let j = i + 1;
      while (j < code.length && /\s/.test(code[j]) && code[j] !== '\n') j += 1;
      html += escapeHtml(code.slice(i, j));
      i = j;
      continue;
    }

    if (char === '/' && code[i + 1] === '/') {
      const token = readLineComment(code, i);
      html += wrap('comment', token.value);
      i = token.end;
      pendingRole = null;
      continue;
    }

    if (char === '/' && code[i + 1] === '*') {
      const token = readBlockComment(code, i);
      html += wrap('comment', token.value);
      i = token.end;
      pendingRole = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      const token = readString(code, i);
      html += wrap('string', token.value);
      i = token.end;
      pendingRole = null;
      continue;
    }

    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(code[i + 1]))) {
      const token = readNumber(code, i);
      html += wrap('number', token.value);
      i = token.end;
      pendingRole = null;
      continue;
    }

    if (isIdentifierStart(char)) {
      const token = readIdentifier(code, i);
      const nextChar = nextNonSpaceChar(code, token.end);
      const classified = classifyIdentifier(token.value, pendingRole, nextChar);
      html += wrap(classified.type, token.value);

      if (classified.type === 'keyword') {
        if (token.value === 'function') pendingRole = 'function-name';
        else if (token.value === 'class') pendingRole = 'class-name';
        else if (['const', 'let', 'var'].includes(token.value)) pendingRole = 'variable-name';
        else pendingRole = null;
      } else {
        pendingRole = null;
      }

      i = token.end;
      continue;
    }

    if (/[=+\-*/%&|^~!<>?:.]/.test(char)) {
      let j = i + 1;
      while (j < code.length && /[=+\-*/%&|^~<>]/.test(code[j])) j += 1;
      html += wrap('operator', code.slice(i, j));
      i = j;
      pendingRole = null;
      continue;
    }

    html += escapeHtml(char);
    i += 1;
    pendingRole = null;
  }

  return `${html}\n`;
}
