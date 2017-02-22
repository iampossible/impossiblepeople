/* globals describe, expect, it */
'use strict';

var authController = require('controllers/AuthController');

describe('AuthController', () => {
  describe('route registration', () => {
    it('registers POST /auth/login method', () => {
      var authRoutes = authController._routes;

      expect(authRoutes.login).not.toBeUndefined();
      expect(authRoutes.login.method).toBe('POST');
      expect(authRoutes.login.path).toBe('/api/auth/login');
      expect(authRoutes.login.config.handler).not.toBeUndefined();
    });

    it('registers GET /auth/logout method', () => {
      var authRoutes = authController._routes;

      expect(authRoutes.logout).not.toBeUndefined();
      expect(authRoutes.logout.method).toBe('GET');
      expect(authRoutes.logout.path).toBe('/api/auth/logout');
      expect(authRoutes.logout.config.handler).not.toBeUndefined();
    });

    it('registers POST /auth/recover method', () => {
      var authRoutes = authController._routes;

      expect(authRoutes.recover).not.toBeUndefined();
      expect(authRoutes.recover.method).toBe('POST');
      expect(authRoutes.recover.path).toBe('/api/auth/recover');
      expect(authRoutes.recover.config.handler).not.toBeUndefined();
      expect(authRoutes.recover.config.validate).not.toBeUndefined();
    });

    it('registers POST /user/create method', () => {
      var authRoutes = authController._routes;

      expect(authRoutes.createUser).not.toBeUndefined();
      expect(authRoutes.createUser.method).toBe('POST');
      expect(authRoutes.createUser.path).toBe('/api/user/create');
      expect(authRoutes.createUser.config.handler).toBeDefined('config.handler');
      expect(authRoutes.createUser.config.validate).toBeDefined('config.validate');
    });

    it('registers POST /user/invite method', () => {
      var authRoutes = authController._routes;

      expect(authRoutes.inviteUser).not.toBeUndefined();
      expect(authRoutes.inviteUser.method).toBe('POST');
      expect(authRoutes.inviteUser.path).toBe('/api/user/invite');
      expect(authRoutes.inviteUser.config.auth).toBe('session');
      expect(authRoutes.inviteUser.config.handler).toBeDefined('config.handler');
      expect(authRoutes.inviteUser.config.validate).toBeDefined('config.validate');
    });
  });
});
