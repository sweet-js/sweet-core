#lang "../../macros/stxcase.js";
"use strict";

var assert = require("assert"),
    syn = require("../syntax"),
    _ = require("underscore");

var makeMultiToken = syn.makeMultiToken;
var throwSyntaxError = syn.throwSyntaxError;

function ExportEntry(term, exportName, localName) {
    this._term = term;
    this.moduleRequest = null;
    this.exportName = makeMultiToken(exportName);
    this.localName = makeMultiToken(localName);
}

ExportEntry.prototype.toTerm = function() {
    var term = _.clone(this._term);
    // if (term.clause.isNamedImportTerm) {
    //     term.clause = _.clone(term.clause);
    //     term.clause.names = term.clause.names.clone();

    //     if (this.importName.token.value === this.localName.token.value) {
    //         term.clause.names.token.inner = [this.localName];
    //     } else {
    //         term.clause.names.token.inner = [this.importName,
    //                                          syn.makeIdent("as", this.importName),
    //                                          this.localName];
    //     }
    // }
    return term;
};

function makeExportEntries(exp) {
    assert(exp.isExportNameTerm || exp.isExportDefaultTerm || exp.isExportDeclTerm,
           "expecting an export term");
    var res = [];

    if (exp.isExportNameTerm) {
        assert(exp.name.isDelimiter(), "expecting a delimiter token");
        var names = exp.name.token.inner;

        for (var i = 0; i < names.length; i++) {
            if (names[i] && names[i + 1] &&
                names[i + 1].token.value === "as") {
                res.push(new ExportEntry(exp, names[i + 2], names[i]));
                // walk past the `as <name>` tokens and the comma
                i += 3;
            } else if (names[i]) {
                res.push(new ExportEntry(exp, names[i], names[i]));
                // walk past the comma
                i++;
            }
        }
    } else if (exp.isExportDefaultTerm) {
        var localName;
        if (exp.decl.isIdTerm) {
            localName = exp.decl.id;
        } else if (exp.decl.isNamedFunTerm) {
            localName = exp.decl.name;
        } else if (exp.decl.isMacroTerm || exp.decl.isLetMacroTerm) {
            localName = syn.makeDelim("()", [exp.decl.name], exp.decl.name);
        } else if (exp.decl.isExprTerm) {
            localName = syn.makeIdent("*default*", exp.defaultkw);
        } else {
            throwSyntaxError("export",
                             "export form is not supported",
                             exp.decl);
        }
        res.push(new ExportEntry(exp,
                                 exp.defaultkw,
                                 localName));
    } else if (exp.isExportDeclTerm) {
        if (exp.decl.isVariableStatementTerm ||
            exp.decl.isConstStatementTerm ||
            exp.decl.isLetStatementTerm) {
            exp.decl.decls.forEach(function(decl) {
                res.push(new ExportEntry(exp, decl.ident, decl.ident));
            });
        } else if (exp.decl.isNamedFunTerm) {
            res.push(new ExportEntry(exp, exp.decl.name, exp.decl.name));
        } else if (exp.decl.isMacroTerm || exp.decl.isLetMacroTerm) {
            var macName = syn.makeDelim("()", exp.decl.name, exp.decl.name[0]);
            res.push(new ExportEntry(exp, macName, macName));
        } else {
            throwSyntaxError("export",
                             "export form is not supported",
                             exp.decl);
        }
    } else {
        assert(false, "not implemented yet");
    }
    return res;
}

exports.makeExportEntries = makeExportEntries;
exports.ExportEntry = ExportEntry;
