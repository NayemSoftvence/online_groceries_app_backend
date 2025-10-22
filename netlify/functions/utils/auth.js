// netlify/functions/utils/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (event) => {
  try {
    const authHeader = event.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return { success: false, error: 'Access token required', statusCode: 401 };
    }

    // Verify token synchronously for Netlify
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-123');
    
    return { success: true, user: decoded };

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token has expired', statusCode: 401 };
    }
    if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'Invalid token', statusCode: 401 };
    }
    return { success: false, error: 'Authentication failed', statusCode: 500 };
  }
};

const requireAuth = (handler) => {
  return async (event, context) => {
    const authResult = authenticateToken(event);
    
    if (!authResult.success) {
      return {
        statusCode: authResult.statusCode || 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: authResult.error
        })
      };
    }

    // Add user to context for the handler
    context.user = authResult.user;
    return handler(event, context);
  };
};

module.exports = {
  authenticateToken,
  requireAuth
};