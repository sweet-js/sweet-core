"use strict";

var assert7615 = require("assert"),
    syn7616 = require("../syntax"),
    _7617 = require("underscore"),
    NamedImportTerm7618 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7619 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7620 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7621 = syn7616.makeMultiToken;
function ImportEntry7622(term7624, importName7625, localName7626) {
    this._term = term7624;
    this.moduleRequest = term7624.from;
    this.importName = makeMultiToken7621(importName7625);
    this.localName = makeMultiToken7621(localName7626);
    if (term7624.isImportTerm) {
        this.forPhase = 0;
    } else if (term7624.isImportForPhaseTerm) {
        this.forPhase = term7624.phase.token.value;
    } else {
        assert7615(false, "not implemented yet");
    }
}
ImportEntry7622.prototype.toTerm = function () {
    var term7627 = _7617.clone(this._term);
    if (syn7616.unwrapSyntax(this.importName) === "*") {
        term7627.clause = [NamespaceImportTerm7620.create(this.importName, syn7616.makeIdent("as", this.importName), this.localName)];
    } else if (syn7616.unwrapSyntax(this.importName) === "default") {
        term7627.clause = [DefaultImportTerm7619.create(this.localName)];
    } else {
        var innerTokens7628;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7628 = [this.localName];
        } else {
            innerTokens7628 = [this.importName, syn7616.makeIdent("as", this.importName), this.localName];
        }
        term7627.clause = [NamedImportTerm7618.create(syn7616.makeDelim("{}", innerTokens7628, term7627.kw))];
    }
    return term7627;
};
function makeImportEntries7623(imp7629) {
    assert7615(imp7629.isImportTerm || imp7629.isImportForPhaseTerm, "expecting an import term");
    var res7630 = [];
    imp7629.clause.forEach(function (clause7631) {
        if (clause7631.isNamedImportTerm) {
            assert7615(clause7631.names.isDelimiter(), "expecting a delimiter token");
            var names7632 = clause7631.names.token.inner;
            for (var i7633 = 0; i7633 < names7632.length; i7633++) {
                if (names7632[i7633] && names7632[i7633 + 1] && names7632[i7633 + 1].token.value === "as") {
                    res7630.push(new ImportEntry7622(imp7629, names7632[i7633], names7632[i7633 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7633 += 3;
                } else if (names7632[i7633]) {
                    res7630.push(new ImportEntry7622(imp7629, names7632[i7633], names7632[i7633]));
                    // walk past the comma
                    i7633++;
                }
            }
        } else if (clause7631.isDefaultImportTerm) {
            res7630.push(new ImportEntry7622(imp7629, syn7616.makeKeyword("default", clause7631.name), clause7631.name));
        } else if (clause7631.isNamespaceImportTerm) {
            res7630.push(new ImportEntry7622(imp7629, clause7631.star, clause7631.name));
        } else if (!clause7631.isPunctuator()) {
            assert7615(false, "not implemented yet");
        }
    });
    return res7630;
}
exports.makeImportEntries = makeImportEntries7623;
exports.ImportEntry = ImportEntry7622;
//# sourceMappingURL=importEntry.js.map