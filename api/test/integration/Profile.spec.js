'use strict';

const request = require('request');
const gnomeApi = require('ImpossibleApi');
const Config = require('config/server');
const dataHelper = require('../DataHelper.js');

var helpers = require('../helpers');

describe('Profile', () => {

  let endpoint = `http://${Config.endpoint}/api/profile`;

  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => {
    dataHelper.wipe().then(done);
  });

  describe('profile/{userID} endpoint', () => {
    it('should return the public data of the supplied user id', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.get(`${endpoint}/e52c854d`, (error, response) => {  // Demo User
          var body = JSON.parse(response.body);
          
          expect(response.statusCode).toBe(200);
          expect(body.userID).toBeDefined();
          expect(body.id).toBeUndefined();
          expect(body.lastName).toBeDefined();
          expect(body.firstName).toBeDefined();
          expect(body.location).toBeDefined();
          expect(body.latitude).toBeDefined();
          expect(body.longitude).toBeDefined();
          expect(body.biography).toBeDefined();
          expect(body.imageSource).toBeDefined();
          expect(body.posts.length).toBe(1);
          expect(body.following).toBeFalsy();

          done();
        });
      });
    });

    it('should return the public data of the supplied user id', (done) => {
      helpers.logInTestUser((err, request) => {
        request.get(`${endpoint}/37619fc1`, (error, response) => {  // White Rabbit
          var body = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(body.userID).toBeDefined();
          expect(body.id).toBeUndefined();
          expect(body.firstName).toBeDefined();
          expect(body.lastName).toBeDefined();
          expect(body.location).toBeDefined();
          expect(body.biography).toBeDefined();
          expect(body.imageSource).toBeDefined();
          expect(body.posts.length).toBe(1);
          expect(body.following).toBeTruthy();

          done();
        });
      });
    });

    it('should return 404 if supplied userID does not exist', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.get(`${endpoint}/81238js`, (error, response) => {
          expect(response.statusCode).toBe(404);
          done();
        });
      });
    });

    it('should return 401 on an unauthorised request', (done) => {
      request.get(endpoint + '/afsdfsf', (err, resp) => {
        expect(resp.statusCode).toBe(401);
        done();
      });
    });
  });

  describe('profile/{userID}/follow endpoint', () => {
    it('should return 404 if PUT userID doesn\'t exist', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.put(`${endpoint}/lalalalalala/follow`, (error, response) => {
          expect(response.statusCode).toBe(404);
          expect(JSON.parse(response.body).msg).toEqual('user not found');
          done();
        });
      });
    });

    it('should return 200 if PUT succeeds', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.put(`${endpoint}/e52c854d/follow`, (error, response) => {  // Demo User
          expect(response.statusCode).toBe(200);
          done();
        });
      });
    });

    it('should return 404 if DELETE userID doesn\'t exist', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.del(`${endpoint}/lalalalalala/follow`, (error, response) => {
          expect(response.statusCode).toBe(404);
          expect(JSON.parse(response.body).msg).toEqual('user not found or not followed');
          done();
        });
      });
    });

    it('should return 200 if DELETE succeeds', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.del(`${endpoint}/e52c854d/follow`, (error, response) => {  // Demo User
          expect(response.statusCode).toBe(200);
          done();
        });
      });
    });

    it('should return 401 on an unauthorised PUT request', (done) => {
      request.put(`${endpoint}/afsdfsf/follow`, (err, resp) => {
        expect(resp.statusCode).toBe(401);
        done();
      });
    });

    it('should return 401 on an unauthorised DELETE request', (done) => {
      request.del(`${endpoint}/afsdfsf/follow`, (err, resp)  => {
        expect(resp.statusCode).toBe(401);
        done();
      });
    });

    it('should return 400 on a PUT to the active user', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.put(`${endpoint}/0c977bda/follow`, (error, response) => {  // The Mad Hatter
          expect(response.statusCode).toBe(400);
          expect(JSON.parse(response.body).msg).toEqual('users cannot follow themselves');
          done();
        });
      });
    });
  });
});
