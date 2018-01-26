'use strict';

var pkg = require('./package.json');
var gulp = require('gulp');
//var sass = require('gulp-sass');
var watch = require('gulp-watch');
var del = require('del');
var cache = require('gulp-cached');
var glob = require('glob');
var argv = process.argv;
var runSequence = require('run-sequence');
var webserver = require('gulp-webserver');
var preprocess = require('gulp-preprocess');
var injectfile = require('gulp-inject-file');
var injectstring = require('gulp-inject-string');
var typescript = require('typescript');
var ts = require('gulp-typescript');
var rimraf = require('gulp-rimraf');

/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 */
var buildBrowserify = require('ionic-gulp-browserify-typescript');
//var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var copyScripts = require('ionic-gulp-scripts-copy');

function remove(dir, done) {
  return gulp.src(dir, {
      read: false,
    })
    .pipe(rimraf(), done);
}

/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

var env = process.env.GNOME_ENV;
if (typeof env === 'undefined') {
  process.env.GNOME_ENV = 'dev';
} else if (env !== 'dev' && env !== 'prod' && env !== 'stage' && env !== 'docker') {
  throw 'invalid environment';
}

// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

var APP_MAIN = 'tmp/final-ts/app/IonicApp.ts';
var FINAL_TS = 'tmp/final-ts';
var FINAL_JS = 'tmp/final-js';
var APP_SRC = 'src';
var DIST = 'www';

/******************************************************************************
 * build
 * The following tasks are related to building the application with its assets.
 ******************************************************************************/
gulp.task('sass', function () {
//  buildSass({
//    src: 'src/app/theme/app.+(ios|md).scss'
//  });
});

gulp.task('html', function () {
  copyHTML({
    src: 'src/app/**/*.html'
  });
});

gulp.task('images', function () {
  return gulp.src('src/app/images/**/*.+(jpg|png)')
    .pipe(cache('app_img'))
    .pipe(gulp.dest('www/build/images'));
});

gulp.task('fonts', copyFonts);

gulp.task('scripts', function () {
  copyScripts({
    src: [
      'node_modules/es6-shim/es6-shim.min.js',
      'node_modules/es6-shim/es6-shim.map',
      'node_modules/zone.js/dist/zone.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/reflect-metadata/Reflect.js.map',
      'node_modules/nprogress/nprogress.js',
      'script/angular2-polyfills.js',
      'script/async-test.js',
      'script/jasmine-patch.js',
    ],
  });
});

gulp.task('clean', function (done) {
  del('www/build', done);
});

gulp.task('watch', ['sass', 'html', 'fonts', 'scripts'], function () {
  watch('src/app/**/*.scss', function () {
    gulp.start('sass');
  });

  watch('src/app/**/*.html', function () {
    gulp.start('html');
  });

  var saneWatch = require('gulp-sane-watch');
  saneWatch('src/app/**/*.ts', {
    debounce: 500
  }, function () {
    gulp.start('ts');
  });

  saneWatch(FINAL_TS, { debounce: 1000 }, function () {
    console.info('Compiling JavaScript...')
    return buildBrowserify(
      {
        src: [APP_MAIN, './typings/index.d.ts'],
        outputPath: 'www/build/js/',
        debug: false
      }
    );
  })
});

gulp.task('build', ['config', 'sass', 'html', 'fonts', 'scripts', 'images', 'ts'], function () {
  return buildBrowserify({
    src: [APP_MAIN, './typings/index.d.ts'],
    outputPath: 'www/build/js/'
  });
});

