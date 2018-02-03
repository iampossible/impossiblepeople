'use strict';

const path = require('path');

// see configs.yml to better understand how to structure custom config files
// see process.env.GNOME_xxx to see which environment overrides are available

let GNOME_ENV = process.env.GNOME_ENV

if (!GNOME_ENV || GNOME_ENV === 'docker') {
  GNOME_ENV = 'dev'
}

/* Unlike the other sources, this one must remain in JS due to typescript not 
   allowing synchronous dynamic imports, or JSON imports;
   needed for the code below */
let rawConfig = require(`./config.${GNOME_ENV}`);

let neo4jCreds;
let neo4jUser;
let neo4jPassword;

if (process.env.NEO4J_AUTH) {
  neo4jCreds = (process.env.NEO4J_AUTH || 'neo4j/neo4j').split('/');
  neo4jUser = neo4jCreds[0];
  neo4jPassword = neo4jCreds[1];
}

let config = {
  workdir: process.env.GNOME_REPORTS_PWD || path.resolve(`${__dirname}/../../`),
  api: rawConfig.api,
  logging: (process.env.GNOME_LOG == 1) || rawConfig.logging || false,
  neo4j: {
    host: process.env.NEO4J_HOST || rawConfig.neo4j.host,
    user: neo4jUser || rawConfig.neo4j.user,
    pass: neo4jPassword || rawConfig.neo4j.pass,
  },
  smtp: {
    service: rawConfig.smtp && rawConfig.smtp.service || 'sendgrid',
    user: process.env.SMTP_USER || rawConfig.smtp && rawConfig.smtp.user,
    pass: process.env.SMTP_PASS || rawConfig.smtp && rawConfig.smtp.pass,
    from: rawConfig.smtp && rawConfig.smtp.from
  },
  slack: {
    token: process.env.SLACK_TOKEN || rawConfig.slack && rawConfig.slack.token || false,
    room: rawConfig.slack && rawConfig.slack.room || 'impossiblepeople-bug'
  },
  newsletter_key: rawConfig.newsletter_key
};

module.exports = config;
