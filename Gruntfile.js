module.exports = function(grunt) {
    var path = require("path");
    var exec = require("child_process").exec;
    var esfuzz= require("esfuzz");

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
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

            // for source maps support when using debug.js
            nodeSrc: {
                expand: true,
                flatten: true,
                src: "src/*",
                dest: "build/lib/src/"
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
            },
            testUnit: {
                src: "test/test_expander_units.js",
                dest: "build/test_expander_units.js"
            }
        },
        mochaTest: {
            test: {
                options:{
                    colors: !grunt.option('no-color')
                },
                src: ["build/*.js"],
                filter: function(name) {
                    return !/.*test_es6.*/.test(name);
                }
            },
            es6: {
                options:{
                    colors: !grunt.option('no-color')
                },
                src: ["build/*.js"],
                filter: function(name) {
                    return /.*test_es6.*/.test(name);
                }
            },
            unit: {
                options:{
                    colors: !grunt.option('no-color')
                },
                src: ["build/test_expander_units.js"]
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
        },
        pandoc: {
            options: {
                pandocOptions: ["--to=html5",  
                                "--standalone", 
                                "--toc", 
                                "--number-sections", 
                                "--include-in-header=doc/main/style/main.css"]
            },
            files: {
                expand: true,
                flatten: true,
                src: "doc/main/*.md",
                dest: "doc/main/",
                ext: ".html"
            }
        },
        watch: {
            docs: {
                files: ["doc/**/*.md", "doc/**/*.css"],
                tasks: ["pandoc"]
            },
            sweetjs: {
                files: ["src/*.js", "test/**/*.js", "macros/*"],
                tasks: ["default"]
            }
        }
    });

    grunt.registerMultiTask("pandoc", function() {
        var cb = this.async();
        var options = this.options({});
        var pandocOpts = options.pandocOptions.join(" ");
        this.files.forEach(function(f) {

            f.src.forEach(function(file) {
                var args = ["-o " + f.dest].concat(pandocOpts.slice())
                                          .concat(file);
                exec("pandoc " + args.join(" "), cb);
            })
        })
    });

    grunt.registerTask("fuzz", function() {
        var sweet = require("./build/lib/sweet");
        var i, iterations = 20;
        try {
            for (i = 0; i < iterations; i++) {
                var code = esfuzz.render(esfuzz.generate({maxDepth: 10}))
                // ignore `with` since we can't handle it anyway
                if (code.indexOf("with") !== -1) continue;
                sweet.compile(code);
            }
            console.log("done fuzzing");
        } catch (e) {
            console.log("On loop " + i + " attempted to expand:");
            console.log(code);
            console.log("\n" + e);
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
                                "mochaTest:test"]);

    grunt.registerTask("unit", ["build:sweetjs", 
                                "copy:scopedEval",
                                "copy:buildMacros",
                                "copy:nodeSrc",
                                "copy:testUnit", 
                                "mochaTest:unit"]);

    grunt.registerTask("default", ["copy:scopedEval",
                                   "copy:buildMacros",
                                   "build",
                                   "copy:browserSrc",
                                   "copy:nodeSrc",
                                   "copy:browserMacros",
                                   "copy:scopedEvalBrowser",
                                   "copy:testFixtures",
                                   "mochaTest:test",
                                   "jshint"]);

    grunt.registerTask("full", ["default", "mochaTest:es6"]);
    grunt.registerTask("docs", ["pandoc"]);

    function readModule(mod) {
        var path = require.resolve(mod);
        return grunt.file.read(path);
    }
};
