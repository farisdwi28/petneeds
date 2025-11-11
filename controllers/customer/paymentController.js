const { Payment, Order, User } = require('../../models');
const { createTransaction } = require('../../utils/midtrans');
const { body, param, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - order_id
 *       properties:
 *         order_id:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /customer/payments:
 *   post:
 *     tags:
 *       - Customer Payments
 *     summary: Create payment
 *     description: Create a payment transaction for an order using Midtrans
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       201:
 *         description: Payment created successfully
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
 *                   example: "Payment created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *                     midtrans_response:
 *                       type: object
 *                       description: Midtrans API response
 *       400:
 *         description: Validation error or order already has payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/payments/{id}:
 *   get:
 *     tags:
 *       - Customer Payments
 *     summary: Get payment details
 *     description: Retrieve payment details by payment ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/orders/{orderId}/payment:
 *   get:
 *     tags:
 *       - Customer Payments
 *     summary: Get payment by order
 *     description: Retrieve payment details for a specific order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found for this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const createPayment = [
  // Validation
  body('order_id').isInt().withMessage('Order ID must be an integer'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { order_id } = req.body;
      const userId = req.user.id;

      // Find order
      const order = await Order.findOne({
        where: { id: order_id, user_id: userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if payment already exists
      const existingPayment = await Payment.findOne({ where: { order_id } });
      if (existingPayment) {
        return res.status(409).json({
          success: false,
          message: 'Payment already exists for this order'
        });
      }

      // Check order status
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Order is not in pending status'
        });
      }

      // Prepare Midtrans transaction details
      const transactionDetails = {
        transaction_details: {
          order_id: order.order_number,
          gross_amount: parseInt(order.total_amount)
        },
        customer_details: {
          first_name: order.user.name.split(' ')[0],
          last_name: order.user.name.split(' ').slice(1).join(' ') || '',
          email: order.user.email,
          phone: order.user.phone || ''
        },
        item_details: [
          {
            id: order.order_number,
            price: parseInt(order.total_amount),
            quantity: 1,
            name: `Order ${order.order_number}`
          }
        ]
      };

      // Create Midtrans transaction
      const midtransResult = await createTransaction(transactionDetails);

      if (!midtransResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment transaction',
          error: midtransResult.error
        });
      }

      const { token, redirect_url } = midtransResult.data;

      // Create payment record
      const payment = await Payment.create({
        order_id: order.id,
        user_id: userId,
        payment_method: 'midtrans',
        amount: order.total_amount,
        currency: 'IDR',
        status: 'pending',
        midtrans_order_id: order.order_number,
        payment_url: redirect_url,
        raw_response: midtransResult.data
      });

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: {
          payment: {
            id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount,
            status: payment.status,
            payment_url: payment.payment_url,
            token: token
          }
        }
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const getPayment = [
  param('id').isInt().withMessage('Payment ID must be an integer'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.id;

      const payment = await Payment.findOne({
        where: { id, user_id: userId },
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'status', 'total_amount']
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: { payment }
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const getPaymentByOrder = [
  param('orderId').isInt().withMessage('Order ID must be an integer'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { orderId } = req.params;
      const userId = req.user.id;

      // First verify the order belongs to the user
      const order = await Order.findOne({
        where: { id: orderId, user_id: userId }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const payment = await Payment.findOne({
        where: { order_id: orderId }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found for this order'
        });
      }

      res.json({
        success: true,
        data: { payment }
      });
    } catch (error) {
      console.error('Get payment by order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  createPayment,
  getPayment,
  getPaymentByOrder
};
