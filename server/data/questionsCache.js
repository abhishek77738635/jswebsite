const { db } = require('../config/firebase');
const cache = require('../lib/cache');
const { shouldUseStaticFallback } = require('../lib/firestoreErrors');
const { loadStaticQuestions } = require('./staticFallback');

const CACHE_KEY = 'cache:questions:all';

async function fetchAllFromFirestore() {
  const snapshot = await db.collection('questions').get();
  const items = [];
  snapshot.forEach((doc) => {
    items.push({ ...doc.data(), firestoreId: doc.id });
  });
  return items;
}

async function resolveQuestionsPayload() {
  if (process.env.USE_STATIC_DATA_ONLY === 'true') {
    return { data: loadStaticQuestions(), source: 'fallback' };
  }

  try {
    const data = await fetchAllFromFirestore();
    return { data, source: 'origin' };
  } catch (error) {
    if (!shouldUseStaticFallback(error)) {
      throw error;
    }
    console.warn('[questions] Firestore unavailable, using static fallback:', error.message);
    return { data: loadStaticQuestions(), source: 'fallback' };
  }
}

async function getAllQuestions() {
  const { value: payload, source: cacheLayer } = await cache.getOrSet(CACHE_KEY, resolveQuestionsPayload);

  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return {
      value: payload.data,
      source: payload.source === 'fallback' ? 'fallback' : cacheLayer,
    };
  }

  return { value: payload, source: cacheLayer };
}

async function invalidateQuestions() {
  await cache.invalidate(CACHE_KEY);
  await cache.invalidate('cache:difficulties');
}

function maskPremiumForUser(questions, user) {
  const hasPaid = user?.hasPaid;
  return questions.map((q) => {
    if (!q.isPremium || hasPaid) return q;
    return {
      ...q,
      code: '// Premium content locked',
      answer: 'Premium content locked',
      explanation: 'Premium content locked',
    };
  });
}

module.exports = {
  getAllQuestions,
  invalidateQuestions,
  maskPremiumForUser,
};
