"use strict";

var assert6833 = require("assert"),
    syn6834 = require("../syntax"),
    _6835 = require("underscore");
var makeMultiToken6836 = syn6834.makeMultiToken;
var throwSyntaxError6837 = syn6834.throwSyntaxError;
function ExportEntry6838(term6840, exportName6841, localName6842) {
    this._term = term6840;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6836(exportName6841);
    this.localName = makeMultiToken6836(localName6842);
}
function makeExportEntries6839(exp6843) {
    assert6833(exp6843.isExportNameTerm || exp6843.isExportDefaultTerm || exp6843.isExportDeclTerm, "expecting an export term");
    var res6844 = [];
    if (exp6843.isExportNameTerm) {
        assert6833(exp6843.name.isDelimiter(), "expecting a delimiter token");
        var names6845 = exp6843.name.token.inner;
        for (var i6846 = 0; i6846 < names6845.length; i6846++) {
            if (names6845[i6846] && names6845[i6846 + 1] && names6845[i6846 + 1].token.value === "as") {
                res6844.push(new ExportEntry6838(exp6843, names6845[i6846 + 2], names6845[i6846]));
                // walk past the `as <name>` tokens and the comma
                i6846 += 3;
            } else if (names6845[i6846]) {
                res6844.push(new ExportEntry6838(exp6843, names6845[i6846], names6845[i6846]));
                // walk past the comma
                i6846++;
            }
        }
    } else if (exp6843.isExportDefaultTerm) {
        var localName6847;
        if (exp6843.decl.isIdTerm) {
            localName6847 = exp6843.decl.id;
        } else if (exp6843.decl.isNamedFunTerm) {
            localName6847 = exp6843.decl.name;
        } else if (exp6843.decl.isMacroTerm || exp6843.decl.isLetMacroTerm) {
            localName6847 = syn6834.makeDelim("()", [exp6843.decl.name], exp6843.decl.name);
        } else if (exp6843.decl.isExprTerm) {
            localName6847 = syn6834.makeIdent("*default*", exp6843.defaultkw);
        } else {
            throwSyntaxError6837("export", "export form is not supported", exp6843.decl);
        }
        res6844.push(new ExportEntry6838(exp6843, exp6843.defaultkw.rename(exp6843.defaultkw, syn6834.fresh()), localName6847));
    } else if (exp6843.isExportDeclTerm) {
        if (exp6843.decl.isVariableStatementTerm || exp6843.decl.isConstStatementTerm || exp6843.decl.isLetStatementTerm) {
            exp6843.decl.decls.forEach(function (decl6848) {
                res6844.push(new ExportEntry6838(exp6843, decl6848.ident, decl6848.ident));
            });
        } else if (exp6843.decl.isNamedFunTerm) {
            res6844.push(new ExportEntry6838(exp6843, exp6843.decl.name, exp6843.decl.name));
        } else if (exp6843.decl.isMacroTerm || exp6843.decl.isLetMacroTerm) {
            var macName6849 = syn6834.makeDelim("()", exp6843.decl.name, exp6843.decl.name[0]);
            res6844.push(new ExportEntry6838(exp6843, macName6849, macName6849));
        } else {
            throwSyntaxError6837("export", "export form is not supported", exp6843.decl);
        }
    } else {
        assert6833(false, "not implemented yet");
    }
    return res6844;
}
exports.makeExportEntries = makeExportEntries6839;
exports.ExportEntry = ExportEntry6838;
//# sourceMappingURL=exportEntry.js.map