'use strict';

const AWS = require('aws-sdk');
const request = require('request');
const fs = require('fs');

const Config = require('config/server');
const dataHelper = require('../DataHelper.js');
const gnomeApi = require('ImpossibleApi');
const helpers = require('../helpers');

const imageData = fs.readFileSync('test/assets/profile_image.b64');
const notImageData = fs.readFileSync('README.md').toString('base64');

describe('Image endpoints', () => {
  beforeAll((done) => {
    gnomeApi.start();

    dataHelper.populate().then(done);
  });

  afterAll(done => dataHelper.wipe().then(done));


  describe('POST user/image', () => {
    describe('POST user/image', () => {
      var createdImage = null;
      var s3 = null;

      beforeAll((done) => {
        AWS.config.update({ logger: console.info, region: 'eu-west-1', sslEnabled: true });
        s3 = new AWS.S3();
        s3.upload({
          ACL: 'public-read',
          Body: Buffer.from(imageData, 'base64'),
          Bucket: 'gnome-assets',
          ContentEncoding: 'base64',
          ContentType: 'image/jpeg',
          Key: 'todelete',
        }, done);
      });

      afterEach((done) => {
        if (createdImage) {
          s3.deleteObject({
            Bucket: 'gnome-assets',
            Key: createdImage.match(/^https:\/\/gnome-assets\.s3\.eu-west-1\.amazonaws\.com\/([a-zA-Z0-9]+)$/)[1],
          }, done);
          createdImage = null;
        } else {
          done();
        }
      });

      it('should return 401 if user is unauthorised', (done) => {
        request.post(`http://${Config.endpoint}/api/user/image`, (err, response) => {
          expect(response.statusCode).toBe(401);
          done();
        });
      });

      it('should return 201 if the post is successful', (done) => {
        helpers.logInTestUser((err, $request) => {
          $request.post(`http://${Config.endpoint}/api/user/image`, (error, response) => {
            let body = JSON.parse(response.body);
            expect(body.msg).toBeUndefined();
            expect(response.statusCode).toBe(201);
            expect(body.imageSource).toMatch(/^https:\/\/gnome-assets\.s3\.eu-west-1\.amazonaws\.com\/[a-zA-Z0-9]+$/);
            createdImage = body.imageSource;
            done();
          }).form({ imageData: `data:image/jpg;base64,${imageData}` });
        });
      });

      it('should not accept non-image files', (done) => {
        helpers.logInTestUser((err, $request) => {
          $request.post(`http://${Config.endpoint}/api/user/image`, (error, response) => {
            JSON.parse(response.body);
            expect(response.statusCode).toBe(400);
            done();
          }).form({ imageData: `data:image/jpg;base64,${notImageData}` });
        });
      });
    });
  });
});
