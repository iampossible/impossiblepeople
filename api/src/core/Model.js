'use strict';

const db = require('middleware/neo4jDatabase');
const request = require('request');
const Sequence = require('impossible-promise');

class Model {

  constructor() {
    this.db = db;
    this.request = request;
  }

  static status() {
    return new Sequence((accept) => {
      db.call(db.operation('', 'GET'), (err) => {
        if (err){
          console.error('DB Status failed', err.message || err)
          accept(false);
        }
        return accept(true);
      });
    });
  }

}

module.exports = Model;
