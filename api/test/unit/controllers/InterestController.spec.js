'use strict';

var InterestController = require('controllers/InterestController');

describe('InterestController', () => {
  it('should define /interest endpoint', () => {
    var route = InterestController._routes.getInterests;

    expect(route.method).toBe('GET');
    expect(route.path).toBe('/api/interest');
    expect(route.config.auth).toBe('session');
    expect(route.config.handler).toBeDefined();
    expect(route.config.validate.query).toBeDefined();
  });

  it('should define /interest/suggestion endpoint', () => {
    var route = InterestController._routes.suggestInterest;

    expect(route.method).toBe('POST');
    expect(route.path).toBe('/api/interest/suggestion');
    expect(route.config.auth).toBe('session');
    expect(route.config.handler).toBeDefined();
  });
});
