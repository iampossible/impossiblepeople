'use strict';

var ProfileController = require('controllers/ProfileController');

describe('ProfileController', () => {
  it('should define /profile/{userID} endpoint', () => {
    var route = ProfileController._routes.getProfile;

    expect(route.method).toBe('GET');
    expect(route.path).toBe('/api/profile/{userID}');
    expect(route.config.auth).toBe('session');
    expect(route.config.handler).toBeDefined();
  });

  describe('/profile/{userID}/follow endpoint', () => {
    it('should define a PUT method', () => {
      var route = ProfileController._routes.followProfile;

      expect(route.method).toBe('PUT');
      expect(route.path).toBe('/api/profile/{userID}/follow');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).toBeDefined();
    });

    it('should define a DELETE method', () => {
      var route = ProfileController._routes.unfollowProfile;

      expect(route.method).toBe('DELETE');
      expect(route.path).toBe('/api/profile/{userID}/follow');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).toBeDefined();
    });
  });

  it('should define /profile/{userID}/report endpoint', () => {
    var route = ProfileController._routes.reportProfile;

    expect(route.method).toBe('GET');
    expect(route.path).toBe('/api/profile/{userID}/report');
    expect(route.config.auth).toBe('session');
    expect(route.config.handler).toBeDefined();
  });

  it('should /profile/{userID}/block endpoint', () => {
    var route = ProfileController._routes.blockProfile;

    expect(route.method).toBe('GET');
    expect(route.path).toBe('/api/profile/{userID}/block');
    expect(route.config.auth).toBe('session');
    expect(route.config.handler).toBeDefined();
  });

});
