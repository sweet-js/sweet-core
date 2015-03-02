"use strict";

var assert = require("assert"),
    syn = require("../syntax"),
    _ = require("underscore"),
    NamedImportTerm = require("../data/termTree").NamedImportTerm,
    DefaultImportTerm = require("../data/termTree").DefaultImportTerm,
    NamespaceImportTerm = require("../data/termTree").NamespaceImportTerm;
var makeMultiToken = syn.makeMultiToken;
function ImportEntry(term, importName, localName) {
    this._term = term;
    this.moduleRequest = term.from;
    this.importName = makeMultiToken(importName);
    this.localName = makeMultiToken(localName);
    if (term.isImportTerm) {
        this.forPhase = 0;
    } else if (term.isImportForMacrosTerm) {
        this.forPhase = 1;
    } else {
        assert(false, "not implemented yet");
    }
}
ImportEntry.prototype.toTerm = function () {
    var term = _.clone(this._term);
    if (syn.unwrapSyntax(this.importName) === "*") {
        term.clause = [NamespaceImportTerm.create(this.importName, syn.makeIdent("as", this.importName), this.localName)];
    } else if (syn.unwrapSyntax(this.importName) === "default") {
        term.clause = [DefaultImportTerm.create(this.localName)];
    } else {
        var innerTokens;
        if (this.importName.token.value === this.localName.token.value) {
            innerTokens = [this.localName];
        } else {
            innerTokens = [this.importName, syn.makeIdent("as", this.importName), this.localName];
        }
        term.clause = [NamedImportTerm.create(syn.makeDelim("{}", innerTokens, term.kw))];
    }
    return term;
};
function makeImportEntries(imp) {
    assert(imp.isImportTerm || imp.isImportForMacrosTerm, "expecting an import term");
    var res = [];
    imp.clause.forEach(function (clause) {
        if (clause.isNamedImportTerm) {
            assert(clause.names.isDelimiter(), "expecting a delimiter token");
            var names = clause.names.token.inner;
            for (var i = 0; i < names.length; i++) {
                if (names[i] && names[i + 1] && names[i + 1].token.value === "as") {
                    res.push(new ImportEntry(imp, names[i], names[i + 2]));
                    // walk past the `as <name>` tokens and comma
                    i += 3;
                } else if (names[i]) {
                    res.push(new ImportEntry(imp, names[i], names[i]));
                    // walk past the comma
                    i++;
                }
            }
        } else if (clause.isDefaultImportTerm) {
            res.push(new ImportEntry(imp, syn.makeKeyword("default", clause.name), clause.name));
        } else if (clause.isNamespaceImportTerm) {
            res.push(new ImportEntry(imp, clause.star, clause.name));
        } else if (!clause.isPunctuator()) {
            assert(false, "not implemented yet");
        }
    });
    return res;
}
exports.makeImportEntries = makeImportEntries;
exports.ImportEntry = ImportEntry;
//# sourceMappingURL=importEntry.js.map