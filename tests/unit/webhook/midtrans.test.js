const request = require('supertest');
const app = require('../../../app');
const { User, Address, Order, Payment } = require('../../../models');

describe('Midtrans Webhook Endpoints', () => {
  let testUser;
  let testAddress;
  let testOrder;
  let testPayment;

  beforeAll(async () => {
    // Create test data
    testUser = await User.create({
      name: 'Webhook Test Customer',
      email: 'webhook@test.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD4YOFJf7QXqYzKm',
      role: 'customer',
      is_active: true
    });

    testAddress = await Address.create({
      user_id: testUser.id,
      label: 'Home',
      recipient_name: 'Webhook Test Customer',
      phone: '08123456789',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      postal_code: '10350',
      full_address: 'Jl. Webhook Test No. 456',
      is_default: true,
      is_active: true
    });

    testOrder = await Order.create({
      order_number: 'WEBHOOK-TEST-001',
      user_id: testUser.id,
      address_id: testAddress.id,
      status: 'pending',
      subtotal: 150000,
      shipping_cost: 15000,
      tax_amount: 15000,
      discount_amount: 0,
      total_amount: 180000,
      payment_status: 'pending'
    });

    testPayment = await Payment.create({
      order_id: testOrder.id,
      user_id: testUser.id,
      payment_method: 'midtrans',
      amount: 180000,
      currency: 'IDR',
      status: 'pending',
      midtrans_order_id: 'WEBHOOK-TEST-001'
    });
  });

  describe('POST /api/v1/webhook/midtrans/notification', () => {
    it('should handle settlement webhook successfully', async () => {
      const webhookData = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'test-transaction-123',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '180000',
        signature_key: 'test-signature-key'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('processed successfully');

      // Verify payment was updated
      const updatedPayment = await Payment.findByPk(testPayment.id);
      expect(updatedPayment.status).toBe('settlement');
      expect(updatedPayment.midtrans_transaction_id).toBe('test-transaction-123');
      expect(updatedPayment.payment_date).not.toBeNull();

      // Verify order was updated
      const updatedOrder = await Order.findByPk(testOrder.id);
      expect(updatedOrder.payment_status).toBe('paid');
      expect(updatedOrder.status).toBe('confirmed');
    });

    it('should handle pending webhook successfully', async () => {
      // Reset payment and order status
      await testPayment.update({ status: 'pending' });
      await testOrder.update({ status: 'pending', payment_status: 'pending' });

      const webhookData = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'test-transaction-456',
        transaction_status: 'pending',
        fraud_status: 'accept',
        payment_type: 'bank_transfer',
        gross_amount: '180000'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify payment status
      const updatedPayment = await Payment.findByPk(testPayment.id);
      expect(updatedPayment.status).toBe('pending');
      expect(updatedPayment.midtrans_transaction_id).toBe('test-transaction-456');
    });

    it('should handle failure webhook and update order status', async () => {
      // Reset to pending status
      await testPayment.update({ status: 'pending' });
      await testOrder.update({ status: 'pending', payment_status: 'pending' });

      const webhookData = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'test-transaction-789',
        transaction_status: 'deny',
        fraud_status: 'deny',
        payment_type: 'credit_card',
        gross_amount: '180000'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify payment status
      const updatedPayment = await Payment.findByPk(testPayment.id);
      expect(updatedPayment.status).toBe('deny');

      // Verify order status
      const updatedOrder = await Order.findByPk(testOrder.id);
      expect(updatedOrder.payment_status).toBe('failed');
      expect(updatedOrder.status).toBe('cancelled');
    });

    it('should handle expire webhook successfully', async () => {
      const webhookData = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'test-transaction-exp',
        transaction_status: 'expire',
        fraud_status: 'accept',
        payment_type: 'bank_transfer',
        gross_amount: '180000'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify payment expiry time is set
      const updatedPayment = await Payment.findByPk(testPayment.id);
      expect(updatedPayment.status).toBe('expire');
      expect(updatedPayment.expiry_time).not.toBeNull();
    });

    it('should handle cancel webhook successfully', async () => {
      const webhookData = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'test-transaction-cancel',
        transaction_status: 'cancel',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '180000'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedPayment = await Payment.findByPk(testPayment.id);
      expect(updatedPayment.status).toBe('cancel');
    });

    it('should handle webhook with signature verification', async () => {
      const webhookData = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'test-transaction-sig',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '180000'
      };

      // Test with invalid signature (would be rejected if WEBHOOK_SECRET_KEY is set)
      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .set('x-signature', 'invalid-signature')
        .send(webhookData);

      // Should still work since we don't have WEBHOOK_SECRET_KEY set in test
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle webhook logs correctly', async () => {
      const webhookData = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'test-transaction-log',
        transaction_status: 'capture',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '180000',
        custom_field: 'test-value'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify webhook logs are stored
      const updatedPayment = await Payment.findByPk(testPayment.id);
      expect(updatedPayment.webhook_logs).toBeDefined();
      expect(Array.isArray(updatedPayment.webhook_logs)).toBe(true);
      expect(updatedPayment.webhook_logs.length).toBeGreaterThan(0);

      // Check last log entry
      const lastLog = updatedPayment.webhook_logs[updatedPayment.webhook_logs.length - 1];
      expect(lastLog.notification).toEqual(webhookData);
      expect(lastLog.received_at).toBeDefined();
    });

    it('should return error for unknown order_id', async () => {
      const webhookData = {
        order_id: 'UNKNOWN-ORDER-123',
        transaction_id: 'unknown-transaction',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '100000'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(webhookData);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Payment not found');
    });

    it('should handle malformed webhook data gracefully', async () => {
      const malformedData = {
        // Missing required fields
        transaction_status: 'settlement'
      };

      const response = await request(app)
        .post('/api/v1/webhook/midtrans/notification')
        .send(malformedData);

      // Should handle gracefully and return error
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Payment not found');
    });

    it('should handle concurrent webhooks correctly', async () => {
      const webhookData1 = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'concurrent-1',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '180000'
      };

      const webhookData2 = {
        order_id: 'WEBHOOK-TEST-001',
        transaction_id: 'concurrent-2',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card',
        gross_amount: '180000'
      };

      // Send both webhooks simultaneously
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/v1/webhook/midtrans/notification')
          .send(webhookData1),
        request(app)
          .post('/api/v1/webhook/midtrans/notification')
          .send(webhookData2)
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });

    it('should handle different transaction statuses correctly', async () => {
      const testCases = [
        { status: 'capture', expectedOrderStatus: 'confirmed', expectedPaymentStatus: 'paid' },
        { status: 'settlement', expectedOrderStatus: 'confirmed', expectedPaymentStatus: 'paid' },
        { status: 'pending', expectedOrderStatus: 'pending', expectedPaymentStatus: 'pending' },
        { status: 'deny', expectedOrderStatus: 'cancelled', expectedPaymentStatus: 'failed' },
        { status: 'cancel', expectedOrderStatus: 'cancelled', expectedPaymentStatus: 'failed' },
        { status: 'expire', expectedOrderStatus: 'cancelled', expectedPaymentStatus: 'failed' },
        { status: 'failure', expectedOrderStatus: 'cancelled', expectedPaymentStatus: 'failed' }
      ];

      for (const testCase of testCases) {
        // Reset order and payment status
        await testOrder.update({ status: 'pending', payment_status: 'pending' });
        await testPayment.update({ status: 'pending' });

        const webhookData = {
          order_id: 'WEBHOOK-TEST-001',
          transaction_id: `test-${testCase.status}`,
          transaction_status: testCase.status,
          fraud_status: 'accept',
          payment_type: 'credit_card',
          gross_amount: '180000'
        };

        const response = await request(app)
          .post('/api/v1/webhook/midtrans/notification')
          .send(webhookData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify final states
        const updatedOrder = await Order.findByPk(testOrder.id);
        const updatedPayment = await Payment.findByPk(testPayment.id);

        expect(updatedPayment.status).toBe(testCase.status);
        expect(updatedOrder.payment_status).toBe(testCase.expectedPaymentStatus);

        if (testCase.expectedOrderStatus !== 'pending') {
          expect(updatedOrder.status).toBe(testCase.expectedOrderStatus);
        }
      }
    });
  });
});
