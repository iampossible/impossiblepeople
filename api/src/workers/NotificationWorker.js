"use strict";

const request = require("request");
const Config = require("config/server");
const Worker = require("core/Worker");
const postModel = require("models/PostModel");
const userModel = require("models/UserModel");
const userActivityModel = require("models/UserActivityModel");
const pushNotificationService = require("middleware/PushNotificationService");
const Nodemailer = require("nodemailer");
var ses = require("nodemailer-ses-transport");

const AWS = require("aws-sdk");
class NotificationWorker extends Worker {
  constructor() {
    super("notification");
    AWS.config.update({
      accessKeyId: Config.aws.accessKey,
      logger: console.info,
      region: "eu-west-1",
      secretAccessKey: Config.aws.secretKey,
      sslEnabled: true
    });
    this.on("N_COMMENT", this.on_COMMENT.bind(this));
    this.on("N_REPLY", this.on_REPLY.bind(this));
    this.on("N_REPORT", this.on_REPORT.bind(this));
  }

  _getActivityNode(activityID) {
    return userActivityModel.getUserActivityByID(activityID);
  }

  on_REPORT(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty("text")) {
      console.error("N_REPORT", "missing text");
      return;
    }

    if (Config.slack.token) {
      let text = data.text;
      let slackToken = Config.slack.token;
      let room = Config.slack.room;
      let url = `https://slack.com/api/chat.postMessage?token=${slackToken}&channel=${room}&text=${text}&username=NEW%20REPORT&icon_emoji=%3Awarning%3A&pretty=1`;
      request.get(url); //TODO: create middleware to do this
    } else {
      console.warn("Missing SLACK_TOKEN. skipping message.");
    }
  }

  on_COMMENT(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty("activityID")) {
      console.error("on_COMMENT", "missing activityID");
      return;
    }
    let activityID = data.activityID;

    this._getActivityNode(activityID)
      .then((accept, reject, Activity) => {
        userModel
          .getBlockStatus(Activity.userID, Activity.actor.userID)
          .done(status => {
            if (status === null) {
              userActivityModel
                .getUserActivityCount(Activity.userID)
                .done(counts => {
                  accept(Activity, counts.unSeen);
                })
                .error(() => {
                  accept(Activity, 0);
                });
            } else {
              reject(
                `USER ${Activity.userID} and ${
                  Activity.actor.userID
                } are blocking each other`
              );
            }
          })
          .error(reject);
      })
      .done((Activity, count) => {
        let endpoint = Activity.person.email || null;
        let text = [
          `<p><u><i>${Activity.actor.username}</i></u>`,
          `${Activity.text}</p>`,
          `<p> " <i>${Activity.target.Comment.content}</i>" `,
          `&mdash; get in touch via ${Activity.target.Comment.author.email}`
        ].join(" ");

        this.sendCommentNotificationEmail(endpoint, text);
        //commented out as we are not using pushnotification
        // pushNotificationService
        //   .pushNotification(endpoint, text, {
        //     activityID: Activity.activityID,
        //     type: Activity.type,
        //     postID: Activity.target.Post.postID,
        //     Badge: count
        //   })
        //   .error(console.error.bind(console));
      })
      .error(console.error.bind(console));
  }

  on_REPLY(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty("activityID")) {
      console.error("on_COMMENT", "missing activityID");
      return;
    }
    let activityID = data.activityID;

    this._getActivityNode(activityID)
      .then((accept, reject, Activity) => {
        userModel
          .getBlockStatus(Activity.userID, Activity.actor.userID)
          .done(status => {
            if (status === null) {
              userActivityModel
                .getUserActivityCount(Activity.userID)
                .done(counts => {
                  accept(Activity, counts.unSeen);
                })
                .error(() => {
                  accept(Activity, 0);
                });
            } else {
              reject(
                `USER ${Activity.userID} and ${
                  Activity.actor.userID
                } are blocking each other`
              );
            }
          })
          .error(reject);
      })
      .done((Activity, count) => {
        let endpoint = Activity.person.notificationEndpoint || null;
        let text = [Activity.actor.username, Activity.text].join(" ");

        pushNotificationService
          .pushNotification(endpoint, text, {
            activityID: Activity.activityID,
            type: Activity.type,
            postID: Activity.target.Post.postID,
            Badge: count
          })
          .error(console.error.bind(console));
      })
      .error(console.warn.bind(console));
  }

  sendCommentNotificationEmail(notificationEndpoint, body) {
    // using sms directly
    var params = {
      Destination: {
        ToAddresses: [notificationEndpoint]
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: body
          },
          Text: {
            //The email body for recipients with non-HTML email clients.
            Charset: "UTF-8",
            Data: body
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: "humankind: a comment is made on your post"
        }
      },
      Source: Config.aws.ses.from
    };

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
      .sendEmail(params)
      .promise();

    // Handle promise's fulfilled/rejected states
    sendPromise
      .then(function(data) {
        console.log(data.MessageId);
      })
      .catch(function(err) {
        console.error(err, err.stack);
      });
  }
}

module.exports = NotificationWorker;
