'use strict';

const request = require('request');

const Config = require('config/server');
const dataHelper = require('../DataHelper.js');
const gnomeApi = require('ImpossibleApi');
const helpers = require('../helpers');

const reason = 'test to check external integration - run only when required';

describe('External integrations', () => {
  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
    // require('nock').recorder.rec();
  });

  afterAll((done) => dataHelper.wipe().then(done));

  describe('Amazon notifications', () => {
    it('should return OK if a valid device token is supplied', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`http://${Config.endpoint}/api/notification/register`, (err, response) => {
          expect(response.statusCode).toBe(204);
          done();
        }).form({ deviceToken: 'a6be9819ef4b44a36b53300a1e117343bce649503a864c63e2a6896bfeabdb0a' });
      });
    }).pend(reason);

    it('should notify the author when someone creates a comment on their post', (done) => {
      var commentParams = {
        content: 'something comment',
      };

      helpers.logInTestUser((err, request) => {
        let postID = 'afd3eeff';  // I´M LATE! I`m late, I`m late! I`m LATE!

        request
          .post(`http://${Config.endpoint}/api/post/${postID}/comment`, (error, response) => {
            var result = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(result.content).toBe('something comment');
            expect(result.at).not.toBeUndefined();
            expect(result.commentID).not.toBeUndefined();
            
            done();
          })
          .form(commentParams);
      });
    }).pend(reason);
  });
});