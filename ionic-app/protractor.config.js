'use strict';

// magically works with protractor, TODO: some investigation.
require('ts-node/register');

exports.config = {
  specs: ['tmp/final-ts/**/*.e2e.ts'],
  exclude: [],
  framework: 'jasmine',
  allScriptsTimeout: 1100000,
  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: true,
    includeStackTrace: false,
    defaultTimeoutInterval: 600000,
  },

  seleniumAddress: process.env.E2E_SELENIUM_HOST || null,

  capabilities: {
    browserName: 'chrome',
  },

  onPrepare: function () {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: true
    }));
    browser.ignoreSynchronization = false;
    browser.driver.manage().window().setSize(620, 800);
  },

  useAllAngular2AppRoots: true,
};
