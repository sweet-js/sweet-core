"use strict";

var assert7627 = require("assert"),
    syn7628 = require("../syntax"),
    _7629 = require("underscore"),
    NamedImportTerm7630 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7631 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7632 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7633 = syn7628.makeMultiToken;
function ImportEntry7634(term7636, importName7637, localName7638) {
    this._term = term7636;
    this.moduleRequest = term7636.from;
    this.importName = makeMultiToken7633(importName7637);
    this.localName = makeMultiToken7633(localName7638);
    if (term7636.isImportTerm) {
        this.forPhase = 0;
    } else if (term7636.isImportForPhaseTerm) {
        this.forPhase = term7636.phase.token.value;
    } else {
        assert7627(false, "not implemented yet");
    }
}
ImportEntry7634.prototype.toTerm = function () {
    var term7639 = _7629.clone(this._term);
    if (syn7628.unwrapSyntax(this.importName) === "*") {
        term7639.clause = [NamespaceImportTerm7632.create(this.importName, syn7628.makeIdent("as", this.importName), this.localName)];
    } else if (syn7628.unwrapSyntax(this.importName) === "default") {
        term7639.clause = [DefaultImportTerm7631.create(this.localName)];
    } else {
        var innerTokens7640;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7640 = [this.localName];
        } else {
            innerTokens7640 = [this.importName, syn7628.makeIdent("as", this.importName), this.localName];
        }
        term7639.clause = [NamedImportTerm7630.create(syn7628.makeDelim("{}", innerTokens7640, term7639.kw))];
    }
    return term7639;
};
function makeImportEntries7635(imp7641) {
    assert7627(imp7641.isImportTerm || imp7641.isImportForPhaseTerm, "expecting an import term");
    var res7642 = [];
    imp7641.clause.forEach(function (clause7643) {
        if (clause7643.isNamedImportTerm) {
            assert7627(clause7643.names.isDelimiter(), "expecting a delimiter token");
            var names7644 = clause7643.names.token.inner;
            for (var i7645 = 0; i7645 < names7644.length; i7645++) {
                if (names7644[i7645] && names7644[i7645 + 1] && names7644[i7645 + 1].token.value === "as") {
                    res7642.push(new ImportEntry7634(imp7641, names7644[i7645], names7644[i7645 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7645 += 3;
                } else if (names7644[i7645]) {
                    res7642.push(new ImportEntry7634(imp7641, names7644[i7645], names7644[i7645]));
                    // walk past the comma
                    i7645++;
                }
            }
        } else if (clause7643.isDefaultImportTerm) {
            res7642.push(new ImportEntry7634(imp7641, syn7628.makeKeyword("default", clause7643.name), clause7643.name));
        } else if (clause7643.isNamespaceImportTerm) {
            res7642.push(new ImportEntry7634(imp7641, clause7643.star, clause7643.name));
        } else if (!clause7643.isPunctuator()) {
            assert7627(false, "not implemented yet");
        }
    });
    return res7642;
}
exports.makeImportEntries = makeImportEntries7635;
exports.ImportEntry = ImportEntry7634;
//# sourceMappingURL=importEntry.js.map