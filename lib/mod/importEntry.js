"use strict";

var assert7611 = require("assert"),
    syn7612 = require("../syntax"),
    _7613 = require("underscore"),
    NamedImportTerm7614 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7615 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7616 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7617 = syn7612.makeMultiToken;
function ImportEntry7618(term7620, importName7621, localName7622) {
    this._term = term7620;
    this.moduleRequest = term7620.from;
    this.importName = makeMultiToken7617(importName7621);
    this.localName = makeMultiToken7617(localName7622);
    if (term7620.isImportTerm) {
        this.forPhase = 0;
    } else if (term7620.isImportForPhaseTerm) {
        this.forPhase = term7620.phase.token.value;
    } else {
        assert7611(false, "not implemented yet");
    }
}
ImportEntry7618.prototype.toTerm = function () {
    var term7623 = _7613.clone(this._term);
    if (syn7612.unwrapSyntax(this.importName) === "*") {
        term7623.clause = [NamespaceImportTerm7616.create(this.importName, syn7612.makeIdent("as", this.importName), this.localName)];
    } else if (syn7612.unwrapSyntax(this.importName) === "default") {
        term7623.clause = [DefaultImportTerm7615.create(this.localName)];
    } else {
        var innerTokens7624;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7624 = [this.localName];
        } else {
            innerTokens7624 = [this.importName, syn7612.makeIdent("as", this.importName), this.localName];
        }
        term7623.clause = [NamedImportTerm7614.create(syn7612.makeDelim("{}", innerTokens7624, term7623.kw))];
    }
    return term7623;
};
function makeImportEntries7619(imp7625) {
    assert7611(imp7625.isImportTerm || imp7625.isImportForPhaseTerm, "expecting an import term");
    var res7626 = [];
    imp7625.clause.forEach(function (clause7627) {
        if (clause7627.isNamedImportTerm) {
            assert7611(clause7627.names.isDelimiter(), "expecting a delimiter token");
            var names7628 = clause7627.names.token.inner;
            for (var i7629 = 0; i7629 < names7628.length; i7629++) {
                if (names7628[i7629] && names7628[i7629 + 1] && names7628[i7629 + 1].token.value === "as") {
                    res7626.push(new ImportEntry7618(imp7625, names7628[i7629], names7628[i7629 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7629 += 3;
                } else if (names7628[i7629]) {
                    res7626.push(new ImportEntry7618(imp7625, names7628[i7629], names7628[i7629]));
                    // walk past the comma
                    i7629++;
                }
            }
        } else if (clause7627.isDefaultImportTerm) {
            res7626.push(new ImportEntry7618(imp7625, syn7612.makeKeyword("default", clause7627.name), clause7627.name));
        } else if (clause7627.isNamespaceImportTerm) {
            res7626.push(new ImportEntry7618(imp7625, clause7627.star, clause7627.name));
        } else if (!clause7627.isPunctuator()) {
            assert7611(false, "not implemented yet");
        }
    });
    return res7626;
}
exports.makeImportEntries = makeImportEntries7619;
exports.ImportEntry = ImportEntry7618;
//# sourceMappingURL=importEntry.js.map