const express = require('express');
const router = express.Router();

// Import controllers
const addressController = require('../controllers/customer/addressController');
const cartController = require('../controllers/customer/cartController');
const orderController = require('../controllers/customer/orderController');
const orderItemController = require('../controllers/customer/orderItemController');
const paymentController = require('../controllers/customer/paymentController');

// Import middleware
const { requireCustomer } = require('../middleware/auth');

// All customer routes require customer authentication
router.use(requireCustomer);

// Address routes
router.get('/addresses', addressController.getAddresses);
router.get('/addresses/:id', addressController.getAddress);
router.post('/addresses', addressController.createAddress);
router.put('/addresses/:id', addressController.updateAddress);
router.delete('/addresses/:id', addressController.deleteAddress);
router.put('/addresses/:id/default', addressController.setDefaultAddress);

// Cart routes
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.addToCart);
router.put('/cart/:productId', cartController.updateCartItem);
router.delete('/cart/:productId', cartController.removeFromCart);
router.delete('/cart', cartController.clearCart);

// Order routes
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrder);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id/cancel', orderController.cancelOrder);

// Order Item routes (read-only for customers)
router.get('/order-items', orderItemController.getOrderItems);
router.get('/orders/:orderId/items', orderItemController.getOrderItemsByOrder);

// Payment routes
router.post('/payments', paymentController.createPayment);
router.get('/payments/:id', paymentController.getPayment);
router.get('/orders/:orderId/payment', paymentController.getPaymentByOrder);

module.exports = router;
