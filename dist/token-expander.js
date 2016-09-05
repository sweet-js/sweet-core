"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _enforester = require("./enforester");

var _termExpander = require("./term-expander.js");

var _termExpander2 = _interopRequireDefault(_termExpander);

var _env = require("./env");

var _env2 = _interopRequireDefault(_env);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _terms = require("./terms");

var T = _interopRequireWildcard(_terms);

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

var _loadSyntax = require("./load-syntax");

var _scope = require("./scope");

var _syntax = require("./syntax");

var _astDispatcher = require("./ast-dispatcher");

var _astDispatcher2 = _interopRequireDefault(_astDispatcher);

var _hygieneUtils = require("./hygiene-utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bindImports(impTerm, exModule, context) {
  let names = [];
  let phase = impTerm.forSyntax ? context.phase + 1 : context.phase;
  impTerm.namedImports.forEach(specifier => {
    let name = specifier.binding.name;
    let exportName = findNameInExports(name, exModule.exportEntries);
    if (exportName != null) {
      let newBinding = (0, _symbol.gensym)(name.val());
      context.store.set(newBinding.toString(), new _transforms.VarBindingTransform(name));
      context.bindings.addForward(name, exportName, newBinding, phase);
      names.push(name);
    }
  });
  return (0, _immutable.List)(names);
}

