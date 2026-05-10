// ========================================
// SERVICE LAYER — authService.js
// ========================================
// รับผิดชอบ business logic ของการ Authentication:
//   1. ค้นหา user จาก email (ผ่าน Repository)
//   2. ตรวจสอบ password ด้วย bcrypt
//
// ก่อนปรับปรุง (Monolithic):
//   Service อ่าน fs.readFileSync('users.json') เอง
//   → ผูกติดกับ file system โดยตรง
//
// หลังปรับปรุง (Repository Pattern):
//   Service เรียก userRepository.findByEmail()
//   → ไม่รู้ว่าข้อมูลมาจาก JSON, SQLite, หรือ API
//
// Service นี้ไม่มี HTTP, req, res — มีแค่ pure logic
// ========================================

const bcrypt         = require('bcrypt');
const userRepository = require('../repositories/userRepository');

/**
 * findUserByEmail — ค้นหา user ตาม email
 * Delegate ไปที่ Repository layer
 *
 * @param {string} email - Email ที่ต้องการค้นหา
 * @returns {Object|null} User object หรือ null
 */
function findUserByEmail(email) {
    return userRepository.findByEmail(email);
}

/**
 * verifyPassword — ตรวจสอบ password ด้วย bcrypt.compare()
 *
 * SECURITY NOTE: bcrypt.compare() เป็น timing-safe
 * ใช้เวลาเท่ากันไม่ว่า password จะผิดตรงตัวอักษรไหน
 * ป้องกัน timing-based attacks
 *
 * @param {string} plaintextPassword - Password ที่ user กรอก
 * @param {string} hashedPassword    - bcrypt hash ที่เก็บใน database
 * @returns {Promise<boolean>}       - true ถ้า password ตรงกัน
 */
async function verifyPassword(plaintextPassword, hashedPassword) {
    return bcrypt.compare(plaintextPassword, hashedPassword);
}

// Export the functions so the Controller can use them
module.exports = {
    findUserByEmail,
    verifyPassword,
};
