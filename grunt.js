/*global module:false*/
var path = require("path");
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    test: {
      files: ['test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint test'
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
        src: ["src/sweet.js"],
        dest: "lib/"
      },
      test: {
        src: ["test/macros.js"],
        dest: "build/"
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint test');

  grunt.registerMultiTask('build', "Compile the src and tests",  function() {
    var done = this.async();

    var files = this.file.src;
    var outpath = this.file.dest;
    var processed = 0;
    grunt.file.mkdir(outpath);

    var finish = function(error, result, code) {
      if(error) {
        grunt.log.error(error);
      } 

      processed += 1;
      if(processed >= files.length) {
        done();
      }
    }

    files.forEach(function(file) {
      grunt.utils.spawn({
        cmd: "bin/sjs",
        args: ["--output", outpath + path.basename(file), file]
      }, finish);
    })

  });

};
