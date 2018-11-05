"use strict";

const Joi = require("joi");
const Controller = require("core/Controller");
const EmailService = require("middleware/EmailService");
const userModel = require("models/FeedModel");

class FeedbackController extends Controller {
  constructor() {
    super();

    this.route("feedback", {
      method: "POST",
      path: "/api/feedback",
      handler: this.feedbackHandler,
      validate: {
        fullName: Joi.string().required(),
        email: Joi.string().required(),
        subject: Joi.string().required(),
        body: Joi.string().required(),
        recaptchaChecked: Joi.boolean().required(),
        recaptchaResponse: Joi.string().required()
      }
    });
  }

  feedbackHandler(req, reply) {
    // recaptchaResponse is the key that browser will generate upon form submit.
    // if its blank or null means user has not selected the captcha, so return the error.
    if (
      req.payload.recaptchaResponse === undefined ||
      req.payload.recaptchaResponse === "" ||
      req.payload.recaptchaResponse === null
    ) {
      reply(true).code(400);
    }
    // Put your secret key here.
    var secretKey = "6LeaUVMUAAAAADpiGmyiEedYdpaxX22lGHxNO2Zc";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl =
      "https://www.google.com/recaptcha/api/siteverify?secret=" +
      secretKey +
      "&response=" +
      req.payload.recaptchaResponse +
      "&remoteip=" +
      req.connection.remoteAddress;

    userModel
      .googleRecaptchaCheckResponse(verificationUrl)
      .done(body => {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if ((body.success !== undefined && !body.success) || err) {
          reply({ msg: `error: ${err}` }).code(500);
        }
        EmailService.sendFeedbackEmail(req.payload);
        reply(true).code(200);
      })
      .error(err => reply({ msg: `error: ${err}` }).code(500));
  }
}

module.exports = new FeedbackController();
