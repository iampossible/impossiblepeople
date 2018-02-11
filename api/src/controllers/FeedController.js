"use strict";

const moment = require("core/AppMoment");

const Controller = require("core/Controller");
const feedModel = require("models/FeedModel");

class FeedController extends Controller {
  constructor() {
    super();

    this.route("getFeed", {
      method: "GET",
      path: "/api/feed",
      auth: "session",
      handler: this.getMainFeed
    });
  }

  getMainFeed(request, reply) {
    return feedModel
      .get(request.auth.credentials.userID)
      .done(data => {
        reply.response(
          data.map(node => ({
            postID: node.post.postID,
            postType: node.rel.type,
            content: node.post.content,
            timeRequired: node.post.timeRequired || 0,
            location: node.post.location,
            resolved: node.post.resolved || false,
            createdAt: node.rel.properties.at,
            createdAtSince: moment(node.rel.properties.at).fromNow(),
            //included imageSource, url and commentCount to be returned as part of the feed
            imageSource: node.post.imageSource,
            url: node.post.url,
            commentCount: node.commentCount,
            author: {
              //temporary as we have data in the db that doesn't have organisationName
              organisationName: node.creator.organisationName
                ? node.creator.organisationName
                : "",
              userID: node.creator.userID,
              username: `${node.creator.firstName} ${node.creator.lastName}`,
              imageSource: node.creator.imageSource,
              isFriend: node.isFriend,
              commonFriends: node.commonFriends.map(friend => ({
                userID: friend.userID,
                username: `${friend.firstName} ${friend.lastName}`,
                imageSource: friend.imageSource
              }))
            },
            interests: node.interests.map(interest => ({
              interestID: interest.interestID,
              name: interest.name,
              image: interest.image || null
            }))
          }))
        );
      })
      .error(e => {
        reply({ msg: e }).code(500);
        console.error(
          "Feed could not be fetched for ",
          request.auth.credentials.userID
        );
      });
  }
}

module.exports = new FeedController();
