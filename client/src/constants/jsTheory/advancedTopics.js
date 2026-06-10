export const ADVANCED_TOPICS = [
  {
    id: 'event-loop',
    title: 'The Event Loop',
    level: 'Advanced',
    summary: 'JavaScript runs sync code on one call stack, then schedules async callbacks through the event loop.',
    explanation:
      'JavaScript has a single call stack for synchronous execution. Long tasks block the page. Timers, network, and DOM events are handled by Web APIs; their callbacks enter task queues. The event loop moves callbacks to the stack when it is empty. Microtasks (promises) run before the next macrotask (setTimeout).',
    diagram: 'event-loop',
    examples: [
      {
        title: 'Sync before async',
        code: `console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");`,
        explanation: 'Output: A, C, then B. setTimeout waits even with 0ms delay.',
      },
      {
        title: 'Microtask priority',
        code: `console.log("1");\nPromise.resolve().then(() => console.log("2"));\nconsole.log("3");`,
        explanation: 'Promise callbacks (microtasks) run before the next macrotask like setTimeout.',
      },
      {
        title: 'Mixed order',
        code: `setTimeout(() => console.log("timeout"), 0);\nPromise.resolve().then(() => console.log("promise"));\nconsole.log("sync");`,
        explanation: 'Order: sync → promise → timeout. Microtasks drain before macrotasks.',
      },
      {
        title: 'Blocking stack',
        code: `const start = Date.now();\nwhile (Date.now() - start < 50) {\n  // busy wait\n}\nconsole.log("done blocking");`,
        explanation: 'Heavy sync loops block UI updates and delayed callbacks until they finish.',
      },
      {
        title: 'Async pattern',
        code: `function later(msg) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(msg), 10);\n  });\n}\nlater("hi").then(console.log);\nconsole.log("now");`,
        explanation: 'Combine promises with timers to model delayed work without blocking the stack.',
      },
    ],
  },
  {
    id: 'prototypes',
    title: 'Prototypes & this',
    level: 'Advanced',
    summary: 'Objects inherit behavior through the prototype chain, and this depends on how a function is called.',
    explanation:
      'Every object has an internal [[Prototype]] link. When you read a property, JavaScript walks the chain until it finds a match or hits null. The this keyword refers to the call-time context — not where the function was written. Classes are syntactic sugar over this prototype model.',
    diagram: 'prototypes',
    examples: [
      {
        title: 'Prototype lookup',
        code: `const animal = { eats: true };\nconst rabbit = { jumps: true };\nObject.setPrototypeOf(rabbit, animal);\nconsole.log(rabbit.eats, rabbit.jumps);`,
        explanation: 'rabbit inherits eats from animal via the prototype chain.',
      },
      {
        title: 'Constructor + prototype',
        code: `function Dog(name) {\n  this.name = name;\n}\nDog.prototype.bark = function () {\n  return this.name + " says woof";\n};\nconst rex = new Dog("Rex");\nconsole.log(rex.bark());`,
        explanation: 'Methods on Dog.prototype are shared by all instances — memory efficient.',
      },
      {
        title: 'Object.create',
        code: `const proto = { greet() { return "Hi from proto"; } };\nconst obj = Object.create(proto);\nconsole.log(obj.greet());\nconsole.log(Object.getPrototypeOf(obj) === proto);`,
        explanation: 'Object.create sets the prototype explicitly without a constructor function.',
      },
      {
        title: 'this in method vs arrow',
        code: `const obj = {\n  name: "App",\n  regular() { return this.name; },\n  arrow: () => this,\n};\nconsole.log(obj.regular());\nconsole.log(obj.arrow() === globalThis || obj.arrow()?.name === undefined);`,
        explanation: 'Regular methods get this from the caller; arrow functions inherit this from the surrounding scope.',
      },
      {
        title: 'call to borrow method',
        code: `function show() {\n  return this.label;\n}\nconst a = { label: "A" };\nconst b = { label: "B" };\nconsole.log(show.call(a), show.call(b));`,
        explanation: 'call(invoke) lets you run a function with a specific this value.',
      },
    ],
  },
  {
    id: 'classes',
    title: 'Classes & OOP',
    level: 'Advanced',
    summary: 'Classes provide a clear syntax for constructors, inheritance, static methods, and encapsulation.',
    explanation:
      'class declares a constructor and methods that live on the prototype. extends sets up subclass inheritance; super calls the parent constructor or methods. Static methods belong to the class itself. Private fields (#name) hide data from outside the class.',
    diagram: 'classes',
    examples: [
      {
        title: 'Basic class',
        code: `class User {\n  constructor(name) {\n    this.name = name;\n  }\n  greet() {\n    return "Hello, " + this.name;\n  }\n}\nconst u = new User("Mina");\nconsole.log(u.greet());`,
        explanation: 'constructor runs on new; methods are shared via the prototype chain under the hood.',
      },
      {
        title: 'Inheritance with extends',
        code: `class Animal {\n  constructor(name) { this.name = name; }\n  speak() { return this.name + " makes a sound"; }\n}\nclass Dog extends Animal {\n  speak() { return this.name + " barks"; }\n}\nconsole.log(new Dog("Rex").speak());`,
        explanation: 'extends links prototypes; overriding methods replaces parent behavior for instances.',
      },
      {
        title: 'super in constructor',
        code: `class Admin extends User {\n  constructor(name, level) {\n    super(name);\n    this.level = level;\n  }\n}\nconst admin = new Admin("Alex", 5);\nconsole.log(admin.name, admin.level);`,
        explanation: 'Subclass must call super() before using this — it runs the parent constructor.',
      },
      {
        title: 'Static methods',
        code: `class MathUtil {\n  static clamp(n, min, max) {\n    return Math.min(max, Math.max(min, n));\n  }\n}\nconsole.log(MathUtil.clamp(150, 0, 100));`,
        explanation: 'Static methods live on the class — call them as ClassName.method(), not on instances.',
      },
      {
        title: 'Private fields',
        code: `class Counter {\n  #count = 0;\n  increment() { this.#count++; }\n  value() { return this.#count; }\n}\nconst c = new Counter();\nc.increment();\nconsole.log(c.value());`,
        explanation: '#count is truly private — only code inside the class body can access it.',
      },
    ],
  },
  {
    id: 'modules',
    title: 'Modules',
    level: 'Advanced',
    summary: 'ES modules split code into files with explicit import and export for maintainable applications.',
    explanation:
      'Each module has its own scope — no global pollution. export shares bindings; import pulls them in. Default exports allow one primary export per file; named exports allow many. Dynamic import() loads modules on demand and returns a Promise.',
    diagram: 'modules',
    examples: [
      {
        title: 'Named exports',
        code: `// math.js\nexport function add(a, b) { return a + b; }\nexport const PI = 3.14;\n\n// app.js\nimport { add, PI } from "./math.js";\nconsole.log(add(2, 3), PI);`,
        explanation: 'Named exports must be imported with matching names or aliased with as.',
      },
      {
        title: 'Default export',
        code: `// logger.js\nexport default function log(msg) {\n  console.log("[LOG]", msg);\n}\n\n// app.js\nimport log from "./logger.js";\nlog("Ready");`,
        explanation: 'Each module can have one default export — import without curly braces.',
      },
      {
        title: 'Re-exporting',
        code: `// index.js — barrel file\nexport { add, PI } from "./math.js";\nexport { default as log } from "./logger.js";`,
        explanation: 'Barrel files re-export from other modules so consumers import from one entry point.',
      },
      {
        title: 'Dynamic import',
        code: `async function loadChart() {\n  const { renderChart } = await import("./chart.js");\n  renderChart();\n}\nloadChart();`,
        explanation: 'import() loads modules at runtime — useful for code splitting and lazy loading.',
      },
      {
        title: 'Import meta',
        code: `// In ES modules:\nconsole.log(import.meta.url); // current module URL`,
        explanation: 'import.meta provides module-specific metadata — the module URL in browsers and Node ESM.',
      },
    ],
  },
  {
    id: 'functional',
    title: 'Functional Programming',
    level: 'Advanced',
    summary: 'Functional style favors pure functions, immutability, and composing small functions into pipelines.',
    explanation:
      'Pure functions return the same output for the same input and avoid side effects — easy to test and reason about. Higher-order functions take or return other functions. Immutability means creating new data instead of mutating existing structures. map, filter, and reduce are the core toolkit.',
    diagram: 'functional',
    examples: [
      {
        title: 'Pure vs impure',
        code: `let total = 0;\nfunction impureAdd(n) { total += n; return total; }\nfunction pureAdd(a, b) { return a + b; }\nconsole.log(pureAdd(2, 3)); // always 5\nconsole.log(impureAdd(2));   // depends on total`,
        explanation: 'Pure functions do not read or write external state — predictable and reusable.',
      },
      {
        title: 'Immutability with spread',
        code: `const todos = [{ id: 1, done: false }];\nconst updated = todos.map((t) =>\n  t.id === 1 ? { ...t, done: true } : t\n);\nconsole.log(todos[0].done);   // false\nconsole.log(updated[0].done); // true`,
        explanation: 'Return new objects/arrays instead of mutating — keeps history and avoids bugs.',
      },
      {
        title: 'Function composition',
        code: `const double = (x) => x * 2;\nconst increment = (x) => x + 1;\nconst compose = (f, g) => (x) => f(g(x));\nconst doubleThenInc = compose(increment, double);\nconsole.log(doubleThenInc(3)); // 7`,
        explanation: 'Compose small functions into pipelines — each step does one thing well.',
      },
      {
        title: 'Higher-order filter',
        code: `function reject(arr, predicate) {\n  return arr.filter((item) => !predicate(item));\n}\nconst nums = [1, 2, 3, 4, 5];\nconsole.log(reject(nums, (n) => n % 2 === 0));`,
        explanation: 'Higher-order functions accept behavior (predicates) as arguments.',
      },
      {
        title: 'Reduce for grouping',
        code: `const people = [\n  { name: "A", dept: "eng" },\n  { name: "B", dept: "eng" },\n  { name: "C", dept: "hr" },\n];\nconst byDept = people.reduce((acc, p) => {\n  (acc[p.dept] ||= []).push(p.name);\n  return acc;\n}, {});\nconsole.log(byDept);`,
        explanation: 'reduce builds any accumulated structure — sums, groups, indexes, and more.',
      },
    ],
  },
  {
    id: 'performance',
    title: 'Performance & Best Practices',
    level: 'Advanced',
    summary: 'Fast JavaScript avoids blocking the main thread, thrashing the DOM, and doing unnecessary work.',
    explanation:
      'The browser main thread handles JS, layout, and paint — blocking it freezes the UI. Batch DOM reads and writes, debounce rapid events, use documentFragment for bulk inserts, and defer non-critical work with requestAnimationFrame or lazy loading.',
    diagram: 'performance',
    examples: [
      {
        title: 'Debouncing input',
        code: `function debounce(fn, wait) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), wait);\n  };\n}\nconst search = debounce((q) => console.log("Search:", q), 300);\nsearch("a");\nsearch("ab");\nsearch("abc"); // only this fires after 300ms pause`,
        explanation: 'Debounce waits for a pause in events — ideal for search boxes and resize handlers.',
      },
      {
        title: 'DocumentFragment batch insert',
        code: `const list = document.querySelector("ul");\nconst frag = document.createDocumentFragment();\nfor (let i = 0; i < 100; i++) {\n  const li = document.createElement("li");\n  li.textContent = "Item " + i;\n  frag.appendChild(li);\n}\nlist.appendChild(frag); // one reflow`,
        explanation: 'Build off-DOM with a fragment, then attach once — fewer layout recalculations.',
      },
      {
        title: 'Avoid layout thrashing',
        code: `const boxes = document.querySelectorAll(".box");\n// Bad: read/write mix in loop causes reflows\n// Good: batch reads, then batch writes\nconst widths = [...boxes].map((el) => el.offsetWidth);\nboxes.forEach((el, i) => {\n  el.style.width = widths[i] + 10 + "px";\n});`,
        explanation: 'Alternate reading geometry and writing styles forces expensive reflows — batch each type.',
      },
      {
        title: 'requestAnimationFrame',
        code: `function animate(el) {\n  let start = null;\n  function step(timestamp) {\n    if (!start) start = timestamp;\n    const progress = Math.min((timestamp - start) / 1000, 1);\n    el.style.opacity = progress;\n    if (progress < 1) requestAnimationFrame(step);\n  }\n  requestAnimationFrame(step);\n}`,
        explanation: 'rAF syncs visual updates with the display refresh — smoother than setInterval for animation.',
      },
      {
        title: 'Lazy loading pattern',
        code: `function lazyLoad(img) {\n  const observer = new IntersectionObserver((entries) => {\n    entries.forEach((entry) => {\n      if (entry.isIntersecting) {\n        entry.target.src = entry.target.dataset.src;\n        observer.unobserve(entry.target);\n      }\n    });\n  });\n  observer.observe(img);\n}`,
        explanation: 'Load images only when they enter the viewport — saves bandwidth and speeds initial load.',
      },
    ],
  },
];
