// ========================================
// SERVICE LAYER — checkoutService.js
// ========================================
// รับผิดชอบ business logic ของการ Checkout:
//   1. ตรวจสอบสินค้า + แทนที่ราคาจาก server (ป้องกัน Price Manipulation)
//   2. เช็ค stock ก่อนสั่งซื้อ
//   3. คำนวณยอดรวม (calculateTotal)
//   4. บันทึก order (ผ่าน Repository)
//
// หลังปรับปรุง (Task 3 + 4):
//   เพิ่ม validateAndEnrichCartItems() ที่:
//   - ดึงราคาจริงจาก productService (ไม่เชื่อ client)
//   - เช็ค stock ก่อนยอมให้สั่ง
//   - Return สินค้าที่ verified แล้วพร้อมราคาจริง
//
// Error contract:
//   ถ้า Repository throw Error → Service ส่งต่อให้ Controller จัดการ
// ========================================

const orderRepository = require('../repositories/orderRepository');
const productService  = require('./productService');

/**
 * validateAndEnrichCartItems — ตรวจสอบสินค้าในตะกร้ากับข้อมูล server
 *
 * สิ่งที่ทำ:
 *   1. ตรวจว่า product ID มีจริงใน products.json
 *   2. แทนที่ราคาจาก client ด้วยราคาจริงจาก server (ป้องกัน Price Manipulation)
 *   3. เช็คว่า stock เพียงพอต่อจำนวนที่สั่ง
 *
 * @param {Array} cartItems - สินค้าจาก client (req.body.cartItems)
 * @returns {{ validatedItems: Array, errors: Array }}
 *   - validatedItems: สินค้าที่ตรวจสอบแล้ว พร้อมราคาจริงจาก server
 *   - errors: array ของ error messages (ถ้ามี)
 */
function validateAndEnrichCartItems(cartItems) {
    const validatedItems = [];
    const errors = [];

    for (const item of cartItems) {
        // ❶ ตรวจว่าสินค้ามีจริงหรือไม่
        const product = productService.getProductById(item.id);

        if (!product) {
            // SECURITY: Only echo the ID (server-controlled), not item.name (client-controlled)
            errors.push(`สินค้า ID ${item.id} ไม่มีในระบบ`);
            continue;
        }

        // ❷ เช็ค stock — สินค้าในคลังเพียงพอไหม
        if (typeof product.stock === 'number' && product.stock < item.quantity) {
            errors.push(
                `"${product.name}" มีในคลังแค่ ${product.stock} ${product.unit || 'ชิ้น'} `
                + `แต่สั่ง ${item.quantity}`
            );
            continue;
        }

        // ❸ ใช้ราคาจาก server แทนราคาจาก client (ป้องกัน Price Manipulation)
        validatedItems.push({
            ...item,
            price: product.price,       // ← ราคาจริงจาก products.json
            serverVerified: true,       // flag ว่าผ่านการตรวจสอบแล้ว
        });
    }

    return { validatedItems, errors };
}

/**
 * calculateTotal — คำนวณยอดรวมของสินค้าในตะกร้า
 *
 * @param {Array} cartItems - Array ของสินค้าที่มี price และ quantity
 * @returns {number} ยอดรวมทั้งหมด
 */
function calculateTotal(cartItems) {
    return cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
}

/**
 * saveOrder — บันทึก order ลง JSON file (ผ่าน Repository)
 *
 * @param {Object} order - Order object ที่ต้องการบันทึก
 * @returns {Object} Order ที่บันทึกแล้ว
 */
function saveOrder(order) {
    return orderRepository.saveToFile(order);
}

/**
 * saveOrderToDb — บันทึก order ลง SQLite พร้อม atomic stock decrement
 *
 * ใช้ Transaction เพื่อป้องกัน Race Condition (TOCTOU):
 *   1. UPDATE stock SET stock = stock - qty WHERE stock >= qty
 *   2. INSERT INTO orders
 *   ถ้า stock ไม่พอ → ROLLBACK → reject
 *
 * @param {Object} orderRow - { userId, productId, quantity, totalPrice }
 * @returns {Promise<Object>} Order ที่บันทึกแล้ว
 */
function saveOrderToDb(orderRow) {
    return orderRepository.saveToDbWithStockCheck(orderRow);
}

module.exports = {
    validateAndEnrichCartItems,
    calculateTotal,
    saveOrder,
    saveOrderToDb,
};