gulp.task('config', function () {
  return gulp
    .src('./config.xml')
    .pipe(injectstring.replace(/version="\d+\.\d+\.\d+[^"]*"/, `version="${pkg.version}"`))
    .pipe(gulp.dest('./'));
});

/******************************************************************************
 * typescript
 * Takes ts code and preprocesses it to final ts code.
 ******************************************************************************/
gulp.task('ts', function (done) {
  runSequence('ts.clean', 'ts.preprocess', done);
});

gulp.task('ts.clean', function (done) {
  return remove(FINAL_TS, done);
});

gulp.task('ts.preprocess', function (done) {
  return gulp.src(APP_SRC + '/**/*.ts')
    .pipe(injectstring.replace(/\$\$PKG_VERSION\$\$/g, pkg.version))
    .pipe(preprocess())
    .pipe(injectfile({
      pattern: '\/\/ inject:<filename>',
    }))
    .pipe(preprocess())
    .pipe(gulp.dest(FINAL_TS), done);
});

/******************************************************************************
 * test
 * Runs all unit tests.
 ******************************************************************************/
var KarmaServer = require('karma').Server;

gulp.task('test', function (done) {
  runSequence('ts.clean', 'ts.preprocess', 'test.clean', 'scripts', 'test.build', 'test.run', done);
});

gulp.task('test.clean', function (done) {
  return remove(FINAL_JS, done);
});

gulp.task('test.build', function () {
  var specs = glob.sync('tmp/final-ts/app/**/*.spec.ts');
  specs.push('./typings/index.d.ts')
  copyHTML({
    src: 'src/app/**/*.html',
    dest: 'tmp/bundled-specs/build'
  });

  return buildBrowserify(
    {
      watch: false,
      src: specs,
      outputPath: 'tmp/bundled-specs',
      outputFile: 'test.bundle.js',
      browserifyOptions: {
        cache: {},
        packageCache: {},
        debug: true
      },
    }
  )
});

gulp.task('test.run', function () {
  return new KarmaServer({
    configFile: __dirname + '/karma.config.js',
    singleRun: true,
  }).start();
});

/******************************************************************************
 * e2e tests
 * Runs all end-to-end tests.
 ******************************************************************************/
var e2eServerStream;

gulp.task('e2e', function (done) {
  runSequence('build', 'e2e.webserver', 'e2e.seed', 'e2e.run', 'e2e.tearDown', done);
});

gulp.task('e2e.run', function (done) {
  var childProcess = require('child_process');
  var endpoint = (process.env.E2E_CLIENT || 'http://localhost:') + (process.env.E2E_PORT || 5555)
  return childProcess.spawn('node', ['./node_modules/protractor/bin/protractor', 'protractor.config.js', '--baseUrl=' + endpoint, '--verbose'], {
      stdio: 'inherit'
    })
    .on('close', function (code) {
      if (code === 1) process.exit(code);
      done();
    });
});

gulp.task('e2e.webserver', function (done) {
  e2eServerStream = gulp.src(DIST)
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: false,
      port: process.env.E2E_PORT || 5555,
      open: false,
    }));
  done();
});

gulp.task('e2e.seed', function (done) {
  var DataHelper = require('../api/test/DataHelper')
  DataHelper.wipe().then(function () {
    DataHelper.populateFrom('./seed.json').then(function () {
      done();
    });
  });
});

gulp.task('e2e.seed.lotr', function (done) {
  var DataHelper = require('../api/test/DataHelper')
  DataHelper.wipe().then(function () {
    DataHelper.populateFrom('./seed.feed.json').then(function () {
      console.log('taking the hobbits to isengard...');
      done();
    });
  });
});

gulp.task('e2e.tearDown', function (done) {
  var DataHelper = require('../api/test/DataHelper')
  DataHelper.wipe().then(function () {
    e2eServerStream.emit('kill');
    done();
  });

});

/******************************************************************************
 * webserver
 * Deploys www directory on local webserver
 ******************************************************************************/
var webserverStream;

gulp.task('webserver', function (done) {
  webserverStream = gulp.src(DIST)
    .pipe(webserver({
      host: (process.env.APP_HOST || 'localhost'),
      livereload: true,
      port: process.env.APP_PORT || 8090,
      open: false,
    }));
  done();
});

gulp.task('webserver.stop', function (done) {
  webserverStream.emit('kill');
  done();
});
