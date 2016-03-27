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

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _parseReducer = require("./parse-reducer");

var _parseReducer2 = _interopRequireDefault(_parseReducer);

var _shiftCodegen = require("shift-codegen");

var _shiftCodegen2 = _interopRequireDefault(_shiftCodegen);

var _scope = require("./scope");

var _bindingMap = require("./binding-map.js");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _modules = require("./modules");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function expand(source_521) {
  var options_522 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var reader_523 = new _shiftReader2.default(source_521);var stxl_524 = reader_523.read();var scope_525 = (0, _scope.freshScope)("top");var bindings_526 = new _bindingMap2.default();var expander_527 = new _expander2.default({ env: new _env2.default(), store: new _env2.default(), bindings: bindings_526, cwd: options_522.cwd, modules: new _modules.Modules(), currentScope: [scope_525], transform: options_522.transform ? options_522.transform : function (x_529) {
      return { code: x_529 };
    }, moduleResolver: options_522.moduleResolver, moduleLoader: options_522.moduleLoader });var exStxl_528 = expander_527.expand(stxl_524.map(function (s) {
    return s.addScope(scope_525, bindings_526);
  }));return new _terms2.default("Module", { directives: (0, _immutable.List)(), items: exStxl_528 });
}function parse(source_530) {
  var options_531 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return (0, _shiftReducer2.default)(new _parseReducer2.default(), expand(source_530, options_531));
}function compile(source_532) {
  var options_533 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var ast_534 = parse(source_532, options_533);var gen_535 = (0, _shiftCodegen2.default)(ast_534, new _shiftCodegen.FormattedCodeGen());return options_533.transform && !options_533.noBabel ? options_533.transform(gen_535, { presets: ["es2015"] }) : { code: gen_535 };
}
//# sourceMappingURL=sweet.js.map
