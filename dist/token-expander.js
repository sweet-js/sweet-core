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

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bindImports_1213(impTerm_1216, exModule_1217, context_1218) {
  let names_1219 = [];
  let phase_1220 = impTerm_1216.forSyntax ? context_1218.phase + 1 : context_1218.phase;
  impTerm_1216.namedImports.forEach(specifier_1221 => {
    let name_1222 = specifier_1221.binding.name;
    let exportName_1223 = findNameInExports_1214(name_1222, exModule_1217.exportEntries);
    if (exportName_1223 != null) {
      let newBinding = (0, _symbol.gensym)(name_1222.val());
      context_1218.store.set(newBinding.toString(), new _transforms.VarBindingTransform(name_1222));
      context_1218.bindings.addForward(name_1222, exportName_1223, newBinding, phase_1220);
      names_1219.push(name_1222);
    }
  });
  return (0, _immutable.List)(names_1219);
}
function findNameInExports_1214(name_1224, exp_1225) {
  let foundNames_1226 = exp_1225.reduce((acc_1227, e_1228) => {
    if ((0, _terms.isExportFrom)(e_1228)) {
      return acc_1227.concat(e_1228.namedExports.reduce((acc_1229, specifier_1230) => {
        if (specifier_1230.exportedName.val() === name_1224.val()) {
          return acc_1229.concat(specifier_1230.exportedName);
        }
        return acc_1229;
      }, (0, _immutable.List)()));
    } else if ((0, _terms.isExport)(e_1228)) {
      return acc_1227.concat(e_1228.declaration.declarators.reduce((acc_1231, decl_1232) => {
        if (decl_1232.binding.name.val() === name_1224.val()) {
          return acc_1231.concat(decl_1232.binding.name);
        }
        return acc_1231;
      }, (0, _immutable.List)()));
    }
    return acc_1227;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_1226.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_1226.get(0);
}
function removeNames_1215(impTerm_1233, names_1234) {
  let namedImports_1235 = impTerm_1233.namedImports.filter(specifier_1236 => !names_1234.contains(specifier_1236.binding.name));
  return impTerm_1233.extend({ namedImports: namedImports_1235 });
}
class TokenExpander extends _astDispatcher2.default {
  constructor(context_1237) {
    super("expand", false);
    this.context = context_1237;
  }
  expand(stxl_1238) {
    let result_1239 = [];
    if (stxl_1238.size === 0) {
      return (0, _immutable.List)(result_1239);
    }
    let prev_1240 = (0, _immutable.List)();
    let enf_1241 = new _enforester.Enforester(stxl_1238, prev_1240, this.context);
    while (!enf_1241.done) {
      result_1239.push(this.dispatch(enf_1241.enforest()));
    }
    return (0, _immutable.List)(result_1239);
  }
  expandVariableDeclarationStatement(term_1242) {
    return term_1242.extend({ declaration: this.registerVariableDeclaration(term_1242.declaration) });
  }
  expandFunctionDeclaration(term_1243) {
    let registeredTerm_1244 = this.registerFunctionOrClass(term_1243);
    let stx_1245 = registeredTerm_1244.name.name;
    this.context.env.set(stx_1245.resolve(this.context.phase), new _transforms.VarBindingTransform(stx_1245));
    return registeredTerm_1244;
  }
  expandImport(term_1246) {
    let path_1247 = term_1246.moduleSpecifier.val();
    let mod_1248;
    if (term_1246.forSyntax) {
      mod_1248 = this.context.modules.getAtPhase(path_1247, this.context.phase + 1, this.context.cwd);
      this.context.store = this.context.modules.visit(mod_1248, this.context.phase + 1, this.context.store);
      this.context.store = this.context.modules.invoke(mod_1248, this.context.phase + 1, this.context.store);
    } else {
      mod_1248 = this.context.modules.getAtPhase(path_1247, this.context.phase, this.context.cwd);
      this.context.store = this.context.modules.visit(mod_1248, this.context.phase, this.context.store);
    }
    let boundNames_1249 = bindImports_1213(term_1246, mod_1248, this.context);
    return removeNames_1215(term_1246, boundNames_1249);
  }
  expandExport(term_1250) {
    if ((0, _terms.isFunctionDeclaration)(term_1250.declaration) || (0, _terms.isClassDeclaration)(term_1250.declaration)) {
      return term_1250.extend({ declaration: this.registerFunctionOrClass(term_1250.declaration) });
    } else if ((0, _terms.isVariableDeclaration)(term_1250.declaration)) {
      return term_1250.extend({ declaration: this.registerVariableDeclaration(term_1250.declaration) });
    }
    return term_1250;
  }
  registerFunctionOrClass(term_1251) {
    let name_1252 = term_1251.name.removeScope(this.context.useScope, this.context.phase);
    (0, _hygieneUtils.collectBindings)(term_1251.name).forEach(stx_1253 => {
      let newBinding_1254 = (0, _symbol.gensym)(stx_1253.val());
      this.context.bindings.add(stx_1253, { binding: newBinding_1254, phase: this.context.phase, skipDup: false });
      this.context.env.set(newBinding_1254.toString(), new _transforms.VarBindingTransform(stx_1253));
    });
    return term_1251.extend({ name: name_1252 });
  }
  registerVariableDeclaration(term_1255) {
    if ((0, _terms.isSyntaxDeclaration)(term_1255) || (0, _terms.isSyntaxrecDeclaration)(term_1255)) {
      return this.registerSyntaxDeclaration(term_1255);
    }
    return term_1255.extend({ declarators: term_1255.declarators.map(decl_1256 => {
        let binding_1257 = decl_1256.binding.removeScope(this.context.useScope, this.context.phase);
        (0, _hygieneUtils.collectBindings)(binding_1257).forEach(stx_1258 => {
          let newBinding_1259 = (0, _symbol.gensym)(stx_1258.val());
          this.context.bindings.add(stx_1258, { binding: newBinding_1259, phase: this.context.phase, skipDup: term_1255.kind === "var" });
          this.context.env.set(newBinding_1259.toString(), new _transforms.VarBindingTransform(stx_1258));
        });
        return decl_1256.extend({ binding: binding_1257 });
      }) });
  }
  registerSyntaxDeclaration(term_1260) {
    if ((0, _terms.isSyntaxDeclaration)(term_1260)) {
      let scope = (0, _scope.freshScope)("nonrec");
      term_1260 = term_1260.extend({ declarators: term_1260.declarators.map(decl_1261 => {
          let name_1262 = decl_1261.binding.name;
          let nameAdded_1263 = name_1262.addScope(scope, this.context.bindings, _syntax.ALL_PHASES);
          let nameRemoved_1264 = name_1262.removeScope(this.context.currentScope[this.context.currentScope.length - 1], this.context.phase);
          let newBinding_1265 = (0, _symbol.gensym)(name_1262.val());
          this.context.bindings.addForward(nameAdded_1263, nameRemoved_1264, newBinding_1265, this.context.phase);
          return decl_1261.extend({ init: decl_1261.init.addScope(scope, this.context.bindings, _syntax.ALL_PHASES) });
        }) });
    }
    return term_1260.extend({ declarators: term_1260.declarators.map(decl_1266 => {
        let binding_1267 = decl_1266.binding.removeScope(this.context.useScope, this.context.phase);
        let syntaxExpander_1268 = new _termExpander2.default(_.merge(this.context, { phase: this.context.phase + 1, env: new _env2.default(), store: this.context.store }));
        let init_1269 = syntaxExpander_1268.expand(decl_1266.init);
        let val_1270 = (0, _loadSyntax.evalCompiletimeValue)(init_1269.gen(), _.merge(this.context, { phase: this.context.phase + 1 }));
        (0, _hygieneUtils.collectBindings)(binding_1267).forEach(stx_1271 => {
          let newBinding_1272 = (0, _symbol.gensym)(stx_1271.val());
          this.context.bindings.add(stx_1271, { binding: newBinding_1272, phase: this.context.phase, skipDup: false });
          let resolvedName_1273 = stx_1271.resolve(this.context.phase);
          this.context.env.set(resolvedName_1273, new _transforms.CompiletimeTransform(val_1270));
        });
        return decl_1266.extend({ binding: binding_1267, init: init_1269 });
      }) });
  }
}
exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0lBQWEsQzs7Ozs7O0FBQ2IsU0FBUyxnQkFBVCxDQUEwQixZQUExQixFQUF3QyxhQUF4QyxFQUF1RCxZQUF2RCxFQUFxRTtBQUNuRSxNQUFJLGFBQWEsRUFBakI7QUFDQSxNQUFJLGFBQWEsYUFBYSxTQUFiLEdBQXlCLGFBQWEsS0FBYixHQUFxQixDQUE5QyxHQUFrRCxhQUFhLEtBQWhGO0FBQ0EsZUFBYSxZQUFiLENBQTBCLE9BQTFCLENBQWtDLGtCQUFrQjtBQUNsRCxRQUFJLFlBQVksZUFBZSxPQUFmLENBQXVCLElBQXZDO0FBQ0EsUUFBSSxrQkFBa0IsdUJBQXVCLFNBQXZCLEVBQWtDLGNBQWMsYUFBaEQsQ0FBdEI7QUFDQSxRQUFJLG1CQUFtQixJQUF2QixFQUE2QjtBQUMzQixVQUFJLGFBQWEsb0JBQU8sVUFBVSxHQUFWLEVBQVAsQ0FBakI7QUFDQSxtQkFBYSxLQUFiLENBQW1CLEdBQW5CLENBQXVCLFdBQVcsUUFBWCxFQUF2QixFQUE4QyxvQ0FBd0IsU0FBeEIsQ0FBOUM7QUFDQSxtQkFBYSxRQUFiLENBQXNCLFVBQXRCLENBQWlDLFNBQWpDLEVBQTRDLGVBQTVDLEVBQTZELFVBQTdELEVBQXlFLFVBQXpFO0FBQ0EsaUJBQVcsSUFBWCxDQUFnQixTQUFoQjtBQUNEO0FBQ0YsR0FURDtBQVVBLFNBQU8scUJBQUssVUFBTCxDQUFQO0FBQ0Q7QUFDRCxTQUFTLHNCQUFULENBQWdDLFNBQWhDLEVBQTJDLFFBQTNDLEVBQXFEO0FBQ25ELE1BQUksa0JBQWtCLFNBQVMsTUFBVCxDQUFnQixDQUFDLFFBQUQsRUFBVyxNQUFYLEtBQXNCO0FBQzFELFFBQUks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QUFJLGtCQUFrQixvQkFBTyxTQUFTLEdBQVQsRUFBUCxDQUF0QjtBQUNBLGVBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsR0FBdEIsQ0FBMEIsUUFBMUIsRUFBb0MsRUFBQyxTQUFTLGVBQVYsRUFBMkIsT0FBTyxLQUFLLE9BQUwsQ0FBYSxLQUEvQyxFQUFzRCxTQUFTLEtBQS9ELEVBQXBDO0FBQ0EsY0FBSSxvQkFBb0IsU0FBUyxPQUFULENBQWlCLEtBQUssT0FBTCxDQUFhLEtBQTlCLENBQXhCO0FBQ0EsZUFBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixpQkFBckIsRUFBd0MscUNBQXlCLFFBQXpCLENBQXhDO0FBQ0QsU0FMRDtBQU1BLGVBQU8sVUFBVSxNQUFWLENBQWlCLEVBQUMsU0FBUyxZQUFWLEVBQXdCLE1BQU0sU0FBOUIsRUFBakIsQ0FBUDtBQUNELE9BWnFDLENBQWQsRUFBakIsQ0FBUDtBQWFEO0FBaEdzRDtrQkFBcEMsYSIsImZpbGUiOiJ0b2tlbi1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBUZXJtRXhwYW5kZXIgZnJvbSBcIi4vdGVybS1leHBhbmRlci5qc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXAuanNcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgUmVhZGVyIGZyb20gXCIuL3NoaWZ0LXJlYWRlclwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCBpc09iamVjdEJpbmRpbmcsIGlzQXJyYXlCaW5kaW5nLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0LCBpc0V4cG9ydEZyb20sIGlzUHJhZ21hLCBpc0V4cG9ydFN5bnRheCwgaXNDbGFzc0RlY2xhcmF0aW9ufSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtnZW5zeW19IGZyb20gXCIuL3N5bWJvbFwiO1xuaW1wb3J0IHtWYXJCaW5kaW5nVHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHtleHBlY3QsIGFzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge2V2YWxDb21waWxldGltZVZhbHVlfSBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gXCIuL2FzdC1kaXNwYXRjaGVyXCI7XG5pbXBvcnQge2NvbGxlY3RCaW5kaW5nc30gZnJvbSBcIi4vaHlnaWVuZS11dGlsc1wiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5mdW5jdGlvbiBiaW5kSW1wb3J0c18xMjEzKGltcFRlcm1fMTIxNiwgZXhNb2R1bGVfMTIxNywgY29udGV4dF8xMjE4KSB7XG4gIGxldCBuYW1lc18xMjE5ID0gW107XG4gIGxldCBwaGFzZV8xMjIwID0gaW1wVGVybV8xMjE2LmZvclN5bnRheCA/IGNvbnRleHRfMTIxOC5waGFzZSArIDEgOiBjb250ZXh0XzEyMTgucGhhc2U7XG4gIGltcFRlcm1fMTIxNi5uYW1lZEltcG9ydHMuZm9yRWFjaChzcGVjaWZpZXJfMTIyMSA9PiB7XG4gICAgbGV0IG5hbWVfMTIyMiA9IHNwZWNpZmllcl8xMjIxLmJpbmRpbmcubmFtZTtcbiAgICBsZXQgZXhwb3J0TmFtZV8xMjIzID0gZmluZE5hbWVJbkV4cG9ydHNfMTIxNChuYW1lXzEyMjIsIGV4TW9kdWxlXzEyMTcuZXhwb3J0RW50cmllcyk7XG4gICAgaWYgKGV4cG9ydE5hbWVfMTIyMyAhPSBudWxsKSB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lXzEyMjIudmFsKCkpO1xuICAgICAgY29udGV4dF8xMjE4LnN0b3JlLnNldChuZXdCaW5kaW5nLnRvU3RyaW5nKCksIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKG5hbWVfMTIyMikpO1xuICAgICAgY29udGV4dF8xMjE4LmJpbmRpbmdzLmFkZEZvcndhcmQobmFtZV8xMjIyLCBleHBvcnROYW1lXzEyMjMsIG5ld0JpbmRpbmcsIHBoYXNlXzEyMjApO1xuICAgICAgbmFtZXNfMTIxOS5wdXNoKG5hbWVfMTIyMik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIExpc3QobmFtZXNfMTIxOSk7XG59XG5mdW5jdGlvbiBmaW5kTmFtZUluRXhwb3J0c18xMjE0KG5hbWVfMTIyNCwgZXhwXzEyMjUpIHtcbiAgbGV0IGZvdW5kTmFtZXNfMTIyNiA9IGV4cF8xMjI1LnJlZHVjZSgoYWNjXzEyMjcsIGVfMTIyOCkgPT4ge1xuICAgIGlmIChpc0V4cG9ydEZyb20oZV8xMjI4KSkge1xuICAgICAgcmV0dXJuIGFjY18xMjI3LmNvbmNhdChlXzEyMjgubmFtZWRFeHBvcnRzLnJlZHVjZSgoYWNjXzEyMjksIHNwZWNpZmllcl8xMjMwKSA9PiB7XG4gICAgICAgIGlmIChzcGVjaWZpZXJfMTIzMC5leHBvcnRlZE5hbWUudmFsKCkgPT09IG5hbWVfMTIyNC52YWwoKSkge1xuICAgICAgICAgIHJldHVybiBhY2NfMTIyOS5jb25jYXQoc3BlY2lmaWVyXzEyMzAuZXhwb3J0ZWROYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWNjXzEyMjk7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9IGVsc2UgaWYgKGlzRXhwb3J0KGVfMTIyOCkpIHtcbiAgICAgIHJldHVybiBhY2NfMTIyNy5jb25jYXQoZV8xMjI4LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLnJlZHVjZSgoYWNjXzEyMzEsIGRlY2xfMTIzMikgPT4ge1xuICAgICAgICBpZiAoZGVjbF8xMjMyLmJpbmRpbmcubmFtZS52YWwoKSA9PT0gbmFtZV8xMjI0LnZhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFjY18xMjMxLmNvbmNhdChkZWNsXzEyMzIuYmluZGluZy5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWNjXzEyMzE7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY18xMjI3O1xuICB9LCBMaXN0KCkpO1xuICBhc3NlcnQoZm91bmROYW1lc18xMjI2LnNpemUgPD0gMSwgXCJleHBlY3Rpbmcgbm8gbW9yZSB0aGFuIDEgbWF0Y2hpbmcgbmFtZSBpbiBleHBvcnRzXCIpO1xuICByZXR1cm4gZm91bmROYW1lc18xMjI2LmdldCgwKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZU5hbWVzXzEyMTUoaW1wVGVybV8xMjMzLCBuYW1lc18xMjM0KSB7XG4gIGxldCBuYW1lZEltcG9ydHNfMTIzNSA9IGltcFRlcm1fMTIzMy5uYW1lZEltcG9ydHMuZmlsdGVyKHNwZWNpZmllcl8xMjM2ID0+ICFuYW1lc18xMjM0LmNvbnRhaW5zKHNwZWNpZmllcl8xMjM2LmJpbmRpbmcubmFtZSkpO1xuICByZXR1cm4gaW1wVGVybV8xMjMzLmV4dGVuZCh7bmFtZWRJbXBvcnRzOiBuYW1lZEltcG9ydHNfMTIzNX0pO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW5FeHBhbmRlciBleHRlbmRzIEFTVERpc3BhdGNoZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0XzEyMzcpIHtcbiAgICBzdXBlcihcImV4cGFuZFwiLCBmYWxzZSk7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF8xMjM3O1xuICB9XG4gIGV4cGFuZChzdHhsXzEyMzgpIHtcbiAgICBsZXQgcmVzdWx0XzEyMzkgPSBbXTtcbiAgICBpZiAoc3R4bF8xMjM4LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBMaXN0KHJlc3VsdF8xMjM5KTtcbiAgICB9XG4gICAgbGV0IHByZXZfMTI0MCA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzEyNDEgPSBuZXcgRW5mb3Jlc3RlcihzdHhsXzEyMzgsIHByZXZfMTI0MCwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoIWVuZl8xMjQxLmRvbmUpIHtcbiAgICAgIHJlc3VsdF8xMjM5LnB1c2godGhpcy5kaXNwYXRjaChlbmZfMTI0MS5lbmZvcmVzdCgpKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8xMjM5KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50KHRlcm1fMTI0Mikge1xuICAgIHJldHVybiB0ZXJtXzEyNDIuZXh0ZW5kKHtkZWNsYXJhdGlvbjogdGhpcy5yZWdpc3RlclZhcmlhYmxlRGVjbGFyYXRpb24odGVybV8xMjQyLmRlY2xhcmF0aW9uKX0pO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybV8xMjQzKSB7XG4gICAgbGV0IHJlZ2lzdGVyZWRUZXJtXzEyNDQgPSB0aGlzLnJlZ2lzdGVyRnVuY3Rpb25PckNsYXNzKHRlcm1fMTI0Myk7XG4gICAgbGV0IHN0eF8xMjQ1ID0gcmVnaXN0ZXJlZFRlcm1fMTI0NC5uYW1lLm5hbWU7XG4gICAgdGhpcy5jb250ZXh0LmVudi5zZXQoc3R4XzEyNDUucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpLCBuZXcgVmFyQmluZGluZ1RyYW5zZm9ybShzdHhfMTI0NSkpO1xuICAgIHJldHVybiByZWdpc3RlcmVkVGVybV8xMjQ0O1xuICB9XG4gIGV4cGFuZEltcG9ydCh0ZXJtXzEyNDYpIHtcbiAgICBsZXQgcGF0aF8xMjQ3ID0gdGVybV8xMjQ2Lm1vZHVsZVNwZWNpZmllci52YWwoKTtcbiAgICBsZXQgbW9kXzEyNDg7XG4gICAgaWYgKHRlcm1fMTI0Ni5mb3JTeW50YXgpIHtcbiAgICAgIG1vZF8xMjQ4ID0gdGhpcy5jb250ZXh0Lm1vZHVsZXMuZ2V0QXRQaGFzZShwYXRoXzEyNDcsIHRoaXMuY29udGV4dC5waGFzZSArIDEsIHRoaXMuY29udGV4dC5jd2QpO1xuICAgICAgdGhpcy5jb250ZXh0LnN0b3JlID0gdGhpcy5jb250ZXh0Lm1vZHVsZXMudmlzaXQobW9kXzEyNDgsIHRoaXMuY29udGV4dC5waGFzZSArIDEsIHRoaXMuY29udGV4dC5zdG9yZSk7XG4gICAgICB0aGlzLmNvbnRleHQuc3RvcmUgPSB0aGlzLmNvbnRleHQubW9kdWxlcy5pbnZva2UobW9kXzEyNDgsIHRoaXMuY29udGV4dC5waGFzZSArIDEsIHRoaXMuY29udGV4dC5zdG9yZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1vZF8xMjQ4ID0gdGhpcy5jb250ZXh0Lm1vZHVsZXMuZ2V0QXRQaGFzZShwYXRoXzEyNDcsIHRoaXMuY29udGV4dC5waGFzZSwgdGhpcy5jb250ZXh0LmN3ZCk7XG4gICAgICB0aGlzLmNvbnRleHQuc3RvcmUgPSB0aGlzLmNvbnRleHQubW9kdWxlcy52aXNpdChtb2RfMTI0OCwgdGhpcy5jb250ZXh0LnBoYXNlLCB0aGlzLmNvbnRleHQuc3RvcmUpO1xuICAgIH1cbiAgICBsZXQgYm91bmROYW1lc18xMjQ5ID0gYmluZEltcG9ydHNfMTIxMyh0ZXJtXzEyNDYsIG1vZF8xMjQ4LCB0aGlzLmNvbnRleHQpO1xuICAgIHJldHVybiByZW1vdmVOYW1lc18xMjE1KHRlcm1fMTI0NiwgYm91bmROYW1lc18xMjQ5KTtcbiAgfVxuICBleHBhbmRFeHBvcnQodGVybV8xMjUwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb25EZWNsYXJhdGlvbih0ZXJtXzEyNTAuZGVjbGFyYXRpb24pIHx8IGlzQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzEyNTAuZGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4gdGVybV8xMjUwLmV4dGVuZCh7ZGVjbGFyYXRpb246IHRoaXMucmVnaXN0ZXJGdW5jdGlvbk9yQ2xhc3ModGVybV8xMjUwLmRlY2xhcmF0aW9uKX0pO1xuICAgIH0gZWxzZSBpZiAoaXNWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm1fMTI1MC5kZWNsYXJhdGlvbikpIHtcbiAgICAgIHJldHVybiB0ZXJtXzEyNTAuZXh0ZW5kKHtkZWNsYXJhdGlvbjogdGhpcy5yZWdpc3RlclZhcmlhYmxlRGVjbGFyYXRpb24odGVybV8xMjUwLmRlY2xhcmF0aW9uKX0pO1xuICAgIH1cbiAgICByZXR1cm4gdGVybV8xMjUwO1xuICB9XG4gIHJlZ2lzdGVyRnVuY3Rpb25PckNsYXNzKHRlcm1fMTI1MSkge1xuICAgIGxldCBuYW1lXzEyNTIgPSB0ZXJtXzEyNTEubmFtZS5yZW1vdmVTY29wZSh0aGlzLmNvbnRleHQudXNlU2NvcGUsIHRoaXMuY29udGV4dC5waGFzZSk7XG4gICAgY29sbGVjdEJpbmRpbmdzKHRlcm1fMTI1MS5uYW1lKS5mb3JFYWNoKHN0eF8xMjUzID0+IHtcbiAgICAgIGxldCBuZXdCaW5kaW5nXzEyNTQgPSBnZW5zeW0oc3R4XzEyNTMudmFsKCkpO1xuICAgICAgdGhpcy5jb250ZXh0LmJpbmRpbmdzLmFkZChzdHhfMTI1Mywge2JpbmRpbmc6IG5ld0JpbmRpbmdfMTI1NCwgcGhhc2U6IHRoaXMuY29udGV4dC5waGFzZSwgc2tpcER1cDogZmFsc2V9KTtcbiAgICAgIHRoaXMuY29udGV4dC5lbnYuc2V0KG5ld0JpbmRpbmdfMTI1NC50b1N0cmluZygpLCBuZXcgVmFyQmluZGluZ1RyYW5zZm9ybShzdHhfMTI1MykpO1xuICAgIH0pO1xuICAgIHJldHVybiB0ZXJtXzEyNTEuZXh0ZW5kKHtuYW1lOiBuYW1lXzEyNTJ9KTtcbiAgfVxuICByZWdpc3RlclZhcmlhYmxlRGVjbGFyYXRpb24odGVybV8xMjU1KSB7XG4gICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24odGVybV8xMjU1KSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKHRlcm1fMTI1NSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyU3ludGF4RGVjbGFyYXRpb24odGVybV8xMjU1KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fMTI1NS5leHRlbmQoe2RlY2xhcmF0b3JzOiB0ZXJtXzEyNTUuZGVjbGFyYXRvcnMubWFwKGRlY2xfMTI1NiA9PiB7XG4gICAgICBsZXQgYmluZGluZ18xMjU3ID0gZGVjbF8xMjU2LmJpbmRpbmcucmVtb3ZlU2NvcGUodGhpcy5jb250ZXh0LnVzZVNjb3BlLCB0aGlzLmNvbnRleHQucGhhc2UpO1xuICAgICAgY29sbGVjdEJpbmRpbmdzKGJpbmRpbmdfMTI1NykuZm9yRWFjaChzdHhfMTI1OCA9PiB7XG4gICAgICAgIGxldCBuZXdCaW5kaW5nXzEyNTkgPSBnZW5zeW0oc3R4XzEyNTgudmFsKCkpO1xuICAgICAgICB0aGlzLmNvbnRleHQuYmluZGluZ3MuYWRkKHN0eF8xMjU4LCB7YmluZGluZzogbmV3QmluZGluZ18xMjU5LCBwaGFzZTogdGhpcy5jb250ZXh0LnBoYXNlLCBza2lwRHVwOiB0ZXJtXzEyNTUua2luZCA9PT0gXCJ2YXJcIn0pO1xuICAgICAgICB0aGlzLmNvbnRleHQuZW52LnNldChuZXdCaW5kaW5nXzEyNTkudG9TdHJpbmcoKSwgbmV3IFZhckJpbmRpbmdUcmFuc2Zvcm0oc3R4XzEyNTgpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlY2xfMTI1Ni5leHRlbmQoe2JpbmRpbmc6IGJpbmRpbmdfMTI1N30pO1xuICAgIH0pfSk7XG4gIH1cbiAgcmVnaXN0ZXJTeW50YXhEZWNsYXJhdGlvbih0ZXJtXzEyNjApIHtcbiAgICBpZiAoaXNTeW50YXhEZWNsYXJhdGlvbih0ZXJtXzEyNjApKSB7XG4gICAgICBsZXQgc2NvcGUgPSBmcmVzaFNjb3BlKFwibm9ucmVjXCIpO1xuICAgICAgdGVybV8xMjYwID0gdGVybV8xMjYwLmV4dGVuZCh7ZGVjbGFyYXRvcnM6IHRlcm1fMTI2MC5kZWNsYXJhdG9ycy5tYXAoZGVjbF8xMjYxID0+IHtcbiAgICAgICAgbGV0IG5hbWVfMTI2MiA9IGRlY2xfMTI2MS5iaW5kaW5nLm5hbWU7XG4gICAgICAgIGxldCBuYW1lQWRkZWRfMTI2MyA9IG5hbWVfMTI2Mi5hZGRTY29wZShzY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKTtcbiAgICAgICAgbGV0IG5hbWVSZW1vdmVkXzEyNjQgPSBuYW1lXzEyNjIucmVtb3ZlU2NvcGUodGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZVt0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLmxlbmd0aCAtIDFdLCB0aGlzLmNvbnRleHQucGhhc2UpO1xuICAgICAgICBsZXQgbmV3QmluZGluZ18xMjY1ID0gZ2Vuc3ltKG5hbWVfMTI2Mi52YWwoKSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVBZGRlZF8xMjYzLCBuYW1lUmVtb3ZlZF8xMjY0LCBuZXdCaW5kaW5nXzEyNjUsIHRoaXMuY29udGV4dC5waGFzZSk7XG4gICAgICAgIHJldHVybiBkZWNsXzEyNjEuZXh0ZW5kKHtpbml0OiBkZWNsXzEyNjEuaW5pdC5hZGRTY29wZShzY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKX0pO1xuICAgICAgfSl9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fMTI2MC5leHRlbmQoe2RlY2xhcmF0b3JzOiB0ZXJtXzEyNjAuZGVjbGFyYXRvcnMubWFwKGRlY2xfMTI2NiA9PiB7XG4gICAgICBsZXQgYmluZGluZ18xMjY3ID0gZGVjbF8xMjY2LmJpbmRpbmcucmVtb3ZlU2NvcGUodGhpcy5jb250ZXh0LnVzZVNjb3BlLCB0aGlzLmNvbnRleHQucGhhc2UpO1xuICAgICAgbGV0IHN5bnRheEV4cGFuZGVyXzEyNjggPSBuZXcgVGVybUV4cGFuZGVyKF8ubWVyZ2UodGhpcy5jb250ZXh0LCB7cGhhc2U6IHRoaXMuY29udGV4dC5waGFzZSArIDEsIGVudjogbmV3IEVudiwgc3RvcmU6IHRoaXMuY29udGV4dC5zdG9yZX0pKTtcbiAgICAgIGxldCBpbml0XzEyNjkgPSBzeW50YXhFeHBhbmRlcl8xMjY4LmV4cGFuZChkZWNsXzEyNjYuaW5pdCk7XG4gICAgICBsZXQgdmFsXzEyNzAgPSBldmFsQ29tcGlsZXRpbWVWYWx1ZShpbml0XzEyNjkuZ2VuKCksIF8ubWVyZ2UodGhpcy5jb250ZXh0LCB7cGhhc2U6IHRoaXMuY29udGV4dC5waGFzZSArIDF9KSk7XG4gICAgICBjb2xsZWN0QmluZGluZ3MoYmluZGluZ18xMjY3KS5mb3JFYWNoKHN0eF8xMjcxID0+IHtcbiAgICAgICAgbGV0IG5ld0JpbmRpbmdfMTI3MiA9IGdlbnN5bShzdHhfMTI3MS52YWwoKSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5iaW5kaW5ncy5hZGQoc3R4XzEyNzEsIHtiaW5kaW5nOiBuZXdCaW5kaW5nXzEyNzIsIHBoYXNlOiB0aGlzLmNvbnRleHQucGhhc2UsIHNraXBEdXA6IGZhbHNlfSk7XG4gICAgICAgIGxldCByZXNvbHZlZE5hbWVfMTI3MyA9IHN0eF8xMjcxLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmVudi5zZXQocmVzb2x2ZWROYW1lXzEyNzMsIG5ldyBDb21waWxldGltZVRyYW5zZm9ybSh2YWxfMTI3MCkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVjbF8xMjY2LmV4dGVuZCh7YmluZGluZzogYmluZGluZ18xMjY3LCBpbml0OiBpbml0XzEyNjl9KTtcbiAgICB9KX0pO1xuICB9XG59XG4iXX0=