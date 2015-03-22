"use strict";

var makeImportEntries8385 = require("./importEntry").makeImportEntries;
var makeExportEntries8386 = require("./exportEntry").makeExportEntries;
function ModuleRecord8387(name8388, language8389) {
    this.name = name8388;
    this.language = language8389;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8387.prototype.addImport = function (imp8390) {
    var entries8391 = makeImportEntries8385(imp8390);
    this.importEntries = this.importEntries.concat(entries8391);
    if (!this.importedModules.some(function (mod8392) {
        return mod8392 === imp8390.from.token.value;
    })) {
        // only add new imported modules to the imported array
        this.importedModules.push(imp8390.from.token.value);
    }
    return entries8391;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8387.prototype.addExport = function (exp8393) {
    var entries8394 = makeExportEntries8386(exp8393);
    this.exportEntries = this.exportEntries.concat(entries8394);
    return entries8394;
};
// returns an array of the import entries for the given module path
ModuleRecord8387.prototype.getImportsForModule = function (impPath8395) {
    return this.importEntries.filter(function (entry8396) {
        return entry8396.moduleRequest.token.value === impPath8395;
    });
};
ModuleRecord8387.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8397) {
        return entry8397.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8387;
//# sourceMappingURL=moduleRecord.js.map