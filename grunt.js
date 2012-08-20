/*global module:false*/
module.exports = function(grunt) {

  // External libs.
  var Mocha = require('mocha');
  var path = require("path");

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    mocha: {
      files: ['build/**/*.js']
    },
    growl: true,
    watch: {
      files: ['<config:build.test.src>', '<config:build.main.src>'],
      tasks: 'test'
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
        src: ["test/macros.js", "test/long_macros.js"],
        dest: "build/"
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint test');
  grunt.registerTask('test', 'build mocha');

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
        grunt.log.ok("done");
        done();
      }
    }

    files.forEach(function(file) {
      grunt.log.writeln("compiling " + file);
      grunt.utils.spawn({
        cmd: "bin/sjs",
        args: ["--output", outpath + path.basename(file), file]
      }, finish);
    })

  });


  grunt.registerMultiTask('mocha', 'Run unit tests with mocha.', function() {
    var filepaths = grunt.file.expandFiles(this.file.src);
    grunt.file.clearRequireCache(filepaths);
    var paths = filepaths.map(resolveFilepaths);

    var options = {};
    if(grunt.config.get('growl')){
      options.growl = true;
    }

    var mocha_instance = new Mocha(options);
    paths.map(mocha_instance.addFile.bind(mocha_instance));
    mocha_instance.run(this.async());
  });

  function resolveFilepaths(filepath) {
    return path.resolve(filepath);
  }

};
