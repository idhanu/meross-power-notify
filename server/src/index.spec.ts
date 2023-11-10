import request from 'supertest';
import { app } from '.';

describe('router', () => {
  describe('/ping', () => {
    it('returns correct response for the health check', async () => {
      const response = await request(app).get('/ping');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'pong' });
    });
  });
});
