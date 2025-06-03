import request from 'supertest';
import app from '../src/app';

describe('API Integration Tests', () => {  describe('Health Check Endpoints', () => {
    describe('GET /', () => {
      it('should return health check response', async () => {
        const response = await request(app.callback())
          .get('/')
          .expect(200);

        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('msg');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('message', 'Koa Backend API is running!');
        expect(response.body.data).toHaveProperty('version');
        expect(response.body.data).toHaveProperty('timestamp');
      });

      it('should return valid timestamp format', async () => {
        const response = await request(app.callback())
          .get('/')
          .expect(200);

        const timestamp = new Date(response.body.data.timestamp);
        expect(timestamp.toISOString()).toBe(response.body.data.timestamp);
      });
    });

    describe('GET /api/status', () => {
      it('should return API status', async () => {
        const response = await request(app.callback())
          .get('/api/status')
          .expect(200);

        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('msg');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('status', 'healthy');
        expect(response.body.data).toHaveProperty('uptime');
        expect(response.body.data).toHaveProperty('timestamp');
        expect(response.body.data).toHaveProperty('environment');
        expect(response.body.data).toHaveProperty('version');
      });

      it('should return numeric uptime', async () => {
        const response = await request(app.callback())
          .get('/api/status')
          .expect(200);

        expect(typeof response.body.data.uptime).toBe('number');
        expect(response.body.data.uptime).toBeGreaterThan(0);
      });
    });
  });
  describe('User Management Endpoints', () => {    describe('GET /api/users', () => {
      it('should return users list', async () => {
        const response = await request(app.callback())
          .get('/api/users')
          .expect(200);

        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('msg');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should return consistent count', async () => {
        const response = await request(app.callback())
          .get('/api/users')
          .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('POST /api/users', () => {
      it('should create a new user with valid data', async () => {
        const newUser = {
          name: 'Test User',
          email: 'test@example.com'
        };

        const response = await request(app.callback())
          .post('/api/users')
          .send(newUser)
          .expect(200);

        expect(response.body).toHaveProperty('code', 201);
        expect(response.body).toHaveProperty('msg', 'User created successfully');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('name', newUser.name);
        expect(response.body.data).toHaveProperty('email', newUser.email);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('createdAt');
      });      it('should return error for missing name', async () => {
        const response = await request(app.callback())
          .post('/api/users')
          .send({ email: 'test@example.com' })
          .expect(200);

        expect(response.body).toHaveProperty('code', 600);
        expect(response.body).toHaveProperty('msg', 'Name and email are required');
        expect(response.body).toHaveProperty('data', null);
      });

      it('should return error for missing email', async () => {
        const response = await request(app.callback())
          .post('/api/users')
          .send({ name: 'Test User' })
          .expect(200);

        expect(response.body).toHaveProperty('code', 600);
        expect(response.body).toHaveProperty('msg', 'Name and email are required');
        expect(response.body).toHaveProperty('data', null);
      });

      it('should return error for missing both fields', async () => {
        const response = await request(app.callback())
          .post('/api/users')
          .send({})
          .expect(200);

        expect(response.body).toHaveProperty('code', 600);
        expect(response.body).toHaveProperty('msg', 'Name and email are required');
        expect(response.body).toHaveProperty('data', null);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should return user by valid ID', async () => {
        const response = await request(app.callback())
          .get('/api/users/1')
          .expect(200);

        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('msg');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id', 1);
      });      it('should return 404 for non-existent user', async () => {
        const response = await request(app.callback())
          .get('/api/users/999')
          .expect(200);

        expect(response.body).toHaveProperty('code', 601);
        expect(response.body).toHaveProperty('msg', 'User not found');
        expect(response.body).toHaveProperty('data', null);
      });
    });
  });
  describe('API Info Endpoints', () => {
    describe('GET /api/info', () => {
      it('should return API information', async () => {
        const response = await request(app.callback())
          .get('/api/info')
          .expect(200);

        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('msg');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('description');
        expect(response.body.data).toHaveProperty('version');
        expect(response.body.data).toHaveProperty('endpoints');
        expect(typeof response.body.data.endpoints).toBe('object');
      });
    });

    describe('POST /api/echo', () => {
      it('should echo back the request data', async () => {
        const testData = { message: 'Hello World', number: 42 };
        
        const response = await request(app.callback())
          .post('/api/echo')
          .send(testData)
          .expect(200);

        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('msg');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('echo', testData);
        expect(response.body.data).toHaveProperty('timestamp');
        expect(response.body.data).toHaveProperty('method', 'POST');
        expect(response.body.data).toHaveProperty('url', '/api/echo');
      });
    });
  });
});
