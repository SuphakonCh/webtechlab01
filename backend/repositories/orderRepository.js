// ========================================
// REPOSITORY LAYER — orderRepository.js
// ========================================
// รับผิดชอบเฉพาะการ "อ่าน/เขียน" ข้อมูลคำสั่งซื้อ (Orders)
// รองรับทั้ง 2 แหล่งข้อมูล:
//   1. orders.json (flat file)
//   2. SQLite database (store.db)
//
// ทำไมต้องแยก?
//   - Service ไม่ต้องรู้ว่า SQL query เขียนยังไง
//   - ถ้าเปลี่ยนจาก SQLite → PostgreSQL แก้แค่ไฟล์นี้
//   - ทำให้ checkoutService สะอาด — มีแต่ business logic
// ========================================

const fs   = require('fs');
const path = require('path');
const db   = require('../db');

const ORDERS_PATH = path.join(__dirname, '..', 'orders.json');

// SQL statement สำหรับ insert order ลง SQLite
const INSERT_ORDER_SQL = `
    INSERT INTO orders (user_id, product_id, quantity, total_price)
    VALUES (?, ?, ?, ?)
`;

// -------------------------------------------------------
// JSON File Operations
// -------------------------------------------------------

/**
 * readAllFromFile — อ่าน orders ทั้งหมดจาก orders.json
 *
 * @returns {Array} Array ของ order objects
 * @throws {Error} ถ้า JSON ไม่ถูกต้อง
 */
function readAllFromFile() {
    if (!fs.existsSync(ORDERS_PATH)) {
        return [];
    }

    const rawData = fs.readFileSync(ORDERS_PATH, 'utf-8');
    if (!rawData || rawData.trim() === '') return [];

    try {
        return JSON.parse(rawData);
    } catch (parseErr) {
        throw new Error('orders.json contains invalid JSON and could not be read.');
    }
}

/**
 * saveToFile — บันทึก order ลง orders.json
 *
 * @param {Object} order - Order object ที่ต้องการบันทึก
 * @returns {Object} Order ที่บันทึกแล้ว (พร้อม id และ createdAt)
 */
function saveToFile(order) {
    const existingOrders = readAllFromFile();

    const savedOrder = {
        id:        generateOrderId(existingOrders),
        createdAt: new Date().toISOString(),
        ...order,
    };

    existingOrders.push(savedOrder);

    try {
        fs.writeFileSync(ORDERS_PATH, JSON.stringify(existingOrders, null, 2), 'utf-8');
    } catch (fsErr) {
        throw new Error(`Could not write to orders file: ${fsErr.message}`);
    }

    return savedOrder;
}

/**
 * generateOrderId — สร้าง Order ID ถัดไป
 * @private
 */
function generateOrderId(existingOrders) {
    if (existingOrders.length === 0) return 1;
    const maxId = existingOrders.reduce((max, order) => {
        return order.id > max ? order.id : max;
    }, 0);
    return maxId + 1;
}

// -------------------------------------------------------
// SQLite Database Operations
// -------------------------------------------------------

/**
 * saveToDb — Insert 1 row ลง SQLite orders table
 *
 * @param {Object} orderRow - { userId, productId, quantity, totalPrice }
 * @returns {Promise<Object>} Order ที่บันทึกแล้ว (พร้อม lastID)
 */
function saveToDb(orderRow) {
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

module.exports = {
    readAllFromFile,
    saveToFile,
    saveToDb,
};
