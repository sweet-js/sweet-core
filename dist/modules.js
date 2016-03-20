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

var Module_359 = function () {
  function Module_359(moduleSpecifier_361, importEntries_362, exportEntries_363, body_364) {
    _classCallCheck(this, Module_359);

    this.moduleSpecifier = moduleSpecifier_361;this.importEntries = importEntries_362;this.exportEntries = exportEntries_363;this.body = body_364;
  }

  _createClass(Module_359, [{
    key: "visit",
    value: function visit(context_365) {
      this.exportEntries.forEach(function (ex) {
        if ((0, _terms.isSyntaxDeclaration)(ex.declaration) || (0, _terms.isSyntaxrecDeclaration)(ex.declaration)) {
          ex.declaration.declarators.forEach((0, _loadSyntax2.default)(_.__, context_365, context_365.store));
        }
      });return context_365.store;
    }
  }]);

  return Module_359;
}();

var pragmaRegep_360 = /^\s*#\w*/;
var Modules = exports.Modules = function () {
  function Modules() {
    _classCallCheck(this, Modules);

    this.loadedModules = new Map();
  }

  _createClass(Modules, [{
    key: "load",
    value: function load(modulePath_366, context_367) {
      var _this = this;

      var path_368 = context_367.moduleResolver(modulePath_366, context_367.cwd);if (!this.loadedModules.has(path_368)) {
        var modStr = context_367.moduleLoader(path_368);if (!pragmaRegep_360.test(modStr)) {
          this.loadedModules.set(path_368, new Module_359(path_368, (0, _immutable.List)(), (0, _immutable.List)(), (0, _immutable.List)()));
        } else {
          (function () {
            var reader = new _shiftReader2.default(modStr);var stxl = reader.read().slice(3);var tokenExpander = new _tokenExpander2.default(_.merge(context_367, { env: new _env2.default(), store: new _env2.default(), bindings: new _bindingMap2.default() }));var terms = tokenExpander.expand(stxl);var importEntries = [];var exportEntries = [];terms.forEach(function (t) {
              _.cond([[_terms.isImport, function (t) {
                return importEntries.push(t);
              }], [_terms.isExport, function (t) {
                return exportEntries.push(t);
              }]])(t);
            });_this.loadedModules.set(path_368, new Module_359(path_368, (0, _immutable.List)(importEntries), (0, _immutable.List)(exportEntries), terms));
          })();
        }
      }return this.loadedModules.get(path_368);
    }
  }]);

  return Modules;
}();
//# sourceMappingURL=modules.js.map
