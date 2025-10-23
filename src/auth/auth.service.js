const User = require('./auth.model');

class AuthService {
  async register(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = await User.create(userData);
    
    // Generate token
    const token = require('../../utils/auth').generateToken(user.id);

    return { user: user.toSafeObject(), token };
  }

  async login(email, password) {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account has been deactivated');
    }

    // Generate token
    const token = require('../../utils/auth').generateToken(user.id);

    return { user: user.toSafeObject(), token };
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toSafeObject();
  }
}

module.exports = new AuthService();