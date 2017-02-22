const cache = require('memory-cache');
const Config = require('config/server');
const crypto = require('crypto');

function sha1(str) {
  return crypto.createHash('sha1').update(str).digest('hex');
}

module.exports = function (email) {
  const limit = Config.login.limit;
  const penalty = Config.login.penalty;
  var result = 0;
  const cacheKey = `login_${sha1(email)}`;
  const attempts = 1 + (cache.get(cacheKey) || 0);

  cache.put(cacheKey, attempts, Config.login.timeout);

  if (attempts > limit) {
    result = penalty * Math.max(1, attempts - limit);
  }

  return result;
};
