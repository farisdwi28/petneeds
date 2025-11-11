const request = require('supertest');
const app = require('../../app');
const { User, Category, Product, Address, Order, OrderItem, Payment } = require('../../models');

describe('Complete User Flow Integration Test', () => {
  let customerToken;
  let adminToken;
  let testCategory;
  let testProduct;
  let testAddress;
  let testOrder;
  let testPayment;

  describe('User Registration and Authentication', () => {
    it('should register a new customer', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Integration Test Customer',
          email: 'integration@test.com',
          password: 'password123',
          phone: '08123456789'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('integration@test.com');
      expect(response.body.data.token).toBeDefined();
      customerToken = response.body.data.token;
    });

    it('should register an admin user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Integration Test Admin',
          email: 'integration-admin@test.com',
          password: 'password123',
          role: 'admin'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('admin');
      adminToken = response.body.data.token;
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      customerToken = response.body.data.token;
    });
  });

  describe('Admin Setup - Create Category and Product', () => {
    it('should create a product category', async () => {
      const response = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Integration Test Category',
          description: 'Category for integration testing',
          is_active: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category.name).toBe('Integration Test Category');
      testCategory = response.body.data.category;
    });

    it('should create a product', async () => {
      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Integration Test Product',
          description: 'Product for integration testing',
          price: 100000,
          stock_quantity: 50,
          category_id: testCategory.id,
          sku: 'INT-TEST-001',
          weight_grams: 500,
          dimensions: '10x10x5',
          is_active: true,
          featured: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe('Integration Test Product');
      expect(response.body.data.product.price).toBe(100000);
      testProduct = response.body.data.product;
    });
  });

  describe('Customer Address Management', () => {
    it('should create a customer address', async () => {
      const response = await request(app)
        .post('/api/v1/customer/addresses')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          label: 'Home',
          recipient_name: 'Integration Test Customer',
          phone: '08123456789',
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          postal_code: '12160',
          full_address: 'Jl. Integration Test No. 123',
          latitude: -6.2088,
          longitude: 106.8456
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.address.recipient_name).toBe('Integration Test Customer');
      testAddress = response.body.data.address;
    });

    it('should get customer addresses', async () => {
      const response = await request(app)
        .get('/api/v1/customer/addresses')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.addresses.length).toBeGreaterThan(0);
      expect(response.body.data.addresses[0].id).toBe(testAddress.id);
    });
  });

  describe('Shopping Cart Operations', () => {
    it('should add product to cart', async () => {
      const response = await request(app)
        .post('/api/v1/customer/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.length).toBe(1);
      expect(response.body.data.cart[0].quantity).toBe(2);
    });

    it('should get cart contents', async () => {
      const response = await request(app)
        .get('/api/v1/customer/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.length).toBe(1);
      expect(response.body.data.cart[0].product.name).toBe('Integration Test Product');
    });

    it('should update cart item quantity', async () => {
      const response = await request(app)
        .put(`/api/v1/customer/cart/${testProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          quantity: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart[0].quantity).toBe(3);
    });
  });

  describe('Order Creation and Payment', () => {
    it('should create an order from cart', async () => {
      const response = await request(app)
        .post('/api/v1/customer/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          address_id: testAddress.id,
          shipping_method: 'JNE REG',
          notes: 'Integration test order'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('pending');
      expect(response.body.data.order.total_amount).toBe(300000); // 3 items * 100000
      testOrder = response.body.data.order;
    });

    it('should verify cart is cleared after order creation', async () => {
      const response = await request(app)
        .get('/api/v1/customer/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.length).toBe(0);
    });

    it('should create payment for the order', async () => {
      // Mock Midtrans response
      jest.mock('../../utils/midtrans', () => ({
        createTransaction: jest.fn().mockResolvedValue({
          success: true,
          data: {
            token: 'integration-test-token-123',
            redirect_url: 'https://app.sandbox.midtrans.com/payment/integration-test-token-123'
          }
        })
      }));

      const response = await request(app)
        .post('/api/v1/customer/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: testOrder.id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.order_id).toBe(testOrder.id);
      expect(response.body.data.payment.amount).toBe(300000);
      expect(response.body.data.payment.token).toBe('integration-test-token-123');
      testPayment = response.body.data.payment;
    });
  });

  describe('Order Management', () => {
    it('should get customer orders', async () => {
      const response = await request(app)
        .get('/api/v1/customer/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
      expect(response.body.data.orders[0].id).toBe(testOrder.id);
    });

    it('should get specific order details', async () => {
      const response = await request(app)
        .get(`/api/v1/customer/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.id).toBe(testOrder.id);
      expect(response.body.data.order.items).toBeDefined();
      expect(response.body.data.order.items.length).toBe(1);
    });
  });

  describe('Payment Webhook Simulation', () => {
    it('should handle payment settlement webhook', async () => {
      const webhookData = {
        order_id: testOrder.order_number,
        transaction_id: 'integration-transaction-123',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '300000',
        signature_key: 'integration-signature-key'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify order and payment status updated
      const updatedOrder = await Order.findByPk(testOrder.id);
      const updatedPayment = await Payment.findByPk(testPayment.id);

      expect(updatedOrder.payment_status).toBe('paid');
      expect(updatedOrder.status).toBe('confirmed');
      expect(updatedPayment.status).toBe('settlement');
      expect(updatedPayment.payment_date).not.toBeNull();
    });
  });

  describe('Admin Monitoring', () => {
    it('should allow admin to view all products', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('should allow admin to view payments', async () => {
      const response = await request(app)
        .get('/api/v1/admin/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow admin to sync payment status', async () => {
      // Mock getTransactionStatus
      jest.mock('../../utils/midtrans', () => ({
        getTransactionStatus: jest.fn().mockResolvedValue({
          success: true,
          data: {
            transaction_status: 'settlement',
            fraud_status: 'accept',
            payment_type: 'credit_card'
          }
        })
      }));

      const response = await request(app)
        .post(`/api/v1/admin/payments/sync/${testOrder.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Profile Management', () => {
    it('should allow customer to view profile', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('integration@test.com');
    });

    it('should allow customer to update profile', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Updated Integration Customer',
          phone: '08198765432'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Integration Customer');
    });
  });
});
