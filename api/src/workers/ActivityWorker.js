'use strict';

const Worker = require('core/Worker');
const postModel = require('models/PostModel');
const userModel = require('models/UserModel');
const userActivityModel = require('models/UserActivityModel');
const QueueWorkers = require('middleware/QueueWorkers');

class ActivityWorker extends Worker {
  constructor() {
    super('activity');

    //this.on('CREATE_POST_EVENT', this.onCreatePost);
    this.on('CREATE_COMMENT_EVENT', this.onCreateComment);

    this.on('REPORT_COMMENT_EVENT', this.onReportComment);
    this.on('REPORT_POST_EVENT', this.onReportPost);
    this.on('REPORT_PROFILE_EVENT', this.onReportProfile);
    this.on('BLOCK_PROFILE_EVENT', this.onBlockProfile);
  }

  onReportComment(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty('commentID')) {
      console.error('onReportComment', 'missing commentID');
      return;
    }

    userModel
      .getUserByID(data.userID)
      .error(console.error.bind(console))
      .then((accept, reject, User) => {
        if (!User) return reject('user not found');
        accept(User);
      })
      .then((accept, reject) => {
        postModel
          .getComment(data.commentID).done(accept).error(reject);
      })
      .done((user, reporter, data) => {
        let text = [
          `User ${reporter.firstName} ${reporter.lastName} _(${reporter.userID})_`,
          `reported a comment _(${data.comment.properties.commentID})_ *"${data.comment.properties.content}"*`,
          `by ${data.commentAuthor.firstName} ${data.commentAuthor.lastName} _(${data.commentAuthor.userID})_`,
          `on a post _(${data.post.postID})_ "${data.post.content}"`,
          `by ${data.postAuthor.firstName} ${data.postAuthor.lastName} _(${data.postAuthor.userID})_`,
        ].join(' ');

        QueueWorkers.notification('N_REPORT', { text });
      });
  }

  onReportPost(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty('postID')) {
      console.error('onReportPost', 'missing postID');
      return;
    }

    userModel
      .getUserByID(data.userID)
      .error(console.error.bind(console))
      .then((accept, reject, User) => {
        if (!User) return reject('user not found');
        accept(User);
      })
      .then((accept, reject) => {
        postModel
          .getPost(data.postID).done(accept).error(reject);
      })
      .done((user, reporter, post) => {
        let text = [
          `User ${reporter.firstName} ${reporter.lastName} _(${reporter.userID})_`,
          `reported a post _(${post.post.postID})_`,
          `*"${post.post.content}"*`,
          `from ${post.creator.firstName} ${post.creator.lastName} _(${post.creator.userID})_`,
        ].join(' ');

        QueueWorkers.notification('N_REPORT', { text });
      });
  }

  onReportProfile(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty('reportedUserID')) {
      console.error('onReportProfile', 'missing reportedUserID');
      return;
    }

    userModel
      .getUserByID(data.userID)
      .error(console.error.bind(console))
      .then((accept, reject, User) => {
        if (!User) return reject('user not found');
        accept(User)
      })
      .then((accept, reject) => {
        userModel
          .getUserByID(data.reportedUserID).done(accept).error(reject);
      })
      .done((user, reporter, otherUser) => {
        let text = [
          `User ${reporter.firstName} ${reporter.lastName} _(${reporter.userID})_`,
          `*reported another user*`,
          `${otherUser.firstName} ${otherUser.lastName} _(${otherUser.userID})_`,
        ].join(' ');

        QueueWorkers.notification('N_REPORT', { text });
      });

  }

  onBlockProfile(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty('blockedUserID')) {
      console.error('onBlockProfile', 'missing blockedUserID');
      return;
    }

    userModel
      .getUserByID(data.userID)
      .error(console.error.bind(console))
      .then((accept, reject, User) => {
        if (!User) return reject('user not found');
        accept(User);
      })
      .then((accept, reject) => {
        userModel
          .getUserByID(data.blockedUserID).done(accept).error(reject);
      })
      .done((user, reporter, otherUser) => {
        let text = [
          `User ${reporter.firstName} ${reporter.lastName} _(${reporter.userID})_`,
          `*BLOCKED another user*`,
          `${otherUser.firstName} ${otherUser.lastName} _(${otherUser.userID})_`,
        ].join(' ');

        QueueWorkers.notification('N_REPORT', { text });
      });
  }

  onCreateComment(msg, id) {
    let data = msg.data;
    if (!data.hasOwnProperty('commentID')) {
      console.error('onCreateComment', 'missing commentID');
      return;
    }

    postModel
      .getCommentData(data.commentID)
      .error(console.error.bind(console))
      .then((accept, reject, commentData) => { //notify post creator
        if (!commentData) return reject('could not find comment', commentData)

        let userID = commentData.userID;
        let commentID = commentData.commentID;
        let postID = commentData.postID;
        let authorID = commentData.authorID;


        if (authorID === userID) {
          accept(commentData);
        } else {
          userActivityModel.createActivity('N_COMMENT', userID, authorID, { postID, commentID }).done(activityID => {
            QueueWorkers.notification('N_COMMENT', { activityID });
            accept(commentData);
          }).error(reject);
        }

      }).then((accept, reject, commentData) => { //notify users who commented
      let userID = commentData.userID;
      let commentID = commentData.commentID;
      let postID = commentData.postID;
      let authorID = commentData.authorID;

      userActivityModel.getInteractionsWithPost(postID).done((userArr) => {
        Promise.all(
          userArr
            .filter(nextUserID => nextUserID !== authorID && nextUserID !== userID) //dont send to comment creator or comment author
            .map((nextUserID) => {
              new Promise((pAccept) => {
                userActivityModel.createActivity('N_REPLY', nextUserID, authorID, {
                  postID,
                  commentID
                }).done(activityID => {
                  QueueWorkers.notification('N_REPLY', { activityID });
                  pAccept(true)
                }).error(() => pAccept(false));
              })
            })
        ).then(() => accept(commentData))
      });

    })

  }

}


module.exports = ActivityWorker;
