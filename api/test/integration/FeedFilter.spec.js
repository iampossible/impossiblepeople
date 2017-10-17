'use strict';

var gnomeApi = require('ImpossibleApi');
var dataHelper = require('../DataHelper.js');
var Config = require('config/server');

var helpers = require('../helpers');


describe('Feed algorithm', () => {

  var feedEndpoint = `http://${Config.endpoint}/api/feed`;

  beforeAll((done) => {
    gnomeApi.start();
    dataHelper.populateFrom('./seed.feed.json').then(done);
  });

  afterAll((done) => dataHelper.wipe().then(done));

  var _cache_body;

  function logInAndGetFeed() {
    if (_cache_body) {
      return Promise.resolve(_cache_body);
    }
    return new Promise((accept) => {
      helpers.logInFrodo((err, request) => {
        request.get(feedEndpoint, (error, response) => {
          var body = JSON.parse(response.body);
          _cache_body = body;
          accept(body);
        });
      });
    });
  }

  function expect_feedToContainPostIDs(body, myPosts) {
    var feedPostID = body.map((item) => item.postID);
    myPosts.forEach((postID) => {
      expect(feedPostID).toContain(postID);
    });
  }

  function expect_feedNotToContainPostIDs(body, myPosts) {
    var feedPostID = body.map((item) => item.postID);
    myPosts.forEach((postID) => {
      expect(feedPostID).not.toContain(postID);
    });
  }


  describe('should list', () => {
    it('my own posts', (done) => {
      logInAndGetFeed().then(body => {
        var myPosts = ['d9465e1c'];
        expect_feedToContainPostIDs(body, myPosts);
        done();
      });
    });

    it('my friends posts', (done) => {
      logInAndGetFeed().then(body => {
        var friendsPosts = ['cea7ced8', '08ebf606', '086fd7ee'];
        expect_feedToContainPostIDs(body, friendsPosts);
        done();
      });
    });

    it('my friends of friends posts', (done) => {
      logInAndGetFeed().then(body => {
        var friendsPosts = ['130fafa6', '086fd7ee'];
        expect_feedToContainPostIDs(body, friendsPosts);

        let friendPost = body.filter(post => post.postID == '130fafa6')[0];
        expect(friendPost.author.commonFriends[0].username).toBe('Samwise Gamgee');

        done();
      });
    });

    it('posts of people I follow', (done) => {
      logInAndGetFeed().then(body => {
        var friendsPosts = ['e5b68a3c'];
        expect_feedToContainPostIDs(body, friendsPosts);
        done();
      });
    });

    it('posts matching my interests and location', (done) => {
      logInAndGetFeed().then(body => {
        var interestAndLocationPosts = ['cea7ced8', '025dacef', '43b1a331'];
        expect_feedToContainPostIDs(body, interestAndLocationPosts);
        done();
      });
    });

    it('friends in common', (done) => {
      logInAndGetFeed().then(body => {

        var samID = body.filter(post => {
          return post.postID === '130fafa6';
        })[0].author.commonFriends[0].username;

        expect(samID).toBe('Samwise Gamgee');
        done();
      });
    });

    it('isFriend if its a friend', (done) => {
      logInAndGetFeed().then(body => {

        var bilboPost = body.filter(post => {
          return post.postID === '086fd7ee';
        })[0];

        expect(bilboPost.author.isFriend).toBeDefined();
        expect(bilboPost.author.isFriend).toBeTruthy();
        done();
      });
    });

  });

  describe('should NOT list', () => {
    it('post of different interests that aren\'t from my network ', (done) => {
      logInAndGetFeed().then(body => {
        var myPosts = ['a94005a5'];
        expect_feedNotToContainPostIDs(body, myPosts);
        done();
      });
    });
    const lit = Config.settings.feed_use_location ? xit : it;
    lit('posts matching my interests but not location', (done) => {
      logInAndGetFeed().then(body => {
        var notSameLocationPost = ['23cadce2', 'f5caf1ea'];
        expect_feedNotToContainPostIDs(body, notSameLocationPost);
        done();
      });
    }).pend('using INTEREST OR LOCATION until we get more posts on the feed.');

    it('post of different interests from people that I don\'t follow back', (done) => {
      logInAndGetFeed().then(body => {
        var myPosts = ['65def3cf'];
        expect_feedNotToContainPostIDs(body, myPosts);
        done();
      });
    });
  });
});
