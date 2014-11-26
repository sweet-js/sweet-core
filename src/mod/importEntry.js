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
    var that = this;
    term.clause = term.clause.map(function(clause) {
        if (clause.isNamedImportTerm) {
            clause = _.clone(clause);
            clause.names = clause.names.clone();

            if (that.importName.token.value === that.localName.token.value) {
                clause.names.token.inner = [that.localName];
            } else {
                clause.names.token.inner = [that.importName,
                                            syn.makeIdent("as", that.importName),
                                            that.localName];
            }
        } else {
            assert(false, "not implemented yet");
        }
        return clause;
    });
    return term;
};

function makeImportEntries(imp) {
    assert(imp.isImportTerm || imp.isImportForMacrosTerm, "expecting an import term");
    var res = [];

    imp.clause.forEach(function(clause) {
        if (clause.isNamedImportTerm) {
            assert(clause.names.isDelimiter(), "expecting a delimiter token");
            var names = clause.names.token.inner;

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
        } else if (clause.isDefaultImportTerm) {
            res.push(new ImportEntry(imp,
                                     syn.makeKeyword("default", clause.name),
                                     clause.name));
        } else if (clause.isNamespaceImportTerm) {
            res.push(new ImportEntry(imp,
                                     clause.star,
                                     clause.name));
        } else if (!clause.isPunctuator()) {
            assert(false, "not implemented yet");
        }
    });
    return res;
}

exports.makeImportEntries = makeImportEntries;
exports.ImportEntry = ImportEntry;
