'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const pagespeed = require('psi');
const app = require('./server');
const vinylfs = require('vinyl-fs');

const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// ----------------------
// Gulp 4: Tasks
// ----------------------

// Lint JavaScript
function jshint() {
  return gulp.src('site-assets/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
}

// Optimize Images
function images() {
  return gulp.src('site-assets/*.{png,jpg,svg}')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/site-assets'))
    .pipe($.size({ title: 'images' }));
}

// Copy root-level files
function copy() {
  return vinylfs.src([
    'examples/**',
    'bower_components/**',
    'learn.json',
    'CNAME',
    '.nojekyll',
    'site-assets/favicon.ico'
  ], {
    dots: true,
    base: './',
    followSymlinks: false
  })
    .pipe(vinylfs.dest('dist'))
    .pipe($.size({ title: 'copy' }));
}

// Compile and prefix stylesheets
function styles() {
  return gulp.src(['site-assets/*.css'])
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('dist/site-assets'))
    .pipe($.size({ title: 'styles' }))
    .pipe(gulp.dest('.tmp/site-assets'));
}

// Process HTML, optimize assets
function html() {
  const assets = $.useref.assets({ searchPath: '{.tmp,.}' });

  return gulp.src('index.html')
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.vulcanize({ dest: 'dist', strip: true }))
    .pipe($.size({ title: 'html' }));
}

// Clean dist directories
function clean() {
  return del(['.tmp', 'dist']);
}

// Serve on port 8080
function serve(cb) {
  app.listen(8080, cb);
}

// Test server on port 8000
function testServer(cb) {
  app.listen(8000, cb);
}

// Pagespeed
function psiTask() {
  return pagespeed('https://todomvc.com', {
    strategy: 'mobile'
  });
}

// ----------------------
// Gulp 4: Build Pipeline
// ----------------------

const build = gulp.series(
  clean,
  gulp.parallel(styles, copy),
  gulp.parallel(jshint, html, images)
);

// Set default task
exports.default = build;

exports.clean = clean;
exports.styles = styles;
exports.copy = copy;
exports.jshint = jshint;
exports.html = html;
exports.images = images;

exports.serve = serve;
exports['test-server'] = testServer;
exports.pagespeed = psiTask;
