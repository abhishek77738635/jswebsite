import React, { useMemo } from 'react';
import { highlightJavaScript } from '../lib/javascriptHighlight';
import './syntaxEditor.css';

export default function SyntaxCodeEditor({
  id,
  value,
  onChange,
  onKeyDown,
  onKeyUp,
  onClick,
  onScroll,
  fontSize = '0.875rem',
  wordWrap = true,
  tabSize = 2,
  textareaRef,
  highlightRef,
  minHeight = 420,
  className = '',
}) {
  const highlightedHtml = useMemo(() => highlightJavaScript(value), [value]);
  const wrapClass = wordWrap ? 'wrap' : '';

  return (
    <div className={`relative min-h-0 flex-1 overflow-hidden ${className}`}>
      <pre
        ref={highlightRef}
        aria-hidden
        className={`syntax-editor-highlight absolute inset-0 overflow-auto p-3 leading-6 ${wrapClass}`}
        style={{ fontSize, tabSize }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onScroll={onScroll}
        className={`syntax-editor-input absolute inset-0 z-10 resize-none overflow-auto p-3 leading-6 focus:outline-none ${wrapClass}`}
        style={{ fontSize, tabSize, minHeight }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        data-gramm="false"
      />
    </div>
  );
}
