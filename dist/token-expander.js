"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _resolve = require("resolve");

var _resolve2 = _interopRequireDefault(_resolve);

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _ramdaFantasy = require("ramda-fantasy");

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

var _loadSyntax = require("./load-syntax");

var _loadSyntax2 = _interopRequireDefault(_loadSyntax);

var _scope = require("./scope");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Just = _ramdaFantasy.Maybe.Just;
var Nothing = _ramdaFantasy.Maybe.Nothing;

var registerBindings = _.cond([[_terms.isBindingIdentifier, function (_ref, context) {
  var name = _ref.name;

  var newBinding = (0, _symbol.gensym)(name.val());
  context.env.set(newBinding.toString(), new _transforms.VarBindingTransform(name));
  context.bindings.add(name, {
    binding: newBinding,
    phase: 0,
    // skip dup because js allows variable redeclarations
    // (technically only for `var` but we can let later stages of the pipeline
    // handle incorrect redeclarations of `const` and `let`)
    skipDup: true
  });
}], [_.T, function (_) {
  return (0, _errors.assert)(false, "not implemented yet");
}]]);

var removeScope = _.cond([[_terms.isBindingIdentifier, function (_ref2, scope) {
  var name = _ref2.name;
  return new _terms2.default('BindingIdentifier', {
    name: name.removeScope(scope)
  });
}], [_.T, function (_) {
  return (0, _errors.assert)(false, "not implemented yet");
}]]);

function findNameInExports(name, exp) {
  var foundNames = exp.reduce(function (acc, e) {
    if (e.declaration) {
      return acc.concat(e.declaration.declaration.declarators.reduce(function (acc, decl) {
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

function bindImports(impTerm, exModule, context) {
  var names = [];
  impTerm.namedImports.forEach(function (specifier) {
    var name = specifier.binding.name;
    var exportName = findNameInExports(name, exModule.exportEntries);
    if (exportName != null) {
      var newBinding = (0, _symbol.gensym)(name.val());
      context.bindings.addForward(name, exportName, newBinding);
      if (context.store.has(exportName.resolve())) {
        names.push(name);
      }
    }
    // // TODO: better error
    // throw 'imported binding ' + name.val() + ' not found in exports of module' + exModule.moduleSpecifier;
  });
  return (0, _immutable.List)(names);
}

var TokenExpander = function () {
  function TokenExpander(context) {
    _classCallCheck(this, TokenExpander);

    this.context = context;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl) {
      var result = (0, _immutable.List)();
      if (stxl.size === 0) {
        return result;
      }
      var prev = (0, _immutable.List)();
      var enf = new _enforester.Enforester(stxl, prev, this.context);
      var self = this;
      while (!enf.done) {

        var term = _.pipe(_.bind(enf.enforest, enf), _.cond([[_terms.isVariableDeclarationStatement, function (term) {
          // first, remove the use scope from each binding
          term.declaration.declarators = term.declaration.declarators.map(function (decl) {
            return new _terms2.default('VariableDeclarator', {
              binding: removeScope(decl.binding, self.context.useScope),
              init: decl.init
            });
          });

          // syntax id^{a, b} = <init>^{a, b}
          // ->
          // syntaxrec id^{a,b,c} = function() { return <<id^{a}>> }
          // syntaxrec id^{a,b} = <init>^{a,b,c}
          if ((0, _terms.isSyntaxDeclaration)(term.declaration)) {
            (function () {
              // TODO: do stuff
              var scope = (0, _scope.freshScope)('nonrec');
              term.declaration.declarators.forEach(function (decl) {
                var name = decl.binding.name;
                var nameAdded = name.addScope(scope);
                var nameRemoved = name.removeScope(self.context.currentScope[self.context.currentScope.length - 1]);
                var newBinding = (0, _symbol.gensym)(name.val());
                self.context.bindings.addForward(nameAdded, nameRemoved, newBinding);
                decl.init.body = decl.init.body.map(function (s) {
                  return s.addScope(scope, self.context.bindings);
                });
              });
            })();
          }

          // for syntax declarations we need to load the compiletime value
          // into the environment
          if ((0, _terms.isSyntaxDeclaration)(term.declaration) || (0, _terms.isSyntaxrecDeclaration)(term.declaration)) {
            term.declaration.declarators.forEach(function (decl) {
              registerBindings(decl.binding, self.context);
              (0, _loadSyntax2.default)(decl, self.context, self.context.env);
            });
            // do not add syntax declarations to the result
            return Nothing();
          } else {
            // add each binding to the environment
            term.declaration.declarators.forEach(function (decl) {
              return registerBindings(decl.binding, self.context);
            });
          }
          return Just(term);
        }], [_terms.isFunctionWithName, function (term) {
          term.name = removeScope(term.name, self.context.useScope);
          registerBindings(term.name, self.context);
          return Just(term);
        }], [_terms.isImport, function (term) {
          var mod = self.context.modules.load(term.moduleSpecifier, self.context);
          // mutates the store
          mod.visit(self.context);
          var boundNames = bindImports(term, mod, self.context);
          // NOTE: self is a hack for MVP modules
          if (boundNames.size === 0) {
            return Just(term);
          }
          return Nothing();
        }], [_terms.isEOF, Nothing], [_.T, Just]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();

        result = result.concat(term);
      }
      return result;
    }
  }]);

  return TokenExpander;
}();

exports.default = TokenExpander;
//# sourceMappingURL=token-expander.js.map
