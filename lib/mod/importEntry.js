"use strict";

var assert7579 = require("assert"),
    syn7580 = require("../syntax"),
    _7581 = require("underscore"),
    NamedImportTerm7582 = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm7583 = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm7584 = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken7585 = syn7580.makeMultiToken;
function ImportEntry7586(term7588, importName7589, localName7590) {
    this._term = term7588;
    this.moduleRequest = term7588.from;
    this.importName = makeMultiToken7585(importName7589);
    this.localName = makeMultiToken7585(localName7590);
    if (term7588.isImportTerm) {
        this.forPhase = 0;
    } else if (term7588.isImportForPhaseTerm) {
        this.forPhase = term7588.phase.token.value;
    } else {
        assert7579(false, "not implemented yet");
    }
}
ImportEntry7586.prototype.toTerm = function () {
    var term7591 = _7581.clone(this._term);
    if (syn7580.unwrapSyntax(this.importName) === "*") {
        term7591.clause = [NamespaceImportTerm7584.create(this.importName, syn7580.makeIdent("as", this.importName), this.localName)];
    } else if (syn7580.unwrapSyntax(this.importName) === "default") {
        term7591.clause = [DefaultImportTerm7583.create(this.localName)];
    } else {
        var innerTokens7592;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens7592 = [this.localName];
        } else {
            innerTokens7592 = [this.importName, syn7580.makeIdent("as", this.importName), this.localName];
        }
        term7591.clause = [NamedImportTerm7582.create(syn7580.makeDelim("{}", innerTokens7592, term7591.kw))];
    }
    return term7591;
};
function makeImportEntries7587(imp7593) {
    assert7579(imp7593.isImportTerm || imp7593.isImportForPhaseTerm, "expecting an import term");
    var res7594 = [];
    imp7593.clause.forEach(function (clause7595) {
        if (clause7595.isNamedImportTerm) {
            assert7579(clause7595.names.isDelimiter(), "expecting a delimiter token");
            var names7596 = clause7595.names.token.inner;
            for (var i7597 = 0; i7597 < names7596.length; i7597++) {
                if (names7596[i7597] && names7596[i7597 + 1] && names7596[i7597 + 1].token.value === "as") {
                    res7594.push(new ImportEntry7586(imp7593, names7596[i7597], names7596[i7597 + 2]));
                    // walk past the `as <name>` tokens and comma
                    i7597 += 3;
                } else if (names7596[i7597]) {
                    res7594.push(new ImportEntry7586(imp7593, names7596[i7597], names7596[i7597]));
                    // walk past the comma
                    i7597++;
                }
            }
        } else if (clause7595.isDefaultImportTerm) {
            res7594.push(new ImportEntry7586(imp7593, syn7580.makeKeyword("default", clause7595.name), clause7595.name));
        } else if (clause7595.isNamespaceImportTerm) {
            res7594.push(new ImportEntry7586(imp7593, clause7595.star, clause7595.name));
        } else if (!clause7595.isPunctuator()) {
            assert7579(false, "not implemented yet");
        }
    });
    return res7594;
}
exports.makeImportEntries = makeImportEntries7587;
exports.ImportEntry = ImportEntry7586;
//# sourceMappingURL=importEntry.js.map