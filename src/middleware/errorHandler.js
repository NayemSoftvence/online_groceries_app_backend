// src/middleware/errorHandler.js
const { AppError } = require('../utils/errors');
const config = require('../config/config');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error('💥 Error:', err);

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, 401);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
        ...(error.details && { details: error.details })
    });
};

module.exports = errorHandler;