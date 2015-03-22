"use strict";

var assert6770 = require("assert"),
    syn6771 = require("../syntax"),
    _6772 = require("underscore");
var makeMultiToken6773 = syn6771.makeMultiToken;
var throwSyntaxError6774 = syn6771.throwSyntaxError;
function ExportEntry6775(term6777, exportName6778, localName6779) {
    this._term = term6777;
    this.moduleRequest = null;
    this.exportName = makeMultiToken6773(exportName6778);
    this.localName = makeMultiToken6773(localName6779);
}
ExportEntry6775.prototype.toTerm = function () {
    var term6780 = _6772.clone(this._term);
    term6780.name = syn6771.makeDelim("{}", [this.localName], this.localName);
    return term6780;
};
function makeExportEntries6776(exp6781) {
    assert6770(exp6781.isExportNameTerm || exp6781.isExportDefaultTerm || exp6781.isExportDeclTerm, "expecting an export term");
    var res6782 = [];
    if (exp6781.isExportNameTerm) {
        assert6770(exp6781.name.isDelimiter(), "expecting a delimiter token");
        var names6783 = exp6781.name.token.inner;
        for (var i6784 = 0; i6784 < names6783.length; i6784++) {
            if (names6783[i6784] && names6783[i6784 + 1] && names6783[i6784 + 1].token.value === "as") {
                res6782.push(new ExportEntry6775(exp6781, names6783[i6784 + 2], names6783[i6784]));
                // walk past the `as <name>` tokens and the comma
                i6784 += 3;
            } else if (names6783[i6784]) {
                res6782.push(new ExportEntry6775(exp6781, names6783[i6784], names6783[i6784]));
                // walk past the comma
                i6784++;
            }
        }
    } else if (exp6781.isExportDefaultTerm) {
        var localName6785;
        if (exp6781.decl.isIdTerm) {
            localName6785 = exp6781.decl.id;
        } else if (exp6781.decl.isNamedFunTerm) {
            localName6785 = exp6781.decl.name;
        } else if (exp6781.decl.isMacroTerm || exp6781.decl.isLetMacroTerm) {
            localName6785 = syn6771.makeDelim("()", [exp6781.decl.name], exp6781.decl.name);
        } else if (exp6781.decl.isExprTerm) {
            localName6785 = syn6771.makeIdent("*default*", exp6781.defaultkw);
        } else {
            throwSyntaxError6774("export", "export form is not supported", exp6781.decl);
        }
        res6782.push(new ExportEntry6775(exp6781, exp6781.defaultkw, localName6785));
    } else if (exp6781.isExportDeclTerm) {
        if (exp6781.decl.isVariableStatementTerm || exp6781.decl.isConstStatementTerm || exp6781.decl.isLetStatementTerm) {
            exp6781.decl.decls.forEach(function (decl6786) {
                res6782.push(new ExportEntry6775(exp6781, decl6786.ident, decl6786.ident));
            });
        } else if (exp6781.decl.isNamedFunTerm) {
            res6782.push(new ExportEntry6775(exp6781, exp6781.decl.name, exp6781.decl.name));
        } else if (exp6781.decl.isMacroTerm || exp6781.decl.isLetMacroTerm) {
            var macName6787 = syn6771.makeDelim("()", exp6781.decl.name, exp6781.decl.name[0]);
            res6782.push(new ExportEntry6775(exp6781, macName6787, macName6787));
        } else {
            throwSyntaxError6774("export", "export form is not supported", exp6781.decl);
        }
    } else {
        assert6770(false, "not implemented yet");
    }
    return res6782;
}
exports.makeExportEntries = makeExportEntries6776;
exports.ExportEntry = ExportEntry6775;
//# sourceMappingURL=exportEntry.js.map