/* globals describe, expect, it */
'use strict';

var notificationController = require('controllers/PushNotificationController');

describe('PushNotificationController', () => {
  describe('route registration', () => {
    it('registers GET /notification/register method', () => {
      var register = notificationController._routes.register;

      expect(register.method).toBe('POST');
      expect(register.path).toBe('/api/notification/register');
      expect(register.config.auth).toBe('session');
      expect(register.config.handler).toBeDefined();
      expect(register.config.validate.payload).toBeDefined();
    });
  });
});
