#lang "../../macros/stxcase.js";
"use strict";

var assert = require("assert"),
    syn = require("../syntax"),
    _ = require("underscore");


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
    var term = _.clone(this._term);
    if (term.clause.isNamedImportTerm) {
        term.clause = _.clone(term.clause);
        term.clause.names = term.clause.names.clone();

        if (this.importName.token.value === this.localName.token.value) {
            term.clause.names.token.inner = [this.localName];
        } else {
            term.clause.names.token.inner = [this.importName,
                                             syn.makeIdent("as", this.importName),
                                             this.localName];
        }
    }
    return term;
};

function makeImportEntries(imp) {
    assert(imp.isImportTerm || imp.isImportForMacrosTerm, "expecting an import term");
    var res = [];

    if (imp.clause.isNamedImportTerm) {
        assert(imp.clause.names.isDelimiter(), "expecting a delimiter token");
        var names = imp.clause.names.token.inner;

        for (var i = 0; i < names.length; i++) {
            if (names[i] && names[i + 1] &&
                names[i + 1].token.value === "as") {
                res.push(new ImportEntry(imp, names[i], names[i + 2]));
                // walk past the `as <name>` tokens and comma
                i += 3;
            } else if (names[i]) {
                res.push(new ImportEntry(imp, names[i], names[i]));
                // walk past the comma
                i++;
            }
        }
    } else {
        assert(false, "not implemented yet");
    }
    return res;
}

exports.makeImportEntries = makeImportEntries;
exports.ImportEntry = ImportEntry;
