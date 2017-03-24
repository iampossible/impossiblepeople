'use strict';

const btoa = require('btoa');
const moment = require('core/AppMoment');
const Sequence = require('impossible-promise');

const profileModel = require('models/ProfileModel');
const Model = require('core/Model');
const passwordHelper = require('middleware/PasswordHelper');

class UserModel extends Model {
  getUser(user) {
    return this.db.getOne(
      `MATCH (p:Person)
      WHERE 
      NOT p:Invitee
      AND (
           ({fromFacebook} IS NOT NULL AND p.fromFacebook = {fromFacebook}) 
        OR ({email} IS NOT NULL AND p.email = {email})
        OR ({sid} IS NOT NULL AND p.sid = {sid})
        OR ({userID} IS NOT NULL AND p.userID = {userID})
        )
      RETURN p`,
      {
        email: user.email || null,
        fromFacebook: user.fromFacebook || null,
        sid: user.sid || null,
        userID: user.userID || null
      }
    );
  }

  getInvitee(user) {
    return this.db.getOne(
      `MATCH (p:Invitee)
      WHERE ({email} IS NOT NULL AND p.email = {email})
         OR ({userID} IS NOT NULL AND p.userID = {userID})
      RETURN p`,
      {
        email: user.email || null,
        userID: user.userID || null,
      }
    );
  }

  getAuthUser(predicate) {
    return this.getUser(predicate)
      .then((accept, reject, user) => {
        if (!user) return reject('user not found');
        this.getInterests(user).done(accept).error(reject);
      })
      .done((user, interests) => {
        let interestMap = interests.map((interest) => {
          delete interest.id;
          return interest;
        })
        return Object.assign(user, { interests: interestMap });
      });
  }

  getUserByEmail(email) {
    return this.getUser({ email });
  }

  getUserBySID(sid) {
    return this.getUser({ sid });
  }

  getUserByID(userID) {
    return this.getUser({ userID });
  }

  createInvite(user, email) {
    return this.db.getOne('MATCH (n:Invitee { email: {email} }) return n', { email })
      .then((accept, reject, invitee) => {
        if (invitee) {
          accept(invitee);
        } else {
          this.db.save({ email, at: Date.now() }, ['Person', 'Invitee'], (error, newUser) => {
            if (error) return reject(error);
            this.db.save(Object.assign(newUser, { userID: this.db.encodeID(newUser.id, newUser.at) }), (innerErr, finalUser) => {
              if (innerErr) return reject(innerErr);
              return accept(finalUser);
            });
          });
        }
      })
      .then((accept, reject, newInvitee) => {
        this.db.relate(user, 'INVITES', newInvitee, { at: Date.now() }, (err, rel) => {
          if (err) return reject(err);
          accept(newInvitee);
        });
      }).then((accept, reject, newInvitee) => {
        profileModel.connectProfiles(user.userID, newInvitee.userID).done(accept).error(reject);
      }).done((foundInvitee, newInvitee) => newInvitee);
  }

  _upgradeInvitee(InviteeNode, newUserData) {
    return this.updateUser(InviteeNode.userID, newUserData)
      .then((accept, reject, finalUser) => {
        this.db.query('MATCH (i:Invitee) WHERE i.userID = {userID} REMOVE i:Invitee RETURN i', { userID: finalUser.userID }, (err, result) => {

          if (err) return reject(err);
          accept(result.pop());
        });
      });
  }

  _createNewUser(userData) {
    userData.email = userData.email.toLowerCase();
    return new Sequence((accept, reject) => {
      this.db.save(userData, 'Person', (error, newUser) => {
        if (error) return reject(error);
        this.db.save(Object.assign(newUser, { userID: this.db.encodeID(newUser.id, newUser.at) }), (innerErr, finalUser) => {
          if (innerErr) return reject(innerErr);
          return accept(finalUser);
        });
      });
    });
  }

