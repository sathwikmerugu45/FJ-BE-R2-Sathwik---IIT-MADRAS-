const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply middleware to all routes
router.use(ensureAuthenticated);

// Get all income
router.get('/', incomeController.getIncomes);

// Add income form
router.get('/add', incomeController.renderAddIncome);

// Add income
router.post('/add', incomeController.addIncome);

// Edit income form
router.get('/edit/:id', incomeController.renderEditIncome);

// Update income
router.post('/edit/:id', incomeController.updateIncome);

// Delete income
router.post('/delete/:id', incomeController.deleteIncome);

// Add category form
router.get('/categories/add', incomeController.renderAddCategory);

// Add category
router.post('/categories/add', incomeController.addCategory);

module.exports = router;