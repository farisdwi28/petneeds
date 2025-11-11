const { Cart, Product, ProductImage } = require('../../models');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItemRequest:
 *       type: object
 *       required:
 *         - product_id
 *       properties:
 *         product_id:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 2
 *     CartItemUpdateRequest:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 3
 *     CartResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             cart:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       product_id:
 *                         type: integer
 *                       product_name:
 *                         type: string
 *                       product_sku:
 *                         type: string
 *                       product_price:
 *                         type: number
 *                         format: float
 *                       product_image:
 *                         type: string
 *                         format: uri
 *                         nullable: true
 *                       quantity:
 *                         type: integer
 *                       stock_available:
 *                         type: integer
 *                       subtotal:
 *                         type: number
 *                         format: float
 *                       added_at:
 *                         type: string
 *                         format: date-time
 *                       is_available:
 *                         type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_items:
 *                       type: integer
 *                     total_amount:
 *                       type: number
 *                       format: float
 *                     item_count:
 *                       type: integer
 */

/**
 * @swagger
 * /customer/cart:
 *   get:
 *     tags:
 *       - Customer Cart
 *     summary: Get cart items
 *     description: Retrieve all items in the customer's shopping cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/cart:
 *   post:
 *     tags:
 *       - Customer Cart
 *     summary: Add item to cart
 *     description: Add a product to the customer's shopping cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemRequest'
 *     responses:
 *       201:
 *         description: Item added to cart successfully
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
 *                   example: "Product added to cart"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart_item:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         product_id:
 *                           type: integer
 *                         quantity:
 *                           type: integer
 *                         added_at:
 *                           type: string
 *                           format: date-time
 *                         product:
 *                           $ref: '#/components/schemas/Product'
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/cart/{productId}:
 *   put:
 *     tags:
 *       - Customer Cart
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific item in the cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID in cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemUpdateRequest'
 *     responses:
 *       200:
 *         description: Cart item updated successfully
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
 *                   example: "Cart item updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart_item:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         product_id:
 *                           type: integer
 *                         quantity:
 *                           type: integer
 *                         added_at:
 *                           type: string
 *                           format: date-time
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
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/cart/{productId}:
 *   delete:
 *     tags:
 *       - Customer Cart
 *     summary: Remove item from cart
 *     description: Remove a specific item from the customer's cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to remove from cart
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
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
 *                   example: "Product removed from cart successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/cart:
 *   delete:
 *     tags:
 *       - Customer Cart
 *     summary: Clear cart
 *     description: Remove all items from the customer's cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
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
 *                   example: "Cart cleared successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'sku', 'stock_quantity', 'is_active'],
          include: [
            {
              model: ProductImage,
              as: 'images',
              attributes: ['id', 'image_url', 'alt_text', 'is_primary'],
              where: { is_primary: true },
              required: false,
              limit: 1
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;

    const formattedCart = cartItems.map(item => {
      const product = item.product;
      const subtotal = product.price * item.quantity;
      totalItems += item.quantity;
      totalAmount += subtotal;

      return {
        id: item.id,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product_price: product.price,
        product_image: product.images && product.images.length > 0 ? product.images[0].image_url : null,
        quantity: item.quantity,
        stock_available: product.stock_quantity,
        subtotal: subtotal,
        added_at: item.added_at,
        is_available: product.is_active && product.stock_quantity > 0
      };
    });

    res.json({
      success: true,
      data: {
        cart: {
          items: formattedCart,
          summary: {
            total_items: totalItems,
            total_amount: totalAmount,
            item_count: cartItems.length
          }
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

const addToCart = [
  body('product_id').isInt().withMessage('Product ID must be an integer'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

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

      const { product_id, quantity = 1 } = req.body;

      // Check if product exists and is active
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (!product.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Product is not available'
        });
      }

      if (product.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.stock_quantity}`
        });
      }

      // Check if item already exists in cart
      const existingCartItem = await Cart.findOne({
        where: {
          user_id: req.user.id,
          product_id
        }
      });

      let cartItem;
      if (existingCartItem) {
        // Update quantity
        const newQuantity = existingCartItem.quantity + quantity;

        if (product.stock_quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Available: ${product.stock_quantity}, requested: ${newQuantity}`
          });
        }

        cartItem = await existingCartItem.update({ quantity: newQuantity });
      } else {
        // Create new cart item
        cartItem = await Cart.create({
          user_id: req.user.id,
          product_id,
          quantity
        });
      }

      // Fetch updated cart item with product details
      const updatedCartItem = await Cart.findByPk(cartItem.id, {
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'sku', 'stock_quantity'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url', 'alt_text', 'is_primary'],
                where: { is_primary: true },
                required: false,
                limit: 1
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: existingCartItem ? 'Cart item quantity updated' : 'Product added to cart',
        data: { cart_item: updatedCartItem }
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add product to cart',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const updateCartItem = [
  param('productId').isInt().withMessage('Product ID must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

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

      const { productId } = req.params;
      const { quantity } = req.body;

      const cartItem = await Cart.findOne({
        where: {
          user_id: req.user.id,
          product_id: productId
        },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'stock_quantity', 'is_active']
          }
        ]
      });

      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Check stock availability
      if (cartItem.product.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${cartItem.product.stock_quantity}`
        });
      }

      // Check if product is still active
      if (!cartItem.product.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Product is no longer available'
        });
      }

      await cartItem.update({ quantity });

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: { cart_item: cartItem }
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const removeFromCart = [
  param('productId').isInt().withMessage('Product ID must be an integer'),

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

      const { productId } = req.params;

      const cartItem = await Cart.findOne({
        where: {
          user_id: req.user.id,
          product_id: productId
        }
      });

      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Soft delete
      await cartItem.destroy();

      res.json({
        success: true,
        message: 'Product removed from cart successfully'
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove product from cart',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
];

const clearCart = async (req, res) => {
  try {
    await Cart.destroy({
      where: { user_id: req.user.id }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
