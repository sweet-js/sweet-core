"use strict";

var makeImportEntries8437 = require("./importEntry").makeImportEntries;
var makeExportEntries8438 = require("./exportEntry").makeExportEntries;
function ModuleRecord8439(name8440, language8441) {
    this.name = name8440;
    this.language = language8441;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8439.prototype.addImport = function (imp8442) {
    var entries8443 = makeImportEntries8437(imp8442);
    this.importEntries = this.importEntries.concat(entries8443);
    if (!this.importedModules.some(function (mod8444) {
        return mod8444 === imp8442.from.token.value;
    })) {
        // only add new imported modules to the imported array
        this.importedModules.push(imp8442.from.token.value);
    }
    return entries8443;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8439.prototype.addExport = function (exp8445) {
    var entries8446 = makeExportEntries8438(exp8445);
    this.exportEntries = this.exportEntries.concat(entries8446);
    return entries8446;
};
// returns an array of the import entries for the given module path
ModuleRecord8439.prototype.getImportsForModule = function (impPath8447) {
    return this.importEntries.filter(function (entry8448) {
        return entry8448.moduleRequest.token.value === impPath8447;
    });
};
ModuleRecord8439.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8449) {
        return entry8449.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8439;
//# sourceMappingURL=moduleRecord.js.map