function findNameInExports(name, exp) {
  let foundNames = exp.reduce((acc, e) => {
    if (T.isExportFrom(e)) {
      return acc.concat(e.namedExports.reduce((acc, specifier) => {
        if (specifier.exportedName.val() === name.val()) {
          return acc.concat(specifier.exportedName);
        }
        return acc;
      }, (0, _immutable.List)()));
    } else if (T.isExport(e)) {
      return acc.concat(e.declaration.declarators.reduce((acc, decl) => {
        if (decl.binding.name.val() === name.val()) {
          return acc.concat(decl.binding.name);
        }
        return acc;
      }, (0, _immutable.List)()));
    }
    return acc;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames.size <= 1, 'expecting no more than 1 matching name in exports');
  return foundNames.get(0);
}

function removeNames(impTerm, names) {
  let namedImports = impTerm.namedImports.filter(specifier => !names.contains(specifier.binding.name));
  return impTerm.extend({ namedImports: namedImports });
}

// function bindAllSyntaxExports(exModule, toSynth, context) {
//   let phase = context.phase;
//   exModule.exportEntries.forEach(ex => {
//     if (isExportSyntax(ex)) {
//       ex.declaration.declarators.forEach(decl => {
//         let name = decl.binding.name;
//         let newBinding = gensym(name.val());
//         let storeName = exModule.moduleSpecifier + ":" + name.val() + ":" + phase;
//         let synthStx = Syntax.fromIdentifier(name.val(), toSynth);
//         let storeStx = Syntax.fromIdentifier(storeName, toSynth);
//         context.bindings.addForward(synthStx, storeStx, newBinding, phase);
//       });
//     }
//   });
// }

class TokenExpander extends _astDispatcher2.default {
  constructor(context) {
    super('expand', false);
    this.context = context;
  }

  expand(stxl) {
    let result = [];
    if (stxl.size === 0) {
      return (0, _immutable.List)(result);
    }
    let prev = (0, _immutable.List)();
    let enf = new _enforester.Enforester(stxl, prev, this.context);

    while (!enf.done) {
      result.push(this.dispatch(enf.enforest()));
    }

    return (0, _immutable.List)(result);
  }

  expandVariableDeclarationStatement(term) {
    return term.extend({
      declaration: this.registerVariableDeclaration(term.declaration)
    });
  }

  expandFunctionDeclaration(term) {
    let registeredTerm = this.registerFunctionOrClass(term);
    let stx = registeredTerm.name.name;
    this.context.env.set(stx.resolve(this.context.phase), new _transforms.VarBindingTransform(stx));
    return registeredTerm;
  }

  // TODO: think about function expressions

  expandImport(term) {
    let path = term.moduleSpecifier.val();
    let mod;
    if (term.forSyntax) {
      mod = this.context.modules.getAtPhase(path, this.context.phase + 1, this.context.cwd);
      this.context.store = this.context.modules.visit(mod, this.context.phase + 1, this.context.store);
      this.context.store = this.context.modules.invoke(mod, this.context.phase + 1, this.context.store);
    } else {
      mod = this.context.modules.getAtPhase(path, this.context.phase, this.context.cwd);
      this.context.store = this.context.modules.visit(mod, this.context.phase, this.context.store);
    }
    let boundNames = bindImports(term, mod, this.context);
    return removeNames(term, boundNames);
  }

  expandExport(term) {
    if (T.isFunctionDeclaration(term.declaration) || T.isClassDeclaration(term.declaration)) {
      return term.extend({
        declaration: this.registerFunctionOrClass(term.declaration)
      });
    } else if (T.isVariableDeclaration(term.declaration)) {
      return term.extend({
        declaration: this.registerVariableDeclaration(term.declaration)
      });
    }
    return term;
  }

  // [isPragma, term => {
  //   let pathStx = term.items.get(0);
  //   if (pathStx.val() === 'base') {
  //     return term;
  //   }
  //   let mod = this.context.modules.loadAndCompile(pathStx.val());
  //   store = this.context.modules.visit(mod, phase, store);
  //   bindAllSyntaxExports(mod, pathStx, this.context);
  //   return term;
  // }],

  registerFunctionOrClass(term) {
    let name = term.name.removeScope(this.context.useScope, this.context.phase);
    (0, _hygieneUtils.collectBindings)(term.name).forEach(stx => {
      let newBinding = (0, _symbol.gensym)(stx.val());
      this.context.bindings.add(stx, {
        binding: newBinding,
        phase: this.context.phase,
        skipDup: false
      });
      // the meaning of a function declaration name is a runtime var binding
      this.context.env.set(newBinding.toString(), new _transforms.VarBindingTransform(stx));
    });
    return term.extend({ name: name });
  }

  registerVariableDeclaration(term) {
    if (T.isSyntaxDeclaration(term) || T.isSyntaxrecDeclaration(term)) {
      return this.registerSyntaxDeclaration(term);
    }
    return term.extend({
      declarators: term.declarators.map(decl => {
        let binding = decl.binding.removeScope(this.context.useScope, this.context.phase);
        (0, _hygieneUtils.collectBindings)(binding).forEach(stx => {
          let newBinding = (0, _symbol.gensym)(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: this.context.phase,
            skipDup: term.kind === 'var'
          });
          // the meaning of a var/let/const declaration is a var binding
          this.context.env.set(newBinding.toString(), new _transforms.VarBindingTransform(stx));
        });
        return decl.extend({ binding: binding });
      })
    });
  }

  registerSyntaxDeclaration(term) {
    // syntax id^{a, b} = <init>^{a, b}
    // ->
    // syntaxrec id^{a,b,c} = function() { return <<id^{a}>> }
    // syntaxrec id^{a,b} = <init>^{a,b,c}
    if (T.isSyntaxDeclaration(term)) {
      let scope = (0, _scope.freshScope)('nonrec');
      term = term.extend({
        declarators: term.declarators.map(decl => {
          let name = decl.binding.name;
          let nameAdded = name.addScope(scope, this.context.bindings, _syntax.ALL_PHASES);
          let nameRemoved = name.removeScope(this.context.currentScope[this.context.currentScope.length - 1], this.context.phase);
          let newBinding = (0, _symbol.gensym)(name.val());
          this.context.bindings.addForward(nameAdded, nameRemoved, newBinding, this.context.phase);
          return decl.extend({
            init: decl.init.addScope(scope, this.context.bindings, _syntax.ALL_PHASES)
          });
        })
      });
    }

    // for syntax declarations we need to load the compiletime value
    // into the environment
    return term.extend({
      declarators: term.declarators.map(decl => {
        let binding = decl.binding.removeScope(this.context.useScope, this.context.phase);
        // each compiletime value needs to be expanded with a fresh
        // environment and in the next higher phase
        let syntaxExpander = new _termExpander2.default(_.merge(this.context, {
          phase: this.context.phase + 1,
          env: new _env2.default(),
          store: this.context.store
        }));
        let init = syntaxExpander.expand(decl.init);
        let val = (0, _loadSyntax.evalCompiletimeValue)(init.gen(), _.merge(this.context, {
          phase: this.context.phase + 1
        }));
        (0, _hygieneUtils.collectBindings)(binding).forEach(stx => {
          let newBinding = (0, _symbol.gensym)(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: this.context.phase,
            skipDup: false
          });
          let resolvedName = stx.resolve(this.context.phase);
          this.context.env.set(resolvedName, new _transforms.CompiletimeTransform(val));
        });
        return decl.extend({ binding: binding, init: init });
      })
    });
  }
}
exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90b2tlbi1leHBhbmRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVksQzs7QUFDWjs7SUFBWSxDOztBQUNaOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLFNBQVMsV0FBVCxDQUFxQixPQUFyQixFQUE4QixRQUE5QixFQUF3QyxPQUF4QyxFQUFpRDtBQUMvQyxNQUFJLFFBQVEsRUFBWjtBQUNBLE1BQUksUUFBUSxRQUFRLFNBQVIsR0FBb0IsUUFBUSxLQUFSLEdBQWdCLENBQXBDLEdBQXdDLFFBQVEsS0FBNUQ7QUFDQSxVQUFRLFlBQVIsQ0FBcUIsT0FBckIsQ0FBNkIsYUFBYTtBQUN4QyxRQUFJLE9BQU8sVUFBVSxPQUFWLENBQWtCLElBQTdCO0FBQ0EsUUFBSSxhQUFhLGtCQUFrQixJQUFsQixFQUF3QixTQUFTLGFBQWpDLENBQWpCO0FBQ0EsUUFBSSxjQUFjLElBQWxCLEVBQXdCO0FBQ3RCLFVBQUksYUFBYSxvQkFBTyxLQUFLLEdBQUwsRUFBUCxDQUFqQjtBQUNBLGNBQVEsS0FBUixDQUFjLEdBQWQsQ0FBa0IsV0FBVyxRQUFYLEVBQWxCLEVBQXlDLG9DQUF3QixJQUF4QixDQUF6QztBQUNBLGNBQVEsUUFBUixDQUFpQixVQUFqQixDQUE0QixJQUE1QixFQUFrQyxVQUFsQyxFQUE4QyxVQUE5QyxFQUEwRCxLQUExRDtBQUNBLFlBQU0sSUFBTixDQUFXLElBQVg7QUFDRDtBQUNGLEdBVEQ7QUFVQSxTQUFPLHFCQUFLLEtBQUwsQ0FBUDtBQUNEOztBQUdELFNBQVMsaUJBQVQsQ0FBMkIsSUFBM0IsRUFBaUMsR0FBakMsRUFBc0M7QUFDcEMsTUFBSSxhQUFhLElBQUksTUFBSixDQUFXLENBQUMsR0FBRCxFQUFNLENBQU4sS0FBWTtBQUN0QyxRQUFJLEVBQUUsWUFBRixDQUFlLENBQWYsQ0FBSixFQUF1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QyxFQUFFLEtBQUYsQ0FBUSxLQUFLLE9BQWIsRUFBc0I7QUFDL0QsaUJBQU8sS0FBSyxPQUFMLENBQWEsS0FBYixHQUFxQjtBQURtQyxTQUF0QixDQUFqQyxDQUFWO0FBR0EsMkNBQWdCLE9BQWhCLEVBQXlCLE9BQXpCLENBQWlDLE9BQU87QUFDdEMsY0FBSSxhQUFhLG9CQUFPLElBQUksR0FBSixFQUFQLENBQWpCO0FBQ0EsZUFBSyxPQUFMLENBQWEsUUFBYixDQUFzQixHQUF0QixDQUEwQixHQUExQixFQUErQjtBQUM3QixxQkFBUyxVQURvQjtBQUU3QixtQkFBTyxLQUFLLE9BQUwsQ0FBYSxLQUZTO0FBRzdCLHFCQUFTO0FBSG9CLFdBQS9CO0FBS0EsY0FBSSxlQUFlLElBQUksT0FBSixDQUFZLEtBQUssT0FBTCxDQUFhLEtBQXpCLENBQW5CO0FBQ0EsZUFBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixZQUFyQixFQUFtQyxxQ0FBeUIsR0FBekIsQ0FBbkM7QUFDRCxTQVREO0FBVUEsZUFBTyxLQUFLLE1BQUwsQ0FBWSxFQUFFLGdCQUFGLEVBQVcsVUFBWCxFQUFaLENBQVA7QUFDRCxPQXhCWTtBQURJLEtBQVosQ0FBUDtBQTJCRDtBQXBLc0Q7a0JBQXBDLGEiLCJmaWxlIjoidG9rZW4tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaXN0IH0gZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7ICBFbmZvcmVzdGVyIH0gZnJvbSBcIi4vZW5mb3Jlc3RlclwiO1xuaW1wb3J0IFRlcm1FeHBhbmRlciBmcm9tIFwiLi90ZXJtLWV4cGFuZGVyLmpzXCI7XG5pbXBvcnQgRW52IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCAqIGFzIFQgZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7IGdlbnN5bSB9IGZyb20gJy4vc3ltYm9sJztcbmltcG9ydCB7IFZhckJpbmRpbmdUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtIH0gZnJvbSAnLi90cmFuc2Zvcm1zJztcbmltcG9ydCB7ICBhc3NlcnQgfSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7IGV2YWxDb21waWxldGltZVZhbHVlIH0gZnJvbSAnLi9sb2FkLXN5bnRheCc7XG5pbXBvcnQgeyAgZnJlc2hTY29wZSB9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgeyBBTExfUEhBU0VTIH0gZnJvbSAnLi9zeW50YXgnO1xuaW1wb3J0IEFTVERpc3BhdGNoZXIgZnJvbSAnLi9hc3QtZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBjb2xsZWN0QmluZGluZ3MgfSBmcm9tICcuL2h5Z2llbmUtdXRpbHMnO1xuXG5mdW5jdGlvbiBiaW5kSW1wb3J0cyhpbXBUZXJtLCBleE1vZHVsZSwgY29udGV4dCkge1xuICBsZXQgbmFtZXMgPSBbXTtcbiAgbGV0IHBoYXNlID0gaW1wVGVybS5mb3JTeW50YXggPyBjb250ZXh0LnBoYXNlICsgMSA6IGNvbnRleHQucGhhc2U7XG4gIGltcFRlcm0ubmFtZWRJbXBvcnRzLmZvckVhY2goc3BlY2lmaWVyID0+IHtcbiAgICBsZXQgbmFtZSA9IHNwZWNpZmllci5iaW5kaW5nLm5hbWU7XG4gICAgbGV0IGV4cG9ydE5hbWUgPSBmaW5kTmFtZUluRXhwb3J0cyhuYW1lLCBleE1vZHVsZS5leHBvcnRFbnRyaWVzKTtcbiAgICBpZiAoZXhwb3J0TmFtZSAhPSBudWxsKSB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lLnZhbCgpKTtcbiAgICAgIGNvbnRleHQuc3RvcmUuc2V0KG5ld0JpbmRpbmcudG9TdHJpbmcoKSwgbmV3IFZhckJpbmRpbmdUcmFuc2Zvcm0obmFtZSkpO1xuICAgICAgY29udGV4dC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWUsIGV4cG9ydE5hbWUsIG5ld0JpbmRpbmcsIHBoYXNlKTtcbiAgICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIExpc3QobmFtZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZpbmROYW1lSW5FeHBvcnRzKG5hbWUsIGV4cCkge1xuICBsZXQgZm91bmROYW1lcyA9IGV4cC5yZWR1Y2UoKGFjYywgZSkgPT4ge1xuICAgIGlmIChULmlzRXhwb3J0RnJvbShlKSkge1xuICAgICAgcmV0dXJuIGFjYy5jb25jYXQoZS5uYW1lZEV4cG9ydHMucmVkdWNlKChhY2MsIHNwZWNpZmllcikgPT4ge1xuICAgICAgICBpZiAoc3BlY2lmaWVyLmV4cG9ydGVkTmFtZS52YWwoKSA9PT0gbmFtZS52YWwoKSkge1xuICAgICAgICAgIHJldHVybiBhY2MuY29uY2F0KHNwZWNpZmllci5leHBvcnRlZE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9IGVsc2UgaWYgKFQuaXNFeHBvcnQoZSkpIHtcbiAgICAgIHJldHVybiBhY2MuY29uY2F0KGUuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMucmVkdWNlKChhY2MsIGRlY2wpID0+IHtcbiAgICAgICAgaWYgKGRlY2wuYmluZGluZy5uYW1lLnZhbCgpID09PSBuYW1lLnZhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFjYy5jb25jYXQoZGVjbC5iaW5kaW5nLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjYztcbiAgfSwgTGlzdCgpKTtcbiAgYXNzZXJ0KGZvdW5kTmFtZXMuc2l6ZSA8PSAxLCAnZXhwZWN0aW5nIG5vIG1vcmUgdGhhbiAxIG1hdGNoaW5nIG5hbWUgaW4gZXhwb3J0cycpO1xuICByZXR1cm4gZm91bmROYW1lcy5nZXQoMCk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5hbWVzKGltcFRlcm0sIG5hbWVzKSB7XG4gIGxldCBuYW1lZEltcG9ydHMgPSBpbXBUZXJtLm5hbWVkSW1wb3J0cy5maWx0ZXIoc3BlY2lmaWVyID0+ICFuYW1lcy5jb250YWlucyhzcGVjaWZpZXIuYmluZGluZy5uYW1lKSk7XG4gIHJldHVybiBpbXBUZXJtLmV4dGVuZCh7IG5hbWVkSW1wb3J0cyB9KTtcbn1cblxuLy8gZnVuY3Rpb24gYmluZEFsbFN5bnRheEV4cG9ydHMoZXhNb2R1bGUsIHRvU3ludGgsIGNvbnRleHQpIHtcbi8vICAgbGV0IHBoYXNlID0gY29udGV4dC5waGFzZTtcbi8vICAgZXhNb2R1bGUuZXhwb3J0RW50cmllcy5mb3JFYWNoKGV4ID0+IHtcbi8vICAgICBpZiAoaXNFeHBvcnRTeW50YXgoZXgpKSB7XG4vLyAgICAgICBleC5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5mb3JFYWNoKGRlY2wgPT4ge1xuLy8gICAgICAgICBsZXQgbmFtZSA9IGRlY2wuYmluZGluZy5uYW1lO1xuLy8gICAgICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lLnZhbCgpKTtcbi8vICAgICAgICAgbGV0IHN0b3JlTmFtZSA9IGV4TW9kdWxlLm1vZHVsZVNwZWNpZmllciArIFwiOlwiICsgbmFtZS52YWwoKSArIFwiOlwiICsgcGhhc2U7XG4vLyAgICAgICAgIGxldCBzeW50aFN0eCA9IFN5bnRheC5mcm9tSWRlbnRpZmllcihuYW1lLnZhbCgpLCB0b1N5bnRoKTtcbi8vICAgICAgICAgbGV0IHN0b3JlU3R4ID0gU3ludGF4LmZyb21JZGVudGlmaWVyKHN0b3JlTmFtZSwgdG9TeW50aCk7XG4vLyAgICAgICAgIGNvbnRleHQuYmluZGluZ3MuYWRkRm9yd2FyZChzeW50aFN0eCwgc3RvcmVTdHgsIG5ld0JpbmRpbmcsIHBoYXNlKTtcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgfSk7XG4vLyB9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRva2VuRXhwYW5kZXIgZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dCkge1xuICAgIHN1cGVyKCdleHBhbmQnLCBmYWxzZSk7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgfVxuXG4gIGV4cGFuZChzdHhsKSB7XG4gICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgIGlmIChzdHhsLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBMaXN0KHJlc3VsdCk7XG4gICAgfVxuICAgIGxldCBwcmV2ID0gTGlzdCgpO1xuICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3RlcihzdHhsLCBwcmV2LCB0aGlzLmNvbnRleHQpO1xuXG4gICAgd2hpbGUoIWVuZi5kb25lKSB7XG4gICAgICByZXN1bHQucHVzaCh0aGlzLmRpc3BhdGNoKGVuZi5lbmZvcmVzdCgpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIExpc3QocmVzdWx0KTtcbiAgfVxuXG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiB0ZXJtLmV4dGVuZCh7XG4gICAgICBkZWNsYXJhdGlvbjogdGhpcy5yZWdpc3RlclZhcmlhYmxlRGVjbGFyYXRpb24odGVybS5kZWNsYXJhdGlvbilcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybSkge1xuICAgIGxldCByZWdpc3RlcmVkVGVybSA9IHRoaXMucmVnaXN0ZXJGdW5jdGlvbk9yQ2xhc3ModGVybSk7XG4gICAgbGV0IHN0eCA9IHJlZ2lzdGVyZWRUZXJtLm5hbWUubmFtZTtcbiAgICB0aGlzLmNvbnRleHQuZW52LnNldChzdHgucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKHN0eCkpO1xuICAgIHJldHVybiByZWdpc3RlcmVkVGVybTtcbiAgfVxuXG4gIC8vIFRPRE86IHRoaW5rIGFib3V0IGZ1bmN0aW9uIGV4cHJlc3Npb25zXG5cbiAgZXhwYW5kSW1wb3J0KHRlcm0pIHtcbiAgICBsZXQgcGF0aCA9IHRlcm0ubW9kdWxlU3BlY2lmaWVyLnZhbCgpO1xuICAgIGxldCBtb2Q7XG4gICAgaWYgKHRlcm0uZm9yU3ludGF4KSB7XG4gICAgICBtb2QgPSB0aGlzLmNvbnRleHQubW9kdWxlcy5nZXRBdFBoYXNlKHBhdGgsIHRoaXMuY29udGV4dC5waGFzZSArIDEsIHRoaXMuY29udGV4dC5jd2QpO1xuICAgICAgdGhpcy5jb250ZXh0LnN0b3JlID0gdGhpcy5jb250ZXh0Lm1vZHVsZXMudmlzaXQobW9kLCB0aGlzLmNvbnRleHQucGhhc2UgKyAxLCB0aGlzLmNvbnRleHQuc3RvcmUpO1xuICAgICAgdGhpcy5jb250ZXh0LnN0b3JlID0gdGhpcy5jb250ZXh0Lm1vZHVsZXMuaW52b2tlKG1vZCwgdGhpcy5jb250ZXh0LnBoYXNlICsgMSwgdGhpcy5jb250ZXh0LnN0b3JlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kID0gdGhpcy5jb250ZXh0Lm1vZHVsZXMuZ2V0QXRQaGFzZShwYXRoLCB0aGlzLmNvbnRleHQucGhhc2UsIHRoaXMuY29udGV4dC5jd2QpO1xuICAgICAgdGhpcy5jb250ZXh0LnN0b3JlID0gdGhpcy5jb250ZXh0Lm1vZHVsZXMudmlzaXQobW9kLCB0aGlzLmNvbnRleHQucGhhc2UsIHRoaXMuY29udGV4dC5zdG9yZSk7XG4gICAgfVxuICAgIGxldCBib3VuZE5hbWVzID0gYmluZEltcG9ydHModGVybSwgbW9kLCB0aGlzLmNvbnRleHQpO1xuICAgIHJldHVybiByZW1vdmVOYW1lcyh0ZXJtLCBib3VuZE5hbWVzKTtcbiAgfVxuXG4gIGV4cGFuZEV4cG9ydCh0ZXJtKSB7XG4gICAgaWYgKFQuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKHRlcm0uZGVjbGFyYXRpb24pIHx8IFQuaXNDbGFzc0RlY2xhcmF0aW9uKHRlcm0uZGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4gdGVybS5leHRlbmQoe1xuICAgICAgICBkZWNsYXJhdGlvbjogdGhpcy5yZWdpc3RlckZ1bmN0aW9uT3JDbGFzcyh0ZXJtLmRlY2xhcmF0aW9uKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChULmlzVmFyaWFibGVEZWNsYXJhdGlvbih0ZXJtLmRlY2xhcmF0aW9uKSkge1xuICAgICAgcmV0dXJuIHRlcm0uZXh0ZW5kKHtcbiAgICAgICAgZGVjbGFyYXRpb246IHRoaXMucmVnaXN0ZXJWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm0uZGVjbGFyYXRpb24pXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm07XG4gIH1cblxuICAvLyBbaXNQcmFnbWEsIHRlcm0gPT4ge1xuICAvLyAgIGxldCBwYXRoU3R4ID0gdGVybS5pdGVtcy5nZXQoMCk7XG4gIC8vICAgaWYgKHBhdGhTdHgudmFsKCkgPT09ICdiYXNlJykge1xuICAvLyAgICAgcmV0dXJuIHRlcm07XG4gIC8vICAgfVxuICAvLyAgIGxldCBtb2QgPSB0aGlzLmNvbnRleHQubW9kdWxlcy5sb2FkQW5kQ29tcGlsZShwYXRoU3R4LnZhbCgpKTtcbiAgLy8gICBzdG9yZSA9IHRoaXMuY29udGV4dC5tb2R1bGVzLnZpc2l0KG1vZCwgcGhhc2UsIHN0b3JlKTtcbiAgLy8gICBiaW5kQWxsU3ludGF4RXhwb3J0cyhtb2QsIHBhdGhTdHgsIHRoaXMuY29udGV4dCk7XG4gIC8vICAgcmV0dXJuIHRlcm07XG4gIC8vIH1dLFxuXG5cbiAgcmVnaXN0ZXJGdW5jdGlvbk9yQ2xhc3ModGVybSkge1xuICAgIGxldCBuYW1lID0gdGVybS5uYW1lLnJlbW92ZVNjb3BlKHRoaXMuY29udGV4dC51c2VTY29wZSwgdGhpcy5jb250ZXh0LnBoYXNlKTtcbiAgICBjb2xsZWN0QmluZGluZ3ModGVybS5uYW1lKS5mb3JFYWNoKHN0eCA9PiB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShzdHgudmFsKCkpO1xuICAgICAgdGhpcy5jb250ZXh0LmJpbmRpbmdzLmFkZChzdHgsIHtcbiAgICAgICAgYmluZGluZzogbmV3QmluZGluZyxcbiAgICAgICAgcGhhc2U6IHRoaXMuY29udGV4dC5waGFzZSxcbiAgICAgICAgc2tpcER1cDogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgLy8gdGhlIG1lYW5pbmcgb2YgYSBmdW5jdGlvbiBkZWNsYXJhdGlvbiBuYW1lIGlzIGEgcnVudGltZSB2YXIgYmluZGluZ1xuICAgICAgdGhpcy5jb250ZXh0LmVudi5zZXQobmV3QmluZGluZy50b1N0cmluZygpLCBuZXcgVmFyQmluZGluZ1RyYW5zZm9ybShzdHgpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGVybS5leHRlbmQoeyBuYW1lIH0pO1xuICB9XG5cbiAgcmVnaXN0ZXJWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm0pIHtcbiAgICBpZiAoVC5pc1N5bnRheERlY2xhcmF0aW9uKHRlcm0pIHx8IFQuaXNTeW50YXhyZWNEZWNsYXJhdGlvbih0ZXJtKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJTeW50YXhEZWNsYXJhdGlvbih0ZXJtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm0uZXh0ZW5kKHtcbiAgICAgIGRlY2xhcmF0b3JzOiB0ZXJtLmRlY2xhcmF0b3JzLm1hcChkZWNsID0+IHtcbiAgICAgICAgbGV0IGJpbmRpbmcgPSBkZWNsLmJpbmRpbmcucmVtb3ZlU2NvcGUodGhpcy5jb250ZXh0LnVzZVNjb3BlLCB0aGlzLmNvbnRleHQucGhhc2UpO1xuICAgICAgICBjb2xsZWN0QmluZGluZ3MoYmluZGluZykuZm9yRWFjaChzdHggPT4ge1xuICAgICAgICAgIGxldCBuZXdCaW5kaW5nID0gZ2Vuc3ltKHN0eC52YWwoKSk7XG4gICAgICAgICAgdGhpcy5jb250ZXh0LmJpbmRpbmdzLmFkZChzdHgsIHtcbiAgICAgICAgICAgIGJpbmRpbmc6IG5ld0JpbmRpbmcsXG4gICAgICAgICAgICBwaGFzZTogdGhpcy5jb250ZXh0LnBoYXNlLFxuICAgICAgICAgICAgc2tpcER1cDogdGVybS5raW5kID09PSAndmFyJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIHRoZSBtZWFuaW5nIG9mIGEgdmFyL2xldC9jb25zdCBkZWNsYXJhdGlvbiBpcyBhIHZhciBiaW5kaW5nXG4gICAgICAgICAgdGhpcy5jb250ZXh0LmVudi5zZXQobmV3QmluZGluZy50b1N0cmluZygpLCBuZXcgVmFyQmluZGluZ1RyYW5zZm9ybShzdHgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWNsLmV4dGVuZCh7IGJpbmRpbmcgfSk7XG4gICAgICB9KVxuICAgIH0pO1xuICB9XG5cbiAgcmVnaXN0ZXJTeW50YXhEZWNsYXJhdGlvbih0ZXJtKSB7XG4gICAgLy8gc3ludGF4IGlkXnthLCBifSA9IDxpbml0Pl57YSwgYn1cbiAgICAvLyAtPlxuICAgIC8vIHN5bnRheHJlYyBpZF57YSxiLGN9ID0gZnVuY3Rpb24oKSB7IHJldHVybiA8PGlkXnthfT4+IH1cbiAgICAvLyBzeW50YXhyZWMgaWRee2EsYn0gPSA8aW5pdD5ee2EsYixjfVxuICAgIGlmIChULmlzU3ludGF4RGVjbGFyYXRpb24odGVybSkpIHtcbiAgICAgIGxldCBzY29wZSA9IGZyZXNoU2NvcGUoJ25vbnJlYycpO1xuICAgICAgdGVybSA9IHRlcm0uZXh0ZW5kKHtcbiAgICAgICAgZGVjbGFyYXRvcnM6IHRlcm0uZGVjbGFyYXRvcnMubWFwKGRlY2wgPT4ge1xuICAgICAgICAgIGxldCBuYW1lID0gZGVjbC5iaW5kaW5nLm5hbWU7XG4gICAgICAgICAgbGV0IG5hbWVBZGRlZCA9IG5hbWUuYWRkU2NvcGUoc2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUyk7XG4gICAgICAgICAgbGV0IG5hbWVSZW1vdmVkID0gbmFtZS5yZW1vdmVTY29wZSh0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlW3RoaXMuY29udGV4dC5jdXJyZW50U2NvcGUubGVuZ3RoIC0gMV0sIHRoaXMuY29udGV4dC5waGFzZSk7XG4gICAgICAgICAgbGV0IG5ld0JpbmRpbmcgPSBnZW5zeW0obmFtZS52YWwoKSk7XG4gICAgICAgICAgdGhpcy5jb250ZXh0LmJpbmRpbmdzLmFkZEZvcndhcmQobmFtZUFkZGVkLCBuYW1lUmVtb3ZlZCwgbmV3QmluZGluZywgdGhpcy5jb250ZXh0LnBoYXNlKTtcbiAgICAgICAgICByZXR1cm4gZGVjbC5leHRlbmQoe1xuICAgICAgICAgICAgaW5pdDogZGVjbC5pbml0LmFkZFNjb3BlKHNjb3BlLCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBmb3Igc3ludGF4IGRlY2xhcmF0aW9ucyB3ZSBuZWVkIHRvIGxvYWQgdGhlIGNvbXBpbGV0aW1lIHZhbHVlXG4gICAgLy8gaW50byB0aGUgZW52aXJvbm1lbnRcbiAgICByZXR1cm4gdGVybS5leHRlbmQoe1xuICAgICAgZGVjbGFyYXRvcnM6IHRlcm0uZGVjbGFyYXRvcnMubWFwKGRlY2wgPT4ge1xuICAgICAgICBsZXQgYmluZGluZyA9IGRlY2wuYmluZGluZy5yZW1vdmVTY29wZSh0aGlzLmNvbnRleHQudXNlU2NvcGUsIHRoaXMuY29udGV4dC5waGFzZSk7XG4gICAgICAgIC8vIGVhY2ggY29tcGlsZXRpbWUgdmFsdWUgbmVlZHMgdG8gYmUgZXhwYW5kZWQgd2l0aCBhIGZyZXNoXG4gICAgICAgIC8vIGVudmlyb25tZW50IGFuZCBpbiB0aGUgbmV4dCBoaWdoZXIgcGhhc2VcbiAgICAgICAgbGV0IHN5bnRheEV4cGFuZGVyID0gbmV3IFRlcm1FeHBhbmRlcihfLm1lcmdlKHRoaXMuY29udGV4dCwge1xuICAgICAgICAgIHBoYXNlOiB0aGlzLmNvbnRleHQucGhhc2UgKyAxLFxuICAgICAgICAgIGVudjogbmV3IEVudigpLFxuICAgICAgICAgIHN0b3JlOiB0aGlzLmNvbnRleHQuc3RvcmVcbiAgICAgICAgfSkpO1xuICAgICAgICBsZXQgaW5pdCA9IHN5bnRheEV4cGFuZGVyLmV4cGFuZChkZWNsLmluaXQpO1xuICAgICAgICBsZXQgdmFsID0gZXZhbENvbXBpbGV0aW1lVmFsdWUoaW5pdC5nZW4oKSwgXy5tZXJnZSh0aGlzLmNvbnRleHQsIHtcbiAgICAgICAgICBwaGFzZTogdGhpcy5jb250ZXh0LnBoYXNlICsgMVxuICAgICAgICB9KSk7XG4gICAgICAgIGNvbGxlY3RCaW5kaW5ncyhiaW5kaW5nKS5mb3JFYWNoKHN0eCA9PiB7XG4gICAgICAgICAgbGV0IG5ld0JpbmRpbmcgPSBnZW5zeW0oc3R4LnZhbCgpKTtcbiAgICAgICAgICB0aGlzLmNvbnRleHQuYmluZGluZ3MuYWRkKHN0eCwge1xuICAgICAgICAgICAgYmluZGluZzogbmV3QmluZGluZyxcbiAgICAgICAgICAgIHBoYXNlOiB0aGlzLmNvbnRleHQucGhhc2UsXG4gICAgICAgICAgICBza2lwRHVwOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxldCByZXNvbHZlZE5hbWUgPSBzdHgucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpO1xuICAgICAgICAgIHRoaXMuY29udGV4dC5lbnYuc2V0KHJlc29sdmVkTmFtZSwgbmV3IENvbXBpbGV0aW1lVHJhbnNmb3JtKHZhbCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlY2wuZXh0ZW5kKHsgYmluZGluZywgaW5pdCB9KTtcbiAgICAgIH0pXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==