'use strict';

const request = require('request');
const Sequence = require('impossible-promise');

const Config = require('config/server');
const baseUrl = 'https://graph.facebook.com/v2.6';

class FacebookService {

  constructor(appID, appSecret) {
    this.accessToken = `${appID}|${appSecret}`;
    this.appID = appID;
  }

  verifyToken(inputToken) {
    return new Sequence((accept, reject) => {
      var debugTokenEndpoint = `${baseUrl}/debug_token?access_token=${this.accessToken}&input_token=${inputToken}`;
      console.debug('FacebookService@verifyToken:', `get: ${debugTokenEndpoint}`);

      request.get(
        debugTokenEndpoint,
        (error, response) => {
          console.debug('FacebookService@verifyToken:', `/debug_token reply: ${response.body}`);
          console.log(error, response.body);
          if (error) {
            reject(error);
          } else {
            try {
              let data = JSON.parse(response.body).data;
              if (data && data.is_valid && data.app_id === this.appID) {
                accept(data);
              } else {
                reject(data);
              }
            } catch (err) {
              reject(response.body);
            }
          }
        }
      );
    });
  }

  getUserDetails(facebookUserID) {
    return new Sequence((accept, reject) => {
      let fields = 'email,about,first_name,last_name,picture.type(large),friends';
      let facebookUserEndpoint = `${baseUrl}/${facebookUserID}?access_token=${this.accessToken}&fields=${fields}`;
      console.debug('FacebookService@getUserDetails:', `get: ${facebookUserEndpoint}`);

      request.get(
        facebookUserEndpoint,
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            console.debug('FacebookService@getUserDetails:', `/user reply: ${response.body}`);
            try {
              let facebookData = JSON.parse(response.body);
              accept({
                friends: (facebookData.friends || {}).data || [],
                user: {
                  fromFacebook: facebookData.id,
                  email: facebookData.email,
                  firstName: facebookData.first_name,
                  lastName: facebookData.last_name,
                  biography: facebookData.about,
                  imageSource: `https://graph.facebook.com/${facebookData.id}/picture?type=large`,
                },
              });
            } catch (err) {
              reject(response.body);
            }
          }
        }
      );
    });
  }
}

module.exports = new FacebookService(Config.facebook.appID, Config.facebook.appSecret);
