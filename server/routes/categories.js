const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const {
  getAllCategories,
  getCategoryNames,
} = require('../data/categoriesCache');
const { getDifficulties } = require('../data/difficultiesCache');
const {
  loadStaticCategories,
  loadStaticCategoryNames,
  loadStaticDifficulties,
} = require('../data/staticFallback');
const { invalidateAfterCategoriesWrite } = require('../lib/invalidateDataCache');
const { applyCacheHeaders, setDataCacheSource } = require('../lib/cacheHeaders');

async function loadCategoriesSafe(getter, staticLoader) {
  try {
    return await getter();
  } catch (error) {
    console.error('[categories] Using static fallback:', error.message);
    return { value: staticLoader(), source: 'fallback' };
  }
}

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { value: categories, source } = await loadCategoriesSafe(
      getAllCategories,
      loadStaticCategories,
    );
    setDataCacheSource(res, source);
    applyCacheHeaders(res, { browserSeconds: 300, edgeSeconds: 600, isPublic: true });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
});

// GET /api/categories/list
router.get('/list', async (req, res) => {
  try {
    const { value: categories, source } = await loadCategoriesSafe(
      getCategoryNames,
      loadStaticCategoryNames,
    );
    setDataCacheSource(res, source);
    applyCacheHeaders(res, { browserSeconds: 300, edgeSeconds: 600, isPublic: true });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching category list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category list',
      error: error.message,
    });
  }
});

// GET /api/categories/difficulties
router.get('/difficulties', async (req, res) => {
  try {
    const { value: difficulties, source } = await loadCategoriesSafe(
      getDifficulties,
      loadStaticDifficulties,
    );
    setDataCacheSource(res, source);
    applyCacheHeaders(res, { browserSeconds: 300, edgeSeconds: 600, isPublic: true });

    res.json({
      success: true,
      data: difficulties,
    });
  } catch (error) {
    console.error('Error fetching difficulties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching difficulties',
      error: error.message,
    });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('categories').add(categoryData);
    await invalidateAfterCategoriesWrite();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { ...categoryData, firestoreId: docRef.id },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating category',
      error: error.message,
    });
  }
});

// DELETE /api/categories/:name
router.delete('/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const snapshot = await db.collection('categories').where('name', '==', name).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const doc = snapshot.docs[0];
    await doc.ref.delete();
    await invalidateAfterCategoriesWrite();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
});

module.exports = router;
