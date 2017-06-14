'use strict';

var ExploreController = require('ExploreController');

describe('ExploreCtrl', () => {
  it('should define /explore endpoint', () => {
    var feedRoutes = ExploreController._routes;

    expect(feedRoutes.getFeed.method).toBe('GET');
    expect(feedRoutes.getFeed.path).toBe('/api/explore/{interestID}');
    expect(feedRoutes.getFeed.config.auth).toBe('session');
    expect(route.config.handler).not.toBeUndefined();
  });
});