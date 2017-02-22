'use strict';

const Model = require('core/Model');
const Sequence = require('impossible-promise');

class InterestModel extends Model {

  /**
   * Handles three cases:
   * - If suggestion doesn't exist, creates an interest node and links it to the user as a
   * suggestion
   * - If suggestion exists as a suggested interest, links it to the user as a suggestion
   * - If suggestion exists as an interest, links it to the user as an interest
   *
   * return {}.isNew if a new Interest node was created
   *
   * @param {Object} userNode
   * @param {String} suggestion
   * @returns {ImpossiblePromise}
   */
  createSuggestion(userNode, suggestion) {
    return new Sequence((accept, refuse) => {
      return new Sequence((next) => {
        let query = 'MATCH (i:Interest) WHERE lower(i.name) = lower({suggestion}) RETURN i';
        return this.db.getOne(query, { suggestion }).done(next).error(refuse);
      })
      .then((next, reject, interestNode) => {
        if (interestNode) {
          next(interestNode);
          return;
        }
        let newNode = {
          suggested: true,
          featured: false,
          name: suggestion,
        };

        this.db.save(newNode, 'Interest', (err, interestNode) => {
          if (err) return reject(err);
          this.db.save(interestNode, 'interestID', this.db.encodeID(interestNode.id), (innerErr, innerNode) => {
            if (innerErr) return reject(innerErr);
            next(innerNode);
          });
        });
      })
      .then((next, reject, interestNode) => {
        let relType = (interestNode.suggested ? 'SUGGESTS' : 'INTERESTED_IN');
        this.db.query(
          `MATCH (user:Person { userID: { userID } }), 
             (interest:Interest { interestID: { interestID } })
           MERGE (user) -[r:${relType}]-> (interest)
           ON CREATE SET r.at = timestamp()`,
          { userID: userNode.userID, interestID: interestNode.interestID },
          (err, rel) => {
            if (err) return reject(err);
            next(rel);
          }
        );
      })
      .done((findNode, saveNode) => {
        accept(Object.assign(saveNode, { isNew: findNode === null }));
      })
      .error(refuse);
    });
  }

  getInterests(featured) {
    let query = `MATCH (i:Interest${featured ? ' {featured: true, suggested: false}' : ' {suggested: false}'}) RETURN i ORDER BY i.name ASC`;
    return new Sequence((accept, reject) => {
      this.db.query(query, (err, data) => {
        if (err) return reject(err);
        accept(data);
      });
    });
  }
}

module.exports = new InterestModel();
