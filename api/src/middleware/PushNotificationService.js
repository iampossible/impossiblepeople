'use strict';


const AWS = require('aws-sdk');
const request = require('request');
const Sequence = require('impossible-promise');

const config = require('config/server');
const userModel = require('models/UserModel');

const sns = new AWS.SNS({
  accessKeyId: config.aws.accessKey,
  logger: console.info,
  region: 'eu-west-1',
  secretAccessKey: config.aws.secretKey,
  sslEnabled: true,
});
const appleApplicationArn = config.aws.sns.Apple;
const androidApplicationArn = config.aws.sns.Android;

class PushNotificationService {

  constructor() {
  }

  pushNotification(notificationEndpoint, text, dataObj) {

    if (process.env.GNOME_ENV === 'dev') {
      console.log('[skiping SNS] PushNotificationService:', Object.assign({ notificationEndpoint, text }, dataObj))
      return new Sequence();
    }

    if (notificationEndpoint) {
      return new Sequence((accept, reject) => {
        let message = { aps: Object.assign({ alert: text }, dataObj) };

        let params = {
          Message: this.buildMessageWith(text, message),
          MessageStructure: 'json',
          TargetArn: notificationEndpoint,
        };

        sns.publish(params, (err, result) => {
          if (err) {
            console.error('Notification publication failed', notificationEndpoint, JSON.stringify(err));
            reject(err);
          } else {
            console.info('Notification sent to ', notificationEndpoint);
            accept(result);
          }
        });
      });
    } else {
      return new Sequence();
    }
  }

  publishCommentNotification(commenter, data) {
    if (data.creator.notificationEndpoint) {
      return new Sequence((accept, reject) => {
        let text = `${commenter.firstName} ${commenter.lastName} has commented on your post`;
        let message = { aps: { alert: text, postID: data.post.postID } };
        let endpoint = data.creator.notificationEndpoint;

        let params = {
          Message: this.buildMessageWith(text, message),
          MessageStructure: 'json',
          TargetArn: endpoint,
        };

        sns.publish(params, (err, result) => {
          if (err) {
            console.error('Notification publication failed', endpoint, JSON.stringify(err));
            reject(err);
          } else {
            console.info('Notification sent to ', endpoint);
            accept(result);
          }
        });
      });
    } else {
      return new Sequence();
    }
  }

  register(userID, deviceToken, deviceType) {
    if (!deviceType) deviceType = '';

    return new Sequence((accept, reject) => {
      let PlatformApplicationArn = deviceType === 'android' ? androidApplicationArn : appleApplicationArn;
      sns.createPlatformEndpoint(
        { PlatformApplicationArn, Token: deviceToken, CustomUserData: userID },
        (err, responseData) => {
          if (err) {
            let dupErrorRegexp = /Endpoint (\s+) already exists/;
            let endpointArr = dupErrorRegexp.exec(err.message);
            if (endpointArr && endpointArr.length > 0) {
              sns.deleteEndpoint({ EndpointArn: endpointArr[0] }, (err) => {
                if (err) {
                  reject(err);
                } else {
                  sns.createPlatformEndpoint(
                    { PlatformApplicationArn, Token: deviceToken, CustomUserData: userID },
                    (err, responseData) => {
                      if (err) {
                        reject(err);
                      }
                      accept(responseData);
                    });
                }
              });
            } else {
              reject(err);
            }
          }
          accept(responseData);
        });
    }).then((accept, reject, responseData) => {
      userModel
        .updateUser(userID, { notificationEndpoint: responseData.EndpointArn })
        .done(accept)
        .error(reject);
    });
  }

  unregister(user) {
    if (user.notificationEndpoint) {
      // Best effort to remove the endpoint in AWS SNS, but there are mitigations in the register method
      sns.deleteEndpoint({ EndpointArn: user.notificationEndpoint }, (err) => {
        if (err) {
          console.log(err, err.stack); // an error occurred (but we can safely ignore it)
        }
      });
      userModel.updateUser(user.userID, { notificationEndpoint: '' }).done(() => {
        // noop
      }).error((err) => {
        console.log(err, err.stack);
      });
    }
  }

  buildMessageWith(text, message) {
    let msg = {
      default: text,
    };
    let messageString = JSON.stringify(message);

    msg.GCM = JSON.stringify({ data: { message: text } });

    if (process.env.GNOME_ENV === 'prod') {
      msg.APNS = messageString;
    } else {
      msg.APNS_SANDBOX = messageString;
    }

    return JSON.stringify(msg);
  }
}

module.exports = new PushNotificationService();
