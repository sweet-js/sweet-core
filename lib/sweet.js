"use strict";

var /*
    Copyright (C) 2012 Tim Disney <tim@disnet.me>
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
     * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
path10698 = require("path"),
    fs10699 = require("fs"),
    resolveSync10700 = require("resolve/lib/sync"),
    gen10701 = require("escodegen"),
    _10702 = require("underscore"),
    parser10703 = require("./parser"),
    expander10704 = require("./expander"),
    syn10705 = require("./syntax"),
    babel10706 = require("babel"),
    escope10707 = require("escope");
var lib10773 = path10698.join(path10698.dirname(fs10699.realpathSync(__filename)), "../macros");
var stxcaseModule10774 = fs10699.readFileSync(lib10773 + "/stxcase.js", "utf8");
var moduleCache10775 = {};
var cwd10776 = process.cwd();
var requireModule10777 = function requireModule10777(id10790, filename10791) {
    var basedir10792 = filename10791 ? path10698.dirname(filename10791) : cwd10776;
    var key10793 = basedir10792 + id10790;
    if (!moduleCache10775[key10793]) {
        moduleCache10775[key10793] = require(resolveSync10700(id10790, { basedir: basedir10792 }));
    }
    return moduleCache10775[key10793];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module10794, filename10795) {
    var content10796 = require("fs").readFileSync(filename10795, "utf8");
    module10794._compile(gen10701.generate(exports.parse(content10796, exports.loadedMacros)), filename10795);
};
function expandSyntax10778(stx10797, modules10798, options10799) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander10704.expandModule(parser10703.read(stxcaseModule10774));
    }
    var isSyntax10800 = syn10705.isSyntax(stx10797);
    options10799 = options10799 || {};
    options10799.flatten = false;
    if (!isSyntax10800) {
        stx10797 = syn10705.tokensToSyntax(stx10797);
    }
    try {
        var result10801 = expander10704.expand(stx10797, [stxcaseCtx].concat(modules10798), options10799);
        return isSyntax10800 ? result10801 : syn10705.syntaxToTokens(result10801);
    } catch (err10802) {
        if (err10802 instanceof syn10705.MacroSyntaxError) {
            throw new SyntaxError(syn10705.printSyntaxError(source, err10802));
        } else {
            throw err10802;
        }
    }
}
function expand10779(code10803, options10804) {
    var toString10805 = String;
    if (typeof code10803 !== "string" && !(code10803 instanceof String)) {
        code10803 = toString10805(code10803);
    }
    var source10806 = code10803;
    if (source10806.length > 0) {
        if (typeof source10806[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code10803 instanceof String) {
                source10806 = code10803.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source10806[0] === "undefined") {
                source10806 = stringToArray(code10803);
            }
        }
    }
    if (source10806 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source10806 = " ";
    }
    var tokenTree10807 = parser10703.read(source10806);
    try {
        return expander10704.compileModule(tokenTree10807, options10804);
    } catch (err10808) {
        if (err10808 instanceof syn10705.MacroSyntaxError) {
            throw new SyntaxError(syn10705.printSyntaxError(source10806, err10808));
        } else {
            throw err10808;
        }
    }
}
function parseExpanded10780(expanded10809, options10810) {
    return expanded10809.map(function (c10811) {
        var ast10812 = parser10703.parse(c10811.code);
        if (options10810.readableNames) {
            ast10812 = optimizeHygiene10787(ast10812);
        }
        return {
            path: c10811.path,
            code: ast10812
        };
    });
}
function parse10781(code10813, options10814) {
    options10814 = options10814 || {};
    var expanded10815 = expand10779(code10813, options10814);
    return parseExpanded10780(expanded10815, options10814);
}
function compile10782(code10816, options10817) {
    options10817 = options10817 || { compileSuffix: ".jsc" };
    var expanded10818 = expand10779(code10816, options10817);
    return parseExpanded10780(expanded10818, options10817).map(function (c10819) {
        var expandedOutput10820;
        return (function (c10821) {
            var output10822 = c10821;
            if (options10817.to5) {
                output10822 = babel10706.transform(c10821.code, {
                    blacklist: ["es6.tailCall"],
                    compact: false
                });
                return {
                    code: output10822.code,
                    sourceMap: output10822.map
                };
            }
            return output10822;
        })((function (c10823) {
            if (options10817.sourceMap) {
                var output10824 = gen10701.generate(c10823.code, _10702.extend({
                    comment: true,
                    sourceMap: options10817.filename,
                    sourceMapWithCode: true
                }, options10817.escodegen));
                return {
                    path: c10823.path,
                    code: output10824.code,
                    sourceMap: output10824.map.toString()
                };
            }
            return {
                path: c10823.path,
                code: gen10701.generate(c10823.code, _10702.extend({ comment: true }, options10817.escodegen))
            };
        })(c10819));
    });
}
var baseReadtable10783 = Object.create({
    extend: function extend(obj10825) {
        var extended10826 = Object.create(this);
        Object.keys(obj10825).forEach(function (ch10827) {
            extended10826[ch10827] = obj10825[ch10827];
        });
        return extended10826;
    }
});
parser10703.setReadtable(baseReadtable10783, syn10705);
function setReadtable10784(readtableModule10828) {
    var filename10829 = resolveSync10700(readtableModule10828, { basedir: process.cwd() });
    var readtable10830 = require(filename10829);
    parser10703.setReadtable(require(filename10829));
}
function currentReadtable10785() {
    return parser10703.currentReadtable();
}
function loadNodeModule10786(root10831, moduleName10832, options10833) {
    options10833 = options10833 || {};
    if (moduleName10832[0] === ".") {
        moduleName10832 = path10698.resolve(root10831, moduleName10832);
    }
    var filename10834 = resolveSync10700(moduleName10832, {
        basedir: root10831,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs10699.readFileSync(filename10834, "utf8"), undefined, {
        filename: moduleName10832,
        requireModule: options10833.requireModule || requireModule10777
    });
}
function optimizeHygiene10787(ast10835) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper10836 = parse10781("(function(){})()")[0].code;
    wrapper10836.body[0].expression.callee.body.body = ast10835.body;
    function sansUnique10837(name10841) {
        var match10842 = name10841.match(/^(.+)\$[\d]+$/);
        return match10842 ? match10842[1] : null;
    }
    function wouldShadow10838(name10843, scope10844) {
        while (scope10844) {
            if (scope10844.scrubbed && scope10844.scrubbed.has(name10843)) {
                return scope10844.scrubbed.get(name10843);
            }
            scope10844 = scope10844.upper;
        }
        return 0;
    }
    var scopes10839 = escope10707.analyze(wrapper10836).scopes;
    var globalScope10840;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes10839.forEach(function (scope10845) {
        scope10845.scrubbed = new expander10704.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope10845.isStatic()) {
            globalScope10840 = scope10845;
            return;
        }
        scope10845.references.forEach(function (ref10846) {
            if (!ref10846.isStatic()) {
                globalScope10840.scrubbed.set(ref10846.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes10839.forEach(function (scope10847) {
        if ( // No need to rename things in the global scope.
        !scope10847.isStatic()) {
            return;
        }
        scope10847.variables.forEach(function (variable10848) {
            var name10849 = sansUnique10837(variable10848.name);
            if (!name10849) {
                return;
            }
            var level10850 = wouldShadow10838(name10849, scope10847);
            if (level10850) {
                scope10847.scrubbed.set(name10849, level10850 + 1);
                name10849 = name10849 + "$" + (level10850 + 1);
            } else {
                scope10847.scrubbed.set(name10849, 1);
            }
            variable10848.identifiers.forEach(function (i10851) {
                i10851.name = name10849;
            });
            variable10848.references.forEach(function (r10852) {
                r10852.identifier.name = name10849;
            });
        });
    });
    return ast10835;
}
var loadedMacros10788 = [];
function loadMacro10789(relative_file10853) {
    loadedMacros10788.push(loadNodeModule10786(process.cwd(), relative_file10853));
}
exports.expand = expand10779;
exports.expandSyntax = expandSyntax10778;
exports.parse = parse10781;
exports.compile = compile10782;
exports.setReadtable = setReadtable10784;
exports.currentReadtable = currentReadtable10785;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule10786;
exports.loadedMacros = loadedMacros10788;
exports.loadMacro = loadMacro10789;
//# sourceMappingURL=sweet.js.map