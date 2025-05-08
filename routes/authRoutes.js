const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../middleware/auth');

// Register page
router.get('/register', ensureNotAuthenticated, authController.renderRegister);

// Register user
router.post('/register', ensureNotAuthenticated, authController.register);

// Login page
router.get('/login', ensureNotAuthenticated, authController.renderLogin);

// Login user
router.post('/login', ensureNotAuthenticated, authController.login);

// Logout user
router.get('/logout', ensureAuthenticated, authController.logout);

// User profile
router.get('/profile', ensureAuthenticated, authController.profile);

module.exports = router;