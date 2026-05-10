// ========================================
// MIDDLEWARE — authMiddleware.js
// ========================================
// ตรวจสอบ JWT Token จาก Authorization header
//
// Flow:
//   1. อ่าน header "Authorization: Bearer <token>"
//   2. ถ้าไม่มี token → 401 Unauthorized
//   3. ถ้า token หมดอายุ/ไม่ถูกต้อง → 401 Unauthorized
//   4. ถ้า token ถูกต้อง → ใส่ข้อมูล user ลง req.user แล้ว next()
//
// หลัง middleware ทำงานเสร็จ Controller สามารถเข้าถึง:
//   req.user.id        — User ID
//   req.user.email     — Email ของ user
//   req.user.firstName — ชื่อ user
// ========================================

const jwt = require('jsonwebtoken');

// ใช้ secret เดียวกับ authController.js เพื่อ verify token ที่ sign ไว้ตอน login
const JWT_SECRET = process.env.JWT_SECRET
    || 'fruitables_super_secret_key_change_in_production';

/**
 * verifyToken — Express middleware สำหรับตรวจสอบ JWT
 *
 * ถ้า token ถูกต้อง จะใส่ decoded payload ลง req.user
 * แล้วเรียก next() เพื่อไปต่อที่ Controller
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verifyToken(req, res, next) {
    // อ่าน header: "Authorization: Bearer eyJhbGciOi..."
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // ตัด "Bearer " ออก

    // ❶ ไม่มี token → ยังไม่ได้ login
    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'กรุณา Login ก่อนทำรายการ Checkout',
        });
    }

    try {
        // ❷ jwt.verify() จะ throw ถ้า:
        //    - token ถูก tamper (signature ไม่ตรง)
        //    - token หมดอายุ (exp < now)
        //    - token format ผิด
        const decoded = jwt.verify(token, JWT_SECRET);

        // ❸ ใส่ข้อมูล user ลง req.user เพื่อให้ Controller ใช้ได้
        // decoded = { id, email, firstName, iat, exp }
        req.user = decoded;

        // ❹ ไปต่อที่ Controller
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Token ไม่ถูกต้องหรือหมดอายุ กรุณา Login ใหม่',
        });
    }
}

module.exports = { verifyToken };
