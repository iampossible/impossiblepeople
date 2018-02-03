'use strict';

const Fs = require('fs');
const Nodemailer = require('nodemailer');

const Config = require('config/server');
const Worker = require('core/Worker');

class EmailWorker extends Worker {
  constructor() {
    super('email');

    this.on('WELCOME_EMAIL_EVENT', this.onWelcome.bind(this));
    this.on('INVITE_EMAIL_EVENT', this.onInvite.bind(this));
    this.on('RECOVER_PASSWORD_EMAIL_EVENT', this.onRecoverPassword.bind(this));

    this.templateStrings = {};
    Fs.readFile('templates/welcomeEmail.html', 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.welcome = data;
    });
    Fs.readFile('templates/welcomeMigrated.html', 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.welcomeMigrated = data;
    });
    Fs.readFile('templates/recoveryEmail.html', 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.recovery = data;
    });
    Fs.readFile('templates/inviteEmail.html', 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      this.templateStrings.invite = data;
    });
  }

  onWelcome(msg, id) {
    console.log(id, 'with', msg);
    // params to pass to template engine: userFirstName, userLastName
    this.sendEmail({
      to: msg.data.userAddress,
      subject: 'Welcome to Impossible',
      // eslint-disable-next-line no-eval, prefer-template
      html: eval('`' + (msg.data.migrated ? this.templateStrings.welcomeMigrated : this.templateStrings.welcome) + '`')
    });
  }

  onInvite(msg, id) {
    console.log(id, 'with', msg);
    // params to pass to template engine: invitedBy.firstName, invitedBy.lastName
    this.sendEmail({
      to: msg.data.inviteAddress,
      subject: `${msg.data.invitedBy.firstName} ${msg.data.invitedBy.lastName} has invited you to join Impossible!`,
      // eslint-disable-next-line no-eval, prefer-template
      html: eval('`' + this.templateStrings.invite + '`')
    });
  }

  onRecoverPassword(msg, id) {
    console.log(id, 'with', msg);
    // params to pass to template engine: userFirstName, userLastName, newPassword
    this.sendEmail({
      to: msg.data.userAddress,
      subject: 'Your new password',
      // eslint-disable-next-line no-eval, prefer-template
      html: eval('`' + this.templateStrings.recovery + '`')
    });
  }

  sendEmail(options) {
    let transporter = Nodemailer.createTransport({
      service: Config.smtp.service,
      auth: {
        user: Config.smtp.user,
        pass: Config.smtp.pass
      }
    });
    let email = {
      from: Config.smtp.from,
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
