'use strict';

var request = require('requestretry');
var Sequence = require('impossible-promise');

var config = require('../src/config/server');
var DataGenerator = require('./DataGenerator');

const neo4jAuth = `http://${config.neo4j.user}:${config.neo4j.pass}@`;
const neo4jBatchEndpoint = `${config.neo4j.host.replace('http://', neo4jAuth)}/db/data/batch`;
const neo4jQueryEndpoint = `${config.neo4j.host.replace('http://', neo4jAuth)}/db/data/transaction/commit`;

class DataHelper {

  populateFrom(seedFile) {
    return new DataGenerator(require(seedFile)).parse().then(json => this.wipe().then((next) => {
      request({ method: 'POST', uri: neo4jBatchEndpoint, body: json }, (err, response) => {
        if (err) {
          console.error('failed to populate', err);
          throw err;
        }
        if (response && response.attempts > 1) console.log(`populated after ${response.attempts} attempts`);
        next();
      });
    }));
  }

  populate() {
    return this.populateFrom('./seed.json');
  }

  wipe() {
    return new Sequence((next) => {
      const json = { statements: [{ statement: 'MATCH (n) DETACH DELETE n;' }] };

      request({ method: 'POST', uri: neo4jQueryEndpoint, json }, (err, response) => {
        if (err) {
          console.error('failed to wipe', err);
          throw err;
        }
        if (response && response.attempts > 1) console.log(`wiped after ${response.attempts} attempts`);
        next();
      });
    });
  }
}

module.exports = new DataHelper();
