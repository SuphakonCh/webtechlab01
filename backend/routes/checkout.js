// ========================================
// ROUTE LAYER — checkout.js
// ========================================
// Defines the URL endpoint for checkout and maps it
// to the correct controller handler.
//
// Mounted at /api/checkout in server.js, so the full path is:
//   POST http://localhost:3000/api/checkout
//
// 🔒 PROTECTED ROUTE:
//   ต้องส่ง JWT Token ใน Authorization header
//   Header: "Authorization: Bearer <token>"
//   ถ้าไม่มี token → 401 Unauthorized
// ========================================

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const checkoutController = require('../controllers/checkoutController');

// -------------------------------------------------------
// POST /api/checkout (Protected — ต้อง Login ก่อน)
// -------------------------------------------------------
// Header:  Authorization: Bearer <JWT token>
// Accepts: { cartItems, email, cardNumber }
// Returns:
//   201 OK  → { message, orderId, total }
//   400     → Validation errors or save failure
//   401     → Unauthorized (ไม่มี token / token หมดอายุ)
// -------------------------------------------------------
router.post('/', verifyToken, checkoutController.checkout);

module.exports = router;
