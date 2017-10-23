'use strict';

var gnomeApi = require('ImpossibleApi');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');
var request = require('request');

var helpers = require('../helpers');

describe('Explore endpoints', () => {
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
          expect(value.length).toEqual(0);
          done();
        });
      });
    });
  });
  describe('GET explore/{name}/search/{search}', () => {
    it('should rejected unauthenticated requests', (done) => {
        request.get(`http://${Config.endpoint}/api/explore/Music/search/xpto`, (error, response) => {
        expect(response.statusCode).toBe(401);
        done();
        });
    }); 

    it('should evaluate the content of the post from Music interest stored with the keyword show', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Music/search/show`, (error, response) => {
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

    it('should evaluate the content of the post from Music interest stored with the keyword Musician', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Music/search/musician`, (error, response) => {
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

    it('should evaluate the content of the post from Music interest stored with the keyword perform', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Music/search/perform`, (error, response) => {
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

    it('should evaluate the content of the posts from Environment interest with the keyword If', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Environment/search/if`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(1);
          //creator
          expect(value[0].author.username).toEqual('Hans Muster');
          //
          expect(value[0].postType).toEqual('OFFERS');
          expect(value[0].timeRequired).toEqual(43200);
          expect(value[0].location).toEqual('Greater London');
          expect(value[0].postID).toEqual('9295c240');
          expect(value[0].content).toEqual('If anyone needs a helping hand in his/her garden, I\'m willing to help you out on a sunny Saturday afternoon! Provide me with sunshine and water and I\'ll mow that lawn of yours!');
          expect(value[0].commentCount).toEqual(0);
          //category
          expect(value[0].category.image).toEqual('build/images/interests/environment.png');
          expect(value[0].category.name).toEqual('Environment');
          
          done();
        });
      });
    });

    it('should evaluate the content of the posts from Environment interest with the keyword her', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Environment/search/hEr`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(1);
          //creator
          expect(value[0].author.username).toEqual('Hans Muster');
          //
          expect(value[0].postType).toEqual('OFFERS');
          expect(value[0].timeRequired).toEqual(43200);
          expect(value[0].location).toEqual('Greater London');
          expect(value[0].postID).toEqual('9295c240');
          expect(value[0].content).toEqual('If anyone needs a helping hand in his/her garden, I\'m willing to help you out on a sunny Saturday afternoon! Provide me with sunshine and water and I\'ll mow that lawn of yours!');
          expect(value[0].commentCount).toEqual(0);
          //category
          expect(value[0].category.image).toEqual('build/images/interests/environment.png');
          expect(value[0].category.name).toEqual('Environment');
          
          done();
        });
      });
    });

    it('should count all the posts from Music interest stored with the keyword apples', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Music/search/AppLes`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(0);
          done();
        });
      });
    });

    it('should count all the posts from Music interest with the keyword xpto', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Music/search/xpto`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(0);
          done();
        });
      });
    });

    it('should count all the posts from any interest with the keyword xpto', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Music/search/xpto`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(0);
          done();
        });
      });
    });


    it('should evaluate the content of the posts from any interest with the keyword london', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/_/search/london`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(3);
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

    it('should evaluate the content of the posts from Emvironment interest with the keyword London', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Environment/search/London`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(1);
          //creator
          expect(value[0].author.username).toEqual('Hans Muster');
          //
          expect(value[0].postType).toEqual('OFFERS');
          expect(value[0].timeRequired).toEqual(43200);
          expect(value[0].location).toEqual('Greater London');
          expect(value[0].postID).toEqual('9295c240');
          expect(value[0].content).toEqual('If anyone needs a helping hand in his/her garden, I\'m willing to help you out on a sunny Saturday afternoon! Provide me with sunshine and water and I\'ll mow that lawn of yours!');
          expect(value[0].commentCount).toEqual(0);
          //category
          expect(value[0].category.image).toEqual('build/images/interests/environment.png');
          expect(value[0].category.name).toEqual('Environment');
          
          done();
        });
      });
    });


    it('should count all the posts from any interest near the logged user', (done) => {
      helpers.logInTestUser((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/_/nearme`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(0);
          done();
        });
      });
    });

    it('should count all the posts from any interest near the logged user', (done) => {
      helpers.logInAlice((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/_/nearme`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(5);
          done();
        });
      });
    });

    it('should count all the posts from Food interest near the logged user', (done) => {
      helpers.logInAlice((err, $request) => {
        $request.get(`http://${Config.endpoint}/api/explore/Food/nearme`, (error, response) => {
          let value = JSON.parse(response.body);
          expect(value.length).toEqual(3);
          done();
        });
      });
    });

  });
});

 

    


