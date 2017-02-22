'use strict';

const moment = require('core/AppMoment');
const Sequence = require('impossible-promise');
const Model = require('core/Model');


function _parseAuthorObject(obj) {
  return {
    userID: obj.userID,
    username: [obj.firstName, obj.lastName].join(" "),
    imageSource: obj.imageSource,
  }
}

function _parsePostObject(obj, type, author) {
  return {
    postID: obj.postID,
    postType: type,
    content: obj.content,
    createdAt: obj.at,
    createdAtSince: moment(obj.at).fromNow(),
    location: obj.location,
    author: _parseAuthorObject(author),
  }
}

function _parseCommentObject(obj, author) {
  return {
    commentID: obj.commentID,
    content: obj.content,
    createdAt: obj.at,
    createdAtSince: moment(obj.at).fromNow(),
    author: _parseAuthorObject(author),
  }
}

function _getActivityText(obj) {
  switch (obj.type) {
    case 'N_COMMENT':
      return `commented on your post`;
    case 'N_FOLLOW':
      return `is now following you!`;
    case 'N_REPLY':
      return `has replied to your comment!`;
    default:
      return '';
  }
}

function _parseActivityRow(row, flag_parsePerson) {
  var ActivityRow = {
    activityID: row.activity.activityID,
    type: row.activity.type,
    time: moment(row.activity.at).fromNow(),
    timeAt: row.activity.at,
    userID: row.person.userID,
    isNew: !!row.activity.isNew,
    isRead: !!row.activity.isRead,
    actor: row.actor ? _parseAuthorObject(row.actor) : null,
    groupBy: false,
    target: {},
  };

  //has target Post
  if (row.target_post) {
    ActivityRow.groupBy = row.target_post.postID;
    ActivityRow.target.Post = _parsePostObject(row.target_post, row.postType, row.target_post_author);
  }

  //has target Comment
  if (row.target_comment) {
    ActivityRow.target.Comment = _parseCommentObject(row.target_comment.properties, row.actor);
  }

  //has person
  if (row.person && flag_parsePerson) {
    ActivityRow.person = _parseAuthorObject(row.person)
    ActivityRow.person.notificationEndpoint = row.person.notificationEndpoint
  }

  //ASSIGN TEXT
  ActivityRow.text = _getActivityText(ActivityRow);

  return ActivityRow;
}

class UserActivityModel extends Model {


  createActivity(type, userID, authorID, target) {

    var nodeID;
    let at = Date.now();
    var activity = {
      type,
      isRead: false,
      isNew: true,
      at: Date.now(),
    }

    //if the activity points to a comment, set it as property (cant do edge->edge relations)
    if (target.hasOwnProperty('commentID')) {
      activity.commentID = target.commentID
    }

    return new Sequence((accept, reject) => { //create new activity
      this.db.save(activity, 'Activity', (err, activityNode) => {
        if (err) return reject(err);
        accept(activityNode);
      });
    }).then((accept, reject, activityNode) => { //add activity to the activity stream
      this.db.getOne(
        `MATCH (user:Person { userID: {userID}})
        OPTIONAL MATCH (:Person { userID: {userID}})-[link:ACTIVITY_FEED]->(latest:Activity)
        RETURN id(user) as user_index, 
               id(link) as activity_index, 
               id(latest) as latest_activity_index,
               link`,
        { userID }
      ).then((next, nope, ids) => Promise.all([
        new Promise((innerAccept, innerReject) => {//update ActivityID
          let Link = ids.link ? ids.link : ({ start: ids.user_index, end: activityNode.id, id: 0 })
          nodeID = this.db.encodeEdgeID(Object.assign(Link, { properties: { at } }));
          this.db.save(activityNode, 'activityID', nodeID, (err, node) => {
            if (err) return innerReject(err);
            innerAccept(node);
          })
        }),
        new Promise((innerAccept, innerReject) => { //remove old relation
          if (!ids.activity_index) return innerAccept(false)
          this.db.rel.delete(ids.activity_index, (err) => {
            if (err) return innerReject(err);
            innerAccept(true)
          })
        }),
        new Promise((innerAccept, innerReject) => //relate new activity
          this.db.rel.create(ids.user_index, 'ACTIVITY_FEED', activityNode, (err) => {
            if (err) return innerReject(err);
            innerAccept(true)
          })),
        new Promise((innerAccept, innerReject) => { //relate old activity
          if (!ids.latest_activity_index) return innerAccept(false)
          this.db.rel.create(activityNode, 'ACTIVITY_NEXT', ids.latest_activity_index, (err) => {
            if (err) return innerReject(err);
            innerAccept(true)
          })
        }),
      ]).then((a) => accept(activityNode)).catch(reject)).error(reject)

    }).then((accept, reject, activityNode) => {
      //set (Activity)-[actor]->(Person), linking the activity to a Person
      this.db.getOne(`MATCH (author:Person {userID: {authorID}}) RETURN id(author) as author_index`,
        { authorID }
      ).done((row) => {
        this.db.rel.create(activityNode, 'ACTOR', row.author_index, (err) => {
          if (err) return reject(err);
          accept(activityNode);
        })
      }).error(reject);
    }).then((accept, reject, activityNode) => {
      //set (Activity)-[actor]->(Post), linking the activity to a Post
      if (target.hasOwnProperty('postID')) {
        this.db.getOne(`MATCH (post:Post {postID: {postID}}) RETURN id(post) as post_index`,
          { postID: target.postID }
        ).done((row) => {
          this.db.rel.create(activityNode, 'TARGET', row.post_index, (err) => {
            if (err) return reject(err);
            accept(activityNode);
          })
        }).error(reject);
      } else {
        accept(false)
      }
    }).done(() => nodeID);
  }

