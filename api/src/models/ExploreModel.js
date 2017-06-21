'use strict';

const Sequence = require('impossible-promise');
const Model = require('core/Model');

class ExploreModel extends Model {
  get(name) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest{name:{name}}), (user:Person)
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
}

module.exports = new ExploreModel();
