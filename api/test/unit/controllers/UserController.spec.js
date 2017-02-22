/* globals describe, expect, it */
'use strict';

var userController = require('controllers/UserController');

describe('UserController', () => {
  describe('route registration', () => {
    it('registers GET /user method', () => {
      var userRoutes = userController._routes;

      expect(userRoutes.getUser).not.toBeUndefined();
      expect(userRoutes.getUser.method).toBe('GET');
      expect(userRoutes.getUser.path).toBe('/api/user');
      expect(userRoutes.getUser.config.handler).not.toBeUndefined();
      expect(userRoutes.getUser.config.auth).toBe('session');
    });

    it('registers POST /user method', () => {
      var userRoutes = userController._routes;

      expect(userRoutes.updateUser).not.toBeUndefined();
      expect(userRoutes.updateUser.method).toBe('POST');
      expect(userRoutes.updateUser.path).toBe('/api/user');
      expect(userRoutes.updateUser.config.handler).not.toBeUndefined();
      expect(userRoutes.updateUser.config.auth).toBe('session');
    });

    it('registers POST /user/interest method', () => {
      var userRoutes = userController._routes;

      expect(userRoutes.addInterest).not.toBeUndefined();
      expect(userRoutes.addInterest.method).toBe('POST');
      expect(userRoutes.addInterest.path).toBe('/api/user/interest');
      expect(userRoutes.addInterest.config.auth).toBe('session');
      expect(userRoutes.addInterest.config.handler).not.toBeUndefined();
    });

    it('registers PUT /user/interest method', () => {
      var userRoutes = userController._routes;

      expect(userRoutes.updateInterest).not.toBeUndefined();
      expect(userRoutes.updateInterest.method).toBe('PUT');
      expect(userRoutes.updateInterest.path).toBe('/api/user/interest');
      expect(userRoutes.updateInterest.config.auth).toBe('session');
      expect(userRoutes.updateInterest.config.handler).not.toBeUndefined();
    });

    it('registers GET /user/interest method', () => {
      var userRoutes = userController._routes;

      expect(userRoutes.getInterests).not.toBeUndefined();
      expect(userRoutes.getInterests.method).toBe('GET');
      expect(userRoutes.getInterests.path).toBe('/api/user/interest');
      expect(userRoutes.getInterests.config.auth).toBe('session');
      expect(userRoutes.getInterests.config.handler).not.toBeUndefined();
    });

    it('registers GET /user/post method', () => {
      var userRoutes = userController._routes;

      expect(userRoutes.getPosts).not.toBeUndefined();
      expect(userRoutes.getPosts.method).toBe('GET');
      expect(userRoutes.getPosts.path).toBe('/api/user/post');
      expect(userRoutes.getPosts.config.auth).toBe('session');
      expect(userRoutes.getPosts.config.handler).not.toBeUndefined();
    });
  });
});
