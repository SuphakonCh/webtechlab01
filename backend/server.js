// ========================================
// SERVER ENTRY POINT — server.js
// ========================================
// This is the main file that starts the Express application.
// It wires together all the pieces:
//   1. Creates the Express app
//   2. Registers middleware (e.g., JSON parsing, CORS)
//   3. Mounts the route modules
//   4. Starts listening on a port
//
// Architecture overview (Controller-Route-Service-Repository pattern):
//
//   Client Request
//       ↓
//   server.js (entry point)
//       ↓
//   routes/*.js (defines URL paths — เส้นทาง)
//       ↓
//   controllers/*.js (handles req/res — Gatekeeper / Orchestrator)
//       ↓
//   services/*.js (business logic only — กฎเกณฑ์ทางธุรกิจ)
//       ↓
//   repositories/*.js (data access — อ่าน/เขียนข้อมูล)
//       ↓
//   Data Source (JSON files / SQLite / etc.)
//
// ========================================

// -------------------------------------------------------
// LOAD ENVIRONMENT VARIABLES (must be the FIRST thing!)
// -------------------------------------------------------
// dotenv reads backend/.env and injects values into process.env
// so that all subsequent require()'d modules can access them.
require('dotenv').config();

const express   = require('express');
const path      = require('path');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const app  = express();
const port = process.env.PORT || 3000;

// -------------------------------------------------------
// MIDDLEWARE
// -------------------------------------------------------

// Helmet — sets secure HTTP headers (X-Frame-Options, CSP, etc.)
// Disabled contentSecurityPolicy for static frontend that loads external libs
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// CORS — restrict which origins can call the API
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON request bodies — capped at 100KB to prevent payload attacks
app.use(express.json({ limit: '100kb' }));

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too Many Requests', message: 'กรุณารอสักครู่แล้วลองใหม่' },
});
app.use(globalLimiter);

// Strict rate limiter for auth routes: 10 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too Many Requests', message: 'Login ผิดเกิน 10 ครั้ง กรุณารอ 15 นาที' },
});

// Serve static files (HTML, CSS, JS, images) from the frontend folder
// This allows the frontend (index.html, etc.) to be accessed at http://localhost:3000/
app.use(express.static(path.join(__dirname, '../frontend')));

// -------------------------------------------------------
// ROUTES
// -------------------------------------------------------

// Import the products route module
const productsRoute = require('./routes/products');

// Import the auth route module
const authRoute = require('./routes/auth');

// Import the checkout route module
const checkoutRoute = require('./routes/checkout');

// Mount the products route at the /api/products path
// Any request to /api/products/* will be handled by the products router
app.use('/api/products', productsRoute);

// Mount the auth route at the /api/auth path (with strict rate limiting)
// POST /api/auth/login handles user login and JWT issuance
app.use('/api/auth', authLimiter, authRoute);

// Mount the checkout route at the /api/checkout path
// POST /api/checkout handles checkout validation and order saving
app.use('/api/checkout', checkoutRoute);

// -------------------------------------------------------
// 404 HANDLER — for unknown routes
// -------------------------------------------------------
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} does not exist.`,
    });
});

// -------------------------------------------------------
// GLOBAL ERROR HANDLER — catches all uncaught errors
// -------------------------------------------------------
// Express recognizes this as an error handler because it has 4 parameters
app.use((err, req, res, next) => {
    console.error('[GlobalErrorHandler]', err.stack);

    // Never expose stack traces in production
    const message = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message;

    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message,
    });
});

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------

const server = app.listen(port, () => {
    console.log(`===================================`);
    console.log(`  Fruitables Backend Server`);
    console.log(`  ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Running at: http://localhost:${port}`);
    console.log(`===================================`);
    console.log(`  API Endpoints:`);
    console.log(`  GET  /api/products       → All products`);
    console.log(`  GET  /api/products/:id   → Single product`);
    console.log(`  POST /api/auth/login     → Authenticate user + get JWT`);
    console.log(`  POST /api/auth/register  → Register new user`);
    console.log(`  POST /api/checkout       → Validate and save checkout`);
    console.log(`===================================`);
});

// -------------------------------------------------------
// GRACEFUL SHUTDOWN — close DB connections cleanly
// -------------------------------------------------------
const db = require('./db');

function gracefulShutdown(signal) {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed.');
        db.close((err) => {
            if (err) console.error('Error closing database:', err.message);
            else     console.log('Database connection closed.');
            process.exit(0);
        });
    });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
