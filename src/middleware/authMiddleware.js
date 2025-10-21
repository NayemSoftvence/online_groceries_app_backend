const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new AuthenticationError('Access token required');
        }

        jwt.verify(token, config.jwt.secret, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    throw new AuthenticationError('Token has expired');
                }
                throw new AuthenticationError('Invalid token');
            }

            req.user = decoded;
            next();
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    authenticateToken
};