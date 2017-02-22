'use strict';

const EmailService = require('middleware/EmailService');
const QueueWorkers = require('middleware/QueueWorkers');

describe('EmailService', () => {
  describe('sendWelcomeEmail method', () => {
    it('should publish to the email queue', (done) => {
      spyOn(QueueWorkers, 'email').and.callFake((type, msg) => {
        expect(type).toEqual('WELCOME_EMAIL_EVENT');
        expect(msg).toBeDefined();
        expect(msg.userAddress).toBeDefined();
        expect(msg.userAddress).toEqual('a@b.c');
        expect(msg.userFirstName).toBeDefined();
        expect(msg.userFirstName).toEqual('A');
        expect(msg.userLastName).toBeDefined();
        expect(msg.userLastName).toEqual('B');
        done();
      });
      EmailService.sendWelcomeEmail({
        email: 'a@b.c',
        firstName: 'A',
        lastName: 'B'
      });
    });
  });


  describe('sendRecoverEmail method', () => {
    it('should publish to the email queue', (done) => {
      spyOn(QueueWorkers, 'email').and.callFake((type, msg) => {
        expect(type).toEqual('RECOVER_PASSWORD_EMAIL_EVENT');
        expect(msg).toBeDefined();
        expect(msg.userAddress).toBeDefined();
        expect(msg.userAddress).toEqual('a@b.c');
        expect(msg.userFirstName).toBeDefined();
        expect(msg.userFirstName).toEqual('A');
        expect(msg.userLastName).toBeDefined();
        expect(msg.userLastName).toEqual('B');
        expect(msg.newPassword).toBeDefined();
        expect(msg.newPassword).toEqual('mynewpassword');
        done();
      });
      EmailService.sendRecoverPasswordEmail({
        email: 'a@b.c',
        firstName: 'A',
        lastName: 'B'
      }, 'mynewpassword');
    });
  });

  describe('sendInviteEmail method', () => {
    it('should publish to the email queue', (done) => {
      spyOn(QueueWorkers, 'email').and.callFake((type, msg) => {
        expect(type).toEqual('INVITE_EMAIL_EVENT');
        expect(msg).toBeDefined();
        expect(msg.inviteAddress).toBeDefined();
        expect(msg.inviteAddress).toEqual('a@b.c');
        expect(msg.invitedBy.firstName).toBeDefined();
        expect(msg.invitedBy.firstName).toEqual('A');
        expect(msg.invitedBy.lastName).toBeDefined();
        expect(msg.invitedBy.lastName).toEqual('B');
        done();
      });
      EmailService.sendInviteEmail({
        firstName: 'A',
        lastName: 'B'
      }, 'a@b.c');
    });
  });

});
