// src/server.js - Local development server
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Only start server if not in serverless environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;