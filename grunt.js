/*global module:false*/
module.exports = function(grunt) {

  // External libs.
  var Mocha = require('mocha');
  var path = require("path");
  var rimraf = require("rimraf");
  var async = require("async");
  var exec = require("child_process").exec;

  // Project configuration.
  grunt.initConfig({

    lint: {
      files: ['grunt.js', 'lib/**/*.js']
    },

    mocha: {
      testdir: 'build/'
    },

    watch: {
      files: ['<config:build.test.src>', '<config:build.main.src>'],
      tasks: 'test'
    },

    clean: {
      all: 'build'
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    build: {
      main: {
        src: "src/*.js",
        dest: "lib/"
      },
      test: {
        src: "test/*.js",
        dest: "build/"
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'clean test');

  grunt.registerTask('test', 'build mocha');


  grunt.registerMultiTask('build', "Compile the src and tests",  function() {
    var done = this.async();

    var files = grunt.file.expandFiles(this.file.src);
    var outpath = this.file.dest;
    var processed = 0;

    grunt.file.mkdir(outpath);

    files.forEach(function(file) {
      var cmd = "bin/sjs --output " + outpath + path.basename(file) + " " + file;

      grunt.log.writeln("compiling " + file);

      exec(cmd, function(error, out, err) {
        if(error) {
          grunt.log.error(error);
        } 

        grunt.log.write(out);
        processed += 1;
        if(processed >= files.length) {
          grunt.log.ok("done");
          done();
        }
      });
    });
  });


  grunt.registerHelper('run_mocha', function(testdir, done) {
    console.log(testdir)
    exec("mocha --growl " + testdir, function(error, out, err) {
      if(error) {
        console.log(error);
      }
      console.log(out);
      done(true);
    });
  });

  grunt.registerMultiTask('mocha', 'Run Mocha Tests', function() {
    var done = this.async(),

    testdir = this.data;

    grunt.helper('run_mocha', testdir, done);
  });

  grunt.registerMultiTask("clean", "Cleans out the build files", function() {
    var done = this.async();

    rimraf(this.data, function(err) {
      if(err) {
        grunt.log.error(err);
      }
      done(true);
    });
  });
};
