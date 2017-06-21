'use strict';

const moment = require('core/AppMoment');
const Controller = require('core/Controller');
const exploreModel = require('models/ExploreModel');

class ExploreController extends Controller {

  constructor() {
    super();

    this.route('getExplore', {
      method: 'GET',
      path: '/api/explore/{name}',
      auth: 'session',
      handler: this.getInterest,
    });
  }

  getInterest(request, reply) {
    console.log('explore controler ', request.params.name);
    return exploreModel.get(request.params.name).done((data) => {
      reply.response(data.map(node => ({
        postID: node.post.postID, //check
        postType: node.rel.type, //???
        content: node.post.content, //check
        timeRequired: node.post.timeRequired || 0, //check
        location: node.post.location, //??? on creator
        resolved: node.post.resolved || false, //???
        createdAt: node.rel.properties.at, //check
        createdAtSince: moment(node.rel.properties.at).fromNow(), //check
        commentCount: node.commentCount, //check
        author: {
          userID: node.creator.userID, //check
          username: `${node.creator.firstName} ${node.creator.lastName}`, //check
          imageSource: node.creator.imageSource, //check
          //isFriend: node.isFriend,
          /*commonFriends: node.commonFriends.map((friend) => ({ //check
            userID: friend.userID,
            username: `${friend.firstName} ${friend.lastName}`,
            imageSource: friend.imageSource,
          }))*/
        },
        category: {
          interestID: node.category.interestID, //check
          name: node.category.name, //check
          image: node.category.image || null, //check
        },
      })));
    }).error(e => {
      reply({ msg: e }).code(500);
      console.error('Explore could not be fetched for ', request.params.name);
    });
  }
}

module.exports = new ExploreController();
