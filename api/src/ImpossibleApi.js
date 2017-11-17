'use strict';
const pkg = require('../package.json');
if (process.env.GNOME_ENV !== 'dev' && process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}
const Hapi = require('hapi');
const log4js = require('log4js');
const config = require('config/server');
const Sequence = require('impossible-promise');
const Controller = require('./core/Controller');
const Model = require('./core/Model');
const fs = require('fs');

const server = new Hapi.Server();
let ServerOptions = {
  host: config.host,
  port: config.port,
  routes: {
    cors: {
      credentials: true,
      headers: ['Authorization', 'Content-Type', 'If-None-Match', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
    },
  },
};

if ('https' in config && config.https) {
  ServerOptions.tls = {
    key: fs.readFileSync(config.https.key),
    cert: fs.readFileSync(config.https.cert),
  };
}

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'gnome.log' },
  ],
  replaceConsole: true,
});

server.connection(ServerOptions);

console.debug('---=====[', new Date(), ']=====---');
console.log('Loading GNOME API:', pkg.version);

if (config.logging === true) {
  server.on('response', request => {
    if (request.payload && request.payload.password) {
      request.payload.password = '<password redacted>';
    }
    console.log(
        request.response.statusCode,
        request.method.toUpperCase(),
        request.url.path,
        `(${request.info.responded - request.info.received}ms)`,
        request.params || null,
        (request.payload && request.payload.imageData) ? '[BLOB]' : request.payload
      );
  }
  );
}

[
  'AuthController',
  'ExploreController',
  'FacebookController',
  'FeedController',
  'ImageController',
  'InterestController',
  'LocationController',
  'NewsletterController',
  'PushNotificationController',
  'PostController',
  'ProfileController',
  'UserController',
  'UserActivityController'
].forEach(ctrl => Controller.load(ctrl, server));

if (process.env.GNOME_ENV === 'dev' || process.env.GNOME_ENV === 'docker') {

  const Vision = require('vision');
  const Inert = require('inert');
  const Lout = require('lout');

  server.register([
    Vision,
    Inert,
    { register: Lout }
  ], (err) => {
    if (err) {
      console.log('LOUT ERROR:', err);
    }
  });
}


server.route({
  method: 'GET',
  path: '/',
  config: { auth: { mode: 'try' } },
  handler: (request, reply) => {
    new Sequence()
      .pipe(() => pkg.version)
      .then(Model.status())
      .done((version, DatabaseStatus) => {
        let AnyErrorStatus = !version || !DatabaseStatus;

        reply({
          version,
          status: (!AnyErrorStatus ? 'fabulous' : 'not cool'),
          database: (DatabaseStatus ? 'amazing' : 'failing'),
        }).code(AnyErrorStatus ? 503 : 200);

      }).error(() => reply().code(500));
  },
});

module.exports = server;
