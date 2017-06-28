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
  it('should define /explore/search endpoint', () => {
    var feedRoutes = ExploreController._routes;

    expect(feedRoutes.searchExplore.method).toBe('GET');
    expect(feedRoutes.searchExplore.path).toBe('/api/explore/{name}/search/{search}');
    expect(feedRoutes.searchExplore.config.auth).toBe('session');
    expect(feedRoutes.searchExplore.config.handler).not.toBeUndefined();
  });
  
});