const { db } = require('../config/firebase');
const cache = require('../lib/cache');
const { shouldUseStaticFallback } = require('../lib/firestoreErrors');
const { loadStaticCategories, loadStaticCategoryNames } = require('./staticFallback');

const CACHE_KEY_ALL = 'cache:categories:all';
const CACHE_KEY_NAMES = 'cache:categories:names';

async function fetchAllFromFirestore() {
  const snapshot = await db.collection('categories').orderBy('name', 'asc').get();
  const items = [];
  snapshot.forEach((doc) => {
    items.push({ ...doc.data(), firestoreId: doc.id });
  });
  return items;
}

async function resolveCategoriesPayload() {
  if (process.env.USE_STATIC_DATA_ONLY === 'true') {
    return { data: loadStaticCategories(), source: 'fallback' };
  }

  try {
    const data = await fetchAllFromFirestore();
    if (data.length > 0) {
      return { data, source: 'origin' };
    }
    console.warn('[categories] Firestore empty, using static fallback');
    return { data: loadStaticCategories(), source: 'fallback' };
  } catch (error) {
    if (!shouldUseStaticFallback(error)) {
      throw error;
    }
    console.warn('[categories] Firestore unavailable, using static fallback:', error.message);
    return { data: loadStaticCategories(), source: 'fallback' };
  }
}

async function resolveCategoryNamesPayload() {
  try {
    const { value: payload } = await getAllCategories();
    const categories = payload?.data ?? payload;
    const names = Array.isArray(categories) ? categories.map((c) => c.name) : [];
    if (names.length > 0) {
      return { data: names, source: 'origin' };
    }
    return { data: loadStaticCategoryNames(), source: 'fallback' };
  } catch {
    return { data: loadStaticCategoryNames(), source: 'fallback' };
  }
}

function unwrapPayload(payload, cacheLayer) {
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return {
      value: payload.data,
      source: payload.source === 'fallback' ? 'fallback' : cacheLayer,
    };
  }
  return { value: payload, source: cacheLayer };
}

async function getAllCategories() {
  const { value: payload, source: cacheLayer } = await cache.getOrSet(
    CACHE_KEY_ALL,
    resolveCategoriesPayload,
  );
  return unwrapPayload(payload, cacheLayer);
}

async function getCategoryNames() {
  const { value: payload, source: cacheLayer } = await cache.getOrSet(
    CACHE_KEY_NAMES,
    resolveCategoryNamesPayload,
  );
  return unwrapPayload(payload, cacheLayer);
}

async function invalidateCategories() {
  await cache.invalidate(CACHE_KEY_ALL);
  await cache.invalidate(CACHE_KEY_NAMES);
}

module.exports = {
  getAllCategories,
  getCategoryNames,
  invalidateCategories,
};
