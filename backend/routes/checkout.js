// ========================================
// ROUTE LAYER — checkout.js
// ========================================
// Defines the URL endpoint for checkout and maps it
// to the correct controller handler.
//
// Mounted at /api/checkout in server.js, so the full path is:
//   POST http://localhost:3000/api/checkout
// ========================================

const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// -------------------------------------------------------
// POST /api/checkout
// -------------------------------------------------------
// Accepts: { cartItems, email, cardNumber }
// Returns:
//   201 OK  → { message, orderId, total }
//   400     → Validation errors or save failure
// -------------------------------------------------------
router.post('/', checkoutController.checkout);

module.exports = router;
