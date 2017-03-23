'use strict';

const crypto = require('crypto');
const passwordHelper = require('../src/middleware/PasswordHelper');

class DataGenerator {

  constructor(inputJSON) {
    this._data = inputJSON;
    this._json = [];
    this._activity = [];

    this._globalIndex = 0;

    this._person = {};
    this._interests = {};
    this._time = Date.now() - Math.floor((Math.random() * 900000));
  }

  get json() {
    return JSON.stringify(this._json);
  }

  generateHASH(str) {
    return crypto.createHash('sha1').update(str).digest('hex').slice(0, 8)
  }

  getNextIndex() {
    return ++this._globalIndex;
  }

  getNextTime() {
    this._time = this._time + 6000;
    return this._time;
  }

  parse() {
    return Promise
      .all(this._data.people.map((item, itemIndex) => new Promise((accept) => {
        if (!item.Person._password) {
          this._data.people[itemIndex].Person.password = '';
          accept();
        } else {
          passwordHelper.hashPassword(item.Person._password).done((password) => {
            accept(this._data.people[itemIndex].Person.password = password);
          });
        }
      })))
      .then(() => {
        this._data.interests.forEach(this.parseInterestItem.bind(this));
        this._data.people.forEach(this.parsePersonItem.bind(this));
        this._data.people.forEach(this.parsePersonInterestItem.bind(this));
        this._data.people.forEach(this.parseFollowItem.bind(this));
        this._data.people.forEach(this.parsePostItem.bind(this));

        this._activity
          .filter((i) => i.length)
          .forEach(this.parseActivityStream.bind(this));


        return Promise.resolve(this.json);
      });
  }

  parseInterestItem(item) {
    let _interestIndex = this.getNextIndex();
    this._interests[item.name] = _interestIndex;
    this.generateInterestJson(_interestIndex, item);
  }

  parsePersonItem(item) {
    let _personIndex = this.getNextIndex();
    if (item.Person._invitedBy) {
      this.generateInviteeJson(_personIndex, item.Person);
    } else {
      this._person[item.Person.firstName] = _personIndex;
      this._activity[_personIndex] = [];
      this.generatePersonJson(_personIndex, item.Person);
    }
  }

  addCommentActivity(_personIndex, _fromIndex, _postIndex, commentID) {
    if (_personIndex === _fromIndex) return;

    this._activity[_personIndex].unshift({
      type: 'N_COMMENT',
      _personIndex,
      _fromIndex,
      _postIndex,
      commentID,
    });
  }

  addFollowActivity(_personIndex, _fromIndex) {
    if (_personIndex === _fromIndex) return;

    this._activity[_personIndex].unshift({
      type: 'N_FOLLOW',
      _personIndex,
      _fromIndex,
    });
  }

  parseActivityStream(item) {
    var _personIndex = item[0]._personIndex;
    var _lastStreamIndex = null;
    item.forEach((i, index) => {
      _lastStreamIndex = this.generateActionJson((index === 0 ? _personIndex : null), _lastStreamIndex, i);
    });
  }

  generateActionJson(_activityFeedFrom, _lastIndex, item) {
    let _actionIndex = this.getNextIndex();
    let activityID = this.generateHASH(JSON.stringify(item));


    var ActionObj = {
      activityID,
      type: item.type,
      at: this.getNextTime(),
      isRead: false,
      isNew: true,
    };

    if (item.commentID) {
      ActionObj.commentID = item.commentID;
    }

    this._json.push({
      method: 'POST',
      to: '/node',
      id: _actionIndex,
      body: ActionObj,
    });

    this._json.push({
      method: 'POST',
      to: `{${_actionIndex}}/labels`,
      body: 'Activity',
    });


    if (_activityFeedFrom !== null) {
      this._json.push({
        method: 'POST',
        to: `{${_activityFeedFrom}}/relationships`,
        body: {
          type: 'ACTIVITY_FEED',
          to: `{${_actionIndex}}`,
        },
      });
    } else {
      this._json.push({
        method: 'POST',
        to: `{${_lastIndex}}/relationships`,
        body: {
          type: 'ACTIVITY_NEXT',
          to: `{${_actionIndex}}`,
        },
      });
    }

    if (item._fromIndex) { //ACTIVITY -> ACTOR -> PERSON
      this._json.push({
        method: 'POST',
        to: `{${_actionIndex}}/relationships`,
        body: {
          type: 'ACTOR',
          to: `{${item._fromIndex}}`,
        },
      });
    }

    if (item._postIndex) { //ACTIVITY -> TARGET -> POST
      this._json.push({
        method: 'POST',
        to: `{${_actionIndex}}/relationships`,
        body: {
          type: 'TARGET',
          to: `{${item._postIndex}}`,
        },
      });
    }

    return _actionIndex; //needed to chain on this.parseActivityStream()
  }


  parsePersonInterestItem(item) {
    if (item.Interests) {
      let _personIndex = this._person[item.Person.firstName];

      item.Interests.forEach((interestName) => {
        let _interestIndex = this._interests[interestName];

        this.generatePersonInterestJson(_personIndex, _interestIndex);
      });
    }
  }

