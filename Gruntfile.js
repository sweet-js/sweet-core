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
                    // bug in source mapping is causing test
                    // compilation to fail
                    sourceMap: false
                },
                src: "test/*.js",
                dest: "build/"
            }
        },
        copy: {
            buildMacros: {
                src: "macros/*",
                dest: "build/macros/"
            },

            browserMacros: {
                src: "macros/*",
                dest: "browser/scripts/"
            },

            dist: {
                src: "build/lib/*.js",
                dest: "lib/"
            }
        },
        mochaTest: {
            test: {
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
            return moduleCache[m] || (moduleCache[m] = readModuleFromCwd(m));
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
                    // concatenated module and original source
                    grunt.file.write(dest + path.basename(file) + ".original",
                                     code);
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

    function readModuleFromCwd(mod) {
        var cwd = process.cwd();
        var Module = module.constructor;
        var mockModule = {
            id: cwd + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd) ? [cwd] : Module._nodeModulePaths(cwd)
        };
        var path = Module._resolveFilename(mod, mockModule)
        return grunt.file.read(path);
    }
};
