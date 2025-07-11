const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Initiate OIDC login flow
router.get('/login', authController.login);

// OIDC callback URI
router.get('/callback', authController.callback);

// Logout user
router.get('/logout', isAuthenticated, authController.logout);

// Get current authenticated user details
router.get('/current-user', isAuthenticated, authController.currentUser);

module.exports = router;
