const express = require('express');
const authController = require('./auth.controller');
const { validateRegistration, validateLogin } = require('./auth.middleware');
const { authenticate } = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;