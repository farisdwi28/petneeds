const express = require('express');
const router = express.Router();

// Import controllers
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
const productImageController = require('../controllers/admin/productImageController');
const paymentController = require('../controllers/admin/paymentController');
const shipmentController = require('../controllers/admin/shipmentController');

// Import middleware
const { requireAdmin, authenticate } = require('../middleware/auth');
router.use(requireAdmin);

// Product routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Category routes
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategory);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Product Image routes
router.get('/product-images', productImageController.getProductImages);
router.post('/product-images', productImageController.uploadProductImage);
router.put('/product-images/:id', productImageController.updateProductImage);
router.delete('/product-images/:id', productImageController.deleteProductImage);

// Payment routes
router.get('/payments', paymentController.getPayments);
router.get('/payments/:id', paymentController.getPayment);
router.post('/payments/sync/:orderId', paymentController.syncPaymentStatus);

// Shipment routes
router.get('/shipments', shipmentController.getShipments);
router.get('/shipments/:id', shipmentController.getShipment);
router.post('/shipments', shipmentController.createShipment);
router.put('/shipments/:id', shipmentController.updateShipment);
router.delete('/shipments/:id', shipmentController.deleteShipment);

module.exports = router;
