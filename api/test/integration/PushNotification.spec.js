'use strict';

var gnomeApi = require('ImpossibleApi');
var request = require('request');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');

const nockStubs = require('../NockStubs');

var helpers = require('../helpers');

describe('Push Notifications', () => {
  let deviceToken = 'a6be9819ef4b44a36b53300a1e117343bce649503a864c63e2a6896bfeabdb0a';

  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => dataHelper.wipe().then(done));

  it('should return 401 if user is not authenticated', (done) => {
    request.post(`http://${Config.endpoint}/api/notification/register`, (err, response) => {
      expect(response.statusCode).toBe(401);
      done();
    });
  });

  it('should return 400 if a device token is not supplied', (done) => {
    helpers.logInTestUser((err, authedRequest) => {
      authedRequest.post(`http://${Config.endpoint}/api/notification/register`, (error, response) => {
        expect(error).toBe(null);
        expect(response.statusCode).toBe(400);
        done();
      }).form({});
    });
  });

  it('should return OK if a valid device token is supplied', (done) => {
    let nockScope = nockStubs.notificationEndpointScope(deviceToken, 'e52c854d');

    helpers.logInTestUser((err, innerRequest) => {
      expect(err).toBe(null);
      innerRequest.post(`http://${Config.endpoint}/api/notification/register`, (registerErr, response) => {
        expect(registerErr).toBe(null);
        expect(response.statusCode).toBe(204);
        expect(() => nockScope.done()).not.toThrow();
        done();
      }).form({ deviceToken, deviceType: 'ios' });
    });
  });
});
