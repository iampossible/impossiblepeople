'use strict';
const request = require('request');
const Config = require('config/server');
const db = require('middleware/neo4jDatabase');
const QueueWorkers = require('middleware/QueueWorkers');

function logIn(email, password, callback) {
  let jar = request.jar();
  let $request = request.defaults({ jar });
  $request
    .post(
      `http://${Config.endpoint}/api/auth/login`,
      (err) => callback(err, $request, jar)
    ).form({ email, password });
}

function publishMsg(queue, type, data, callback) {
  QueueWorkers.publish(queue, type, data).done(callback || (() => true))
}

function waitForMsg(worker, type, cb) {
  // wait for the msg to be processed by the workers
  console.log('waiting for', type);
  worker.once(type, (msg, msgID) => setTimeout(() => cb(msg, msgID), 10));
}

module.exports = {

  publishMsg,
  waitForMsg,

  logIn,

  logInFrodo: (callback) => {
    logIn('frodo@shire.com', 'sting', callback);
  },

  logInTestUser: (callback) => {
    logIn('user@example.com', 'somepassword', callback);
  },

  logInMadHatter: (callback) => {
    logIn('im.not.mad@example.com', 'muchmoremuchier', callback);
  },

  logInAlice: (callback) => {
    logIn('alice@wonderland.com', 'somewhere', callback);
  },

  logInWhiteRabbit: (callback) => {
    logIn('follow.me@example.com', 'clocks', callback);
  },

  getInvitee: (InviteeEmail, callback) => {
    db.query('MATCH (n:Invitee { email: {InviteeEmail}}) return n', { InviteeEmail }, callback);
  },

};
