"use strict";

var assert6492 = require("assert"),
    syn6493 = require("../syntax"),
    _6494 = require("underscore");
var makeMultiToken6495 = syn6493.makeMultiToken;
var throwSyntaxError6496 = syn6493.throwSyntaxError;
function ExportEntry6497(term6499, exportName6500, localName6501) {
    this._term = term6499;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6495(exportName6500);
    this.localName = makeMultiToken6495(localName6501);
}
function makeExportEntries6498(exp6502) {
    assert6492(exp6502.isExportNameTerm || exp6502.isExportDefaultTerm || exp6502.isExportDeclTerm, "expecting an export term");
    var res6503 = [];
    if (exp6502.isExportNameTerm) {
        assert6492(exp6502.name.isDelimiter(), "expecting a delimiter token");
        var names6504 = exp6502.name.token.inner;
        for (var i6505 = 0; i6505 < names6504.length; i6505++) {
            if (names6504[i6505] && names6504[i6505 + 1] && names6504[i6505 + 1].token.value === "as") {
                res6503.push(new ExportEntry6497(exp6502, names6504[i6505 + 2], names6504[i6505]));
                // walk past the `as <name>` tokens and the comma
                i6505 += 3;
            } else if (names6504[i6505]) {
                res6503.push(new ExportEntry6497(exp6502, names6504[i6505], names6504[i6505]));
                // walk past the comma
                i6505++;
            }
        }
    } else if (exp6502.isExportDefaultTerm) {
        var localName6506;
        if (exp6502.decl.isIdTerm) {
            localName6506 = exp6502.decl.id;
        } else if (exp6502.decl.isNamedFunTerm) {
            localName6506 = exp6502.decl.name;
        } else if (exp6502.decl.isMacroTerm || exp6502.decl.isLetMacroTerm) {
            localName6506 = syn6493.makeDelim("()", [exp6502.decl.name], exp6502.decl.name);
        } else if (exp6502.decl.isExprTerm) {
            localName6506 = syn6493.makeIdent("*default*", exp6502.defaultkw);
        } else {
            throwSyntaxError6496("export", "export form is not supported", exp6502.decl);
        }
        res6503.push(new ExportEntry6497(exp6502, exp6502.defaultkw.rename(exp6502.defaultkw, syn6493.fresh()), localName6506));
    } else if (exp6502.isExportDeclTerm) {
        if (exp6502.decl.isVariableStatementTerm || exp6502.decl.isConstStatementTerm || exp6502.decl.isLetStatementTerm) {
            exp6502.decl.decls.forEach(function (decl6507) {
                res6503.push(new ExportEntry6497(exp6502, decl6507.ident, decl6507.ident));
            });
        } else if (exp6502.decl.isNamedFunTerm) {
            res6503.push(new ExportEntry6497(exp6502, exp6502.decl.name, exp6502.decl.name));
        } else if (exp6502.decl.isMacroTerm || exp6502.decl.isLetMacroTerm) {
            var macName6508 = syn6493.makeDelim("()", exp6502.decl.name, exp6502.decl.name[0]);
            res6503.push(new ExportEntry6497(exp6502, macName6508, macName6508));
        } else {
            throwSyntaxError6496("export", "export form is not supported", exp6502.decl);
        }
    } else {
        assert6492(false, "not implemented yet");
    }
    return res6503;
}
exports.makeExportEntries = makeExportEntries6498;
exports.ExportEntry = ExportEntry6497;
//# sourceMappingURL=exportEntry.js.map