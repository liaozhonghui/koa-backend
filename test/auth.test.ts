import request from 'supertest';
const Koa = require('koa');
import bodyParser from 'koa-bodyparser';
import authRoutes from '../src/routes/auth';
import { ResponseCodes } from '../src/types';

// Create a minimal Koa app for testing the auth routes
const createTestApp = () => {
  const app = new Koa();
  app.use(bodyParser());
  app.use(authRoutes.routes());
  app.use(authRoutes.allowedMethods());
  return app;
};

describe('Auth Routes Unit Tests', () => {
  let app: any;

  beforeEach(() => {
    jest.resetModules();
    app = createTestApp();
  });

  describe('POST /auth/login', () => {
    const validLoginData = {
      android_id: "test-android-id",
      app_id: "com.ai.nutrition.calorie.tracker",
      carrier: "--",
      chid: null,
      client_version: "1.5.0",
      current_language: null,
      device_brand: "iPhone",
      device_id: "FB4FD192-9BD5-4F82-8AA8-59DD9054CCA1",
      device_model: "iPhone",
      email: null,
      first_name: null,
      ga_id: "",
      imei: "FB4FD192-9BD5-4F82-8AA8-59DD9054CCA1",
      install_time: "1747823108",
      last_name: null,
      launch_num: null,
      mac: null,
      mchid: null,
      origin_language: "en",
      os: "iOS",
      os_version: "18.4",
      simulator: false,
      time_zone: "8",
      login_status: null,
      use_burned_calories: true,
      firebase_token: ""
    };

    it('should validate required fields', async () => {
      const invalidData = {
        device_id: "test-device"
        // Missing required fields
      };

      const response = await request(app.callback())
        .post('/auth/login')
        .send(invalidData)
        .expect(200);

      expect(response.body).toHaveProperty('code', ResponseCodes.VALIDATION_ERROR);
      expect(response.body).toHaveProperty('msg');
      expect(response.body.msg).toContain('app_id is required');
    });

    it('should return validation error for missing device_id', async () => {
      const invalidData = { ...validLoginData };
      delete (invalidData as any).device_id;

      const response = await request(app.callback())
        .post('/auth/login')
        .send(invalidData)
        .expect(200);

      expect(response.body).toHaveProperty('code', ResponseCodes.VALIDATION_ERROR);
      expect(response.body.msg).toContain('device_id is required');
    });
  });

  describe('GET /auth/user', () => {
    it('should return unauthorized without token', async () => {
      const response = await request(app.callback())
        .get('/auth/user')
        .expect(200);

      expect(response.body).toHaveProperty('code', ResponseCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('msg', 'Authorization token required');
    });

    it('should return invalid token for malformed token', async () => {
      const response = await request(app.callback())
        .get('/auth/user')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);

      expect(response.body).toHaveProperty('code', ResponseCodes.INVALID_TOKEN);
      expect(response.body).toHaveProperty('msg', 'Invalid or expired token');
    });

    it('should return unauthorized for missing Bearer prefix', async () => {
      const response = await request(app.callback())
        .get('/auth/user')
        .set('Authorization', 'some-token')
        .expect(200);

      expect(response.body).toHaveProperty('code', ResponseCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('msg', 'Authorization token required');
    });
  });
});
