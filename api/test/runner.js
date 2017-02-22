'use strict';
process.env.GNOME_LOG = 0

let Jasmine = require('jasmine');
let SpecReporter = require('jasmine-spec-reporter').SpecReporter;

let runner = new Jasmine();

runner.loadConfigFile('test/jasmine.json')

runner.env.clearReporters();
runner.env.clearReporters();
runner.addReporter(new SpecReporter({
  spec: {
    displayPending: true
  }
}));
runner.loadConfigFile();
runner.execute();
