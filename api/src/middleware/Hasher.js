'use strict';

const Hashids = require('hashids');

const config = require('../config/server');

var hashids = new Hashids(config.salt);

module.exports = class Hasher {
  static encode() {
    return hashids.encode.call(hashids, Array.prototype.slice.call(arguments));
  }

  static decode() {
    return hashids.decode.call(hashids, Array.prototype.slice.call(arguments));
  }
};
