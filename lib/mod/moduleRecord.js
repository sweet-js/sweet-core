"use strict";

var makeImportEntries8455 = require("./importEntry").makeImportEntries;
var makeExportEntries8456 = require("./exportEntry").makeExportEntries;
function ModuleRecord8457(name8458, language8459) {
    this.name = name8458;
    this.language = language8459;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8457.prototype.addImport = function (imp8460) {
    var entries8461 = makeImportEntries8455(imp8460);
    this.importEntries = this.importEntries.concat(entries8461);
    if (!this.importedModules.some(function (mod8462) {
        return mod8462 === imp8460.from.token.value;
    })) {
        // only add new imported modules to the imported array
        this.importedModules.push(imp8460.from.token.value);
    }
    return entries8461;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8457.prototype.addExport = function (exp8463) {
    var entries8464 = makeExportEntries8456(exp8463);
    this.exportEntries = this.exportEntries.concat(entries8464);
    return entries8464;
};
// returns an array of the import entries for the given module path
ModuleRecord8457.prototype.getImportsForModule = function (impPath8465) {
    return this.importEntries.filter(function (entry8466) {
        return entry8466.moduleRequest.token.value === impPath8465;
    });
};
ModuleRecord8457.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8467) {
        return entry8467.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8457;
//# sourceMappingURL=moduleRecord.js.map