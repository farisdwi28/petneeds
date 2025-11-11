const request = require('supertest');
const app = require('../../app');

describe('Health Check Endpoint', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status successfully', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('PetNeeds API is running');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp)).toBe(false);
    });

    it('should handle high load gracefully', async () => {
      // Test multiple concurrent requests
      const requests = Array(10).fill().map(() =>
        request(app).get('/api/v1/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
      });
    });
  });
});
