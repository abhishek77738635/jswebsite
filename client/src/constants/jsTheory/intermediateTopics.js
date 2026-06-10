export const INTERMEDIATE_TOPICS = [
  {
    id: 'dom',
    title: 'DOM Manipulation',
    level: 'Intermediate',
    summary: 'The DOM is the live tree of HTML elements that JavaScript can select, change, and create at runtime.',
    explanation:
      'When a browser loads a page, it builds the Document Object Model — a tree of nodes representing every element. JavaScript can query nodes with querySelector, update text and attributes, add or remove classes, and create new elements to attach to the page. Changes to the DOM are immediately reflected in what users see.',
    diagram: 'dom',
    examples: [
      {
        title: 'Selecting elements',
        code: `// HTML: <h1 id="title">Hello</h1>\nconst heading = document.querySelector("#title");\nconst firstBtn = document.querySelector("button");\nconsole.log(heading.textContent);`,
        explanation: 'querySelector returns the first match for a CSS selector; querySelectorAll returns all matches.',
      },
      {
        title: 'Updating content',
        code: `const msg = document.querySelector("#msg");\nmsg.textContent = "Plain text — safe from HTML injection";\nmsg.innerHTML = "<strong>Bold</strong> HTML";`,
        explanation: 'textContent sets plain text; innerHTML parses HTML tags — use textContent for user input.',
      },
      {
        title: 'Creating and appending nodes',
        code: `const list = document.querySelector("ul");\nconst item = document.createElement("li");\nitem.textContent = "New item";\nlist.appendChild(item);`,
        explanation: 'createElement builds a node in memory; appendChild attaches it to the DOM tree.',
      },
      {
        title: 'ClassList toggling',
        code: `const panel = document.querySelector(".panel");\npanel.classList.add("open");\npanel.classList.remove("hidden");\npanel.classList.toggle("active");`,
        explanation: 'classList manages individual CSS classes without replacing the entire className string.',
      },
      {
        title: 'Attributes and data',
        code: `const link = document.querySelector("a");\nlink.setAttribute("href", "https://example.com");\nlink.dataset.userId = "42";\nconsole.log(link.dataset.userId);`,
        explanation: 'setAttribute sets HTML attributes; data-* attributes are accessed via element.dataset.',
      },
    ],
  },
  {
    id: 'events',
    title: 'Events',
    level: 'Intermediate',
    summary: 'Events let your code respond to user actions like clicks, keyboard input, and form submissions.',
    explanation:
      'Browsers fire events when something happens: a click, key press, or page load. You register listeners with addEventListener on a target element. Events bubble from the target up through ancestors, and you can stop propagation or prevent default browser behavior when needed.',
    diagram: 'events',
    examples: [
      {
        title: 'Click listener',
        code: `const btn = document.querySelector("#save");\nbtn.addEventListener("click", () => {\n  console.log("Saved!");\n});`,
        explanation: 'addEventListener attaches a handler that runs each time the event fires on that element.',
      },
      {
        title: 'Event object',
        code: `document.addEventListener("click", (event) => {\n  console.log("Target:", event.target.tagName);\n  console.log("Type:", event.type);\n});`,
        explanation: 'The event object carries details: target element, type, coordinates, and modifier keys.',
      },
      {
        title: 'preventDefault',
        code: `const form = document.querySelector("form");\nform.addEventListener("submit", (e) => {\n  e.preventDefault();\n  console.log("Handle submit in JS instead");\n});`,
        explanation: 'preventDefault stops the browser default — like navigating away on link click or form submit.',
      },
      {
        title: 'Event delegation',
        code: `const list = document.querySelector("#list");\nlist.addEventListener("click", (e) => {\n  if (e.target.matches("li")) {\n    console.log("Clicked item:", e.target.textContent);\n  }\n});`,
        explanation: 'Listen on a parent and check event.target — efficient for dynamic lists of children.',
      },
      {
        title: 'Keyboard events',
        code: `document.addEventListener("keydown", (e) => {\n  if (e.key === "Enter") console.log("Enter pressed");\n  if (e.key === "Escape") console.log("Escape pressed");\n});`,
        explanation: 'keydown and keyup fire for keyboard input; e.key gives a readable key name.',
      },
    ],
  },
  {
    id: 'errors',
    title: 'Error Handling',
    level: 'Intermediate',
    summary: 'try/catch/finally and throw let you recover from failures instead of crashing silently.',
    explanation:
      'Runtime errors throw exceptions that interrupt normal flow. Wrap risky code in try/catch to handle errors gracefully. finally always runs for cleanup. Use throw to signal your own error conditions with meaningful messages.',
    diagram: 'errors',
    examples: [
      {
        title: 'Basic try/catch',
        code: `try {\n  const result = JSON.parse("{ invalid json }");\n  console.log(result);\n} catch (err) {\n  console.log("Parse failed:", err.message);\n}`,
        explanation: 'catch receives the error when code in try throws — parse errors, type errors, custom throws.',
      },
      {
        title: 'finally block',
        code: `function load() {\n  try {\n    console.log("Loading…");\n    throw new Error("network");\n  } catch (e) {\n    console.log("Caught:", e.message);\n  } finally {\n    console.log("Cleanup always runs");\n  }\n}\nload();`,
        explanation: 'finally executes whether try succeeded or catch handled an error — ideal for closing resources.',
      },
      {
        title: 'Throwing custom errors',
        code: `function withdraw(balance, amount) {\n  if (amount > balance) {\n    throw new Error("Insufficient funds");\n  }\n  return balance - amount;\n}\ntry {\n  withdraw(50, 100);\n} catch (e) {\n  console.log(e.message);\n}`,
        explanation: 'throw creates an exception with your message — callers can catch and respond appropriately.',
      },
      {
        title: 'Error types',
        code: `try {\n  null.foo;\n} catch (e) {\n  console.log(e instanceof TypeError); // true\n  console.log(e.name);                 // "TypeError"\n}`,
        explanation: 'Built-in error types (TypeError, ReferenceError, SyntaxError) help you identify what went wrong.',
      },
      {
        title: 'Async error handling',
        code: `async function fetchData() {\n  try {\n    const res = await fetch("/api/missing");\n    if (!res.ok) throw new Error("HTTP " + res.status);\n    return await res.json();\n  } catch (err) {\n    return { error: err.message };\n  }\n}\nfetchData().then(console.log);`,
        explanation: 'try/catch works with await inside async functions — same mental model as sync code.',
      },
    ],
  },
  {
    id: 'es6',
    title: 'ES6+ Modern Syntax',
    level: 'Intermediate',
    summary: 'ES6 and later added arrow functions, destructuring, spread, modules, and shorthand that modern JS relies on.',
    explanation:
      'ECMAScript 2015 (ES6) modernized JavaScript with let/const, classes, template literals, and more. Later versions added optional chaining, nullish coalescing, and top-level await. These features make code shorter, safer, and easier to read.',
    diagram: 'es6',
    examples: [
      {
        title: 'Destructuring arrays and objects',
        code: `const [first, second] = ["a", "b", "c"];\nconst { name, age = 18 } = { name: "Lee" };\nconsole.log(first, name, age);`,
        explanation: 'Destructuring unpacks arrays and objects into variables with optional defaults.',
      },
      {
        title: 'Spread in arrays and objects',
        code: `const nums = [1, 2];\nconst more = [...nums, 3, 4];\nconst user = { name: "A" };\nconst profile = { ...user, role: "admin" };\nconsole.log(more, profile);`,
        explanation: 'Spread copies elements or properties into new collections without mutation.',
      },
      {
        title: 'Shorthand properties',
        code: `const name = "Kim";\nconst score = 99;\nconst record = { name, score };\nconsole.log(record);`,
        explanation: 'When property name matches variable name, write { name } instead of { name: name }.',
      },
      {
        title: 'for…of and for…in',
        code: `const tags = ["js", "web"];\nfor (const tag of tags) console.log(tag);\nconst obj = { a: 1, b: 2 };\nfor (const key in obj) console.log(key, obj[key]);`,
        explanation: 'for…of iterates values of iterables; for…in walks enumerable keys of objects.',
      },
      {
        title: 'Optional chaining and nullish coalescing',
        code: `const settings = { theme: { color: "dark" } };\nconst color = settings.theme?.color ?? "light";\nconsole.log(color);`,
        explanation: '?. safely accesses nested properties; ?? provides defaults only for null/undefined.',
      },
    ],
  },
  {
    id: 'promises',
    title: 'Promises & Async',
    level: 'Intermediate',
    summary: 'Promises represent work that finishes later — the foundation for fetch, timers, and async/await.',
    explanation:
      'A Promise represents a future result: pending, fulfilled (success), or rejected (error). Chain .then and .catch to handle outcomes. async/await is syntactic sugar on top of promises — it reads like synchronous code but still runs asynchronously.',
    diagram: 'promises',
    examples: [
      {
        title: 'Creating a Promise',
        code: `const done = new Promise((resolve) => {\n  setTimeout(() => resolve("finished"), 100);\n});\ndone.then((msg) => console.log(msg));`,
        explanation: 'resolve() marks success; the .then handler runs when the promise fulfills.',
      },
      {
        title: 'Handling errors',
        code: `Promise.reject(new Error("fail"))\n  .catch((err) => console.log(err.message));`,
        explanation: '.catch runs when a promise is rejected — always handle failures in real apps.',
      },
      {
        title: 'Promise.all',
        code: `const p1 = Promise.resolve(1);\nconst p2 = Promise.resolve(2);\nPromise.all([p1, p2]).then(([a, b]) => {\n  console.log(a + b);\n});`,
        explanation: 'Promise.all waits for every promise and returns an array of results in order.',
      },
      {
        title: 'async / await',
        code: `async function load() {\n  const value = await Promise.resolve(42);\n  return value * 2;\n}\nload().then(console.log);`,
        explanation: 'await pauses inside an async function until the promise settles, then continues.',
      },
      {
        title: 'try / catch with async',
        code: `async function safeLoad() {\n  try {\n    const data = await Promise.reject("network");\n    return data;\n  } catch (err) {\n    return "fallback";\n  }\n}\nsafeLoad().then(console.log);`,
        explanation: 'try/catch around await looks like normal error handling but works with async code.',
      },
    ],
  },
  {
    id: 'fetch',
    title: 'Fetch & APIs',
    level: 'Intermediate',
    summary: 'fetch sends HTTP requests to servers and returns promises you await for JSON, text, or other data.',
    explanation:
      'The fetch API replaces older XMLHttpRequest for network calls. It returns a Promise that resolves to a Response object with status, headers, and body. Check response.ok before parsing; use response.json() for JSON payloads.',
    diagram: 'fetch',
    examples: [
      {
        title: 'GET request',
        code: `async function getUsers() {\n  const res = await fetch("https://jsonplaceholder.typicode.com/users");\n  const users = await res.json();\n  console.log(users.length, users[0].name);\n}\ngetUsers();`,
        explanation: 'fetch returns a Response; call .json() to parse the body asynchronously.',
      },
      {
        title: 'Checking response status',
        code: `async function load() {\n  const res = await fetch("/api/data");\n  if (!res.ok) {\n    throw new Error("HTTP " + res.status);\n  }\n  return res.json();\n}`,
        explanation: 'fetch does not reject on 404 or 500 — you must check res.ok or res.status yourself.',
      },
      {
        title: 'POST with JSON body',
        code: `async function createPost(title) {\n  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ title, userId: 1 }),\n  });\n  return res.json();\n}\ncreatePost("Hello").then(console.log);`,
        explanation: 'POST requests send a method, headers, and stringified JSON in the body option.',
      },
      {
        title: 'Reading headers',
        code: `async function checkType() {\n  const res = await fetch("/api/data");\n  const type = res.headers.get("Content-Type");\n  console.log(type);\n}`,
        explanation: 'response.headers is a Headers object — use .get(name) to read individual values.',
      },
      {
        title: 'Abort with timeout',
        code: `async function fetchWithTimeout(url, ms = 5000) {\n  const controller = new AbortController();\n  const id = setTimeout(() => controller.abort(), ms);\n  try {\n    const res = await fetch(url, { signal: controller.signal });\n    return res.json();\n  } finally {\n    clearTimeout(id);\n  }\n}`,
        explanation: 'AbortController cancels fetch if it takes too long — prevents hanging requests.',
      },
    ],
  },
  {
    id: 'json',
    title: 'JSON & Web Storage',
    level: 'Intermediate',
    summary: 'JSON serializes data for APIs and storage; localStorage and sessionStorage persist strings in the browser.',
    explanation:
      'JSON (JavaScript Object Notation) is a text format for structured data. JSON.stringify converts JS values to JSON strings; JSON.parse converts back. Browsers offer localStorage (persistent) and sessionStorage (tab-scoped) for key-value string storage.',
    diagram: 'json',
    examples: [
      {
        title: 'JSON.stringify and parse',
        code: `const user = { name: "Ada", scores: [90, 95] };\nconst json = JSON.stringify(user);\nconsole.log(json);\nconsole.log(JSON.parse(json).name);`,
        explanation: 'stringify produces a portable string; parse reconstructs a JavaScript object.',
      },
      {
        title: 'Pretty-print JSON',
        code: `const data = { a: 1, b: { c: 2 } };\nconsole.log(JSON.stringify(data, null, 2));`,
        explanation: 'The third argument (2) adds indentation for readable debug output.',
      },
      {
        title: 'localStorage basics',
        code: `localStorage.setItem("theme", "dark");\nconsole.log(localStorage.getItem("theme"));\nlocalStorage.removeItem("theme");`,
        explanation: 'localStorage persists across browser sessions — values must be strings.',
      },
      {
        title: 'Storing objects',
        code: `const prefs = { fontSize: 16, compact: true };\nlocalStorage.setItem("prefs", JSON.stringify(prefs));\nconst saved = JSON.parse(localStorage.getItem("prefs") || "{}");\nconsole.log(saved.fontSize);`,
        explanation: 'Stringify objects before saving; parse when reading — guard against null with a default.',
      },
      {
        title: 'sessionStorage',
        code: `sessionStorage.setItem("tabId", "abc123");\nconsole.log(sessionStorage.getItem("tabId"));`,
        explanation: 'sessionStorage works like localStorage but clears when the tab or browser session ends.',
      },
    ],
  },
  {
    id: 'collections',
    title: 'Map, Set & WeakMap',
    level: 'Intermediate',
    summary: 'Map and Set are specialized collections — Map for any-type keys, Set for unique values.',
    explanation:
      'Map stores key-value pairs where keys can be any type, not just strings. Set holds unique values with fast membership checks. WeakMap and WeakSet hold object keys weakly so garbage collection can reclaim unused objects — useful for caches tied to DOM nodes.',
    diagram: 'collections',
    examples: [
      {
        title: 'Map basics',
        code: `const scores = new Map();\nscores.set("Alice", 95);\nscores.set("Bob", 88);\nconsole.log(scores.get("Alice"));\nconsole.log(scores.size);`,
        explanation: 'Map preserves insertion order and accepts objects, functions, or primitives as keys.',
      },
      {
        title: 'Set for uniqueness',
        code: `const tags = new Set(["js", "web", "js", "api"]);\nconsole.log(tags.size);        // 3\nconsole.log(tags.has("web"));  // true\ntags.add("node");`,
        explanation: 'Set automatically deduplicates — great for unique IDs, tags, or visited URLs.',
      },
      {
        title: 'Iterating Map and Set',
        code: `const map = new Map([["a", 1], ["b", 2]]);\nfor (const [key, val] of map) {\n  console.log(key, val);\n}\nconst set = new Set([1, 2, 3]);\nconsole.log([...set]);`,
        explanation: 'Both are iterable — use for…of or spread to convert Set to an array.',
      },
      {
        title: 'Map vs plain object',
        code: `const objKey = { id: 1 };\nconst map = new Map();\nmap.set(objKey, "metadata");\nconsole.log(map.get(objKey));`,
        explanation: 'Objects coerce keys to strings; Map uses reference equality for object keys.',
      },
      {
        title: 'WeakMap for private metadata',
        code: `const privateData = new WeakMap();\nfunction attachSecret(obj, secret) {\n  privateData.set(obj, secret);\n}\nfunction readSecret(obj) {\n  return privateData.get(obj);\n}\nconst item = {};\nattachSecret(item, "token");\nconsole.log(readSecret(item));`,
        explanation: 'WeakMap keys must be objects and do not prevent garbage collection when the object is dropped.',
      },
    ],
  },
  {
    id: 'regex',
    title: 'Regular Expressions',
    level: 'Intermediate',
    summary: 'Regular expressions match patterns in text — emails, phone numbers, validation, and search-and-replace.',
    explanation:
      'A RegExp defines a pattern: /pattern/flags. Common flags: i (case-insensitive), g (global, all matches), m (multiline). Methods test(), exec(), and string methods match(), replace(), and split() use regex for powerful text processing.',
    diagram: 'regex',
    examples: [
      {
        title: 'Creating and testing',
        code: `const pattern = /^hello/i;\nconsole.log(pattern.test("Hello world")); // true\nconsole.log(pattern.test("goodbye"));     // false`,
        explanation: '^ anchors start; i ignores case; test() returns true or false.',
      },
      {
        title: 'Extracting with match',
        code: `const text = "Order #1234 shipped";\nconst match = text.match(/#(\\d+)/);\nconsole.log(match[0]);  // "#1234"\nconsole.log(match[1]);  // "1234" (capture group)`,
        explanation: 'Parentheses create capture groups; match[1] is the first captured substring.',
      },
      {
        title: 'Replace with regex',
        code: `const phone = "555-123-4567";\nconst digits = phone.replace(/\\D/g, "");\nconsole.log(digits); // "5551234567"`,
        explanation: '\\D matches non-digits; g flag replaces all occurrences, not just the first.',
      },
      {
        title: 'Character classes',
        code: `const email = "user@example.com";\nconst valid = /^[\\w.-]+@[\\w.-]+\\.\\w+$/.test(email);\nconsole.log(valid);`,
        explanation: '\\w is word characters; + means one or more; $ anchors the end.',
      },
      {
        title: 'split on whitespace',
        code: `const sentence = "  Hello   world  from   JS  ";\nconst words = sentence.trim().split(/\\s+/);\nconsole.log(words);`,
        explanation: '\\s+ splits on one or more whitespace characters — handles irregular spacing.',
      },
    ],
  },
];
