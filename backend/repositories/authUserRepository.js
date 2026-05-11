// ========================================
// REPOSITORY LAYER — authUserRepository.js
// ========================================
// รับผิดชอบเฉพาะการ "อ่าน/เขียน" ข้อมูลผู้ใช้จาก auth_user.json
// ใช้สำหรับระบบ Registration
//
// ทำไมต้องแยกจาก userRepository?
//   - Login อ่านจาก users.json (ข้อมูล seed)
//   - Register อ่าน/เขียน auth_user.json (ข้อมูลสมัครใหม่)
//   - แต่ละ Repository ดูแล data source ของตัวเอง
// ========================================

const fs   = require('fs');
const path = require('path');

// Absolute path to the auth_user data file (สำหรับ Register)
const AUTH_USERS_PATH = path.join(__dirname, '..', 'auth_user.json');

// -------------------------------------------------------
// IN-MEMORY CACHE — invalidated on save()
// -------------------------------------------------------
let cachedAuthUsers = null;

/**
 * findAll — อ่าน auth users ทั้งหมดจาก auth_user.json (จาก cache)
 *
 * @returns {Array} Array ของ user objects
 */
function findAll() {
    if (!cachedAuthUsers) {
        const raw = fs.readFileSync(AUTH_USERS_PATH, 'utf-8');
        const users = JSON.parse(raw);
        cachedAuthUsers = Array.isArray(users) ? users : [];
        console.log(`[AuthUserRepo] Loaded ${cachedAuthUsers.length} auth users into cache`);
    }
    return cachedAuthUsers;
}

/**
 * findByEmail — ค้นหา user ตาม email (case-insensitive)
 *
 * @param {string} email - Email ที่ต้องการค้นหา
 * @returns {Object|null} User object หรือ null ถ้าไม่เจอ
 */
function findByEmail(email) {
    const users = findAll();
    const lowered = email.toLowerCase();
    const user = users.find((u) => String(u.username || '').toLowerCase() === lowered);
    return user || null;
}

/**
 * getNextId — คำนวณ ID ถัดไปจาก users ที่มีอยู่
 *
 * @returns {number} ID ถัดไป
 */
function getNextId() {
    const users = findAll();
    if (users.length === 0) return 1;
    const maxId = users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
    return maxId + 1;
}

/**
 * save — บันทึก user ใหม่ลง auth_user.json
 *
 * @param {Object} newUser - User object ที่ต้องการบันทึก
 * @returns {Object} User object ที่บันทึกแล้ว (พร้อม id)
 */
function save(newUser) {
    const users = findAll();
    const nextId = getNextId();

    const userToSave = {
        id: nextId,
        username: newUser.username,
        password: newUser.password,
        firstName: newUser.firstName,
        registeredAt: newUser.registeredAt,
    };

    users.push(userToSave);
    fs.writeFileSync(AUTH_USERS_PATH, JSON.stringify(users, null, 2));

    // Invalidate cache after write so next read picks up the new user
    cachedAuthUsers = null;

    return userToSave;
}

module.exports = {
    findAll,
    findByEmail,
    getNextId,
    save,
};
