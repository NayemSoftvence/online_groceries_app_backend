// src/server.js
require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth/auth');
const errorHandler = require('./middleware/errorHandler.js'); // FIXED PATH
const config = require('./config/config'); // FIXED PATH

const app = express();
const PORT = config.port;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'Online Groceries API is running',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🛒 Online Groceries API running in ${config.nodeEnv} mode on http://localhost:${PORT}`);
    console.log(`📚 API Endpoints available at http://localhost:${PORT}/api/auth`);
});