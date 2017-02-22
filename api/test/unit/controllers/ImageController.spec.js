'use strict';

var ImageController = require('controllers/ImageController');

describe('ImageController', () => {
  it('should define /user/image endpoint', () => {
    var imageRoutes = ImageController._routes;

    expect(imageRoutes.postImage.method).toBe('POST');
    expect(imageRoutes.postImage.path).toBe('/api/user/image');
    expect(imageRoutes.postImage.config.auth).toBe('session');
    expect(imageRoutes.postImage.config.handler).toBeDefined();
    expect(imageRoutes.postImage.config.validate).toBeDefined();
  });
});
