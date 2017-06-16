'use strict';

var ExploreController = require('controllers/ExploreController');

describe('ExploreCtrl', () => {
  it('should define /explore endpoint', () => {
    var feedRoutes = ExploreController._routes;

    expect(feedRoutes.getExplore.method).toBe('GET');
    expect(feedRoutes.getExplore.path).toBe('/api/explore/{name}');
    expect(feedRoutes.getExplore.config.auth).toBe('session');
    expect(feedRoutes.getExplore.config.handler).not.toBeUndefined();
  });
});