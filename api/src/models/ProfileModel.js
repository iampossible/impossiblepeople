'use strict';

const Model = require('core/Model');
const Sequence = require('impossible-promise');

class ProfileModel extends Model {

  getProfile(userID, currentUserID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (p:Person {userID: {userID}})
        OPTIONAL MATCH (p) <-[r:FOLLOWS]- (u:Person {userID: {currentUserID}})
        WHERE NOT p:Invitee
        RETURN {
          user: {
            userID: p.userID,
            firstName: p.firstName,
            lastName: p.lastName,
            biography: p.biography,
            location: p.location,
            latitude: p.latitude,
            longitude: p.longitude,
            imageSource:p.imageSource,
            url:p.url,
            following: SIGN(COUNT(r))
          }
        }`,
        { userID, currentUserID },
        (err, user) => {
          if (err) return reject(err);
          accept(user[0]);
        }
      );
    });
  }

  connectProfiles(followerID, followeeID) {
    if (followerID === followeeID) {
      return new Sequence();
    }

    return this._updateFollowing(
      followerID,
      followeeID,
      `MATCH (u1:Person { userID: { followerID } }), (u2:Person { userID: { followeeID } })
       MERGE (u1) -[r1:FOLLOWS]-> (u2)
          ON CREATE SET r1.at = timestamp()
       MERGE (u2) -[r2:FOLLOWS]-> (u1)
          ON CREATE SET r2.at = timestamp()
      RETURN r1, r2`,
      'user not found'
    );
  }

  followProfile(followerID, followeeID) {
    if (followerID === followeeID) {
      return new Sequence();
    }

    return this._updateFollowing(
      followerID,
      followeeID,
      `MATCH (u1:Person { userID: { followerID } }), (u2:Person { userID: { followeeID } })
      MERGE (u1) -[r:FOLLOWS]-> (u2)
      ON CREATE SET r.at = timestamp()
      RETURN r`,
      'user not found'
    );
  }

  unfollowProfile(followerID, followeeID) {
    if (followerID === followeeID) {
      return new Sequence();
    }

    return this._updateFollowing(
      followerID,
      followeeID,
      `MATCH (u1:Person { userID: { followerID } })-[f:FOLLOWS]-> (u2:Person { userID: { followeeID } })
      DELETE f
      RETURN u2`,
      'user not found or not followed'
    );
  }

  _updateFollowing(followerID, followeeID, query, error) {
    return new Sequence((accept, reject) => {
      this.db.query(query, { followerID, followeeID }, (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length === 0) {
          reject(error);
        } else {
          accept();
        }
      });
    });
  }
}

module.exports = new ProfileModel();
