'use strict';

const Sequence = require('impossible-promise');
const Model = require('core/Model');

const maxDistance = 25;  // km

const locationSearch =  `(
  post.location = user.location 
  OR
  2 * 6371 * ASIN(SQRT(HAVERSIN(RADIANS(user.latitude - post.latitude)) + COS(RADIANS(user.latitude))* COS(RADIANS(post.latitude)) * HAVERSIN(RADIANS(user.longitude - post.longitude)))) < ${maxDistance}
)`;

class ExploreModel extends Model {
  get(name) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest{name:{name}})
         OPTIONAL MATCH (post) <-[comments:COMMENTS]- (:Person)
         RETURN creator, rel, post, category,
            COUNT( DISTINCT comments) AS commentCount,
            [] AS commonFriends
         ORDER BY rel.at DESC`,
        { name },
        (err, response) => {
          if (err) return reject(err);
          return accept(response);
        }
      );
    });
  }
  searchInterest(interest, keyword) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person)-[rel:OFFERS|:ASKS]->(post:Post)-[:IS_ABOUT]->(category:Interest{name:{interest}})
         WHERE toLower(post.content) =~ toLower({keyword}) OR toLower(post.location) =~ toLower({keyword})
         OPTIONAL MATCH (post)<-[comments:COMMENTS]-(:Person)
         RETURN creator, rel, post, category,
            COUNT( DISTINCT comments) AS commentCount,
            [] AS commonFriends
         ORDER BY rel.at DESC`,
        { interest, keyword },
        (err, response) => {
          if (err) return reject(err);
          return accept(response);
        }
      );
    });
  }
  search(keyword) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person)-[rel:OFFERS|:ASKS]->(post:Post)-[:IS_ABOUT]->(category:Interest)
         WHERE toLower(post.content) =~ toLower({keyword}) OR toLower(post.location) =~ toLower({keyword})
         OPTIONAL MATCH (post)<-[comments:COMMENTS]-(:Person)
         RETURN creator, rel, post, category,
            COUNT( DISTINCT comments) AS commentCount,
            [] AS commonFriends
         ORDER BY rel.at DESC`,
        { keyword },
        (err, response) => {
          if (err) return reject(err);
          return accept(response);
        }
      );
    });
  }

  nearMeInterest(userID, interest) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person)-[rel:OFFERS|:ASKS]->(post:Post)-[:IS_ABOUT]->(category:Interest{name:{interest}}),
             (user:Person {userID: {userID}})
         WHERE (${locationSearch})
         OPTIONAL MATCH (post)<-[comments:COMMENTS]-(:Person)
         RETURN creator, rel, post, category,
            COUNT( DISTINCT comments) AS commentCount,
            [] AS commonFriends
         ORDER BY rel.at DESC`,
        { interest, userID },
        (err, response) => {
          if (err) return reject(err);
          return accept(response);
        }
      );
    });
  }

  nearMe(userID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person)-[rel:OFFERS|:ASKS]->(post:Post)-[:IS_ABOUT]->(category:Interest),
             (user:Person {userID: {userID}})
         WHERE (${locationSearch})
         OPTIONAL MATCH (post)<-[comments:COMMENTS]-(:Person)
         RETURN creator, rel, post, category,
            COUNT( DISTINCT comments) AS commentCount,
            [] AS commonFriends
         ORDER BY rel.at DESC`,
        { userID },
        (err, response) => {
          if (err) return reject(err);
          return accept(response);
        }
      );
    });
  }
}

module.exports = new ExploreModel();
