// ========================================
// ROUTE LAYER — products.js
// ========================================
// The Route layer defines the URL endpoints and maps them
// to the correct Controller function.
//
// This file creates an Express Router, which is a mini "sub-application"
// that only handles routes starting with /api/products (set in server.js).
//
// The Route does NOT contain any business logic or data access.
// It simply says: "When someone visits THIS URL, call THIS controller."
// ========================================

const express = require('express');
const router = express.Router();

// Import the controller that contains the handler functions
const productController = require('../controllers/productController');

// -------------------------------------------------------
// GET /api/products
// -------------------------------------------------------
// When a client sends a GET request to /api/products,
// the router calls productController.getAll to handle it.
//
// Example: http://localhost:3000/api/products
// Example (with filter): http://localhost:3000/api/products?category=Fruits
// Response: JSON array of all products (or filtered products) from products.json
// -------------------------------------------------------
router.get('/', productController.getAll);

// -------------------------------------------------------
// GET /api/products/:id
// -------------------------------------------------------
// When a client sends a GET request to /api/products/5,
// the router calls productController.getById.
// The ":id" is a URL parameter that Express extracts automatically.
//
// Example: http://localhost:3000/api/products/5
// Response: JSON object of the product with id=5
// -------------------------------------------------------
router.get('/:id', productController.getById);

// Export the router so server.js can mount it
module.exports = router;
