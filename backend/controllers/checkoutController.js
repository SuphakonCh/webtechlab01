// ========================================
// CONTROLLER LAYER — checkoutController.js
// ========================================
// Orchestrates the full checkout flow:
//   1. Validate cart items
//   2. Validate email (regex)
//   3. Validate 16-digit card number (regex)
//   4. Calculate order total
//   5. Attempt to save the order (wrapped in try...catch)
//
// KEY DESIGN RULE — Cart Preservation:
//   Any 400 response (validation OR save failure) deliberately does NOT
//   instruct the frontend to clear the cart. The frontend must only clear
//   the cart when it receives a 201 success response.
// ========================================

const checkoutService = require('../services/checkoutService');

// -------------------------------------------------------
// Regex constants (module-level, compiled once)
// -------------------------------------------------------

/** Matches basic email format: local@domain.tld */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Matches exactly 16 consecutive digits (spaces/dashes stripped before test) */
const CARD_REGEX = /^\d{16}$/;

/**
 * checkout — Handler for POST /api/checkout
 *
 * Body expected: { cartItems: Array, email: string, cardNumber: string }
 *
 * Success response  → 201 { message, orderId, total }
 * Validation error  → 400 { error, message, errors: { <fieldName>: string } }
 * Save failure      → 400 { error, message, errors: { saveOrder: string } }
 *
 * In all 400 cases the frontend MUST NOT clear the user's cart.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
function checkout(req, res) {
    // Destructure with a safe default so missing body never throws
    const { cartItems, email, cardNumber } = req.body || {};

    // Accumulate every broken field under its own named key
    const errors = {};

    // -------------------------------------------------------
    // STEP 1 — Validate cart items
    // -------------------------------------------------------
    // Rule: must be a non-empty array; every item needs a non-empty
    // name string, a non-negative finite price, and a positive integer quantity.
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        errors.cartItems = 'Cart must contain at least one item.';
    } else {
        const hasInvalidItem = cartItems.some((item) => {
            if (!item || typeof item !== 'object')                                        return true;
            if (typeof item.name !== 'string' || item.name.trim() === '')                return true;
            if (typeof item.price !== 'number' || !Number.isFinite(item.price)
                || item.price < 0)                                                        return true;
            if (!Number.isInteger(item.quantity) || item.quantity <= 0)                  return true;
            return false;
        });

        if (hasInvalidItem) {
            errors.cartItems =
                'Each cart item must have a valid name (string), price (number ≥ 0), and quantity (integer > 0).';
        }
    }

    // -------------------------------------------------------
    // STEP 2 — Validate email with regex
    // -------------------------------------------------------
    // EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        errors.email = 'A valid email address is required (e.g. user@example.com).';
    }

    // -------------------------------------------------------
    // STEP 3 — Validate 16-digit card number with regex
    // -------------------------------------------------------
    // Strip spaces and dashes first so that formatted inputs like
    // "1234 5678 9012 3456" or "1234-5678-9012-3456" are accepted.
    // CARD_REGEX: /^\d{16}$/
    const normalizedCard = String(cardNumber ?? '').replace(/[\s-]/g, '');
    if (!CARD_REGEX.test(normalizedCard)) {
        errors.cardNumber = 'A valid 16-digit card number is required.';
    }

    // -------------------------------------------------------
    // STEP 4 — Return all validation errors (cart stays intact)
    // -------------------------------------------------------
    // If ANY field failed, respond 400 immediately with the full errors map.
    // The frontend reads this response and shows per-field messages WITHOUT
    // clearing the cart, so the user can correct and resubmit.
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Checkout validation failed. Please fix the errors and try again.',
            errors, // e.g. { cartItems: '...', email: '...', cardNumber: '...' }
        });
    }

    // -------------------------------------------------------
    // STEP 5 — Calculate order total
    // -------------------------------------------------------
    // Computed here (outside try) so it is available in any future catch branch.
    const total = checkoutService.calculateTotal(cartItems);

    const order = {
        email:       email.trim(),
        cartItems,
        total,
        cardLast4:   normalizedCard.slice(-4), // store only the last 4 digits
    };

    // -------------------------------------------------------
    // STEP 6 — Attempt to save order (try...catch)
    // -------------------------------------------------------
    // The try block is scoped ONLY to the save step. If the write fails
    // (disk I/O error, corrupt JSON, etc.) we surface a specific saveOrder
    // error and respond 400 — again WITHOUT clearing the cart.
    try {
        const savedOrder = checkoutService.saveOrder(order);

        // SUCCESS — only on 201 should the frontend clear the cart
        return res.status(201).json({
            message: 'Order placed successfully.',
            orderId: savedOrder.id,
            total:   savedOrder.total,
        });

    } catch (err) {
        // Log the internal error for server-side debugging
        console.error('[checkoutController] saveOrder failed:', err.message);

        // Respond with a specific saveOrder field error.
        // 400 tells the frontend the cart must NOT be cleared.
        return res.status(400).json({
            error: 'Save Error',
            message: 'Your order could not be saved. Your cart has been kept intact.',
            errors: {
                saveOrder: err.message || 'Failed to save order. Please try again.',
            },
        });
    }
}

module.exports = { checkout };
