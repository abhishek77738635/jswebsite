const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name', 'asc').get();
    const categories = [];
    snapshot.forEach(doc => {
      categories.push({ ...doc.data(), firestoreId: doc.id });
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET /api/categories/list
router.get('/list', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name', 'asc').get();
    const categories = [];
    snapshot.forEach(doc => {
      categories.push(doc.data().name);
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching category list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category list',
      error: error.message
    });
  }
});

// GET /api/categories/difficulties
router.get('/difficulties', async (req, res) => {
  try {
    const snapshot = await db.collection('questions').get();
    const difficultySet = new Set();
    
    snapshot.forEach(doc => {
      if (doc.data().difficulty) {
        difficultySet.add(doc.data().difficulty);
      }
    });

    res.json({
      success: true,
      data: Array.from(difficultySet)
    });
  } catch (error) {
    console.error('Error fetching difficulties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching difficulties',
      error: error.message
    });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('categories').add(categoryData);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { ...categoryData, firestoreId: docRef.id }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating category',
      error: error.message
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

    res.json({
      success: true,
      message: 'Category deleted successfully'
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
