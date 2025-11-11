const { Payment, Order, User } = require('../../models');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * /admin/payments:
 *   get:
 *     tags:
 *       - Admin Payments
 *     summary: Get all payments
 *     description: Retrieve a paginated list of all payments with filtering and search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: order_id
 *         schema:
 *           type: integer
 *         description: Filter by order ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, settlement, capture, cancel, deny, expire, failure, refund, partial_refund]
 *         description: Filter by payment status
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [midtrans, bank_transfer, credit_card, ewallet]
 *         description: Filter by payment method
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by transaction ID, order number, or email
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, amount, status, payment_method, created_at, updated_at]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         total_items:
 *                           type: integer
 *                         items_per_page:
 *                           type: integer
 *                         has_next:
 *                           type: boolean
 *                         has_prev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/payments/{id}:
 *   get:
 *     tags:
 *       - Admin Payments
 *     summary: Get payment by ID
 *     description: Retrieve detailed information about a specific payment
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
 * /admin/payments/sync/{orderId}:
 *   post:
 *     tags:
 *       - Admin Payments
 *     summary: Sync payment status
 *     description: Synchronize payment status with Midtrans payment gateway
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID to sync payment for
 *     responses:
 *       200:
 *         description: Payment status synchronized successfully
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
 *                   example: "Payment status synchronized successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *                     midtrans_response:
 *                       type: object
 *                       description: Midtrans API response data
 *       400:
 *         description: Invalid order or payment not via Midtrans
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
 *         description: Payment not found for this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to sync with Midtrans API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const getPayments = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('order_id').optional().isInt().withMessage('Order ID must be an integer'),
  query('user_id').optional().isInt().withMessage('User ID must be an integer'),
  query('status').optional().isIn(['pending', 'settlement', 'capture', 'cancel', 'deny', 'expire', 'failure', 'refund', 'partial_refund']).withMessage('Invalid status'),
  query('payment_method').optional().isIn(['midtrans', 'bank_transfer', 'credit_card', 'ewallet']).withMessage('Invalid payment method'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty'),

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

      const {
        page = 1,
        limit = 10,
        order_id,
        user_id,
        status,
        payment_method,
        search,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (order_id) {
        whereClause.order_id = order_id;
      }

      if (user_id) {
        whereClause.user_id = user_id;
      }

      if (status) {
        whereClause.status = status;
      }

      if (payment_method) {
        whereClause.payment_method = payment_method;
      }

      if (search) {
        whereClause[Op.or] = [
          { midtrans_transaction_id: { [Op.like]: `%${search}%` } },
          { midtrans_order_id: { [Op.like]: `%${search}%` } },
          { '$order.order_number$': { [Op.like]: `%${search}%` } },
          { '$user.email$': { [Op.like]: `%${search}%` } }
        ];
      }

      const validSortFields = ['id', 'amount', 'status', 'payment_method', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: payments } = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'total_amount', 'status']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortField, sortDirection]],
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_items: count,
            items_per_page: parseInt(limit),
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
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

      const payment = await Payment.findByPk(id, {
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'total_amount', 'status', 'user_id']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
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

const syncPaymentStatus = [
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

      // Find payment by order_id
      const payment = await Payment.findOne({
        where: { order_id: orderId },
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'status']
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found for this order'
        });
      }

      // Check if payment is via Midtrans
      if (payment.payment_method !== 'midtrans' || !payment.midtrans_transaction_id) {
        return res.status(400).json({
          success: false,
          message: 'Payment synchronization only available for Midtrans payments'
        });
      }

      // Import Midtrans client
      const midtransClient = require('midtrans-client');

      // Initialize core API
      const coreApi = new midtransClient.CoreApi({
        isProduction: process.env.MIDTRANS_SANDBOX === 'false',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });

      try {
        // Check payment status from Midtrans
        const statusResponse = await coreApi.transaction.status(payment.midtrans_transaction_id);

        // Update payment status
        const updateData = {
          status: statusResponse.transaction_status,
          fraud_status: statusResponse.fraud_status || null,
          payment_date: statusResponse.settlement_time || statusResponse.transaction_time || null
        };

        // Add additional fields based on payment type
        if (statusResponse.payment_type) {
          updateData.midtrans_payment_type = statusResponse.payment_type;
        }

        if (statusResponse.va_numbers) {
          updateData.va_numbers = statusResponse.va_numbers;
        }

        if (statusResponse.qr_string) {
          updateData.qr_string = statusResponse.qr_string;
        }

        if (statusResponse.bill_key) {
          updateData.bill_key = statusResponse.bill_key;
          updateData.biller_code = statusResponse.biller_code;
        }

        if (statusResponse.permata_va_number) {
          updateData.permata_va_number = statusResponse.permata_va_number;
        }

        // Store raw response
        updateData.raw_response = statusResponse;

        await payment.update(updateData);

        // Update order status based on payment status
        if (['settlement', 'capture'].includes(statusResponse.transaction_status)) {
          await payment.order.update({ payment_status: 'paid' });
        } else if (['cancel', 'deny', 'expire', 'failure'].includes(statusResponse.transaction_status)) {
          await payment.order.update({ payment_status: 'failed' });
        }

        res.json({
          success: true,
          message: 'Payment status synchronized successfully',
          data: {
            payment: await Payment.findByPk(payment.id),
            midtrans_response: statusResponse
          }
        });
      } catch (midtransError) {
        console.error('Midtrans API error:', midtransError);
        res.status(500).json({
          success: false,
          message: 'Failed to sync with Midtrans',
          error: process.env.NODE_ENV === 'development' ? midtransError.message : {}
        });
      }
    } catch (error) {
      console.error('Sync payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync payment status',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  getPayments,
  getPayment,
  syncPaymentStatus
};
