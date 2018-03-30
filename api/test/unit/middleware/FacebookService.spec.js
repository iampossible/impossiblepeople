'use strict';

const Config = require('config/server');

const facebookService = require('middleware/FacebookService');

const nockStubs = require('../../NockStubs');

describe('Facebook Service', () => {
  describe('getUserDetails method', () => {
    it('should retrieve the user name, email and biography', (done) => {
      let scope = nockStubs.userDetailsScope(200,
        {
          about: 'Hi I\'m Steve',
          email: 'steve@austin.stonecold',
          first_name: 'Steve',
          id: 456789,
          last_name: 'Austin',
          friends: { data: [{ id: 123456 }] },
          picture: { data: { url: 'somePictureUrl' } },
        }
      );

      facebookService.getUserDetails('someUserID').done((data) => {
        expect(data.user.email).toBe('steve@austin.stonecold');
        expect(data.user.biography).toBe('Hi I\'m Steve');
        expect(data.user.firstName).toBe('Steve');
        expect(data.user.lastName).toBe('Austin');
        expect(data.user.imageSource).toBe('https://graph.facebook.com/456789/picture?type=large');
        expect(data.friends[0]).toEqual({ id: 123456 });
        scope.done();
        done();
      });
    });

    it('should reject if there is an error', (done) => {
      let scope = nockStubs.userDetailsErrorScope({ msg: 'went wrong' });

      facebookService.getUserDetails('someUserID').error((err) => {
        expect(err.msg).toEqual('went wrong');
        scope.done();
        done();
      });
    });
  });

  describe('verifyToken method', () => {
    it('should accept the supplied token if valid', (done) => {
      let responseData = {
        data: { app_id: Config.facebook.appID, is_valid: true, user_id: 'someUserID' },
      };
      let scope = nockStubs.debugTokenScope(200, responseData);

      facebookService.verifyToken('thisIsAToken').done((data) => {
        expect(data).toEqual(responseData.data);
        scope.done();
        done();
      });
    });

    it('should reject the supplied token if invalid', (done) => {
      let responseData = {
        data: { error: { code: 123, message: 'hello' }, is_valid: false },
      };
      let scope = nockStubs.debugTokenScope(200, responseData);

      facebookService.verifyToken('thisIsAToken').error((data) => {
        expect(data).toEqual(responseData.data);
        scope.done();
        done();
      });
    });

    it('should reject the supplied token if error', (done) => {
      let scope = nockStubs.debugTokenScope(404, {});

      facebookService.verifyToken('thisIsAToken').error(() => {
        scope.done();
        done();
      });
    });
  });
});
