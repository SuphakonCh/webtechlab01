// ========================================
// CONTROLLER LAYER — productController.js
// ========================================
// The Controller layer sits between the Route and the Service.
// It receives the HTTP request (req) and response (res) objects,
// calls the appropriate Service function, and sends back the response.
//
// The Controller handles:
//   - Calling the right service method
//   - Formatting the response (JSON, status codes)
//   - Error handling (try/catch → 500 errors)
//
// The Controller does NOT:
//   - Define URL paths (that's the Route's job)
//   - Read files or query databases directly (that's the Service's job)
// ========================================

const productService = require('../services/productService');

/**
 * getAll — Controller for GET /api/products
 *
 * Retrieves all products from the service and sends them as JSON.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function getAll(req, res) {
    try {
        // Ask the service layer for all products
        const products = productService.getAllProducts();

        // Send the products array as a JSON response with status 200 (OK)
        res.status(200).json(products);
    } catch (error) {
        // If something goes wrong (e.g., file not found), return a 500 error
        console.error('Error in getAll:', error.message);
        res.status(500).json({ error: 'Failed to retrieve products' });
    }
}

/**
 * getById — Controller for GET /api/products/:id
 *
 * Retrieves a single product by its ID and sends it as JSON.
 * Returns 404 if the product is not found.
 *
 * @param {Object} req - Express request object (req.params.id contains the ID)
 * @param {Object} res - Express response object
 */
function getById(req, res) {
    try {
        // Extract the product ID from the URL parameter
        const id = req.params.id;

        // Ask the service layer for the specific product
        const product = productService.getProductById(id);

        // If no product was found, return a 404 (Not Found) response
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Send the product object as a JSON response
        res.status(200).json(product);
    } catch (error) {
        console.error('Error in getById:', error.message);
        res.status(500).json({ error: 'Failed to retrieve product' });
    }
}

// Export the controller functions so the Route can use them
module.exports = {
    getAll,
    getById
};
