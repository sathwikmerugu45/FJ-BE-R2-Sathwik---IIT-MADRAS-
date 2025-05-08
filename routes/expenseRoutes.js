const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply middleware to all routes
router.use(ensureAuthenticated);

// Get all expenses
router.get('/', expenseController.getExpenses);

// Add expense form
router.get('/add', expenseController.renderAddExpense);

// Add expense
router.post('/add', expenseController.addExpense);

// Edit expense form
router.get('/edit/:id', expenseController.renderEditExpense);

// Update expense
router.post('/edit/:id', expenseController.updateExpense);

// Delete expense
router.post('/delete/:id', expenseController.deleteExpense);

// Add category form
router.get('/categories/add', expenseController.renderAddCategory);

// Add category
router.post('/categories/add', expenseController.addCategory);

module.exports = router;