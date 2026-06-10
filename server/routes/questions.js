const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const {
  getAllQuestions,
  maskPremiumForUser,
} = require('../data/questionsCache');
const { loadStaticQuestions } = require('../data/staticFallback');
const { shouldUseStaticFallback } = require('../lib/firestoreErrors');
const { invalidateAfterQuestionsWrite } = require('../lib/invalidateDataCache');
const { applyCacheHeaders, setDataCacheSource } = require('../lib/cacheHeaders');
const {
  FREE_PERCENT,
  getFreeQuestionIds,
  sortCatalogForUser,
} = require('../lib/questionAccess');

async function loadQuestionsSafe() {
  try {
    return await getAllQuestions();
  } catch (error) {
    if (!shouldUseStaticFallback(error)) {
      throw error;
    }
    console.error('[questions] Cache layer failed, static fallback:', error.message);
    return { value: loadStaticQuestions(), source: 'fallback' };
  }
}

function buildQuestionsListResponse(raw, req, res) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'id',
    sortOrder = 'asc',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

  const freeQuestionIds = getFreeQuestionIds(raw);

  let questions = filterQuestions(raw, req.query, req.user, freeQuestionIds);
  questions = sortCatalogForUser(questions);
  questions = maskPremiumForUser(questions, req.user, freeQuestionIds);

  if (req.user?.hasPaid && sortBy) {
    questions.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
      if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
  }

  const totalCount = questions.length;
  const totalPages = Math.ceil(totalCount / limitNum) || 1;
  const skip = (pageNum - 1) * limitNum;
  questions = questions.slice(skip, skip + limitNum);

  return {
    success: true,
    data: questions,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalCount,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      limit: limitNum,
    },
    filters: {
      category: req.query.category || 'All',
      difficulty: req.query.difficulty || 'All',
      isPremium: req.query.isPremium ?? 'All',
      search: req.query.search || '',
    },
    access: {
      hasPaid: Boolean(req.user?.hasPaid),
      freePercent: FREE_PERCENT,
      freeQuestionCount: freeQuestionIds.size,
      onFreeTier: !req.user?.hasPaid,
      freeQuestionIds: [...freeQuestionIds],
    },
  };
}

function filterQuestions(questions, query, user, freeQuestionIds) {
  const { category, difficulty, isPremium, search } = query;
  let result = questions;

  if (category && category !== 'All') {
    result = result.filter((q) => q.category === category);
  }
  if (difficulty && difficulty !== 'All') {
    result = result.filter((q) => q.difficulty === difficulty);
  }
  if (isPremium === 'true') {
    if (user?.hasPaid) {
      result = result.filter((q) => q.isPremium === true);
    } else {
      result = result.filter((q) => !freeQuestionIds.has(q.id));
    }
  } else if (isPremium === 'false') {
    if (user?.hasPaid) {
      result = result.filter((q) => q.isPremium === false);
    } else {
      result = result.filter((q) => freeQuestionIds.has(q.id));
    }
  }

  if (search && String(search).trim()) {
    const s = String(search).trim().toLowerCase();
    result = result.filter((data) => {
      const inTitle = (data.title || '').toLowerCase().includes(s);
      const inQuestion = (data.question || '').toLowerCase().includes(s);
      const inCategory = (data.category || '').toLowerCase().includes(s);
      const inTags = (data.tags || []).some((t) => t.toLowerCase().includes(s));
      const inCompanies = (data.companies || []).some((c) =>
        String(c).toLowerCase().includes(s),
      );
      return inTitle || inQuestion || inCategory || inTags || inCompanies;
    });
  }

  return result;
}

