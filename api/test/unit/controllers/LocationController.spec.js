'use strict';

var LocationController = require('controllers/LocationController');

describe('LocationController', () => {
  it('should define /location endpoint', () => {
    var postRoute = LocationController._routes.postLocation;

    expect(postRoute.method).toBe('POST');
    expect(postRoute.path).toBe('/api/location');
    expect(postRoute.config.auth).toBe('session');
    expect(postRoute.config.handler).toBeDefined();
    expect(postRoute.config.validate).not.toBeUndefined();
  });
});
