const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Midtrans webhook
router.post('/midtrans/notification', webhookController.midtransNotification);

module.exports = router;
