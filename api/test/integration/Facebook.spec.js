'use strict';

const request = require('request');
const Sequence = require('impossible-promise');

const Config = require('config/server');
const dataHelper = require('../DataHelper');
const gnomeApi = require('ImpossibleApi');
const helpers = require('../helpers');
const nockStubs = require('../NockStubs');
const userModel = require('models/UserModel');

describe('Facebook endpoints', () => {
  let tokenScope;

  beforeAll(() => {
    gnomeApi.start();
  });

  afterEach((done) => dataHelper.wipe().then(done));

  beforeEach((done) => {
    dataHelper.populate().then(() => {
      tokenScope = nockStubs.debugTokenScope(200, {
        data: {
          app_id: Config.facebook.appID,
          is_valid: true,
          user_id: 'someUserID',
        },
      });
      done();
    });
  });

  describe('/check endpoint', () => {
    let detailScope;

    it('should check for existing users in database', (done) => {
      let url = `http://${Config.endpoint}/api/facebook/check?token=thisIsAToken`;

      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'user@example.com',
          bio: 'I already exist',
        });

      request.get(url, (error, response) => {
        expect(response.statusCode).toBe(403);

        let body = JSON.parse(response.body);

        expect(body.msg.toLowerCase()).toBe('not a facebook user');

        tokenScope.done();
        detailScope.done();
        done();
      });
    });

    it('should check for existing facebook users in database', (done) => {
      let url = `http://${Config.endpoint}/api/facebook/check?token=thisIsAToken`;

      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'monster@chimney.sweep',
        });

      request.get(url, (error, response) => {
        expect(response.statusCode).toBe(200);

        let user = JSON.parse(response.body);
        expect(user.id).toBeUndefined();
        expect(user.sid).toBeUndefined();
        expect(user.password).toBeUndefined();
        expect(user.userID).toBeDefined();
        expect(user.firstName).toBe('Bill the');
        expect(user.lastName).toBe('Lizard');
        expect(user.fromFacebook).toBeTruthy();
        expect(user.interests.length).toBe(1);
        expect(user.interests[0].id).toBeUndefined();
        expect(response.headers['set-cookie']).toBeDefined();

        tokenScope.done();
        detailScope.done();
        done();
      });
    });

    it('should validate tokens for new users', (done) => {
      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'user@newerexample.com',
          id: 1234,
          first_name: 'New',
          last_name: 'User',
          bio: 'I am new',
          picture: { data: { url: 'somePictureUrl' } },
        });

      request.get(`http://${Config.endpoint}/api/facebook/check?token=thisIsAToken`, (error, response) => {
        expect(response.statusCode).toBe(201);

        let user = JSON.parse(response.body);
        expect(user.id).toBeUndefined();
        expect(user.sid).toBeUndefined();
        expect(user.password).toBeUndefined();
        expect(user.userID).toBeDefined();
        expect(user.firstName).toBe('New');
        expect(user.lastName).toBe('User');
        expect(user.imageSource).toBe('https://graph.facebook.com/1234/picture?type=large');
        expect(user.fromFacebook).toBeTruthy();
        expect(user.interests).toBeUndefined();
        expect(response.headers['set-cookie']).toBeDefined();

        tokenScope.done();
        detailScope.done();
        done();
      });
    });

    it('should check if facebook users are invitees', (done) => {
      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'invitee@impossible.com',
          id: 1234,
          first_name: 'Invitee',
          last_name: 'Manatee',
          bio: 'I am new',
          picture: { data: { url: 'somePictureUrl' } },
        });

      helpers.getInvitee('invitee@impossible.com', (err, result) => {
        let InviteeID = result.pop().userID;
        request.get(`http://${Config.endpoint}/api/facebook/check?token=thisIsAToken`, (error, response) => {
          expect(response.statusCode).toBe(201);

          let user = JSON.parse(response.body);
          expect(user.userID).toBe(InviteeID);
          expect(user.id).toBeUndefined();
          expect(user.sid).toBeUndefined();
          expect(user.password).toBeUndefined();
          expect(user.userID).toBeDefined();
          expect(user.firstName).toBe('Invitee');
          expect(user.lastName).toBe('Manatee');
          expect(user.imageSource).toBe('https://graph.facebook.com/1234/picture?type=large');
          expect(user.fromFacebook).toBeTruthy();
          expect(user.interests).toBeUndefined();
          expect(response.headers['set-cookie']).toBeDefined();

          tokenScope.done();
          detailScope.done();

          helpers.getInvitee('invitee@impossible.com', (e, res) => {
            expect(e).toBe(null);
            expect(res.length).toBe(0);
            done();
          });
        });
      });
    });

    it('should add friends to new users', (done) => {
      // TODO neater to log in as Facebook user and check friends in response?

      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'user@newestexample.com',
          id: 12334,
          first_name: 'New',
          last_name: 'User',
          bio: 'I am new',
          picture: { data: { url: 'somePictureUrl' } },
          friends: { data: [{ id: 123456789 }] },
        });

      spyOn(userModel, 'addFacebookFriends').and.callFake((newUser, friends) => {
        expect(friends).toEqual([{ id: 123456789 }]);

        return new Sequence((accept) => accept());
      });

      request.get(`http://${Config.endpoint}/api/facebook/check?token=thisIsAToken`, (error, response) => {
        expect(response.statusCode).toBe(201);

        tokenScope.done();
        detailScope.done();
        done();
      });
    });
  });

  describe('/link endpoint', () => {
    let detailScope;

    it('should add friends to non-Facebook users', (done) => {
      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'user@example.com',
          id: 1234,
          first_name: 'New',
          last_name: 'User',
          bio: 'I am new',
          picture: { data: { url: 'somePictureUrl' } },
          friends: { data: [{ id: 123456789 }] },
        });

      helpers.logInTestUser((err, authedRequest) => {
        authedRequest.get(`http://${Config.endpoint}/api/facebook/link?token=thisIsAToken`, (linkError, linkResponse) => {
          expect(linkError).toBe(null);
          expect(linkResponse.statusCode).toBe(204);

          authedRequest.get(`http://${Config.endpoint}/api/user`, (error, response) => {
            expect(error).toBe(null);
            let user = JSON.parse(response.body);
            let newFriends = user.friends.filter((friend) => friend.email === 'monster@chimney.sweep');

            expect(response.statusCode).toBe(200);
            expect(user.fromFacebook).toBe(1234);
            expect(newFriends.length).toBe(1);

            done();
          });

          tokenScope.done();
          detailScope.done();
        });
      });
    });

    it('should update friends for Facebook users', (done) => {
      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'user@example.com',
          id: 234567890,
          first_name: 'New',
          last_name: 'User',
          bio: 'I am new',
          picture: { data: { url: 'somePictureUrl' } },
          friends: { data: [{ id: 135792468 }, { id: 123456789 }] },
        });

      helpers.logIn('mock.turtle@soup.com', 'inb4facebook', (err, authedRequest) => {
        authedRequest.get(`http://${Config.endpoint}/api/facebook/link?token=thisIsAToken`, (linkError, linkResponse) => {
          expect(linkError).toBe(null);
          expect(linkResponse.statusCode).toBe(204);

          authedRequest.get(`http://${Config.endpoint}/api/user`, (error, response) => {
            expect(error).toBe(null);
            let user = JSON.parse(response.body);
            let newFriends = user.friends.filter((friend) => friend.email === 'monster@chimney.sweep');

            expect(response.statusCode).toBe(200);
            expect(user.friends.length).toBe(2);
            expect(newFriends.length).toBe(1);

            done();
          });

          tokenScope.done();
          detailScope.done();
        });
      });
    });

    it('should reject linking to an already-linked account', (done) => {
      detailScope = nockStubs.userDetailsScope(200,
        {
          email: 'user@example.com',
          id: 135792468,
          first_name: 'New',
          last_name: 'User',
          bio: 'I am new',
          picture: { data: { url: 'somePictureUrl' } },
          friends: { data: [{ id: 135792468 }, { id: 123456789 }] },
        });

      helpers.logIn('mock.turtle@soup.com', 'inb4facebook', (err, authedRequest) => {
        expect(err).toBe(null);
        authedRequest.get(`http://${Config.endpoint}/api/facebook/link?token=thisIsAToken`, (error, response) => {
          expect(error).toBe(null);
          expect(response.statusCode).toBe(422);

          tokenScope.done();
          detailScope.done();
          done();
        });
      });
    });
  });
});
