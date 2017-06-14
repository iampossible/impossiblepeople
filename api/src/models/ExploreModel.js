'use strict';

const Sequence = require('impossible-promise');
const Model = require('core/Model');

class ExploreModel extends Model {
  get(interestID) {
    return new Sequence((accept, reject) => {
      this.db.query(
        `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest),
             (user:Person)  
          WHERE category.interestID='{interestID: {interestID}}'
          OPTIONAL MATCH (post) <-[comments:COMMENTS]- (:Person)
            
          RETURN creator, rel, post, category,
                COUNT( DISTINCT comments) AS commentCount,
                [] AS commonFriends
          
          ORDER BY rel.at DESC`,
        { interestID },
        (err, response) => {
          if (err) return reject(err);
          return accept(response);
        }
      );
    });
  }
}

module.exports = new ExploreModel();
