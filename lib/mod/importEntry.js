"use strict";

var assert7643 = require("assert"),
    syn7644 = require("../syntax"),
    _7645 = require("underscore"),
    NamedImportTerm7646 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7647 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7648 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7649 = syn7644.makeMultiToken;
function ImportEntry7650(term7652, importName7653, localName7654) {
    this._term = term7652;
    this.moduleRequest = term7652.from;
    this.importName = makeMultiToken7649(importName7653);
    this.localName = makeMultiToken7649(localName7654);
    if (term7652.isImportTerm) {
        this.forPhase = 0;
    } else if (term7652.isImportForPhaseTerm) {
        this.forPhase = term7652.phase.token.value;
    } else {
        assert7643(false, "not implemented yet");
    }
}
ImportEntry7650.prototype.toTerm = function () {
    var term7655 = _7645.clone(this._term);
    if (syn7644.unwrapSyntax(this.importName) === "*") {
        term7655.clause = [NamespaceImportTerm7648.create(this.importName, syn7644.makeIdent("as", this.importName), this.localName)];
    } else if (syn7644.unwrapSyntax(this.importName) === "default") {
        term7655.clause = [DefaultImportTerm7647.create(this.localName)];
    } else {
        var innerTokens7656;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7656 = [this.localName];
        } else {
            innerTokens7656 = [this.importName, syn7644.makeIdent("as", this.importName), this.localName];
        }
        term7655.clause = [NamedImportTerm7646.create(syn7644.makeDelim("{}", innerTokens7656, term7655.kw))];
    }
    return term7655;
};
function makeImportEntries7651(imp7657) {
    assert7643(imp7657.isImportTerm || imp7657.isImportForPhaseTerm, "expecting an import term");
    var res7658 = [];
    imp7657.clause.forEach(function (clause7659) {
        if (clause7659.isNamedImportTerm) {
            assert7643(clause7659.names.isDelimiter(), "expecting a delimiter token");
            var names7660 = clause7659.names.token.inner;
            for (var i7661 = 0; i7661 < names7660.length; i7661++) {
                if (names7660[i7661] && names7660[i7661 + 1] && names7660[i7661 + 1].token.value === "as") {
                    res7658.push(new ImportEntry7650(imp7657, names7660[i7661], names7660[i7661 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7661 += 3;
                } else if (names7660[i7661]) {
                    res7658.push(new ImportEntry7650(imp7657, names7660[i7661], names7660[i7661]));
                    // walk past the comma
                    i7661++;
                }
            }
        } else if (clause7659.isDefaultImportTerm) {
            res7658.push(new ImportEntry7650(imp7657, syn7644.makeKeyword("default", clause7659.name), clause7659.name));
        } else if (clause7659.isNamespaceImportTerm) {
            res7658.push(new ImportEntry7650(imp7657, clause7659.star, clause7659.name));
        } else if (!clause7659.isPunctuator()) {
            assert7643(false, "not implemented yet");
        }
    });
    return res7658;
}
exports.makeImportEntries = makeImportEntries7651;
exports.ImportEntry = ImportEntry7650;
//# sourceMappingURL=importEntry.js.map