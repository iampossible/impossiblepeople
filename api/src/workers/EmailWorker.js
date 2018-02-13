"use strict";
const Fs = require("fs");
const Nodemailer = require("nodemailer");
const AWS = require("aws-sdk");
const Config = require("config/server");
const Worker = require("core/Worker");
const ses = require("nodemailer-ses-transport");

class EmailWorker extends Worker {
  constructor() {
    super("email");
    AWS.config.update({
      accessKeyId: Config.aws.accessKey,
      logger: console.info,
      region: "eu-west-1",
      secretAccessKey: Config.aws.secretKey,
      sslEnabled: true
    });

    this.on("WELCOME_EMAIL_EVENT", this.onWelcome.bind(this));
    this.on("INVITE_EMAIL_EVENT", this.onInvite.bind(this));
    this.on("RECOVER_PASSWORD_EMAIL_EVENT", this.onRecoverPassword.bind(this));
    this.on("FEEDBACK_EMAIL_EVENT", this.onFeedback.bind(this));

    this.templateStrings = {};
    Fs.readFile("templates/welcomeEmailHumankind.html", "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.welcome = data;
    });
    Fs.readFile("templates/welcomeMigrated.html", "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.welcomeMigrated = data;
    });
    Fs.readFile("templates/recoveryEmail.html", "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.recovery = data;
    });
    Fs.readFile("templates/inviteEmail.html", "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.invite = data;
    });
  }

  onWelcome(msg, id) {
    console.log(id, "with", msg);
    // params to pass to template engine: userFirstName, userLastName
    this.sendEmail({
      to: msg.data.userAddress,
      subject: "Welcome to Humankind",
      // eslint-disable-next-line no-eval, prefer-template
      html: eval(
        "`" +
          (msg.data.migrated
            ? this.templateStrings.welcomeMigrated
            : this.templateStrings.welcome) +
          "`"
      )
    });
  }
  onFeedback(msg, id) {
    console.log(id, "with", msg);
    // params to pass to template engine: userFirstName, userLastName
    this.sendEmail({
      to: Config.aws.ses.from,
      subject: "Feedback Message : " + msg.data.subject,
      html:
        "<p>you have got a feedback from " +
        msg.data.fullName +
        "&nbsp;&mdash;&nbsp;<u>" +
        msg.data.email +
        "</u></p>" +
        "<p><b><u>Feedback:</u></b>&nbsp;" +
        msg.data.body +
        "</p>"
    });
  }
  onInvite(msg, id) {
    console.log(id, "with", msg);
    // params to pass to template engine: invitedBy.firstName, invitedBy.lastName
    this.sendEmail({
      to: msg.data.inviteAddress,
      subject: `${msg.data.invitedBy.firstName} ${
        msg.data.invitedBy.lastName
      } has invited you to join Impossible!`,
      // eslint-disable-next-line no-eval, prefer-template
      html: eval("`" + this.templateStrings.invite + "`")
    });
  }

  onRecoverPassword(msg, id) {
    console.log(id, "with", msg);
    // params to pass to template engine: userFirstName, userLastName, newPassword
    this.sendEmail({
      to: msg.data.userAddress,
      subject: "Your new password",
      // eslint-disable-next-line no-eval, prefer-template
      html: eval("`" + this.templateStrings.recovery + "`")
    });
  }

  sendEmail(options) {
    //using nodemailer-ses-transport
    var transporter = Nodemailer.createTransport(
      ses({
        accessKeyId: Config.aws.accessKey,
        logger: console.info,
        region: "eu-west-1",
        secretAccessKey: Config.aws.secretKey,
        sslEnabled: true
      })
    );

    let email = {
      from: Config.aws.ses.from
    };
    email = Object.assign(email, options);
    transporter.sendMail(email, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Message sent: ${info.response}`);
      }
    });
  }
}

module.exports = EmailWorker;
