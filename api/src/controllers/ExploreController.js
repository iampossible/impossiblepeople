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

    this.route('exploreNearMe', {
      method: 'GET',
      path: '/api/explore/{name}/nearme',
      auth: 'session',
      handler: this.exploreNearMe,
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
    //(?ism).*term.*
    let regex = '(?ism).*'+request.params.search+'.*';
    const searchFn = request.params.name !== '_' ? exploreModel.searchInterest(request.params.name, regex): exploreModel.search(regex);
    return searchFn.done((data) => {
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

  exploreNearMe(request, reply) {
    const nearmeFn = request.params.name !== '_' ? exploreModel.nearMeInterest(request.auth.credentials.userID, request.params.name): exploreModel.nearMe(request.auth.credentials.userID);
    return nearmeFn.done((data) => {
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
}

module.exports = new ExploreController();
