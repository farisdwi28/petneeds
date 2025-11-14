const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Load environment variables - set NODE_ENV to 'development' if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const webhookRoutes = require('./routes/webhook');
const guestRoutes = require('./routes/guest');
const { authenticate } = require('./middleware/auth');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetNeeds API',
      version: '1.0.0',
      description: 'RESTful API for PetNeeds e-commerce platform with Midtrans payment integration',
      contact: {
        name: 'PetNeeds Support',
        email: 'support@petneeds.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'object'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'customer'] },
            phone: { type: 'string' },
            is_active: { type: 'boolean' },
            email_verified_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            image_url: { type: 'string', format: 'uri' },
            is_active: { type: 'boolean' },
            sort_order: { type: 'integer' },
            product_count: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'float' },
            stock_quantity: { type: 'integer' },
            category_id: { type: 'integer' },
            sku: { type: 'string' },
            weight_grams: { type: 'integer' },
            dimensions: { type: 'string' },
            is_active: { type: 'boolean' },
            featured: { type: 'boolean' },
            tags: { type: 'array', items: { type: 'string' } },
            category: { $ref: '#/components/schemas/Category' },
            images: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductImage' }
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        ProductImage: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            product_id: { type: 'integer' },
            image_url: { type: 'string', format: 'uri' },
            alt_text: { type: 'string' },
            is_primary: { type: 'boolean' },
            sort_order: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            label: { type: 'string' },
            recipient_name: { type: 'string' },
            phone: { type: 'string' },
            province: { type: 'string' },
            city: { type: 'string' },
            district: { type: 'string' },
            postal_code: { type: 'string' },
            full_address: { type: 'string' },
            latitude: { type: 'number', format: 'float' },
            longitude: { type: 'number', format: 'float' },
            is_default: { type: 'boolean' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            product_id: { type: 'integer' },
            quantity: { type: 'integer' },
            added_at: { type: 'string', format: 'date-time' },
            product: { $ref: '#/components/schemas/Product' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_number: { type: 'string' },
            user_id: { type: 'integer' },
            address_id: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
            },
            subtotal: { type: 'number', format: 'float' },
            shipping_cost: { type: 'number', format: 'float' },
            tax_amount: { type: 'number', format: 'float' },
            discount_amount: { type: 'number', format: 'float' },
            total_amount: { type: 'number', format: 'float' },
            payment_status: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded']
            },
            shipping_method: { type: 'string' },
            tracking_number: { type: 'string' },
            notes: { type: 'string' },
            ordered_at: { type: 'string', format: 'date-time' },
            shipped_at: { type: 'string', format: 'date-time', nullable: true },
            delivered_at: { type: 'string', format: 'date-time', nullable: true },
            address: { $ref: '#/components/schemas/Address' },
            orderItems: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' }
            },
            payment: { $ref: '#/components/schemas/Payment' }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_id: { type: 'integer' },
            product_id: { type: 'integer' },
            quantity: { type: 'integer' },
            unit_price: { type: 'number', format: 'float' },
            total_price: { type: 'number', format: 'float' },
            product_name: { type: 'string' },
            product_sku: { type: 'string' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_id: { type: 'integer' },
            user_id: { type: 'integer' },
            payment_method: {
              type: 'string',
              enum: ['midtrans', 'bank_transfer', 'credit_card', 'ewallet']
            },
            midtrans_transaction_id: { type: 'string' },
            midtrans_order_id: { type: 'string' },
            midtrans_payment_type: { type: 'string' },
            amount: { type: 'number', format: 'float' },
            currency: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'settlement', 'capture', 'cancel', 'deny', 'expire', 'failure', 'refund', 'partial_refund']
            },
            fraud_status: {
              type: 'string',
              enum: ['accept', 'challenge', 'deny']
            },
            payment_date: { type: 'string', format: 'date-time' },
            payment_url: { type: 'string', format: 'uri' }
          }
        },
        Shipment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_id: { type: 'integer' },
            tracking_number: { type: 'string' },
            carrier: { type: 'string' },
            service_type: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'pickup', 'in_transit', 'delivered', 'failed', 'returned']
            },
            estimated_delivery: { type: 'string', format: 'date-time' },
            actual_delivery: { type: 'string', format: 'date-time' },
            weight_grams: { type: 'integer' },
            dimensions: { type: 'string' },
            shipping_cost: { type: 'number', format: 'float' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/**/*.js'] // Paths to files containing OpenAPI definitions
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Higher limit for webhooks
  message: 'Too many webhook requests'
});

// Apply rate limiting to all routes except webhooks
app.use('/api/', limiter);
app.use('/api/webhook/', webhookLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', guestRoutes); // Guest routes (public, no authentication required)
app.use('/api/v1/admin', authenticate, adminRoutes);
app.use('/api/v1/customer', authenticate, customerRoutes);
app.use('/api/v1/webhook', webhookRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PetNeeds API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint - remove in production
app.get('/api/v1/debug', (req, res) => {
  const { verifyToken } = require('./utils/jwt');
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwZXRuZWVkcy5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI4Njg5MjQsImV4cCI6MTc2Mjg3MjUyNH0.TnXNQfgVJQS0YIPkS19TGsTncaR3zNseP30HhufnUkU';

  let tokenValid = false;
  let tokenData = null;
  try {
    tokenData = verifyToken(testToken);
    tokenValid = true;
  } catch (error) {
    tokenData = error.message;
  }

  res.json({
    node_env: process.env.NODE_ENV,
    jwt_secret_loaded: !!process.env.JWT_SECRET,
    jwt_secret_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    port: process.env.PORT || 3000,
    jwt_test: {
      token_valid: tokenValid,
      token_data: tokenData
    }
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PetNeeds API server running on port ${PORT}`);
});

module.exports = app;
