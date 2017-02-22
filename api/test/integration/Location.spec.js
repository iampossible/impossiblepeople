'use strict';

var gnomeApi = require('ImpossibleApi');
var request = require('request');
var fs = require('fs');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');

var stubs = require('../NockStubs');
var helpers = require('../helpers');

describe('Location endpoints', () => {
  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => dataHelper.wipe().then(done));

  describe('POST /location', () => {
    it('should return a friendly location (London)', (done) => {

      let scope = stubs.googleLocationScope('51.526,-0.084', 200, fs.readFileSync('test/assets/gmaps_response.json'));

      helpers.logInTestUser((err, $request) => {
        $request.post(`http://${Config.endpoint}/api/location`, (error, response) => {
          expect(response.statusCode).toBe(200);

          let result = JSON.parse(response.body);
          expect(result.friendlyName).toBe('Hackney, London');

          scope.done();
          done();
        }).form({ latitude: 51.526, longitude: -0.084, accuracy: 1 });
      });
    });

    it('should return a friendly location (Australia)', (done) => {

      let scope = stubs.googleLocationScope('-28.7842,153.5914', 200, fs.readFileSync('test/assets/gmaps_response_au.json'));

      helpers.logInTestUser((err, $request) => {
        $request.post(`http://${Config.endpoint}/api/location`, (error, response) => {
          expect(response.statusCode).toBe(200);

          let result = JSON.parse(response.body);
          expect(result.friendlyName).toBe('Ballina Shire Council, South Ballina');

          scope.done();
          done();
        }).form({ latitude: -28.7842, longitude: 153.5914, accuracy: 1 });
      });
    });


    it('should return 400 if the location cannot be geocoded', (done) => {
      let scope = stubs.googleLocationScope('1.23,4.56', 200, {"results":[],"status":"ZERO_RESULTS"});
      helpers.logInTestUser((err, $request) => {
        $request.post(`http://${Config.endpoint}/api/location`, (error, response) => {

          expect(response.statusCode).toBe(400);

          scope.done();
          done();
        }).form({ latitude: 1.23, longitude: 4.56, accuracy: 1 });
      });
    });
    
    it('should return 400 if the latitude and longitude are non-numeric', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.post(`http://${Config.endpoint}/api/location`, (error, response) => {
          expect(response.statusCode).toBe(400);

          done();
        }).form({ latitude: 'old street', longitude: 'london', accuracy: 1 });
      });
    });

    it('should return 400 if the latitude and longitude are not present', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.post(`http://${Config.endpoint}/api/location`, (error, response) => {
          expect(response.statusCode).toBe(400);

          done();
        }).form({ accuracy: 1 });
      });
    });

    it('should return 401 if user is unauthorised', (done) => {
      request.post(`http://${Config.endpoint}/api/location`, (error, response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
    });
  });
});
