'use strict';

const config = require('config/server');
const gnomeApi = require('ImpossibleApi');

gnomeApi.start((err) => {
  if (err) throw err;
  console.log('LISTEN on', config.port);
});

const gnomeWorker = require('ImpossibleWorker');

gnomeWorker.start().then(() => {
  console.log('ImpossibleWorker STARTED');
}).catch((e) => {
  console.error('ImpossibleWorker', e);
});

module.exports = { gnomeApi, gnomeWorker };
