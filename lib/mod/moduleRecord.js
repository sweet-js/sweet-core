"use strict";

var makeImportEntries8425 = require("./importEntry").makeImportEntries;
var makeExportEntries8426 = require("./exportEntry").makeExportEntries;
function ModuleRecord8427(name8428, language8429) {
    this.name = name8428;
    this.language = language8429;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8427.prototype.addImport = function (imp8430) {
    var entries8431 = makeImportEntries8425(imp8430);
    this.importEntries = this.importEntries.concat(entries8431);
    if (!this.importedModules.some(function (mod8432) {
        return mod8432 === imp8430.from.token.value;
    })) {
        // only add new imported modules to the imported array
        this.importedModules.push(imp8430.from.token.value);
    }
    return entries8431;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8427.prototype.addExport = function (exp8433) {
    var entries8434 = makeExportEntries8426(exp8433);
    this.exportEntries = this.exportEntries.concat(entries8434);
    return entries8434;
};
// returns an array of the import entries for the given module path
ModuleRecord8427.prototype.getImportsForModule = function (impPath8435) {
    return this.importEntries.filter(function (entry8436) {
        return entry8436.moduleRequest.token.value === impPath8435;
    });
};
ModuleRecord8427.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8437) {
        return entry8437.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8427;
//# sourceMappingURL=moduleRecord.js.map