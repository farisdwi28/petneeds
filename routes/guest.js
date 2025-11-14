const express = require('express');
const router = express.Router();

// Import controllers
const productController = require('../controllers/guest/productController');

// Guest routes - no authentication required
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);

module.exports = router;

