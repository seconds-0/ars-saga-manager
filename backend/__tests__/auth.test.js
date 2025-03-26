const request = require('supertest');
const express = require('express');
const { router } = require('../routes/auth');
const { sequelize } = require('../models');

// Create an Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should return 400 when registering with an existing email', async () => {
      // Mock the User.create method to throw SequelizeUniqueConstraintError
      const mockCreate = jest.spyOn(sequelize.models.User, 'create');
      mockCreate.mockRejectedValueOnce({
        name: 'SequelizeUniqueConstraintError',
        message: 'Validation error'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'An account is already registered under that email address.'
      });

      // Clean up
      mockCreate.mockRestore();
    });
  });
}); 