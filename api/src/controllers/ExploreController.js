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

    this.route('searchExplore', {
      method: 'GET',
      path: '/api/explore/{name}/search/{search}',
      auth: 'session',
      handler: this.searchExplore,
    });
  }

  getInterest(request, reply) {
    return exploreModel.get(request.params.name).done((data) => {
      reply.response(data.map(node => ({
        postID: node.post.postID, 
        postType: node.rel.type, 
        content: node.post.content, 
        timeRequired: node.post.timeRequired || 0, 
        location: node.post.location, 
        resolved: node.post.resolved || false, 
        createdAt: node.rel.properties.at, 
        createdAtSince: moment(node.rel.properties.at).fromNow(), 
        commentCount: node.commentCount, 
        author: {
          userID: node.creator.userID, 
          username: `${node.creator.firstName} ${node.creator.lastName}`, 
          imageSource: node.creator.imageSource, 
          //isFriend: node.isFriend,
          /*commonFriends: node.commonFriends.map((friend) => ({ 
            userID: friend.userID,
            username: `${friend.firstName} ${friend.lastName}`,
            imageSource: friend.imageSource,
          }))*/
        },
        category: {
          interestID: node.category.interestID, 
          name: node.category.name, 
          image: node.category.image || null, 
        },
      })));
    }).error(e => {
      reply({ msg: e }).code(500);
      console.error('Explore could not be fetched for ', request.params.name);
    });
  }

  searchExplore(request, reply){
    return exploreModel.search(request.params.name,  '.*\\s('+request.params.search+')\\s.*|^('+request.params.search+')\\s.*|.*\\s('+request.params.search+')$').done((data) => {
      reply.response(data.map(node => ({
        postID: node.post.postID, 
        postType: node.rel.type, 
        content: node.post.content, 
        timeRequired: node.post.timeRequired || 0, 
        location: node.post.location, 
        resolved: node.post.resolved || false, 
        createdAt: node.rel.properties.at, 
        createdAtSince: moment(node.rel.properties.at).fromNow(), 
        commentCount: node.commentCount, 
        author: {
          userID: node.creator.userID, 
          username: `${node.creator.firstName} ${node.creator.lastName}`, 
          imageSource: node.creator.imageSource, 
          //isFriend: node.isFriend,
          /*commonFriends: node.commonFriends.map((friend) => ({ 
            userID: friend.userID,
            username: `${friend.firstName} ${friend.lastName}`,
            imageSource: friend.imageSource,
          }))*/
        },
        category: {
          interestID: node.category.interestID, 
          name: node.category.name, 
          image: node.category.image || null, 
        },
      })));
    }).error(e => {
      reply({ msg: e }).code(500);
      console.error('Explore search could not be fetched for ', request.params.name, request.params.search);
    });
  }
}

module.exports = new ExploreController();
