/* globals jasmine, describe, expect, it, beforeEach, afterEach */
'use strict';

var feedModel = require('models/FeedModel');

describe('Feed Model', () => {
  describe('get method', () => {
    beforeEach(() => {
      // reset feedModel object and all spies
      feedModel = new feedModel.constructor();
    });

    it('should return all posts stored', (done) => {
      spyOn(feedModel.db, 'query').and.callFake((query, object, callback) => {
        callback(null, [{ foo: 'bar' }]);
      });
      feedModel.get().then(() => {
        expect(feedModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String), jasmine.any(Object), jasmine.any(Function)
        );
        done();
      });
    });

    it('should reject if query fails', (done) => {
      spyOn(feedModel.db, 'query').and.callFake((query, object, callback) => {
        callback('feed query failed');
      });
      feedModel.get().error((err) => {
        expect(err).toBe('feed query failed');
        done();
      });
    });
  });
});
