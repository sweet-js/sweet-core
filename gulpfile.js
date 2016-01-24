var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var mocha = require('gulp-mocha');

gulp.task('build:src', function () {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/src/"));
});

gulp.task('build:test', function () {
  return gulp.src([
    'test/*.js',
    'test/declaration/*.js',
    'test/statements/*',

    '!test/expressions/literals/*',

    'test/expressions/b*',
    'test/expressions/array*',
    'test/expressions/arrow*',
    'test/expressions/cal*',
    'test/expressions/com*',
    'test/expressions/stat*',
    'test/expressions/new-ex*',
    'test/expressions/ob*',
    'test/expressions/thi*',
    'test/expressions/un*',
    'test/expressions/up*',

    '!test/expressions/new-tar*',
    '!test/expressions/cla*',
    '!test/expressions/f*',
    '!test/expressions/g*',
    '!test/expressions/i*',
    '!test/expressions/y*',

    '!test/destructuring/*',
    '!test/miscellaneous/*',
    '!test/modules/*',
    '!test/property-definition/*'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/test/"));
});

gulp.task('mocha', ['build:src', 'build:test'], function () {
  return gulp.src('build/test/**/*.js', { read: false })
    .pipe(mocha({
      reporter: 'nyan'
    }));
});

gulp.task('default', ['mocha']);

gulp.task("dist", function () {
  return gulp.src("src/**/*.js")
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
