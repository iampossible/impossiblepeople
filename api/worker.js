'use strict';

const gnomeWorker = require('ImpossibleWorker');

gnomeWorker.start().then(() => {
  console.log('ImpossibleWorker STARTED');
}).catch((e) => {
  console.error('ImpossibleWorker', e);
});

module.exports = gnomeWorker;
