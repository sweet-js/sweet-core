"use strict";

var makeImportEntries8389 = require("./importEntry").makeImportEntries;
var makeExportEntries8390 = require("./exportEntry").makeExportEntries;
function ModuleRecord8391(name8392, language8393) {
    this.name = name8392;
    this.language = language8393;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8391.prototype.addImport = function (imp8394) {
    var entries8395 = makeImportEntries8389(imp8394);
    this.importEntries = this.importEntries.concat(entries8395);
    if (!this.importedModules.some(function (mod8396) {
        return mod8396 === imp8394.from.token.value;
    })) {
        // only add new imported modules to the imported array
        this.importedModules.push(imp8394.from.token.value);
    }
    return entries8395;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8391.prototype.addExport = function (exp8397) {
    var entries8398 = makeExportEntries8390(exp8397);
    this.exportEntries = this.exportEntries.concat(entries8398);
    return entries8398;
};
// returns an array of the import entries for the given module path
ModuleRecord8391.prototype.getImportsForModule = function (impPath8399) {
    return this.importEntries.filter(function (entry8400) {
        return entry8400.moduleRequest.token.value === impPath8399;
    });
};
ModuleRecord8391.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8401) {
        return entry8401.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8391;
//# sourceMappingURL=moduleRecord.js.map