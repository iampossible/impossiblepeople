'use strict';

var request = require('requestretry');
var Sequence = require('impossible-promise');

// var config = require('../src/config/server');
var DataGenerator = require('./DataGenerator');

// const neo4jAuth = `http://${config.neo4j.user}:${config.neo4j.pass}@`;
const neo4jBatchEndpoint = `http://neo4j:RJHTFzJWQWVJT2L3EudP@127.0.0.1:7474/db/data/batch`;
const neo4jQueryEndpoint = `http://neo4j:RJHTFzJWQWVJT2L3EudP@127.0.0.1:7474/db/data/transaction/commit`;

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
    return this.populateFrom('./seed.edited.json');
  }

  wipe() {
    return new Sequence((next) => {
      const json = { statements: [{ statement: '' }] };

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

let myDataHelper = new DataHelper;
myDataHelper.populate();

module.exports = new DataHelper();
