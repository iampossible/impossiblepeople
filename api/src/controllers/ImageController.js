'use strict';

const AWS = require('aws-sdk');
const Joi = require('joi');

const config = require('../config/server');
const Controller = require('core/Controller');
const Hasher = require('middleware/Hasher');
const userModel = require('models/UserModel');

var validImages = {
  jpg: 'ffd8ffe0',
  png: '89504e47',
  gif: '47494638'
};

var uploadImage = (client, body, key, callback) => {
  client.upload({
    ACL: 'public-read',
    Body: body,
    Bucket: 'gnome-assets',
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
    Key: key,
  }, callback);
};

var deleteImage = (client, key, callback) => {
  client.deleteObject({
    Bucket: 'gnome-assets',
    Key: key,
  }, callback);
};

var updateUser = (userID, imageSource, callback) => {
  userModel
    .updateUser(userID, { imageSource })
    .done((user) => callback(null, user))
    .error((err) => callback(err));
};

class ImageController extends Controller {

  constructor() {
    super();

    AWS.config.update({ 
      accessKeyId: config.aws.accessKey,
      logger: console.info,
      region: 'eu-west-1',
      secretAccessKey: config.aws.secretKey,
      sslEnabled: true,
    });

    this.route('postImage', {
      method: 'POST',
      path: '/api/user/image',
      auth: 'session',
      handler: this.imagePostHandler,
      validate: {
        imageData: Joi.string().regex(/^data:image\/jpe?g;base64,.+$/).required(),
      },
    });
  }

  imagePostHandler(request, reply) {
    let body = new Buffer(request.payload.imageData.replace(/data:image\/jpe?g;base64,/, ''), 'base64');
    let hex = body.toString('hex', 0, 4);

    if (hex !== validImages.jpg) {
      return reply({ msg: 'not a JPEG file' }).code(400);
    }

    let newImageKey = Hasher.encode(request.auth.credentials.id, Date.now());
    let s3 = new AWS.S3();

    uploadImage(s3, body, newImageKey, (error, data) => {
      if (error) {
        reply({ msg: error }).code(400);
      } else {
        updateUser(request.auth.credentials.userID, data.Location, (err, user) => {
          if (err) {
            deleteImage(s3, newImageKey, () => {
              reply({ msg: err }).code(400);
            });
          } else {
            reply({ userID: user.userID, imageSource: user.imageSource }).code(201);
          }
        });
      }
    });
  }
}

module.exports = new ImageController();
