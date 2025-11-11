const { Address } = require('../../models');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     AddressRequest:
 *       type: object
 *       required:
 *         - recipient_name
 *         - phone
 *         - province
 *         - city
 *         - district
 *         - postal_code
 *         - full_address
 *       properties:
 *         label:
 *           type: string
 *           maxLength: 100
 *           example: "Home"
 *         recipient_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           minLength: 1
 *           maxLength: 20
 *           example: "+6281234567890"
 *         province:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "DKI Jakarta"
 *         city:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Jakarta Selatan"
 *         district:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Kebayoran Baru"
 *         postal_code:
 *           type: string
 *           minLength: 1
 *           maxLength: 10
 *           example: "12160"
 *         full_address:
 *           type: string
 *           minLength: 1
 *           example: "Jl. Sudirman No. 123, RT 01/RW 02"
 *         latitude:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *           example: -6.2088
 *         longitude:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *           example: 106.8456
 *         is_default:
 *           type: boolean
 *           default: false
 *           example: true
 */

/**
 * @swagger
 * /customer/addresses:
 *   get:
 *     tags:
 *       - Customer Addresses
 *     summary: Get customer addresses
 *     description: Retrieve a paginated list of customer's addresses
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
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, label, recipient_name, created_at, updated_at]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
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
 *                     addresses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Address'
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
 * /customer/addresses/{id}:
 *   get:
 *     tags:
 *       - Customer Addresses
 *     summary: Get address by ID
 *     description: Retrieve a specific address by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
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
 *                     address:
 *                       $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/addresses:
 *   post:
 *     tags:
 *       - Customer Addresses
 *     summary: Create new address
 *     description: Create a new address for the customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressRequest'
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                   example: "Address created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     address:
 *                       $ref: '#/components/schemas/Address'
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
 */

/**
 * @swagger
 * /customer/addresses/{id}:
 *   put:
 *     tags:
 *       - Customer Addresses
 *     summary: Update address
 *     description: Update an existing address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressRequest'
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *                   example: "Address updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     address:
 *                       $ref: '#/components/schemas/Address'
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
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/addresses/{id}:
 *   delete:
 *     tags:
 *       - Customer Addresses
 *     summary: Delete address
 *     description: Soft delete an address (only if not used in active orders)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: "Address deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Cannot delete address used in active orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/addresses/{id}/default:
 *   put:
 *     tags:
 *       - Customer Addresses
 *     summary: Set default address
 *     description: Set an address as the customer's default address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Default address set successfully
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
 *                   example: "Default address set successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     address:
 *                       $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const getAddresses = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('is_active').optional().isIn(['true', 'false']).withMessage('is_active must be true or false'),

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
        is_active,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { user_id: req.user.id };

      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      const validSortFields = ['id', 'label', 'recipient_name', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: addresses } = await Address.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortField, sortDirection]],
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          addresses,
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
      console.error('Get addresses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch addresses',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const getAddress = [
  param('id').isInt().withMessage('Address ID must be an integer'),

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

      const address = await Address.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      res.json({
        success: true,
        data: { address }
      });
    } catch (error) {
      console.error('Get address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch address',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const createAddress = [
  body('label').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Label must be less than 100 characters'),
  body('recipient_name').trim().isLength({ min: 1, max: 255 }).withMessage('Recipient name is required and must be less than 255 characters'),
  body('phone').trim().isLength({ min: 1, max: 20 }).withMessage('Phone is required and must be less than 20 characters'),
  body('province').trim().isLength({ min: 1, max: 100 }).withMessage('Province is required and must be less than 100 characters'),
  body('city').trim().isLength({ min: 1, max: 100 }).withMessage('City is required and must be less than 100 characters'),
  body('district').trim().isLength({ min: 1, max: 100 }).withMessage('District is required and must be less than 100 characters'),
  body('postal_code').trim().isLength({ min: 1, max: 10 }).withMessage('Postal code is required and must be less than 10 characters'),
  body('full_address').trim().isLength({ min: 1 }).withMessage('Full address is required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('is_default').optional().isBoolean().withMessage('is_default must be a boolean'),

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
        label = 'Home',
        recipient_name,
        phone,
        province,
        city,
        district,
        postal_code,
        full_address,
        latitude,
        longitude,
        is_default = false
      } = req.body;

      // If setting as default, remove default flag from other addresses
      if (is_default) {
        await Address.update(
          { is_default: false },
          { where: { user_id: req.user.id, is_default: true } }
        );
      }

      const address = await Address.create({
        user_id: req.user.id,
        label,
        recipient_name,
        phone,
        province,
        city,
        district,
        postal_code,
        full_address,
        latitude,
        longitude,
        is_default
      });

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: { address }
      });
    } catch (error) {
      console.error('Create address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create address',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const updateAddress = [
  param('id').isInt().withMessage('Address ID must be an integer'),
  body('label').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Label must be less than 100 characters'),
  body('recipient_name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Recipient name must be less than 255 characters'),
  body('phone').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Phone must be less than 20 characters'),
  body('province').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Province must be less than 100 characters'),
  body('city').optional().trim().isLength({ min: 1, max: 100 }).withMessage('City must be less than 100 characters'),
  body('district').optional().trim().isLength({ min: 1, max: 100 }).withMessage('District must be less than 100 characters'),
  body('postal_code').optional().trim().isLength({ min: 1, max: 10 }).withMessage('Postal code must be less than 10 characters'),
  body('full_address').optional().trim().isLength({ min: 1 }).withMessage('Full address cannot be empty'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('is_default').optional().isBoolean().withMessage('is_default must be a boolean'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),

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

      const address = await Address.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // If setting as default, remove default flag from other addresses
      if (updateData.is_default) {
        await Address.update(
          { is_default: false },
          {
            where: {
              user_id: req.user.id,
              is_default: true,
              id: { [Op.ne]: id }
            }
          }
        );
      }

      await address.update(updateData);

      const updatedAddress = await Address.findByPk(id);

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: { address: updatedAddress }
      });
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update address',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const deleteAddress = [
  param('id').isInt().withMessage('Address ID must be an integer'),

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

      const address = await Address.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // Check if address is being used in active orders
      const { Order } = require('../../models');
      const activeOrderCount = await Order.count({
        where: {
          user_id: req.user.id,
          address_id: id,
          status: { [Op.in]: ['pending', 'confirmed', 'processing', 'shipped'] }
        }
      });

      if (activeOrderCount > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete address that is being used in active orders'
        });
      }

      // Soft delete
      await address.destroy();

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete address',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const setDefaultAddress = [
  param('id').isInt().withMessage('Address ID must be an integer'),

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

      const address = await Address.findOne({
        where: {
          id,
          user_id: req.user.id,
          is_active: true
        }
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found or inactive'
        });
      }

      // Remove default flag from all addresses
      await Address.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );

      // Set this address as default
      await address.update({ is_default: true });

      res.json({
        success: true,
        message: 'Default address set successfully',
        data: { address }
      });
    } catch (error) {
      console.error('Set default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set default address',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
