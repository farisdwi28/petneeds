const { Shipment, Order, User } = require('../../models');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentRequest:
 *       type: object
 *       required:
 *         - order_id
 *         - tracking_number
 *         - carrier
 *         - shipping_cost
 *       properties:
 *         order_id:
 *           type: integer
 *           example: 1
 *         tracking_number:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "JNE123456789"
 *         carrier:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "JNE"
 *         service_type:
 *           type: string
 *           maxLength: 50
 *           example: "REG"
 *         shipping_cost:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 15000
 *         weight_grams:
 *           type: integer
 *           minimum: 0
 *           example: 2000
 *         dimensions:
 *           type: string
 *           maxLength: 100
 *           example: "30x20x10 cm"
 *         estimated_delivery:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         origin_address:
 *           type: string
 *           example: "Jakarta Warehouse, Jl. Sudirman No. 123"
 *         destination_address:
 *           type: string
 *           example: "Customer Address, Jl. Malioboro No. 456, Yogyakarta"
 *         notes:
 *           type: string
 *           example: "Handle with care - fragile items"
 */

/**
 * @swagger
 * /admin/shipments:
 *   get:
 *     tags:
 *       - Admin Shipments
 *     summary: Get all shipments
 *     description: Retrieve a paginated list of all shipments with filtering and search
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, pickup, in_transit, delivered, failed, returned]
 *         description: Filter by shipment status
 *       - in: query
 *         name: carrier
 *         schema:
 *           type: string
 *         description: Filter by carrier name
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by tracking number, carrier, or customer name
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, tracking_number, carrier, status, shipping_cost, created_at, updated_at]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Shipments retrieved successfully
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
 *                     shipments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Shipment'
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
 * /admin/shipments/{id}:
 *   get:
 *     tags:
 *       - Admin Shipments
 *     summary: Get shipment by ID
 *     description: Retrieve detailed information about a specific shipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shipment ID
 *     responses:
 *       200:
 *         description: Shipment details retrieved successfully
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
 *                     shipment:
 *                       $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/shipments:
 *   post:
 *     tags:
 *       - Admin Shipments
 *     summary: Create new shipment
 *     description: Create a new shipment for an order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentRequest'
 *     responses:
 *       201:
 *         description: Shipment created successfully
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
 *                   example: "Shipment created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shipment:
 *                       $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Validation error
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
 *       409:
 *         description: Shipment already exists for this order or tracking number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/shipments/{id}:
 *   put:
 *     tags:
 *       - Admin Shipments
 *     summary: Update shipment
 *     description: Update an existing shipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentRequest'
 *     responses:
 *       200:
 *         description: Shipment updated successfully
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
 *                   example: "Shipment updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shipment:
 *                       $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Validation error
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
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Tracking number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/shipments/{id}:
 *   delete:
 *     tags:
 *       - Admin Shipments
 *     summary: Delete shipment
 *     description: Soft delete a shipment (only if not delivered)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shipment ID
 *     responses:
 *       200:
 *         description: Shipment deleted successfully
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
 *                   example: "Shipment deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Cannot delete a delivered shipment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const getShipments = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('order_id').optional().isInt().withMessage('Order ID must be an integer'),
  query('status').optional().isIn(['pending', 'pickup', 'in_transit', 'delivered', 'failed', 'returned']).withMessage('Invalid status'),
  query('carrier').optional().trim().isLength({ min: 1 }).withMessage('Carrier cannot be empty'),
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
        status,
        carrier,
        search,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (order_id) {
        whereClause.order_id = order_id;
      }

      if (status) {
        whereClause.status = status;
      }

      if (carrier) {
        whereClause.carrier = { [Op.like]: `%${carrier}%` };
      }

      if (search) {
        whereClause[Op.or] = [
          { tracking_number: { [Op.like]: `%${search}%` } },
          { carrier: { [Op.like]: `%${search}%` } },
          { service_type: { [Op.like]: `%${search}%` } },
          { '$order.order_number$': { [Op.like]: `%${search}%` } },
          { '$order.user.name$': { [Op.like]: `%${search}%` } }
        ];
      }

      const validSortFields = ['id', 'tracking_number', 'carrier', 'status', 'shipping_cost', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: shipments } = await Shipment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'status', 'total_amount'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              }
            ]
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
          shipments,
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
      console.error('Get shipments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shipments',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const getShipment = [
  param('id').isInt().withMessage('Shipment ID must be an integer'),

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

      const shipment = await Shipment.findByPk(id, {
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'status', 'total_amount', 'ordered_at'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone']
              }
            ]
          }
        ]
      });

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      res.json({
        success: true,
        data: { shipment }
      });
    } catch (error) {
      console.error('Get shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shipment',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const createShipment = [
  body('order_id').isInt().withMessage('Order ID must be an integer'),
  body('tracking_number').trim().isLength({ min: 1, max: 100 }).withMessage('Tracking number is required and must be less than 100 characters'),
  body('carrier').trim().isLength({ min: 1, max: 100 }).withMessage('Carrier is required and must be less than 100 characters'),
  body('service_type').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Service type must be less than 50 characters'),
  body('shipping_cost').isFloat({ min: 0 }).withMessage('Shipping cost must be a positive number'),
  body('weight_grams').optional().isInt({ min: 0 }).withMessage('Weight must be a non-negative integer'),
  body('dimensions').optional().trim().isLength({ max: 100 }).withMessage('Dimensions must be less than 100 characters'),
  body('estimated_delivery').optional().isISO8601().withMessage('Estimated delivery must be a valid date'),
  body('origin_address').optional().trim(),
  body('destination_address').optional().trim(),
  body('notes').optional().trim(),

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
        order_id,
        tracking_number,
        carrier,
        service_type,
        shipping_cost,
        weight_grams,
        dimensions,
        estimated_delivery,
        origin_address,
        destination_address,
        notes
      } = req.body;

      // Check if order exists
      const order = await Order.findByPk(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if shipment already exists for this order
      const existingShipment = await Shipment.findOne({ where: { order_id } });
      if (existingShipment) {
        return res.status(409).json({
          success: false,
          message: 'Shipment already exists for this order'
        });
      }

      // Check if tracking number is unique
      const existingTracking = await Shipment.findOne({ where: { tracking_number } });
      if (existingTracking) {
        return res.status(409).json({
          success: false,
          message: 'Tracking number already exists'
        });
      }

      const shipment = await Shipment.create({
        order_id,
        tracking_number,
        carrier,
        service_type,
        shipping_cost,
        weight_grams,
        dimensions,
        estimated_delivery,
        origin_address,
        destination_address,
        notes,
        tracking_history: [{
          status: 'pending',
          description: 'Shipment created',
          timestamp: new Date().toISOString(),
          location: origin_address || 'Origin'
        }]
      });

      // Update order status to processing if it's still pending
      if (order.status === 'confirmed') {
        await order.update({ status: 'processing' });
      }

      const createdShipment = await Shipment.findByPk(shipment.id, {
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'status'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Shipment created successfully',
        data: { shipment: createdShipment }
      });
    } catch (error) {
      console.error('Create shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create shipment',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const updateShipment = [
  param('id').isInt().withMessage('Shipment ID must be an integer'),
  body('tracking_number').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Tracking number must be less than 100 characters'),
  body('carrier').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Carrier must be less than 100 characters'),
  body('service_type').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Service type must be less than 50 characters'),
  body('status').optional().isIn(['pending', 'pickup', 'in_transit', 'delivered', 'failed', 'returned']).withMessage('Invalid status'),
  body('shipping_cost').optional().isFloat({ min: 0 }).withMessage('Shipping cost must be a positive number'),
  body('weight_grams').optional().isInt({ min: 0 }).withMessage('Weight must be a non-negative integer'),
  body('dimensions').optional().trim().isLength({ max: 100 }).withMessage('Dimensions must be less than 100 characters'),
  body('estimated_delivery').optional().isISO8601().withMessage('Estimated delivery must be a valid date'),
  body('actual_delivery').optional().isISO8601().withMessage('Actual delivery must be a valid date'),
  body('origin_address').optional().trim(),
  body('destination_address').optional().trim(),
  body('notes').optional().trim(),

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
      const updateData = req.body;

      const shipment = await Shipment.findByPk(id, {
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'status']
          }
        ]
      });
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      // Check tracking number uniqueness if updating
      if (updateData.tracking_number) {
        const existingTracking = await Shipment.findOne({
          where: {
            tracking_number: updateData.tracking_number,
            id: { [Op.ne]: id }
          }
        });
        if (existingTracking) {
          return res.status(409).json({
            success: false,
            message: 'Tracking number already exists'
          });
        }
      }

      // Update tracking history if status changed
      if (updateData.status && updateData.status !== shipment.status) {
        const trackingHistory = [...(shipment.tracking_history || [])];
        trackingHistory.push({
          status: updateData.status,
          description: `Status changed to ${updateData.status}`,
          timestamp: new Date().toISOString(),
          location: updateData.destination_address || 'Unknown'
        });
        updateData.tracking_history = trackingHistory;

        // Update order status based on shipment status
        if (updateData.status === 'delivered') {
          await shipment.order.update({
            status: 'delivered',
            delivered_at: new Date()
          });
          updateData.actual_delivery = new Date();
        } else if (updateData.status === 'in_transit') {
          await shipment.order.update({ status: 'shipped' });
        }
      }

      await shipment.update(updateData);

      const updatedShipment = await Shipment.findByPk(id, {
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_number', 'status'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Shipment updated successfully',
        data: { shipment: updatedShipment }
      });
    } catch (error) {
      console.error('Update shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update shipment',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const deleteShipment = [
  param('id').isInt().withMessage('Shipment ID must be an integer'),

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

      const shipment = await Shipment.findByPk(id);
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      // Check if shipment can be deleted (not delivered)
      if (shipment.status === 'delivered') {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete a delivered shipment'
        });
      }

      // Soft delete
      await shipment.destroy();

      res.json({
        success: true,
        message: 'Shipment deleted successfully'
      });
    } catch (error) {
      console.error('Delete shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete shipment',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment
};
