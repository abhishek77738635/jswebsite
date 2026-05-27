const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/admin');
const categories = [
  { name: "Objects", description: "Object-related JavaScript concepts and behavior" },
  { name: "Functions", description: "Function scope, context, and execution" },
  { name: "Arrays", description: "Array methods and manipulation" },
  { name: "Async", description: "Asynchronous JavaScript and event loop" },
  { name: "ES6", description: "Modern JavaScript features and syntax" },
  { name: "Scoping", description: "Variable scoping and hoisting" }
];

const PACKAGED_BULK_QUESTIONS_PATH = path.join(
  __dirname,
  "../data/bulk-chunks/full-bulk-interview.json"
);
function loadBulkQuestionsFromFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Bulk file must contain a JSON array");
  return data;
}


function loadSeedQuestions() {
  if (!fs.existsSync(PACKAGED_BULK_QUESTIONS_PATH)) {
    throw new Error(`Seed file missing: ${PACKAGED_BULK_QUESTIONS_PATH}`);
  }
  return loadBulkQuestionsFromFile(PACKAGED_BULK_QUESTIONS_PATH);
}

const FIRESTORE_BATCH_OPS = 450;

function coerceCompanies(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

const ALLOWED_DIFFICULTY = new Set(["Beginner", "Intermediate", "Advanced", "Expert"]);

function normalizeIncomingQuestion(raw, nextNumericId) {
  const diff = ALLOWED_DIFFICULTY.has(raw.difficulty)
    ? raw.difficulty
    : "Intermediate";
  return {
    title: String(raw.title || "Untitled").slice(0, 500),
    difficulty: diff,
    isPremium: !!raw.isPremium,
    category: String(raw.category || "General").slice(0, 120),
    code: typeof raw.code === "string" ? raw.code : "",
    question: String(raw.question || ""),
    answer: String(raw.answer || ""),
    explanation: String(raw.explanation || ""),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String).filter(Boolean) : [],
    companies: coerceCompanies(raw.companies),
    id: nextNumericId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function fetchMaxQuestionId() {
  try {
    const snap = await db.collection("questions").orderBy("id", "desc").limit(1).get();
    if (snap.empty) return 0;
    const n = Number(snap.docs[0].data().id);
    return Number.isFinite(n) ? n : 0;
  } catch {
    let max = 0;
    const snap = await db.collection("questions").get();
    snap.forEach((doc) => {
      const n = Number(doc.data().id);
      if (Number.isFinite(n) && n > max) max = n;
    });
    return max;
  }
}

async function fetchExistingTitleSetLower() {
  const snap = await db.collection("questions").get();
  const set = new Set();
  snap.forEach((d) => set.add((d.data().title || "").trim().toLowerCase()));
  return set;
}

async function fetchExistingCategoryNames() {
  const snap = await db.collection("categories").get();
  const set = new Set();
  snap.forEach((d) => {
    const n = d.data().name;
    if (n) set.add(String(n));
  });
  return set;
}

async function upsertCategoriesByName(categoryNames) {
  const existing = await fetchExistingCategoryNames();
  const unique = [...new Set(categoryNames.map((s) => String(s || "").trim()).filter(Boolean))];
  const toAdd = unique.filter((n) => !existing.has(n));
  if (toAdd.length === 0) return { added: 0 };

  let batch = db.batch();
  let ops = 0;
  let added = 0;
  const now = new Date().toISOString();

  const flush = async () => {
    if (ops === 0) return;
    await batch.commit();
    batch = db.batch();
    ops = 0;
  };

  for (const name of toAdd) {
    if (ops >= FIRESTORE_BATCH_OPS) await flush();
    batch.set(db.collection("categories").doc(), {
      name,
      description: `Interview questions about ${name}`,
      createdAt: now,
      updatedAt: now,
    });
    ops++;
    added++;
    existing.add(name);
  }
  await flush();
  return { added };
}

/**
 * Appends questions with new sequential ids. Ignores incoming id field.
 * @param {object} options
 * @param {boolean} [options.skipDuplicateTitles=true] — skip rows whose title matches an existing question (after trim + lower-case)
 */
async function mergeQuestionsArray(incoming, options = {}) {
  const skipDup = options.skipDuplicateTitles !== false;
  const upsertCats = options.upsertCategories !== false;

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return {
      inserted: 0,
      skippedDuplicates: 0,
      categoryDocsAdded: 0,
      highestIdAssigned: await fetchMaxQuestionId(),
    };
  }

  let maxId = await fetchMaxQuestionId();
  /** @type {Set<string>|null} */
  const titlesSeen = skipDup ? await fetchExistingTitleSetLower() : null;

  const prepared = [];
  let skippedDuplicates = 0;

  for (const raw of incoming) {
    const key = (raw.title || "").trim().toLowerCase();
    if (skipDup && key) {
      if (titlesSeen.has(key)) {
        skippedDuplicates++;
        continue;
      }
      titlesSeen.add(key);
    }
    maxId += 1;
    prepared.push(normalizeIncomingQuestion(raw, maxId));
  }

  if (prepared.length === 0) {
    return {
      inserted: 0,
      skippedDuplicates,
      categoryDocsAdded: 0,
      highestIdAssigned: maxId,
    };
  }

  let categoryDocsAdded = 0;
  if (upsertCats) {
    const r = await upsertCategoriesByName(prepared.map((q) => q.category));
    categoryDocsAdded = r.added;
  }

  let batch = db.batch();
  let ops = 0;
  const flushBatch = async () => {
    if (ops === 0) return;
    await batch.commit();
    batch = db.batch();
    ops = 0;
  };

  for (const doc of prepared) {
    if (ops >= FIRESTORE_BATCH_OPS) await flushBatch();
    batch.set(db.collection("questions").doc(), doc);
    ops++;
  }
  await flushBatch();

  return {
    inserted: prepared.length,
    skippedDuplicates,
    categoryDocsAdded,
    highestIdAssigned: maxId,
  };
}

async function clearCollection(collectionPath) {
  const snapshot = await db.collection(collectionPath).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

// POST /api/seed/questions - Seed questions data
router.post('/questions', async (req, res) => {
  try {
    const questions = loadSeedQuestions();
    await clearCollection('questions');
    console.log('Cleared existing questions');

    const batch = db.batch();
    questions.forEach(q => {
      const docRef = db.collection('questions').doc();
      batch.set(docRef, { ...q, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    });
    await batch.commit();
    console.log(`Inserted ${questions.length} questions`);

    res.json({
      success: true,
      message: `Successfully seeded ${questions.length} questions`,
      data: {
        inserted: questions.length,
        questions
      }
    });

  } catch (error) {
    console.error('Error seeding questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding questions',
      error: error.message
    });
  }
});

// POST /api/seed/categories - Seed categories data
router.post('/categories', async (req, res) => {
  try {
    // Clear existing categories
    await clearCollection('categories');
    console.log('Cleared existing categories');

    // Insert categories
    const batch = db.batch();
    categories.forEach(c => {
      const docRef = db.collection('categories').doc();
      batch.set(docRef, { ...c, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    });
    await batch.commit();
    console.log(`Inserted ${categories.length} categories`);

    res.json({
      success: true,
      message: `Successfully seeded ${categories.length} categories`,
      data: {
        inserted: categories.length,
        categories
      }
    });

  } catch (error) {
    console.error('Error seeding categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding categories',
      error: error.message
    });
  }
});

// POST /api/seed/all - Seed all data (questions + categories)
router.post('/all', async (req, res) => {
  try {
    const questions = loadSeedQuestions();
    await clearCollection('questions');
    await clearCollection('categories');
    console.log('Cleared existing data');

    const batch = db.batch();

    categories.forEach(c => {
      const docRef = db.collection('categories').doc();
      batch.set(docRef, { ...c, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    });
    console.log(`Inserted ${categories.length} categories`);

    questions.forEach(q => {
      const docRef = db.collection('questions').doc();
      batch.set(docRef, { ...q, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    });
    console.log(`Inserted ${questions.length} questions`);

    await batch.commit();

    res.json({
      success: true,
      message: 'Successfully seeded all data',
      data: {
        categories: {
          inserted: categories.length,
        },
        questions: {
          inserted: questions.length,
        }
      }
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding data',
      error: error.message
    });
  }
});

// GET /api/seed/status - Check database status
router.get('/status', async (req, res) => {
  try {
    const qSnapshot = await db.collection('questions').get();
    const cSnapshot = await db.collection('categories').get();
    
    const questionCount = qSnapshot.size;
    const categoryCount = cSnapshot.size;
    
    const questionsByCategory = {};
    const questionsByDifficulty = {};
    const premiumStats = { true: 0, false: 0 };
    
    qSnapshot.forEach(doc => {
      const d = doc.data();
      const cat = d.category || 'Unknown';
      const diff = d.difficulty || 'Unknown';
      const isPrem = !!d.isPremium;
      
      questionsByCategory[cat] = (questionsByCategory[cat] || 0) + 1;
      questionsByDifficulty[diff] = (questionsByDifficulty[diff] || 0) + 1;
      premiumStats[isPrem]++;
    });

    const formattedByCategory = Object.entries(questionsByCategory).map(([id, count]) => ({ _id: id, count }));
    const formattedByDifficulty = Object.entries(questionsByDifficulty).map(([id, count]) => ({ _id: id, count }));
    const formattedPremiumStats = Object.entries(premiumStats).map(([id, count]) => ({ _id: id === 'true', count }));

    res.json({
      success: true,
      data: {
        questions: {
          total: questionCount,
          byCategory: formattedByCategory,
          byDifficulty: formattedByDifficulty,
          byAccessType: formattedPremiumStats
        },
        categories: {
          total: categoryCount
        },
        isSeeded: questionCount > 0 && categoryCount > 0
      }
    });

  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking database status',
      error: error.message
    });
  }
});

// POST /api/seed/merge-packaged-bulk — import server/data/bulk-chunks/full-bulk-interview.json (admin only)
router.post('/merge-packaged-bulk', requireAdmin, async (req, res) => {
  try {
    if (!fs.existsSync(PACKAGED_BULK_QUESTIONS_PATH)) {
      return res.status(404).json({
        success: false,
        message: `Packaged bulk file missing: ${PACKAGED_BULK_QUESTIONS_PATH}`,
      });
    }

    const body = req.body || {};
    const incoming = loadBulkQuestionsFromFile(PACKAGED_BULK_QUESTIONS_PATH);
    const result = await mergeQuestionsArray(incoming, {
      skipDuplicateTitles: body.skipDuplicateTitles !== false,
      upsertCategories: body.upsertCategories !== false,
    });

    res.json({
      success: true,
      message:
        result.inserted > 0
          ? `Imported ${result.inserted} questions (${result.skippedDuplicates} duplicates skipped)`
          : `No new rows inserted (${result.skippedDuplicates} duplicates skipped in packaged set)`,
      data: {
        ...result,
        totalInPack: incoming.length,
      },
    });
  } catch (error) {
    console.error('merge-packaged-bulk:', error);
    res.status(500).json({
      success: false,
      message: 'Error merging packaged bulk questions',
      error: error.message,
    });
  }
});

// POST /api/seed/merge-questions-array — arbitrary JSON payload { questions: [...] } (admin only)
router.post('/merge-questions-array', requireAdmin, async (req, res) => {
  try {
    const incoming = req.body?.questions;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({
        success: false,
        message: 'Body must be JSON with a "questions" array',
      });
    }

    const body = req.body || {};
    const result = await mergeQuestionsArray(incoming, {
      skipDuplicateTitles: body.skipDuplicateTitles !== false,
      upsertCategories: body.upsertCategories !== false,
    });

    res.json({
      success: true,
      message:
        result.inserted > 0
          ? `Inserted ${result.inserted} question(s)`
          : 'No rows inserted (all skipped as duplicates)',
      data: result,
    });
  } catch (error) {
    console.error('merge-questions-array:', error);
    res.status(500).json({
      success: false,
      message: 'Error merging questions array',
      error: error.message,
    });
  }
});

module.exports = router;
