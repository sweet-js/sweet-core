"use strict";

var makeImportEntries8421 = require("./importEntry").makeImportEntries;
var makeExportEntries8422 = require("./exportEntry").makeExportEntries;
function ModuleRecord8423(name8424, language8425) {
    this.name = name8424;
    this.language = language8425;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8423.prototype.addImport = function (imp8426) {
    var entries8427 = makeImportEntries8421(imp8426);
    this.importEntries = this.importEntries.concat(entries8427);
    if (!this.importedModules.some(function (mod8428) {
        return mod8428 === imp8426.from.token.value;
    })) {
        // only add new imported modules to the imported array
        this.importedModules.push(imp8426.from.token.value);
    }
    return entries8427;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8423.prototype.addExport = function (exp8429) {
    var entries8430 = makeExportEntries8422(exp8429);
    this.exportEntries = this.exportEntries.concat(entries8430);
    return entries8430;
};
// returns an array of the import entries for the given module path
ModuleRecord8423.prototype.getImportsForModule = function (impPath8431) {
    return this.importEntries.filter(function (entry8432) {
        return entry8432.moduleRequest.token.value === impPath8431;
    });
};
ModuleRecord8423.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8433) {
        return entry8433.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8423;
//# sourceMappingURL=moduleRecord.js.map