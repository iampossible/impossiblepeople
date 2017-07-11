'use strict';

var request = require('request');
var gnomeApi = require('ImpossibleApi');
var Config = require('config/server');
var dataHelper = require('../DataHelper.js');

var helpers = require('../helpers');

var EmailService = require('middleware/EmailService');

describe('User', () => {
  beforeAll(() => {
    gnomeApi.start();
  });

  beforeEach((done) => {
    dataHelper.populate().then(done);
  });

  afterEach((done) => {
    dataHelper.wipe().then(done);
  });

  function getAndExpect(url, statusCode, done) {
    request.get(url, (error, response) => {
      expect(response.statusCode).toBe(statusCode);
      done();
    });
  }

  describe('/api/user/interest endpoint', () => {
    it('should return 401 on an unauthorised request', (done) => {
      request.post(`http://${Config.endpoint}/api/user/interest`, (err, resp) => {
        expect(resp.statusCode).toBe(401);
        done();
      });
    });

    it('should persist the user\'s interests', (done) => {
      helpers.logInTestUser((err, request) => {
        request.get(`http://${Config.endpoint}/api/interest?featured=true`, (error, response) => {
          let interests = JSON.parse(response.body).slice(0, 3).map(interest => interest.interestID);
          request.post(`http://${Config.endpoint}/api/user/interest`, (err, resp) => {
            expect(resp.statusCode).toBe(200);

            let body = JSON.parse(resp.body);

            expect(body.interests).toBeDefined();
            expect(body.interests.length).toBeGreaterThan(2);

            for (let index in interests) {
              expect(body.interests.find(interest => interest.interestID === interests[index])).toBeTruthy();
            }

            done();
          }).form({ interests: JSON.stringify(interests) });
        });
      });
    });

    it('should return 400 if interests array is malformed', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`http://${Config.endpoint}/api/user/interest`, (err, resp) => {
          expect(resp.statusCode).toBe(400);
          done();
        }).form({ interests: '[' });
      });
    });

    it('should update the user\'s interests', (done) => {
      helpers.logInTestUser((err, request) => {
        let interests = '["4efb6cb7","35b25929"]';  // Family and Food

        request.put(`http://${Config.endpoint}/api/user/interest`, (error, response) => {
          expect(response.statusCode).toBe(200);
          if (response.body) {
            let body = JSON.parse(response.body);

            expect(body.interests).toBeDefined();
            expect(body.interests.length).toBe(2);
            expect(body.interests.find(interest => interest.interestID === '4efb6cb7')).toBeTruthy();
            expect(body.interests.find(interest => interest.interestID === '35b25929')).toBeTruthy();
            expect(body.interests.find(interest => interest.interestID === '131260cb')).toBeFalsy();  // Music
          }
          done();
        }).form({ interests });
      });
    });

    it('should return 400 if interests array is malformed', (done) => {
      helpers.logInTestUser((err, request) => {
        request.put(`http://${Config.endpoint}/api/user/interest`, (err, resp) => {
          expect(resp.statusCode).toBe(400);
          done();
        }).form({ interests: '[' });
      });
    });

    it('should return 400 if interests array has wrong elements', (done) => {
      helpers.logInTestUser((err, request) => {
        request.put(`http://${Config.endpoint}/api/user/interest`, (err, resp) => {
          expect(resp.statusCode).toBe(400);
          done();
        }).form({ interests: '[{a: 1,b:2},{c: 3,d:4}]' });
      });
    });

    it('should return all interests of the token user', (done) => {
      helpers.logInTestUser((err, request) => {
        request.get(`http://${Config.endpoint}/api/user/interest`, (error, response) => {
          expect(response.statusCode).toBe(200);
          let body = JSON.parse(response.body);

          expect(body.interests).toBeDefined();
          expect(body.interests.length).toBe(2);

          let firstInterest = body.interests[0];

          expect(firstInterest.interestID).toBeDefined();
          expect(firstInterest.id).toBeUndefined();
          expect(firstInterest.name).toBeDefined();
          expect(firstInterest.featured).toBeDefined();
          expect(firstInterest.suggested).toBeDefined();
          done();
        });
      });
    });
  });

  describe('api/user endpoint', () => {
    let endpoint = `http://${Config.endpoint}/api/user`;

    beforeEach((done) => dataHelper.populate().then(done));

    it('should return 401 on an unauthorised request', (done) => {
      request.get(`${endpoint}`, (err, resp) => {
        expect(resp.statusCode).toBe(401);
        done();
      });
    });

    it('should return the current user', (done) => {
      helpers.logInTestUser((err, request) => {
        request.get(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.userID).toBeDefined();
          expect(user.id).toBeUndefined();
          expect(user.notificationEndpoint).toBeUndefined();
          expect(user.firstName).toBe('Demo');
          expect(user.lastName).toBe('User');
          expect(user.location).toBe('Lawrence Township');
          expect(user.url).toBe('http://township.me/');
          expect(user.interests.length).toEqual(2);
          expect(user.posts.length).toEqual(1);

          let post = user.posts[0];
          expect(post.content).toEqual('Some dumb ask');
          expect(post.postType).toEqual('ASKS');
          expect(post.id).toBeUndefined();

          done();
        });
      });
    });

    it('should return the current user\'s friends', (done) => {
      helpers.logInTestUser((err, request) => {
        request.get(`${endpoint}`, (error, response) => {
          expect(response.statusCode).toBe(200);
          let user = JSON.parse(response.body);

          expect(user.friends).toBeDefined();

          if (user.friends) {
            expect(user.friends.length).toBe(2);

            let firstFriend = user.friends.pop();

            expect(firstFriend.username).toBeDefined();
            expect(firstFriend.id).toBeUndefined();
            expect(firstFriend.location).toBeDefined();  // null
            expect(firstFriend.imageSource).toBeDefined();  // null
          }

          done();
        });
      });
    });

    it('should return the current user\'s posts', (done) => {
      helpers.logInTestUser((err, request) => {
        request.get(`${endpoint}/post`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.userID).toBeDefined();
          expect(user.posts).toBeDefined();

          let post = user.posts.pop();

          expect(post.postID).toBeDefined('postID');
          expect(post.id).toBeUndefined();
          expect(post.content).toBeDefined('content');
          expect(post.resolved).toBeDefined('resolved');
          expect(post.author).toBeDefined('author');
          expect(post.author.username).toBeDefined('author.username');
          expect(post.author.userID).toBeDefined('author.userID');
          expect(post.commentCount).toBeDefined('commentCount');
          expect(post.createdAt).toBeDefined('createdAt');
          expect(post.createdAtSince).toBeDefined('createdAtSince');
          expect(post.category).toBeDefined('Category');
          expect(post.category.interestID).toBeDefined('Category.interestID');
          expect(post.category.name).toBeDefined('Category.name');
          expect(post.category.image).toBeDefined('Category.image');

          done();
        });
      });
    });

    it('should return 401 on an unauthorised request', (done) => {
      request.post(`${endpoint}`, (err, resp) => {
        expect(resp.statusCode).toBe(401);
        done();
      });
    });

    it('should update the current user (location)', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.location).toBe('Cheshunt');

          done();
        }).form({ latitude: 1.234, longitude: 4.567, location: 'Cheshunt' });
      });
    });

    it('should update the current user (url http)', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.url).toBe('http://lawrence.me/');

          done();
        }).form({ url: 'http://lawrence.me/' });
      });
    });

    it('should update the current user (url https)', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.url).toBe('https://lawrence.me/');

          done();
        }).form({ url: 'https://lawrence.me/' });
      });
    });

    it('should update the current user (url schemeless)', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.url).toBe('http://lawrence.me');

          done();
        }).form({ url: 'lawrence.me' });
      });
    });

    it('should clear the current user (url empty)', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.url).toBe('');

          done();
        }).form({ url: '' });
      });
    });

    it('should fail to update the current user (url)', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(400);

          done();
        }).form({ url: 'not really a url, right?' });
      });
    });

    it('should update the current user (username and bio)', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(user.biography).toBe('pretty cool guy');
          expect(user.firstName).toBe('My New');
          expect(user.lastName).toBe('Username');
          expect(user.id).toBeUndefined();

          done();
        }).form({ firstName: 'My New', lastName: 'Username', biography: 'pretty cool guy' });
      });
    });

    it('should fail the update if the property is not supported', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          let user = JSON.parse(response.body);

          expect(response.statusCode).toBe(400);

          done();
        }).form({ somefield: 'foobar' });
      });
    });

    it('should reject unexpected updates', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`${endpoint}`, (error, response) => {
          expect(response.statusCode).toBe(400);
          done();
        }).form({ weird: 'parameters' });
      });
    });
  });
});

