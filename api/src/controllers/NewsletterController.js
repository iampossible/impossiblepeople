'use strict';

const Joi = require('joi');

const Controller = require('core/Controller');
const NewsletterModel = require('models/NewsletterModel');

class NewsletterController extends Controller {

  constructor() {
    super();

    this.route('unsubscribe', {
      method: 'GET',
      path: '/api/newsletter/unsubscribe',
      handler: NewsletterController.unsubscribeHandler,
      validateQuery: {
        code: Joi.string().required(),
      },
    });
  }

  static unsubscribeHandler(request, reply) {
    NewsletterModel
      .unsubscribe(request.query.code)
      .done(x => reply(x).code(200))
      .error(e => reply({ msg: e.msg || e }).code(e.code || 500));
  }
}

module.exports = new NewsletterController();
