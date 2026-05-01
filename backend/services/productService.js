// ========================================
// SERVICE LAYER — productService.js
// ========================================
// The Service layer is responsible for the "business logic" and data access.
// It reads from the data source (products.json) and returns the results.
// The Service does NOT know anything about HTTP requests or responses.
// This separation makes the code reusable and testable.
// ========================================

const fs = require('fs');
const path = require('path');

// Build the absolute path to products.json
// path.join(__dirname, '..') goes up one folder from /services to the project root
const DATA_PATH = path.join(__dirname, '..', 'products.json');

/**
 * getAllProducts — Reads the products.json file and returns all products.
 *
 * This function uses fs.readFileSync to read the file from disk,
 * then JSON.parse() to convert the raw text into a JavaScript array.
 *
 * @returns {Array} An array of product objects.
 * @throws {Error} If the file cannot be read or parsed.
 */
function getAllProducts() {
    // Read the file from disk (synchronous for simplicity)
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');

    // Parse the JSON string into a JavaScript array of objects
    const products = JSON.parse(rawData);

    return products;
}

/**
 * getProductById — Finds a single product by its ID.
 *
 * @param {number|string} id - The product ID to search for.
 * @returns {Object|null} The matching product object, or null if not found.
 */
function getProductById(id) {
    const products = getAllProducts();

    // Find the product whose id matches the given id
    // We convert both to Number to ensure consistent comparison
    const product = products.find(p => p.id === Number(id));

    return product || null;
}

// Export the functions so the Controller can use them
module.exports = {
    getAllProducts,
    getProductById
};
