'use strict';

const QueueWorkers = require('middleware/QueueWorkers');


module.exports = class EmailService {

  static sendWelcomeEmail(user) {
    console.debug('EmailService@sendWelcomeEmail', user.email);
    QueueWorkers.email('WELCOME_EMAIL_EVENT', {
      userAddress: user.email,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      migrated: user.migrated
    });
  }

  static sendInviteEmail(user, email) {
    console.debug('EmailService@sendInviteEmail', email);
    QueueWorkers.email('INVITE_EMAIL_EVENT', {
      inviteAddress: email,
      invitedBy: { firstName: user.firstName, lastName: user.lastName }
    });
  }

  static sendRecoverPasswordEmail(user, recoveredPassword) {
    console.debug('EmailService@sendRecoverPasswordEmail', user.email);
    QueueWorkers.email('RECOVER_PASSWORD_EMAIL_EVENT', {
      userAddress: user.email,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      newPassword: recoveredPassword
    });
  }

};
