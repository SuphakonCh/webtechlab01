// ========================================
// SERVICE LAYER — productService.js
// ========================================
// Service layer รับผิดชอบเฉพาะ "business logic" เท่านั้น
// ไม่อ่านไฟล์เอง — เรียกผ่าน Repository แทน
//
// ก่อนปรับปรุง (Monolithic):
//   Service อ่าน fs.readFileSync + JSON.parse เอง
//   → ถ้าเปลี่ยน data source ต้องแก้ Service
//
// หลังปรับปรุง (Repository Pattern):
//   Service เรียก productRepository.findAll()
//   → ถ้าเปลี่ยน data source แก้แค่ Repository
// ========================================

const productRepository = require('../repositories/productRepository');

/**
 * getAllProducts — ดึงสินค้าทั้งหมด หรือ filter ตาม category
 *
 * @param {string} [category] - Optional category ที่ต้องการ filter
 * @returns {Array} Array ของ product objects
 */
function getAllProducts(category) {
    // ถ้ามี category → ใช้ repository method ที่ filter ให้เลย
    if (category) {
        return productRepository.findByCategory(category);
    }
    // ไม่มี category → ดึงทั้งหมด
    return productRepository.findAll();
}

/**
 * getProductById — ค้นหาสินค้า 1 ชิ้นจาก ID
 *
 * @param {number|string} id - Product ID
 * @returns {Object|null} Product object หรือ null
 */
function getProductById(id) {
    return productRepository.findById(id);
}

// Export the functions so the Controller can use them
module.exports = {
    getAllProducts,
    getProductById,
};
