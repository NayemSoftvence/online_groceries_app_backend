// src/server.js
require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth/auth');
const notificationRoutes = require('./notifications/notifications');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/config');

const app = express();

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Online Groceries API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    version: '1.1.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

// Only start server if not in serverless environment
if (!process.env.NETLIFY) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🛒 Online Groceries API running in ${config.nodeEnv} mode on http://localhost:${PORT}`);
  });
}

// Export for Netlify functions
module.exports = app;