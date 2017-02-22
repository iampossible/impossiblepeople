'use strict';

const userActivityModel = require('models/UserActivityModel');
const Controller = require('core/Controller');

class UserActivityController extends Controller {

  constructor() {
    super();

    this.route('getActivity', {
      method: 'GET',
      path: '/api/user/activity',
      auth: 'session',
      handler: this.getActivity,
    });
    
    this.route('getActivityCount', {
      method: 'GET',
      path: '/api/user/activity/count',
      auth: 'session',
      handler: this.getActivityCount,
    });

    this.route('setActivityAsSeen', {
      method: 'POST',
      path: '/api/user/activity/seen',
      auth: 'session',
      handler: this.setActivityAsSeen,
    });

    this.route('setActivityAsRead', {
      method: 'POST',
      path: '/api/user/activity/read',
      auth: 'session',
      handler: this.setActivityAsRead,
    });

  }

  setActivityAsRead(request, reply) {
    var done = () => reply('ok').code(200)
    let activityID = request.payload.activityID;
    
    userActivityModel
      .setAsRead(activityID)
      .done(done).error(done);
  }

  setActivityAsSeen(request, reply) {
    var done = () => reply('ok').code(200)

    userActivityModel
      .setAsSeen(request.auth.credentials.userID)
      .done(done).error(done);
  }

  getActivity(request, reply) {
    userActivityModel
      .getUserActivities(request.auth.credentials.userID)
      .done((activities) => reply({ activities }).code(200))
      .error((e) => {
        console.error('Error on UserActivityController.getActivity() ', e)
      });
  }

  getActivityCount(request, reply) {

    userActivityModel
      .getUserActivityCount(request.auth.credentials.userID)
      .done((result) => reply(result).code(200))
      .error((e) => {
        console.error('Error on UserActivityController.getActivityCount() ', e)
      });
  }
}

module.exports = new UserActivityController();
