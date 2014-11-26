#lang "../../macros/stxcase.js";
"use strict";

var assert = require("assert");

function ImportEntry(term, importName, localName) {
    this._term = term;
    this.moduleRequest = term.from;
    this.importName = importName;
    this.localName = localName;
    if (term.isImportTerm) {
        this.forPhase = 0;
    } else if (term.isImportForMacrosTerm) {
        this.forPhase = 1;
    } else {
        assert(false, "not implemented yet");
    }
}

ImportEntry.prototype.toTerm = function() {
    return this._term;
};

function makeImportEntries(imp) {
    assert(imp.isImportTerm || imp.isImportForMacrosTerm, "expecting an import term");
    var res = [];

    if (imp.clause.isNamedImportTerm) {
        assert(imp.clause.names.isDelimiter(), "expecting a delimiter token");
        var names = imp.clause.names.token.inner;

        for (var i = 0; i < names.length; i++) {
            if (names[i].isIdentifier() &&
                names[i + 1] &&
                names[i + 1].token.value === "as") {
                res.push(new ImportEntry(imp, names[i], names[i + 2]));
                // walk past the `as <name>` tokens
                i += 2;
            } else if (names[i].isIdentifier()) {
                res.push(new ImportEntry(imp, names[i], names[i]));
            }
        }
    }
    return res;
}

exports.makeImportEntries = makeImportEntries;
exports.ImportEntry = ImportEntry;
