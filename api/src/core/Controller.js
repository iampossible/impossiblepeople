'use strict';

class Controller {

  constructor() {
    this._routes = [];
    this._plugins = [];
  }

  register(server, options, next) {
    // TODO how could we go about testing this?

    console.info('Loading', this.register.attributes.name);

    // points to the current Controller being loaded
    var context = this.register.attributes.context;

    // autoload plugins before routes
    for (let key in context._plugins) {
      if ({}.hasOwnProperty.call(context._plugins, key)) {
        let plugin = require(key);
        server.register(plugin, (err) => {
          context._plugins[key].call(context, err, server);
        });
      }
    }

    // load routes from context into server
    for (let key in context._routes) {
      if ({}.hasOwnProperty.call(context._routes, key)) {
        server.route(context._routes[key]);
      }
    }

    if (typeof next === 'function') {
      next();
    }
  }

  route(key, obj) {
    let route = {
      method: obj.method,
      path: obj.path,
      config: {},
    };

    if ('handler' in obj) {
      route.config.handler = obj.handler;
    }

    if ('auth' in obj) {
      route.config.auth = obj.auth;
    } else {
      route.config.auth = { mode: 'try' };
    }

    if ('plugins' in obj) {
      route.config.plugins = obj.plugins;
    }

    if ('validate' in obj || 'validateQuery' in obj || 'validateParams' in obj) {
      route.config.validate = {};
      if ('validate' in obj) {
        route.config.validate.payload = obj.validate;
      }
      if ('validateQuery' in obj) {
        route.config.validate.query = obj.validateQuery;
      }
      if ('validateParams' in obj) {
        route.config.validate.params = obj.validateParams;
      }
    }

    this._routes[key] = route;
  }

  plugin(key, callback) {
    this._plugins[key] = callback;
  }

  /**
   * Injects a Controller into a Hapi server object
   * @param  {string} controllerName      controllers/{file}.js to be loaded
   * @param  {object:HapiServer} server   current hapi server object
   * @param  {object|optional} options    Optional Options for server.register()
   * @return null
   */
  static load(controllerName, server, options) {
    let instance = require(`controllers/${controllerName}`);
    instance.register.attributes = {
      name: controllerName,
      context: instance,
    };

    server.register(instance, options || {}, (err) => {
      if ('onRegister' in instance) {
        instance.onRegister(server, err);
      }
    });
  }
}

module.exports = Controller;
