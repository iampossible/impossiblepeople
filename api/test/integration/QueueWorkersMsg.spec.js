'use strict';

const gnomeApi = require('ImpossibleApi');
const request = require('request');
const dataHelper = require('../DataHelper.js');
const Config = require('config/server');
const helpers = require('../helpers');

var QueueWorkers = require('middleware/QueueWorkers');


describe('Post endpoints', () => {
  beforeAll(() => {
    gnomeApi.start();
  })

  beforeEach((done) => {
    dataHelper.populate().then(done);
  });

  afterEach((done) => {
    dataHelper.wipe().then(done);
  });


  function createPost(postParams, expect) {
    helpers.logInTestUser((err, request) => {
      request
        .post(`http://${Config.endpoint}/api/post/create`, expect)
        .form(postParams);
    });
  }

  function createComment(content, expect) {
    let postID = 'afd3eeff';  // I´M LATE! I`m late, I`m late! I`m LATE!
    helpers.logInTestUser((err, request) => {
      request
        .post(`http://${Config.endpoint}/api/post/${postID}/comment`, expect)
        .form({ content });
    });
  }

  var validPostParams = {
    content: 'Can you cook spaghetti for me?',
    postType: 'ASKS',
    interestID: 'a52b59d',
  };

  describe('CREATE_POST_EVENT', () => {
    it('should fire CREATE_POST_EVENT to gnome-activity', (done) => {
      spyOn(QueueWorkers, 'publish');

      createPost(validPostParams, () => {
        expect(QueueWorkers.publish).toHaveBeenCalledWith('activity', 'CREATE_POST_EVENT', jasmine.any(Object))
        done();
      });
    });
  });

  describe('CREATE_COMMENT_EVENT', () => {
    it('should fire CREATE_COMMENT_EVENT to gnome-activity', (done) => {
      spyOn(QueueWorkers, 'publish');

      createComment('something comment', () => {
        expect(QueueWorkers.publish).toHaveBeenCalledWith('activity', 'CREATE_COMMENT_EVENT', jasmine.any(Object))
        done();
      });
    });
  });
});
