var parser = require("../../lib/parser");
var expander = require("../../lib/expander");
var makeImportEntries = require("../../lib/mod/importEntry").makeImportEntries;

var expect = require("expect.js");

function getTerm(str) {
    var tt = parser.read(str);
    var term = expander.enforest(tt, expander.makeExpanderContext({
        phase: 0
    }));
    return term.result;
}

describe("import entries", function() {
    it("should make an entry from a single named import", function() {
        var t = getTerm("import { x } from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("x");
        expect(entries[0].localName.token.value).to.be("x");
    });

    it("should make an entry for named import with two names", function() {
        var t = getTerm("import { x, y } from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("x");
        expect(entries[0].localName.token.value).to.be("x");

        expect(entries[1].importName.token.value).to.be("y");
        expect(entries[1].localName.token.value).to.be("y");
    });

    it("should make an entry for a qualified named import", function() {
        var t = getTerm("import { x as y } from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("x");
        expect(entries[0].localName.token.value).to.be("y");
    });

    it("should make an entry for two qualified named imports", function() {
        var t = getTerm("import { x as y, a as b } from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("x");
        expect(entries[0].localName.token.value).to.be("y");

        expect(entries[1].importName.token.value).to.be("a");
        expect(entries[1].localName.token.value).to.be("b");
    });

    it("should make a new term from a modified entry", function() {
        var t = getTerm("import { x as y } from './mod.js'");
        var entry = makeImportEntries(t)[0];

        var originalParam = entry.localName;
        var renamedParam = originalParam;
        entry.localName = renamedParam;

        expect(entry.toTerm().clause[0].names.token.inner[2]).to.be(renamedParam);
    });

    it("should make an entry for a default binding", function() {
        var t = getTerm("import x from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("default");
        expect(entries[0].localName.token.value).to.be("x");

        expect(entries[0].toTerm().clause[0].name.token.value).to.be("x");
    });

    it("should make an entry for a name space import", function() {
        var t = getTerm("import * as x from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("*");
        expect(entries[0].localName.token.value).to.be("x");

        expect(entries[0].toTerm().clause[0].name.token.value).to.be("x");
    });

    it("should make an entry for a default binding and a namespace import", function() {
        var t = getTerm("import x, * as y from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("default");
        expect(entries[0].localName.token.value).to.be("x");

        expect(entries[1].importName.token.value).to.be("*");
        expect(entries[1].localName.token.value).to.be("y");

        expect(entries[0].toTerm().clause[0].name.token.value).to.be("x");
        expect(entries[1].toTerm().clause[0].name.token.value).to.be("y");

    });

    it("should make an entry for a default binding", function() {
        var t = getTerm("import x, { y } from './mod.js'");
        var entries = makeImportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest.token.value).to.be("./mod.js");
        expect(entries[0].importName.token.value).to.be("default");
        expect(entries[0].localName.token.value).to.be("x");

        expect(entries[1].importName.token.value).to.be("y");
        expect(entries[1].localName.token.value).to.be("y");

        expect(entries[0].toTerm().clause[0].name.token.value).to.be("x");
        expect(entries[1].toTerm().clause[0].names.token.inner[0].token.value).to.be("y");

    });
});
