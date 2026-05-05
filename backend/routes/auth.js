// ========================================
// ROUTE LAYER — auth.js
// ========================================
// Defines the URL endpoint for authentication and maps it
// to the correct controller handler.
//
// Mounted at /api/auth in server.js, so the full path is:
//   POST http://localhost:3000/api/auth/login
// ========================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const registerController = require('../controllers/register');

// -------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------
// Accepts: { "email": "...", "password": "..." } as JSON body
// Returns:
//   200 OK   → { message, token, user }
//   400      → Missing fields
//   401      → Wrong email or password
//   500      → Server error
// -------------------------------------------------------
router.post('/login', authController.login);

// -------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------
// Accepts: { "name": "...", "email": "...", "password": "..." } as JSON body
// Returns:
//   201 Created → { message, user }
//   400         → Validation or duplicate email
//   500         → Server error
// -------------------------------------------------------
router.post('/register', registerController.register);

module.exports = router;
