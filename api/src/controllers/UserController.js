"use strict";

const Joi = require("joi");
const moment = require("core/AppMoment");

const userModel = require("models/UserModel");
const Controller = require("core/Controller");
const cookieHelper = require("middleware/CookieHelper");
const EmailService = require("middleware/EmailService");

class UserController extends Controller {
  constructor() {
    super();

    this.route("addInterest", {
      method: "POST",
      path: "/api/user/interest",
      auth: "session",
      handler: this.addUserInterests
    });

    this.route("updateInterest", {
      method: "PUT",
      path: "/api/user/interest",
      auth: "session",
      handler: this.updateUserInterests
    });

    this.route("getInterests", {
      method: "GET",
      path: "/api/user/interest",
      auth: "session",
      handler: this.getInterests
    });

    this.route("getUser", {
      method: "GET",
      path: "/api/user",
      auth: "session",
      handler: this.getUser
    });

    this.route("getPosts", {
      method: "GET",
      path: "/api/user/post",
      auth: "session",
      handler: this.getUserPosts
    });

    this.route("updateUser", {
      method: "POST",
      path: "/api/user",
      auth: "session",
      handler: this.updateUser,
      validate: {
        biography: Joi.string().max(255),
        url: Joi.string()
          .uri({ scheme: [/https?/], allowRelative: true })
          .allow(""),
        email: Joi.string().email(),
        firstName: Joi.string()
          .trim()
          .min(2)
          .max(255),
        lastName: Joi.string()
          .trim()
          .min(2)
          .max(255),
        latitude: Joi.number()
          .min(-90)
          .max(90),
        location: Joi.string(),
        longitude: Joi.number()
          .min(-180)
          .max(180),
        organisationName: Joi.string(),
        description: Joi.string().allow("")
      }
    });

    //route to update user type
    this.route("updateUserType", {
      method: "PUT",
      path: "/api/user/userType",
      auth: "session",
      handler: this.updateUserType
    });
    //route to update the status of the Organisation
    this.route("updateOrganisationStatus", {
      method: "PUT",
      path: "/api/user/organisations",
      auth: "session",
      handler: this.updateOrganisationStatusHandler
    });

    //route to update the status of the Organisation
    this.route("getNotApprovedOrganisations", {
      method: "GET",
      path: "/api/user/organisations",
      auth: "session",
      handler: this.getNotApprovedOrgs
    });
  }

  getUser(request, reply) {
    var userID = request.auth.credentials.userID;
    userModel
      .getUserPosts(userID)
      .then((accept, reject) =>
        userModel
          .getUserFriends(userID)
          .done(accept)
          .error(reject)
      )
      .done((posts, friends) => {
        let user = request.auth.credentials;
        delete user.id;
        delete user.notificationEndpoint;
        reply(Object.assign(user, { posts, friends })).code(200);
      })
      .error(err => reply({ msg: err }).code(400));
  }

  getNotApprovedOrgs(request, reply) {
    userModel
      .getNotApprovedOrgs()
      .done(data => {
        reply(Object.assign({}, data)).code(200);
      })
      .error(err => reply({ msg: err }).code(400));
  }

  updateUser(request, reply) {
    let payload = request.payload;
    // if (request.payload.url && !/^https?:\/\//.test(request.payload.url)) {
    //   payload.url = `http://${request.payload.url}`;
    // }
    payload.url = payload.url.replace(
      /^(http[s]?:\/\/(www\.)?|\/\/(www\.)?|\/\/?|www\.){1}?/g,
      ""
    );
    userModel
      .updateUser(request.auth.credentials.userID, payload)
      .then((accept, reject, user) =>
        userModel
          .getUserPosts(user.userID)
          .done(accept)
          .error(reject)
      )
      .then(accept => {
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
      parsed =
        typeof request.payload.interests === "string"
          ? JSON.parse(request.payload.interests)
          : request.payload.interests;
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
        .then(accept =>
          userModel.getInterests(request.auth.credentials).done(accept)
        )
        .done((rel, interests) => {
          reply({
            userID: request.auth.credentials.userID,
            interests
          }).code(200);
        })
        .error(err => reply({ msg: err }).code(500));
    }
    return;
  }

  updateUserInterests(request, reply) {
    let newInterests;
    let parsed;
    try {
      parsed =
        typeof request.payload.interests === "string"
          ? JSON.parse(request.payload.interests)
          : request.payload.interests;
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
        .then(accept =>
          userModel.getInterests(request.auth.credentials).done(accept)
        )
        .done((rel, interests) => {
          reply({
            userID: request.auth.credentials.userID,
            interests: rel || interests // TODO wtf is going on here?
          }).code(200);
        })
        .error(err => reply({ msg: err }).code(500));
    }
    return;
  }

  getInterests(request, reply) {
    userModel
      .getInterests(request.auth.credentials)
      .done(interests => {
        reply({
          userID: request.auth.credentials.userID,
          interests: interests.map(interest => {
            delete interest.id;
            return interest;
          })
        }).code(200);
      })
      .error(err => reply({ msg: err }).code(500));
  }

  getUserPosts(request, reply) {
    userModel
      .getUserPosts(request.auth.credentials.userID)
      .done(postsResult => {
        let posts = postsResult.map(postNode =>
          Object.assign(postNode, {
            createdAtSince: moment(postNode.createdAt).fromNow(),
            timeRequired: postNode.timeRequired || 0
          })
        );
        reply({ posts, userID: request.auth.credentials.userID }).code(200);
      })
      .error(err => reply({ msg: err }).code(400));
  }

  //to update user type
  updateUserType(request, reply) {
    let userType = request.payload.userType;

    //the value of userType should only be one of the two
    let schema = Joi.string().valid(["volunteer", "organisation"]);
    let validated = Joi.validate(userType.toLowerCase(), schema, {
      abortEarly: true
    });
    if (!validated.value || validated.error) {
      reply().code(400);
    } else {
      userType = validated.value;
      userModel
        .updateUserType(request.auth.credentials, userType)
        .then(accept =>
          userModel.getUser(request.auth.credentials).done(accept)
        )
        .done((rel, user) => {
          reply({
            //just fo checking no need to be returned in production
            userID: request.auth.credentials.userID,
            userType: user.userType
          }).code(200);
        })
        .error(err => reply({ msg: err }).code(500));
    }
    return;
  }

  //to update organisation status
  updateOrganisationStatusHandler(request, reply) {
    let organisationsEmailList = request.payload.organisationsEmailList;
    userModel
      .updateOrganisationStatus(
        request.auth.credentials,
        organisationsEmailList
      )
      .done(data => {
        reply(data).code(200);
      })
      .error(err => reply({ msg: `error: ${err}` }).code(500));

    return;
  }
}

module.exports = new UserController();
