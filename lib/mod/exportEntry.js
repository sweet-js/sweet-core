"use strict";

var assert6819 = require("assert"),
    syn6820 = require("../syntax"),
    _6821 = require("underscore");
var makeMultiToken6822 = syn6820.makeMultiToken;
var throwSyntaxError6823 = syn6820.throwSyntaxError;
function ExportEntry6824(term6826, exportName6827, localName6828) {
    this._term = term6826;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6822(exportName6827);
    this.localName = makeMultiToken6822(localName6828);
}
function makeExportEntries6825(exp6829) {
    assert6819(exp6829.isExportNameTerm || exp6829.isExportDefaultTerm || exp6829.isExportDeclTerm, "expecting an export term");
    var res6830 = [];
    if (exp6829.isExportNameTerm) {
        assert6819(exp6829.name.isDelimiter(), "expecting a delimiter token");
        var names6831 = exp6829.name.token.inner;
        for (var i6832 = 0; i6832 < names6831.length; i6832++) {
            if (names6831[i6832] && names6831[i6832 + 1] && names6831[i6832 + 1].token.value === "as") {
                res6830.push(new ExportEntry6824(exp6829, names6831[i6832 + 2], names6831[i6832]));
                // walk past the `as <name>` tokens and the comma
                i6832 += 3;
            } else if (names6831[i6832]) {
                res6830.push(new ExportEntry6824(exp6829, names6831[i6832], names6831[i6832]));
                // walk past the comma
                i6832++;
            }
        }
    } else if (exp6829.isExportDefaultTerm) {
        var localName6833;
        if (exp6829.decl.isIdTerm) {
            localName6833 = exp6829.decl.id;
        } else if (exp6829.decl.isNamedFunTerm) {
            localName6833 = exp6829.decl.name;
        } else if (exp6829.decl.isMacroTerm || exp6829.decl.isLetMacroTerm) {
            localName6833 = syn6820.makeDelim("()", [exp6829.decl.name], exp6829.decl.name);
        } else if (exp6829.decl.isExprTerm) {
            localName6833 = syn6820.makeIdent("*default*", exp6829.defaultkw);
        } else {
            throwSyntaxError6823("export", "export form is not supported", exp6829.decl);
        }
        res6830.push(new ExportEntry6824(exp6829, exp6829.defaultkw, localName6833));
    } else if (exp6829.isExportDeclTerm) {
        if (exp6829.decl.isVariableStatementTerm || exp6829.decl.isConstStatementTerm || exp6829.decl.isLetStatementTerm) {
            exp6829.decl.decls.forEach(function (decl6834) {
                res6830.push(new ExportEntry6824(exp6829, decl6834.ident, decl6834.ident));
            });
        } else if (exp6829.decl.isNamedFunTerm) {
            res6830.push(new ExportEntry6824(exp6829, exp6829.decl.name, exp6829.decl.name));
        } else if (exp6829.decl.isMacroTerm || exp6829.decl.isLetMacroTerm) {
            var macName6835 = syn6820.makeDelim("()", exp6829.decl.name, exp6829.decl.name[0]);
            res6830.push(new ExportEntry6824(exp6829, macName6835, macName6835));
        } else {
            throwSyntaxError6823("export", "export form is not supported", exp6829.decl);
        }
    } else {
        assert6819(false, "not implemented yet");
    }
    return res6830;
}
exports.makeExportEntries = makeExportEntries6825;
exports.ExportEntry = ExportEntry6824;
//# sourceMappingURL=exportEntry.js.map