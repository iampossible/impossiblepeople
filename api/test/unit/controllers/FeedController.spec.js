'use strict';

var FeedController = require('controllers/FeedController');

describe('FeedCtrl', () => {
  it('should define /feed endpoint', () => {
    var feedRoutes = FeedController._routes;

    expect(feedRoutes.getFeed.method).toBe('GET');
    expect(feedRoutes.getFeed.path).toBe('/api/feed');
    expect(feedRoutes.getFeed.config.auth).toBe('session');
    expect(feedRoutes.getFeed.config.handler).not.toBeUndefined();
  });
});
