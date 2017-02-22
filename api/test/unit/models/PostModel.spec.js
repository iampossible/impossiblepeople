'use strict';

var postModel = require('models/PostModel');
var Sequence = require('impossible-promise');

describe('Post model', () => {
  beforeEach(() => {
    postModel = new postModel.constructor();
  });

  describe('failing cases', () => {
    let mockPost = {};
    let mockUser = {};

    it('should not continue if saving post fails', (done) => {
      spyOn(postModel.db, 'save').and.callFake((object, label, callback) => callback('error'));
      spyOn(postModel.db, 'relate').and.callThrough();

      postModel.createPost(mockUser, 'OFFERS', mockPost).error(() => {
        expect(postModel.db.save).toHaveBeenCalledTimes(1);
        expect(postModel.db.relate).not.toHaveBeenCalled();

        done();
      });
    });

    it('should not continue if relating post with user fails', (done) => {
      spyOn(postModel.db, 'save').and.callFake((data, label, callback) => {
        callback(null, { new: 'post' });
      });
      spyOn(postModel.db, 'relate').and.callFake((user, rel, post, date, callback) => callback('error'));

      postModel.createPost(mockUser, 'OFFERS', mockPost).error((e) => {
        expect(postModel.db.save).toHaveBeenCalledTimes(1);
        expect(postModel.db.relate).toHaveBeenCalledTimes(1);

        done();
      });
    });

    it('should not continue if saving nodeID fails', (done) => {
      spyOn(postModel.db, 'save').and.callFake((data, label, valueOrCallback, callback) => {
        if (!callback) {
          //first save
          valueOrCallback(null, { new: 'post' });
        } else {
          callback('error');
        }
      });
      spyOn(postModel.db, 'relate').and.callFake((user, rel, post, date, callback) => callback(null, {
        new: 'relationship',
        properties: {}
      }));
      spyOn(postModel.db, 'query');
      postModel.createPost(mockUser, 'OFFERS', mockPost).error((e) => {
        expect(postModel.db.save).toHaveBeenCalledTimes(2);
        expect(postModel.db.relate).toHaveBeenCalledTimes(1);
        expect(postModel.db.query).not.toHaveBeenCalled();

        done();
      });

    });

    it('should not continue if relating interests to post fails', (done) => {
      spyOn(postModel.db, 'save').and.callFake((data, label, valueOrCallback, callback) => {
        if (!callback) {
          //first save (post node)
          valueOrCallback(null, { new: 'post' });
        } else {
          //seconds save (post ID)
          callback(null, { new: 'post' });
        }
      });
      spyOn(postModel.db, 'relate').and.callFake((user, rel, post, date, callback) => callback(null, {
        new: 'relationship',
        properties: {}
      }));
      spyOn(postModel.db, 'query').and.callFake((query, postNode, cb) => {
        cb('error')
      });

      postModel.createPost(mockUser, 'OFFERS', mockPost).error((e) => {
        expect(postModel.db.save).toHaveBeenCalledTimes(2);
        expect(postModel.db.relate).toHaveBeenCalledTimes(1);
        expect(postModel.db.query).toHaveBeenCalledTimes(1);

        done();
      });
    });

  });

  describe('normal cases', () => {
    beforeEach(() => {
      spyOn(postModel.db, 'save').and.callFake((data, label, valueOrCallback, callback) => {
        if (!callback) {
          //first save (post node)
          valueOrCallback(null, { new: 'post' });
        } else {
          //seconds save (post ID)
          callback(null, { new: 'post' });
        }
      });

      spyOn(postModel.db, 'relate').and.callFake((user, label, post, data, callback) => {
        callback(null, { new: 'relationship', properties: {} });
      });

      spyOn(postModel.db, 'encodeEdgeID').and.returnValue('imahash');

      spyOn(postModel.db, 'query').and.callFake((data, params, callback) => {
        callback(null, []);
      });

      spyOn(Date, 'now').and.returnValue(123456789);
    });

    describe('createPost method - OFFERS', () => {
      it('should save the new post', (done) => {
        postModel
          .createPost({ id: 1 }, 'OFFERS', { content: 'bar', interestID: '1' })
          .then(() => {
            expect(postModel.db.save).toHaveBeenCalledWith(
              { content: 'bar', interestID: '1' }, 'Post', jasmine.any(Function)
            );
            done();
          });
      });

      it('should relate the post to the user', (done) => {
        postModel
          .createPost({ id: 1 }, 'OFFERS', { content: 'bar' })
          .then(() => {
            expect(postModel.db.relate).toHaveBeenCalledWith(
              { id: 1 }, 'OFFERS', { new: 'post' }, { at: 123456789 }, jasmine.any(Function)
            );

            done();
          });
      });

      it('should return postNode on success', (done) => {
        postModel
          .createPost({ email: 'user' }, 'OFFERS', { foo: 'bar' })
          .done((postNode) => {
            expect(postNode).toEqual({ new: 'post' });
            expect(postModel.db.save).toHaveBeenCalled();
            expect(postModel.db.save.calls.count()).toEqual(2);
            expect(postModel.db.relate.calls.count()).toEqual(1);
            expect(postModel.db.query.calls.count()).toEqual(1);
            expect(postModel.db.encodeEdgeID).toHaveBeenCalled();
            done();
          });
      });
    });

    describe('createPost method - ASKS', () => {


      it('should save the new post', (done) => {
        postModel
          .createPost({ id: 1 }, 'ASKS', { content: 'bar' })
          .then(() => {
            expect(postModel.db.save)
              .toHaveBeenCalledWith({
                content: 'bar',
              }, 'Post', jasmine.any(Function));
            done();
          });
      });

      it('should relate the post to the user', (done) => {
        postModel
          .createPost({ id: 1 }, 'ASKS', { content: 'bar' })
          .then(() => {
            expect(postModel.db.relate).toHaveBeenCalledWith(
              { id: 1 }, 'ASKS', { new: 'post' }, { at: 123456789 },
              jasmine.any(Function)
            );
            done();
          });
      });

      it('should return postNode on success', (done) => {
        postModel
          .createPost({ email: 'user' }, 'ASKS', { foo: 'bar' })
          .done((postNode) => {
            expect(postNode).toEqual({ new: 'post' });
            expect(postModel.db.save).toHaveBeenCalled();
            expect(postModel.db.save.calls.count()).toEqual(2);
            expect(postModel.db.relate.calls.count()).toEqual(1);
            expect(postModel.db.query.calls.count()).toEqual(1);
            expect(postModel.db.encodeEdgeID).toHaveBeenCalled();
            done();
          });
      });
    });
  });

  describe('Comments', () => {
    describe('getComments method', () => {
      beforeEach(() => {
        spyOn(postModel.db, 'query').and.callFake((query, data, callback) => {
          callback(null, data);
        });
      });

      it('should query the post comments from the database', (done) => {
        var seq = postModel.getComments('helloworld', 'foo');

        seq
          .error(e => console.error(e))
          .done(() => {
            expect(postModel.db.query).toHaveBeenCalledWith(
              jasmine.any(String), { postID: 'helloworld', userID: 'foo' }, jasmine.any(Function)
            );
            done();
          });
      });
    });

    describe('createComment method', () => {
      var mockEdge;
      var mockPostRow;

      beforeEach(() => {
        mockPostRow = {
          post: {
            id: 1,
            postID: 'someposthash',
          },
        };

        mockEdge = {
          id: 99,
          start: 1,
          end: 2,
          commentID: 'someposthash',
          properties: {
            at: 123456,
            content: 'I think this is interesting',
          },
        };

        spyOn(Date, 'now').and.returnValue(123456);

        spyOn(postModel.db, 'relate').and.callFake((user, label, post, data, callback) => {
          callback(null, mockEdge);
        });
        spyOn(postModel.db, 'getOne').and.callFake(() => new Sequence((accept) => {
          accept(mockPostRow);
        }));
        // key and value are optional, hence the ternary operator. see https://github.com/brikteknologier/seraph#rel.update
        spyOn(postModel.db.rel, 'update').and.callFake((edge, key, value, callback) => (callback ? callback(false) : key(false)));
      });

      it('should add a relationship between a user and a post', (done) => {
        let commentText = 'I think this is interesting';
        var user = { username: 'test User' };

        postModel
          .createComment(user, commentText, 'someposthash')
          .done(commentEdge => {
            expect(commentEdge.content).toEqual(commentText);
            expect(commentEdge.at).toEqual(123456);
            expect(Date.now).toHaveBeenCalled();
            expect(postModel.db.relate).toHaveBeenCalledWith(
              user,
              'COMMENTS',
              mockPostRow.post,
              { content: commentText, at: 123456 },
              jasmine.any(Function)
            );
            done();
          }).error(err => {
            expect(err).toBeUndefined();
            done();
          });
      });
    });
  });

  describe('Report post', () => {

    it('reportPost should call through the database with the postID', (done) => {
      spyOn(postModel.db, 'query').and.callFake((data, params, callback) => {
        callback(null, []);
      });

      postModel
        .reportPost('somePostId', 'someUserId')
        .done(() => {
          expect(postModel.db.query).toHaveBeenCalled();
          done();
        });
    });

    it('reportPost should throw an error if the database call fails with the given postID', (done) => {
      spyOn(postModel.db, 'query').and.callFake((data, params, callback) => {
        callback(true, []);
      });

      postModel
        .reportPost('somePostId')
        .error((e) => {
          expect(e).toBeDefined();
          expect(postModel.db.query).toHaveBeenCalled();
          done();
        });
    });


  });

  describe('Delete post', () => {

    it('postBelongsToUser should not throw an error if the post belongs to the user', (done) => {
      // params is optional, hence the ternary operator. see https://github.com/brikteknologier/seraph#query
      spyOn(postModel.db, 'query').and.callFake((data, params, callback) =>
        (callback ? callback(null, [{ postID: params.postID }]) : params(null, []))
      );
      postModel
        .postBelongsToUser('someUserId', 'somePostId')
        .done(() => {
          expect(postModel.db.query).toHaveBeenCalled();
          done();
        }).error(err => {
          expect(err).toBeUndefined();
          done();
        });
    });

    it('postBelongsToUser should throw an error if the post does not belong to the user', (done) => {
      // params is optional, hence the ternary operator. see https://github.com/brikteknologier/seraph#query
      spyOn(postModel.db, 'query').and.callFake((data, params, callback) =>
        (callback ? callback(true, []) : params(true, []))
      );
      postModel
        .postBelongsToUser('someUserId', 'somePostId')
        .done(() => {
          expect(true).toBeUndefined();
          done();
        }).error((e) => {
          expect(e).toBeDefined();
          expect(postModel.db.query).toHaveBeenCalled();
          done();
        });
    });

    it('deletePost should call through the database with the postID', (done) => {
      // params is optional, hence the ternary operator. see https://github.com/brikteknologier/seraph#query
      spyOn(postModel.db, 'query').and.callFake((data, params, callback) =>
        (callback ? callback(null, []) : params(null, []))
      );
      postModel
        .deletePost('somePostId')
        .done(() => {
          expect(postModel.db.query).toHaveBeenCalled();
          done();
        }).error(err => {
          expect(err).toBeUndefined();
          done();
        });
    });

    it('deletePost should throw an error if the database call fails with the given postID', (done) => {
      // params is optional, hence the ternary operator. see https://github.com/brikteknologier/seraph#query
      spyOn(postModel.db, 'query').and.callFake((data, params, callback) =>
        (callback ? callback(true, []) : params(true, []))
      );
      postModel
        .deletePost('somePostId')
        .error((e) => {
          expect(e).toBeDefined();
          expect(postModel.db.query).toHaveBeenCalled();
          done();
        });
    });

  });
});
