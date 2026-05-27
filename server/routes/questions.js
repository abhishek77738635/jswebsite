const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Utility to apply filters
function applyFilters(queryRef, reqQuery) {
  const { category, difficulty, isPremium, search } = reqQuery;
  let filteredQuery = queryRef;

  if (category && category !== 'All') {
    filteredQuery = filteredQuery.where('category', '==', category);
  }
  if (difficulty && difficulty !== 'All') {
    filteredQuery = filteredQuery.where('difficulty', '==', difficulty);
  }
  if (isPremium === 'true' || isPremium === 'false') {
    filteredQuery = filteredQuery.where('isPremium', '==', isPremium === 'true');
  }
  
  return filteredQuery;
}

// GET /api/questions/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const snapshot = await db.collection('questions').get();
    let totalQuestions = 0;
    let freeQuestions = 0;
    let premiumQuestions = 0;
    const difficultyStats = {};
    const categoryStats = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      totalQuestions++;
      
      if (data.isPremium) premiumQuestions++;
      else freeQuestions++;

      const diff = data.difficulty || 'Unknown';
      difficultyStats[diff] = (difficultyStats[diff] || 0) + 1;

      const cat = data.category || 'Unknown';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

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
    const {
      page = 1,
      limit = 50,
      sortBy = 'id',
      sortOrder = 'asc',
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    let queryRef = db.collection('questions');
    queryRef = applyFilters(queryRef, reqQuery = req.query);

    const snapshot = await queryRef.get();
    let questions = [];

    snapshot.forEach(doc => {
      let data = doc.data();
      
      // Filter premium content to prevent dev-tool leaking if user hasn't paid
      if (data.isPremium && (!req.user || !req.user.hasPaid)) {
        data.code = "// Premium content locked";
        data.answer = "Premium content locked";
        data.explanation = "Premium content locked";
      }

      // Client-side search for substring matching (since Firestore doesn't support substring native queries)
      if (search) {
        const s = search.toLowerCase();
        const inTitle = (data.title || '').toLowerCase().includes(s);
        const inQuestion = (data.question || '').toLowerCase().includes(s);
        const inCategory = (data.category || '').toLowerCase().includes(s);
        const inTags = (data.tags || []).some(t => t.toLowerCase().includes(s));
        const inCompanies = (data.companies || []).some(c =>
          String(c).toLowerCase().includes(s)
        );

        if (inTitle || inQuestion || inCategory || inTags || inCompanies) {
          questions.push({ ...data, firestoreId: doc.id });
        }
      } else {
        questions.push({ ...data, firestoreId: doc.id });
      }
    });

    // Sorting manually (since we combine filters that require complex indexes)
    questions.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
      if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });

    const totalCount = questions.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    
    // Pagination
    const skip = (pageNum - 1) * limitNum;
    questions = questions.slice(skip, skip + limitNum);

    res.json({
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
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
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
    const snapshot = await db.collection('questions').where('id', '==', idParam).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const doc = snapshot.docs[0];
    let data = doc.data();

    // Filter premium content to prevent dev-tool leaking if user hasn't paid
    if (data.isPremium && (!req.user || !req.user.hasPaid)) {
      data.code = "// Premium content locked";
      data.answer = "Premium content locked";
      data.explanation = "Premium content locked";
    }

    res.json({
      success: true,
      data: { ...data, firestoreId: doc.id },
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

    // Get the highest ID
    const snapshot = await db.collection('questions').orderBy('id', 'desc').limit(1).get();
    let nextId = 1;
    if (!snapshot.empty) {
      nextId = snapshot.docs[0].data().id + 1;
    }

    const newQuestion = {
      ...questionData,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('questions').add(newQuestion);

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
    // don't overwrite id
    if (updatedData.id) delete updatedData.id;

    await docRef.update(updatedData);

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
