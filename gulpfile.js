var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var webpack = require('gulp-webpack');

var srcFiles = 'src/**/*.js';

gulp.task('build:src', function () {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/src/"));
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

gulp.task('build', ['build:src', 'build:browser']);

gulp.task("dist", function () {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task('default', ['build']);
