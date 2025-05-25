// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user info (protected route)
router.get('/me', auth, authController.getMe);

// Get user stats (protected route)
router.get('/stats', auth, authController.getUserStats);

// Update user profile (protected route)
router.put('/profile', auth, authController.updateProfile);

// Change password (protected route)
router.put('/password', auth, authController.changePassword);

// Delete account (protected route)
router.delete('/account', auth, authController.deleteAccount);

module.exports = router;