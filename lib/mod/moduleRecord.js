"use strict";

var makeImportEntries8205 = require("./importEntry").makeImportEntries;
var makeExportEntries8206 = require("./exportEntry").makeExportEntries;
function ModuleRecord8207(name8208, language8209) {
    this.name = name8208;
    this.language = language8209;
    // array of the module names this module imports
    this.importedModules = [];
    // array of each import entry
    this.importEntries = [];
    // array of each export entry
    this.exportEntries = [];
}
// add the import statement to the module record returning an array of
// import entries derived from the import term
ModuleRecord8207.prototype.addImport = function (imp8210) {
    var entries8211 = makeImportEntries8205(imp8210);
    this.importEntries = this.importEntries.concat(entries8211);
    if (!this.importedModules.some(function (mod8212) {
        return mod8212 === imp8210.from.token.value;
    })) {
        // only add new imported modules to the imported array
        this.importedModules.push(imp8210.from.token.value);
    }
    return entries8211;
};
// add the export statement to the module record returning an array of
// export entries derived from the import term
ModuleRecord8207.prototype.addExport = function (exp8213) {
    var entries8214 = makeExportEntries8206(exp8213);
    this.exportEntries = this.exportEntries.concat(entries8214);
    return entries8214;
};
// returns an array of the import entries for the given module path
ModuleRecord8207.prototype.getImportsForModule = function (impPath8215) {
    return this.importEntries.filter(function (entry8216) {
        return entry8216.moduleRequest.token.value === impPath8215;
    });
};
ModuleRecord8207.prototype.getRuntimeImportEntries = function () {
    return this.importEntries.filter(function (entry8217) {
        return entry8217.forPhase === 0;
    });
};
exports.ModuleRecord = ModuleRecord8207;
//# sourceMappingURL=moduleRecord.js.map