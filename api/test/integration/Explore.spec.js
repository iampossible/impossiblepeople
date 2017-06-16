'use strict';

var gnomeApi = require('ImpossibleApi');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');
var request = require('request');

var helpers = require('../helpers');

fdescribe('Explore endpoints', () => {
  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populate().then(done);
  });

  afterAll((done) => dataHelper.wipe().then(done));

  describe('GET explore/{name}', () => {
    it('should rejected unauthenticated requests', (done) => {
        request.get(`http://${Config.endpoint}/api/explore/Music`, (error, response) => {
        expect(response.statusCode).toBe(401);
        done();
        });
    }); 

    it('should evaluate the content of the post from Music interest stored', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Music`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(1);
          //creator
          expect(value[0].author.username).toEqual('Tom Harle');
          //
          expect(value[0].postType).toEqual('OFFERS');
          expect(value[0].timeRequired).toEqual(0);
          expect(value[0].location).toEqual('Greater London');
          expect(value[0].postID).toEqual('46b047b4');
          expect(value[0].content).toEqual('Musician? I\'m putting a show together in Herne Hill at the end of June. Only 2 bands confirmed so far. Come and perform!');
          expect(value[0].commentCount).toEqual(0);
          //category
          expect(value[0].category.image).toEqual('build/images/interests/music.png');
          expect(value[0].category.name).toEqual('Music');
          
          done();
        });
      });
    });

    it('should count all the posts from Food interest stored', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Food`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(3);
          value.forEach(function(element) {
            expect(element.category.name).toEqual('Food');
          });
          done();
        });
      });
    });

    it('should count all the posts from Art & Design interest stored', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/` + encodeURIComponent('Art & Design'), (error, response) => {
          let value = JSON.parse(response.body);
          console.log(value);
          expect(value.length).toEqual(0);
          done();
        });
      });
    });
  });
});

 

    


