// src/config/config.js
require('dotenv').config();

const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'online-groceries-api',
        audience: 'flutter-customers'
    },

    // Security
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
    },

    // Rate Limiting
    rateLimit: {
        maxRequests: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 100
    },

    // CORS
    cors: {
        clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    }
};

// Validation
const validateConfig = () => {
    const required = ['JWT_SECRET'];

    for (const field of required) {
        if (!process.env[field]) {
            console.error(`❌ Missing required environment variable: ${field}`);

            if (config.nodeEnv === 'production') {
                process.exit(1);
            } else {
                console.log('⚠️  Continuing in development mode with default values');
            }
        }
    }
};

validateConfig();

module.exports = config;