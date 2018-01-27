// the starting point of the api
/*
every controller is loaded and instatiated via core/controller.js 
some controllers will load and instatiate the middleware
for eg. the AuthController.js will initialise the login strategy for the Hapi server


*/

"use strict";

const pkg = require("../package.json");
if (process.env.GNOME_ENV !== "dev" && process.env.NEW_RELIC_LICENSE_KEY) {
  require("newrelic");
}
//
const Hapi = require("hapi");
const log4js = require("log4js");
const config = require("config/server");
const Sequence = require("impossible-promise");
const Controller = require("./core/Controller");
const Model = require("./core/Model");
const fs = require("fs");
const path = require("path");

log4js.configure({
  appenders: [{ type: "console" }, { type: "file", filename: "gnome.log" }],
  replaceConsole: true
});

const server = new Hapi.Server();
let ServerOptions = {
  host: config.host,
  port: config.port,
  routes: {
    cors: {
      credentials: true,
      headers: [
        "Authorization",
        "Content-Type",
        "If-None-Match",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials"
      ]
    }
  }
};

if ("https" in config && config.https) {
  ServerOptions.tls = {
    key: fs.readFileSync(config.https.key),
    cert: fs.readFileSync(config.https.cert),
    passphrase: config.https.passphrase
  };
}

server.connection(ServerOptions);

console.debug("---=====[", new Date(), "]=====---");
console.log("Loading GNOME API:", pkg.version);

if (config.logging === true) {
  server.on("response", request => {
    if (request.payload && request.payload.password) {
      //removes the password from logging so not possible to read it in the log files
      request.payload.password = "<password redacted>";
    }
    console.log(
      request.response.statusCode,
      request.method.toUpperCase(),
      request.url.path,
      `(${request.info.responded - request.info.received}ms)`,
      request.params || null,
      request.payload && request.payload.imageData ? "[BLOB]" : request.payload
    );
  });
}

[
  "AuthController",
  "ExploreController",
  "FacebookController",
  "FeedController",
  "ImageController",
  "InterestController",
  "LocationController",
  "PushNotificationController",
  "PostController",
  "ProfileController",
  "UserController",
  "UserActivityController",
  "NewsletterController"
].forEach(ctrl => Controller.load(ctrl, server));

if (process.env.GNOME_ENV === "dev" || process.env.GNOME_ENV === "docker") {
  const Vision = require("vision");
  const Inert = require("inert");
  const Lout = require("lout");

  server.register([Vision, Inert, { register: Lout }], err => {
    if (err) {
      console.log("LOUT ERROR:", err);
    }
  });

  server.route({
    method: "GET",
    path: "/status",
    config: { auth: { mode: "try" } },
    handler: (request, reply) => {
      new Sequence()
        .pipe(() => pkg.version)
        .then(Model.status())
        .done((version, DatabaseStatus) => {
          let AnyErrorStatus = !version || !DatabaseStatus;

          reply({
            version,
            status: !AnyErrorStatus ? "fabulous" : "not cool",
            database: DatabaseStatus ? "amazing" : "failing"
          }).code(AnyErrorStatus ? 503 : 200);
        })
        .error(() => reply().code(500));
    }
  });

  server.route({
    method: "GET",
    path: "/",
    config: { auth: { mode: "try" } },
    handler: (request, reply) => {
      reply.file(path.join(__dirname, "build", "index.html"));
    }
  });

  server.route({
    method: "GET",
    path: "/interest",
    config: { auth: { mode: "try" } },
    handler: (request, reply) => {
      reply.file(path.join(__dirname, "build", "index.html"));
    }
  });

  server.route({
    method: "GET",
    path: "/feed",
    config: { auth: { mode: "try" } },
    handler: (request, reply) => {
      reply.file(path.join(__dirname, "build", "index.html"));
    }
  });

  server.route({
    method: "GET",
    path: "/updateInterest",
    config: { auth: { mode: "try" } },
    handler: (request, reply) => {
      reply.file(path.join(__dirname, "build", "index.html"));
    }
  });

  server.route({
    method: "GET",
    path: "/service-worker.js",
    config: { auth: { mode: "try" } },
    handler: (request, reply) => {
      reply.file(path.join(__dirname, "build", "service-worker.js"));
    }
  });

  server.route({
    method: "GET",
    path: "/static/{param*}",
    config: { auth: { mode: "try" } },
    handler: {
      directory: {
        path: path.join(__dirname, "build/static")
      }
    }
  });
}

module.exports = server;
