const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply middleware to all routes
router.use(ensureAuthenticated);

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

// Reports
router.get('/reports', dashboardController.getReports);

module.exports = router;