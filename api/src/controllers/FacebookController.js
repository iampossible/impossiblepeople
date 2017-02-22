'use strict';

const Joi = require('joi');

const Controller = require('core/Controller');
const facebookService = require('middleware/FacebookService');
const userModel = require('models/UserModel');
const cookieHelper = require('middleware/CookieHelper');

class FacebookController extends Controller {

  constructor() {
    super();

    this.route('check', {
      method: 'GET',
      path: '/api/facebook/check',
      handler: this.checkHandler,
      validateQuery: {
        token: Joi.string().required(),
      },
    });

    this.route('link', {
      method: 'GET',
      path: '/api/facebook/link',
      auth: 'session',
      handler: this.linkHandler,
      validateQuery: {
        token: Joi.string().required(),
      },
    });
  }

  checkHandler(request, reply) {
    facebookService
      .verifyToken(request.query.token)
      .then((accept, reject, facebookData) => {
        facebookService.getUserDetails(facebookData.user_id).done(accept).error(reject);
      })
      .then((accept, reject, facebookData) => {
        var newUser = Object.assign(facebookData.user, { password: '' });
        userModel
          .createUser(newUser)
          .then((acc, rej, newUser) => {
            if (newUser) {
              userModel
                .addFacebookFriends(newUser, facebookData.friends)
                .done(() => {
                  cookieHelper.setCookie(request, newUser).then(() => {
                    delete newUser.id;
                    delete newUser.sid;
                    delete newUser.password;
                    reply(newUser).code(201);
                  });
                })
                .error(rej);
            }
          })
          .error((err) => {
            if (err.msg === 'user already exists' && err.user.fromFacebook) {
              userModel
                .getAuthUser({ fromFacebook: err.user.fromFacebook })
                .done(user => {
                  cookieHelper.setCookie(request, user).then(() => {
                    delete user.id;
                    delete user.sid;
                    delete user.password;
                    reply(user).code(200);
                  });
                })
                .error(() => {
                  reject('Could not match facebook user');
                });
            } else {
              reject('Not a Facebook user');
            }
          });
      })
      .error((err) => reply({ msg: err }).code(403));
  }

  linkHandler(request, reply) {
    facebookService
      .verifyToken(request.query.token)
      .then((accept, reject, facebookData) => {
        facebookService.getUserDetails(facebookData.user_id).done(accept).error(reject);
      })
      .then((accept, reject, facebookData) => {
        if (request.auth.credentials.fromFacebook === facebookData.user.fromFacebook) {
          accept(facebookData.friends);
        } else {
          userModel.getUser({ fromFacebook: facebookData.user.fromFacebook }).done(user => {
            if (user) return reject('account linked to another user');
            userModel
              .updateUser(request.auth.credentials.userID, { fromFacebook: facebookData.user.fromFacebook })
              .done(() => accept(facebookData.friends))
              .error(reject);
          }).error(reject);
        }
      })
      .then((accept, reject, friends) => {
        userModel.addFacebookFriends(request.auth.credentials, friends).done(accept).error(reject);
      })
      .done(() => reply().code(204))
      .error((msg) => {
        if (msg === 'account linked to another user') {
          reply({ msg }).code(422);
        } else {
          reply({ msg }).code(500);
        }
      });
  }
}

module.exports = new FacebookController();
