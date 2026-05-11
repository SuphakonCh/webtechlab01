// ========================================
// REPOSITORY LAYER — productRepository.js
// ========================================
// รับผิดชอบเฉพาะการ "อ่าน/เขียน" ข้อมูลจาก Data Source (products.json)
// Repository ไม่รู้เรื่อง business logic ใด ๆ ทั้งสิ้น
// มันทำหน้าที่เหมือน "คนกลาง" ระหว่าง Service กับฐานข้อมูล
//
// ทำไมต้องแยก?
//   - ถ้าวันหนึ่งเปลี่ยนจาก JSON file → PostgreSQL หรือ MongoDB
//     เราแก้แค่ไฟล์นี้ไฟล์เดียว โดย Service ไม่ต้องแก้เลย
//   - ทำให้ Unit Test ง่ายขึ้น เพราะ mock ได้ที่ชั้น Repository
// ========================================

const fs   = require('fs');
const path = require('path');

// Absolute path to the products data file
const DATA_PATH = path.join(__dirname, '..', 'products.json');

// -------------------------------------------------------
// IN-MEMORY CACHE — load once at startup, serve from RAM
// -------------------------------------------------------
let cachedProducts = null;

/**
 * loadProducts — อ่าน products.json ครั้งเดียวแล้ว cache ไว้ใน memory
 * @private
 */
function loadProducts() {
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    cachedProducts = JSON.parse(rawData);
    console.log(`[ProductRepo] Loaded ${cachedProducts.length} products into cache`);
    return cachedProducts;
}

/**
 * findAll — อ่านข้อมูลสินค้าทั้งหมด (จาก cache)
 *
 * @returns {Array} Array ของ product objects ทั้งหมด
 * @throws {Error} ถ้าอ่านไฟล์ไม่ได้ หรือ JSON ไม่ถูกต้อง
 */
function findAll() {
    if (!cachedProducts) loadProducts();
    return cachedProducts;
}

/**
 * findById — ค้นหาสินค้า 1 ชิ้นจาก ID
 *
 * @param {number} id - Product ID ที่ต้องการค้นหา
 * @returns {Object|null} Product object หรือ null ถ้าไม่เจอ
 */
function findById(id) {
    const products = findAll();
    const product = products.find(p => p.id === Number(id));
    return product || null;
}

/**
 * findByCategory — ค้นหาสินค้าตาม category (case-insensitive)
 *
 * @param {string} category - ชื่อ category ที่ต้องการ filter
 * @returns {Array} Array ของ product objects ที่ตรงกับ category
 */
function findByCategory(category) {
    const products = findAll();
    const lowerCaseCategory = category.toLowerCase();
    return products.filter(p => p.category && p.category.toLowerCase() === lowerCaseCategory);
}

module.exports = {
    findAll,
    findById,
    findByCategory,
};
