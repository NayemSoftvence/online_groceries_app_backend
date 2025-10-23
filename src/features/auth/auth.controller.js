const authService = require('./auth.service');
const { asyncHandler } = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');

const authController = {
  register: asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  }),

  login: asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  }),

  getProfile: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: { user }
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    // Implementation for profile updates
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  })
};

module.exports = authController;