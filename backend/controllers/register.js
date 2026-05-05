// ========================================
// CONTROLLER LAYER — register.js
// ========================================
// Handles HTTP lifecycle for user registration:
//   1. Validate input fields
//   2. Check duplicate email in auth_user.json
//   3. Hash password with bcrypt
//   4. Save new user record
// ========================================

const bcrypt = require('bcrypt');
const registerService = require('../services/registerService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

/**
 * register — Controller for POST /api/auth/register
 *
 * Body expected: { name: string, email: string, password: string }
 */
async function register(req, res) {
    const { name, email, password } = req.body || {};
    const errors = {};

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.name = 'Name is required.';
    }

    // Validate email format
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        errors.email = 'A valid email address is required.';
    }

    // Validate password rules: 8+ chars, 1 uppercase, 1 special
    if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
        errors.password = 'Password must be 8+ chars with 1 uppercase and 1 special (!@#$%^&*).';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Registration validation failed. Please fix the errors and try again.',
            errors,
        });
    }

    try {
        // Check if the email already exists in auth_user.json
        const existing = registerService.findUserByEmail(email.trim());
        if (existing) {
            return res.status(400).json({
                error: 'Duplicate Email',
                message: 'This email is already registered.',
                errors: { email: 'Email already exists.' },
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            username: email.trim(),
            password: hashedPassword,
            firstName: name.trim(),
            registeredAt: new Date().toISOString(),
        };

        const savedUser = registerService.saveUser(user);

        return res.status(201).json({
            message: `Registration successful. Welcome, ${savedUser.firstName}!`,
            user: {
                id: savedUser.id,
                email: savedUser.username,
                firstName: savedUser.firstName,
            },
        });
    } catch (error) {
        console.error('Error in register controller:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
}

module.exports = { register };
