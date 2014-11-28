var parser = require("../../lib/parser");
var expander = require("../../lib/expander");
var makeExportEntries = require("../../lib/mod/exportEntry").makeExportEntries;

var expect = require("expect.js");

function getTerm(str) {
    var tt = parser.read(str);
    var term = expander.enforest(tt, expander.makeExpanderContext({
        phase: 0
    }));
    return term.result;
}

describe("export entries", function() {
    it("should make an entry from a single named export", function() {
        var t = getTerm("export { x };");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("x");
        expect(entries[0].localName.token.value).to.be("x");
    });

    it("should make an entry from two named exports", function() {
        var t = getTerm("export { x, y };");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("x");
        expect(entries[0].localName.token.value).to.be("x");

        expect(entries[1].exportName.token.value).to.be("y");
        expect(entries[1].localName.token.value).to.be("y");
    });

    it("should make an entry from two qualified named exports", function() {
        var t = getTerm("export { x as a, y as b };");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("a");
        expect(entries[0].localName.token.value).to.be("x");

        expect(entries[1].exportName.token.value).to.be("b");
        expect(entries[1].localName.token.value).to.be("y");
    });

    it("should make an entry from a default export of an identifier", function() {
        var t = getTerm("export default foo;");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("default");
        expect(entries[0].localName.token.value).to.be("foo");
    });

    it("should make an entry from a default export of an function declaration", function() {
        var t = getTerm("export default function foo() {};");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("default");
        expect(entries[0].localName.token.value).to.be("foo");
    });

    it("should make an entry from a default export of an anon function expression", function() {
        var t = getTerm("export default function () {};");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("default");
        expect(entries[0].localName.token.value).to.be("*default*");
    });

    // it("should make an entry from a default export of macro declaration", function() {
    //     var t = getTerm("export default macro foo { (function() {})};");
    //     var entries = makeExportEntries(t);

    //     expect(entries.length).to.be(1);
    //     expect(entries[0].moduleRequest).to.be(null);
    //     expect(entries[0].exportName.token.value).to.be("default");

    //     expect(entries[0].localName[0].token.value).to.be("foo");
    // });

    it("should make an entry from a export of an var decl", function() {
        var t = getTerm("export var foo;");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("foo");
        expect(entries[0].localName.token.value).to.be("foo");
    });

    it("should make an entry from a export of an var decl with multiple names", function() {
        var t = getTerm("export var foo, bar;");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("foo");
        expect(entries[0].localName.token.value).to.be("foo");

        expect(entries[1].exportName.token.value).to.be("bar");
        expect(entries[1].localName.token.value).to.be("bar");
    });

    it("should make an entry from a export of an const decl with multiple names", function() {
        var t = getTerm("export const foo, bar;");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("foo");
        expect(entries[0].localName.token.value).to.be("foo");

        expect(entries[1].exportName.token.value).to.be("bar");
        expect(entries[1].localName.token.value).to.be("bar");
    });

    it("should make an entry from a export of an let decl with multiple names", function() {
        var t = getTerm("export let foo, bar;");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(2);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("foo");
        expect(entries[0].localName.token.value).to.be("foo");

        expect(entries[1].exportName.token.value).to.be("bar");
        expect(entries[1].localName.token.value).to.be("bar");
    });

    it("should make an entry from a export of an function declaration", function() {
        var t = getTerm("export function foo() {};");
        var entries = makeExportEntries(t);

        expect(entries.length).to.be(1);
        expect(entries[0].moduleRequest).to.be(null);
        expect(entries[0].exportName.token.value).to.be("foo");
        expect(entries[0].localName.token.value).to.be("foo");
    });

    // it("should make an entry from a export of a macro declaration", function() {
    //     var t = getTerm("export macro foo { (function() {}) };");
    //     var entries = makeExportEntries(t);

    //     expect(entries.length).to.be(1);
    //     expect(entries[0].moduleRequest).to.be(null);
    //     expect(entries[0].exportName[0].token.value).to.be("foo");
    //     expect(entries[0].localName[0].token.value).to.be("foo");
    // });
});
