// ========================================
// REPOSITORY LAYER — userRepository.js
// ========================================
// รับผิดชอบเฉพาะการ "อ่าน/เขียน" ข้อมูลผู้ใช้จาก Data Source (users.json)
// Repository ไม่รู้เรื่อง business logic, HTTP, หรือ bcrypt
//
// ทำไมต้องแยก?
//   - ถ้าเปลี่ยนจาก JSON → SQLite/MySQL ในอนาคต แก้แค่ไฟล์นี้
//   - Service layer ไม่ต้องรู้ว่าข้อมูลเก็บอยู่ที่ไหน
//   - Unit Test ง่ายขึ้น — mock repository แทนการอ่าน file จริง
// ========================================

const fs   = require('fs');
const path = require('path');

// Absolute path to the users data file (สำหรับ Login)
const USERS_PATH = path.join(__dirname, '..', 'users.json');

/**
 * findAll — อ่าน users ทั้งหมดจาก users.json
 *
 * @returns {Array} Array ของ user objects
 */
function findAll() {
    const rawData = fs.readFileSync(USERS_PATH, 'utf-8');
    return JSON.parse(rawData);
}

/**
 * findByEmail — ค้นหา user ตาม email (case-insensitive)
 *
 * @param {string} email - Email ที่ต้องการค้นหา
 * @returns {Object|null} User object หรือ null ถ้าไม่เจอ
 */
function findByEmail(email) {
    const users = findAll();
    const user = users.find(
        (u) => u.username.toLowerCase() === email.toLowerCase()
    );
    return user || null;
}

module.exports = {
    findAll,
    findByEmail,
};