  createUser(user) {
    user.email = user.email.toLowerCase();
    return this
      .getUser({ email: user.email, fromFacebook: user.fromFacebook })
      .then((accept, reject, userNode) => {
        if (userNode) return reject({
          msg: 'user already exists',
          user: { fromFacebook: userNode.fromFacebook, userID: userNode.userID },
        })
        if (user.password) {
          passwordHelper.hashPassword(user.password).done(accept).error(reject);
        } else {
          // don't hash empty Facebook user password
          accept('');
        }
      })
      .then((accept, reject, hashedPassword) => {

        this
          .getInvitee({ email: user.email })
          .done((InviteeNode) => {
            let newUser = Object.assign(user, { at: Date.now(), password: hashedPassword });
            if (InviteeNode) {
              this._upgradeInvitee(InviteeNode, newUser).done(accept).error(reject);
            } else {
              this._createNewUser(newUser).done(accept).error(reject);
            }
          });
      }).done((userNode, hashedPassword, finalUser) => finalUser);
  }

  updateUser(userID, data) {
    return new Sequence((accept, reject) => {
      this.db.query(
        'MATCH (p:Person { userID: {userID} }) SET p += {data} RETURN p',
        { userID, data },
        (err, node) => {
          if (err) return reject(err);
          accept(node[0]);
        });
    });
  }

  updateUserPassword(user, newPassword) {
    return passwordHelper.hashPassword(newPassword)
      .then((accept, reject, newHashPassword) => {
        let resets = user.resetCount || 0;
        this.updateUser(user.userID, { password: newHashPassword, resetCount: resets + 1 }).then(accept);
      }).done(() => true);
  }

