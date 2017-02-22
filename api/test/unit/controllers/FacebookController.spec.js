/* globals describe, expect, it */
'use strict';

var facebookController = require('controllers/FacebookController');

describe('FacebookController', () => {
  describe('route registration', () => {
    it('registers get /facebook/check method', () => {
      var facebookRoutes = facebookController._routes;

      expect(facebookRoutes.check).toBeDefined();
      expect(facebookRoutes.check.method).toBe('GET');
      expect(facebookRoutes.check.path).toBe('/api/facebook/check');
      expect(facebookRoutes.check.config.auth).toEqual({ mode: 'try' });
      expect(facebookRoutes.check.config.handler).toBeDefined();
      expect(facebookRoutes.check.config.validate.query).toBeDefined();
    });
    
    it('registers get /facebook/link method', () => {
      var facebookRoutes = facebookController._routes;

      expect(facebookRoutes.link).toBeDefined();
      expect(facebookRoutes.link.method).toBe('GET');
      expect(facebookRoutes.link.path).toBe('/api/facebook/link');
      expect(facebookRoutes.link.config.auth).toEqual('session');
      expect(facebookRoutes.link.config.handler).toBeDefined();
      expect(facebookRoutes.link.config.validate.query).toBeDefined();
    });
  });
});
