"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var registerSyntax = function registerSyntax(stx, context) {
  var newBinding = (0, _symbol.gensym)(stx.val());
  context.env.set(newBinding.toString(), new _transforms.VarBindingTransform(stx));
  context.bindings.add(stx, {
    binding: newBinding,
    phase: 0,
    // skip dup because js allows variable redeclarations
    // (technically only for `var` but we can let later stages of the pipeline
    // handle incorrect redeclarations of `const` and `let`)
    skipDup: true
  });
};

var registerBindings = _.cond([[_terms.isBindingIdentifier, function (_ref, context) {
  var name = _ref.name;

  registerSyntax(name, context);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context) {
  var binding = _ref2.binding;

  registerBindings(binding, context);
}], [_terms.isBindingPropertyProperty, function (_ref3, context) {
  var binding = _ref3.binding;

  registerBindings(binding, context);
}], [_terms.isArrayBinding, function (_ref4, context) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;

  if (restElement != null) {
    registerBindings(restElement, context);
  }
  elements.forEach(function (el) {
    if (el != null) {
      registerBindings(el, context);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context) {
  var properties = _ref5.properties;

  properties.forEach(function (prop) {
    return registerBindings(prop, context);
  });
}], [_.T, function (binding) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding.type);
}]]);

var removeScope = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope) {
  var name = _ref6.name;
  return new _terms2.default('BindingIdentifier', {
    name: name.removeScope(scope)
  });
}], [_terms.isArrayBinding, function (_ref7, context) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;

  return new _terms2.default('ArrayBinding', {
    elements: elements.map(function (el) {
      return el == null ? null : removeScope(el, context);
    }),
    restElement: restElement == null ? null : removeScope(restElement, context)
  });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, context) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default('BindingPropertyIdentifier', {
    binding: removeScope(binding, context),
    init: init
  });
}], [_terms.isBindingPropertyProperty, function (_ref9, context) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default('BindingPropertyProperty', {
    binding: removeScope(binding, context), name: name
  });
}], [_terms.isObjectBinding, function (_ref10) {
  var properties = _ref10.properties;
  return new _terms2.default('ObjectBinding', {
    properties: properties.map(function (prop) {
      return removeScope(prop, context);
    })
  });
}], [_.T, function (binding) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding.type);
}]]);

function findNameInExports(name, exp) {
  var foundNames = exp.reduce(function (acc, e) {
    if (e.declaration) {
      return acc.concat(e.declaration.declarators.reduce(function (acc, decl) {
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
          var mod = self.context.modules.load(term.moduleSpecifier.val(), self.context);
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
