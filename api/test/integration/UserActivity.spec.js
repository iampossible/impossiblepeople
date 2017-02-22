'use strict';

const request = require('request');
const gnomeApi = require('ImpossibleApi');
const Config = require('config/server');
const dataHelper = require('../DataHelper.js');

const helpers = require('../helpers');

describe('/api/user/activity', () => {
  var endpoint = `http://${Config.endpoint}/api/user/activity`;

  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => {
    dataHelper.wipe().then(done);
  });

  it('should return 401 on invalid auth', (done) => {
    request.get(endpoint, (error, response) => {
      expect(response.statusCode).toBe(401);
      done();
    });
  });

  describe('Activity count', () => {
    it('should return unSeen and unRead activity count', (done) => {
      helpers.logInMadHatter((err, request) => {
        request.get(endpoint + '/count', (error, response) => {
          let body = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(body.unRead).toBeDefined();
          expect(body.unRead).toBeGreaterThan(0);
          expect(body.unSeen).toBeDefined();
          expect(body.unSeen).toBeGreaterThan(0);
          done();
        });
      });
    });
  });


  describe('Activity items', () => {
    var activityArr;

    beforeAll((done) => {
      helpers.logInMadHatter((err, request) => {
        request.get(endpoint, (error, response) => {
          let body = JSON.parse(response.body);
          activityArr = body.activities;
          done();
        });
      });
    });

    it('should have the right schema', () => {
      let activity = activityArr[0];

      expect(activity.activityID).toBeDefined('activity.activityID');
      expect(activity.userID).toBeDefined('activity.userID');
      expect(activity.type).toBeDefined('activity.type');
      expect(activity.text).toBeDefined('activity.text');

      expect(activity.time).toBeDefined('activity.time');
      expect(activity.timeAt).toBeDefined('activity.timeAt');

      expect(activity.isNew).toBeDefined('activity.isNew');
      expect(typeof activity.isNew).toBe('boolean');
      expect(activity.isRead).toBeDefined('activity.isRead');
      expect(typeof activity.isRead).toBe('boolean');

      expect(activity.target).toBeDefined('activity.target');
      expect(activity.actor).toBeDefined('activity.actor');
      expect(activity.actor.username).toBeDefined('activity.actor.username');
      expect(activity.actor.userID).toBeDefined('activity.actor.UserID');
      expect(activity.actor.imageSource).toBeDefined('activity.actor.imageSource');

    });

    it('should have the right target schema for N_COMMENT', () => {
      let activity = activityArr.find((a) => a.type == 'N_COMMENT');

      expect(activity.commentID).toBeUndefined('commentID');

      expect(activity.target.Post).toBeDefined('activity.target.Post');
      expect(activity.target.Post.author).toBeDefined('activity.target.Post.author');
      expect(activity.target.Post.postID).toBeDefined('activity.target.Post.postID');
      expect(activity.target.Post.content).toBeDefined('activity.target.Post.content');
      expect(activity.target.Comment).toBeDefined('activity.target.Comment');
      expect(activity.target.Comment.author).toBeDefined('activity.target.Comment.author');
      expect(activity.target.Comment.commentID).toBeDefined('activity.target.Comment.commentID');
      expect(activity.target.Comment.content).toBeDefined('activity.target.Comment.content');
    });

    it('should have the right target schema for N_FOLLOW', () => {
      let activity = activityArr.find((a) => a.type == 'N_FOLLOW');

      expect(activity.commentID).toBeUndefined('commentID');
      expect(activity.target.Post).toBeUndefined('activity.target.Post');
      expect(activity.target.Comment).toBeUndefined('activity.target.Comment');
    });

    it('should include the ID of the actor, target post and target comment on N_COMMENT', () => {
      let activity = activityArr.find(a => a.activityID === 'b68e6245');

      expect(activity.type).toBe('N_COMMENT');  // Alice
      expect(activity.actor.userID).toBe('35318264');  // Alice
      expect(activity.target.Comment.commentID).toBe('119dedd3');  // well, I haven't had any yet
      expect(activity.target.Post.postID).toBe('dfaffa58');  // Would you like a little tea?
    });

    it('should include the ID of the actor but empty target on N_FOLLOW', () => {
      let activity = activityArr.find(a => a.activityID === '3b31e10e');

      expect(activity.type).toBe('N_FOLLOW');  // Alice
      expect(activity.actor.userID).toBe('37619fc1');  // White Rabbit
      expect(activity.target.Comment).toBeUndefined();
      expect(activity.target.Post).toBeUndefined();
    });

    it('should show activities in reverse chronological order', () => {
      expect(activityArr[1].timeAt).toBeLessThan(activityArr[0].timeAt);
      expect(activityArr[2].timeAt).toBeLessThan(activityArr[1].timeAt);
      expect(activityArr[3].timeAt).toBeLessThan(activityArr[2].timeAt);
    });

    it('shouldn\'t show the user\'s own comments in the activity log', () => {
      let MadActors = activityArr.filter(a => a.actor.userID === '0c977bda');
      expect(MadActors.length).toBe(0);
      let MadComments = activityArr.filter(a => a.target.Comment && a.target.Comment.userID === '0c977bda');
      expect(MadComments.length).toBe(0);
    });

  });

  // TODO: implement N_REPLY
  xit('should include comments on posts the user commented on', (done) => {
    // helpers.logInMadHatter((err, request) => {
    //   request.get(endpoint, (error, response) => {
    //     let body = JSON.parse(response.body);
    //
    //     expect(response.statusCode).toBe(200);
    //
    //     let expected = body.activities.filter(activity => activity.content.relatedID === 'd69fc68b');  // How long is forever?
    //     expect(expected.length).toBe(1);
    //     expect(expected[0].content.executor).toEqual('White Rabbit');
    //     done();
    //   });
    // });
  }).pend('N_REPLY is not implemented');
});
