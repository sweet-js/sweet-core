var parser = require("../../lib/parser");
var expander = require("../../lib/expander");

var makeImportEntries = require("../../lib/mod/importEntry").makeImportEntries;
var ModuleRecord = require("../../lib/mod/moduleRecord").ModuleRecord;

var expect = require("expect.js");

function getTerm(str) {
    var tt = parser.read(str);
    var term = expander.enforest(tt, expander.makeExpanderContext());
    return term.result;
}

describe("module record", function() {
    it("should add an import entry for two qualified named imports", function() {
        var t = getTerm("import { x as y, a as b } from './mod.js'");

        var m = new ModuleRecord("foo", "bar");
        m.addImport(t);
        var entries = m.importEntries;

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("x");
        expect(entries[0].localName.token.value).to.be("y");

        expect(entries[1].importName.token.value).to.be("a");
        expect(entries[1].localName.token.value).to.be("b");

        expect(m.importedModules[0]).to.be("./mod.js");
    });

    it("should add two imports", function() {
        var t1 = getTerm("import { x } from './a.js'");
        var t2 = getTerm("import { y } from './b.js'");

        var m = new ModuleRecord("foo", "bar");
        m.addImport(t1);
        m.addImport(t2);

        expect(m.importedModules[0]).to.be("./a.js");
        expect(m.importedModules[1]).to.be("./b.js");
    });

    it("should get an import entry given a module path", function() {
        var t1 = getTerm("import { x } from './a.js'");
        var t2 = getTerm("import { y } from './a.js'");
        var t3 = getTerm("import { z } from './b.js'");

        var m = new ModuleRecord("foo", "bar");
        m.addImport(t1);
        m.addImport(t2);
        m.addImport(t3);

        var imps = m.getImportsForModule("./a.js");

        expect(imps.length).to.be(2);
        expect(imps[0].importName.token.value).to.be("x");
        expect(imps[1].importName.token.value).to.be("y");
    });

    it("should get just the runtime entries", function() {
        var t1 = getTerm("import { x } from './a.js'");
        var t2 = getTerm("import { y } from './a.js' for phase 1");
        var m = new ModuleRecord("foo", "bar");
        m.addImport(t1);
        m.addImport(t2);

        var entries = m.getRuntimeImportEntries();

        expect(entries.length).to.be(1);
        expect(entries[0].importName.token.value).to.be("x");
    });
});
