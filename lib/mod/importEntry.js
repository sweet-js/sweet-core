"use strict";

var assert7575 = require("assert"),
    syn7576 = require("../syntax"),
    _7577 = require("underscore"),
    NamedImportTerm7578 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7579 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7580 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7581 = syn7576.makeMultiToken;
function ImportEntry7582(term7584, importName7585, localName7586) {
    this._term = term7584;
    this.moduleRequest = term7584.from;
    this.importName = makeMultiToken7581(importName7585);
    this.localName = makeMultiToken7581(localName7586);
    if (term7584.isImportTerm) {
        this.forPhase = 0;
    } else if (term7584.isImportForPhaseTerm) {
        this.forPhase = term7584.phase.token.value;
    } else {
        assert7575(false, "not implemented yet");
    }
}
ImportEntry7582.prototype.toTerm = function () {
    var term7587 = _7577.clone(this._term);
    if (syn7576.unwrapSyntax(this.importName) === "*") {
        term7587.clause = [NamespaceImportTerm7580.create(this.importName, syn7576.makeIdent("as", this.importName), this.localName)];
    } else if (syn7576.unwrapSyntax(this.importName) === "default") {
        term7587.clause = [DefaultImportTerm7579.create(this.localName)];
    } else {
        var innerTokens7588;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7588 = [this.localName];
        } else {
            innerTokens7588 = [this.importName, syn7576.makeIdent("as", this.importName), this.localName];
        }
        term7587.clause = [NamedImportTerm7578.create(syn7576.makeDelim("{}", innerTokens7588, term7587.kw))];
    }
    return term7587;
};
function makeImportEntries7583(imp7589) {
    assert7575(imp7589.isImportTerm || imp7589.isImportForPhaseTerm, "expecting an import term");
    var res7590 = [];
    imp7589.clause.forEach(function (clause7591) {
        if (clause7591.isNamedImportTerm) {
            assert7575(clause7591.names.isDelimiter(), "expecting a delimiter token");
            var names7592 = clause7591.names.token.inner;
            for (var i7593 = 0; i7593 < names7592.length; i7593++) {
                if (names7592[i7593] && names7592[i7593 + 1] && names7592[i7593 + 1].token.value === "as") {
                    res7590.push(new ImportEntry7582(imp7589, names7592[i7593], names7592[i7593 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7593 += 3;
                } else if (names7592[i7593]) {
                    res7590.push(new ImportEntry7582(imp7589, names7592[i7593], names7592[i7593]));
                    // walk past the comma
                    i7593++;
                }
            }
        } else if (clause7591.isDefaultImportTerm) {
            res7590.push(new ImportEntry7582(imp7589, syn7576.makeKeyword("default", clause7591.name), clause7591.name));
        } else if (clause7591.isNamespaceImportTerm) {
            res7590.push(new ImportEntry7582(imp7589, clause7591.star, clause7591.name));
        } else if (!clause7591.isPunctuator()) {
            assert7575(false, "not implemented yet");
        }
    });
    return res7590;
}
exports.makeImportEntries = makeImportEntries7583;
exports.ImportEntry = ImportEntry7582;
//# sourceMappingURL=importEntry.js.map