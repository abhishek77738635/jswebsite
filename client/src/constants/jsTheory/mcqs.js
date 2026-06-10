/** Shared MCQ bank keyed by topic id — 4 questions per topic */
export const TOPIC_MCQS = {
  intro: [
    { question: 'Where does JavaScript mainly run in web apps?', options: ['Only on the server', 'In the browser and on servers (Node.js)', 'Only in databases', 'Only in CSS files'], correctIndex: 1, explanation: 'JS runs in browsers and on servers via runtimes like Node.js.' },
    { question: 'JavaScript was created to make web pages…', options: ['Print faster', 'Interactive and dynamic', 'Use only HTML tables', 'Replace CSS'], correctIndex: 1, explanation: 'JS adds interactivity: clicks, forms, live updates, and API calls.' },
    { question: 'A .js file is…', options: ['A stylesheet', 'A script with JavaScript code', 'An image format', 'A database'], correctIndex: 1, explanation: 'Scripts hold JS logic executed by the JavaScript engine.' },
    { question: 'console.log() is used to…', options: ['Style elements', 'Output debug info', 'Compile TypeScript', 'Delete variables'], correctIndex: 1, explanation: 'console.log prints values to the developer console.' },
  ],
  variables: [
    { question: 'Which keyword prevents reassignment?', options: ['var', 'let', 'const', 'static'], correctIndex: 2, explanation: 'const bindings cannot be reassigned after initialization.' },
    { question: 'typeof null returns…', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctIndex: 2, explanation: 'This is a long-standing JS quirk — typeof null is "object".' },
    { question: 'Which value is falsy?', options: ['"0"', '[]', '0', '[0]'], correctIndex: 2, explanation: 'The number 0 is falsy; non-empty strings and arrays are truthy.' },
    { question: 'let and const are…', options: ['Function-scoped', 'Block-scoped', 'Global-only', 'Hoisted like var'], correctIndex: 1, explanation: 'let/const exist within the nearest { } block.' },
  ],
  operators: [
    { question: '"5" + 2 evaluates to…', options: ['7', '"52"', 'NaN', 'true'], correctIndex: 1, explanation: '+ with a string triggers concatenation.' },
    { question: 'Strict equality operator is…', options: ['==', '===', '!=', '='], correctIndex: 1, explanation: '=== compares value and type without coercion.' },
    { question: '!!"hello" equals…', options: ['false', 'true', '"hello"', 'undefined'], correctIndex: 1, explanation: 'Double negation converts truthy values to boolean true.' },
    { question: 'null ?? "guest" returns…', options: ['null', '"guest"', 'undefined', 'false'], correctIndex: 1, explanation: '?? returns the right side when the left is null or undefined.' },
  ],
  'control-flow': [
    { question: 'else if runs when…', options: ['All branches run', 'The prior if/else if was false and its condition is true', 'Always after else', 'Only in loops'], correctIndex: 1, explanation: 'Conditions are checked top-down; first match wins.' },
    { question: 'switch compares using…', options: ['===', '==', 'Object.is only', 'Alphabetical order'], correctIndex: 0, explanation: 'switch uses strict equality (===) for case matching.' },
    { question: 'Ternary syntax is…', options: ['if ? then : else', 'condition ? a : b', '? condition : a', 'cond :: a :: b'], correctIndex: 1, explanation: 'condition ? valueIfTrue : valueIfFalse' },
    { question: 'break inside switch…', options: ['Restarts the switch', 'Exits the switch block', 'Skips to default only', 'Throws an error'], correctIndex: 1, explanation: 'break prevents fall-through to the next case.' },
  ],
  loops: [
    { question: 'for (let i = 0; …) creates i…', options: ['Globally', 'Per iteration in block scope', 'Only once globally with var', 'Outside the loop always'], correctIndex: 1, explanation: 'let in for-loop headers is block-scoped per iteration.' },
    { question: 'for…of is best for…', options: ['Object keys', 'Iterable values (arrays, strings)', 'Infinite loops only', 'JSON files'], correctIndex: 1, explanation: 'for…of iterates values of iterables.' },
    { question: 'while checks condition…', options: ['After each body run only', 'Before each body run', 'Never', 'Only once'], correctIndex: 1, explanation: 'while evaluates the condition before running the body.' },
    { question: 'continue means…', options: ['Exit loop entirely', 'Skip to next iteration', 'Pause the program', 'Restart the browser'], correctIndex: 1, explanation: 'continue jumps to the next loop iteration.' },
  ],
  functions: [
    { question: 'Arrow functions lack their own…', options: ['return', 'this binding', 'parameters', 'name always'], correctIndex: 1, explanation: 'Arrows inherit this from the enclosing scope.' },
    { question: 'A function with no return gives…', options: ['0', 'undefined', 'null', 'Error'], correctIndex: 1, explanation: 'Functions without return implicitly return undefined.' },
    { question: 'Default parameters apply when arg is…', options: ['null only', 'undefined', '0', 'false'], correctIndex: 1, explanation: 'Defaults trigger when the argument is undefined.' },
    { question: 'Functions are…', options: ['Second-class', 'First-class values', 'Not callable', 'Only in classes'], correctIndex: 1, explanation: 'You can pass functions as arguments and return them.' },
  ],
  arrays: [
    { question: 'First array index is…', options: ['1', '0', '-1', 'undefined'], correctIndex: 1, explanation: 'JavaScript arrays are zero-indexed.' },
    { question: 'map() returns…', options: ['A new transformed array', 'The same array mutated', 'A number', 'undefined always'], correctIndex: 0, explanation: 'map produces a new array with transformed elements.' },
    { question: 'pop() removes from…', options: ['The start', 'The end', 'The middle only', 'Both ends'], correctIndex: 1, explanation: 'pop removes and returns the last element.' },
    { question: 'includes(3) checks…', options: ['Index of 3', 'Whether 3 is in the array', 'Array length', 'Sort order'], correctIndex: 1, explanation: 'includes returns true if the value exists.' },
  ],
  objects: [
    { question: 'Object keys are…', options: ['Always numbers', 'Strings or Symbols', 'Only booleans', 'Only arrays'], correctIndex: 1, explanation: 'Keys are strings or symbols (numbers coerce to strings).' },
    { question: 'Spread on objects…', options: ['Deep clones nested data always', 'Shallow-copies enumerable own properties', 'Deletes keys', 'Sorts keys'], correctIndex: 1, explanation: 'Object spread is a shallow copy of own enumerable properties.' },
    { question: 'this inside obj.method() refers to…', options: ['The function itself', 'obj (when called as obj.method())', 'window always', 'The prototype'], correctIndex: 1, explanation: 'this is set by how the method is invoked.' },
    { question: 'Optional chaining ?. stops if left side is…', options: ['0', 'false', 'null or undefined', 'NaN'], correctIndex: 2, explanation: '?. short-circuits on nullish values.' },
  ],
  strings: [
    { question: 'Template literals use…', options: ['Single quotes only', 'Backticks `', 'Double hashes', 'Angle brackets'], correctIndex: 1, explanation: 'Backticks enable interpolation with dollar-curly-brace syntax around expressions.' },
    { question: '"abc".length is…', options: ['2', '3', '4', 'undefined'], correctIndex: 1, explanation: 'length counts UTF-16 code units in the string.' },
    { question: 'trim() removes…', options: ['All vowels', 'Leading/trailing whitespace', 'Numbers', 'Quotes'], correctIndex: 1, explanation: 'trim cleans spaces at both ends.' },
    { question: 'split(",") returns…', options: ['A string', 'An array', 'A number', 'A boolean'], correctIndex: 1, explanation: 'split divides a string into an array of parts.' },
  ],
  closures: [
    { question: 'A closure is…', options: ['A CSS rule', 'Inner function remembering outer variables', 'A type of loop', 'A DOM node'], correctIndex: 1, explanation: 'Closures keep outer scope variables alive.' },
    { question: 'let in for-loop fixes classic closure bug because…', options: ['It is global', 'Each iteration gets its own binding', 'It deletes i', 'It hoists to top of file'], correctIndex: 1, explanation: 'Per-iteration bindings prevent shared mutable i.' },
    { question: 'Lexical scope means…', options: ['Scope decided at write time', 'Scope random at runtime', 'Only global scope exists', 'Scope is always window'], correctIndex: 0, explanation: 'Nested functions see variables from where they were defined.' },
    { question: 'IIFE stands for…', options: ['Immediately Invoked Function Expression', 'Internal Interface For Events', 'Indexed Iteration For Elements', 'Inline Import Function Export'], correctIndex: 0, explanation: 'IIFEs run once at definition time to create private scope.' },
  ],
  dom: [
    { question: 'document.querySelector() returns…', options: ['All elements always', 'First matching element', 'Only IDs', 'A Promise'], correctIndex: 1, explanation: 'querySelector returns the first CSS selector match.' },
    { question: 'textContent sets…', options: ['HTML markup parsed', 'Plain text inside an element', 'CSS styles', 'Event listeners'], correctIndex: 1, explanation: 'textContent treats content as text, not HTML.' },
    { question: 'createElement("div")…', options: ['Adds div to page immediately', 'Creates an in-memory element', 'Deletes all divs', 'Returns null'], correctIndex: 1, explanation: 'You must append the created node to attach it to the DOM.' },
    { question: 'classList.add("active")…', options: ['Removes class', 'Adds a CSS class', 'Replaces entire className string only', 'Runs JavaScript class'], correctIndex: 1, explanation: 'classList manages individual class tokens.' },
  ],
  events: [
    { question: 'addEventListener attaches…', options: ['Styles', 'Event handlers', 'Database rows', 'Modules'], correctIndex: 1, explanation: 'Listeners run when the event fires on the target.' },
    { question: 'event.preventDefault()…', options: ['Stops all JS', 'Blocks default browser action', 'Deletes the element', 'Reloads page always'], correctIndex: 1, explanation: 'Use it to stop default link navigation or form submit.' },
    { question: 'Event bubbling means…', options: ['Events go child → parent', 'Events never propagate', 'Only capture phase exists', 'Events run on server'], correctIndex: 0, explanation: 'Events bubble up the DOM tree unless stopped.' },
    { question: 'click is a…', options: ['Macro task only', 'DOM event type', 'CSS property', 'Array method'], correctIndex: 1, explanation: 'click fires when users press and release on an element.' },
  ],
  errors: [
    { question: 'try/catch catches…', options: ['Syntax errors in parsing', 'Runtime errors in try block', 'CSS errors', 'Network speed'], correctIndex: 1, explanation: 'Parse errors happen before execution; try/catch handles runtime throws.' },
    { question: 'throw new Error("msg")…', options: ['Logs only', 'Creates and throws an exception', 'Returns undefined', 'Compiles code'], correctIndex: 1, explanation: 'throw interrupts normal flow and jumps to catch.' },
    { question: 'finally runs…', options: ['Only on success', 'Only on failure', 'Always after try/catch', 'Never'], correctIndex: 2, explanation: 'finally executes whether or not an error occurred.' },
    { question: 'JSON.parse on invalid JSON…', options: ['Returns null silently', 'Throws SyntaxError', 'Returns undefined always', 'Fixes the string'], correctIndex: 1, explanation: 'Invalid JSON causes parse to throw.' },
  ],
  es6: [
    { question: 'Destructuring { a } = obj extracts…', options: ['Property a into variable a', 'Method only', 'Prototype chain', 'All keys as array'], correctIndex: 0, explanation: 'Object destructuring maps properties to variables.' },
    { question: 'Spread ...arr in a new array…', options: ['Deletes items', 'Copies elements into new array', 'Sorts array', 'Converts to object only'], correctIndex: 1, explanation: 'Spread expands iterables into another array literal.' },
    { question: 'const fn = () => {} is…', options: ['Generator', 'Arrow function', 'Class', 'Module'], correctIndex: 1, explanation: 'Arrow functions use => syntax.' },
    { question: 'Template literal interpolation uses…', options: ['{{ }}', '$' + '{ }', '<% %>', '#{ }'], correctIndex: 1, explanation: 'Wrap expressions in dollar-curly-brace syntax inside backticks to evaluate them.' },
  ],
  promises: [
    { question: 'Promise states include…', options: ['pending, fulfilled, rejected', 'open, closed', 'read, write', 'start, stop'], correctIndex: 0, explanation: 'Promises start pending then settle fulfilled or rejected.' },
    { question: 'await can be used inside…', options: ['Any function', 'async functions only', 'Global script only', 'Classes only'], correctIndex: 1, explanation: 'await is valid only in async functions (or modules).' },
    { question: '.catch handles…', options: ['Success values', 'Rejections/errors', 'CSS', 'DOM ready'], correctIndex: 1, explanation: 'catch runs when the promise chain rejects.' },
    { question: 'Promise.all fails if…', options: ['Any input promise rejects', 'All resolve slowly', 'You use await', 'Array is empty'], correctIndex: 0, explanation: 'Promise.all short-circuits on the first rejection.' },
  ],
  fetch: [
    { question: 'fetch(url) returns…', options: ['Parsed JSON always', 'A Promise of Response', 'A DOM node', 'undefined'], correctIndex: 1, explanation: 'fetch is async and resolves to a Response object.' },
    { question: 'response.ok is true when status is…', options: ['200–299', '100–199', '400–499', 'Any number'], correctIndex: 0, explanation: 'ok indicates a successful HTTP status range.' },
    { question: 'response.json() returns…', options: ['A string', 'Promise of parsed data', 'Headers object', 'Status code number'], correctIndex: 1, explanation: 'json() asynchronously parses the body.' },
    { question: 'POST requests usually send body with…', options: ['method: "POST" and body option', 'Only GET', 'CSS', 'localStorage'], correctIndex: 0, explanation: 'fetch options include method, headers, and body.' },
  ],
  json: [
    { question: 'JSON.stringify converts…', options: ['String to object', 'JS value to JSON string', 'HTML to CSS', 'Promise to array'], correctIndex: 1, explanation: 'stringify serializes data for storage or APIs.' },
    { question: 'localStorage stores…', options: ['Only numbers', 'String key/value pairs', 'Functions directly', 'Binary only'], correctIndex: 1, explanation: 'Values must be strings — stringify objects first.' },
    { question: 'JSON keys must be in…', options: ['Single quotes', 'Double quotes', 'Backticks', 'No quotes'], correctIndex: 1, explanation: 'JSON requires double-quoted keys and strings.' },
    { question: 'sessionStorage vs localStorage: session clears when…', options: ['Tab/browser session ends', 'Never', 'Every click', 'Server restarts only'], correctIndex: 0, explanation: 'sessionStorage is scoped to the page session.' },
  ],
  collections: [
    { question: 'Map keys can be…', options: ['Only strings', 'Any type', 'Only numbers', 'Only symbols'], correctIndex: 1, explanation: 'Map accepts objects, functions, etc. as keys.' },
    { question: 'Set stores…', options: ['Duplicate values freely', 'Unique values', 'Key-value pairs', 'CSS classes'], correctIndex: 1, explanation: 'Set keeps only unique entries.' },
    { question: 'map.size returns…', options: ['Number of entries', 'Longest key', 'First value', 'Boolean'], correctIndex: 0, explanation: 'size is the entry count in Map/Set.' },
    { question: 'WeakMap keys must be…', options: ['Strings', 'Objects only', 'Numbers only', 'Arrays only'], correctIndex: 1, explanation: 'WeakMap keys are objects held weakly for GC.' },
  ],
  regex: [
    { question: '/^hi/i tests…', options: ['Ends with hi', 'Starts with hi case-insensitive', 'Contains HTML', 'JSON validity'], correctIndex: 1, explanation: '^ anchors start; i flag ignores case.' },
    { question: 'test() returns…', options: ['Matched string', 'boolean', 'Array always', 'Promise'], correctIndex: 1, explanation: 'RegExp.test returns true/false.' },
    { question: '\\d matches…', options: ['Any digit', 'Only letter d', 'Whitespace', 'Dot character'], correctIndex: 0, explanation: '\\d is shorthand for [0-9].' },
    { question: 'match() on string returns…', options: ['Boolean only', 'Array of matches or null', 'A Map', 'undefined always'], correctIndex: 1, explanation: 'match returns matches or null if no match.' },
  ],
  'event-loop': [
    { question: 'setTimeout(fn, 0) runs after…', options: ['Current sync code and microtasks', 'Immediately before sync', 'Never', 'Only on server'], correctIndex: 0, explanation: 'Timers are macrotasks queued after the stack clears.' },
    { question: 'Promise.then callbacks are…', options: ['Macrotasks', 'Microtasks', 'Sync code', 'CSS tasks'], correctIndex: 1, explanation: 'Microtasks run before the next macrotask.' },
    { question: 'Call stack holds…', options: ['Pending fetch URLs', 'Currently executing functions', 'All future timers', 'CSS rules'], correctIndex: 1, explanation: 'The stack tracks synchronous execution frames.' },
    { question: 'Long sync loop blocks…', options: ['Only server', 'UI updates and delayed callbacks', 'Nothing', 'Only promises'], correctIndex: 1, explanation: 'Blocking the stack freezes responsiveness.' },
  ],
  prototypes: [
    { question: 'Prototype chain ends at…', options: ['Object.prototype then null', 'Array only', 'window', 'Infinity'], correctIndex: 0, explanation: 'Lookup walks prototypes until null.' },
    { question: 'new Dog() calls…', options: ['Only static methods', 'Constructor with fresh object', 'delete on prototype', 'import'], correctIndex: 1, explanation: 'new creates an object and runs the constructor.' },
    { question: 'Object.create(proto) sets…', options: ['CSS class', 'Internal [[Prototype]]', 'JSON schema', 'Event listener'], correctIndex: 1, explanation: 'create makes an object with specified prototype.' },
    { question: 'hasOwnProperty checks…', options: ['Prototype chain too', 'Own properties only', 'CSS only', 'Promises'], correctIndex: 1, explanation: 'Own props exclude inherited prototype properties.' },
  ],
  classes: [
    { question: 'class fields and methods are…', options: ['Always global', 'Defined on prototype/instance', 'Only in JSON', 'CSS selectors'], correctIndex: 1, explanation: 'Classes define object structure and shared methods.' },
    { question: 'extends creates…', options: ['Inheritance link', 'Only CSS', 'A Promise', 'A regex'], correctIndex: 0, explanation: 'extends sets up subclass prototype chain.' },
    { question: 'super() in constructor…', options: ['Optional always', 'Required before using this in subclass', 'Deletes parent', 'Imports modules'], correctIndex: 1, explanation: 'Subclass must call super() before accessing this.' },
    { question: 'static method belongs to…', options: ['Each instance only', 'The class constructor', 'window', 'DOM'], correctIndex: 1, explanation: 'Static methods live on the class, not instances.' },
  ],
  modules: [
    { question: 'export default allows…', options: ['One default export per module', 'Unlimited defaults', 'No imports', 'CSS export'], correctIndex: 0, explanation: 'Each module has at most one default export.' },
    { question: 'import { x } from "./m.js" is…', options: ['Default import', 'Named import', 'CSS import', 'Dynamic only'], correctIndex: 1, explanation: 'Curly braces import named bindings.' },
    { question: 'ES modules are…', options: ['Always synchronous in browsers', 'Statically analyzable', 'Only for CSS', 'Deprecated'], correctIndex: 1, explanation: 'Imports/exports are resolved at load time.' },
    { question: 'import() with parentheses is…', options: ['Syntax error', 'Dynamic import returning Promise', 'CSS only', 'JSON parse'], correctIndex: 1, explanation: 'Dynamic import() loads modules on demand.' },
  ],
  functional: [
    { question: 'Pure function…', options: ['Mutates global state always', 'Same input → same output, no side effects', 'Must use classes', 'Cannot return'], correctIndex: 1, explanation: 'Pure functions are predictable and testable.' },
    { question: 'reduce builds…', options: ['Only strings', 'Single accumulated value', 'CSS file', 'DOM tree'], correctIndex: 1, explanation: 'reduce folds array into one result.' },
    { question: 'Immutability means…', options: ['Never copy data', 'Avoid mutating; create new copies', 'Use var only', 'Disable functions'], correctIndex: 1, explanation: 'New data structures instead of in-place mutation.' },
    { question: 'Higher-order function…', options: ['Takes/returns functions', 'Only runs once', 'Is always async', 'Is a CSS hook'], correctIndex: 0, explanation: 'HOFs accept or return other functions.' },
  ],
  performance: [
    { question: 'Debouncing delays execution until…', options: ['Events stop firing for a wait period', 'Page reload', 'Every keystroke immediately', 'Server restart'], correctIndex: 0, explanation: 'Debounce waits for a pause in rapid events.' },
    { question: 'documentFragment helps…', options: ['Batch DOM inserts with fewer reflows', 'Parse JSON', 'Compile regex', 'Store cookies'], correctIndex: 0, explanation: 'Fragments let you build off-DOM then attach once.' },
    { question: 'Avoid layout thrashing by…', options: ['Mixing many read/write DOM geometry in loop', 'Batching reads then writes', 'Using infinite loops', 'Disabling JS'], correctIndex: 1, explanation: 'Alternate read/write causes expensive reflows.' },
    { question: 'Lazy loading images means…', options: ['Load when needed/in view', 'Never load images', 'Convert to CSS', 'Delete alt text'], correctIndex: 0, explanation: 'Defer work until the resource is required.' },
  ],
};

export function getMcqsForTopic(topicId) {
  return TOPIC_MCQS[topicId] || [];
}
