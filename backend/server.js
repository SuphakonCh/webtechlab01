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
// Architecture overview (Controller-Route-Service pattern):
//
//   Client Request
//       ↓
//   server.js (entry point)
//       ↓
//   routes/products.js (defines URL paths)
//       ↓
//   controllers/productController.js (handles req/res)
//       ↓
//   services/productService.js (business logic + data access)
//       ↓
//   products.json (data source)
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

// -------------------------------------------------------
// ROUTES
// -------------------------------------------------------

// Import the products route module
const productsRoute = require('./routes/products');

// Mount the products route at the /api/products path
// Any request to /api/products/* will be handled by the products router
app.use('/api/products', productsRoute);

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------

app.listen(port, () => {
    console.log(`===================================`);
    console.log(`  Fruitables Backend Server`);
    console.log(`  Running at: http://localhost:${port}`);
    console.log(`===================================`);
    console.log(`  API Endpoints:`);
    console.log(`  GET /api/products      → All products`);
    console.log(`  GET /api/products/:id   → Single product`);
    console.log(`===================================`);
});
    