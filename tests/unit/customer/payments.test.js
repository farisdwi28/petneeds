const request = require('supertest');
const app = require('../../../app');
const { User, Address, Order, Payment } = require('../../../models');

describe('Customer Payment Endpoints', () => {
  let customerToken;
  let testUser;
  let testAddress;
  let testOrder;
  let pendingOrder;

  beforeAll(async () => {
    // Create test customer user
    testUser = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD4YOFJf7QXqYzKm', // password123
      role: 'customer',
      is_active: true,
      phone: '08123456789'
    });

    // Create test address
    testAddress = await Address.create({
      user_id: testUser.id,
      label: 'Home',
      recipient_name: 'Test Customer',
      phone: '08123456789',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      postal_code: '12160',
      full_address: 'Jl. Test No. 123',
      is_default: true,
      is_active: true
    });

    // Create test orders
    testOrder = await Order.create({
      order_number: 'ORD-TEST-001',
      user_id: testUser.id,
      address_id: testAddress.id,
      status: 'confirmed',
      subtotal: 100000,
      shipping_cost: 10000,
      tax_amount: 10000,
      discount_amount: 0,
      total_amount: 120000,
      payment_status: 'paid'
    });

    pendingOrder = await Order.create({
      order_number: 'ORD-TEST-002',
      user_id: testUser.id,
      address_id: testAddress.id,
      status: 'pending',
      subtotal: 200000,
      shipping_cost: 15000,
      tax_amount: 20000,
      discount_amount: 0,
      total_amount: 235000,
      payment_status: 'pending'
    });

    // Create test payment for completed order
    await Payment.create({
      order_id: testOrder.id,
      user_id: testUser.id,
      payment_method: 'midtrans',
      amount: 120000,
      currency: 'IDR',
      status: 'settlement',
      midtrans_order_id: 'ORD-TEST-001',
      payment_date: new Date()
    });

    // Get customer token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'password123'
      });
    customerToken = loginResponse.body.data.token;
  });

  describe('POST /api/v1/customer/payments', () => {
    it('should create payment successfully for pending order', async () => {
      // Mock Midtrans response
      const mockMidtransResponse = {
        token: 'test-token-123',
        redirect_url: 'https://app.sandbox.midtrans.com/payment/test-token-123'
      };

      // Mock the createTransaction function
      jest.mock('../../../utils/midtrans', () => ({
        createTransaction: jest.fn().mockResolvedValue({
          success: true,
          data: mockMidtransResponse
        })
      }));

      const response = await request(app)
        .post('/api/v1/customer/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: pendingOrder.id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.order_id).toBe(pendingOrder.id);
      expect(response.body.data.payment.amount).toBe(235000);
      expect(response.body.data.payment.status).toBe('pending');
      expect(response.body.data.payment.token).toBe('test-token-123');
    });

    it('should return error for non-existent order', async () => {
      const response = await request(app)
        .post('/api/v1/customer/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: 99999
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return error for order that doesn\'t belong to user', async () => {
      // Create another user and order
      const otherUser = await User.create({
        name: 'Other Customer',
        email: 'other@test.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD4YOFJf7QXqYzKm',
        role: 'customer',
        is_active: true
      });

      const otherOrder = await Order.create({
        order_number: 'ORD-OTHER-001',
        user_id: otherUser.id,
        address_id: testAddress.id,
        status: 'pending',
        subtotal: 50000,
        shipping_cost: 5000,
        tax_amount: 5000,
        discount_amount: 0,
        total_amount: 60000,
        payment_status: 'pending'
      });

      const response = await request(app)
        .post('/api/v1/customer/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: otherOrder.id
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return error for order that is not pending', async () => {
      const response = await request(app)
        .post('/api/v1/customer/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: testOrder.id // This order is already confirmed
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not in pending status');
    });

    it('should return validation error for missing order_id', async () => {
      const response = await request(app)
        .post('/api/v1/customer/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return error when Midtrans fails', async () => {
      // Mock Midtrans failure
      jest.mock('../../../utils/midtrans', () => ({
        createTransaction: jest.fn().mockResolvedValue({
          success: false,
          error: 'Midtrans connection failed'
        })
      }));

      const response = await request(app)
        .post('/api/v1/customer/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: pendingOrder.id
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to create payment transaction');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/customer/payments')
        .send({
          order_id: pendingOrder.id
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/customer/payments/:id', () => {
    let testPayment;

    beforeAll(async () => {
      testPayment = await Payment.create({
        order_id: testOrder.id,
        user_id: testUser.id,
        payment_method: 'midtrans',
        amount: 120000,
        currency: 'IDR',
        status: 'settlement',
        midtrans_order_id: 'ORD-TEST-001',
        payment_date: new Date()
      });
    });

    it('should get payment successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/customer/payments/${testPayment.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.id).toBe(testPayment.id);
      expect(response.body.data.payment.amount).toBe(120000);
      expect(response.body.data.payment.status).toBe('settlement');
    });

    it('should return error for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/v1/customer/payments/99999')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return error for payment that doesn\'t belong to user', async () => {
      // Create another user and payment
      const otherUser = await User.create({
        name: 'Another Customer',
        email: 'another@test.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD4YOFJf7QXqYzKm',
        role: 'customer',
        is_active: true
      });

      const otherOrder = await Order.create({
        order_number: 'ORD-ANOTHER-001',
        user_id: otherUser.id,
        address_id: testAddress.id,
        status: 'confirmed',
        subtotal: 75000,
        shipping_cost: 7500,
        tax_amount: 7500,
        discount_amount: 0,
        total_amount: 90000,
        payment_status: 'paid'
      });

      const otherPayment = await Payment.create({
        order_id: otherOrder.id,
        user_id: otherUser.id,
        payment_method: 'midtrans',
        amount: 90000,
        currency: 'IDR',
        status: 'settlement',
        midtrans_order_id: 'ORD-ANOTHER-001'
      });

      const response = await request(app)
        .get(`/api/v1/customer/payments/${otherPayment.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid ID', async () => {
      const response = await request(app)
        .get('/api/v1/customer/payments/invalid-id')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/customer/orders/:orderId/payment', () => {
    it('should get payment by order ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/customer/orders/${testOrder.id}/payment`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.order_id).toBe(testOrder.id);
    });

    it('should return error for order without payment', async () => {
      const response = await request(app)
        .get(`/api/v1/customer/orders/${pendingOrder.id}/payment`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return error for order that doesn\'t belong to user', async () => {
      // Create another user and order
      const otherUser = await User.create({
        name: 'Different Customer',
        email: 'different@test.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD4YOFJf7QXqYzKm',
        role: 'customer',
        is_active: true
      });

      const otherOrder = await Order.create({
        order_number: 'ORD-DIFFERENT-001',
        user_id: otherUser.id,
        address_id: testAddress.id,
        status: 'confirmed',
        subtotal: 100000,
        shipping_cost: 10000,
        tax_amount: 10000,
        discount_amount: 0,
        total_amount: 120000,
        payment_status: 'paid'
      });

      const response = await request(app)
        .get(`/api/v1/customer/orders/${otherOrder.id}/payment`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid order ID', async () => {
      const response = await request(app)
        .get('/api/v1/customer/orders/invalid-id/payment')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
