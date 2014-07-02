var expect = require("expect.js");
var sweet = require("../build/lib/sweet.js");
var expander = require("../build/lib/expander.js");
var parser = require("../build/lib/parser.js");
var codegen = require("escodegen");

describe("module loading", function() {
    var modCode =
        'macro m {' +
            'function(stx) {' +
                'return {' +
                    'result: [makeValue(42, null)],' +
                    'rest: stx.slice(1)' +
                '}' +
            '}' +
        '}' +
        'export m';

    it("should expand module contexts", function() {
        var modCtx = expander.expandModule(parser.read(modCode), []);
        var modExp = modCtx.exports[0].oldExport;
        var modEnv = modCtx.env;

        expect(modCtx.exports.length).to.be(1);
        expect(modExp.token.value).to.be('m');
        expect(modEnv.has(expander.resolve(modExp))).to.be(true);
    });

    it("should import module exports", function() {
        var modCtx = expander.expandModule(parser.read(modCode), []);
        var testStx = parser.read('m + 12;');
        var testRes = codegen.generate(parser.parse(expander.expand(testStx, [modCtx])));
        expect(testRes).to.be('42 + 12;');
    });

    it("should import module exports and avoid the source map regression", function() {
        var modCtx = sweet.loadModule("macro m {\nrule { $m } => {\n$m }} export m;");
        var testStx = parser.read('m foo;');
        var testRes = sweet.compile("m foo", {
            modules: [modCtx],
            sourceMap: true,
            filename: "foo.js"
        });
        expect(testRes.code).to.be("foo;");
    });

    it("should load module contexts from code with loadModule", function() {
        var modCtx = sweet.loadModule('macro m { rule {} => { 42 } } export m');
        var modExp = modCtx.exports[0].oldExport;
        var modEnv = modCtx.env;

        expect(modCtx.exports.length).to.be(1);
        expect(modExp.token.value).to.be('m');
        expect(modEnv.has(expander.resolve(modExp))).to.be(true);
    });

    it("should export multi-token macro names", function() {
        var modCtx = sweet.loadModule('macro (???) { rule {} => { 42 } } export (???)');
        var modExp = modCtx.exports[0].oldExport;
        var modEnv = modCtx.env;

        expect(modCtx.exports.length).to.be(1);
        expect(modExp.token.value).to.be('???');
        expect(modEnv.has(expander.resolve(modExp))).to.be(true);
    });
    
    it("should consume an optional trailing semicolon", function() {
        var testRes = sweet.compile('macro m { rule {} => { 42 } } export m;').code;
        expect(testRes).to.be('');
    });
});
