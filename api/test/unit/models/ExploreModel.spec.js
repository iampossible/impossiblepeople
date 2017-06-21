/* globals jasmine, describe, expect, it, beforeEach, afterEach */
'use strict';

var exploreModel = require('models/ExploreModel');

describe('Explore Model', () => {
  describe('get method', () => {
    beforeEach(() => {
      // reset exploreModel object and all spies
      exploreModel = new exploreModel.constructor();
    });

    it('should return all posts from interest stored', (done) => {
      spyOn(exploreModel.db, 'query').and.callFake((query, object, callback) => {
        callback(null, [{ foo: 'bar' }]);
      });
      exploreModel.get('Travel').then(() => {
        expect(exploreModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String), jasmine.any(Object), jasmine.any(Function) 
        );
        done();
      });
    });

    it('should reject if query fails', (done) => {
      spyOn(exploreModel.db, 'query').and.callFake((query, object, callback) => {
        callback('explore query failed');
      });
      exploreModel.get('12345').error((err) => {
        expect(err).toBe('explore query failed');
        done();
      });
    });
  });
});
