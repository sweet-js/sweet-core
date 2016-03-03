var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var mocha = require('gulp-mocha');
var webpack = require('gulp-webpack');

var srcFiles = 'src/**/*.js';

var testFiles = [
  'test/*.js',
  'test/declaration/*.js',
  'test/statements/*',
  'test/expressions/literals/*',
  'test/expressions/*',

  'test/modules/export.js',
  'test/modules/import.js',

  'test/destructuring/assignment/*',
  'test/destructuring/binding-pattern/arr*',
  'test/destructuring/binding-pattern/obj*',

  '!test/miscellaneous/*',
  '!test/property-definition/*'
];

gulp.task('build:src', function () {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/src/"));
});

gulp.task('build:test', function () {
  return gulp.src(testFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/test/"));
});

gulp.task('build:browser', ['dist'], function () {
  return gulp.src('dist/sweet.js')
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

gulp.task('mocha', ['build:src', 'build:test'], function () {
  return gulp.src('build/test/**/*.js', { read: false })
    .pipe(mocha({
      reporter: 'nyan'
    }));
});

gulp.task('mocha:single', ['build:src', 'build:test'], function () {
  return gulp.src('build/test/**/test_modules.js', { read: false })
    .pipe(mocha({
      reporter: 'nyan'
    }));
});


gulp.task('default', ['mocha']);

gulp.task("dist", function () {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task('watch', ['default'], function () {
  gulp.watch(['src/**/*.js', 'test/**/*.js'], ['default']);
});

gulp.task('watch:build', ['build:src'], function () {
  gulp.watch(['src/**/*.js',], ['build:src']);
});
