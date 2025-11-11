const { ProductImage, Product } = require('../../models');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImageRequest:
 *       type: object
 *       required:
 *         - product_id
 *       properties:
 *         product_id:
 *           type: integer
 *           example: 1
 *         alt_text:
 *           type: string
 *           maxLength: 255
 *           example: "Premium dog food packaging"
 *         is_primary:
 *           type: boolean
 *           default: false
 *           example: true
 *         sort_order:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 1
 */

/**
 * @swagger
 * /admin/product-images:
 *   get:
 *     tags:
 *       - Admin Product Images
 *     summary: Get all product images
 *     description: Retrieve a paginated list of product images with filtering
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
 *         name: product_id
 *         schema:
 *           type: integer
 *         description: Filter by product ID
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, sort_order, created_at, updated_at]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Product images retrieved successfully
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
 *                     images:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductImage'
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
 * /admin/product-images:
 *   post:
 *     tags:
 *       - Admin Product Images
 *     summary: Upload product image
 *     description: Upload a new image for a product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - product_id
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP) - max 5MB
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               alt_text:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Premium dog food packaging"
 *               is_primary:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *               sort_order:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product image uploaded successfully
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
 *                   example: "Product image uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       $ref: '#/components/schemas/ProductImage'
 *       400:
 *         description: Validation error or invalid file
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/product-images/{id}:
 *   put:
 *     tags:
 *       - Admin Product Images
 *     summary: Update product image
 *     description: Update product image metadata
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductImageRequest'
 *     responses:
 *       200:
 *         description: Product image updated successfully
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
 *                   example: "Product image updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       $ref: '#/components/schemas/ProductImage'
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
 *         description: Product image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Only one primary image allowed per product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/product-images/{id}:
 *   delete:
 *     tags:
 *       - Admin Product Images
 *     summary: Delete product image
 *     description: Delete a product image and remove the file from storage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product image ID
 *     responses:
 *       200:
 *         description: Product image deleted successfully
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
 *                   example: "Product image deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const getProductImages = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('product_id').optional().isInt().withMessage('Product ID must be an integer'),

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
        product_id,
        sort_by = 'sort_order',
        sort_order = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (product_id) {
        whereClause.product_id = product_id;
      }

      const validSortFields = ['id', 'sort_order', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'sort_order';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: images } = await ProductImage.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
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
          images,
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
      console.error('Get product images error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product images',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const uploadProductImage = [
  upload.single('image'),

  body('product_id').isInt().withMessage('Product ID must be an integer'),
  body('alt_text').optional().trim().isLength({ max: 255 }).withMessage('Alt text must be less than 255 characters'),
  body('is_primary').optional().isBoolean().withMessage('is_primary must be a boolean'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Delete uploaded file if validation fails
        if (req.file) {
          const fs = require('fs');
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      const {
        product_id,
        alt_text,
        is_primary = false,
        sort_order = 0
      } = req.body;

      // Check if product exists
      const product = await Product.findByPk(product_id);
      if (!product) {
        // Delete uploaded file
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // If setting as primary, remove primary flag from other images
      if (is_primary) {
        await ProductImage.update(
          { is_primary: false },
          { where: { product_id, is_primary: true } }
        );
      }

      const imageUrl = `/uploads/products/${req.file.filename}`;

      const productImage = await ProductImage.create({
        product_id,
        image_url: imageUrl,
        alt_text,
        is_primary,
        sort_order
      });

      res.status(201).json({
        success: true,
        message: 'Product image uploaded successfully',
        data: { image: productImage }
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }

      console.error('Upload product image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload product image',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const updateProductImage = [
  param('id').isInt().withMessage('Image ID must be an integer'),
  body('alt_text').optional().trim().isLength({ max: 255 }).withMessage('Alt text must be less than 255 characters'),
  body('is_primary').optional().isBoolean().withMessage('is_primary must be a boolean'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),

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

      const image = await ProductImage.findByPk(id);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Product image not found'
        });
      }

      // If setting as primary, remove primary flag from other images of same product
      if (updateData.is_primary) {
        await ProductImage.update(
          { is_primary: false },
          {
            where: {
              product_id: image.product_id,
              is_primary: true,
              id: { [Op.ne]: id }
            }
          }
        );
      }

      await image.update(updateData);

      const updatedImage = await ProductImage.findByPk(id, {
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Product image updated successfully',
        data: { image: updatedImage }
      });
    } catch (error) {
      console.error('Update product image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product image',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const deleteProductImage = [
  param('id').isInt().withMessage('Image ID must be an integer'),

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

      const image = await ProductImage.findByPk(id);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Product image not found'
        });
      }

      // Delete file from filesystem
      try {
        const fs = require('fs');
        const filePath = path.join(__dirname, '../../', image.image_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.warn('Failed to delete image file:', fileError.message);
      }

      // Soft delete from database
      await image.destroy();

      res.json({
        success: true,
        message: 'Product image deleted successfully'
      });
    } catch (error) {
      console.error('Delete product image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product image',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  getProductImages,
  uploadProductImage,
  updateProductImage,
  deleteProductImage,
  upload // Export multer upload middleware for use in routes
};
