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

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// -------------------------------------------------------
// MIDDLEWARE
// -------------------------------------------------------

// Parse incoming JSON request bodies (for POST/PUT requests in the future)
app.use(express.json());

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

// Mount the auth route at the /api/auth path
// POST /api/auth/login handles user login and JWT issuance
app.use('/api/auth', authRoute);

// Mount the checkout route at the /api/checkout path
// POST /api/checkout handles checkout validation and order saving
app.use('/api/checkout', checkoutRoute);

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------

app.listen(port, () => {
    console.log(`===================================`);
    console.log(`  Fruitables Backend Server`);
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
