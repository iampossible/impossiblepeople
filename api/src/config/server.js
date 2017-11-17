'use strict';

// see configs.yml to better understand how to structure custom config files
// see process.env.GNOME_xxx to see which environment overrides are available

let GNOME_ENV = process.env.GNOME_ENV;

if (!GNOME_ENV || GNOME_ENV === 'docker') {
  GNOME_ENV = 'dev';
}

let rawConfig = require(`./server.${GNOME_ENV}`);

let neo4jCreds;
let neo4jUser;
let neo4jPassword;

if (process.env.NEO4J_AUTH) {
  neo4jCreds = (process.env.NEO4J_AUTH || 'neo4j/neo4j').split('/');
  neo4jUser = neo4jCreds[0];
  neo4jPassword = neo4jCreds[1];
}

let processedHost = (process.env.GNOME_HOST || rawConfig.host || 'localhost');
let processedPort = (process.env.GNOME_PORT || rawConfig.port || 3000);

let config = {
  port: processedPort,
  host: processedHost,
  salt: rawConfig.salt,
  logging: (process.env.GNOME_LOG == 1) || rawConfig.logging || false,
  endpoint: rawConfig.endpoint || `${processedHost}:${processedPort}`,
  https: rawConfig.https && {
    key: rawConfig.https.key,
    cert: rawConfig.https.cert,
  },
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY_ID || rawConfig.aws.accessKey,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY || rawConfig.aws.secretKey,
    sqs: {
      endpoint: process.env.SQS_HOST || rawConfig.aws.sqs.endpoint,
    },
    sns: {
      Apple: process.env.AWS_SNS_APPLE || rawConfig.aws.sns.Apple,
      Android: process.env.AWS_SNS_ANDROID || rawConfig.aws.sns.Android
    }
  },
  facebook: {
    appID: process.env.FACEBOOK_APP_ID || rawConfig.facebook.appID,
    appSecret: process.env.FACEBOOK_APP_SECRET || rawConfig.facebook.appSecret,
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY || (rawConfig.google && rawConfig.google.apiKey) || ''
  },
  neo4j: {
    host: process.env.NEO4J_HOST || rawConfig.neo4j.host,
    user: neo4jUser || rawConfig.neo4j.user,
    pass: neo4jPassword || rawConfig.neo4j.pass,
  },
  smtp: {
    service: rawConfig.smtp.service || 'sendgrid',
    user: process.env.SMTP_USER || rawConfig.smtp.user,
    pass: process.env.SMTP_PASS || rawConfig.smtp.pass,
    from: rawConfig.smtp.from
  },
  slack: {
    token: process.env.SLACK_TOKEN || rawConfig.slack && rawConfig.slack.token || false,
    room: rawConfig.slack && rawConfig.slack.room || 'impossiblepeople-bug'
  },
  cookieTTL: rawConfig.cookieTTL || (30 * 24 * 60 * 60 * 1000),
  login: {
    penalty: rawConfig.login && rawConfig.login.penalty || 1000,
    limit: rawConfig.login && rawConfig.login.limit || 5,
    timeout: rawConfig.login && rawConfig.login.timeout || 30 * 60 * 1000,
  },
  settings: {
    feed_use_location: rawConfig.settings && rawConfig.settings.feed_use_location || false,
    newsletter_key: rawConfig.settings && rawConfig.settings.newsletter_key,
  }
};

module.exports = config;
