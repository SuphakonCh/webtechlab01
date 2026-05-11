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

// SQL statement สำหรับ atomic stock decrement
// WHERE stock >= ? ทำให้ UPDATE สำเร็จเฉพาะเมื่อ stock เพียงพอ
// ถ้า stock ไม่พอ → this.changes === 0 → ROLLBACK
const DECREMENT_STOCK_SQL = `
    UPDATE product_stock SET stock = stock - ?
    WHERE product_id = ? AND stock >= ?
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
 * saveToDb — Insert 1 row ลง SQLite orders table (without stock check)
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

/**
 * saveToDbWithStockCheck — Atomic stock decrement + order insert
 *
 * ป้องกัน Race Condition (TOCTOU) ด้วย SQLite Transaction:
 *   1. BEGIN TRANSACTION
 *   2. UPDATE product_stock SET stock = stock - qty WHERE stock >= qty
 *      → ถ้า this.changes === 0 → stock ไม่พอ → ROLLBACK
 *   3. INSERT INTO orders
 *   4. COMMIT
 *
 * เนื่องจาก UPDATE ... WHERE stock >= ? เป็น atomic operation
 * ไม่มีทาง 2 requests จะ "ชนะ" stock ชุดเดียวกันได้
 *
 * @param {Object} orderRow - { userId, productId, quantity, totalPrice }
 * @returns {Promise<Object>} Order ที่บันทึกแล้ว (พร้อม lastID)
 */
function saveToDbWithStockCheck(orderRow) {
    const { userId, productId, quantity, totalPrice } = orderRow;

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Step 1: Atomic stock decrement
            // WHERE stock >= ? guarantees no overselling
            db.run(
                DECREMENT_STOCK_SQL,
                [quantity, productId, quantity],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(new Error(
                            `Stock update failed for product ${productId}`
                        ));
                    }

                    // this.changes === 0 means stock < quantity requested
                    if (this.changes === 0) {
                        db.run('ROLLBACK');
                        return reject(new Error(
                            `สินค้า ID ${productId} มี stock ไม่เพียงพอ`
                        ));
                    }

                    // Step 2: Insert the order row
                    db.run(
                        INSERT_ORDER_SQL,
                        [userId, productId, quantity, totalPrice],
                        function (err2) {
                            if (err2) {
                                db.run('ROLLBACK');
                                return reject(new Error(
                                    `Order insert failed for product ${productId}`
                                ));
                            }

                            // Both operations succeeded — commit
                            db.run('COMMIT');
                            resolve({ id: this.lastID, ...orderRow });
                        }
                    );
                }
            );
        });
    });
}

module.exports = {
    readAllFromFile,
    saveToFile,
    saveToDb,
    saveToDbWithStockCheck,
};
