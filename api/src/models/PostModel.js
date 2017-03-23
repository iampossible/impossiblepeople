'use strict';

const Sequence = require('impossible-promise');
const Model = require('core/Model');
const userModel = require('models/UserModel');

class PostModel extends Model {

  createPost(userNode, relation, post) {
    return new Sequence(
      (next, reject) => {
        this.db.save(post, 'Post', (err, postNode) => {
          if (err) return reject(err);
          next(postNode);
        });
      })
      .then((next, reject, postNode) => {
        this.db.relate(userNode, relation, postNode, { at: Date.now() }, (err, userPostEdge) => {
          if (err) return reject(err);
          next({ postNode, userPostEdge });
        });
      })
      .then((next, reject, result) => {
        let nodeID = this.db.encodeEdgeID(result.userPostEdge);
        this.db.save(result.postNode, 'postID', nodeID, (err, postNode) => {
          if (err) return reject(err);
          next(postNode);
        });
      })
      .then((next, reject, postNode) => {
        this.db.query(
          `MATCH (p:Post {postID: {postID}}), (i:Interest {interestID: {interestID}})
           MERGE (p) -[r:IS_ABOUT]-> (i)
           ON CREATE SET r.at = timestamp()`,
          { postID: postNode.postID, interestID: post.interestID },
          (error, postInterestEdge) => {
            if (error) return reject(error);
            next({ postNode, postInterestEdge });
          }
        );
      })
      .done((createdNode, creatorObj, finalNode, interestObj) => {
        //asign user to interest
        //TODO: MOVE TO QUEUE ASYNC JOBS
        setTimeout(() => {
          userModel.addInterests(userNode, [{ interestID: post.interestID }]);
        }, 333);

        return finalNode;
      })
      .error(e => {
        console.error(`Error PostModel: ${e}`);
      });
  }

  createComment(userNode, commentText, postID) {
    return this
      .getPost(postID, userNode.userID)
      .then((next, reject, postNode) => {
        if (postNode.post.resolved) {
          reject('Post is resolved');
        } else {
          let newComment = {
            content: commentText,
            at: Date.now(),
          };

          this.db.relate(userNode, 'COMMENTS', postNode.post, newComment, (err, relEdge) => {
            if (err) {
              reject(err);
            } else {
              next(relEdge);
            }
          });
        }
      })
      .then((next, reject, relEdge) => {
        let commentID = this.db.encodeEdgeID(relEdge);
        this.db.rel.update(relEdge, 'commentID', commentID, (err) => {
          if (err) {
            reject(err);
          } else {
            next(commentID);
          }
        });
      }).done((postNode, relEdge, commentID) => ({
        commentID,
        content: relEdge.properties.content,
        at: relEdge.properties.at,
      }));
  }

  getComments(postID, userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (post:Post {postID: {postID}}) <-[rel:COMMENTS]- (user:Person) 
          WHERE NOT (:Person {userID: {userID}}) -[:BLOCKED]- (user)
          RETURN post, rel, user 
          ORDER BY rel.at ASC`,
        { postID, userID },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            accept(data);
          }
        }
      );
    });
  }

  getCommentData(commentID) {
    return this.db.getOne(
      `MATCH (u:Person)-[c:COMMENTS {commentID: {commentID}}]->(p)<-[:ASKS|OFFERS]-(a:Person) 
        RETURN u.userID as authorID, 
        c.commentID as commentID, 
        p.postID as postID, 
        a.userID as userID`,
      { commentID }
    );
  }

  getComment(commentID) {
    return this.db.getOne(
      `MATCH (u:Person)-[c:COMMENTS {commentID: {commentID}}]->(p)<-[:ASKS|OFFERS]-(a:Person) 
        RETURN u as commentAuthor, 
        c as comment, 
        p as post, 
        a as postAuthor`,
      { commentID }
    );
  }

  getPost(postID, userID) {
    return this.db.getOne(
      `MATCH (creator:Person) -[rel:ASKS|:OFFERS]-> (post:Post {postID: {postID}}) -[:IS_ABOUT]-> (category:Interest)
        WHERE NOT (:Person {userID: {userID}}) -[:BLOCKED]- (creator)
        RETURN creator, rel, post, category`,
      { postID, userID }
    );
  }

  postBelongsToUser(userID, postID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        'MATCH(u:Person {userID: {userID}}) -[:OFFERS|:ASKS]->(p:Post {postID: {postID}}) RETURN p, count(*)',
        { userID, postID },
        (err, data) => {
          if (err) return reject(err);
          if (data.length === 0) return reject('permission denied');

          return accept();
        }
      );
    });
  }

  reportPost(postID, userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (p:Post {postID: {postID}}), (u:Person {userID: {userID}})
         MERGE (u)-[r:REPORT_POST]->(p)
         ON CREATE SET r.at = timestamp()
         RETURN r`,
        { postID, userID },
        (err) => {
          if (err) {
            reject(err);
          } else {
            accept(true);
          }
        }
      );
    });
  }

  reportComment(postID, commentID, userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (p:Post {postID: {postID}}), (u:Person {userID: {userID}})
         MERGE (u)-[r:REPORT_COMMENT]->(p)
         ON CREATE SET r.at = timestamp(), r.commentID = {commentID}
         RETURN r`,
        { postID, userID, commentID },
        (err) => {
          if (err) {
            reject(err);
          } else {
            accept(true);
          }
        }
      );
    });
  }

  deletePost(postID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        'MATCH (p:Post {postID: {postID}}) DETACH DELETE p;',
        { postID },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            accept(data);
          }
        }
      );
    });
  }

  resolvePost(postID) {
    return this.db.getOne(
      'MATCH (p:Post{postID: { postID }}) SET p.resolved = true RETURN p;',
      { postID }
    );
  }
}

module.exports = new PostModel();
