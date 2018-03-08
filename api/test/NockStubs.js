'use strict';

const Config = require('config/server');

const nock = require('nock');

// eslint-disable-next-line camelcase
const access_token = `${Config.facebook.appID}|${Config.facebook.appSecret}`;

class NockStubs {

  // TODO make 'thisIsAToken' available as a constant?
  debugTokenScope(code, response) {
    return nock('https://graph.facebook.com/v2.6')
      .get('/debug_token')
      .query({ access_token, input_token: 'thisIsAToken' })
      .reply(code, response);
  }

  userDetailsScope(code, response) {
    return nock('https://graph.facebook.com/v2.6')
      .get('/someUserID')
      .query({ access_token, fields: 'email,about,first_name,last_name,picture.type(large),friends' })
      .reply(code, response);
  }

  userDetailsErrorScope(response) {
    return nock('https://graph.facebook.com/v2.6')
      .get('/someUserID')
      .query({ access_token, fields: 'email,about,first_name,last_name,picture.type(large),friends' })
      .replyWithError(response);
  }

  googleLocationScope(location, code, response) {
    return nock('https://maps.googleapis.com')
      .get('/maps/api/geocode/json')
      .query({ address: location, key: Config.google.apiKey })
      .reply(code, response);
  }

  notificationEndpointScope(token, userID) {
    return nock('https://sns.eu-west-1.amazonaws.com:443', { encodedQueryParams: true })
      .post('/', `Action=CreatePlatformEndpoint&CustomUserData=${userID}&PlatformApplicationArn=arn%3Aaws%3Asns%3Aeu-west-1%3A183663629754%3Aapp%2FAPNS_SANDBOX%2FGnome-App-Stage&Token=${token}&Version=2010-03-31`)
      .reply(200, '<CreatePlatformEndpointResponse xmlns=\"http://sns.amazonaws.com/doc/2010-03-31/\">\n  <CreatePlatformEndpointResult>\n    <EndpointArn>arn:aws:sns:eu-west-1:183663629754:endpoint/APNS_SANDBOX/Gnome-App/88b13645-1fec-3f04-a2c8-07613e131316</EndpointArn>\n  </CreatePlatformEndpointResult>\n  <ResponseMetadata>\n    <RequestId>6ac9c9d9-925a-5be3-986f-861940c42d0b</RequestId>\n  </ResponseMetadata>\n</CreatePlatformEndpointResponse>\n', { 'x-amzn-requestid': '6ac9c9d9-925a-5be3-986f-861940c42d0b',
        'content-type': 'text/xml',
        'content-length': '425',
        date: 'Thu, 26 May 2016 10:30:53 GMT',
        connection: 'close' });
  }

  commentPublishScope(endpoint, commenter, postID) {
    var content = `${commenter} has commented on your post`;
    let message = encodeURIComponent(JSON.stringify({
      default: content,
      APNS_SANDBOX: JSON.stringify({ aps: { alert: content, postID } }),
    }));
    let awsEndpoint = `Action=Publish&Message=${message}&MessageStructure=json&TargetArn=${endpoint}&Version=2010-03-31`;

    return nock('https://sns.eu-west-1.amazonaws.com:443', { encodedQueryParams: true })
      .post('/', awsEndpoint)
      .reply(200, '<PublishResponse xmlns=\"http://sns.amazonaws.com/doc/2010-03-31/\">\n  <PublishResult>\n    <MessageId>d1d5b0b7-c664-5e6b-b25d-ff76f73013bd</MessageId>\n  </PublishResult>\n  <ResponseMetadata>\n    <RequestId>0e32add2-6c2b-523b-9edb-e2135d7f6fed</RequestId>\n  </ResponseMetadata>\n</PublishResponse>\n', { 'x-amzn-requestid': '0e32add2-6c2b-523b-9edb-e2135d7f6fed',
        'content-type': 'text/xml',
        'content-length': '294',
        date: 'Thu, 26 May 2016 17:15:00 GMT',
        connection: 'close' });
  }

}

module.exports = new NockStubs();