  getUserPosts(userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person { userID: {userID} }) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest)
        OPTIONAL MATCH (post) <-[comment:COMMENTS]- (:Person)
        RETURN {
          postID: post.postID,
          postType: TYPE(rel),
          content: post.content,
          timeRequired: post.timeRequired,
          createdAt: rel.at,
          location: post.location,
          resolved: post.resolved,
          commentCount: COUNT(comment),
          author: {
            userID: creator.userID,
            username: creator.firstName + " " + creator.lastName,
            imageSource: creator.imageSource
          },
          category: {
            interestID: category.interestID,
            name: category.name,
            image: category.image
          }
        } as r
        ORDER BY r.createdAt DESC
       `,
        { userID },
        (err, posts) => {
          if (err) return reject(err);
          accept(posts);
        }
      );
    });
  }

  getUserBlocks(userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (:Person { userID: { userID } }) -[rel:BLOCKED]-> (b:Person)
        WHERE NOT b:Invitee
        RETURN {
          username: friend.firstName + " " + friend.lastName,
          userID: friend.userID,
          email: friend.email,
          friendAt: rel.at,
          imageSource: friend.imageSource,
          location: friend.location
        }`,
        { userID },
        (error, blocked) => {
          if (error) return reject(error);
          return accept(blocked);
        }
      );
    });
  }

  getUserFriends(userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (:Person { userID: { userID } }) -[rel:FOLLOWS]-> (friend:Person)
        WHERE NOT friend:Invitee
        RETURN {
          username: friend.firstName + " " + friend.lastName,
          userID: friend.userID,
          email: friend.email,
          friendAt: rel.at,
          imageSource: friend.imageSource,
          location: friend.location
        }`,
        { userID },
        (error, friends) => {
          if (error) return reject(error);
          return accept(friends);
        }
      );
    });
  }

  _addFacebookFriend(thisUserID, friendFacebookID) {
    return new Promise((resolve, reject) => {
      this.db.query(
        `MATCH (u:Person {userID: {thisUserID}}), (f:Person {fromFacebook: {friendFacebookID}})
         MERGE (u) -[r:FOLLOWS]-> (f)
         ON CREATE SET r.at = timestamp()
         MERGE (u) <-[r2:FOLLOWS]- (f)
         ON CREATE SET r2.at = timestamp()`,
        { thisUserID, friendFacebookID },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  }

  addFacebookFriends(user, friends) {
    return new Sequence((accept, reject) => {
      Promise
        .all(friends.map((friend) => this._addFacebookFriend(user.userID, friend.id)))
        .then(accept)
        .catch(reject);
    });
  }

  getInterests(user) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (u:Person {userID: {userID}})
        OPTIONAL MATCH (u) -[:INTERESTED_IN]-> (i:Interest {suggested: false})
        RETURN { interests: COLLECT(i) }`,
        { userID: user.userID },
        (err, userNodes) => {
          if (err) return reject(err);
          return accept(userNodes.length ? userNodes[0].interests : []);
        }
      );
    });
  }

  _addInterest(user, interest) {
    return new Promise((resolve, reject) => {
      this.db.query(
        `MATCH (u:Person {userID: {uID}}), (i:Interest {interestID: {iID}})
         MERGE (u) -[r:INTERESTED_IN]-> (i)
         ON CREATE SET r.at = timestamp()
         RETURN r`,
        { uID: user.userID, iID: interest.interestID },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  }

  _removeInterest(user, interest) {
    return new Promise((resolve, reject) => {
      this.db.query(
        `MATCH (:Person {userID: {uID}}) -[r:INTERESTED_IN]-> (:Interest {interestID: {iID}}) 
        DELETE r`,
        { uID: user.userID, iID: interest.interestID },
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  addInterests(user, interests) {
    return new Sequence((accept, reject) => {
      Promise
        .all(interests.map((interest) => this._addInterest(user, interest)))
        .then(accept)
        .catch(reject);
    });
  }

  removeInterests(user, interests) {
    return new Sequence((accept, reject) => {
      Promise
        .all(interests.map((interest) => this._removeInterest(user, interest)))
        .then(accept)
        .catch(reject);
    });
  }

  updateInterests(user, newInterests) {
    return this.getInterests(user)
      .then((accept, reject, interests) => {
        let currentInterestMap = {};
        let toAdd = [];

        interests.forEach((interest) => {
          currentInterestMap[interest.interestID] = interest;
        });

        newInterests.forEach((interest) => {
          if (currentInterestMap[interest.interestID]) {
            delete currentInterestMap[interest.interestID];
          } else {
            toAdd.push(interest);
          }
        });

        let toDelete = Object.keys(currentInterestMap).map(k => ({ interestID: k }));
        accept({ toAdd, toDelete });
      })
      .then((accept, reject, interestMap) => {
        this.addInterests(user, interestMap.toAdd).then(() => {
          this.removeInterests(user, interestMap.toDelete).then(accept).error(reject);
        }).error(reject);
      }).done(() => true);
  }

  blockUser(userID, blockedUserID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (u:Person {userID: {userID}}), (b:Person {userID: {blockedUserID}})
         MERGE (u) -[r:BLOCKED]-> (b)
         ON CREATE SET r.at = timestamp()
         RETURN r`,
        { userID, blockedUserID },
        (error, result) => {
          if (error) return reject(error);
          accept(result);
        }
      );
    }).then((accept, reject, result) => {
      this.db.query(
        `MATCH (u:Person {userID: {userID}})-[f:FOLLOWS]-(b:Person {userID: {blockedUserID}}) 
        DELETE f`,
        { userID, blockedUserID },
        (error, result) => {
          console.log(error)
          if (error) return reject(error);
          accept(result);
        }
      );
    }).done((result) => result);
  }

  reportUser(userID, reportedUserID) {
    return new Sequence((resolve, reject) => {
      this.db.query(
        `MATCH (u:Person {userID: {userID}}), (b:Person {userID: {reportedUserID}})
         MERGE (u) -[r:REPORT_USER]-> (b)
         ON CREATE SET r.at = timestamp()
         RETURN r`,
        { userID, reportedUserID },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  }

  getBlockStatus(userID, blockedUserID) {
    return this.db.getOne(
      `MATCH (a:Person {userID: {userID}})-[c:BLOCKED]-(b:Person {userID: {blockedUserID}})
        RETURN a.userID, c, b.userID`,
      { userID, blockedUserID }
    );
  }

}

module.exports = new UserModel();
