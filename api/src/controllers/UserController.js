'use strict';

const Joi = require('joi');
const moment = require('core/AppMoment');

const userModel = require('models/UserModel');
const Controller = require('core/Controller');
const cookieHelper = require('middleware/CookieHelper');
const EmailService = require('middleware/EmailService');

class UserController extends Controller {

  constructor() {
    super();

    this.route('addInterest', {
      method: 'POST',
      path: '/api/user/interest',
      auth: 'session',
      handler: this.addUserInterests,
    });

    this.route('updateInterest', {
      method: 'PUT',
      path: '/api/user/interest',
      auth: 'session',
      handler: this.updateUserInterests,
    });

    this.route('getInterests', {
      method: 'GET',
      path: '/api/user/interest',
      auth: 'session',
      handler: this.getInterests,
    });

    this.route('getUser', {
      method: 'GET',
      path: '/api/user',
      auth: 'session',
      handler: this.getUser,
    });

    this.route('getPosts', {
      method: 'GET',
      path: '/api/user/post',
      auth: 'session',
      handler: this.getUserPosts,
    });

    this.route('updateUser', {
      method: 'POST',
      path: '/api/user',
      auth: 'session',
      handler: this.updateUser,
      validate: {
        biography: Joi.string().max(255),
        url: Joi.string().uri({ scheme: [/https?/], allowRelative: true }).allow(''),
        email: Joi.string().email(),
        firstName: Joi.string().trim().min(3).max(255),
        lastName: Joi.string().trim().min(3).max(255),
        latitude: Joi.number().min(-90).max(90),
        location: Joi.string(),
        longitude: Joi.number().min(-180).max(180),
      },
    });
  }

  getUser(request, reply) {
    var userID = request.auth.credentials.userID;
    userModel
      .getUserPosts(userID)
      .then((accept, reject) => userModel.getUserFriends(userID).done(accept).error(reject))
      .done((posts, friends) => {
        let user = request.auth.credentials;
        delete user.id;
        delete user.notificationEndpoint;
        reply(Object.assign(user, { posts, friends })).code(200);
      })
      .error((err) => reply({ msg: err }).code(400));
  }

  updateUser(request, reply) {
    let payload = request.payload;
    if (request.payload.url && !/^https?:\/\//.test(request.payload.url)) {
      payload.url = `http://${request.payload.url}`;
    }
    userModel
      .updateUser(request.auth.credentials.userID, payload)
      .then((accept, reject, user) => userModel.getUserPosts(user.userID).done(accept).error(reject))
      .then((accept) => {
        userModel.getInterests(request.auth.credentials).done(accept);
      })
      .done((user, posts, interests) => {
        delete user.id;
        reply(Object.assign(user, { posts, interests })).code(200);
      })
      .error(err => reply({ msg: err }).code(400));
  }

  addUserInterests(request, reply) {
    let newInterests;
    let parsed;
    try {
      parsed = typeof request.payload.interests === 'string' ? JSON.parse(request.payload.interests) : request.payload.interests;
    } catch (err) {
      reply().code(400);
      return;
    }
    let schema = Joi.array().items(Joi.string());
    let validated = Joi.validate(parsed, schema, { abortEarly: true });
    if (validated.error) {
      reply().code(400);
    } else {
      parsed = validated.value;
      newInterests = parsed.map(interestID => ({ interestID }));
      userModel
        .addInterests(request.auth.credentials, newInterests)
        .then((accept) => userModel.getInterests(request.auth.credentials).done(accept))
        .done((rel, interests) => {
          reply({
            userID: request.auth.credentials.userID,
            interests,
          }).code(200);
        })
        .error((err) => reply({ msg: err }).code(500));
    }
    return;
  }

  updateUserInterests(request, reply) {
    let newInterests;
    let parsed;
    try {
      parsed = typeof request.payload.interests === 'string' ? JSON.parse(request.payload.interests) : request.payload.interests;
    } catch (err) {
      reply().code(400);
      return;
    }
    let schema = Joi.array().items(Joi.string());
    let validated = Joi.validate(parsed, schema, { abortEarly: true });
    if (!validated.value || validated.error) {
      reply().code(400);
    } else {
      parsed = validated.value;
      newInterests = parsed.map(interestID => ({ interestID }));

      userModel
        .updateInterests(request.auth.credentials, newInterests)
        .then((accept) => userModel.getInterests(request.auth.credentials).done(accept))
        .done((rel, interests) => {
          reply({
            userID: request.auth.credentials.userID,
            interests: rel || interests, // TODO wtf is going on here?
          }).code(200);
        })
        .error((err) => reply({ msg: err }).code(500));
    }
    return;
  }

  getInterests(request, reply) {
    userModel
      .getInterests(request.auth.credentials)
      .done((interests) => {
        reply({
          userID: request.auth.credentials.userID,
          interests: interests.map((interest) => {
            delete interest.id;
            return interest;
          }),
        }).code(200);
      })
      .error((err) => reply({ msg: err }).code(500));
  }

  getUserPosts(request, reply) {
    userModel
      .getUserPosts(request.auth.credentials.userID)
      .done((postsResult) => {
        let posts = postsResult.map((postNode) => Object.assign(postNode, {
          createdAtSince: moment(postNode.createdAt).fromNow(),
          timeRequired: postNode.timeRequired || 0,
        }));
        reply({ posts, userID: request.auth.credentials.userID }).code(200);
      })
      .error((err) => reply({ msg: err }).code(400));
  }
}

module.exports = new UserController();
