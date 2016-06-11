"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _enforester = require("./enforester");

var _termExpander = require("./term-expander.js");

var _termExpander2 = _interopRequireDefault(_termExpander);

var _bindingMap = require("./binding-map.js");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _env = require("./env");

var _env2 = _interopRequireDefault(_env);

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

var _loadSyntax = require("./load-syntax");

var _scope = require("./scope");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _astDispatcher = require("./ast-dispatcher");

var _astDispatcher2 = _interopRequireDefault(_astDispatcher);

var _hygieneUtils = require("./hygiene-utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bindImports_1078(impTerm_1081, exModule_1082, context_1083) {
  let names_1084 = [];
  let phase_1085 = impTerm_1081.forSyntax ? context_1083.phase + 1 : context_1083.phase;
  impTerm_1081.namedImports.forEach(specifier_1086 => {
    let name_1087 = specifier_1086.binding.name;
    let exportName_1088 = findNameInExports_1079(name_1087, exModule_1082.exportEntries);
    if (exportName_1088 != null) {
      let newBinding = (0, _symbol.gensym)(name_1087.val());
      context_1083.store.set(newBinding.toString(), new _transforms.VarBindingTransform(name_1087));
      context_1083.bindings.addForward(name_1087, exportName_1088, newBinding, phase_1085);
      names_1084.push(name_1087);
    }
  });
  return (0, _immutable.List)(names_1084);
}
function findNameInExports_1079(name_1089, exp_1090) {
  let foundNames_1091 = exp_1090.reduce((acc_1092, e_1093) => {
    if ((0, _terms.isExportFrom)(e_1093)) {
      return acc_1092.concat(e_1093.namedExports.reduce((acc_1094, specifier_1095) => {
        if (specifier_1095.exportedName.val() === name_1089.val()) {
          return acc_1094.concat(specifier_1095.exportedName);
        }
        return acc_1094;
      }, (0, _immutable.List)()));
    } else if ((0, _terms.isExport)(e_1093)) {
      return acc_1092.concat(e_1093.declaration.declarators.reduce((acc_1096, decl_1097) => {
        if (decl_1097.binding.name.val() === name_1089.val()) {
          return acc_1096.concat(decl_1097.binding.name);
        }
        return acc_1096;
      }, (0, _immutable.List)()));
    }
    return acc_1092;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_1091.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_1091.get(0);
}
function removeNames_1080(impTerm_1098, names_1099) {
  let namedImports_1100 = impTerm_1098.namedImports.filter(specifier_1101 => !names_1099.contains(specifier_1101.binding.name));
  return impTerm_1098.extend({ namedImports: namedImports_1100 });
}
class TokenExpander extends _astDispatcher2.default {
  constructor(context_1102) {
    super("expand", false);
    this.context = context_1102;
  }
  expand(stxl_1103) {
    let result_1104 = [];
    if (stxl_1103.size === 0) {
      return (0, _immutable.List)(result_1104);
    }
    let prev_1105 = (0, _immutable.List)();
    let enf_1106 = new _enforester.Enforester(stxl_1103, prev_1105, this.context);
    while (!enf_1106.done) {
      result_1104.push(this.dispatch(enf_1106.enforest()));
    }
    return (0, _immutable.List)(result_1104);
  }
  expandVariableDeclarationStatement(term_1107) {
    return term_1107.extend({ declaration: this.registerVariableDeclaration(term_1107.declaration) });
  }
  expandFunctionDeclaration(term_1108) {
    let registeredTerm_1109 = this.registerFunctionOrClass(term_1108);
    let stx_1110 = registeredTerm_1109.name.name;
    this.context.env.set(stx_1110.resolve(this.context.phase), new _transforms.VarBindingTransform(stx_1110));
    return registeredTerm_1109;
  }
  expandImport(term_1111) {
    let path_1112 = term_1111.moduleSpecifier.val();
    let mod_1113;
    if (term_1111.forSyntax) {
      mod_1113 = this.context.modules.getAtPhase(path_1112, this.context.phase + 1);
      this.context.store = this.context.modules.visit(mod_1113, this.context.phase + 1, this.context.store);
      this.context.store = this.context.modules.invoke(mod_1113, this.context.phase + 1, this.context.store);
    } else {
      mod_1113 = this.context.modules.getAtPhase(path_1112, this.context.phase);
      this.context.store = this.context.modules.visit(mod_1113, this.context.phase, this.context.store);
    }
    let boundNames_1114 = bindImports_1078(term_1111, mod_1113, this.context);
    return removeNames_1080(term_1111, boundNames_1114);
  }
  expandExport(term_1115) {
    if ((0, _terms.isFunctionDeclaration)(term_1115.declaration) || (0, _terms.isClassDeclaration)(term_1115.declaration)) {
      return term_1115.extend({ declaration: this.registerFunctionOrClass(term_1115.declaration) });
    } else if ((0, _terms.isVariableDeclaration)(term_1115.declaration)) {
      return term_1115.extend({ declaration: this.registerVariableDeclaration(term_1115.declaration) });
    }
    return term_1115;
  }
  registerFunctionOrClass(term_1116) {
    let name_1117 = term_1116.name.removeScope(this.context.useScope, this.context.phase);
    (0, _hygieneUtils.collectBindings)(term_1116.name).forEach(stx_1118 => {
      let newBinding_1119 = (0, _symbol.gensym)(stx_1118.val());
      this.context.bindings.add(stx_1118, { binding: newBinding_1119, phase: this.context.phase, skipDup: false });
      this.context.env.set(newBinding_1119.toString(), new _transforms.VarBindingTransform(stx_1118));
    });
    return term_1116.extend({ name: name_1117 });
  }
  registerVariableDeclaration(term_1120) {
    if ((0, _terms.isSyntaxDeclaration)(term_1120) || (0, _terms.isSyntaxrecDeclaration)(term_1120)) {
      return this.registerSyntaxDeclaration(term_1120);
    }
    return term_1120.extend({ declarators: term_1120.declarators.map(decl_1121 => {
        let binding_1122 = decl_1121.binding.removeScope(this.context.useScope, this.context.phase);
        (0, _hygieneUtils.collectBindings)(binding_1122).forEach(stx_1123 => {
          let newBinding_1124 = (0, _symbol.gensym)(stx_1123.val());
          this.context.bindings.add(stx_1123, { binding: newBinding_1124, phase: this.context.phase, skipDup: term_1120.kind === "var" });
          this.context.env.set(newBinding_1124.toString(), new _transforms.VarBindingTransform(stx_1123));
        });
        return decl_1121.extend({ binding: binding_1122 });
      }) });
  }
  registerSyntaxDeclaration(term_1125) {
    if ((0, _terms.isSyntaxDeclaration)(term_1125)) {
      let scope = (0, _scope.freshScope)("nonrec");
      term_1125 = term_1125.extend({ declarators: term_1125.declarators.map(decl_1126 => {
          let name_1127 = decl_1126.binding.name;
          let nameAdded_1128 = name_1127.addScope(scope, this.context.bindings, _syntax.ALL_PHASES);
          let nameRemoved_1129 = name_1127.removeScope(this.context.currentScope[this.context.currentScope.length - 1], this.context.phase);
          let newBinding_1130 = (0, _symbol.gensym)(name_1127.val());
          this.context.bindings.addForward(nameAdded_1128, nameRemoved_1129, newBinding_1130, this.context.phase);
          return decl_1126.extend({ init: decl_1126.init.addScope(scope, this.context.bindings, _syntax.ALL_PHASES) });
        }) });
    }
    return term_1125.extend({ declarators: term_1125.declarators.map(decl_1131 => {
        let binding_1132 = decl_1131.binding.removeScope(this.context.useScope, this.context.phase);
        let syntaxExpander_1133 = new _termExpander2.default(_.merge(this.context, { phase: this.context.phase + 1, env: new _env2.default(), store: this.context.store }));
        let init_1134 = syntaxExpander_1133.expand(decl_1131.init);
        let val_1135 = (0, _loadSyntax.evalCompiletimeValue)(init_1134.gen(), _.merge(this.context, { phase: this.context.phase + 1 }));
        (0, _hygieneUtils.collectBindings)(binding_1132).forEach(stx_1136 => {
          let newBinding_1137 = (0, _symbol.gensym)(stx_1136.val());
          this.context.bindings.add(stx_1136, { binding: newBinding_1137, phase: this.context.phase, skipDup: false });
          let resolvedName_1138 = stx_1136.resolve(this.context.phase);
          this.context.env.set(resolvedName_1138, new _transforms.CompiletimeTransform(val_1135));
        });
        return decl_1131.extend({ binding: binding_1132, init: init_1134 });
      }) });
  }
}
exports.default = TokenExpander;