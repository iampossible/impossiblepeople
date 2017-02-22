'use strict';

const Sequence = require('impossible-promise');
const seraph = require('seraph');

// INFO: this is relative because e2e.seed loads up this file
const config = require('../config/server');
const Hasher = require('./Hasher');

module.exports = (() => {
  var db = seraph({
    server: config.neo4j.host,
    user: config.neo4j.user,
    pass: config.neo4j.pass,
  });

  db.encodeID = Hasher.encode;
  db.decodeID = Hasher.decode;

  db.encodeEdgeID = (relEdge) => Hasher.encode(
    relEdge.start,
    relEdge.end,
    relEdge.id,
    relEdge.properties.at
  );

  db.getOne = (query, params) => new Sequence((accept, refuse) => {
    db.query(query, params, (err, result) => {
      if (err) return refuse(err);
      if (result && result.length > 1) {
        console.warn('multiple results for ', query, ' with ', JSON.stringify(params));
      }
      accept((!result || !result.length) ? null : result[0]);
    });
  });

  return db;
})();
