'use strict';

var gnomeApi = require('ImpossibleApi');
var request = require('request');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');

var helpers = require('../helpers');

describe('Interest endpoints', () => {
  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => dataHelper.wipe().then(done));


  describe('POST /interest/suggestion', () => {
    it('should return 401 if user is unauthorised', (done) => {
      request.post(`http://${Config.endpoint}/api/interest/suggestion`, (err, response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('should validate the interest name', (done) => {
      helpers.logInTestUser((error, request) => {
        request.post(`http://${Config.endpoint}/api/interest/suggestion`, (err, response) => {
          expect(response.statusCode).toBe(400);
          done();
        }).form({ not: 'valid' });
      });
    });

    it('should validate the interest name', (done) => {
      helpers.logInTestUser((error, request) => {
        request.post(`http://${Config.endpoint}/api/interest/suggestion`, (err, response) => {
          expect(response.statusCode).toBe(400);
          done();
        }).form({ suggestion: { notAString: true } });
      });
    });

    it('should create a new suggestion', (done) => {
      helpers.logInTestUser((error, request) => {
        request.post(`http://${Config.endpoint}/api/interest/suggestion`, (err, response) => {
          let createdInterest = JSON.parse(response.body);

          expect(response.statusCode).toBe(201);

          expect(createdInterest.name).toBeDefined();
          expect(createdInterest.interestID).toBeDefined();
          expect(createdInterest.suggested).toBeTruthy();
          expect(createdInterest.featured).toBeFalsy();
          expect(createdInterest.id).toBeUndefined();

          done();
        }).form({ suggestion: 'Garbage' });
      });
    });

    it('should not recreate an existing interest', (done) => {
      helpers.logInTestUser((error, request) => {
        request.post(`http://${Config.endpoint}/api/interest/suggestion`, (err, response) => {
          let createdInterest = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);

          expect(createdInterest.name).toBeDefined();
          expect(createdInterest.interestID).toBeDefined();
          expect(createdInterest.suggested).toBeFalsy();
          expect(createdInterest.id).toBeUndefined();

          done();
        }).form({ suggestion: 'Art & Design' });
      });
    });

    it('should not recreate an existing suggestion case insensitive', (done) => {
      helpers.logInTestUser((error, request) => {
        request.post(`http://${Config.endpoint}/api/interest/suggestion`, (err, response) => {
          let createdInterest = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);

          expect(createdInterest.name).toBeDefined();
          expect(createdInterest.interestID).toBeDefined();
          expect(createdInterest.suggested).toBeTruthy();
          expect(createdInterest.id).toBeUndefined();

          done();
        }).form({ suggestion: 'sci-fi' });
      });
    });
  });

  describe('GET /interest', () => {
    it('should return 401 if user is unauthorised', (done) => {
      request.get(`http://${Config.endpoint}/api/interest`, (error, response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('should return interests in alphabetical order', (done) => {
      helpers.logInTestUser((err, request) => {
        request.get(`http://${Config.endpoint}/api/interest`, (error, response) => {
          expect(response.statusCode).toBe(200);
          let body = JSON.parse(response.body);

          expect(body.length).toBe(19);

          expect(body[0].id).toBeUndefined();
          expect(body[0].interestID).toBeDefined();
          expect(body[0].name).toBeDefined();

          for (let i = 1; i < body.length; i++) {
            expect(body[i].name > body[i - 1].name).toBeTruthy();
          }

          done();
        });
      });
    });

    it('should return featured interests if query param supplied', (done) => {
      helpers.logInTestUser((err, request) => {
        var url = `http://${Config.endpoint}/api/interest?featured=true`;
        request.get(url, (error, response) => {
          expect(response.statusCode).toBe(200);
          let body = JSON.parse(response.body);
          expect(body.length).toBe(18);
          body.forEach((interest) => {
            expect(interest.featured).toBeTruthy();
          });

          let firstInterest = body.pop();
          expect(firstInterest.id).toBeUndefined();
          expect(firstInterest.interestID).toBeDefined();
          expect(firstInterest.name).toBeDefined();

          done();
        });
      });
    });
  });
});