  parseFollowItem(item) {
    if (item.Follows) {
      let _followerIndex = this._person[item.Person.firstName];

      item.Follows.forEach((followName) => {
        let _followeeIndex = this._person[followName];
        this.addFollowActivity(_followeeIndex, _followerIndex);
        this.generateFollowJson(_followerIndex, _followeeIndex);
      });
    }
  }

  parsePostItem(item) {
    if (item.Posts) {
      let _creatorIndex = this._person[item.Person.firstName];
      let _postIndex = this.getNextIndex();
      let comments;

      item.Posts.forEach((postItem) => {

        if (postItem.comments) {
          comments = postItem.comments;
        } else {
          comments = [];
        }

        if (postItem.interest) {
          var _interestIndex = this._interests[postItem.interest];
        } else {
          throw new Error('All posts need an Interest');
        }

        if (postItem.postType) {
          var _postType = postItem.postType;
        } else {
          throw new Error('All posts need a postType');
        }

        this.generatePostJson(_postIndex, _creatorIndex, _interestIndex, _postType, {
          timeRequired: postItem.timeRequired,
          content: postItem.content,
          location: postItem.location,
          latitude: postItem.latitude,
          longitude: postItem.longitude,
          resolved: postItem.resolved,
        });

        comments.forEach(comment => {
          let _fromIndex = this._person[comment.by];
          let commentID = this.generateHASH(comment.content)
          this.parseCommentItem(commentID, comment, _postIndex);
          this.addCommentActivity(_creatorIndex, _fromIndex, _postIndex, commentID);
        });
      });
    }
  }

  parseCommentItem(commentID, item, _postIndex) {
    this.generateCommentJson(commentID, this._person[item.by], _postIndex, item.content)
  }

  generateCommentJson(commentID, _creatorIndex, _postIndex, content) {
    this._json.push({
      method: 'POST',
      to: `{${_creatorIndex}}/relationships`,
      body: {
        type: 'COMMENTS',
        to: `{${_postIndex}}`,
        data: {
          commentID: commentID,
          at: this.getNextTime(),
          content,
        },
      },
    });
  }

  generateInterestJson(_interestIndex, item) {
    item.interestID = this.generateHASH(item.name);
    this._json.push({
      method: 'POST',
      to: '/node',
      id: _interestIndex,
      body: item,
    });
    this._json.push({
      method: 'POST',
      to: `{${_interestIndex}}/labels`,
      body: 'Interest',
    });
  }

  generatePersonJson(_personIndex, item) {
    item.userID = this.generateHASH(item.firstName);
    this._json.push({
      method: 'POST',
      to: '/node',
      id: _personIndex,
      body: item,
    });
    this._json.push({
      method: 'POST',
      to: `{${_personIndex}}/labels`,
      body: 'Person',
    });
  }

  generateInviteeJson(_personIndex, item) {
    item.userID = this.generateHASH(item.email);

    this._json.push({
      method: 'POST',
      to: '/node',
      id: _personIndex,
      body: item,
    });

    this._json.push({
      method: 'POST',
      to: `{${_personIndex}}/labels`,
      body: 'Person',
    });
    this._json.push({
      method: 'POST',
      to: `{${_personIndex}}/labels`,
      body: 'Invitee',
    });

    item._invitedBy.forEach((inviter) => {
      let _inviterIndex = this._person[inviter];

      this._json.push({
        method: 'POST',
        to: `{${_inviterIndex}}/relationships`,
        body: {
          type: 'INVITES',
          to: `{${_personIndex}}`,
          data: {
            at: this.getNextTime(),
          },
        },
      });

      this.generateFollowJson(_inviterIndex, _personIndex);
      this.generateFollowJson(_personIndex, _inviterIndex);
    });
  }

  generatePersonInterestJson(_personIndex, _interestIndex) {
    this._json.push({
      method: 'POST',
      to: `{${_personIndex}}/relationships`,
      body: {
        type: 'INTERESTED_IN',
        to: `{${_interestIndex}}`,
        data: {
          at: this.getNextTime(),
        },
      },
    });
  }

  generateFollowJson(_personIndexFrom, _personIndexTo) {
    this._json.push({
      method: 'POST',
      to: `{${_personIndexFrom}}/relationships`,
      body: {
        type: 'FOLLOWS',
        to: `{${_personIndexTo}}`,
        data: {
          at: this.getNextTime(),
        },
      },
    });
  }

  generatePostJson(_postIndex, _creatorIndex, _interestIndex, _postType, item) {
    item.postID = this.generateHASH(item.content);

    this._json.push({
      method: 'POST',
      to: '/node',
      id: _postIndex,
      body: item,
    });

    this._json.push({
      method: 'POST',
      to: `{${_postIndex}}/labels`,
      body: 'Post',
    });

    this._json.push({
      method: 'POST',
      to: `{${_creatorIndex}}/relationships`,
      body: {
        type: _postType,
        to: `{${_postIndex}}`,
        data: {
          at: this.getNextTime(),
        },
      },
    });

    this._json.push({
      method: 'POST',
      to: `{${_postIndex}}/relationships`,
      body: {
        type: 'IS_ABOUT',
        to: `{${_interestIndex}}`,
        data: {
          at: this.getNextTime(),
        },
      },
    });
  }
}

module.exports = DataGenerator;

