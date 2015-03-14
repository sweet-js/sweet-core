"use strict";

var assert7253 = require("assert"),
    syn7254 = require("../syntax"),
    _7255 = require("underscore"),
    NamedImportTerm7256 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7257 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7258 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7259 = syn7254.makeMultiToken;
function ImportEntry7260(term7262, importName7263, localName7264) {
    this._term = term7262;
    this.moduleRequest = term7262.from;
    this.importName = makeMultiToken7259(importName7263);
    this.localName = makeMultiToken7259(localName7264);
    if (term7262.isImportTerm) {
        this.forPhase = 0;
    } else if (term7262.isImportForMacrosTerm) {
        this.forPhase = 1;
    } else {
        assert7253(false, "not implemented yet");
    }
}
ImportEntry7260.prototype.toTerm = function () {
    var term7265 = _7255.clone(this._term);
    if (syn7254.unwrapSyntax(this.importName) === "*") {
        term7265.clause = [NamespaceImportTerm7258.create(this.importName, syn7254.makeIdent("as", this.importName), this.localName)];
    } else if (syn7254.unwrapSyntax(this.importName) === "default") {
        term7265.clause = [DefaultImportTerm7257.create(this.localName)];
    } else {
        var innerTokens7266;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7266 = [this.localName];
        } else {
            innerTokens7266 = [this.importName, syn7254.makeIdent("as", this.importName), this.localName];
        }
        term7265.clause = [NamedImportTerm7256.create(syn7254.makeDelim("{}", innerTokens7266, term7265.kw))];
    }
    return term7265;
};
function makeImportEntries7261(imp7267) {
    assert7253(imp7267.isImportTerm || imp7267.isImportForMacrosTerm, "expecting an import term");
    var res7268 = [];
    imp7267.clause.forEach(function (clause7269) {
        if (clause7269.isNamedImportTerm) {
            assert7253(clause7269.names.isDelimiter(), "expecting a delimiter token");
            var names7270 = clause7269.names.token.inner;
            for (var i7271 = 0; i7271 < names7270.length; i7271++) {
                if (names7270[i7271] && names7270[i7271 + 1] && names7270[i7271 + 1].token.value === "as") {
                    res7268.push(new ImportEntry7260(imp7267, names7270[i7271], names7270[i7271 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7271 += 3;
                } else if (names7270[i7271]) {
                    res7268.push(new ImportEntry7260(imp7267, names7270[i7271], names7270[i7271]));
                    // walk past the comma
                    i7271++;
                }
            }
        } else if (clause7269.isDefaultImportTerm) {
            res7268.push(new ImportEntry7260(imp7267, syn7254.makeKeyword("default", clause7269.name), clause7269.name));
        } else if (clause7269.isNamespaceImportTerm) {
            res7268.push(new ImportEntry7260(imp7267, clause7269.star, clause7269.name));
        } else if (!clause7269.isPunctuator()) {
            assert7253(false, "not implemented yet");
        }
    });
    return res7268;
}
exports.makeImportEntries = makeImportEntries7261;
exports.ImportEntry = ImportEntry7260;
//# sourceMappingURL=importEntry.js.map