// ========================================
// SERVICE LAYER — registerService.js
// ========================================
// รับผิดชอบ business logic ของการลงทะเบียนผู้ใช้ใหม่:
//   1. ตรวจสอบว่า email ซ้ำหรือไม่ (ผ่าน Repository)
//   2. บันทึก user ใหม่ (ผ่าน Repository)
//
// ก่อนปรับปรุง (Monolithic):
//   Service อ่าน/เขียน auth_user.json เอง
//   → มี fs.readFileSync, fs.writeFileSync อยู่ใน Service
//
// หลังปรับปรุง (Repository Pattern):
//   Service เรียก authUserRepository.findByEmail() และ .save()
//   → Service เหลือแค่ business logic ล้วน ๆ
// ========================================

const authUserRepository = require('../repositories/authUserRepository');

/**
 * findUserByEmail — ค้นหา user ตาม email (ผ่าน Repository)
 *
 * @param {string} email - Email ที่ต้องการค้นหา
 * @returns {Object|null} User object หรือ null
 */
function findUserByEmail(email) {
    return authUserRepository.findByEmail(email);
}

/**
 * saveUser — บันทึก user ใหม่ (ผ่าน Repository)
 *
 * @param {Object} newUser - User object ที่ต้องการบันทึก
 * @returns {Object} User object ที่บันทึกแล้ว (พร้อม id)
 */
function saveUser(newUser) {
    return authUserRepository.save(newUser);
}

module.exports = {
    findUserByEmail,
    saveUser,
};
