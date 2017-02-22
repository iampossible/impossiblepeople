'use strict';

let profileModel = require('models/ProfileModel');
let Sequence = require('impossible-promise');

describe('Profile model', () => {

  beforeAll(() => {
    profileModel = new profileModel.constructor();
  });

  describe('getProfile method', () => {
    it('should return user data of supplied user', (done) => {
      // params is optional, hence the ternary operator. see https://github.com/brikteknologier/seraph#query
      spyOn(profileModel.db, 'query').and.callFake((query, params, callback) =>
        (callback ? callback(null, [{}]) : params(null, [{}]))
      );

      let id = '123';

      profileModel
        .getProfile(id, 456)
        .then((data) => {
          expect(data).toBeDefined();
          expect(profileModel.db.query).toHaveBeenCalledWith(
            jasmine.any(String),
            { userID: id, currentUserID: 456 },
            jasmine.any(Function)
          );
          done();
        }).error(err => {
          expect(err).toBeUndefined();
          done();
        });
    });

    it('should reject if query fails', (done) => {
      spyOn(profileModel.db, 'query').and.callFake((query, data, callback) => callback('error'));

      profileModel
        .getProfile('123', 456)
        .error((e) => {
          expect(e).toBe('error');
          done();
        });
    });
  });


  describe('updateFollowing method', () => {
    it('should reject if query fails', (done) => {
      spyOn(profileModel.db, 'query').and.callFake((query, data, callback) => callback('error'));

      profileModel
        ._updateFollowing('123', 456, 'query', 'other-error')
        .error((e) => {
          expect(e).toBe('error');
          done();
        });
    });
  });

  describe('connectProfiles method', () => {
    beforeEach(() => {
      spyOn(profileModel, '_updateFollowing').and.callFake((followerID, followeeID, query, errMsg) => {
        return new Sequence();
      });
    });

    it('should return an empty sequence if a users tries to "connect with" themselves', (done) => {
      profileModel.connectProfiles('hello', 'hello').done(() => {
        expect(profileModel._updateFollowing).not.toHaveBeenCalled();
        done();
      });
    });

    it('should update the database when a user connects with another', (done) => {
      profileModel.connectProfiles('hello', 'world').done(() => {
        expect(profileModel._updateFollowing).toHaveBeenCalledWith('hello', 'world', jasmine.any(String), 'user not found');
        done();
      });
    });
  });
});
