const { OrderItem, Order, Product, ProductImage } = require('../../models');
const { Op } = require('sequelize');
const { param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * /customer/order-items:
 *   get:
 *     tags:
 *       - Customer Order Items
 *     summary: Get customer order items
 *     description: Retrieve a paginated list of all order items from customer's orders
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
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, product_name, quantity, unit_price, total_price, created_at]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Order items retrieved successfully
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
 *                     order_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           order_id:
 *                             type: integer
 *                           order_number:
 *                             type: string
 *                           order_status:
 *                             type: string
 *                           product_id:
 *                             type: integer
 *                           product_name:
 *                             type: string
 *                           product_sku:
 *                             type: string
 *                           product_image:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                           quantity:
 *                             type: integer
 *                           unit_price:
 *                             type: number
 *                             format: float
 *                           total_price:
 *                             type: number
 *                             format: float
 *                           ordered_at:
 *                             type: string
 *                             format: date-time
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
 * /customer/orders/{orderId}/items:
 *   get:
 *     tags:
 *       - Customer Order Items
 *     summary: Get order items by order ID
 *     description: Retrieve all items from a specific order
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
 *         description: Order items retrieved successfully
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
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         order_number:
 *                           type: string
 *                         status:
 *                           type: string
 *                     order_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           order_id:
 *                             type: integer
 *                           product_id:
 *                             type: integer
 *                           product_name:
 *                             type: string
 *                           product_sku:
 *                             type: string
 *                           product_image:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                           quantity:
 *                             type: integer
 *                           unit_price:
 *                             type: number
 *                             format: float
 *                           total_price:
 *                             type: number
 *                             format: float
 *                           ordered_at:
 *                             type: string
 *                             format: date-time
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_items:
 *                           type: integer
 *                         total_amount:
 *                           type: number
 *                           format: float
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

const getOrderItems = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

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
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;

      const validSortFields = ['id', 'product_name', 'quantity', 'unit_price', 'total_price', 'created_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Get order items through orders to ensure user access control
      const { count, rows: orderItems } = await OrderItem.findAndCountAll({
        include: [
          {
            model: Order,
            as: 'order',
            where: { user_id: req.user.id },
            attributes: ['id', 'order_number', 'status']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url', 'alt_text', 'is_primary'],
                where: { is_primary: true },
                required: false,
                limit: 1
              }
            ],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortField, sortDirection]],
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      // Format the response
      const formattedOrderItems = orderItems.map(item => ({
        id: item.id,
        order_id: item.order_id,
        order_number: item.order.order_number,
        order_status: item.order.status,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        product_image: item.product?.images && item.product.images.length > 0 ? item.product.images[0].image_url : null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        ordered_at: item.created_at
      }));

      res.json({
        success: true,
        data: {
          order_items: formattedOrderItems,
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
      console.error('Get order items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order items',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const getOrderItemsByOrder = [
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

      // First verify the order belongs to the user
      const order = await Order.findOne({
        where: {
          id: orderId,
          user_id: req.user.id
        },
        attributes: ['id', 'order_number', 'status']
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const orderItems = await OrderItem.findAll({
        where: { order_id: orderId },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url', 'alt_text', 'is_primary'],
                where: { is_primary: true },
                required: false,
                limit: 1
              }
            ],
            required: false
          }
        ],
        order: [['created_at', 'ASC']]
      });

      // Format the response
      const formattedOrderItems = orderItems.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        product_image: item.product?.images && item.product.images.length > 0 ? item.product.images[0].image_url : null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        ordered_at: item.created_at
      }));

      res.json({
        success: true,
        data: {
          order: {
            id: order.id,
            order_number: order.order_number,
            status: order.status
          },
          order_items: formattedOrderItems,
          summary: {
            total_items: orderItems.reduce((sum, item) => sum + item.quantity, 0),
            total_amount: orderItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0)
          }
        }
      });
    } catch (error) {
      console.error('Get order items by order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order items',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  getOrderItems,
  getOrderItemsByOrder
};
