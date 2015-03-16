"use strict";

var assert6807 = require("assert"),
    syn6808 = require("../syntax"),
    _6809 = require("underscore");
var makeMultiToken6810 = syn6808.makeMultiToken;
var throwSyntaxError6811 = syn6808.throwSyntaxError;
function ExportEntry6812(term6814, exportName6815, localName6816) {
    this._term = term6814;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6810(exportName6815);
    this.localName = makeMultiToken6810(localName6816);
}
function makeExportEntries6813(exp6817) {
    assert6807(exp6817.isExportNameTerm || exp6817.isExportDefaultTerm || exp6817.isExportDeclTerm, "expecting an export term");
    var res6818 = [];
    if (exp6817.isExportNameTerm) {
        assert6807(exp6817.name.isDelimiter(), "expecting a delimiter token");
        var names6819 = exp6817.name.token.inner;
        for (var i6820 = 0; i6820 < names6819.length; i6820++) {
            if (names6819[i6820] && names6819[i6820 + 1] && names6819[i6820 + 1].token.value === "as") {
                res6818.push(new ExportEntry6812(exp6817, names6819[i6820 + 2], names6819[i6820]));
                // walk past the `as <name>` tokens and the comma
                i6820 += 3;
            } else if (names6819[i6820]) {
                res6818.push(new ExportEntry6812(exp6817, names6819[i6820], names6819[i6820]));
                // walk past the comma
                i6820++;
            }
        }
    } else if (exp6817.isExportDefaultTerm) {
        var localName6821;
        if (exp6817.decl.isIdTerm) {
            localName6821 = exp6817.decl.id;
        } else if (exp6817.decl.isNamedFunTerm) {
            localName6821 = exp6817.decl.name;
        } else if (exp6817.decl.isMacroTerm || exp6817.decl.isLetMacroTerm) {
            localName6821 = syn6808.makeDelim("()", [exp6817.decl.name], exp6817.decl.name);
        } else if (exp6817.decl.isExprTerm) {
            localName6821 = syn6808.makeIdent("*default*", exp6817.defaultkw);
        } else {
            throwSyntaxError6811("export", "export form is not supported", exp6817.decl);
        }
        res6818.push(new ExportEntry6812(exp6817, exp6817.defaultkw, localName6821));
    } else if (exp6817.isExportDeclTerm) {
        if (exp6817.decl.isVariableStatementTerm || exp6817.decl.isConstStatementTerm || exp6817.decl.isLetStatementTerm) {
            exp6817.decl.decls.forEach(function (decl6822) {
                res6818.push(new ExportEntry6812(exp6817, decl6822.ident, decl6822.ident));
            });
        } else if (exp6817.decl.isNamedFunTerm) {
            res6818.push(new ExportEntry6812(exp6817, exp6817.decl.name, exp6817.decl.name));
        } else if (exp6817.decl.isMacroTerm || exp6817.decl.isLetMacroTerm) {
            var macName6823 = syn6808.makeDelim("()", exp6817.decl.name, exp6817.decl.name[0]);
            res6818.push(new ExportEntry6812(exp6817, macName6823, macName6823));
        } else {
            throwSyntaxError6811("export", "export form is not supported", exp6817.decl);
        }
    } else {
        assert6807(false, "not implemented yet");
    }
    return res6818;
}
exports.makeExportEntries = makeExportEntries6813;
exports.ExportEntry = ExportEntry6812;
//# sourceMappingURL=exportEntry.js.map