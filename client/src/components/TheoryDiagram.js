import React from 'react';

function DiagramFrame({ title, children }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-gray-900">
      <figcaption className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
        {title}
      </figcaption>
      <div className="overflow-x-auto">{children}</div>
    </figure>
  );
}

function Box({ label, sub, color = 'blue' }) {
  const colors = {
    blue: 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200',
    green: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
    amber: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
    violet: 'border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200',
    gray: 'border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200',
  };
  return (
    <div className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold ${colors[color]}`}>
      <div>{label}</div>
      {sub ? <div className="mt-0.5 font-normal opacity-80">{sub}</div> : null}
    </div>
  );
}

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center justify-center px-1 text-violet-500 dark:text-violet-400">
      <span className="text-lg leading-none">↓</span>
      {label ? <span className="text-[10px] font-medium">{label}</span> : null}
    </div>
  );
}

const DIAGRAMS = {
  variables: () => (
    <DiagramFrame title="Memory: variables hold values">
      <div className="flex min-w-[280px] flex-col items-center gap-1">
        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <Box label="name" sub='"Ada"' color="blue" />
          <Box label="age" sub="28" color="green" />
          <Box label="isActive" sub="true" color="amber" />
          <Box label="score" sub="undefined" color="gray" />
        </div>
        <Arrow label="typeof checks the type" />
        <div className="grid w-full max-w-sm grid-cols-3 gap-2 text-[10px]">
          <Box label="string" color="blue" />
          <Box label="number" color="green" />
          <Box label="boolean" color="amber" />
        </div>
      </div>
    </DiagramFrame>
  ),

  functions: () => (
    <DiagramFrame title="How a function call works">
      <div className="flex min-w-[300px] flex-col items-stretch gap-2">
        <Box label="1. You call greet('Sam')" color="violet" />
        <Arrow />
        <Box label="2. Arguments go in: name = 'Sam'" color="blue" />
        <Arrow />
        <Box label="3. Function body runs" color="green" />
        <Arrow />
        <Box label="4. return sends value back to caller" color="amber" />
      </div>
    </DiagramFrame>
  ),

  closures: () => (
    <DiagramFrame title="Closure keeps outer variables alive">
      <svg viewBox="0 0 360 200" className="mx-auto h-auto w-full max-w-md" role="img" aria-label="Closure diagram">
        <rect x="20" y="20" width="320" height="160" rx="12" fill="none" stroke="currentColor" className="text-violet-400" strokeWidth="2" strokeDasharray="6 4" />
        <text x="180" y="42" textAnchor="middle" className="fill-violet-600 text-[11px] font-semibold dark:fill-violet-300">outer()</text>
        <rect x="50" y="55" width="100" height="36" rx="8" className="fill-blue-100 stroke-blue-400 dark:fill-blue-950 dark:stroke-blue-600" strokeWidth="1.5" />
        <text x="100" y="77" textAnchor="middle" className="fill-blue-900 text-[10px] dark:fill-blue-200">let count = 0</text>
        <rect x="190" y="90" width="120" height="70" rx="8" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950 dark:stroke-emerald-600" strokeWidth="1.5" />
        <text x="250" y="112" textAnchor="middle" className="fill-emerald-900 text-[10px] dark:fill-emerald-200">inner()</text>
        <text x="250" y="132" textAnchor="middle" className="fill-emerald-800 text-[9px] dark:fill-emerald-300">reads count</text>
        <text x="250" y="148" textAnchor="middle" className="fill-emerald-800 text-[9px] dark:fill-emerald-300">count++</text>
        <path d="M150 73 L190 110" className="stroke-amber-500" strokeWidth="1.5" markerEnd="url(#arrow)" fill="none" />
        <text x="168" y="95" className="fill-amber-600 text-[9px] dark:fill-amber-400">closure link</text>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="fill-amber-500" />
          </marker>
        </defs>
      </svg>
    </DiagramFrame>
  ),

  'arrays-objects': () => (
    <DiagramFrame title="Arrays are ordered lists · Objects are labeled maps">
      <div className="grid min-w-[320px] gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-center text-[10px] font-semibold text-gray-500">Array (index → value)</p>
          <div className="space-y-1">
            {['0 → "apple"', '1 → "banana"', '2 → "cherry"'].map((row) => (
              <div key={row} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-center font-mono text-[11px] text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
                {row}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-center text-[10px] font-semibold text-gray-500">Object (key → value)</p>
          <div className="space-y-1">
            {['name → "Mina"', 'role → "dev"', 'yrs → 3'].map((row) => (
              <div key={row} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-center font-mono text-[11px] text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                {row}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DiagramFrame>
  ),

  promises: () => (
    <DiagramFrame title="Promise lifecycle">
      <div className="flex min-w-[300px] flex-col items-center gap-2">
        <Box label="Pending" sub="work in progress…" color="amber" />
        <div className="flex w-full max-w-xs justify-center gap-8">
          <Arrow label="success" />
          <span className="text-lg text-gray-400">/</span>
          <Arrow label="failure" />
        </div>
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <Box label="Fulfilled" sub=".then()" color="green" />
          <Box label="Rejected" sub=".catch()" color="violet" />
        </div>
      </div>
    </DiagramFrame>
  ),

  'event-loop': () => (
    <DiagramFrame title="Event loop (simplified)">
      <svg viewBox="0 0 400 220" className="mx-auto h-auto w-full max-w-lg" role="img" aria-label="Event loop diagram">
        <rect x="30" y="30" width="120" height="70" rx="10" className="fill-blue-100 stroke-blue-500 dark:fill-blue-950 dark:stroke-blue-600" strokeWidth="2" />
        <text x="90" y="58" textAnchor="middle" className="fill-blue-900 text-[11px] font-semibold dark:fill-blue-200">Call Stack</text>
        <text x="90" y="78" textAnchor="middle" className="fill-blue-800 text-[9px] dark:fill-blue-300">sync code runs here</text>

        <rect x="250" y="30" width="120" height="70" rx="10" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950 dark:stroke-amber-600" strokeWidth="2" />
        <text x="310" y="58" textAnchor="middle" className="fill-amber-900 text-[11px] font-semibold dark:fill-amber-200">Web APIs</text>
        <text x="310" y="78" textAnchor="middle" className="fill-amber-800 text-[9px] dark:fill-amber-300">setTimeout, fetch…</text>

        <rect x="140" y="140" width="120" height="60" rx="10" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950 dark:stroke-emerald-600" strokeWidth="2" />
        <text x="200" y="168" textAnchor="middle" className="fill-emerald-900 text-[11px] font-semibold dark:fill-emerald-200">Task Queue</text>
        <text x="200" y="186" textAnchor="middle" className="fill-emerald-800 text-[9px] dark:fill-emerald-300">callbacks wait here</text>

        <path d="M90 100 L90 125 L200 125 L200 140" className="stroke-violet-500" strokeWidth="1.5" fill="none" />
        <path d="M310 100 L310 125 L200 125" className="stroke-violet-500" strokeWidth="1.5" fill="none" />
        <path d="M200 200 L200 215 L90 215 L90 100" className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
        <text x="200" y="118" textAnchor="middle" className="fill-violet-600 text-[9px] dark:fill-violet-400">Event Loop picks tasks</text>
      </svg>
    </DiagramFrame>
  ),

  prototypes: () => (
    <DiagramFrame title="Prototype chain lookup">
      <div className="flex min-w-[280px] flex-col items-center gap-2">
        <Box label="myDog" sub='{ name: "Rex" }' color="blue" />
        <Arrow label="__proto__" />
        <Box label="Dog.prototype" sub="bark()" color="green" />
        <Arrow label="__proto__" />
        <Box label="Object.prototype" sub="toString()" color="amber" />
        <Arrow label="__proto__" />
        <Box label="null" sub="end of chain" color="gray" />
      </div>
    </DiagramFrame>
  ),

  intro: () => (
    <DiagramFrame title="JavaScript in the web stack">
      <div className="flex min-w-[300px] flex-col items-stretch gap-2">
        <Box label="HTML" sub="structure" color="amber" />
        <Arrow />
        <Box label="CSS" sub="style" color="violet" />
        <Arrow />
        <Box label="JavaScript" sub="behavior & logic" color="green" />
        <Arrow label="runs in" />
        <Box label="Browser / Node.js" sub="JS engine" color="blue" />
      </div>
    </DiagramFrame>
  ),

  operators: () => (
    <DiagramFrame title="Operators combine values">
      <div className="grid min-w-[280px] grid-cols-3 gap-2">
        <Box label="+" sub="add / concat" color="blue" />
        <Box label="===" sub="strict equal" color="green" />
        <Box label="&&" sub="logical AND" color="amber" />
        <Box label="??" sub="nullish coalesce" color="violet" />
        <Box label="?" sub="ternary" color="blue" />
        <Box label="!" sub="NOT" color="gray" />
      </div>
    </DiagramFrame>
  ),

  'control-flow': () => (
    <DiagramFrame title="if / else decision tree">
      <div className="flex min-w-[260px] flex-col items-center gap-1">
        <Box label="condition?" color="violet" />
        <div className="flex w-full max-w-xs justify-center gap-6">
          <div className="flex flex-col items-center">
            <Arrow label="true" />
            <Box label="if block" color="green" />
          </div>
          <div className="flex flex-col items-center">
            <Arrow label="false" />
            <Box label="else block" color="amber" />
          </div>
        </div>
      </div>
    </DiagramFrame>
  ),

  loops: () => (
    <DiagramFrame title="Loop cycle">
      <div className="flex min-w-[240px] flex-col items-center gap-2">
        <Box label="init" color="gray" />
        <Arrow />
        <Box label="condition?" color="violet" />
        <Arrow label="true" />
        <Box label="body runs" color="green" />
        <Arrow label="update" />
        <Box label="back to condition" color="blue" />
      </div>
    </DiagramFrame>
  ),

  arrays: () => (
    <DiagramFrame title="Array indices">
      <div className="flex min-w-[300px] gap-2">
        {['0: "a"', '1: "b"', '2: "c"'].map((cell) => (
          <div key={cell} className="flex-1 rounded-xl border border-blue-300 bg-blue-50 px-2 py-3 text-center font-mono text-[11px] text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
            {cell}
          </div>
        ))}
      </div>
    </DiagramFrame>
  ),

  objects: () => (
    <DiagramFrame title="Object key → value map">
      <div className="mx-auto max-w-xs space-y-1">
        {['name → "Alex"', 'age → 30', 'active → true'].map((row) => (
          <div key={row} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-center font-mono text-[11px] text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            {row}
          </div>
        ))}
      </div>
    </DiagramFrame>
  ),

  strings: () => (
    <DiagramFrame title="String as character sequence">
      <div className="flex min-w-[280px] justify-center gap-1">
        {['H', 'i', '!'].map((ch, i) => (
          <div key={ch} className="flex flex-col items-center gap-1">
            <div className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-3 font-mono text-lg font-bold text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
              {ch}
            </div>
            <span className="text-[10px] text-gray-500">{i}</span>
          </div>
        ))}
      </div>
    </DiagramFrame>
  ),

  dom: () => (
    <DiagramFrame title="DOM tree (simplified)">
      <div className="mx-auto flex min-w-[260px] flex-col items-center gap-1 font-mono text-[11px]">
        <Box label="document" color="violet" />
        <Arrow />
        <Box label="html" color="blue" />
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <Arrow />
            <Box label="head" color="gray" />
          </div>
          <div className="flex flex-col items-center">
            <Arrow />
            <Box label="body" color="green" />
          </div>
        </div>
      </div>
    </DiagramFrame>
  ),

  events: () => (
    <DiagramFrame title="Event flow: capture → target → bubble">
      <div className="flex min-w-[300px] flex-col items-center gap-2">
        <Box label="User clicks button" color="amber" />
        <Arrow label="bubbles up" />
        <Box label="button (target)" color="green" />
        <Arrow />
        <Box label="parent → document" color="blue" />
      </div>
    </DiagramFrame>
  ),

  errors: () => (
    <DiagramFrame title="try / catch / finally">
      <div className="flex min-w-[260px] flex-col gap-2">
        <Box label="try { risky code }" color="blue" />
        <Arrow label="on throw" />
        <Box label="catch (err) { handle }" color="amber" />
        <Arrow label="always" />
        <Box label="finally { cleanup }" color="green" />
      </div>
    </DiagramFrame>
  ),

  es6: () => (
    <DiagramFrame title="Modern JS building blocks">
      <div className="grid min-w-[280px] grid-cols-2 gap-2">
        <Box label="let / const" color="blue" />
        <Box label="=> arrows" color="green" />
        <Box label="{ destructuring }" color="amber" />
        <Box label="...spread" color="violet" />
      </div>
    </DiagramFrame>
  ),

  fetch: () => (
    <DiagramFrame title="fetch request flow">
      <div className="flex min-w-[280px] flex-col gap-2">
        <Box label="fetch(url)" color="violet" />
        <Arrow />
        <Box label="Promise → Response" color="blue" />
        <Arrow />
        <Box label=".json() → data" color="green" />
      </div>
    </DiagramFrame>
  ),

  json: () => (
    <DiagramFrame title="JSON ↔ JavaScript">
      <div className="flex min-w-[300px] items-center justify-center gap-3">
        <Box label="JS object" color="green" />
        <span className="text-sm font-bold text-violet-600">⇄</span>
        <Box label="JSON string" color="blue" />
        <span className="text-sm font-bold text-violet-600">⇄</span>
        <Box label="storage / API" color="amber" />
      </div>
    </DiagramFrame>
  ),

  collections: () => (
    <DiagramFrame title="Map / Set vs Array / Object">
      <div className="grid min-w-[300px] grid-cols-2 gap-3">
        <Box label="Map" sub="any key type" color="blue" />
        <Box label="Set" sub="unique values" color="green" />
        <Box label="Array" sub="ordered list" color="amber" />
        <Box label="Object" sub="string/symbol keys" color="violet" />
      </div>
    </DiagramFrame>
  ),

  regex: () => (
    <DiagramFrame title="Pattern matching">
      <div className="mx-auto max-w-sm space-y-2 text-center font-mono text-[11px]">
        <Box label="/pattern/flags" color="violet" />
        <Arrow label=".test(str)" />
        <div className="grid grid-cols-2 gap-2">
          <Box label="true" sub="match found" color="green" />
          <Box label="false" sub="no match" color="gray" />
        </div>
      </div>
    </DiagramFrame>
  ),

  classes: () => (
    <DiagramFrame title="Class → instance">
      <div className="flex min-w-[260px] flex-col items-center gap-2">
        <Box label="class User { … }" color="violet" />
        <Arrow label="new User()" />
        <Box label="instance" sub="own fields + shared methods" color="green" />
      </div>
    </DiagramFrame>
  ),

  modules: () => (
    <DiagramFrame title="ES modules">
      <div className="flex min-w-[300px] items-center justify-center gap-2">
        <Box label="file A" sub="export fn" color="blue" />
        <span className="text-lg text-violet-500">→</span>
        <Box label="file B" sub="import { fn }" color="green" />
      </div>
    </DiagramFrame>
  ),

  functional: () => (
    <DiagramFrame title="Functional pipeline">
      <div className="flex min-w-[320px] flex-wrap items-center justify-center gap-2">
        <Box label="data" color="gray" />
        <span className="text-violet-500">→</span>
        <Box label=".filter()" color="blue" />
        <span className="text-violet-500">→</span>
        <Box label=".map()" color="green" />
        <span className="text-violet-500">→</span>
        <Box label=".reduce()" color="amber" />
      </div>
    </DiagramFrame>
  ),

  performance: () => (
    <DiagramFrame title="Optimize the hot path">
      <div className="flex min-w-[280px] flex-col gap-2">
        <Box label="Measure bottleneck" color="amber" />
        <Arrow />
        <Box label="Batch DOM / debounce events" color="blue" />
        <Arrow />
        <Box label="Lazy load & cache" color="green" />
      </div>
    </DiagramFrame>
  ),

  generic: () => (
    <DiagramFrame title="Learn → Practice → Quiz">
      <div className="flex min-w-[280px] flex-col items-center gap-2">
        <Box label="Read concept" color="blue" />
        <Arrow />
        <Box label="Run examples" color="green" />
        <Arrow />
        <Box label="Take topic quiz" color="violet" />
      </div>
    </DiagramFrame>
  ),
};

export default function TheoryDiagram({ type }) {
  const Renderer = DIAGRAMS[type] || DIAGRAMS.generic;
  return <Renderer />;
}
