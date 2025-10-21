// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// In-memory database (for demo - replace with real DB in production)
let users = [];
let userIdCounter = 1;

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Utility functions
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const findUserByEmail = (email) => users.find(user => user.email === email);
const findUserById = (id) => users.find(user => user.id === id);

// ==================== AUTH ROUTES ====================

// Health check
app.get('/.netlify/functions/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'Online Groceries API is running on Netlify',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Register
app.post('/.netlify/functions/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: userIdCounter++,
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Generate token
        const token = generateToken(newUser.id, newUser.email);

        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token,
                expiresIn: JWT_EXPIRES_IN
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Login
app.post('/.netlify/functions/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const token = generateToken(user.id, user.email);

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
                expiresIn: JWT_EXPIRES_IN
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get all users (for testing)
app.get('/.netlify/functions/api/auth/users', (req, res) => {
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

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Export the serverless function
module.exports.handler = serverless(app);