  getInteractionsWithPost(postID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (u:Person)-[:COMMENTS]->(:Post {postID: {postID}}) 
         RETURN distinct u.userID as userID`,
        { postID }, (err, data) => {
          if (err) return reject(err);
          accept(data.map(i => i.userID));
        });
    })
  }

  getUserActivityCount(userID) {
    return this.db.getOne(
      `MATCH (p:Person {userID: {userID}})-[:ACTIVITY_FEED]->()-[:ACTIVITY_NEXT*0..99999]->(a:Activity)
         WHERE (a.isRead = false or a.isNew = true)
         AND NOT (p)-[:BLOCKED]-(:Person)<-[:ACTOR]-(a)
         RETURN sum(CASE WHEN a.isRead = false THEN 1 ELSE 0 END) as unRead,
                sum(CASE WHEN a.isNew = true THEN 1 ELSE 0 END) as unSeen`,
      { userID });
  }

  setAsRead(activityID) {
    return this.db.getOne(
      `MATCH (a:Activity {activityID: {activityID}})
         SET a.isRead = true
      RETURN count(a)`,
      { activityID })
  }

  setAsSeen(userID) {
    return this.db.getOne(
      `MATCH (p:Person {userID: {userID}})-[:ACTIVITY_FEED]->()-[:ACTIVITY_NEXT*0..9999]->(a:Activity {isNew:true})
           SET a.isNew = false
        RETURN count(a);`,
      { userID });
  }

  getUserActivities(userID) {

    let limitStart = 0;
    let limitEnd = 100;

    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (u:Person {userID: {userID}})-[:ACTIVITY_FEED]->()-[:ACTIVITY_NEXT*${limitStart}..${limitEnd}]->(a:Activity)
         WHERE NOT (u)-[:BLOCKED]-(:Person)<-[:ACTOR]-(a)
         WITH a, u
        
        OPTIONAL MATCH (a)-[:TARGET]->(target_post:Post)<-[target_post_rel:ASKS|OFFERS]->(target_post_author:Person)
        OPTIONAL MATCH (a)-[:ACTOR]->(actor:Person)

        OPTIONAL MATCH (a)-[:TARGET]->(target_post:Post)<-[target_comment:COMMENTS]-(:Person)<-[:ACTOR]-(a)
        WHERE target_comment.commentID = a.commentID

        RETURN u as person,
               a as activity, 
               actor, 
               target_post, type(target_post_rel) as postType, 
               target_post_author, 
               target_comment
        ORDER BY a.at DESC`,
        { userID },
        (err, activity) => {
          if (err) return reject(err);
          return accept(activity);
        }
      );
    }).then((accept, reject, rows) => {
      if (!rows) { return reject('empty activity'); }
      return accept(rows.map(_parseActivityRow));
    }).done((result, ActivityArray) => ActivityArray);
  }

  getUserActivityByID(activityID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (a:Activity {activityID: {activityID}}) 
          WITH a
         OPTIONAL MATCH (u:Person)-[:ACTIVITY_FEED]->(a:Activity)
         OPTIONAL MATCH (u:Person)-[:ACTIVITY_FEED]->()-[:ACTIVITY_NEXT*]->(a:Activity) 
        
         OPTIONAL MATCH (a)-[:TARGET]->(target_post:Post)<-[target_post_rel:ASKS|OFFERS]->(target_post_author:Person)
         OPTIONAL MATCH (a)-[:ACTOR]->(actor:Person)

         OPTIONAL MATCH (a)-[:TARGET]->(target_post:Post)<-[target_comment:COMMENTS]-(:Person)<-[:ACTOR]-(a)
        WHERE target_comment.commentID = a.commentID

        RETURN u as person,
               a as activity, 
               actor, 
               target_post, type(target_post_rel) as postType, 
               target_post_author, 
               target_comment`,
        { activityID },
        (err, activity) => {
          if (err) return reject(err);
          if (!activity || activity.length < 1) return reject(`did not find activity ${activityID}`);
          accept(activity.pop());
        }
      );
    }).then((accept, reject, rows) => {
      if (!rows) return reject('empty activity')
      accept(_parseActivityRow(rows, true));
    }).done((result, ActivityArray) => {
      return ActivityArray
    }).error(console.log.bind(console));
  }
}

module.exports = new UserActivityModel();
