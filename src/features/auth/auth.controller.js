const authService = require('./auth.service');

const authController = {
  register: async (req, res, next) => {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const user = await authService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;