module.exports = function(grunt) {
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
                options: {
                    compileFrom: "./lib/sweet"
                },
                src: "src/*.js",
                dest: ["build/lib/", "browser/scripts/"]
            },
            test: {
                options: {
                    // sourceMap: false,
                    compileFrom: "./build/lib/sweet"
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

            scopedEval: {
                expand: true,
                flatten: true,
                src: "lib/scopedEval.js",
                dest: "build/lib/"
            },
            scopedEvalBrowser: {
                expand: true,
                flatten: true,
                src: "lib/scopedEval.js",
                dest: "browser/scripts/"
            },

            browserMacros: {
                expand: true,
                flatten: true,
                src: "macros/*",
                dest: "browser/scripts/"
            },

            browserSrc: {
                expand: true,
                flatten: true,
                src: "src/*",
                dest: "browser/scripts/src/"
            },

            dist: {
                expand: true,
                flatten: true,
                src: "build/lib/*.js",
                dest: "lib/"
            },

            testFixtures: {
                expand: true,
                flatten: false,
                cwd: "test/",
                src: "fixtures/**",
                dest: "build/"
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
            options: {
                eqnull: true,
                evil: true,
                boss: true,
                laxcomma: true,
                shadow: true,
                loopfunc: true
            },
            all: ["build/lib/*.js"]
        }
    });


    grunt.registerMultiTask("build", function() {
        var options = this.options({
            modules: [],
            sourceMap: true,
            compileFrom: "./lib/sweet"
        });
        var sweet = require(options.compileFrom);

        var moduleSrc = options.modules.map(function(m) {
            return moduleCache[m] || (moduleCache[m] = readModule(m));
        }).join("\n");

        this.files.forEach(function(f) {
            var dest = Array.isArray(f.dest) ? f.dest : [f.dest];
            grunt.log.writeln("output to " + dest.join(", "));

            f.src.forEach(function(file) {
                grunt.log.writeln("compiling " + file);

                var code = grunt.file.read(file);
                var output = sweet.compile(code, {
                    sourceMap: options.sourceMap,
                    filename: file,
                    readableNames: true,
                    macros: moduleSrc
                });

                dest.forEach(function(dest) {
                    var sourceMappingURL = dest + path.basename(file) + ".map";
                    var outputFile = output.code + "\n//# sourceMappingURL=" + path.basename(file) + ".map"
                    // macro expanded result
                    grunt.file.write(dest + path.basename(file),
                                     outputFile);
                    if (options.sourceMap) {
                        // sourcemap
                        grunt.file.write(sourceMappingURL,
                                         output.sourceMap);
                        
                    }
                });
            })
        });
        
    });

    grunt.registerTask("dist", ["build:sweetjs", "copy:dist"]);

    grunt.registerTask("test", ["build:test",
                                "copy:testFixtures",
                                "mochaTest"]);

    grunt.registerTask("default", ["copy:scopedEval",
                                   "copy:buildMacros",
                                   "build",
                                   "copy:browserSrc",
                                   "copy:browserMacros",
                                   "copy:scopedEvalBrowser",
                                   "copy:testFixtures",
                                   "mochaTest",
                                   "jshint"]);

    function readModule(mod) {
        var path = require.resolve(mod);
        return grunt.file.read(path);
    }
};
