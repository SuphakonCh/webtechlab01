// ========================================
// SERVICE LAYER — checkoutService.js
// ========================================
// Handles order total calculation and persistence.
//
// Error contract:
//   Any function here that fails THROWS an Error with a descriptive
//   .message string. The controller layer catches these and surfaces
//   them as specific per-field error responses.
// ========================================

const fs   = require('fs');
const path = require('path');
const db   = require('../db');

const ORDERS_PATH = path.join(__dirname, '..', 'orders.json');

const INSERT_ORDER_SQL = `
    INSERT INTO orders (user_id, product_id, quantity, total_price)
    VALUES (?, ?, ?, ?)
`;

/**
 * calculateTotal — Computes the total price for the cart.
 *
 * @param {Array} cartItems - Array of cart items with price and quantity.
 * @returns {number} The total price.
 */
function calculateTotal(cartItems) {
    return cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
}

/**
 * saveOrder — Writes the order to orders.json and returns the saved order.
 *
 * @param {Object} order - The order object to save.
 * @returns {Object} The saved order with id and createdAt.
 */
function saveOrder(order) {
    // readOrders() will throw if the existing file is corrupt
    const existingOrders = readOrders();

    const savedOrder = {
        id:        generateOrderId(existingOrders),
        createdAt: new Date().toISOString(),
        ...order,
    };

    existingOrders.push(savedOrder);

    try {
        fs.writeFileSync(ORDERS_PATH, JSON.stringify(existingOrders, null, 2), 'utf-8');
    } catch (fsErr) {
        // Re-throw with a human-readable message the controller can forward
        throw new Error(`Could not write to orders file: ${fsErr.message}`);
    }

    return savedOrder;
}

/**
 * saveOrderToDb — Inserts a single order row into SQLite and returns the saved order.
 *
 * @param {Object} orderRow - { userId, productId, quantity, totalPrice }
 * @returns {Promise<Object>} The saved order with the new row id.
 */
function saveOrderToDb(orderRow) {
    return new Promise((resolve, reject) => {
        const { userId, productId, quantity, totalPrice } = orderRow;

        db.run(INSERT_ORDER_SQL, [userId, productId, quantity, totalPrice], function (err) {
            if (err) {
                return reject(new Error(`SQLite insert failed: ${err.message}`));
            }

            resolve({ id: this.lastID, ...orderRow });
        });
    });
}

function readOrders() {
    if (!fs.existsSync(ORDERS_PATH)) {
        return [];
    }

    const rawData = fs.readFileSync(ORDERS_PATH, 'utf-8');
    if (!rawData || rawData.trim() === '') return [];

    try {
        return JSON.parse(rawData);
    } catch (parseErr) {
        // Throw a descriptive error so saveOrder (and the controller) know exactly what failed
        throw new Error('orders.json contains invalid JSON and could not be read.');
    }
}

function generateOrderId(existingOrders) {
    if (existingOrders.length === 0) return 1;
    const maxId = existingOrders.reduce((max, order) => {
        return order.id > max ? order.id : max;
    }, 0);
    return maxId + 1;
}

module.exports = {
    calculateTotal,
    saveOrder,
    saveOrderToDb,
};
