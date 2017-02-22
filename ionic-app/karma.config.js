module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '.',

    files: [
      'node_modules/zone.js/dist/zone.js', // Zone.js dependencies (Zone undefined)
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',
      'www/build/js/angular2-polyfills.js',
      'www/build/js/es6-shim.min.js',
      'www/build/js/nprogress.js',
      {pattern: 'tmp/bundled-specs/test.bundle.js', included: true},
      {pattern: 'tmp/bundled-specs/test.bundle.js.map', included: false},
      {pattern: 'tmp/bundled-specs/build/**/*.html', included: false}
    ],

    frameworks: ['jasmine'],

    proxies: {
      '/build/': '/base/tmp/bundled-specs/build/'
    },

    reporters: ['mocha'],

    port: 9976,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
