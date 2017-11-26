"use strict";

// see configs.yml to better understand how to structure custom config files
// see process.env.GNOME_xxx to see which environment overrides are available

let GNOME_ENV = process.env.GNOME_ENV;

if (!GNOME_ENV || GNOME_ENV === "docker") {
    GNOME_ENV = "dev";
}

let rawConfig = require(`./server.${GNOME_ENV}`);

let neo4jCreds;
let neo4jUser;
let neo4jPassword;

if (process.env.NEO4J_AUTH) {
    neo4jCreds = (process.env.NEO4J_AUTH || "neo4j/neo4j").split("/");
    neo4jUser = neo4jCreds[0];
    neo4jPassword = neo4jCreds[1];
}

let processedHost = process.env.GNOME_HOST || rawConfig.host || "172.18.0.3";
let processedPort = process.env.GNOME_PORT || rawConfig.port || 3000;

let config = {
    port: 3000,
    host: "0.0.0.0",
    salt: "8f6e57c1822d6328e62104dd13095dc8",
    logging: false,
    endpoint: `0.0.0.0:3000`,
    https: rawConfig.https && {
        key: rawConfig.https.key,
        cert: rawConfig.https.cert
    },
    aws: {
        accessKey: "AKIAI3YF3ZQBQD4IIE4Q",
        secretKey: "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",
        sqs: {
            endpoint: "http://localhost:4568/"
        },
        sns: {
            Apple: process.env.AWS_SNS_APPLE || rawConfig.aws.sns.Apple,
            Android: process.env.AWS_SNS_ANDROID || rawConfig.aws.sns.Android
        }
    },
    facebook: {
        appID: "138462666798513",
        appSecret: "11279810300f042e3d837f22052e9257"
    },
    neo4j: {
        host: "http://54.86.234.180:7474",
        user: "neo4j",
        pass: "Imp0ssible@pp"
    },
    smtp: {
        service: rawConfig.smtp.service || "sendgrid",
        user: process.env.SMTP_USER || rawConfig.smtp.user,
        pass: process.env.SMTP_PASS || rawConfig.smtp.pass,
        from: rawConfig.smtp.from
    },
    slack: {
        token: process.env.SLACK_TOKEN ||
            (rawConfig.slack && rawConfig.slack.token) ||
            false,
        room: (rawConfig.slack && rawConfig.slack.room) || "impossiblepeople-bug"
    },
    cookieTTL: rawConfig.cookieTTL || 30 * 24 * 60 * 60 * 1000,
    login: {
        penalty: (rawConfig.login && rawConfig.login.penalty) || 1000,
        limit: (rawConfig.login && rawConfig.login.limit) || 5,
        timeout: (rawConfig.login && rawConfig.login.timeout) || 30 * 60 * 1000
    },
    settings: {
        feed_use_location:
            (rawConfig.settings && rawConfig.settings.feed_use_location) || false
    }
};

module.exports = config;