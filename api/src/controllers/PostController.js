'use strict';

const Joi = require('joi');
const moment = require('core/AppMoment');
const Controller = require('core/Controller');
const postModel = require('models/PostModel');
const Sequence = require('impossible-promise');
const QueueWorkers = require('middleware/QueueWorkers');

class PostController extends Controller {

  constructor() {
    super();

    this.route('createPost', {
      method: 'POST',
      path: '/api/post/create',
      auth: 'session',
      handler: this.createPostHandler,
      validate: {
        postType: Joi.string().regex(/^(OFFERS|ASKS)$/).required(),
        content: Joi.string().min(3).required(),
        location: Joi.string(),
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
        timeRequired: Joi.number().integer(),
        interestID: Joi.string().required(),
      },
    });

    this.route('getPost', {
      method: 'GET',
      path: '/api/post/{id}',
      handler: this.getPostHandler,
      auth: 'session',
    });

    this.route('createComment', {
      method: 'POST',
      path: '/api/post/{id}/comment',
      auth: 'session',
      handler: this.createCommentHandler,
      validate: {
        content: Joi.string().min(3).required(),
      },
    });

    this.route('deletePost', {
      path: '/api/post/{postID}',
      handler: this.deletePostHandler,
      method: 'DELETE',
      auth: 'session',
      validateParams: {
        postID: Joi.string().alphanum(),
      },
    });

    this.route('reportPost', {
      method: 'GET',
      path: '/api/post/{postID}/report',
      auth: 'session',
      handler: this.reportPostHandler,
      validateParams: {
        postID: Joi.string().alphanum(),
      },
    });

    this.route('reportComment', {
      method: 'GET',
      path: '/api/post/comment/{commentID}/report',
      auth: 'session',
      handler: this.reportCommentHandler,
      validateParams: {
        commentID: Joi.string().alphanum(),
      },
    });

    this.route('resolvePost', {
      method: 'GET',
      path: '/api/post/{postID}/resolve',
      auth: 'session',
      handler: this.resolvePostHandler,
      validateParams: {
        postID: Joi.string().alphanum(),
      },
    });

  }

  createCommentHandler(request, reply) {
    const content = request.payload.content;
    const postID = request.params.id;
    postModel
      .createComment(request.auth.credentials, content, postID)
      .done((comment) => {
        QueueWorkers.activity('CREATE_COMMENT_EVENT', {
          commentID: comment.commentID
        });

        reply({
          content: comment.content,
          commentID: comment.commentID,
          at: comment.at,
        }).code(200);
      })
      .error(msg => reply({ msg }).code(500));
  }

  createPostHandler(request, reply) {
    postModel.createPost(request.auth.credentials, request.payload.postType, {
      content: request.payload.content,
      location: request.payload.location,
      latitude: request.payload.latitude,
      longitude: request.payload.longitude,
      timeRequired: request.payload.timeRequired || 0,
      interestID: request.payload.interestID,
    })
      .error(e => reply({ msg: e }).code(400))
      .done((postNode) => {
        QueueWorkers.activity('CREATE_POST_EVENT', { postID: postNode.postID })
        reply(postNode).code(200);
      });
  }

  getPostHandler(request, reply) {
    const userID = request.auth.credentials.userID;

    new Sequence((accept, reject) => {
      postModel
        .getPost(request.params.id, userID)
        .error(reject)
        .done(accept);
    })
      .then((accept, reject, postNode) => {
        if (!postNode) {
          reject('post not found');
        } else {
          postModel
            .getComments(request.params.id, userID)
            .error(reject)
            .done(accept);
        }
      })
      .error((e) => {
        reply({ msg: e }).code(e === 'post not found' ? 404 : 400);
      })
      .done((postNode, commentRows) => {
        var post = {
          postID: postNode.post.postID,
          postType: postNode.rel.type,
          content: postNode.post.content,
          timeRequired: postNode.post.timeRequired || 0,
          createdAt: postNode.rel.properties.at,
          createdAtSince: moment(postNode.rel.properties.at).fromNow(),
          location: postNode.post.location,
          resolved: postNode.post.resolved || false,
          category: {
            interestID: postNode.category.interestID,
            name: postNode.category.name,
            image: postNode.category.image || null,
          },
          author: {
            userID: postNode.creator.userID,
            username: `${postNode.creator.firstName} ${postNode.creator.lastName}`,
            imageSource: postNode.creator.imageSource,
          },
          comments: commentRows.map(row => ({
            commentID: row.rel.properties.commentID,
            content: row.rel.properties.content,
            author: `${row.user.firstName} ${row.user.lastName}`,
            authorID: row.user.userID,
            imageSource: row.user.imageSource,
            createdAt: row.rel.properties.at,
            createdAtSince: moment(row.rel.properties.at).fromNow(),
          })),
        };
        reply(post).code(200);
      });
  }

  deletePostHandler(request, reply) {
    const postID = request.params.postID;
    const userID = request.auth.credentials.userID;

    postModel
      .postBelongsToUser(userID, postID)
      .then((accept, reject) => {
        postModel.deletePost(postID).error(reject).done(accept);
      })
      .error((e) => {
        if (e === 'permission denied') {
          reply({}).code(403);
        } else {
          reply({ msg: e }).code(500);
        }
      })
      .done(() => {
        reply({}).code(200);
      });
  }

  reportPostHandler(request, reply) {

    const postID = request.params.postID;
    const userID = request.auth.credentials.userID;

    postModel
      .getPost(postID, userID)
      .error(e => {
        reply({ msg: e }).code(e === 'post not found' ? 404 : 400);
      })
      .then((accept, reject, postNode) => {
        if (!postNode) {
          return reject('post not found');
        }

        if (postNode.creator.userID === userID) {
          return reject('post bellongs to user');
        }

        postModel.reportPost(postID, userID).done(accept);
      })
      .done(() => {
        QueueWorkers.activity('REPORT_POST_EVENT', { userID, postID });

        reply({
          postID,
          msg: 'Thank you! We will review the post shortly.'
        }).code(200);
      });

  }

  reportCommentHandler(request, reply) {

    const commentID = request.params.commentID;
    const userID = request.auth.credentials.userID;

    postModel
      .getCommentData(commentID)
      .error(e => {
        reply({ msg: e }).code(e === 'comment not found' ? 404 : 400);
      })
      .then((accept, reject, commentNode) => {
        if (!commentNode) {
          return reject('comment not found');
        }
        if (commentNode.authorID === userID) {
          return reject('comment bellongs to user');
        }
        postModel.reportComment(commentNode.postID, commentNode.commentID, userID).done(accept);
      })
      .done(() => {
        QueueWorkers.activity('REPORT_COMMENT_EVENT', { userID, commentID });

        reply({
          commentID,
          msg: 'Thank you for your report!'
        }).code(200);
      });
  }

  resolvePostHandler(request, reply) {
    const postID = request.params.postID;
    const userID = request.auth.credentials.userID;

    postModel
      .postBelongsToUser(userID, postID)
      .then((accept, reject) => {
        postModel.resolvePost(postID).error(reject).done(accept);
      })
      .error((e) => {
        if (e === 'permission denied') {
          reply({}).code(403);
        } else {
          reply({ msg: e }).code(500);
        }
      })
      .done((data) => {
        reply(data).code(200);
      });
  }

}

module.exports = new PostController();
