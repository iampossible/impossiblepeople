'use strict';

const Sequence = require('impossible-promise');
const Model = require('core/Model');
const config = require('config/server');

const maxDistance = 25;  // km

const locationSearch = config.settings.feed_use_location ? `(
  post.location = user.location 
  OR
  2 * 6371 * ASIN(SQRT(HAVERSIN(RADIANS(user.latitude - post.latitude)) + COS(RADIANS(user.latitude))* COS(RADIANS(post.latitude)) * HAVERSIN(RADIANS(user.longitude - post.longitude)))) < {maxDistance}
)` : '(true)';


class FeedModel extends Model {
  get(userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (:Person {userID: {userID}}) -[:FOLLOWS]-> (friend:Person)
         RETURN COUNT(DISTINCT friend) AS friendCount`,
        { userID },
        (err, response) => {
          if (err) return reject(err);
          return accept(response.pop().friendCount);
        }
      );
    }).then((accept, reject, friendCount) => {
      if (friendCount === 0) {
        this._getFeedWithoutFriends(userID).done(accept);
      } else {
        this._getFeedWithFriends(userID).done(accept);
      }
    }).done((friendCount, result) => result);
  }

  _getFeedWithFriends(userID) {
    return new Sequence((accept, reject) => this.db.query(
      `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest),
             (user:Person {userID: {userID}}),
             (user) -[:FOLLOWS]-> (friend:Person)
       WHERE NOT (user) -[:BLOCKED]- (creator)
         AND (
          creator = user 
          OR creator = friend       
          OR (user) -[:FOLLOWS]-> (friend) -[:FOLLOWS]-> (creator) -[:FOLLOWS]-> (friend) -[:FOLLOWS]-> (user)
          OR (${locationSearch} AND (user) -[:INTERESTED_IN]-> (category))
         ) 
            
       OPTIONAL MATCH (post)<-[comments:COMMENTS]-(commenter:Person)
            WHERE NOT (user) -[:BLOCKED]- (commenter)
        
       OPTIONAL MATCH (commonFriend:Person) -[:FOLLOWS]-> (friend_of_friend:Person) -[:FOLLOWS]-> (commonFriend) -[:FOLLOWS]-> (user) -[:FOLLOWS]-> (commonFriend) 
          WHERE creator = friend_of_friend
          AND NOT commonFriend:Invitee
      
        RETURN creator, rel, post, category, 
            creator.userID in COLLECT(friend.userID) as isFriend,
            COUNT( DISTINCT comments) AS commentCount, 
            COLLECT( DISTINCT commonFriend) AS commonFriends
        ORDER BY rel.at DESC`,
      { userID, maxDistance },
      (err, response) => {
        if (err) return reject(err);
        return accept(response);
      })
    );
  }

  _getFeedWithoutFriends(userID) {
    return new Sequence((accept, reject) => this.db.query(
      `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest),
             (user:Person {userID: {userID}})  
       WHERE NOT (user)-[:BLOCKED]-(creator)
         AND ( 
          creator = user 
          OR (${locationSearch} AND (user) -[:INTERESTED_IN]-> (category))
         ) 
          
       OPTIONAL MATCH (post) <-[comments:COMMENTS]- (:Person)
       
       RETURN creator, rel, post, category,
          COUNT( DISTINCT comments) AS commentCount,
          [] AS commonFriends
          
       ORDER BY rel.at DESC`,
      { userID, maxDistance },
      (err, response) => {
        if (err) return reject(err);
        return accept(response);
      })
    );
  }

}

module.exports = new FeedModel();
