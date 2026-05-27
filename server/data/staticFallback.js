const path = require('path');
const fs = require('fs');
const { ROOT_DIR } = require('../../loadEnv');

/** Matches server/routes/seed.js default categories when DB is empty. */
const DEFAULT_CATEGORIES = [
  { name: 'Objects', description: 'Object-related JavaScript concepts and behavior' },
  { name: 'Functions', description: 'Function scope, context, and execution' },
  { name: 'Arrays', description: 'Array methods and manipulation' },
  { name: 'Async', description: 'Asynchronous JavaScript and event loop' },
  { name: 'ES6', description: 'Modern JavaScript features and syntax' },
  { name: 'Scoping', description: 'Variable scoping and hoisting' },
];

let questionsMemo = null;
let categoriesMemo = null;
let resolvedBulkPath = null;

function resolveBulkPath() {
  if (resolvedBulkPath && fs.existsSync(resolvedBulkPath)) {
    return resolvedBulkPath;
  }

  const candidates = [
    path.join(__dirname, 'bulk-chunks/full-bulk-interview.json'),
    path.join(ROOT_DIR, 'server/data/bulk-chunks/full-bulk-interview.json'),
    path.join(process.cwd(), 'server/data/bulk-chunks/full-bulk-interview.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      resolvedBulkPath = candidate;
      return candidate;
    }
  }

  throw new Error(`Static fallback file missing. Tried:\n${candidates.join('\n')}`);
}

function loadStaticQuestions() {
  if (questionsMemo) return questionsMemo;

  const bulkPath = resolveBulkPath();
  const raw = fs.readFileSync(bulkPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Static fallback file must be a JSON array');
  }

  questionsMemo = parsed.map((q, index) => ({
    ...q,
    firestoreId: `static-q-${q.id ?? index}`,
    tags: Array.isArray(q.tags) ? q.tags : [],
    companies: Array.isArray(q.companies) ? q.companies : [],
  }));

  return questionsMemo;
}

function loadStaticCategories() {
  if (categoriesMemo) return categoriesMemo;

  const questions = loadStaticQuestions();
  const names = new Set(DEFAULT_CATEGORIES.map((c) => c.name));

  for (const q of questions) {
    if (q.category) names.add(q.category);
  }

  categoriesMemo = [...names].sort().map((name) => {
    const preset = DEFAULT_CATEGORIES.find((c) => c.name === name);
    return {
      name,
      description: preset?.description || `${name} interview questions`,
      firestoreId: `static-cat-${name.replace(/\s+/g, '-').toLowerCase()}`,
    };
  });

  return categoriesMemo;
}

function loadStaticCategoryNames() {
  return loadStaticCategories().map((c) => c.name);
}

function loadStaticDifficulties() {
  const set = new Set();
  for (const q of loadStaticQuestions()) {
    if (q.difficulty) set.add(q.difficulty);
  }
  return Array.from(set);
}

module.exports = {
  loadStaticQuestions,
  loadStaticCategories,
  loadStaticCategoryNames,
  loadStaticDifficulties,
};
