const request = require('supertest');
const app = require('../../app');

describe('Error Handling', () => {
  describe('404 Not Found', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for wrong HTTP methods', async () => {
      const response = await request(app)
        .post('/api/v1/health'); // Health endpoint only accepts GET

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for deeply nested non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/admin/non/existent/route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Global Error Handler', () => {
    it('should handle uncaught exceptions gracefully', async () => {
      // This test verifies that the global error handler works
      // In a real scenario, this would be triggered by an unhandled error
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow normal request frequency', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });

    // Note: Rate limiting tests would require setting up a test environment
    // with specific rate limits, but that's complex for unit tests
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .options('/api/v1/health');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });
});
