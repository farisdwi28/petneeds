const request = require('supertest');
const app = require('../../../app');
const { User, Category, Product } = require('../../../models');

describe('Admin Product Endpoints', () => {
  let adminToken;
  let customerToken;
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    // Create test admin user
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD4YOFJf7QXqYzKm', // password123
      role: 'admin',
      is_active: true
    });

    // Create test customer user
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD4YOFJf7QXqYzKm', // password123
      role: 'customer',
      is_active: true
    });

    // Create test category
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Test category description',
      is_active: true
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });
    adminToken = adminLogin.body.data.token;

    const customerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'password123'
      });
    customerToken = customerLogin.body.data.token;

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test product description',
      price: 100000,
      stock_quantity: 50,
      category_id: testCategory.id,
      sku: 'TEST-001',
      is_active: true,
      featured: false
    });
  });

  describe('GET /api/v1/admin/products', () => {
    beforeAll(async () => {
      // Create additional products for testing
      await Product.create({
        name: 'Another Product',
        description: 'Another product description',
        price: 200000,
        stock_quantity: 30,
        category_id: testCategory.id,
        sku: 'TEST-002',
        is_active: true,
        featured: true
      });

      await Product.create({
        name: 'Inactive Product',
        description: 'Inactive product description',
        price: 50000,
        stock_quantity: 10,
        category_id: testCategory.id,
        sku: 'TEST-003',
        is_active: false,
        featured: false
      });
    });

    it('should get all products successfully', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter products by search term', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products?search=Another')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].name).toBe('Another Product');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/products?category_id=${testCategory.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter products by active status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products?is_active=false')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].is_active).toBe(false);
    });

    it('should filter products by featured status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products?featured=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].featured).toBe(true);
    });

    it('should paginate products correctly', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBe(2);
      expect(response.body.data.pagination.current_page).toBe(1);
      expect(response.body.data.pagination.items_per_page).toBe(2);
      expect(response.body.data.pagination.total_items).toBeGreaterThanOrEqual(3);
    });

    it('should return error for non-admin user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/products/:id', () => {
    it('should get specific product successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.id).toBe(testProduct.id);
      expect(response.body.data.product.name).toBe('Test Product');
      expect(response.body.data.product.category).toBeDefined();
    });

    it('should return error for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return validation error for invalid ID', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/admin/products', () => {
    it('should create product successfully', async () => {
      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          description: 'New product description',
          price: 150000,
          stock_quantity: 25,
          category_id: testCategory.id,
          sku: 'NEW-PRODUCT-001',
          weight_grams: 500,
          dimensions: '10x10x5',
          is_active: true,
          featured: false
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe('New Product');
      expect(response.body.data.product.price).toBe(150000);
      expect(response.body.data.product.category_id).toBe(testCategory.id);
    });

    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete Product'
          // missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return validation error for invalid price', async () => {
      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Price Product',
          description: 'Test product',
          price: -100, // Invalid negative price
          stock_quantity: 10,
          category_id: testCategory.id
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for non-existent category', async () => {
      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product with Invalid Category',
          description: 'Test product',
          price: 100000,
          stock_quantity: 10,
          category_id: 99999 // Non-existent category
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for duplicate SKU', async () => {
      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate SKU Product',
          description: 'Test product',
          price: 100000,
          stock_quantity: 10,
          category_id: testCategory.id,
          sku: 'TEST-001' // Already exists
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/admin/products/:id', () => {
    it('should update product successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product Name',
          price: 120000,
          stock_quantity: 45
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe('Updated Product Name');
      expect(response.body.data.product.price).toBe(120000);
      expect(response.body.data.product.stock_quantity).toBe(45);
    });

    it('should return error for non-existent product', async () => {
      const response = await request(app)
        .put('/api/v1/admin/products/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid data', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 'invalid-price'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/admin/products/:id', () => {
    let productToDelete;

    beforeAll(async () => {
      productToDelete = await Product.create({
        name: 'Product to Delete',
        description: 'This product will be deleted',
        price: 50000,
        stock_quantity: 5,
        category_id: testCategory.id,
        sku: 'DELETE-001',
        is_active: true
      });
    });

    it('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/products/${productToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify product is soft deleted
      const deletedProduct = await Product.findByPk(productToDelete.id, { paranoid: false });
      expect(deletedProduct.deleted_at).not.toBeNull();
    });

    it('should return error for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
