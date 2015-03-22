"use strict";

var assert6766 = require("assert"),
    syn6767 = require("../syntax"),
    _6768 = require("underscore");
var makeMultiToken6769 = syn6767.makeMultiToken;
var throwSyntaxError6770 = syn6767.throwSyntaxError;
function ExportEntry6771(term6773, exportName6774, localName6775) {
    this._term = term6773;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6769(exportName6774);
    this.localName = makeMultiToken6769(localName6775);
}
ExportEntry6771.prototype.toTerm = function () {
    var term6776 = _6768.clone(this._term);
    term6776.name = syn6767.makeDelim("{}", [this.localName], this.localName);
    return term6776;
};
function makeExportEntries6772(exp6777) {
    assert6766(exp6777.isExportNameTerm || exp6777.isExportDefaultTerm || exp6777.isExportDeclTerm, "expecting an export term");
    var res6778 = [];
    if (exp6777.isExportNameTerm) {
        assert6766(exp6777.name.isDelimiter(), "expecting a delimiter token");
        var names6779 = exp6777.name.token.inner;
        for (var i6780 = 0; i6780 < names6779.length; i6780++) {
            if (names6779[i6780] && names6779[i6780 + 1] && names6779[i6780 + 1].token.value === "as") {
                res6778.push(new ExportEntry6771(exp6777, names6779[i6780 + 2], names6779[i6780]));
                // walk past the `as <name>` tokens and the comma
                i6780 += 3;
            } else if (names6779[i6780]) {
                res6778.push(new ExportEntry6771(exp6777, names6779[i6780], names6779[i6780]));
                // walk past the comma
                i6780++;
            }
        }
    } else if (exp6777.isExportDefaultTerm) {
        var localName6781;
        if (exp6777.decl.isIdTerm) {
            localName6781 = exp6777.decl.id;
        } else if (exp6777.decl.isNamedFunTerm) {
            localName6781 = exp6777.decl.name;
        } else if (exp6777.decl.isMacroTerm || exp6777.decl.isLetMacroTerm) {
            localName6781 = syn6767.makeDelim("()", [exp6777.decl.name], exp6777.decl.name);
        } else if (exp6777.decl.isExprTerm) {
            localName6781 = syn6767.makeIdent("*default*", exp6777.defaultkw);
        } else {
            throwSyntaxError6770("export", "export form is not supported", exp6777.decl);
        }
        res6778.push(new ExportEntry6771(exp6777, exp6777.defaultkw, localName6781));
    } else if (exp6777.isExportDeclTerm) {
        if (exp6777.decl.isVariableStatementTerm || exp6777.decl.isConstStatementTerm || exp6777.decl.isLetStatementTerm) {
            exp6777.decl.decls.forEach(function (decl6782) {
                res6778.push(new ExportEntry6771(exp6777, decl6782.ident, decl6782.ident));
            });
        } else if (exp6777.decl.isNamedFunTerm) {
            res6778.push(new ExportEntry6771(exp6777, exp6777.decl.name, exp6777.decl.name));
        } else if (exp6777.decl.isMacroTerm || exp6777.decl.isLetMacroTerm) {
            var macName6783 = syn6767.makeDelim("()", exp6777.decl.name, exp6777.decl.name[0]);
            res6778.push(new ExportEntry6771(exp6777, macName6783, macName6783));
        } else {
            throwSyntaxError6770("export", "export form is not supported", exp6777.decl);
        }
    } else {
        assert6766(false, "not implemented yet");
    }
    return res6778;
}
exports.makeExportEntries = makeExportEntries6772;
exports.ExportEntry = ExportEntry6771;
//# sourceMappingURL=exportEntry.js.map