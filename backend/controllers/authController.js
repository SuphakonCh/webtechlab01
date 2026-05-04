// ========================================
// CONTROLLER LAYER — authController.js
// ========================================
// The Auth Controller handles the HTTP lifecycle of the login request.
// It acts as the "orchestrator":
//   1. Validates the incoming request body (Gatekeeper logic)
//   2. Delegates to authService for business logic
//   3. Signs a JWT on successful authentication
//   4. Sends the appropriate HTTP response (200, 400, 401, 500)
//
// SECURITY PRINCIPLE — Generic Error Messages:
//   We intentionally return the SAME 401 message whether the email
//   doesn't exist OR the password is wrong. This prevents "user
//   enumeration attacks" where an attacker could probe which emails
//   are registered in the system.
// ========================================

const jwt         = require('jsonwebtoken');
const authService = require('../services/authService');

// -------------------------------------------------------
// JWT SECRET KEY
// -------------------------------------------------------
// In production this MUST come from an environment variable (process.env.JWT_SECRET).
// Never hardcode secrets in source code that gets committed to version control.
// For this academic project we use a fallback default for convenience.
//
// To set it properly, create a .env file with:
//   JWT_SECRET=your_very_long_random_secret_here
//
// And load it with the 'dotenv' package in server.js.
// -------------------------------------------------------
const JWT_SECRET  = process.env.JWT_SECRET || 'fruitables_super_secret_key_change_in_production';
const JWT_EXPIRES = '2h'; // Token expires in 2 hours

/**
 * login — Controller for POST /api/login
 *
 * Receives { email, password } in the request body.
 * Returns a signed JWT on success, or a 401/400 error on failure.
 *
 * @param {Object} req - Express request object (req.body contains credentials)
 * @param {Object} res - Express response object
 */
async function login(req, res) {
    try {
        // -------------------------------------------------------
        // STEP 1 — GATEKEEPER: Validate the request body
        // -------------------------------------------------------
        // Destructure email and password from the JSON body.
        // The client must send Content-Type: application/json.
        const { email, password } = req.body;

        // Reject the request early if either field is missing or empty.
        if (!email || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Both email and password fields are required.',
            });
        }

        // -------------------------------------------------------
        // STEP 2 — USER LOOKUP: Does this email exist in the database?
        // -------------------------------------------------------
        const user = authService.findUserByEmail(email);

        // If the email is not found, return 401 (NOT 404 — see security note above).
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid email or password.',
            });
        }

        // -------------------------------------------------------
        // STEP 3 — PASSWORD VERIFICATION: Does the password match?
        // -------------------------------------------------------
        // bcrypt.compare() takes the plaintext input and the stored hash.
        // It extracts the salt from the hash, re-hashes the input, and compares.
        const isMatch = await authService.verifyPassword(password, user.password);

        if (!isMatch) {
            // Same generic message as a missing user — prevents enumeration attacks
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid email or password.',
            });
        }

        // -------------------------------------------------------
        // STEP 4 — SIGN JWT: Authentication successful!
        // -------------------------------------------------------
        // The JWT payload contains only the data the client legitimately needs.
        // NEVER include sensitive fields (full password hash, etc.) in the payload —
        // the payload is base64-encoded and readable by anyone who has the token.
        const payload = {
            id:        user.id,
            email:     user.username,
            firstName: user.firstName,
        };

        // jwt.sign(payload, secret, options) returns a signed token string.
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        // -------------------------------------------------------
        // STEP 5 — RESPOND: Return the token with 200 OK
        // -------------------------------------------------------
        return res.status(200).json({
            message: `Welcome back, ${user.firstName}!`,
            token,
            user: {
                id:        user.id,
                email:     user.username,
                firstName: user.firstName,
            },
        });

    } catch (error) {
        // Catch any unexpected server-side errors (e.g., file I/O failure)
        console.error('Error in login controller:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
}

// Export so the Route layer can use this handler
module.exports = { login };
