// netlify/functions/auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory database (for demo - in production use real DB)
let users = [];
let userIdCounter = 1;

exports.handler = async (event, context) => {
    const path = event.path.replace('/.netlify/functions/auth', '');
    const method = event.httpMethod;

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // HEALTH CHECK
        if (path === '/health' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    status: 'OK',
                    message: 'Online Groceries API is running on Netlify',
                    environment: process.env.NODE_ENV || 'development',
                    timestamp: new Date().toISOString()
                })
            };
        }

        // REGISTER USER
        if (path === '/register' && method === 'POST') {
            const { name, email, password } = JSON.parse(event.body);

            // Validation
            if (!name || !email || !password) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Name, email, and password are required'
                    })
                };
            }

            if (password.length < 6) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Password must be at least 6 characters long'
                    })
                };
            }

            // Check if user exists
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                return {
                    statusCode: 409,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'User with this email already exists'
                    })
                };
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

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: newUser.id,
                    email: newUser.email
                },
                process.env.JWT_SECRET || 'fallback-secret-for-development',
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                    issuer: 'online-groceries-api',
                    audience: 'flutter-customers'
                }
            );

            // Return user data (without password)
            const userResponse = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt
            };

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'User registered successfully',
                    data: {
                        user: userResponse,
                        token,
                        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
                    }
                })
            };
        }

        // LOGIN USER
        if (path === '/login' && method === 'POST') {
            const { email, password } = JSON.parse(event.body);

            // Validation
            if (!email || !password) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Email and password are required'
                    })
                };
            }

            // Find user
            const user = users.find(u => u.email === email);
            if (!user) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid email or password'
                    })
                };
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid email or password'
                    })
                };
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email
                },
                process.env.JWT_SECRET || 'fallback-secret-for-development',
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                    issuer: 'online-groceries-api',
                    audience: 'flutter-customers'
                }
            );

            // Return user data (without password)
            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            };

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: userResponse,
                        token,
                        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
                    }
                })
            };
        }

        // GET USER PROFILE (Protected)
        if (path === '/profile' && method === 'GET') {
            const authHeader = event.headers.authorization;
            if (!authHeader) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Access token required'
                    })
                };
            }

            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
                const user = users.find(u => u.id === decoded.userId);

                if (!user) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'User not found'
                        })
                    };
                }

                const userResponse = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                };

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Profile retrieved successfully',
                        data: {
                            user: userResponse
                        }
                    })
                };

            } catch (error) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid or expired token'
                    })
                };
            }
        }

        // GET ALL USERS (For testing)
        if (path === '/users' && method === 'GET') {
            const usersWithoutPasswords = users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    count: users.length,
                    data: usersWithoutPasswords
                })
            };
        }

        // 404 - Route not found
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                error: `Endpoint ${path} not found`
            })
        };

    } catch (error) {
        console.error('Server error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};