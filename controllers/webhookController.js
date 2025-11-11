const crypto = require('crypto');
const { Payment, Order } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     MidtransWebhookRequest:
 *       type: object
 *       required:
 *         - order_id
 *         - transaction_status
 *       properties:
 *         order_id:
 *           type: string
 *           description: Order ID from Midtrans
 *           example: "ORD-12345-123"
 *         transaction_id:
 *           type: string
 *           description: Transaction ID from Midtrans
 *           example: "12345678-1234-1234-abcd-123456789012"
 *         transaction_status:
 *           type: string
 *           enum: [capture, settlement, pending, deny, cancel, expire, failure, refund, partial_refund]
 *           description: Transaction status
 *           example: "settlement"
 *         fraud_status:
 *           type: string
 *           enum: [accept, challenge, deny]
 *           description: Fraud detection status
 *           example: "accept"
 *         payment_type:
 *           type: string
 *           description: Payment method used
 *           example: "credit_card"
 *         signature_key:
 *           type: string
 *           description: Signature key for verification
 *           example: "signature-key-here"
 *         gross_amount:
 *           type: string
 *           description: Transaction amount
 *           example: "100000.00"
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "IDR"
 *
 * @swagger
 * /webhook/midtrans/notification:
 *   post:
 *     tags:
 *       - Webhooks
 *     summary: Handle Midtrans payment notification
 *     description: Receives and processes payment status notifications from Midtrans payment gateway. Updates payment and order status accordingly.
 *     security: []  # No authentication required for webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MidtransWebhookRequest'
 *           examples:
 *             settlement:
 *               summary: Successful payment settlement
 *               value:
 *                 order_id: "ORD-12345-123"
 *                 transaction_id: "12345678-1234-1234-abcd-123456789012"
 *                 transaction_status: "settlement"
 *                 fraud_status: "accept"
 *                 payment_type: "credit_card"
 *                 gross_amount: "100000.00"
 *                 currency: "IDR"
 *             failed:
 *               summary: Failed payment
 *               value:
 *                 order_id: "ORD-12345-123"
 *                 transaction_id: "12345678-1234-1234-abcd-123456789012"
 *                 transaction_status: "failure"
 *                 fraud_status: "accept"
 *                 payment_type: "bank_transfer"
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment not found"
 *       400:
 *         description: Invalid signature or malformed request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid signature"
 *       500:
 *         description: Internal server error during webhook processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Webhook processing failed"
 *                 error:
 *                   type: object
 *                   description: Error details (only in development)
 */

const midtransNotification = async (req, res) => {
  try {
    const notification = req.body;

    // Log webhook for debugging
    console.log('Midtrans webhook received:', JSON.stringify(notification, null, 2));

    // Verify signature (recommended for production)
    // if (process.env.WEBHOOK_SECRET_KEY) {
    //   const signature = req.headers['x-signature'] || req.headers['signature'];
    //   if (signature) {
    //     const expectedSignature = crypto
    //       .createHash('sha512')
    //       .update(JSON.stringify(notification) + process.env.WEBHOOK_SECRET_KEY)
    //       .digest('hex');

    //     if (signature !== expectedSignature) {
    //       console.log('Invalid signature');
    //       return res.status(400).json({ message: 'Invalid signature' });
    //     }
    //   }
    // }

    const {
      order_id,
      transaction_id,
      transaction_status,
      fraud_status,
      payment_type,
      signature_key
    } = notification;

    // Find payment by order_id or transaction_id
    let payment = await Payment.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { order_id: order_id },
          { midtrans_order_id: order_id },
          { midtrans_transaction_id: transaction_id }
        ]
      }
    });

    if (!payment) {
      console.log('Payment not found for order_id:', order_id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    const updateData = {
      status: transaction_status,
      fraud_status: fraud_status || payment.fraud_status,
      payment_method: payment_type || payment.payment_method,
      midtrans_transaction_id: transaction_id || payment.midtrans_transaction_id,
      signature_key: signature_key || payment.signature_key,
      raw_response: { ...payment.raw_response, ...notification },
      webhook_logs: [...(payment.webhook_logs || []), {
        received_at: new Date(),
        notification: notification
      }]
    };

    // Set payment date for successful transactions
    if (['capture', 'settlement'].includes(transaction_status)) {
      updateData.payment_date = new Date();
    }

    // Set expiry time for expired transactions
    if (transaction_status === 'expire') {
      updateData.expiry_time = new Date();
    }

    await payment.update(updateData);

    // Update order status based on payment status
    const order = await Order.findByPk(payment.order_id);
    if (order) {
      let newOrderStatus = order.status;
      let newPaymentStatus = order.payment_status;

      switch (transaction_status) {
        case 'settlement':
        case 'capture':
          newPaymentStatus = 'paid';
          if (order.status === 'pending') {
            newOrderStatus = 'confirmed';
          }
          break;
        case 'pending':
          newPaymentStatus = 'pending';
          break;
        case 'cancel':
        case 'deny':
        case 'failure':
        case 'expire':
          newPaymentStatus = 'failed';
          if (order.status === 'pending') {
            newOrderStatus = 'cancelled';
          }
          break;
        case 'refund':
        case 'partial_refund':
          newPaymentStatus = 'refunded';
          break;
      }

      await order.update({
        status: newOrderStatus,
        payment_status: newPaymentStatus
      });
    }

    console.log(`Payment ${payment.id} updated to status: ${transaction_status}`);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  midtransNotification
};
