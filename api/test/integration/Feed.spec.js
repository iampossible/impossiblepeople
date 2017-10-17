'use strict';

var gnomeApi = require('ImpossibleApi');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');
var request = require('request');

var helpers = require('../helpers');

describe('Feed endpoints', () => {
  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => dataHelper.wipe().then(done));


  describe('GET /feed', () => {
    it('should return posts', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/feed`, (error, response) => {
          expect(response.statusCode).toBe(200);
          expect(JSON.parse(response.body).length).toBeGreaterThan(1);
          done();
        });
      });
    });

    it('should transform the database responses', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/feed`, (error, response) => {
          let post = JSON.parse(response.body).filter(p => p.postID === 'dfaffa58').pop();

          expect(post.id).toBeUndefined();
          expect(post.postID).toBeDefined('missing attribute: postID');
          expect(post.content).toBeDefined('missing attribute: content');
          expect(post.timeRequired).toBeDefined('missing attribute: timeRequired');
          expect(post.location).toBeDefined('missing attribute: location');
          expect(post.resolved).toBeDefined('missing attribute: resolved');

          expect(post.commentCount).toBeDefined('missing attribute: commentCount');

          expect(post.author).toBeDefined('missing attribute: author');
          expect(post.author.id).toBeUndefined();
          expect(post.author.username).toBeDefined('missing attribute: author.username');
          expect(post.author.userID).toBeDefined('missing attribute: author.userID');

          expect(post.createdAt).toBeDefined('missing attribute: createdAt');
          expect(post.createdAtSince).toBeDefined('missing attribute: createdAtSince');

          expect(post.category).toBeDefined('missing attribute: category');
          expect(post.category.id).toBeUndefined();
          expect(post.category.interestID).toBeDefined('missing attribute: category.interestID');
          expect(post.category.name).toBeDefined('missing attribute: category.name');
          expect(post.category.image).toBeDefined('missing attribute: category.image');

          done();
        });
      });
    });

    it('should include the user\'s relationship with the post', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/feed`, (error, response) => {
          let post = JSON.parse(response.body).filter((item) => item.postID === 'dfaffa58').pop();

          expect(post.author.commonFriends).toBeDefined();
          expect(post.author.commonFriends.length).toEqual(1);

          let commonFriend = post.author.commonFriends.pop();

          expect(commonFriend.id).toBeUndefined();
          expect(commonFriend.password).toBeUndefined();
          expect(commonFriend.userID).toBeDefined();
          expect(commonFriend.username).toBeDefined();
          done();
        });
      });
    });
  });

  it('the correct number of posts for someone without friends', (done) => {
    helpers.logInAlice((err, $request) => {
      $request.get(`http://${Config.endpoint}/api/feed`, (error, response) => {
        let postCount = JSON.parse(response.body);
        
        expect(postCount.length).toBe(2); 
        done();
      });
    });
  });

  it('the correct number of comments', (done) => {
    helpers.logInTestUser((err, $request) => {
      $request.get(`http://${Config.endpoint}/api/feed`, (error, response) => {
        let post = JSON.parse(response.body).filter((item) => item.postID === '27c54302').pop();
        let commentCount = post.commentCount;
        expect(commentCount).toBe(5);
        done();
      });
    });
  });


  it('should rejected unauthenticated requests', (done) => {
    request.get(`http://${Config.endpoint}/api/feed`, (error, response) => {
      expect(response.statusCode).toBe(401);
      done();
    });
  });
});

