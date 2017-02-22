'use strict';

const Controller = require('core/Controller');

describe('core/Controller', () => {
  let controller;

  beforeEach(() => controller = new Controller());

  describe('route method', () => {
    it('should set up a basic route', () => {
      controller.route('testRoute', { method: null, path: null });
      let route = controller._routes.testRoute;

      expect(route.method).toBeDefined();
      expect(route.path).toBeDefined();
      expect(route.config).toEqual({ auth: { mode: 'try' } });
    });

    it('should add plugins to the config when specified', () => {
      let plugins = [1, 2, 3];
      controller.route('testRoute', { plugins });
      let route = controller._routes.testRoute;

      expect(route.config.plugins).toBe(plugins);
    });

    it('should add auth to the config when specified', () => {
      let auth = 'session';
      controller.route('testRoute', { auth });
      let route = controller._routes.testRoute;

      expect(route.config.auth).toBe(auth);
    });

    it('should add payload validation when specified', () => {
      controller.route('testRoute', { validate: { foo: 'bar' } });

      expect(controller._routes.testRoute.config.validate.payload).toEqual({ foo: 'bar' });
    });

    it('should add query parameter validation when specified', () => {
      controller.route('testRoute', { validateQuery: { foo: 'bar' } });

      expect(controller._routes.testRoute.config.validate.query).toEqual({ foo: 'bar' });
    });
  });

  describe('plugin method', () => {
    it('should set the specified plugin', () => {
      controller.plugin('hello', 'world');

      expect(controller._plugins.hello).toEqual('world');
    });
  });

  describe('load method', () => {
    it('should set the attributes of the controller and register it', (done) => {
      let server = { register: null };

      spyOn(server, 'register').and.callFake((instance, options) => {
        expect(instance.register.attributes).toEqual({
          name: 'AuthController',
          context: jasmine.any(Object),
        });

        expect(options).toEqual({});

        done();
      });

      Controller.load('AuthController', server);
    });
  });
});
