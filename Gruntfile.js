module.exports = function(grunt) {
    var sweet = require("./lib/sweet");
    var path = require("path");

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    var moduleCache = {};

    grunt.initConfig({
        build: {
            options: {
                modules: []
            },
            sweetjs: {
                src: "src/*.js",
                dest: ["build/lib/", "browser/scripts/"]
            },
            test: {
                options: {
                    sourceMap: true
                },
                src: "test/*.js",
                dest: "build/"
            }
        },
        copy: {
            buildMacros: {
                expand: true,
                flatten: true,
                src: "macros/*",
                dest: "build/macros/"
            },

            browserMacros: {
                expand: true,
                flatten: true,
                src: "macros/*",
                dest: "browser/scripts/"
            },

            dist: {
                expand: true,
                flatten: true,
                src: "build/lib/*.js",
                dest: "lib/"
            }
        },
        mochaTest: {
            test: {
                options:{
                    colors: !grunt.option('no-color')
                },
                src: ["build/*.js"]
            }
        },
        jshint: {
            all: ["build/lib/*.js"]
        }
    });


    grunt.registerMultiTask("build", function() {
        var options = this.options({
            modules: [],
            sourceMap: true
        });

        var moduleSrc = options.modules.map(function(m) {
            return moduleCache[m] || (moduleCache[m] = readModule(m));
        }).join("\n");

        this.files.forEach(function(f) {
            var dest = Array.isArray(f.dest) ? f.dest : [f.dest];
            grunt.log.writeln("output to " + dest.join(", "));

            f.src.forEach(function(file) {
                grunt.log.writeln("compiling " + file);

                var code = moduleSrc + "\n" + grunt.file.read(file);
                var output = sweet.compile(code, {
                    sourceMap: options.sourceMap,
                    filename: file
                });

                dest.forEach(function(dest) {
                    // macro expanded result
                    grunt.file.write(dest + path.basename(file),
                                     output.code);
                    if (options.sourceMap) {
                        // sourcemap
                        grunt.file.write(dest + path.basename(file) + ".map",
                                         output.sourceMap);
                        
                    }
                });
            })
        });
        
    });

    grunt.registerTask("dist", ["build:sweetjs", "copy:dist"]);

    grunt.registerTask("default", ["build",
                                   "copy:buildMacros",
                                   "copy:browserMacros",
                                   "mochaTest"]);

    function readModule(mod) {
        var path = require.resolve(mod);
        return grunt.file.read(path);
    }
};
