'use strict';

const Joi = require('joi');

const Controller = require('core/Controller');
const interestModel = require('models/InterestModel');


class InterestController extends Controller {

  constructor() {
    super();

    this.route('getInterests', {
      method: 'GET',
      path: '/api/interest',
      auth: 'session',
      handler: this.getInterestHandler,
      validateQuery: {
        featured: Joi.boolean().optional(),
      },
    });

    this.route('suggestInterest', {
      method: 'POST',
      path: '/api/interest/suggestion',
      auth: 'session',
      handler: this.suggestInterest,
      validate: {
        suggestion: Joi.string().trim().required(),
      },
    });
  }


  suggestInterest(request, reply) {
    interestModel
      .createSuggestion(request.auth.credentials, request.payload.suggestion)
      .done((interestNode) => {
        reply({
          name: interestNode.name,
          interestID: interestNode.interestID,
          featured: interestNode.featured,
          suggested: interestNode.suggested,
        }).code(interestNode.isNew ? 201 : 200);
      })
      .error((err) => reply({ message: err.toString() }).code(400));
  }

  getInterestHandler(request, reply) {
    interestModel
      .getInterests(!!request.query.featured)
      .done((data) => {
        reply(data.map((interest) => {
          delete interest.id;
          return interest;
        })).code(200);
      })
      .error((err) => reply({ message: err.toString() }).code(500));
  }
}

module.exports = new InterestController();
