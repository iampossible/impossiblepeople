'use strict';

const Joi = require('joi');
const Controller = require('core/Controller');

const PushNotificationService = require('middleware/PushNotificationService');

class PushNotificationController extends Controller {

  constructor() {
    super();

    this.route('register', {
      method: 'POST',
      path: '/api/notification/register',
      auth: 'session',
      handler: this.registerToken,
      validate: {
        deviceType: Joi.string(),
        deviceToken: Joi.string().required()
      },
    });
  }

  registerToken(request, reply) {
    PushNotificationService
      .register(request.auth.credentials.userID, request.payload.deviceToken, request.payload.deviceType)
      .done(() => reply().code(204))
      .error((msg) => reply({ msg }).code(500));
  }
}

module.exports = new PushNotificationController();
