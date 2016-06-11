"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modules = exports.Module = undefined;

var _immutable = require("immutable");

var _env = require("./env");

var _env2 = _interopRequireDefault(_env);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _tokenExpander = require("./token-expander.js");

var _tokenExpander2 = _interopRequireDefault(_tokenExpander);

var _termExpander = require("./term-expander.js");

var _termExpander2 = _interopRequireDefault(_termExpander);

var _bindingMap = require("./binding-map.js");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _symbol = require("./symbol");

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _loadSyntax = require("./load-syntax");

var _compiler = require("./compiler");

var _compiler2 = _interopRequireDefault(_compiler);

var _transforms = require("./transforms");

var _scope = require("./scope");

var _errors = require("./errors");

var _hygieneUtils = require("./hygiene-utils");

var _syntax = require("./syntax");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Module {
  constructor(moduleSpecifier_416, isNative_417, importEntries_418, exportEntries_419, pragmas_420, body_421) {
    this.moduleSpecifier = moduleSpecifier_416;
    this.isNative = isNative_417;
    this.importEntries = importEntries_418;
    this.exportEntries = exportEntries_419;
    this.pragmas = pragmas_420;
    this.body = body_421;
  }
}
exports.Module = Module;
const findBindingIdentifierName_413 = term_422 => {
  (0, _errors.assert)(term_422.name, `not implemented yet for type ${ term_422.type }`);
  return term_422.name;
};
const convertExport_414 = term_423 => {
  let declaration_424 = term_423.declaration;
  let bindings_425 = [];
  if ((0, _terms.isVariableDeclaration)(declaration_424)) {
    bindings_425 = declaration_424.declarators.map(decl_427 => findBindingIdentifierName_413(decl_427.binding));
  } else if ((0, _terms.isFunctionDeclaration)(declaration_424) || (0, _terms.isClassDeclaration)(declaration_424)) {
    bindings_425.push(findBindingIdentifierName_413(declaration_424.name));
  }
  let namedExports_426 = bindings_425.map(binding_428 => {
    return new _terms2.default("ExportSpecifier", { name: null, exportedName: binding_428 });
  });
  return new _terms2.default("ExportFrom", { moduleSpecifier: null, namedExports: (0, _immutable.List)(namedExports_426) });
};
const pragmaRegep_415 = /^\s*#\w*/;
class Modules {
  constructor(context_429) {
    this.compiledModules = new Map();
    this.context = context_429;
    this.context.modules = this;
  }
  loadString(str_430) {
    let checkPragma_431 = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    let hasPragma_432 = pragmaRegep_415.test(str_430);
    if (checkPragma_431 && !hasPragma_432) {
      return { isNative: true, body: (0, _immutable.List)() };
    }
    return { isNative: !hasPragma_432, body: new _shiftReader2.default(str_430).read() };
  }
  load(path_433) {
    return this.loadString(this.context.moduleLoader(path_433));
  }
  compile(mod_434, path_435) {
    let stxl_436 = mod_434.body;
    let outScope_437 = (0, _scope.freshScope)("outsideEdge");
    let inScope_438 = (0, _scope.freshScope)(`insideEdge0`);
    let compiler_439 = new _compiler2.default(0, new _env2.default(), new _store2.default(), _.merge(this.context, { currentScope: [outScope_437, inScope_438] }));
    let terms_440 = compiler_439.compile(stxl_436.map(s_445 => s_445.addScope(outScope_437, this.context.bindings, _syntax.ALL_PHASES).addScope(inScope_438, this.context.bindings, 0)));
    let importEntries_441 = [];
    let exportEntries_442 = [];
    let pragmas_443 = [];
    let filteredTerms_444 = terms_440.reduce((acc_446, t_447) => {
      return _.cond([[_terms.isImport, t_448 => {
        importEntries_441.push(t_448);
        return acc_446;
      }], [_terms.isExport, t_449 => {
        if (t_449.declaration) {
          exportEntries_442.push(convertExport_414(t_449));
          if ((0, _terms.isVariableDeclaration)(t_449.declaration)) {
            return acc_446.concat(new _terms2.default("VariableDeclarationStatement", { declaration: t_449.declaration }));
          }
          return acc_446.concat(t_449.declaration);
        }
        exportEntries_442.push(t_449);
        return acc_446;
      }], [_terms.isPragma, t_450 => {
        pragmas_443.push(t_450);
        return acc_446;
      }], [_.T, t_451 => acc_446.concat(t_451)]])(t_447);
    }, (0, _immutable.List)());
    return new Module(path_435, mod_434.isNative, (0, _immutable.List)(importEntries_441), (0, _immutable.List)(exportEntries_442), (0, _immutable.List)(pragmas_443), filteredTerms_444);
  }
  compileEntrypoint(source_452, filename_453) {
    let enforcePragma_454 = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    let stxl_455 = this.loadString(source_452, false);
    if (enforcePragma_454 && stxl_455.isNative) {
      throw new Error(`Entrypoint ${ filename_453 } must begin with #lang pragma`);
    }
    return this.getAtPhase("<<entrypoint>>", 0, stxl_455);
  }
  getAtPhase(rawPath_456, phase_457) {
    let rawStxl_458 = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    let path_459 = rawPath_456 === "<<entrypoint>>" ? rawPath_456 : this.context.moduleResolver(rawPath_456, this.context.cwd);
    let mapKey_460 = `${ path_459 }:${ phase_457 }`;
    if (!this.compiledModules.has(mapKey_460)) {
      if (phase_457 === 0) {
        let stxl = rawStxl_458 != null ? rawStxl_458 : this.load(path_459);
        this.compiledModules.set(mapKey_460, this.compile(stxl, path_459));
      } else {
        let rawMod = this.getAtPhase(rawPath_456, 0, rawStxl_458);
        let scope = (0, _scope.freshScope)(`insideEdge${ phase_457 }`);
        this.compiledModules.set(mapKey_460, new Module(rawMod.moduleSpecifier, false, rawMod.importEntries.map(term_461 => term_461.addScope(scope, this.context.bindings, phase_457)), rawMod.exportEntries.map(term_462 => term_462.addScope(scope, this.context.bindings, phase_457)), rawMod.pragmas, rawMod.body.map(term_463 => term_463.addScope(scope, this.context.bindings, phase_457))));
      }
    }
    return this.compiledModules.get(mapKey_460);
  }
  has(rawPath_464) {
    let phase_465 = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    let path_466 = rawPath_464 === "<<entrypoint>>" ? rawPath_464 : this.context.moduleResolver(rawPath_464, this.context.cwd);
    let key_467 = `${ path_466 }:${ phase_465 }`;
    return this.compiledModules.has(key_467) && !this.compiledModules.get(key_467).isNative;
  }
  registerSyntaxDeclaration(term_468, phase_469, store_470) {
    term_468.declarators.forEach(decl_471 => {
      let val_472 = (0, _loadSyntax.evalCompiletimeValue)(decl_471.init.gen(), _.merge(this.context, { phase: phase_469 + 1, store: store_470 }));
      (0, _hygieneUtils.collectBindings)(decl_471.binding).forEach(stx_473 => {
        if (phase_469 !== 0) {
          let newBinding = (0, _symbol.gensym)(stx_473.val());
          this.context.bindings.add(stx_473, { binding: newBinding, phase: phase_469, skipDup: false });
        }
        let resolvedName_474 = stx_473.resolve(phase_469);
        store_470.set(resolvedName_474, new _transforms.CompiletimeTransform(val_472));
      });
    });
  }
  registerVariableDeclaration(term_475, phase_476, store_477) {
    term_475.declarators.forEach(decl_478 => {
      (0, _hygieneUtils.collectBindings)(decl_478.binding).forEach(stx_479 => {
        if (phase_476 !== 0) {
          let newBinding = (0, _symbol.gensym)(stx_479.val());
          this.context.bindings.add(stx_479, { binding: newBinding, phase: phase_476, skipDup: term_475.kind === "var" });
        }
        let resolvedName_480 = stx_479.resolve(phase_476);
        store_477.set(resolvedName_480, new _transforms.VarBindingTransform(stx_479));
      });
    });
  }
  registerFunctionOrClass(term_481, phase_482, store_483) {
    (0, _hygieneUtils.collectBindings)(term_481.name).forEach(stx_484 => {
      if (phase_482 !== 0) {
        let newBinding = (0, _symbol.gensym)(stx_484.val());
        this.context.bindings.add(stx_484, { binding: newBinding, phase: phase_482, skipDup: false });
      }
      let resolvedName_485 = stx_484.resolve(phase_482);
      store_483.set(resolvedName_485, new _transforms.VarBindingTransform(stx_484));
    });
  }
  visit(mod_486, phase_487, store_488) {
    mod_486.body.forEach(term_489 => {
      if ((0, _terms.isSyntaxDeclarationStatement)(term_489)) {
        this.registerSyntaxDeclaration(term_489.declaration, phase_487, store_488);
      }
    });
    return store_488;
  }
  invoke(mod_490, phase_491, store_492) {
    let body_493 = mod_490.body.filter(_.complement(_terms.isCompiletimeStatement)).map(term_495 => {
      term_495 = term_495.gen();
      if ((0, _terms.isVariableDeclarationStatement)(term_495)) {
        this.registerVariableDeclaration(term_495.declaration, phase_491, store_492);
      } else if ((0, _terms.isFunctionDeclaration)(term_495)) {
        this.registerFunctionOrClass(term_495, phase_491, store_492);
      }
      return term_495;
    });
    let exportsObj_494 = (0, _loadSyntax.evalRuntimeValues)(body_493, _.merge(this.context, { store: store_492, phase: phase_491 }));
    return store_492;
  }
}
exports.Modules = Modules;