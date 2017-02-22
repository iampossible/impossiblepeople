/* globals jasmine, describe, expect, it, beforeEach, afterEach */
'use strict';

let userActivityModel = require('models/UserActivityModel');

describe('User model', () => {
  beforeEach(() => {
    // reset userModel object and all spies
    userActivityModel = new userActivityModel.constructor();
  });

  describe('getCommentActivities method', () => {
    let mockUser = {};

    beforeEach(() => {
      spyOn(userActivityModel.db, 'query').and.callFake((query, data, callback) => (callback || data)(null, []));
    });

    it('should retrieve a user\'s activity log', (done) => {
      userActivityModel.getUserActivities(mockUser).done(() => {
        expect(userActivityModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.any(Object),
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
