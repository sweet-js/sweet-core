var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var webpack = require('gulp-webpack');
var fs = require('fs');
var sweet = require('./dist/sweet');
var moduleLoader = require('./dist/node-module-loader').default;
var moduleResolver = require('./dist/node-module-resolver').default;
var gutil = require('gulp-util');
var applySourceMap = require('vinyl-sourcemaps-apply');
var es = require('event-stream');
var merge = require('merge');
var mergeStream = require('merge-stream');
var transform = require('babel-core').transform;

var srcFiles = 'src/**/*.js';

// TODO: PR this back to gulp-sweetjs
var sweetjs = function(opts) {
  var moduleCache = {};

  opts = merge({
    modules: [],
    readtables: [],
    moduleResolver: moduleResolver,
    moduleLoader: moduleLoader,
    transform: transform,
    readableNames: false
  }, opts);

  opts.modules = opts.modules.map(function(mod) {
    if(moduleCache[mod]) {
      return moduleCache[mod];
    }
    moduleCache[mod] = sweet.loadNodeModule(process.cwd(), mod);
    return moduleCache[mod];
  });

  opts.readtables.forEach(function(mod) {
    sweet.setReadtable(mod);
  });

  return es.through(function(file) {
    if(file.isNull()) {
      return this.emit('data', file);
    }
    if(file.isStream()) {
      return this.emit(
        'error',
        new Error('gulp-sweetjs: Streaming not supported')
      );
    }

    var sjsOpts = merge({
      sourceMap: !!file.sourceMap,
      filename: file.path,
    }, opts);

    var dest = gutil.replaceExtension(file.path, '.js');
    try {
      var res = sweet.compile(file.contents.toString('utf8'), sjsOpts);
    }
    catch(err) {
      return this.emit('error', err);
    }

    var originalContents = String(file.contents);
    file.contents = new Buffer(res.code);

    if(res.sourceMap) {
      var sm = JSON.parse(res.sourceMap);
      sm.sources = [file.relative];
      sm.sourcesContent = [originalContents];
      sm.file = file.relative;
      applySourceMap(file, sm);
    }

    file.path = dest;
    this.emit('data', file);
  });
};

gulp.task('build:src', function () {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(sweetjs())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/src/"));
});

gulp.task('build:bsrc', function () {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/src/"));
});

gulp.task('build:test', function () {
  var tests = gulp.src(['test/**/*.js', '!test/assertions.js'])
    .pipe(gulp.dest("build/test/"));

  var helpers = gulp.src('test/assertions.js')
    .pipe(babel())
    .pipe(gulp.dest('build/test/'));

  return mergeStream(tests, helpers);
});

gulp.task('build:browser', ['build:src'], function () {
  return gulp.src('build/src/sweet.js')
    .pipe(sourcemaps.init())
    .pipe(webpack({
      output: {
        filename: 'sweet.js',
        library: 'sweet',
        libraryTarget: 'amd'
      }
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("browser/scripts/"));
});

gulp.task('build', ['build:src', 'build:test']);

gulp.task("dist", ['build:src', 'build:browser'], function () {
  return gulp.src('build/src/*.js')
    .pipe(gulp.dest("dist"));
});

gulp.task('default', ['build']);
