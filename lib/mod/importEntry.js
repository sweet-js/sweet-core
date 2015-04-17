"use strict";

var assert7415 = require("assert"),
    syn7416 = require("../syntax"),
    _7417 = require("underscore"),
    NamedImportTerm7418 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7419 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7420 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7421 = syn7416.makeMultiToken;
function ImportEntry7422(term7424, importName7425, localName7426) {
    this._term = term7424;
    this.moduleRequest = term7424.from;
    this.importName = makeMultiToken7421(importName7425);
    this.localName = makeMultiToken7421(localName7426);
    if (term7424.isImportTerm) {
        this.forPhase = 0;
    } else if (term7424.isImportForPhaseTerm) {
        this.forPhase = term7424.phase.token.value;
    } else {
        assert7415(false, "not implemented yet");
    }
}
ImportEntry7422.prototype.toTerm = function () {
    var term7427 = _7417.clone(this._term);
    if (syn7416.unwrapSyntax(this.importName) === "*") {
        term7427.clause = [NamespaceImportTerm7420.create(this.importName, syn7416.makeIdent("as", this.importName), this.localName)];
    } else if (syn7416.unwrapSyntax(this.importName) === "default") {
        term7427.clause = [DefaultImportTerm7419.create(this.localName)];
    } else {
        var innerTokens7428;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7428 = [this.localName];
        } else {
            innerTokens7428 = [this.importName, syn7416.makeIdent("as", this.importName), this.localName];
        }
        term7427.clause = [NamedImportTerm7418.create(syn7416.makeDelim("{}", innerTokens7428, term7427.kw))];
    }
    return term7427;
};
function makeImportEntries7423(imp7429) {
    assert7415(imp7429.isImportTerm || imp7429.isImportForPhaseTerm, "expecting an import term");
    var res7430 = [];
    imp7429.clause.forEach(function (clause7431) {
        if (clause7431.isNamedImportTerm) {
            assert7415(clause7431.names.isDelimiter(), "expecting a delimiter token");
            var names7432 = clause7431.names.token.inner;
            for (var i7433 = 0; i7433 < names7432.length; i7433++) {
                if (names7432[i7433] && names7432[i7433 + 1] && names7432[i7433 + 1].token.value === "as") {
                    res7430.push(new ImportEntry7422(imp7429, names7432[i7433], names7432[i7433 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7433 += 3;
                } else if (names7432[i7433]) {
                    res7430.push(new ImportEntry7422(imp7429, names7432[i7433], names7432[i7433]));
                    // walk past the comma
                    i7433++;
                }
            }
        } else if (clause7431.isDefaultImportTerm) {
            res7430.push(new ImportEntry7422(imp7429, syn7416.makeKeyword("default", clause7431.name), clause7431.name));
        } else if (clause7431.isNamespaceImportTerm) {
            res7430.push(new ImportEntry7422(imp7429, clause7431.star, clause7431.name));
        } else if (!clause7431.isPunctuator()) {
            assert7415(false, "not implemented yet");
        }
    });
    return res7430;
}
exports.makeImportEntries = makeImportEntries7423;
exports.ImportEntry = ImportEntry7422;
//# sourceMappingURL=importEntry.js.map