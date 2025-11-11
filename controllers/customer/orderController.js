const { Order, OrderItem, Cart, Product, Address, Payment } = require('../../models');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderRequest:
 *       type: object
 *       required:
 *         - address_id
 *       properties:
 *         address_id:
 *           type: integer
 *           example: 1
 *         shipping_method:
 *           type: string
 *           maxLength: 100
 *           example: "JNE REG"
 *         notes:
 *           type: string
 *           example: "Please handle with care"
 *         cart_item_ids:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 *           description: Specific cart item IDs to include in order (optional, uses all cart items if not provided)
 */

/**
 * @swagger
 * /customer/orders:
 *   get:
 *     tags:
 *       - Customer Orders
 *     summary: Get customer orders
 *     description: Retrieve a paginated list of customer's orders
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, order_number, total_amount, status, ordered_at, created_at]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
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
 * /customer/orders/{id}:
 *   get:
 *     tags:
 *       - Customer Orders
 *     summary: Get order details
 *     description: Retrieve detailed information about a specific order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
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
 * /customer/orders:
 *   post:
 *     tags:
 *       - Customer Orders
 *     summary: Create order
 *     description: Create a new order from cart items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   example: "Order created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or insufficient stock
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
 *         description: Address or product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/orders/{id}/cancel:
 *   put:
 *     tags:
 *       - Customer Orders
 *     summary: Cancel order
 *     description: Cancel a pending or confirmed order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
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
 *                   example: "Order cancelled successfully"
 *       400:
 *         description: Order cannot be cancelled at this stage
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

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

const getOrders = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('payment_status').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),

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
        status,
        payment_status,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { user_id: req.user.id };

      if (status) {
        whereClause.status = status;
      }

      if (payment_status) {
        whereClause.payment_status = payment_status;
      }

      const validSortFields = ['id', 'order_number', 'total_amount', 'status', 'ordered_at', 'created_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Address,
            as: 'address',
            attributes: ['id', 'recipient_name', 'phone', 'full_address', 'city', 'province', 'postal_code']
          },
          {
            model: OrderItem,
            as: 'items',
            attributes: ['id', 'product_name', 'quantity', 'unit_price', 'total_price'],
            limit: 3 // Just show first 3 items
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
          orders,
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
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const getOrder = [
  param('id').isInt().withMessage('Order ID must be an integer'),

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

      const order = await Order.findOne({
        where: {
          id,
          user_id: req.user.id
        },
        include: [
          {
            model: Address,
            as: 'address',
            attributes: ['id', 'label', 'recipient_name', 'phone', 'province', 'city', 'district', 'postal_code', 'full_address']
          },
          {
            model: OrderItem,
            as: 'items',
            attributes: ['id', 'product_id', 'product_name', 'product_sku', 'quantity', 'unit_price', 'total_price']
          },
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'payment_method', 'amount', 'status', 'payment_url', 'created_at'],
            required: false
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const createOrder = [
  body('address_id').isInt().withMessage('Address ID must be an integer'),
  body('shipping_method').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Shipping method must be less than 100 characters'),
  body('notes').optional().trim(),
  body('cart_item_ids').optional().isArray().withMessage('Cart item IDs must be an array'),
  body('cart_item_ids.*').optional().isInt().withMessage('Cart item ID must be an integer'),

  async (req, res) => {
    let transactionCommitted = false;
    const transaction = await Order.sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { address_id, shipping_method, notes, cart_item_ids } = req.body;

      // Verify address belongs to user
      const address = await Address.findOne({
        where: {
          id: address_id,
          user_id: req.user.id,
          is_active: true
        },
        transaction
      });

      if (!address) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Address not found or inactive'
        });
      }

      // Get cart items
      let cartItems;
      if (cart_item_ids && cart_item_ids.length > 0) {
        // Use specific cart items
        cartItems = await Cart.findAll({
          where: {
            id: { [Op.in]: cart_item_ids },
            user_id: req.user.id
          },
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'sku', 'stock_quantity', 'is_active']
            }
          ],
          transaction
        });
      } else {
        // Use all cart items
        cartItems = await Cart.findAll({
          where: { user_id: req.user.id },
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'sku', 'stock_quantity', 'is_active']
            }
          ],
          transaction
        });
      }

      if (cartItems.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'No items in cart'
        });
      }

      // Validate products and calculate totals
      let subtotal = 0;
      const validCartItems = [];

      for (const cartItem of cartItems) {
        const product = cartItem.product;

        if (!product || !product.is_active) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Product "${product?.name || 'Unknown'}" is no longer available`
          });
        }

        if (product.stock_quantity < cartItem.quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`
          });
        }

        subtotal += product.price * cartItem.quantity;
        validCartItems.push(cartItem);
      }

      // Calculate totals (simplified - no tax/discount logic for now)
      const shipping_cost = 0; // Could be calculated based on shipping method
      const tax_amount = 0; // Could be calculated based on location
      const discount_amount = 0; // Could be applied from coupons
      const total_amount = subtotal + shipping_cost + tax_amount - discount_amount;

      // Generate order number
      let orderNumber;
      let orderExists = true;
      let attempts = 0;

      while (orderExists && attempts < 10) {
        orderNumber = generateOrderNumber();
        const existingOrder = await Order.findOne({
          where: { order_number: orderNumber },
          transaction
        });
        orderExists = !!existingOrder;
        attempts++;
      }

      if (orderExists) {
        await transaction.rollback();
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique order number'
        });
      }

      // Create order
      const order = await Order.create({
        order_number: orderNumber,
        user_id: req.user.id,
        address_id,
        subtotal,
        shipping_cost,
        tax_amount,
        discount_amount,
        total_amount,
        shipping_method,
        notes,
        ordered_at: new Date()
      }, { transaction });

      // Create order items and update stock
      const orderItems = [];
      for (const cartItem of validCartItems) {
        const product = cartItem.product;

        const orderItem = await OrderItem.create({
          order_id: order.id,
          product_id: product.id,
          quantity: cartItem.quantity,
          unit_price: product.price,
          total_price: product.price * cartItem.quantity,
          product_name: product.name,
          product_sku: product.sku
        }, { transaction });

        // Reduce stock
        await product.update({
          stock_quantity: product.stock_quantity - cartItem.quantity
        }, { transaction });

        orderItems.push(orderItem);
      }

      // Remove cart items
      await Cart.destroy({
        where: {
          id: { [Op.in]: validCartItems.map(item => item.id) },
          user_id: req.user.id
        },
        transaction
      });

      await transaction.commit();
      transactionCommitted = true;

      // Fetch complete order
      const createdOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Address,
            as: 'address',
            attributes: ['id', 'recipient_name', 'phone', 'full_address', 'city', 'province', 'postal_code']
          },
          {
            model: OrderItem,
            as: 'items',
            attributes: ['id', 'product_name', 'quantity', 'unit_price', 'total_price']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order: createdOrder }
      });
    } catch (error) {
      if (!transactionCommitted) {
        await transaction.rollback();
      }
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const cancelOrder = [
  param('id').isInt().withMessage('Order ID must be an integer'),

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

      const order = await Order.findOne({
        where: {
          id,
          user_id: req.user.id
        },
        include: [
          {
            model: OrderItem,
            as: 'items',
            attributes: ['id', 'product_id', 'quantity']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled at this stage'
        });
      }

      const transaction = await Order.sequelize.transaction();
      let transactionCommitted = false;

      try {
        // Update order status
        await order.update({ status: 'cancelled' }, { transaction });

        // Restore product stock
        for (const orderItem of order.items) {
          const product = await Product.findByPk(orderItem.product_id, { transaction });
          if (product) {
            await product.update({
              stock_quantity: product.stock_quantity + orderItem.quantity
            }, { transaction });
          }
        }

        // Cancel payment if exists
        if (order.payment_status === 'pending') {
          await order.update({ payment_status: 'failed' }, { transaction });
        }

        await transaction.commit();
        transactionCommitted = true;

        res.json({
          success: true,
          message: 'Order cancelled successfully'
        });
      } catch (error) {
        if (!transactionCommitted) {
          await transaction.rollback();
        }
        throw error;
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder
};
