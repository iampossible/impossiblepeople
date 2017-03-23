'use strict';

const gnomeApi = require('ImpossibleApi');
const request = require('request');
const dataHelper = require('../DataHelper.js');
const Config = require('config/server');
const postModel = require('models/PostModel');
const Sequence = require('impossible-promise');

const helpers = require('../helpers');

describe('Post endpoints', () => {

  beforeAll(() => gnomeApi.start());

  beforeEach((done) => dataHelper.populate().then(done));

  let validPostParams = {
    content: 'Can you cook spaghetti for me?',
    postType: 'ASKS',
    interestID: 'a52b59d',
  };

  describe('/post/create', () => {
    function postWithParams(postParams, expect) {
      helpers.logInTestUser((err, $request) => {
        $request
          .post(`http://${Config.endpoint}/api/post/create`, expect)
          .form(postParams);
      });
    }

    it('should return 401 if user is unauthorised', (done) => {
      request.post(`http://${Config.endpoint}/api/post/create`, (err, response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('should create ask post', (done) => {
      postWithParams(validPostParams, (error, response) => {
        var result = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(result.content).toBe('Can you cook spaghetti for me?');
        expect(result.postID).not.toBeUndefined();
        expect(result.timeRequired).toBe(0);

        done();
      });
    });

    it('should create offer post', (done) => {
      var postParams = Object.assign(validPostParams, {
        content: 'I can cook spaghetti!',
        postType: 'OFFERS',
      });

      postWithParams(postParams, (error, response) => {
        var result = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(result.content).toBe('I can cook spaghetti!');
        expect(result.postID).not.toBeUndefined();
        expect(result.timeRequired).toBe(0);

        done();
      });
    });

    it('should create offer post with time required', (done) => {
      var postParams = Object.assign(validPostParams, {
        timeRequired: 3600,
      });

      postWithParams(postParams, (error, response) => {
        var result = JSON.parse(response.body);
        expect(response.statusCode).toBe(200);
        expect(result.timeRequired).toBe(3600);
        done();
      });
    });

    it('should create offer post with an interest', (done) => {
      var postParams = Object.assign(validPostParams, {
        interestID: '4789052',
      });

      postWithParams(postParams, (error, response) => {
        var result = JSON.parse(response.body);
        expect(response.statusCode).toBe(200);
        expect(result.interestID).toBe('4789052');
        done();
      });
    });

    it('should return 400 when postType is not set', (done) => {
      var postParams = Object.assign(validPostParams, {
        postType: null,
      });

      postWithParams(postParams, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('should return 400 when postType is not valid', (done) => {
      var postParams = Object.assign(validPostParams, {
        postType: 'Duck',
      });

      postWithParams(postParams, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('should return 400 when content not valid', (done) => {
      var postParams = Object.assign(validPostParams, {
        content: null,
      });

      postWithParams(postParams, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
  });

  describe('/post/{id}', () => {
    var postID = 'dfaffa58';  // would you like more tea?

    function getAndExpect(id, expect) {
      helpers.logInTestUser((err, $request) => $request.get(`http://${Config.endpoint}/api/post/${id}`, expect));
    }

    it('should return 401 if user is unauthorised', (done) => {
      request.get(`http://${Config.endpoint}/api/post/${postID}`, (err, response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('should retrieve post details for valid id', (done) => {
      getAndExpect(postID, (err, response) => {
        let result = JSON.parse(response.body);

        expect(err).toBeNull();
        expect(response.statusCode).toBe(200);
        expect(result.postID).toEqual(postID);
        expect(result.content).toEqual('Would you like a little more tea?');
        expect(result.author).toBeDefined();
        expect(result.author.username).toBeDefined();
        expect(result.author.userID).toBeDefined();
        expect(result.createdAt).toBeDefined('createdAt');
        expect(result.createdAtSince).toBeDefined('createdAtSince');
        expect(result.category).toBeDefined('category');
        expect(result.category.interestID).toBeDefined('category.interestID');
        expect(result.category.name).toBeDefined('category.name');
        expect(result.category.image).toBeDefined('category.image');

        done();
      });
    });

    it('should retrieve post comments for valid id', (done) => {
      getAndExpect(postID, (err, response) => {
        let result = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(result.comments).toBeDefined();
        expect(result.comments.length).toBe(3);

        let firstComment = result.comments[0];

        expect(firstComment.content).toBeDefined();
        expect(firstComment.createdAt).toBeDefined();
        expect(firstComment.createdAtSince).toBeDefined();
        expect(firstComment.author).toBeDefined();
        expect(firstComment.authorID).toBeDefined('AuthorID on comment');
        expect(firstComment.commentID).toBeDefined('CommentID on comment');

        done();
      });
    });

    it('should retrieve post comments in order', (done) => {
      getAndExpect(postID, (err, response) => {
        let result = JSON.parse(response.body);

        let date1 = result.comments[0].createdAt;
        let date2 = result.comments[1].createdAt;
        let date3 = result.comments[2].createdAt;

        expect(date1).toBeLessThan(date2);
        expect(date2).toBeLessThan(date3);

        done();
      });
    });
  });

  describe('/post/{id}/comment', () => {
    var postID = 'afd3eeff';  // I´M LATE! I`m late, I`m late! I`m LATE!

    function postWithParams(commentParams, expect) {
      helpers.logInTestUser((err, $request) => {
        $request
          .post(`http://${Config.endpoint}/api/post/${postID}/comment`, expect)
          .form(commentParams);
      });
    }

    it('should return 401 if user is unauthenticated', (done) => {
      request.post(`http://${Config.endpoint}/api/post/${postID}/comment`, (err, response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('should create a comment', (done) => {
      // let commentScope = nockStubs.commentPublishScope('white-rabbit-arn', 'Demo User', postID);
      var commentParams = {
        content: 'something comment',
      };

      postWithParams(commentParams, (error, response) => {
        var result = JSON.parse(response.body);
        expect(response.statusCode).toBe(200);
        expect(result.content).toBe('something comment');
        expect(result.at).not.toBeUndefined();
        expect(result.commentID).not.toBeUndefined();

        // commentScope.done();
        done();
      });
    });

    /*
    xit('should not notify the author of post, if the commenter is the post creator', (done) => {

      let commentScope = nockStubs.commentPublishScope('white-rabbit-arn', 'White Rabbit', postID);
      var commentParams = {
        content: 'something comment',
      };

      helpers.logInWhiteRabbit((err, request) => {
        request
          .post(`http://${Config.endpoint}/api/post/${postID}/comment`, (err, response) => {
            expect(commentScope.isDone()).toBeFalsy();
            done();
          })
          .form(commentParams);
      });
    });
    */

    it('should return 400 on invalid comment data', (done) => {
      var commentParams = {
        content: '',
      };

      postWithParams(commentParams, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
  });

  describe('/post/{id} delete', () => {
    var postID = 'afd3eeff';  // I´M LATE! I`m late, I`m late! I`m LATE!

    it('should return 401 if user has no cookie', (done) => {
      request
        .delete(`http://${Config.endpoint}/api/post/${postID}`, (err, response) => {
          expect(response.statusCode).toBe(401);
          done();
        });
    });

    it('should return 403 if user is not authorized to delete post', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request
          .delete(`http://${Config.endpoint}/api/post/${postID}`, (errInner, response) => {
            expect(response.statusCode).toBe(403);
            done();
          });
      });
    });

    it('should return 400 if user does not provide postID', (done) => {
      helpers.logInMadHatter((err, $request) => {
        $request
          .delete(`http://${Config.endpoint}/api/post/%20`, (errInner, response) => {
            expect(response.statusCode).toBe(400);
            done();
          });
      });
    });

    it('should return 403 if user deletes a non-existing postID', (done) => {
      let newPostID = 'nonExisting';
      helpers.logInMadHatter((err, $request) => {
        $request
          .delete(`http://${Config.endpoint}/api/post/${newPostID}`, (errInner, response) => {
            expect(response.statusCode).toBe(403);
            done();
          });
      });
    });

    it('should return 200 if user is authorized to delete post', (done) => {
      let newPostID = 'dfaffa58';
      helpers.logInMadHatter((err, $request) => {
        $request
          .delete(`http://${Config.endpoint}/api/post/${newPostID}`, (errInner, response) => {
            expect(response.statusCode).toBe(200);
            done();
          });
      });
    });

    function checkComment(ID) {
      return new Sequence((accept, reject) => {
        postModel.db.query('MATCH ()-[c:COMMENTS]->(p:Post {postID: {ID}}) RETURN c',
          { ID },
          (err, data) => {
            if (err) reject(err);
            accept(data.length);
          });
      });
    }

    it('should delete all of the related comments', (done) => {
      let newPostID = 'dfaffa58';

      checkComment(newPostID)
        .then((reject, accept, count) => {
          expect(count).toBe(3);
          accept();
        })
        .then((accept) => {
          helpers.logInMadHatter((err, $request) => {
            $request.delete(`http://${Config.endpoint}/api/post/${newPostID}`, accept);
          });
        })
        .then(() => {
          checkComment(newPostID).done((count) => {
            expect(count).toBe(0);
            done();
          }).error(err => {
            expect(err).toBeUndefined();
            done();
          });
        }).error(err => {
          expect(err).toBeUndefined();
          done();
        });
    });

  });

  describe('/post/{id}/report', () => {

    it('should not allow report of own posts', (done) => {
      let reportPostID = 'dfaffa58';

      helpers.logInMadHatter((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/post/${reportPostID}/report`, (innerErr, response) => {
          expect(response.statusCode).toBe(400);

          done();
        });
      });
    });

    it('should return 404 if the post was not found', (done) => {
      let reportPostID = 'NOTAPOSTID';

      helpers.logInMadHatter((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/post/${reportPostID}/report`, (innerErr, response) => {
          expect(response.statusCode).toBe(404);

          let body = JSON.parse(response.body);

          expect(body.msg).toBeDefined();
          expect(body.msg).toBe('post not found');

          done();
        });
      });
    });

    it('should allow report of other posts', (done) => {
      let reportPostID = '73de12e4';

      helpers.logInMadHatter((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/post/${reportPostID}/report`, (innerErr, response) => {
          expect(response.statusCode).toBe(200);

          let body = JSON.parse(response.body);

          expect(body.msg).toBeDefined();
          expect(body.msg).toBe('Thank you! We will review the post shortly.');
          expect(body.postID).toBe(reportPostID);

          done();
        });
      });
    });


    // it('should not show posts with more than 3 reports', (done) =>{
    //
    //     done();
    // });

  });

  describe('/post/{id}/resolve', () => {
    let resolvedPostID = '27c54302';
    let newPostParams = {
      content: 'Can you cook spaghetti for me?',
      postType: 'ASKS',
      interestID: 'a52b59d',
    };

    it('should return resolved status', (done) => {

      helpers.logInAlice((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/post/${resolvedPostID}`, (innerErr, response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toBeDefined();
          if (response.body) {
            let body = JSON.parse(response.body);
            if (body) {
              expect(body.resolved).toBe(true);
            } else {
              expect(false).toBe(true);
            }
          } else {
            expect(false).toBe(true);
          }
          done();
        });
      });
    });

    it('should resolve self post', (done) => {
      helpers.logInTestUser((err, $request) => {
        function postWithParams(postParams, cb) {
          $request
            .post(`http://${Config.endpoint}/api/post/create`, cb)
            .form(postParams);
        }
        postWithParams(newPostParams, (error, response) => {
          var result = JSON.parse(response.body);

          expect(response.statusCode).toBe(200);
          expect(result.postID).not.toBeUndefined();

          if (result.postID) {
            $request.get(`http://${Config.endpoint}/api/post/${result.postID}/resolve`, (innerErr, resolveResponse) => {
              expect(resolveResponse.statusCode).toBe(200);
              expect(resolveResponse.body).toBeDefined();
              if (resolveResponse.body) {
                let body = JSON.parse(resolveResponse.body);
                if (body) {
                  expect(body.resolved).toBe(true);
                } else {
                  expect(false).toBe(true);
                }
              } else {
                expect(false).toBe(true);
              }
              done();
            });
          } else {
            expect(false).toBe(true);
          }
        });
      });
    });

    it('should not resolve posts from someone else', (done) => {
      function postWithParams(postParams, cb) {
        helpers.logInTestUser((err, $request) => {
          $request
            .post(`http://${Config.endpoint}/api/post/create`, cb)
            .form(postParams);
        });
      }
      postWithParams(newPostParams, (error, response) => {
        let result = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(result.postID).not.toBeUndefined();
        if (result.postID) {
          helpers.logInMadHatter((err, $request) => {
            $request.get(`http://${Config.endpoint}/api/post/${result.postID}/resolve`, (innerErr, resolveResponse) => {
              expect(resolveResponse.statusCode).toBe(403);
              done();
            });
          });
        }
      });
    });

    it('should not create a comment on resolved post', (done) => {
      function postWithParams(commentParams, expect) {
        helpers.logInTestUser((err, $request) => {
          $request
            .post(`http://${Config.endpoint}/api/post/${resolvedPostID}/comment`, expect)
            .form(commentParams);
        });
      }
      let commentParams = {
        content: 'something comment',
      };

      postWithParams(commentParams, (error, response) => {
        expect(response.statusCode).toBe(500);
        done();
      });
    });
  });
});
