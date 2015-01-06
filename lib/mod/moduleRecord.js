'use strict';
var makeImportEntries = require('./importEntry').makeImportEntries;
var makeExportEntries = require('./exportEntry').makeExportEntries;
function ModuleRecord(name, language) {
    this.name = name;
    this.language = language;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
ModuleRecord.prototype.addImport = function (imp) {
    var entries = makeImportEntries(imp);
    this.importEntries = this.importEntries.concat(entries);
    this.importedModules.push(imp.from.token.value);
    return entries;
};
ModuleRecord.prototype.addExport = function (exp) {
    var entries = makeExportEntries(exp);
    this.exportEntries = this.exportEntries.concat(entries);
    return entries;
};
ModuleRecord.prototype.getImportsForModule = function (impPath) {
    return this.importEntries.filter(function (entry) {
        return entry.moduleRequest.token.value === impPath;
    });
};
ModuleRecord.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry) {
        return entry.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord;
//# sourceMappingURL=moduleRecord.js.map