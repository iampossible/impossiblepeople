'use strict';

const postController = require('controllers/PostController');

describe('PostController', () => {
  describe('route registration', () => {
    it('registers POST /post/create method', () => {
      let route = postController._routes.createPost;

      expect(route).not.toBeUndefined();
      expect(route.method).toBe('POST');
      expect(route.path).toBe('/api/post/create');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).not.toBeUndefined();
      expect(route.config.validate).not.toBeUndefined();
    });

    it('registers POST /post/{id}/comment method', () => {
      let route = postController._routes.createComment;

      expect(route).not.toBeUndefined();
      expect(route.method).toBe('POST');
      expect(route.path).toBe('/api/post/{id}/comment');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).not.toBeUndefined();
      expect(route.config.validate).not.toBeUndefined();
    });

    it('registers GET /post/{id} method', () => {
      let route = postController._routes.getPost;

      expect(route).not.toBeUndefined();
      expect(route.method).toBe('GET');
      expect(route.path).toBe('/api/post/{id}');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).not.toBeUndefined();
    });

    it('registers DELETE /post/{id} method', () => {
      let route = postController._routes.deletePost;

      expect(route).toBeDefined();
      expect(route.path).toBe('/api/post/{postID}');
      expect(route.method).toBe('DELETE');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).toBeDefined();
    });

    it('registers GET /post/{id}/report method', () => {
      let route = postController._routes.reportPost;

      expect(route).toBeDefined();
      expect(route.path).toBe('/api/post/{postID}/report');
      expect(route.method).toBe('GET');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).toBeDefined();
      expect(route.config.validate).toBeDefined();
    });

    it('registers GET /api/post/comment/{id}/report method', () => {
      let route = postController._routes.reportComment;

      expect(route).toBeDefined();
      expect(route.path).toBe('/api/post/comment/{commentID}/report');
      expect(route.method).toBe('GET');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).toBeDefined();
      expect(route.config.validate).toBeDefined();
    });


    it('registers GET /post/{id}/resolve method', () => {
      let route = postController._routes.resolvePost;

      expect(route).toBeDefined();
      expect(route.path).toBe('/api/post/{postID}/resolve');
      expect(route.method).toBe('GET');
      expect(route.config.auth).toBe('session');
      expect(route.config.handler).toBeDefined();
    });

  });
});
