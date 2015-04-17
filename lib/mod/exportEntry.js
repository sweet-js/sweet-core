"use strict";

var assert6626 = require("assert"),
    syn6627 = require("../syntax"),
    _6628 = require("underscore");
var makeMultiToken6629 = syn6627.makeMultiToken;
var throwSyntaxError6630 = syn6627.throwSyntaxError;
function ExportEntry6631(term6633, exportName6634, localName6635) {
    this._term = term6633;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6629(exportName6634);
    this.localName = makeMultiToken6629(localName6635);
}
ExportEntry6631.prototype.toTerm = function () {
    var term6636 = _6628.clone(this._term);
    term6636.name = syn6627.makeDelim("{}", [this.localName], this.localName);
    return term6636;
};
function makeExportEntries6632(exp6637) {
    assert6626(exp6637.isExportNameTerm || exp6637.isExportDefaultTerm || exp6637.isExportDeclTerm, "expecting an export term");
    var res6638 = [];
    if (exp6637.isExportNameTerm) {
        assert6626(exp6637.name.isDelimiter(), "expecting a delimiter token");
        var names6639 = exp6637.name.token.inner;
        for (var i6640 = 0; i6640 < names6639.length; i6640++) {
            if (names6639[i6640] && names6639[i6640 + 1] && names6639[i6640 + 1].token.value === "as") {
                res6638.push(new ExportEntry6631(exp6637, names6639[i6640 + 2], names6639[i6640]));
                // walk past the `as <name>` tokens and the comma
                i6640 += 3;
            } else if (names6639[i6640]) {
                res6638.push(new ExportEntry6631(exp6637, names6639[i6640], names6639[i6640]));
                // walk past the comma
                i6640++;
            }
        }
    } else if (exp6637.isExportDefaultTerm) {
        var localName6641;
        if (exp6637.decl.isIdTerm) {
            localName6641 = exp6637.decl.id;
        } else if (exp6637.decl.isNamedFunTerm) {
            localName6641 = exp6637.decl.name;
        } else if (exp6637.decl.isMacroTerm || exp6637.decl.isLetMacroTerm) {
            localName6641 = syn6627.makeDelim("()", [exp6637.decl.name], exp6637.decl.name);
        } else if (exp6637.decl.isExprTerm) {
            localName6641 = syn6627.makeIdent("*default*", exp6637.defaultkw);
        } else {
            throwSyntaxError6630("export", "export form is not supported", exp6637.decl);
        }
        res6638.push(new ExportEntry6631(exp6637, exp6637.defaultkw, localName6641));
    } else if (exp6637.isExportDeclTerm) {
        if (exp6637.decl.isVariableStatementTerm || exp6637.decl.isConstStatementTerm || exp6637.decl.isLetStatementTerm) {
            exp6637.decl.decls.forEach(function (decl6642) {
                res6638.push(new ExportEntry6631(exp6637, decl6642.ident, decl6642.ident));
            });
        } else if (exp6637.decl.isNamedFunTerm) {
            res6638.push(new ExportEntry6631(exp6637, exp6637.decl.name, exp6637.decl.name));
        } else if (exp6637.decl.isMacroTerm || exp6637.decl.isLetMacroTerm) {
            var macName6643 = syn6627.makeDelim("()", exp6637.decl.name, exp6637.decl.name[0]);
            res6638.push(new ExportEntry6631(exp6637, macName6643, macName6643));
        } else {
            throwSyntaxError6630("export", "export form is not supported", exp6637.decl);
        }
    } else {
        assert6626(false, "not implemented yet");
    }
    return res6638;
}
exports.makeExportEntries = makeExportEntries6632;
exports.ExportEntry = ExportEntry6631;
//# sourceMappingURL=exportEntry.js.map