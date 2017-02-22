/* globals jasmine, describe, expect, it, beforeEach, afterEach */
'use strict';

let userModel = require('models/UserModel');
let Sequence = require('impossible-promise');

describe('User model', () => {
  beforeEach(() => {
    // reset userModel object and all spies
    userModel = new userModel.constructor();
  });

  describe('getUserByEmail method', () => {
    beforeEach(() => {
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => {
        if (data.email === 'foo@bar.com') {
          callback(null, [{ foo: 'bar' }, { hello: 'world' }]);
        } else {
          callback(null, []);
        }
      });
    });

    it('should query the database with a callback', (done) => {
      userModel.getUserByEmail('foo@bar.com').then(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { email: 'foo@bar.com', fromFacebook: null, sid: null, userID: null },
          jasmine.any(Function)
        );
        done();
      });
    });

    it('should call the .error if rejected', (done) => {
      userModel.getUserByEmail('not.foo@bar.com').then((accept, reject) => {
        reject('user is null');
      }).error((reason) => {
        expect(reason).toBeDefined();
        done();
      });
    });

    it('should call the callback with null if no user is found', (done) => {
      userModel.getUserByEmail('not.foo@bar.com').then((accept, reject, userNode) => {
        expect(userNode).toBeNull();
        done();
      });
    });

    it('should call the callback with the user if users are found', (done) => {
      userModel.getUserByEmail('foo@bar.com').then((accept, reject, userNode) => {
        expect(userNode).toEqual({ foo: 'bar' });
        done();
      });
    });
  });

  describe('getUserBySID method', () => {
    beforeEach(() => {
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => {
        if (data.sid === 'foobar') {
          callback(null, [{ foo: 'bar' }, { hello: 'world' }]);
        } else {
          callback(null, []);
        }
      });
    });


    it('should query the database with a callback', (done) => {
      userModel.getUserBySID('foobar').then(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { sid: 'foobar', email: null, fromFacebook: null, userID: null },
          jasmine.any(Function)
        );
        done();
      });
    });

    it('should call the .error if rejected', (done) => {
      userModel.getUserBySID('notfoobar').then((accept, reject) => {
        reject('user is null');
      }).error((e) => {
        expect(e).toEqual('user is null');
        done();
      });
    });

    it('should call the callback with null if no user is found', (done) => {
      userModel.getUserBySID('notfoobar').then((accept, reject, userNode) => {
        expect(userNode).toBeNull();
        done();
      });
    });

    it('should call the callback with the user if users are found', (done) => {
      userModel.getUserBySID('foobar').then((accept, reject, userNode) => {
        expect(userNode).toEqual({ foo: 'bar' });
        done();
      });
    });
  });

  describe('getUserByID method', () => {
    beforeEach(() => {
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => {
        if (data.userID === 'foobar') {
          callback(null, [{ foo: 'bar' }, { hello: 'world' }]);
        } else {
          callback(null, []);
        }
      });
    });


    it('should query the database with a callback', (done) => {
      userModel.getUserByID('foobar').then(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { sid: null, email: null, fromFacebook: null, userID: 'foobar' },
          jasmine.any(Function)
        );
        done();
      });
    });

    it('should call the .error if rejected', (done) => {
      userModel.getUserByID('notfoobar').then((accept, reject) => {
        reject('user is null');
      }).error((e) => {
        expect(e).toEqual('user is null');
        done();
      });
    });

    it('should call the callback with null if no user is found', (done) => {
      userModel.getUserByID('notfoobar').then((accept, reject, userNode) => {
        expect(userNode).toBeNull();
        done();
      });
    });

    it('should call the callback with the user if users are found', (done) => {
      userModel.getUserByID('foobar').then((accept, reject, userNode) => {
        expect(userNode).toEqual({ foo: 'bar' });
        done();
      });
    });
  });

  describe('createUser method', () => {
    var mockUser;
    var inviteeUser;

    beforeEach(() => {
      mockUser = { email: 'foo@bar.com', password: 'whocares' };
      inviteeUser = { email: 'some@bar.com', password: 'whocares', userID: 'HASH' };
    });

    it('should check whether the email exists', (done) => {
      spyOn(userModel.db, 'getOne').and.callFake(() => new Sequence((accept) => accept()));
      spyOn(userModel, 'getInvitee').and.callFake(() => new Sequence((accept) => accept(null)));

      userModel.createUser(mockUser).done(() => {
        expect(userModel.getInvitee).toHaveBeenCalledWith({ email: jasmine.any(String) });
        expect(userModel.db.getOne).toHaveBeenCalledWith(
          jasmine.any(String),
          { email: 'foo@bar.com', fromFacebook: null, sid: null, userID: null }
        );
        done();
      });
    });

    it('should reject if the user exists', (done) => {
      var user = { fake: 'user' };
      spyOn(userModel.db, 'getOne').and.callFake(() => new Sequence((accept) => accept(user)));
      spyOn(userModel, 'getInvitee').and.callFake(() => new Sequence((accept) => accept(null)));


      userModel.createUser(mockUser).error((e) => {
        expect(e).toEqual({ msg: 'user already exists', user: jasmine.any(Object) });
        expect(userModel.getInvitee).not.toHaveBeenCalled();
        done();
      });
    });

    // TODO weird pollution from the above test?!
    it('should create a new user if the user does not exist and is not an invitee', (done) => {
      spyOn(userModel.db, 'getOne').and.callFake(() => new Sequence((accept) => accept(null)));
      spyOn(userModel, 'getInvitee').and.callFake(() => new Sequence((accept) => accept(null)));
      spyOn(userModel.db, 'save').and.callFake((userNode, label, key, value, callback) => (callback || key || label)(null, userNode));

      userModel.createUser(mockUser).done(() => {
        expect(userModel.getInvitee).toHaveBeenCalledWith({ email: jasmine.any(String) });
        expect(userModel.db.save).toHaveBeenCalledWith(
          mockUser,
          'Person',
          jasmine.any(Function)
        );
        done();
      }).error(err => {
        expect(err).toBeUndefined();
        done();
      });
    });

    it('should create a new user if the invitee exists and the user does not exist', (done) => {
      spyOn(userModel.db, 'getOne').and.callFake(() => new Sequence((accept) => accept(null)));
      spyOn(userModel, 'updateUser').and.callFake(() => new Sequence((accept) => accept(inviteeUser)));
      spyOn(userModel, 'getInvitee').and.callFake(() => new Sequence((accept) => accept(inviteeUser)));

      userModel.createUser(inviteeUser).done(() => {
        expect(userModel.getInvitee).toHaveBeenCalledWith({ email: jasmine.any(String) });
        expect(userModel.updateUser).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object));
        done();
      })
    });
  });

  describe('updateInterests method', () => {

    it('should get the current interests', (done) => {
      spyOn(userModel, 'getInterests').and.callFake((user) => {
        expect(user).toEqual({ foo: 'bar' });
        done();
        return new Sequence();
      });
      userModel.updateInterests({ foo: 'bar' }, []);
    });
  });

  describe('getInterests method', () => {
    var mockUser;

    beforeEach(() => {
      mockUser = { email: 'foo@bar.com', password: 'whocares' };
    });

    it('should get the user\'s interests', (done) => {
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) =>
        (callback ? callback(null, []) : data(null, []))
      );

      userModel.getInterests(mockUser).done(() => {
        expect(userModel.db.query)
          .toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object), jasmine.any(Function));
        done();
      }).error(err => {
        expect(err).toBeUndefined();
        done();
      });
    });
  });

  describe('addInterests method', () => {
    var mockUser;

    beforeEach(() => {
      mockUser = { email: 'foo@bar.com', password: 'whocares' };
    });

    it('should relate the interests to the user', (done) => {
      var mockInterest = { name: 'Art & Leisure', featured: true };
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => {
        callback(null);
      });

      userModel.addInterests(mockUser, [mockInterest]).done(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { uID: undefined, iID: undefined },
          jasmine.any(Function)
        );
        done();
      });
    });
  });

  describe('getUserPosts method', () => {
    let mockUser = {};

    beforeEach(() => {
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => callback(null, {}));
    });

    it('should retrieve a user\'s posts', (done) => {
      userModel.getUserPosts(123).done(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { userID: 123 },
          jasmine.any(Function)
        );
        done();
      });
    });
  });

  describe('updateUser method', () => {
    beforeEach(() => {
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => callback(null, {}));
    });

    it('should update a user', (done) => {
      userModel.updateUser(123, {}).done(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { userID: 123, data: {} },
          jasmine.any(Function)
        );
        done();
      });
    });
  });

  describe('getUserFriends method', () => {
    beforeEach(() => {
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => callback(null, {}));
    });

    it('should retrieve a user\'s friends', (done) => {
      userModel.getUserFriends('myUserID').done(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { userID: 'myUserID' },
          jasmine.any(Function)
        );
        done();
      });
    });
  });

  describe('addFacebookFriends method', () => {
    var mockUser;

    beforeEach(() => {
      mockUser = { userID: 456789 };
    });

    it('should add friend relationships to the user', (done) => {
      var mockFriend = { id: 123456 };
      spyOn(userModel.db, 'query').and.callFake((query, data, callback) => {
        callback(null);
      });

      userModel.addFacebookFriends(mockUser, [mockFriend]).done(() => {
        expect(userModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String),
          { thisUserID: mockUser.userID, friendFacebookID: mockFriend.id },
          jasmine.any(Function)
        );
        done();
      });
    });
  });

  describe('getAuthUser', () => {
    it('should reject if no user is found', () => {
      let getUserSequence = new Sequence((accept, reject) => {
        accept(null);
      });

      spyOn(userModel, 'getUser').and.returnValue(getUserSequence);

      userModel.getAuthUser({ sid: '000' }).error((error) => {
        expect(error).toBe('user not found');
      });
    });
  });
});
