// netlify/functions/api.js - Netlify adapter only
const serverless = require('serverless-http');
const app = require('../../src/app'); // Import your Express app

// Wrap Express app for Netlify
exports.handler = serverless(app);