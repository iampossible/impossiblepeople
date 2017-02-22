'use strict';

const Joi = require('joi');

const Controller = require('core/Controller');
const LocationModel = require('models/LocationModel');

class LocationController extends Controller {

  constructor() {
    super();

    this.route('postLocation', {
      method: 'POST',
      path: '/api/location',
      auth: 'session',
      handler: this.postLocationHandler,
      validate: {
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        accuracy: Joi.number(),
      },
    });
  }

  postLocationHandler(request, reply) {
    LocationModel
      .getFriendlyLocation([ request.payload.latitude, request.payload.longitude ])
      .done(LocationObj => reply(LocationObj).code(200))
      .error(e => reply({ msg: e }).code(400));
  }
}

module.exports = new LocationController();
