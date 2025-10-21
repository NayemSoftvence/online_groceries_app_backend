// netlify/functions/api.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let users = [];
let userIdCounter = 1;

exports.handler = async (event, context) => {
    console.log('API Function called:', event.path, event.httpMethod);
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // CORRECTED: Extract the path properly
    let routePath = event.path;
    console.log('Raw path:', routePath);
    
    // Remove the function path prefix if present
    if (routePath.startsWith('/.netlify/functions/api')) {
        routePath = routePath.replace('/.netlify/functions/api', '');
    }
    
    // If routePath is empty, it means we're at the root of the function
    if (routePath === '') {
        routePath = '/';
    }
    
    console.log('Processed route path:', routePath);

    try {
        // HEALTH CHECK - Handle both /api/health and /health
        if ((routePath === '/health' || routePath === '/api/health') && event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'API is healthy!',
                    timestamp: new Date().toISOString(),
                    debug: {
                        receivedPath: event.path,
                        processedPath: routePath
                    }
                })
            };
        }

        // REGISTER - Handle /api/auth/register
        if ((routePath === '/auth/register' || routePath === '/api/auth/register') && event.httpMethod === 'POST') {
            const { name, email, password } = JSON.parse(event.body);

            if (!name || !email || !password) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'All fields are required'
                    })
                };
            }

            // Check if user exists
            if (users.find(user => user.email === email)) {
                return {
                    statusCode: 409,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'User already exists'
                    })
                };
            }

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = {
                id: userIdCounter++,
                name,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };
            users.push(newUser);

            // Generate token
            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                process.env.JWT_SECRET || 'dev-secret',
                { expiresIn: '24h' }
            );

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'User registered successfully',
                    data: {
                        user: {
                            id: newUser.id,
                            name: newUser.name,
                            email: newUser.email,
                            createdAt: newUser.createdAt
                        },
                        token
                    }
                })
            };
        }

        // LOGIN - Handle /api/auth/login
        if ((routePath === '/auth/login' || routePath === '/api/auth/login') && event.httpMethod === 'POST') {
            const { email, password } = JSON.parse(event.body);

            const user = users.find(u => u.email === email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid credentials'
                    })
                };
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'dev-secret',
                { expiresIn: '24h' }
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            createdAt: user.createdAt
                        },
                        token
                    }
                })
            };
        }

        // GET USERS - Handle /api/auth/users
        if ((routePath === '/auth/users' || routePath === '/api/auth/users') && event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: users.map(u => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        createdAt: u.createdAt
                    }))
                })
            };
        }

        // ROOT ENDPOINT - Handle when no specific path is given
        if (routePath === '/' && event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Online Groceries API',
                    endpoints: [
                        'GET /api/health',
                        'POST /api/auth/register', 
                        'POST /api/auth/login',
                        'GET /api/auth/users'
                    ]
                })
            };
        }

        // 404 - Not found
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                error: `Route ${event.path} not found`,
                availableRoutes: [
                    'GET /api/health',
                    'POST /api/auth/register',
                    'POST /api/auth/login', 
                    'GET /api/auth/users'
                ]
            })
        };

    } catch (error) {
        console.error('Error:', error);
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