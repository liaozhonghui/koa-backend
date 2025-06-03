/**
 * Simple integration test for auth endpoints
 * This is a basic test to verify the endpoints work correctly
 */

import { JWTService } from '../src/singleton/jwt';

describe('JWT Service', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        user_id: 'test-user-123',
        device_id: 'test-device-456',
        app_id: 'com.test.app'
      };

      const token = JWTService.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        user_id: 'test-user-123',
        device_id: 'test-device-456',
        app_id: 'com.test.app'
      };

      const token = JWTService.generateToken(payload);
      const decoded = JWTService.verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded!.user_id).toBe(payload.user_id);
      expect(decoded!.device_id).toBe(payload.device_id);
      expect(decoded!.app_id).toBe(payload.app_id);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = JWTService.verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = JWTService.verifyToken('');
      
      expect(decoded).toBeNull();
    });
  });

  describe('getExpirationTime', () => {
    it('should return a positive number', () => {
      const expirationTime = JWTService.getExpirationTime();
      
      expect(typeof expirationTime).toBe('number');
      expect(expirationTime).toBeGreaterThan(0);
    });
  });
});
