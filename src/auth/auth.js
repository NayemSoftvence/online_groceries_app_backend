const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authValidation, validate } = require('../middleware/validationMiddleware');
const { ValidationError, NotFoundError } = require('../utils/errors');
const config = require('../config/config');

const router = express.Router();

// In-memory "database" - Replace with real DB later
let users = [];
let userIdCounter = 1;

// Utility functions
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        config.jwt.secret,
        {
            expiresIn: config.jwt.expiresIn,
            issuer: config.jwt.issuer,
            audience: config.jwt.audience
        }
    );
};

const findUserByEmail = (email) => users.find(user => user.email === email);
const findUserById = (id) => users.find(user => user.id === id);

// ==================== AUTH ROUTES ====================

// @route   POST /api/auth/register
// @desc    Register a new customer
// @access  Public
router.post('/register', validate(authValidation.register), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            throw new ValidationError('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

        // Create user
        const newUser = {
            id: userIdCounter++,
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Generate JWT token
        const token = generateToken(newUser.id, newUser.email);

        // Return user data (without password)
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            data: {
                user: userResponse,
                token,
                expiresIn: config.jwt.expiresIn
            }
        });

    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate customer & get token
// @access  Public
router.post('/login', validate(authValidation.login), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = findUserByEmail(email);
        if (!user) {
            throw new ValidationError('Invalid email or password');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError('Invalid email or password');
        }

        // Generate JWT token
        const token = generateToken(user.id, user.email);

        // Return user data (without password)
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token,
                expiresIn: config.jwt.expiresIn
            }
        });

    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/profile
// @desc    Get current customer profile
// @access  Private
router.get('/profile', authenticateToken, (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = findUserById(userId);

        if (!user) {
            throw new NotFoundError('User');
        }

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/profile
// @desc    Update customer profile
// @access  Private
router.put('/profile', authenticateToken, validate(authValidation.updateProfile), (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name } = req.body;

        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            throw new NotFoundError('User');
        }

        // Update user
        users[userIndex].name = name;

        const updatedUser = {
            id: users[userIndex].id,
            name: users[userIndex].name,
            email: users[userIndex].email,
            createdAt: users[userIndex].createdAt
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/change-password
// @desc    Change customer password
// @access  Private
router.post('/change-password', authenticateToken, validate(authValidation.changePassword), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            throw new NotFoundError('User');
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
        if (!isCurrentPasswordValid) {
            throw new ValidationError('Current password is incorrect');
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
        users[userIndex].password = hashedNewPassword;

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/users
// @desc    Get all customers (for testing)
// @access  Public (remove in production)
router.get('/users', (req, res) => {
    const usersWithoutPasswords = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    }));

    res.json({
        success: true,
        count: users.length,
        data: usersWithoutPasswords
    });
});

module.exports = router;