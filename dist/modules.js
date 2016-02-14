"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modules = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _env = require("./env");

var _env2 = _interopRequireDefault(_env);

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _tokenExpander = require("./token-expander.js");

var _tokenExpander2 = _interopRequireDefault(_tokenExpander);

var _bindingMap = require("./binding-map.js");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _loadSyntax = require("./load-syntax");

var _loadSyntax2 = _interopRequireDefault(_loadSyntax);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = function () {
  function Module(moduleSpecifier, importEntries, exportEntries, body) {
    _classCallCheck(this, Module);

    this.moduleSpecifier = moduleSpecifier;
    this.importEntries = importEntries;
    this.exportEntries = exportEntries;
    this.body = body;
  }

  // put all compiltime transforms in the returned store


  _createClass(Module, [{
    key: "visit",
    value: function visit(context) {

      this.exportEntries.forEach(function (ex) {
        if ((0, _terms.isSyntaxDeclaration)(ex.declaration) || (0, _terms.isSyntaxrecDeclaration)(ex.declaration)) {
          ex.declaration.declarators.forEach((0, _loadSyntax2.default)(_.__, context, context.store));
        }
      });

      return context.store;
    }
  }]);

  return Module;
}();

var Modules = exports.Modules = function () {
  function Modules() {
    _classCallCheck(this, Modules);

    this.loadedModules = new Map();
  }

  // ... -> { body: [Term], importEntries: [Import], exportEntries: [Export] }


  _createClass(Modules, [{
    key: "load",
    value: function load(modulePath, context) {
      var _this = this;

      var path = context.moduleResolver(modulePath, context.cwd);
      if (!this.loadedModules.has(path)) {
        (function () {
          var modStr = context.moduleLoader(path);
          var reader = new _shiftReader2.default(modStr);
          var stxl = reader.read();
          var tokenExpander = new _tokenExpander2.default(_.merge(context, {
            // expand with a fresh environment
            env: new _env2.default(),
            store: new _env2.default(),
            bindings: new _bindingMap2.default()
          }));
          var terms = tokenExpander.expand(stxl);
          var importEntries = [];
          var exportEntries = [];
          terms.forEach(function (t) {
            _.cond([[_terms.isImport, function (t) {
              return importEntries.push(t);
            }], [_terms.isExport, function (t) {
              return exportEntries.push(t);
            }]])(t);
          });
          _this.loadedModules.set(path, new Module(path, (0, _immutable.List)(importEntries), (0, _immutable.List)(exportEntries), terms));
        })();
      }
      return this.loadedModules.get(path);
    }
  }]);

  return Modules;
}();
//# sourceMappingURL=modules.js.map
