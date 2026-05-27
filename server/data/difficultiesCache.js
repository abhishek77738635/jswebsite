const cache = require('../lib/cache');
const { getAllQuestions } = require('./questionsCache');
const { loadStaticDifficulties } = require('./staticFallback');

const CACHE_KEY = 'cache:difficulties';

async function resolveDifficultiesPayload() {
  try {
    const { value: questions } = await getAllQuestions();
    const set = new Set();
    for (const q of questions) {
      if (q.difficulty) set.add(q.difficulty);
    }
    const list = Array.from(set);
    if (list.length > 0) {
      return { data: list, source: 'origin' };
    }
    return { data: loadStaticDifficulties(), source: 'fallback' };
  } catch (error) {
    console.warn('[difficulties] Using static fallback:', error.message);
    return { data: loadStaticDifficulties(), source: 'fallback' };
  }
}

async function getDifficulties() {
  const { value: payload, source: cacheLayer } = await cache.getOrSet(
    CACHE_KEY,
    resolveDifficultiesPayload,
  );

  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return {
      value: payload.data,
      source: payload.source === 'fallback' ? 'fallback' : cacheLayer,
    };
  }

  return { value: payload, source: cacheLayer };
}

module.exports = { getDifficulties };
