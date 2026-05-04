// ========================================
// SERVICE LAYER — authService.js
// ========================================
// Responsible for all authentication-related business logic:
//   1. Finding a user record by email (username)
//   2. Comparing a submitted plaintext password against a bcrypt hash
//
// This layer has NO knowledge of HTTP, Express, req, or res.
// It simply receives data, processes it, and returns a result.
// ========================================

const fs     = require('fs');
const path   = require('path');
const bcrypt = require('bcrypt');

// Absolute path to the users data file
const USERS_PATH = path.join(__dirname, '..', 'users.json');

/**
 * findUserByEmail
 * ---------------
 * Reads users.json and returns the user object whose `username`
 * matches the provided email (case-insensitive).
 *
 * @param {string} email - The email address submitted by the client.
 * @returns {Object|null} The matching user object, or null if not found.
 */
function findUserByEmail(email) {
    const rawData = fs.readFileSync(USERS_PATH, 'utf-8');
    const users   = JSON.parse(rawData);

    // .find() returns the first match, or undefined if none
    const user = users.find(
        (u) => u.username.toLowerCase() === email.toLowerCase()
    );

    return user || null; // Return null instead of undefined for clarity
}

/**
 * verifyPassword
 * --------------
 * Uses bcrypt.compare() to safely check if the submitted plaintext
 * password matches the stored bcrypt hash. bcrypt internally handles
 * extracting the salt from the stored hash and re-hashing the input.
 *
 * SECURITY NOTE: bcrypt.compare() is timing-safe — it takes the same
 * amount of time regardless of how early a character mismatch occurs,
 * preventing timing-based attacks.
 *
 * @param {string} plaintextPassword - The raw password from the login form.
 * @param {string} hashedPassword    - The bcrypt hash stored in users.json.
 * @returns {Promise<boolean>}       - Resolves to true if passwords match.
 */
async function verifyPassword(plaintextPassword, hashedPassword) {
    return bcrypt.compare(plaintextPassword, hashedPassword);
}

// Export the functions so the Controller can use them
module.exports = {
    findUserByEmail,
    verifyPassword,
};
