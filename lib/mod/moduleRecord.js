"use strict";

var makeImportEntries8016 = require("./importEntry").makeImportEntries;
var makeExportEntries8017 = require("./exportEntry").makeExportEntries;
function ModuleRecord8018(name8019, language8020) {
    this.name = name8019;
    this.language = language8020;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8018.prototype.addImport = function (imp8021) {
    var entries8022 = makeImportEntries8016(imp8021);
    this.importEntries = this.importEntries.concat(entries8022);
    this.importedModules.push(imp8021.from.token.value);
    return entries8022;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8018.prototype.addExport = function (exp8023) {
    var entries8024 = makeExportEntries8017(exp8023);
    this.exportEntries = this.exportEntries.concat(entries8024);
    return entries8024;
};
// returns an array of the import entries for the given module path
ModuleRecord8018.prototype.getImportsForModule = function (impPath8025) {
    return this.importEntries.filter(function (entry8026) {
        return entry8026.moduleRequest.token.value === impPath8025;
    });
};
ModuleRecord8018.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8027) {
        return entry8027.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8018;
//# sourceMappingURL=moduleRecord.js.map