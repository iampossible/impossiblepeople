'use strict';
const pkg = require('../package.json');
const log4js = require('log4js');
const Overseer = require('core/Overseer');
/*
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'gnome-worker.log' },
  ],
  replaceConsole: true,
});
*/

console.debug("---=====[",new Date(),"]=====---");
console.log("Loading GNOME WORKER:", pkg.version)

const ImpossibleWorker = new Overseer();

/**
 * LOAD WORKERS
 */
ImpossibleWorker.load('TestWorker');
ImpossibleWorker.load('ActivityWorker');
ImpossibleWorker.load('NotificationWorker');
ImpossibleWorker.load('EmailWorker');

module.exports = ImpossibleWorker;
