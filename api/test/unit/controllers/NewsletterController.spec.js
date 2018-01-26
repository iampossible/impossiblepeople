'use strict';

var NewsletterController = require('controllers/NewsletterController');

describe('NewsletterController', () => {
  it('should define /newsletter/unsubscribe endpoint', () => {
    var unsubscribeRoute = NewsletterController._routes.unsubscribe;

    expect(unsubscribeRoute.method).toBe('GET');
    expect(unsubscribeRoute.path).toBe('/api/newsletter/unsubscribe');
    expect(unsubscribeRoute.config.handler).toBeDefined();
    expect(unsubscribeRoute.config.validate).not.toBeUndefined();
  });
});
