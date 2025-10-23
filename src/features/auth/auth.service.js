const User = require('./auth.model');
const { generateToken } = require('../../utils/auth');

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
    const token = generateToken(user.id);

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return { user: userResponse, token };
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
    const token = generateToken(user.id);

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return { user: userResponse, token };
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    return userResponse;
  }
}

module.exports = new AuthService();