const { Product, Category, ProductImage } = require('../../models');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock_quantity
 *         - category_id
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "Premium Dog Food"
 *         description:
 *           type: string
 *           example: "High-quality nutrition for adult dogs"
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 150000
 *         stock_quantity:
 *           type: integer
 *           minimum: 0
 *           example: 50
 *         category_id:
 *           type: integer
 *           example: 1
 *         sku:
 *           type: string
 *           maxLength: 100
 *           example: "PDF-001"
 *         weight_grams:
 *           type: integer
 *           minimum: 0
 *           example: 2000
 *         dimensions:
 *           type: string
 *           maxLength: 100
 *           example: "30x20x10 cm"
 *         is_active:
 *           type: boolean
 *           default: true
 *           example: true
 *         featured:
 *           type: boolean
 *           default: false
 *           example: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["premium", "dog", "nutrition"]
 */

/**
 * @swagger
 * /admin/products:
 *   get:
 *     tags:
 *       - Admin Products
 *     summary: Get all products
 *     description: Retrieve a paginated list of products with filtering and search
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name, description, or SKU
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, name, price, stock_quantity, created_at, updated_at]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
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
 * /admin/products/{id}:
 *   get:
 *     tags:
 *       - Admin Products
 *     summary: Get product by ID
 *     description: Retrieve a specific product by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
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
 * /admin/products:
 *   post:
 *     tags:
 *       - Admin Products
 *     summary: Create new product
 *     description: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                   example: "Product created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
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
 *       409:
 *         description: SKU already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     tags:
 *       - Admin Products
 *     summary: Update product
 *     description: Update an existing product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                   example: "Product updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: SKU already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     tags:
 *       - Admin Products
 *     summary: Delete product
 *     description: Soft delete a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: "Product deleted successfully"
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

const getProducts = [
  // Validation
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  query('is_active').optional().isIn(['true', 'false']).withMessage('is_active must be true or false'),
  query('featured').optional().isIn(['true', 'false']).withMessage('featured must be true or false'),

  async (req, res) => {
    try {
      // Check validation errors
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
        search,
        category_id,
        is_active,
        featured,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } }
        ];
      }

      // Category filter
      if (category_id) {
        whereClause.category_id = category_id;
      }

      // Active status filter
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      // Featured filter
      if (featured !== undefined) {
        whereClause.featured = featured === 'true';
      }

      // Sorting
      const validSortFields = ['id', 'name', 'price', 'stock_quantity', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: products } = await Product.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'image_url', 'alt_text', 'is_primary', 'sort_order'],
            where: { is_primary: true },
            required: false,
            limit: 1
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
          products,
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
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const getProduct = [
  param('id').isInt().withMessage('Product ID must be an integer'),

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

      const product = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description']
          },
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'image_url', 'alt_text', 'is_primary', 'sort_order']
          }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const createProduct = [
  // Validation
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('category_id').isInt().withMessage('Category ID must be an integer'),
  body('sku').optional().trim().isLength({ min: 1, max: 100 }).withMessage('SKU must be less than 100 characters'),
  body('weight_grams').optional().isInt({ min: 0 }).withMessage('Weight must be a non-negative integer'),
  body('dimensions').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Dimensions must be less than 100 characters'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('featured').optional().isBoolean().withMessage('featured must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),

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
        name,
        description,
        price,
        stock_quantity,
        category_id,
        sku,
        weight_grams,
        dimensions,
        is_active = true,
        featured = false,
        tags = []
      } = req.body;

      // Check if category exists
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if SKU is unique
      if (sku) {
        const existingProduct = await Product.findOne({ where: { sku } });
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            message: 'SKU already exists'
          });
        }
      }

      const product = await Product.create({
        name,
        description,
        price,
        stock_quantity,
        category_id,
        sku,
        weight_grams,
        dimensions,
        is_active,
        featured,
        tags
      });

      // Fetch the created product with associations
      const createdProduct = await Product.findByPk(product.id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product: createdProduct }
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const updateProduct = [
  param('id').isInt().withMessage('Product ID must be an integer'),
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be less than 255 characters'),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  body('sku').optional().trim().isLength({ min: 1, max: 100 }).withMessage('SKU must be less than 100 characters'),
  body('weight_grams').optional().isInt({ min: 0 }).withMessage('Weight must be a non-negative integer'),
  body('dimensions').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Dimensions must be less than 100 characters'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('featured').optional().isBoolean().withMessage('featured must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),

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

      // Find product
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if category exists (if updating category_id)
      if (updateData.category_id) {
        const category = await Category.findByPk(updateData.category_id);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found'
          });
        }
      }

      // Check if SKU is unique (if updating SKU)
      if (updateData.sku) {
        const existingProduct = await Product.findOne({
          where: {
            sku: updateData.sku,
            id: { [Op.ne]: id }
          }
        });
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            message: 'SKU already exists'
          });
        }
      }

      // Update product
      await product.update(updateData);

      // Fetch updated product with associations
      const updatedProduct = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product: updatedProduct }
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const deleteProduct = [
  param('id').isInt().withMessage('Product ID must be an integer'),

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

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Soft delete
      await product.destroy();

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
