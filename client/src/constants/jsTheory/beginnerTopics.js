export const BEGINNER_TOPICS = [
  {
    id: 'intro',
    title: 'Introduction to JavaScript',
    level: 'Beginner',
    summary: 'JavaScript is the programming language that makes web pages interactive and runs everywhere from browsers to servers.',
    explanation:
      'JavaScript (JS) was created to add behavior to HTML pages: responding to clicks, updating content, and talking to servers. Today it runs in every major browser and on servers via Node.js, making it one of the most widely used languages in the world. You write JS in .js files or inline scripts, and a JavaScript engine (like V8 in Chrome) executes your code line by line.',
    diagram: 'intro',
    examples: [
      {
        title: 'Hello, console',
        code: `console.log("Hello, JavaScript!");\nconsole.log(2 + 2);`,
        explanation: 'console.log prints values to the developer console — your first tool for seeing what code produces.',
      },
      {
        title: 'Script in HTML',
        code: `// In HTML: <script>alert("Page loaded!");</script>\n// Or link an external file:\n// <script src="app.js"></script>\nconsole.log("External scripts run when loaded");`,
        explanation: 'Browsers execute JS when they encounter a script tag or load an external .js file.',
      },
      {
        title: 'Comments',
        code: `// Single-line comment — ignored by the engine\n/* Multi-line\n   comment block */\nconsole.log("Only this runs");`,
        explanation: 'Comments document your code; the engine skips them entirely during execution.',
      },
      {
        title: 'Statements and semicolons',
        code: `const greeting = "Hi";\nconst name = "Alex";\nconsole.log(greeting + ", " + name + "!");`,
        explanation: 'Each line is typically a statement. Semicolons mark the end, though JS often inserts them automatically.',
      },
      {
        title: 'Running in Node.js',
        code: `// Save as hello.js and run: node hello.js\nconst platform = "Node.js";\nconsole.log("Running on", platform);`,
        explanation: 'The same JavaScript syntax works outside the browser — Node.js lets you build servers, scripts, and CLI tools.',
      },
    ],
  },
  {
    id: 'variables',
    title: 'Variables & Data Types',
    level: 'Beginner',
    summary: 'Variables store values using let, const, and primitive types that describe the kind of data you hold.',
    explanation:
      'Variables are named containers for data. Use const when the binding should not be reassigned, let when it can change, and avoid var in modern code. JavaScript has primitive types (string, number, boolean, null, undefined, symbol, bigint) stored by value, and objects stored by reference.',
    diagram: 'variables',
    examples: [
      {
        title: 'const vs let',
        code: `const PI = 3.14;\nlet score = 0;\nscore = score + 10;\n// PI = 4; // TypeError: Assignment to constant variable`,
        explanation: 'const blocks reassignment; let allows updates. Both are block-scoped.',
      },
      {
        title: 'Primitive types',
        code: `const name = "Ada";\nconst age = 28;\nconst active = true;\nconst empty = null;\nlet pending;\nconsole.log(typeof name);    // "string"\nconsole.log(typeof pending); // "undefined"`,
        explanation: 'Strings hold text, numbers hold numeric values, boolean is true/false, null is intentional empty, undefined means not assigned yet.',
      },
      {
        title: 'Template literals',
        code: `const user = "Sam";\nconst points = 42;\nconst msg = \`Hello \${user}, you have \${points} points.\`;\nconsole.log(msg);`,
        explanation: 'Backticks let you embed expressions inside strings with ${}.',
      },
      {
        title: 'Type coercion',
        code: `console.log("5" + 1);   // "51" (string concat)\nconsole.log("5" - 1);   // 4 (number math)\nconsole.log(Number("9")); // 9`,
        explanation: '+ with a string often concatenates; other operators may convert strings to numbers.',
      },
      {
        title: 'Truthy and falsy',
        code: `const values = [0, "", null, undefined, "hi", 99];\nfor (const v of values) {\n  console.log(v, Boolean(v));\n}`,
        explanation: 'Falsy values: 0, "", null, undefined, NaN, false. Almost everything else is truthy.',
      },
    ],
  },
  {
    id: 'operators',
    title: 'Operators & Expressions',
    level: 'Beginner',
    summary: 'Operators combine and compare values — from arithmetic and logic to assignment and nullish coalescing.',
    explanation:
      'Expressions produce values: 2 + 3 evaluates to 5. Comparison operators (===, !==) check equality; logical operators (&&, ||, !) combine boolean conditions. Modern JS adds ?? (nullish coalescing) and optional chaining (?.) for safer property access.',
    diagram: 'operators',
    examples: [
      {
        title: 'Arithmetic operators',
        code: `const a = 10, b = 3;\nconsole.log(a + b);  // 13\nconsole.log(a % b);  // 1 (remainder)\nconsole.log(a ** b); // 1000 (exponent)`,
        explanation: 'Standard math operators work on numbers; % gives the remainder after division.',
      },
      {
        title: 'Strict vs loose equality',
        code: `console.log(5 == "5");  // true (coerces types)\nconsole.log(5 === "5"); // false (different types)\nconsole.log(null == undefined);  // true\nconsole.log(null === undefined); // false`,
        explanation: '=== compares value and type without coercion — prefer it in almost all cases.',
      },
      {
        title: 'Logical operators',
        code: `const age = 20;\nconst hasId = true;\nconst canEnter = age >= 18 && hasId;\nconst label = canEnter || "denied";\nconsole.log(canEnter, label);`,
        explanation: '&& returns the first falsy value or the last operand; || returns the first truthy value or the last.',
      },
      {
        title: 'Nullish coalescing',
        code: `const input = null;\nconst username = input ?? "guest";\nconst count = 0 ?? 10;\nconsole.log(username); // "guest"\nconsole.log(count);    // 0 (0 is not nullish)`,
        explanation: '?? only falls back when the left side is null or undefined — unlike || which treats 0 and "" as falsy.',
      },
      {
        title: 'Compound assignment',
        code: `let total = 100;\ntotal += 25;  // total = total + 25\ntotal *= 2;   // total = total * 2\nconsole.log(total); // 250`,
        explanation: '+=, -=, *=, and similar operators update a variable in one step.',
      },
    ],
  },
  {
    id: 'control-flow',
    title: 'Control Flow',
    level: 'Beginner',
    summary: 'if, else, switch, and ternary let your program choose different paths based on conditions.',
    explanation:
      'Control flow determines which code runs and when. if/else checks conditions top-down and runs the first matching branch. switch compares a value against cases with strict equality. The ternary operator (condition ? a : b) is a compact inline if/else for simple assignments.',
    diagram: 'control-flow',
    examples: [
      {
        title: 'if / else if / else',
        code: `const score = 85;\nlet grade;\nif (score >= 90) grade = "A";\nelse if (score >= 80) grade = "B";\nelse grade = "C";\nconsole.log(grade);`,
        explanation: 'Conditions are evaluated in order; the first true branch runs and the rest are skipped.',
      },
      {
        title: 'Ternary operator',
        code: `const age = 17;\nconst status = age >= 18 ? "adult" : "minor";\nconsole.log(status);`,
        explanation: 'Ternary is shorthand: condition ? valueIfTrue : valueIfFalse.',
      },
      {
        title: 'switch statement',
        code: `const day = "Mon";\nlet type;\nswitch (day) {\n  case "Sat":\n  case "Sun":\n    type = "weekend";\n    break;\n  default:\n    type = "weekday";\n}\nconsole.log(type);`,
        explanation: 'switch matches with ===. Use break to prevent fall-through to the next case.',
      },
      {
        title: 'Nested conditions',
        code: `const isLoggedIn = true;\nconst isAdmin = false;\nif (isLoggedIn) {\n  if (isAdmin) console.log("Admin panel");\n  else console.log("User dashboard");\n} else {\n  console.log("Please log in");\n}`,
        explanation: 'You can nest if blocks inside other blocks to handle layered logic.',
      },
      {
        title: 'Guard clauses',
        code: `function greet(name) {\n  if (!name) return "Hello, stranger!";\n  return "Hello, " + name + "!";\n}\nconsole.log(greet(""));\nconsole.log(greet("Mina"));`,
        explanation: 'Early return exits a function immediately when a condition fails — keeps logic flat and readable.',
      },
    ],
  },
  {
    id: 'loops',
    title: 'Loops',
    level: 'Beginner',
    summary: 'Loops repeat code — for, while, and for…of iterate over ranges, conditions, and collections.',
    explanation:
      'Loops run a block of code multiple times. for loops use a counter; while loops repeat while a condition is true; for…of walks through iterable values like arrays and strings. Use break to exit early and continue to skip to the next iteration.',
    diagram: 'loops',
    examples: [
      {
        title: 'Classic for loop',
        code: `for (let i = 0; i < 5; i++) {\n  console.log("Count:", i);\n}`,
        explanation: 'The header has init, condition, and increment — runs while condition is true.',
      },
      {
        title: 'for…of over an array',
        code: `const colors = ["red", "green", "blue"];\nfor (const color of colors) {\n  console.log(color);\n}`,
        explanation: 'for…of gives you each value directly — cleaner than manual indexing.',
      },
      {
        title: 'while loop',
        code: `let n = 3;\nwhile (n > 0) {\n  console.log(n);\n  n--;\n}\nconsole.log("Done!");`,
        explanation: 'while checks the condition before each iteration — useful when the count is unknown upfront.',
      },
      {
        title: 'break and continue',
        code: `for (let i = 0; i < 10; i++) {\n  if (i === 3) continue; // skip 3\n  if (i === 7) break;    // stop at 7\n  console.log(i);\n}`,
        explanation: 'continue skips the rest of the current iteration; break exits the loop entirely.',
      },
      {
        title: 'Looping object keys',
        code: `const user = { name: "Ravi", role: "dev", yrs: 3 };\nfor (const key of Object.keys(user)) {\n  console.log(key + ":", user[key]);\n}`,
        explanation: 'Object.keys returns an array of property names you can iterate with for…of.',
      },
    ],
  },
  {
    id: 'functions',
    title: 'Functions',
    level: 'Beginner',
    summary: 'Functions package reusable logic — declarations, expressions, and arrow functions with parameters and return values.',
    explanation:
      'Functions are reusable blocks of code you call by name. They receive inputs (parameters), run steps, and optionally return a result. Arrow functions are shorter and do not have their own this binding, which matters later for objects and events.',
    diagram: 'functions',
    examples: [
      {
        title: 'Function declaration',
        code: `function greet(name) {\n  return "Hello, " + name;\n}\nconsole.log(greet("Mina"));`,
        explanation: 'Declarations are hoisted — you can call them before the line they appear on.',
      },
      {
        title: 'Arrow function',
        code: `const double = (n) => n * 2;\nconst sum = (a, b) => {\n  const total = a + b;\n  return total;\n};\nconsole.log(double(4), sum(3, 5));`,
        explanation: 'Arrow syntax is compact. Use a block { } when you need multiple statements.',
      },
      {
        title: 'Default parameters',
        code: `function createUser(name, role = "student") {\n  return { name, role };\n}\nconsole.log(createUser("Alex"));\nconsole.log(createUser("Alex", "admin"));`,
        explanation: 'Default values apply when the argument is undefined.',
      },
      {
        title: 'Return early',
        code: `function isAdult(age) {\n  if (age < 18) return false;\n  return true;\n}\nconsole.log(isAdult(16), isAdult(20));`,
        explanation: 'return stops the function immediately and sends a value back to the caller.',
      },
      {
        title: 'Functions as values',
        code: `function apply(fn, value) {\n  return fn(value);\n}\nconst square = (x) => x * x;\nconsole.log(apply(square, 6));`,
        explanation: 'Functions are first-class — you can pass them to other functions like any value.',
      },
    ],
  },
  {
    id: 'arrays',
    title: 'Arrays',
    level: 'Beginner',
    summary: 'Arrays store ordered lists of values and provide powerful methods to transform, filter, and search them.',
    explanation:
      'Arrays are zero-indexed lists: fruits[0] is the first item. They are reference types, so assigning one array variable to another shares the same underlying data unless you copy. Methods like push, pop, map, filter, and find let you work with collections without manual loops.',
    diagram: 'arrays',
    examples: [
      {
        title: 'Array basics',
        code: `const fruits = ["apple", "banana", "cherry"];\nconsole.log(fruits[0]);\nfruits.push("date");\nconsole.log(fruits.length);`,
        explanation: 'Indexes start at 0. push adds to the end; length tells you how many items exist.',
      },
      {
        title: 'map and filter',
        code: `const nums = [1, 2, 3, 4];\nconst doubled = nums.map((n) => n * 2);\nconst evens = nums.filter((n) => n % 2 === 0);\nconsole.log(doubled, evens);`,
        explanation: 'map transforms each item into a new array; filter keeps items that pass a test.',
      },
      {
        title: 'find and includes',
        code: `const users = [{ id: 1, name: "A" }, { id: 2, name: "B" }];\nconst found = users.find((u) => u.id === 2);\nconsole.log(found.name);\nconsole.log([1, 2, 3].includes(2));`,
        explanation: 'find returns the first matching element; includes checks if a value exists.',
      },
      {
        title: 'Spread and slice copy',
        code: `const original = [1, 2, 3];\nconst copy = [...original];\ncopy.push(4);\nconsole.log(original); // [1, 2, 3]\nconsole.log(copy);     // [1, 2, 3, 4]`,
        explanation: 'Spread creates a shallow copy so mutations do not affect the original array.',
      },
      {
        title: 'reduce to a single value',
        code: `const prices = [10, 20, 15];\nconst total = prices.reduce((sum, price) => sum + price, 0);\nconsole.log(total); // 45`,
        explanation: 'reduce folds an array into one accumulated result — sums, max values, grouping, and more.',
      },
    ],
  },
  {
    id: 'objects',
    title: 'Objects',
    level: 'Beginner',
    summary: 'Objects group related data as key-value pairs with methods, destructuring, and spread for copying.',
    explanation:
      'Objects store named properties: user.name, user["role"]. Methods are functions stored as properties. Objects are reference types — copying requires spread or Object.assign for a shallow clone. Destructuring unpacks properties into variables quickly.',
    diagram: 'objects',
    examples: [
      {
        title: 'Object literal',
        code: `const user = {\n  name: "Ravi",\n  role: "learner",\n  greet() {\n    return \`Hi, I'm \${this.name}\`;\n  },\n};\nconsole.log(user.greet());`,
        explanation: 'Objects group related fields. Methods are functions stored as properties.',
      },
      {
        title: 'Bracket vs dot access',
        code: `const config = { "api-url": "https://api.example.com", retries: 3 };\nconst key = "retries";\nconsole.log(config["api-url"]);\nconsole.log(config[key]);`,
        explanation: 'Use brackets when the key is dynamic or contains special characters; dot notation for simple identifiers.',
      },
      {
        title: 'Destructuring',
        code: `const point = { x: 3, y: 7 };\nconst { x, y } = point;\nconst { x: horizontal } = point;\nconsole.log(x, y, horizontal);`,
        explanation: 'Destructuring unpacks object properties into separate variables; rename with { key: alias }.',
      },
      {
        title: 'Spread copy',
        code: `const base = { a: 1, b: 2 };\nconst extended = { ...base, b: 99, c: 3 };\nconsole.log(base);     // { a: 1, b: 2 }\nconsole.log(extended); // { a: 1, b: 99, c: 3 }`,
        explanation: 'Spread copies enumerable own properties into a new object without mutating the original.',
      },
      {
        title: 'Optional chaining',
        code: `const profile = { user: { name: "Sam" } };\nconsole.log(profile.user?.name);\nconsole.log(profile.address?.city ?? "unknown");`,
        explanation: '?. short-circuits if the left side is null or undefined — avoids "Cannot read property" errors.',
      },
    ],
  },
  {
    id: 'strings',
    title: 'Strings',
    level: 'Beginner',
    summary: 'Strings represent text — create them with quotes, interpolate with templates, and transform with built-in methods.',
    explanation:
      'Strings are immutable sequences of characters. Single quotes, double quotes, and backticks all create strings; only backticks support ${} interpolation. Methods like trim, split, slice, and toLowerCase return new strings without changing the original.',
    diagram: 'strings',
    examples: [
      {
        title: 'Creating strings',
        code: `const a = "double quotes";\nconst b = 'single quotes';\nconst c = \`template \${a}\`;\nconsole.log(c);`,
        explanation: 'All three forms create strings; backticks enable embedded expressions.',
      },
      {
        title: 'Length and indexing',
        code: `const word = "hello";\nconsole.log(word.length);     // 5\nconsole.log(word[0]);         // "h"\nconsole.log(word.at(-1));     // "o" (last char)`,
        explanation: 'length counts characters; bracket notation and at() access individual positions.',
      },
      {
        title: 'trim and case changes',
        code: `const raw = "  Hello World  ";\nconsole.log(raw.trim());\nconsole.log(raw.toLowerCase());\nconsole.log(raw.toUpperCase());`,
        explanation: 'trim removes leading/trailing whitespace; case methods return new strings.',
      },
      {
        title: 'split and join',
        code: `const csv = "apple,banana,cherry";\nconst items = csv.split(",");\nconsole.log(items);\nconsole.log(items.join(" | "));`,
        explanation: 'split breaks a string into an array; join combines an array back into a string.',
      },
      {
        title: 'Search and replace',
        code: `const text = "I love JS. JS is fun.";\nconsole.log(text.includes("love"));       // true\nconsole.log(text.indexOf("JS"));          // 7\nconsole.log(text.replace("JS", "JavaScript"));`,
        explanation: 'includes checks presence; indexOf finds position; replace swaps the first match.',
      },
    ],
  },
  {
    id: 'closures',
    title: 'Scope & Closures',
    level: 'Beginner',
    summary: 'Scope controls where variables are visible, and closures let inner functions remember outer variables.',
    explanation:
      'JavaScript uses lexical scope: inner functions can read variables from outer scopes where they were written. A closure forms when an inner function keeps access to those variables even after the outer function has finished running — powering factories, private data, and callbacks.',
    diagram: 'closures',
    examples: [
      {
        title: 'Block scope',
        code: `if (true) {\n  let secret = "inside block";\n  console.log(secret);\n}\n// console.log(secret); // ReferenceError`,
        explanation: 'let and const exist only inside the { } block where they are declared.',
      },
      {
        title: 'Basic closure',
        code: `function makeCounter() {\n  let count = 0;\n  return function () {\n    count += 1;\n    return count;\n  };\n}\nconst next = makeCounter();\nconsole.log(next(), next(), next());`,
        explanation: 'The inner function "closes over" count, so it persists between calls.',
      },
      {
        title: 'Factory function',
        code: `function multiplier(factor) {\n  return (n) => n * factor;\n}\nconst triple = multiplier(3);\nconsole.log(triple(5));`,
        explanation: 'Closures let you create customized functions from a shared template.',
      },
      {
        title: 'Loop + closure fix',
        code: `const fns = [];\nfor (let i = 0; i < 3; i++) {\n  fns.push(() => i);\n}\nconsole.log(fns[0](), fns[1](), fns[2]());`,
        explanation: 'Using let creates a new i per iteration, so each arrow function captures the correct value.',
      },
      {
        title: 'Private-like data',
        code: `function bankAccount(start) {\n  let balance = start;\n  return {\n    deposit(amount) { balance += amount; },\n    getBalance() { return balance; },\n  };\n}\nconst acct = bankAccount(100);\nacct.deposit(50);\nconsole.log(acct.getBalance());`,
        explanation: 'balance is not exported directly — only methods in the returned object can touch it.',
      },
    ],
  },
];
