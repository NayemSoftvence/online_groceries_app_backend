// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');

// Import your existing Express app
const app = require('../src/server');

// Wrap your Express app for Netlify
exports.handler = serverless(app);