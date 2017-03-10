'use strict';

const moment = require('core/AppMoment');
const Controller = require('core/Controller');
const profileModel = require('models/ProfileModel');
const userModel = require('models/UserModel');
const QueueWorkers = require('middleware/QueueWorkers');

class ProfileController extends Controller {

  constructor() {
    super();

    this.route('getProfile', {
      method: 'GET',
      path: '/api/profile/{userID}',
      auth: 'session',
      handler: this.getProfile,
    });

    this.route('followProfile', {
      method: 'PUT',
      path: '/api/profile/{userID}/follow',
      auth: 'session',
      handler: this.followProfile,
    });

    this.route('unfollowProfile', {
      method: 'DELETE',
      path: '/api/profile/{userID}/follow',
      auth: 'session',
      handler: this.unfollowProfile,
    });

    this.route('reportProfile', {
      method: 'GET',
      path: '/api/profile/{userID}/report',
      auth: 'session',
      handler: this.reportProfile,
    });

    this.route('blockProfile', {
      method: 'GET',
      path: '/api/profile/{userID}/block',
      auth: 'session',
      handler: this.blockProfile,
    });

  }

  blockProfile(request, reply) {

    var userID = request.auth.credentials.userID;
    var blockedUserID = request.params.userID;

    if (userID === blockedUserID) {
      return reply({ msg: 'you can not block yourself!' }).code(400);
    }

    userModel
      .getUserByID(blockedUserID).then((accept, reject, blockedUser) => {
      if (!blockedUser) return reject('NOT_FOUND')
      accept(blockedUser)
    }).then((accept, reject, blockedUser) => {
      userModel.blockUser(userID, blockedUserID).done(accept).error(reject)
    }).done((blockedUser) => {
      QueueWorkers.activity('BLOCK_PROFILE_EVENT', { userID, blockedUserID });
      reply({ msg: 'user blocked!' }).code(200)
    }).error((e) => {
      if (e === 'NOT_FOUND') {
        return reply({ msg: 'user not found' }).code(404)
      }
      reply({ msg: e }).code(400)
    });
  }

  reportProfile(request, reply) {

    var userID = request.auth.credentials.userID;
    var reportedUserID = request.params.userID;

    if (userID === reportedUserID) {
      return reply({ msg: 'you can not report yourself!' }).code(400);
    }

    userModel
      .getUserByID(reportedUserID).then((accept, reject, reportedUser) => {
      if (!reportedUser) return reject('NOT_FOUND')
      accept(reportedUser)
    }).then((accept, reject, blockedUser) => {
      userModel.reportUser(userID, reportedUserID).done(accept).error(reject)
    }).done((reportedUser) => {
      QueueWorkers.activity('REPORT_PROFILE_EVENT', { userID, reportedUserID });
      reply({ msg: 'user reported!' }).code(200)
    }).error((e) => {
      if (e === 'NOT_FOUND') {
        return reply({ msg: 'user not found' }).code(404)
      }
      reply({ msg: e }).code(400)
    });
  }

  followProfile(request, reply) {
    var follower = request.auth.credentials.userID;
    var followee = request.params.userID;
    if (follower === followee) {
      return reply({ msg: 'users cannot follow themselves' }).code(400);
    }

    profileModel
      .followProfile(follower, followee)
      .done(() => reply().code(200))
      .error((msg) => {
        let code = (msg === 'user not found') ? 404 : 400;
        reply({ msg }).code(code);
      });
  }

  unfollowProfile(request, reply) {
    profileModel
      .unfollowProfile(request.auth.credentials.userID, request.params.userID)
      .done(() => reply().code(200))
      .error((msg) => {
        let code = (msg === 'user not found or not followed') ? 404 : 400;
        reply({ msg }).code(code);
      });
  }

  getProfile(request, reply) {
    let userID = request.params.userID;
    let loggedUserID = request.auth.credentials.userID;

    profileModel
      .getProfile(userID, request.auth.credentials.userID)
      .then((accept, reject, profile) => {
        if (!profile) return reply({ msg: 'user not found' }).code(404);
        accept(profile);
      }).then((accept, reject, profile) => {
        userModel.getBlockStatus(loggedUserID, userID).done(status => {
          if (status !== null) {
            return accept([])
          }
          userModel.getUserPosts(userID).done(postsResult => {
            let posts = postsResult.map((postNode) => Object.assign(postNode, {
              createdAtSince: moment(postNode.createdAt).fromNow(),
              timeRequired: postNode.timeRequired || 0,
            }));
            accept(posts);
          }).error(reject);
        })
      })
      .done((raw, profile, posts) => reply(Object.assign(profile.user, { posts })).code(200))
      .error((error) => reply({ msg: error }).code(400));
  }
}

module.exports = new ProfileController();
