'use strict';

const Sequence = require('impossible-promise');

const pushNotificationService = require('middleware/PushNotificationService');
const userModel = require('models/UserModel');

const nockStubs = require('../../NockStubs');

describe('Notification Service', () => {
  //TODO: finish publish test and integrate other publish tests
  xdescribe('publishCommentNotification method', () => {
    let commentScope;
    let endpoint = 'hello';
    let postID = 'world';

    beforeEach(() => {
      commentScope = nockStubs.commentPublishScope(endpoint, 'Demo User', 'world')
    })

    it('should publish to SNS', (done) => {
      const mockCommenter = { firstName: 'Demo', lastName: 'User' };
      const mockPost = { creator: { notificationEndpoint: endpoint }, post: { postID } };

      pushNotificationService.publishCommentNotification(mockCommenter, mockPost).done(() => {
        commentScope.done();
        done();
      })
    });
  });

  describe('register method', () => {
    let notificationScope;
    let token = 'helloworld';
    let mockUserID = 'steve';

    beforeEach(() => {
      notificationScope = nockStubs.notificationEndpointScope(token, mockUserID);
    })

    it('should call SNS with the token', (done) => {
      pushNotificationService.register(mockUserID, token).done((data) => {
        notificationScope.done();
        done();
      });
    });

    it('should store the notification endpoint in the database', (done) => {

      spyOn(userModel, 'updateUser').and.callFake((userID, data) => {
        expect(userID).toEqual(mockUserID);
        expect(data).toEqual({
          notificationEndpoint: 'arn:aws:sns:eu-west-1:183663629754:endpoint/APNS_SANDBOX/Gnome-App/88b13645-1fec-3f04-a2c8-07613e131316',
        });

        return new Sequence();
      });

      pushNotificationService.register(mockUserID, token).done(() => {
        notificationScope.done();
        done();
      }).error(console.error);
    });
  });
});
