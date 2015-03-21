"use strict";

var assert6803 = require("assert"),
    syn6804 = require("../syntax"),
    _6805 = require("underscore");
var makeMultiToken6806 = syn6804.makeMultiToken;
var throwSyntaxError6807 = syn6804.throwSyntaxError;
function ExportEntry6808(term6810, exportName6811, localName6812) {
    this._term = term6810;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6806(exportName6811);
    this.localName = makeMultiToken6806(localName6812);
}
function makeExportEntries6809(exp6813) {
    assert6803(exp6813.isExportNameTerm || exp6813.isExportDefaultTerm || exp6813.isExportDeclTerm, "expecting an export term");
    var res6814 = [];
    if (exp6813.isExportNameTerm) {
        assert6803(exp6813.name.isDelimiter(), "expecting a delimiter token");
        var names6815 = exp6813.name.token.inner;
        for (var i6816 = 0; i6816 < names6815.length; i6816++) {
            if (names6815[i6816] && names6815[i6816 + 1] && names6815[i6816 + 1].token.value === "as") {
                res6814.push(new ExportEntry6808(exp6813, names6815[i6816 + 2], names6815[i6816]));
                // walk past the `as <name>` tokens and the comma
                i6816 += 3;
            } else if (names6815[i6816]) {
                res6814.push(new ExportEntry6808(exp6813, names6815[i6816], names6815[i6816]));
                // walk past the comma
                i6816++;
            }
        }
    } else if (exp6813.isExportDefaultTerm) {
        var localName6817;
        if (exp6813.decl.isIdTerm) {
            localName6817 = exp6813.decl.id;
        } else if (exp6813.decl.isNamedFunTerm) {
            localName6817 = exp6813.decl.name;
        } else if (exp6813.decl.isMacroTerm || exp6813.decl.isLetMacroTerm) {
            localName6817 = syn6804.makeDelim("()", [exp6813.decl.name], exp6813.decl.name);
        } else if (exp6813.decl.isExprTerm) {
            localName6817 = syn6804.makeIdent("*default*", exp6813.defaultkw);
        } else {
            throwSyntaxError6807("export", "export form is not supported", exp6813.decl);
        }
        res6814.push(new ExportEntry6808(exp6813, exp6813.defaultkw, localName6817));
    } else if (exp6813.isExportDeclTerm) {
        if (exp6813.decl.isVariableStatementTerm || exp6813.decl.isConstStatementTerm || exp6813.decl.isLetStatementTerm) {
            exp6813.decl.decls.forEach(function (decl6818) {
                res6814.push(new ExportEntry6808(exp6813, decl6818.ident, decl6818.ident));
            });
        } else if (exp6813.decl.isNamedFunTerm) {
            res6814.push(new ExportEntry6808(exp6813, exp6813.decl.name, exp6813.decl.name));
        } else if (exp6813.decl.isMacroTerm || exp6813.decl.isLetMacroTerm) {
            var macName6819 = syn6804.makeDelim("()", exp6813.decl.name, exp6813.decl.name[0]);
            res6814.push(new ExportEntry6808(exp6813, macName6819, macName6819));
        } else {
            throwSyntaxError6807("export", "export form is not supported", exp6813.decl);
        }
    } else {
        assert6803(false, "not implemented yet");
    }
    return res6814;
}
exports.makeExportEntries = makeExportEntries6809;
exports.ExportEntry = ExportEntry6808;
//# sourceMappingURL=exportEntry.js.map