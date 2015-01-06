'use strict';
var assert = require('./syntax').assert;
function ImportEntry(term, importName, localName) {
    this._term = term;
    this.moduleRequest = term.from;
    this.importName = importName;
    this.localName = localName;
}
function makeImportEntries(imp) {
    assert(imp.isImportTerm || imp.isImportForMacrosTerm, 'expecting an import term');
    return [];
}
exports.makeImportEntries = makeImportEntries;
exports.ImportEntry = ImportEntry;