// GET /api/questions/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const { value: raw, source } = await loadQuestionsSafe();
    setDataCacheSource(res, source);
    applyCacheHeaders(res, { browserSeconds: 120, edgeSeconds: 300, isPublic: true });

    const freeQuestionIds = getFreeQuestionIds(raw);
    let totalQuestions = 0;
    let freeQuestions = 0;
    let premiumQuestions = 0;
    const difficultyStats = {};
    const categoryStats = {};

    for (const data of raw) {
      totalQuestions++;
      if (freeQuestionIds.has(data.id)) freeQuestions++;
      else premiumQuestions++;

      const diff = data.difficulty || 'Unknown';
      difficultyStats[diff] = (difficultyStats[diff] || 0) + 1;

      const cat = data.category || 'Unknown';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    }

    const byDifficulty = Object.entries(difficultyStats).map(([id, count]) => ({ _id: id, count }));
    const byCategory = Object.entries(categoryStats).map(([id, count]) => ({ _id: id, count }));

    res.json({
      success: true,
      data: {
        total: totalQuestions,
        free: freeQuestions,
        premium: premiumQuestions,
        byDifficulty,
        byCategory,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
});

// GET /api/questions
router.get('/', async (req, res) => {
  try {
    const { value: raw, source } = await loadQuestionsSafe();
    setDataCacheSource(res, source);
    // Per-user masking (hasPaid) — must not be cached across auth states
    res.set('Cache-Control', 'no-store, private');
    res.set('Vary', 'Authorization');
    res.json(buildQuestionsListResponse(raw, req, res));
  } catch (error) {
    console.error('Error fetching questions:', error);
    if (shouldUseStaticFallback(error)) {
      try {
        const raw = loadStaticQuestions();
        setDataCacheSource(res, 'fallback');
        res.set('Cache-Control', 'no-store, private');
        res.set('Vary', 'Authorization');
        return res.json(buildQuestionsListResponse(raw, req, res));
      } catch (fallbackError) {
        console.error('Static fallback failed:', fallbackError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message,
    });
  }
});

// GET /api/questions/:id
router.get('/:id', async (req, res) => {
  try {
    const idParam = parseInt(req.params.id, 10);
    const { value: raw, source } = await loadQuestionsSafe();
    setDataCacheSource(res, source);
    res.set('Cache-Control', 'no-store, private');
    res.set('Vary', 'Authorization');

    const found = raw.find((q) => q.id === idParam);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const freeQuestionIds = getFreeQuestionIds(raw);
    const [data] = maskPremiumForUser([found], req.user, freeQuestionIds);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message,
    });
  }
});

// POST /api/questions
router.post('/', async (req, res) => {
  try {
    const { firestoreId: _omitFs, id: _omitId, ...questionData } = req.body || {};

    const snapshot = await db.collection('questions').orderBy('id', 'desc').limit(1).get();
    let nextId = 1;
    if (!snapshot.empty) {
      nextId = snapshot.docs[0].data().id + 1;
    }

    const newQuestion = {
      ...questionData,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('questions').add(newQuestion);
    await invalidateAfterQuestionsWrite();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { ...newQuestion, firestoreId: docRef.id },
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating question',
      error: error.message,
    });
  }
});

// PUT /api/questions/:id
router.put('/:id', async (req, res) => {
  try {
    const idParam = parseInt(req.params.id, 10);
    const snapshot = await db.collection('questions').where('id', '==', idParam).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const docRef = snapshot.docs[0].ref;
    const { firestoreId: _omitFs, id: _omitId, ...body } = req.body || {};

    const updatedData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    if (updatedData.id) delete updatedData.id;

    await docRef.update(updatedData);
    await invalidateAfterQuestionsWrite();

    const updatedDoc = await docRef.get();

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { ...updatedDoc.data(), firestoreId: updatedDoc.id },
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating question',
      error: error.message,
    });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', async (req, res) => {
  try {
    const idParam = parseInt(req.params.id, 10);
    const snapshot = await db.collection('questions').where('id', '==', idParam).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const doc = snapshot.docs[0];
    await doc.ref.delete();
    await invalidateAfterQuestionsWrite();

    res.json({
      success: true,
      message: 'Question deleted successfully',
      data: { ...doc.data(), firestoreId: doc.id },
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message,
    });
  }
});

module.exports = router;
