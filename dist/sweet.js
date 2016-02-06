"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expand = expand;
exports.parse = parse;
exports.compile = compile;

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _expander = require("./expander");

var _expander2 = _interopRequireDefault(_expander);

var _immutable = require("immutable");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _env = require("./env");

var _env2 = _interopRequireDefault(_env);

var _babelCore = require("babel-core");

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _parseReducer = require("./parse-reducer");

var _parseReducer2 = _interopRequireDefault(_parseReducer);

var _shiftCodegen = require("shift-codegen");

var _shiftCodegen2 = _interopRequireDefault(_shiftCodegen);

var _nodeModuleResolver = require("./node-module-resolver");

var _nodeModuleResolver2 = _interopRequireDefault(_nodeModuleResolver);

var _nodeModuleLoader = require("./node-module-loader");

var _nodeModuleLoader2 = _interopRequireDefault(_nodeModuleLoader);

var _scope = require("./scope");

var _bindingMap = require("./binding-map.js");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _symbol = require("./symbol");

var _modules = require("./modules");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function expand(source) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var reader = new _shiftReader2.default(source);
  var stxl = reader.read();
  var scope = (0, _scope.freshScope)('top');
  var bindings = new _bindingMap2.default();
  var expander = new _expander2.default({
    env: new _env2.default(),
    store: new _env2.default(),
    bindings: bindings,
    cwd: options.cwd,
    modules: new _modules.Modules(),
    currentScope: [scope],
    moduleResolver: options.moduleResolver ? options.moduleResolver : _nodeModuleResolver2.default,
    moduleLoader: options.moduleLoader ? options.moduleLoader : _nodeModuleLoader2.default
  });
  var exStxl = expander.expand(stxl.map(function (s) {
    return s.addScope(scope, bindings);
  }));
  return new _terms2.default("Module", {
    directives: (0, _immutable.List)(),
    items: exStxl
  });
}

function parse(source) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _shiftReducer2.default)(new _parseReducer2.default(), expand(source, options));
}

function compile(source, cwd) {
  var ast = parse(source, {
    cwd: cwd
  });
  var gen = (0, _shiftCodegen2.default)(ast);
  // TODO use AST instead of shipping string to babel
  // need to fix shift to estree converter first
  return (0, _babelCore.transform)(gen);
}
//# sourceMappingURL=sweet.js.map
