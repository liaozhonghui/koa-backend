import request from 'supertest';
const Koa = require('koa');
import bodyParser from 'koa-bodyparser';
import userRoutes from '../src/routes/users';

// Create a minimal Koa app for testing the routes
const createTestApp = () => {
  const app = new Koa();
  app.use(bodyParser());
  app.use(userRoutes.routes());
  app.use(userRoutes.allowedMethods());
  return app;
};

describe('User Routes Unit Tests', () => {
  let app: any;

  beforeEach(() => {
    // Reset the users array before each test
    // We need to import and reset the users array
    jest.resetModules();
    app = createTestApp();
  });

  describe('GET /api/users', () => {
    it('should return success response with users array', async () => {
      const response = await request(app.callback())
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBe(response.body.data.length);
    });

    it('should return default users', async () => {
      const response = await request(app.callback())
        .get('/api/users')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('id', 1);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
      expect(response.body.data[0]).toHaveProperty('createdAt');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by valid ID', async () => {
      const response = await request(app.callback())
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await request(app.callback())
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should handle invalid ID format', async () => {
      const response = await request(app.callback())
        .get('/api/users/invalid')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should create new user with valid data', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com'
      };

      const response = await request(app.callback())
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.data).toHaveProperty('name', newUser.name);
      expect(response.body.data).toHaveProperty('email', newUser.email);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should validate required fields - missing name', async () => {
      const userData = { email: 'test@example.com' };

      const response = await request(app.callback())
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Name and email are required');
    });

    it('should validate required fields - missing email', async () => {
      const userData = { name: 'Test User' };

      const response = await request(app.callback())
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Name and email are required');
    });

    it('should validate required fields - empty body', async () => {
      const response = await request(app.callback())
        .post('/api/users')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Name and email are required');
    });

    it('should increment user ID correctly', async () => {
      const newUser1 = { name: 'User 1', email: 'user1@test.com' };
      const newUser2 = { name: 'User 2', email: 'user2@test.com' };

      const response1 = await request(app.callback())
        .post('/api/users')
        .send(newUser1)
        .expect(201);

      const response2 = await request(app.callback())
        .post('/api/users')
        .send(newUser2)
        .expect(201);

      expect(response2.body.data.id).toBe(response1.body.data.id + 1);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update existing user', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app.callback())
        .put('/api/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'User updated successfully');
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('email', updateData.email);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should partially update user - name only', async () => {
      const updateData = { name: 'New Name Only' };

      const response = await request(app.callback())
        .put('/api/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should partially update user - email only', async () => {
      const updateData = { email: 'newemail@example.com' };

      const response = await request(app.callback())
        .put('/api/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body.data).toHaveProperty('email', updateData.email);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app.callback())
        .put('/api/users/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete existing user', async () => {
      const response = await request(app.callback())
        .delete('/api/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
      expect(response.body.data).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.callback())
        .delete('/api/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });    it('should remove user from users list', async () => {
      // First, verify user exists
      const beforeDelete = await request(app.callback())
        .get('/api/users/2')  // Use user 2 instead of 1 to avoid conflicts
        .expect(200);

      expect(beforeDelete.body.data).toHaveProperty('id', 2);

      // Delete user
      await request(app.callback())
        .delete('/api/users/2')
        .expect(200);

      // Verify user is not in list
      const response = await request(app.callback())
        .get('/api/users/2')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
});
