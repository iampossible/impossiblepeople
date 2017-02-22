'use strict';

const Joi = require('joi');
const moment = require('core/AppMoment');

const profileModel = require('models/ProfileModel');
const userModel = require('models/UserModel');


const PushNotificationService = require('middleware/PushNotificationService');
const passwordHelper = require('middleware/PasswordHelper');
const cookieHelper = require('middleware/CookieHelper');
const loginThrottler = require('middleware/LoginThrottler');
const EmailService = require('middleware/EmailService');
const Controller = require('core/Controller');
const config = require('config/server');


/* @private */
const validateAuthCookie = (request, session, callback) => {
  userModel
    .getAuthUser({ sid: session.sid })
    .done(user => {
      cookieHelper.refreshCookie(request, session.sid);
      callback(null, true, user);
    })
    .error(() => {
      callback(null, false);
    });
};

class AuthController extends Controller {

  constructor() {
    super();
    this.loginThrottler = loginThrottler;

    this.plugin('hapi-auth-cookie', (err, server) => {
      server.auth.strategy('session', 'cookie', true, {
        password: config.salt,
        cookie: 'sid',
        isSecure: false,
        validateFunc: validateAuthCookie,
      });
    });

    this.route('login', {
      method: 'POST',
      path: '/api/auth/login',
      auth: { mode: 'try' },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false,
        },
      },
      handler: this.login.bind(this),
      validate: {
        email: Joi.string().required().lowercase(),
        password: Joi.string().required(),
      },
    });

    this.route('logout', {
      method: 'GET',
      path: '/api/auth/logout',
      auth: 'session',
      handler: this.logout,
    });

    this.route('recover', {
      method: 'POST',
      path: '/api/auth/recover',
      handler: this.recover,
      validate: {
        email: Joi.string().required().lowercase(),
      },
    });

    this.route('createUser', {
      method: 'POST',
      path: '/api/user/create',
      handler: this.createUser,
      validate: {
        email: Joi.string().email().lowercase(),
        firstName: Joi.string().required(),
        password: Joi.string().required(),
        lastName: Joi.string().required(),
      },
    });

    this.route('inviteUser', {
      method: 'POST',
      path: '/api/user/invite',
      auth: 'session',
      handler: this.inviteUsers,
      validate: {
        // TODO: request.js does not allow raw json on post data
        // emails: Joi.array().items(Joi.string().email().trim()).required(),
        emails: Joi.string().required(),
      },
    });
  }

  logout(request, reply) {
    return cookieHelper.deleteCookie(request, request.auth.credentials).then(() => {
      PushNotificationService.unregister(request.auth.credentials);
      reply({}).code(200);
    });
  }

  validateUser(email, password) {
    return userModel
      .getAuthUser({ email })
      .then((accept, reject, authUser) => {
        if (authUser.fromFacebook && !authUser.password) {
          reject('facebook user');
        } else {
          passwordHelper.validatePassword(password, authUser.password).done((validPassword) => {
            // TODO why is this necessary?
            accept(Object.assign(authUser, { validPassword }));
          }).error(reject);
        }
      });
  }

  login(request, reply) {
    function errorReply() {
      return reply({ msg: 'invalid credentials' }).code(401);
    }

    let email = request.payload.email;
    let password = request.payload.password;
    let penalty = loginThrottler(email);

    setTimeout(() => {
      userModel.getUserByEmail(email).done((user) => {
        if (!user) {
          errorReply('could not find user');
        } else { // TRY TO LOGIN USER
          this.validateUser(email, password).done((user) => {
            if (!user.validPassword) {
              return errorReply();
            }

            return cookieHelper.setCookie(request, user).then(() => {
              delete user.id;
              delete user.sid;
              delete user.password;
              reply(user).code(200);
            });
          }).error(errorReply);
        }
      }).error(errorReply);
    }, penalty);
  }

  recover(request, reply) {
    let email = request.payload.email;

    userModel
      .getAuthUser({ email })
      .then((accept, reject, authUser) => {
        if (authUser.fromFacebook && !authUser.password) {
          reply({ msg: 'Facebook users cannot recover passwords through this service' }).code(422);
        } else {
          let newPassword = passwordHelper.generatePassword();
          userModel.updateUserPassword(authUser, newPassword).then(() => {
            EmailService.sendRecoverPasswordEmail(authUser, newPassword);
            reply().code(200);
          });
        }
      })
      .error((msg) => {
        if (msg == 'user not found') {
          reply({ msg }).code(404);
        } else {
          reply({ msg }.code(500));
        }
      });
  }

  createUser(request, reply) {
    userModel
      .createUser(request.payload)
      .done((finalUser) => {
        cookieHelper.setCookie(request, finalUser).then((accept) => {
          EmailService.sendWelcomeEmail(finalUser);
          accept(finalUser);
        }).done((finalUser) => {
          delete finalUser.id;
          delete finalUser.sid;
          delete finalUser.password;
          reply(finalUser).code(200);
        }).error(e => {
          reply({ msg: e }).code(500);
        });
      })
      .error((e) => {
        if (e.msg === 'user already exists') {
          reply({ msg: e }).code(400);
        } else {
          reply({ msg: e }).code(500);
        }
      });
  }

  inviteUsers(request, reply) {
    let Emails;
    try {
      Emails = JSON.parse(request.payload.emails).filter(email => email !== request.auth.credentials.email);
    } catch (err) {
      return reply().code(400);
    }


    return Promise
      .all(Emails.map(email => new Promise((accept, reject) => {
        userModel
          .getUser({ email })
          .done((user) => {
            if (user) {
              // existing and actual user
              profileModel.followProfile(request.auth.credentials.userID, user.userID).done(accept).error(reject);
            } else {
              userModel
                .createInvite(request.auth.credentials, email)
                .done((newInvitee) => {
                  EmailService.sendInviteEmail(request.auth.credentials, newInvitee.email);
                  accept();
                })
                .error(reject);
            }
          })
          .error(reject);
      })))
      .then(() => reply().code(201))
      .catch(e => reply({ msg: e }).code(400));
  }
}

module.exports = new AuthController();
