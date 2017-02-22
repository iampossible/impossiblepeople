'use strict';

const request = require('request');
const gnomeApi = require('ImpossibleApi');
const Config = require('config/server');
const dataHelper = require('../DataHelper.js');
const Sequence = require('impossible-promise');

var EmailService = require('middleware/EmailService');
var passwordHelper = require('middleware/PasswordHelper');

const helpers = require('../helpers');

describe('Auth', () => {

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 9000;
    gnomeApi.start();
  });

  beforeEach((done) => {
    dataHelper.populate().then(done);
  });

  function post(formParams, expectations) {
    let url = `http://${Config.endpoint}/api/auth/login`;
    request.post(url, { time: true }, expectations).form(formParams);
  }

  describe('/api/auth/login endpoint', () => {
    it('should return 400 when users sends no credentials', (done) => {
      post({}, (error, response) => {
        expect(response.statusCode).toBe(400);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should return 400 when users sends an invalid object credentials', (done) => {
      post({ email: 'user@example.com', not: 'valid' }, (error, response) => {
        expect(response.statusCode).toBe(400);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should return 400 when users sends an empty email', (done) => {
      post({ email: null, password: 'somepassword' }, (error, response) => {
        expect(response.statusCode).toBe(400);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });


    it('should return 400 a facebook user trying to log in with an empty password', (done) => {
      post({ email: 'monster@chimney.sweep', password: '' }, (error, response) => {
        expect(response.statusCode).toBe(400);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should return 401 a facebook user trying to log in with a password', (done) => {
      post({ email: 'monster@chimney.sweep', password: 'whatever' }, (error, response) => {
        expect(response.statusCode).toBe(401);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should return OK for a user with a password and a Facebook ID', (done) => {
      post({ email: 'mock.turtle@soup.com', password: 'inb4facebook' }, (error, response) => {
        expect(response.statusCode).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
        done();
      });
    });

    it('should return 401 a user with a Facebook ID and the wrong password', (done) => {
      post({ email: 'mock.turtle@soup.com', password: 'notmypassword' }, (error, response) => {
        expect(response.statusCode).toBe(401);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should not break with special characters', (done) => {
      post({
        email: ';[]=-0\\/*987654321234567890\'-=+_)(*&^%$£@£$%^&*()_+!`~<>?<`//--',
        password: '"£%&%$£@%^$&*(&*""^%$£!§//??..,,.<\'>{}{[];@$%^&*()*&^%$£@$%^&*()*&^//--'
      }, (error, response) => {
        expect(response.statusCode).toBe(401);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should return 400 when users sends an empty password', (done) => {
      post({ email: 'user@example.com', password: null }, (error, response) => {
        expect(response.statusCode).toBe(400);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should return 401 when user sends invalid credentials', (done) => {
      post({ email: 'garbage@nonsense.com', password: 'lieslieslies' }, (error, response) => {
        expect(response.statusCode).toBe(401);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should return 401 when user sends invalid credentials', (done) => {
      post({ email: 'user@example.com', password: 'lieslieslies' }, (error, response) => {
        expect(response.statusCode).toBe(401);
        expect(response.headers['set-cookie']).toBeUndefined();
        done();
      });
    });

    it('should be case insensitive', (done) => {
      post({ email: 'uSer@eXamPle.com', password: 'somepassword' }, (error, response) => {
        expect(response.statusCode).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
        done();
      });
    });

    it('should reject a user with an invalid cookie ', (done) => {
      // Note: test will have to change if we implement allowing users to log in on multiple devices
      helpers.logInTestUser((err1, $request) => {
        helpers.logInTestUser(() => {
          $request.get(`http://${Config.endpoint}/api/feed`, (err, response) => {
            expect(response.statusCode).toBe(401);
            done();
          });
        });
      });
    });

    it('should return 200 when user sends valid credentials', (done) => {
      post({ email: 'user@example.com', password: 'somepassword' }, (error, response) => {
        expect(response.statusCode).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();

        let body = JSON.parse(response.body);

        expect(body.password).toBeUndefined();
        expect(body.sid).toBeUndefined();
        expect(body.id).toBeUndefined();
        expect(body.userID).toBeDefined();
        expect(body.interests).toBeDefined();
        expect(body.interests.length).toBe(2);
        expect(body.interests[0].id).toBeUndefined();
        expect(body.interests[0].interestID).toBeDefined();

        done();
      });
    });


    it('should set a TTL on cookie info', (done) => {

      helpers.logInTestUser((err, $request, jar) => {
        let url = `http://${Config.endpoint}/api/user`;
        $request.get(url, () => {

          let cookie = jar.getCookies(url).pop();
          let nowTime = new Date().getTime();
          let cookieTime = new Date(cookie.expires).getTime();
          let futureTime = nowTime + (Config.cookieTTL) + (999);

          expect(cookieTime).toBeLessThan(futureTime);
          expect(cookieTime).toBeGreaterThan(nowTime);
          done();
        });
      });
    });

    it('should renew extend the cookie TTL on every request', (done) => {

      helpers.logInTestUser((err, $request, jar) => {
        let url = `http://${Config.endpoint}/api/user`;
        $request.get(url, () => {
          expect(jar.getCookies(url).length).toBe(1);

          let firstCookie = jar.getCookies(url).pop();
          let firstCookieTime = new Date(firstCookie.expires).getTime();

          setTimeout(() => {
            $request.get(url, () => {
              expect(jar.getCookies(url).length).toBe(1);

              let secondCookie = jar.getCookies(url).pop();
              let secondCookieTime = new Date(secondCookie.expires).getTime();

              expect(firstCookieTime).toBeLessThan(secondCookieTime);
              done();
            });
          }, 1001);

        });
      });

    });
  });

  describe('/api/auth/logout endpoint', () => {
    it('should logout user', (done) => {
      helpers.logInTestUser((err, $request) => {
        expect(err).toBeNull();

        $request.get(`http://${Config.endpoint}/api/auth/logout`, (err0, response) => {
          expect(response.statusCode).toBe(200);
          expect(response.headers['set-cookie'].length).toBe(1);
          expect(response.headers['set-cookie'].pop()).toContain('sid=;');

          $request.get(`http://${Config.endpoint}/api/user`, (err1, inResponse) => {
            expect(inResponse.statusCode).toBe(401);
            done();
          });
        });
      });
    });
  });

  describe('/api/auth/recover endpoint', () => {
    const newPassword = 'helloworld';

    beforeEach(() => {
      spyOn(EmailService, 'sendRecoverPasswordEmail');
      spyOn(passwordHelper, 'generatePassword').and.returnValue(newPassword);
    });

    it('should generate a valid new password and email it to the user', (done) => {
      request.post(`http://${Config.endpoint}/api/auth/recover`, (err, response) => {
        expect(err).toBeNull();
        expect(response.statusCode).toBe(200);

        expect(EmailService.sendRecoverPasswordEmail).toHaveBeenCalledWith(jasmine.any(Object), newPassword);
        expect(passwordHelper.generatePassword).toHaveBeenCalledWith();

        post({ email: 'miaumiau@example.com', password: 'smiles' }, (error, response) => {
          expect(response.statusCode).toBe(401);
          post({ email: 'miaumiau@example.com', password: newPassword }, (error, response) => {
            expect(response.statusCode).toBe(200);
            done();
          });
        });
      }).form({ email: 'miaumiau@example.com' });
    });

    it('should return unprocessable if user is a facebook user', (done) => {
      request.post(`http://${Config.endpoint}/api/auth/recover`, (err, response) => {
        expect(response.statusCode).toBe(422);

        expect(EmailService.sendRecoverPasswordEmail).not.toHaveBeenCalled();
        done();
      }).form({ email: 'monster@chimney.sweep' });
    });

    it('should generate a new password if user has a Facebook ID and a password', (done) => {
      request.post(`http://${Config.endpoint}/api/auth/recover`, (err, response) => {
        expect(response.statusCode).toBe(200);

        expect(EmailService.sendRecoverPasswordEmail).toHaveBeenCalledWith(jasmine.any(Object), newPassword);
        expect(passwordHelper.generatePassword).toHaveBeenCalledWith();

        post({ email: 'mock.turtle@soup.com', password: 'inb4facebook' }, (error, response) => {
          expect(response.statusCode).toBe(401);
          post({ email: 'mock.turtle@soup.com', password: newPassword }, (err, resp) => {
            expect(resp.statusCode).toBe(200);

            done();
          });
        });
      }).form({ email: 'mock.turtle@soup.com' });
    });

    it('should return not found if user does not exist', (done) => {
      request.post(`http://${Config.endpoint}/api/auth/recover`, (err, response) => {
        expect(response.statusCode).toBe(404);
        expect(EmailService.sendRecoverPasswordEmail).not.toHaveBeenCalled();
        done();
      }).form({ email: 'made@up.email' });
    });

  });

  describe('/api/auth/login throttling', () => {
    let oldLimit;
    let oldPenalty;
    let oldTimeout;

    beforeAll(() => {
      oldLimit = Config.login.limit;
      oldPenalty = Config.login.penalty;
      oldTimeout = Config.login.timeout;
      Config.login.limit = 3;
      Config.login.penalty = 500;
      Config.login.timeout = 50000;
    });

    afterAll(() => {
      Config.login.limit = oldLimit;
      Config.login.penalty = oldPenalty;
      Config.login.timeout = oldTimeout;
    });

    let postPromise = () => {
      return new Promise((accept) => {
        post({ email: 'user@example.com', password: 'invalid' }, (err, response) => {
          accept(response.elapsedTime);
        });
      });
    };

    it('should slow down response times when x requests come in short period of time', (done) => {
      Promise.all([
        postPromise(),
        postPromise(),
        postPromise(),
      ])
        .then(() => {
          postPromise().then((elapsedTime) => {
            expect(elapsedTime).toBeGreaterThan(500);
            done();
          });
        });
    });
  });

  describe('/api/user/create endpoint', () => {
    let endpoint = `http://${Config.endpoint}/api/user/create`;
    var mockUser = {
      email: 'new@user.com',
      firstName: 'Bill',
      password: 'newpass',
      lastName: 'Lizard',
    };

    function createNewUser(user) {
      var newUser = Object.assign({
        email: mockUser.email,
        firstName: mockUser.firstName,
        password: mockUser.password,
        lastName: mockUser.lastName
      }, user || {});

      var jar = request.jar();
      var wrapper = request.defaults({ jar });

      return new Promise((accept) => {
        wrapper.post(endpoint, (err, response) => {
          expect(err).toBeNull();
          if (!err) {
            expect(response.statusCode).not.toBe(500);
          }
          accept({ err, request: wrapper, response });
        }).form(newUser);
      }).catch(e => console.log(e));
    }

    describe('creating new user', () => {
      beforeEach(() => {
        spyOn(EmailService, 'sendWelcomeEmail');
      });

      beforeAll((done) => {
        dataHelper.populate().then(done);
      });

      it('should return 400 if user exists', (done) => {
        let mockUser = {
          email: 'user@example.com',
          password: 'irrelevant',
          firstName: 'fn',
          lastName: 'ln'
        };

        createNewUser(mockUser).then((result) => {
          expect(result.response.statusCode).toBe(400);
          done();
        });
      });

      it('should return 400 on empty request', (done) => {
        let nullUser = {
          email: null,
          password: null,
          firstName: null,
          lastName: null
        };

        createNewUser(nullUser).then((result) => {
          expect(result.response.statusCode).toBe(400);
          done();
        });
      });

      it('should send a welcome email then return 200 and the user when a new user is created', (done) => {
        createNewUser().then((result) => {
          expect(result.err).toBeNull();
          expect(result.response.statusCode).toBe(200);

          expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(jasmine.any(Object));

          let body = JSON.parse(result.response.body);

          for (let attr of ['email', 'firstName', 'lastName']) {
            expect(body[attr]).toBe(mockUser[attr], `Mismatched attribute: ${attr}`);
          }
          expect(body.password).not.toEqual(mockUser.password);
          expect(body.userID).toBeDefined();
          expect(body.id).toBeUndefined();
          expect(body.migrated).toBeFalsy();

          done();
        });
      });

      it('should covert an invited user into a real user', (done) => {
        let mockUser = {
          email: 'invitee@impossible.com',
          firstName: 'Invitee',
          lastName: 'Manatee',
        };

        helpers.getInvitee(mockUser.email, (err, invitees) => {
          let InviteeID = invitees.pop().userID;

          createNewUser(mockUser).then((result) => {
            expect(result.err).toBeNull();
            expect(result.response.statusCode).toBe(200);

            expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(jasmine.any(Object));

            let body = JSON.parse(result.response.body);
            expect(body.userID).toBe(InviteeID);

            helpers.getInvitee(mockUser.email, (err, innerInvitees) => {
              expect(innerInvitees.length).toBe(0);
              done();
            });
          });
        });
      });
    });
  });


  describe('/api/user/invite', () => {
    const profileModel = require('models/ProfileModel');

    beforeEach(() => {
      spyOn(EmailService, 'sendInviteEmail');
      spyOn(profileModel, 'connectProfiles').and.callThrough();
    });

    it('should return 400 if emails array is malformed', (done) => {
      helpers.logInTestUser((err, request) => {
        request.post(`http://${Config.endpoint}/api/user/invite`, (err, resp) => {
          expect(resp.statusCode).toBe(400);
          done();
        }).form({ emails: '[' });
      });
    });

    it('should create, invite and connect for given new email', (done) => {
      var InviteeEmail = 'invitee@wonderland.com';
      helpers.getInvitee(InviteeEmail, (err, result) => {
        expect(result.length).toBe(0);

        helpers.logInMadHatter((err, request) => {
          request.post(`http://${Config.endpoint}/api/user/invite`, (errInner, response) => {
            expect(response.statusCode).toBe(201);

            expect(EmailService.sendInviteEmail).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
            expect(profileModel.connectProfiles).toHaveBeenCalled();

            helpers.getInvitee(InviteeEmail, (err, result) => {
              expect(result.length).toBe(1);
              done();
            });
          }).form({ emails: JSON.stringify([InviteeEmail]) });
        });
      });
    });

    it('should invite and connect for given email that has already been invited', (done) => {
      var InviteeEmail = 'invitee@impossible.com';

      helpers.getInvitee(InviteeEmail, (err, Invitees) => {
        let InviteeID = Invitees.pop().userID;

        helpers.logInMadHatter((err, request) => {
          request.post(`http://${Config.endpoint}/api/user/invite`, (errInner, response) => {
            expect(response.statusCode).toBe(201);

            expect(EmailService.sendInviteEmail).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
            expect(profileModel.connectProfiles).toHaveBeenCalled();

            helpers.getInvitee(InviteeEmail, (err, Invitees) => {
              expect(Invitees.length).toBe(1);
              let NewInviteeID = Invitees.pop().userID;
              expect(NewInviteeID).toBe(InviteeID);
              done();
            });
          }).form({ emails: JSON.stringify([InviteeEmail]) });
        });
      });
    });

    it('should follow and not invite for given email that is already an user', (done) => {
      var InviteeEmail = 'alice@wonderland.com';

      helpers.logInMadHatter((err, request) => {
        request.post(`http://${Config.endpoint}/api/user/invite`, (errInner, response) => {
          expect(response.statusCode).toBe(201);

          expect(EmailService.sendInviteEmail).not.toHaveBeenCalled();
          expect(profileModel.connectProfiles).not.toHaveBeenCalled();

          request.get(`http://${Config.endpoint}/api/user`, (errInner2, response) => {
            let Invitees = JSON.parse(response.body).friends.filter((friend) => friend.email === InviteeEmail)
            expect(Invitees.length).toBe(1);

            helpers.getInvitee(InviteeEmail, (err, result) => {
              expect(result.length).toBe(0);
              done();
            });
          });
        }).form({ emails: JSON.stringify([InviteeEmail]) });
      });
    });

    it('should ignore if inviting oneself', (done) => {
      var InviteeEmail = 'alice@wonderland.com';

      helpers.logInAlice((err, request) => {
        request.post(`http://${Config.endpoint}/api/user/invite`, (errInner, response) => {
          expect(response.statusCode).toBe(201);

          expect(EmailService.sendInviteEmail).not.toHaveBeenCalled();
          expect(profileModel.connectProfiles).not.toHaveBeenCalled();

          request.get(`http://${Config.endpoint}/api/user`, (errInner2, response) => {
            let Invitees = JSON.parse(response.body).friends.filter((friend) => friend.email === InviteeEmail)
            expect(Invitees.length).toBe(0);

            helpers.getInvitee(InviteeEmail, (err, result) => {
              expect(result.length).toBe(0);
              done();
            });
          });
        }).form({ emails: JSON.stringify([InviteeEmail]) });
      });
    });
  });
});
