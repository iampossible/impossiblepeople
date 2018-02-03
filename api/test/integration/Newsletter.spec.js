'use strict';

var gnomeApi = require('ImpossibleApi');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');
var request = require('request');
var crypto = require('crypto');

describe('Newsletter endpoints', () => {
  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll(done => dataHelper.wipe().then(done));

  const testSeedUser = {
    userID: '37619fc1',
    email: 'follow.me@example.com'
  };

  const encrypt = (s) => {
    // TODO set algo consistently with Model
    const d = crypto.createCipher('aes256', Config.settings.newsletter_key);

    let raw = d.update(s, 'utf8', 'hex');
    raw += d.final('hex');
    return raw;
  };

  const rawTSInvalid = encrypt(`${testSeedUser.userID};${testSeedUser.email};${Date.now().valueOf() + 1000000}`);

  let rawInvalid = encrypt(`d34d833f;a@b.c;${Date.now().valueOf()}`);

  describe('GET /newsletter/unsubscribe', () => {
    it('should unsubscribe user', (done) => {
      request.get({ url: `http://${Config.endpoint}/api/newsletter/unsubscribe`, qs: { code: encrypt(`${testSeedUser.userID};${testSeedUser.email};${Date.now().valueOf() - 10000}`) } }, (error, response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('should fail if code is not given', (done) => {
      request.get(`http://${Config.endpoint}/api/newsletter/unsubscribe`, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('should fail if code is invalid', (done) => {
      request.get({ url: `http://${Config.endpoint}/api/newsletter/unsubscribe`, qs: { code: 'randomstuff' } }, (error, response) => {
        expect(response.statusCode).toBe(500);
        done();
      });
    });

    it('should fail if code timestamp is invalid', (done) => {
      request.get({ url: `http://${Config.endpoint}/api/newsletter/unsubscribe`, qs: { code: rawTSInvalid } }, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('should fail if code provides invalid user', (done) => {
      request.get({ url: `http://${Config.endpoint}/api/newsletter/unsubscribe`, qs: { code: rawInvalid } }, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
  });
});

