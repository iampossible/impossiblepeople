'use strict';

const request = require('request');
const gnomeApi = require('ImpossibleApi');
const dataHelper = require('../DataHelper.js');
const Config = require('config/server');
const helpers = require('../helpers');

describe('User Privacy', () => {
  var endpoint = `http://${Config.endpoint}/api`;

  beforeEach((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => {
    dataHelper.wipe().then(done);
  });

  describe('Blocking users with /profile/{$UserID}/block', () => {
    it('should allow to block other users', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/35318264/block`, (error, response) => { // report user Alice
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          done();
        });
      });
    });

    it('should not allow to block yourself', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/e52c854d/block`, (error, response) => { // report user Demo
          expect(response.statusCode).toBe(400);
          expect(err).toBe(null);

          let body = JSON.parse(response.body);
          expect(body.msg).toBeDefined('missing error msg');

          done();
        });
      });
    });

    it('should not allow to block undefined or not found user', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/UNDEFINED/block`, (error, response) => { // report non existing user
          expect(response.statusCode).toBe(404);
          expect(err).toBe(null);

          let body = JSON.parse(response.body);
          expect(body.msg).toBeDefined('missing error msg');

          done();
        });
      });
    });

    it('should not show blocked user`s content', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/35318264/block`, (error, response) => { // block user Alice
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          $request.get(`${endpoint}/feed`, (innerError, innerResponse) => { // get the feed
            let body = JSON.parse(innerResponse.body);

            body.forEach(post => {
              expect(post.author.userID).not.toBe('35318264'); // should not list Alice`s posts
            });

            done();
          });
        });
      });
    });

    it('should not show blocked user`s comments', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/35318264/block`, (error, response) => { // block user Alice
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          $request.get(`${endpoint}/post/dfaffa58`, (innerError, innerResponse) => { // get a post
            let body = JSON.parse(innerResponse.body);

            body.comments.forEach(comment => {
              expect(comment.authorID).not.toBe('35318264'); // should not list Alice`s comments
            });

            done();
          });
        });
      });
    });

    it('should unfollow blocked users', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/37619fc1/block`, (error, response) => { // block user White Rabbit
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          $request.get(`${endpoint}/user`, (innerError, innerResponse) => { // get follows
            let body = JSON.parse(innerResponse.body);

            body.friends.forEach((user) => {
              expect(user.userID).not.toBe('37619fc1');
            });
            done();
          });
        });
      });
    });

    it('should not show content to blocked user', (done) => {
      helpers.logInAlice((err, $request) => {
        $request(`${endpoint}/profile/0c977bda/block`, (error, response) => { // block user Mad Hatter
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);


          helpers.logInMadHatter((err, $$request) => { // login user Mad Hatter
            $$request.get(`${endpoint}/feed`, (innerError, innerResponse) => { // get the feed
              let body = JSON.parse(innerResponse.body);

              body.forEach(post => {
                expect(post.author.userID).not.toBe('35318264'); // should not list Alice`s posts
              });

              done();
            });
          });
        });
      });
    });

    it('should 404 blocked user posts to blocked user', (done) => {
      helpers.logInAlice((err, $request) => {
        $request(`${endpoint}/profile/0c977bda/block`, (error, response) => { // block user Mad Hatter
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          helpers.logInMadHatter((err, $$request) => { // login user Mad Hatter
            $$request.get(`${endpoint}/post/27c54302`, (innerError, innerResponse) => { // get Alice's post

              expect(innerResponse.statusCode).toBe(404);
              done();
            });
          });
        });
      });
    });

    it('should 404 blocked user posts in his profile', (done) => {
      helpers.logInAlice((err, $request) => {
        $request(`${endpoint}/profile/0c977bda/block`, (error, response) => { // block user Mad Hatter
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);


          helpers.logInMadHatter((err, $$request) => { // login user Mad Hatter
            $$request.get(`${endpoint}/profile/35318264`, (innerError, innerResponse) => { // get Alice's profile

              expect(innerResponse.statusCode).toBe(200);
              let body = JSON.parse(innerResponse.body);
              expect(body.posts.length).toBe(0);
              done();
            });
          });
        });
      });
    });

    it('should not show blocked user in activity feed', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/37619fc1/block`, (error, response) => { // block user White Rabbit
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          $request.get(`${endpoint}/user/activity`, (innerError, innerResponse) => { // get the activity feed
            let body = JSON.parse(innerResponse.body).activities;

            body.forEach(activity => {
              expect(activity.actor.userID).not.toBe('37619fc1'); // should not list White Rabbit
            });

            done();
          });
        });
      });
    });

    it('should not count blocked user activity as unread', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/37619fc1/block`, (error, response) => { // block user White Rabbit
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          $request.get(`${endpoint}/user/activity/count`, (innerError, innerResponse) => { // get the activity feed
            let body = JSON.parse(innerResponse.body);

            expect(body.unSeen).toBe(0);
            expect(body.unRead).toBe(0);

            done();
          });
        });
      });
    });

  });

  describe('Reporting users with /profile/{$UserID}/report', () => {
    it('should allow to report other users', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/profile/37619fc1/report`, (error, response) => { // report user White Rabbit
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          done();
        });
      });
    });

    // it('should create report on database', (done) => {
    //
    //   done();
    // });

    it('should not allow to report yourself', (done) => {
      helpers.logInWhiteRabbit((err, $request) => {
        $request(`${endpoint}/profile/37619fc1/report`, (error, response) => { // report user White Rabbit
          expect(response.statusCode).toBe(400);
          expect(err).toBe(null);

          let body = JSON.parse(response.body);
          expect(body.msg).toBeDefined('missing error msg');

          done();
        });
      });
    });

  });

  describe('Reporting posts with /post/{$PostID}/report', () => {
    it('should allow to report posts', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/post/27c54302/report`, (error, response) => { // report Alice's post
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          done();
        });
      });
    });

    it('should not allow reporting your own posts', (done) => {
      helpers.logInAlice((err, $request) => {
        $request(`${endpoint}/post/27c54302/report`, (error, response) => { // report Alice's post
          expect(response.statusCode).toBe(400);
          expect(err).toBe(null);

          let body = JSON.parse(response.body);
          expect(body.msg).toBeDefined('missing error msg');

          done();
        });
      });
    });

    it('should 404 invalid posts', (done) => {
      helpers.logInAlice((err, $request) => {
        $request(`${endpoint}/post/NOTAPOST/report`, (error, response) => { // report Alice's post
          expect(response.statusCode).toBe(404);
          expect(err).toBe(null);

          let body = JSON.parse(response.body);
          expect(body.msg).toBeDefined('missing error msg');

          done();
        });
      });
    });

    // it('should create report on database', (done) => {
    //
    //   done();
    // });

    // it('should hide the post after X reports', (done) => {
    //
    //   done();
    // });

    // it('should not allow multiple reports from the same user', (done) => {
    //
    //   done();
    // });

  });

  describe('Reporting comments with /post/comment/{$CommentID}/report', () => {
    it('should allow to report comments', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request(`${endpoint}/post/comment/119dedd3/report`, (error, response) => { // report Alice's post
          expect(response.statusCode).toBe(200);
          expect(err).toBe(null);

          done();
        });
      });
    });

    it('should not allow reporting your own comments', (done) => {
      helpers.logInAlice((err, $request) => {
        $request(`${endpoint}/post/comment/119dedd3/report`, (error, response) => { // report Alice's post
          expect(response.statusCode).toBe(400);
          expect(err).toBe(null);

          let body = JSON.parse(response.body);
          expect(body.msg).toBeDefined('missing error msg');

          done();
        });
      });
    });

    it('should 404 invalid comments', (done) => {
      helpers.logInAlice((err, $request) => {
        $request(`${endpoint}/post/comment/NOTACOMMENT/report`, (error, response) => { // report Alice's post
          expect(response.statusCode).toBe(404);
          expect(err).toBe(null);

          done();
        });
      });
    });

    // it('should create report on database', (done) => {
    //
    //   done();
    // });
    //
    // it('should hide the comment after X reports', (done) => {
    //
    //   done();
    // });
    //
    // it('should not allow multiple reports from the same user', (done) => {
    //
    //   done();
    // });


  });

})
;
