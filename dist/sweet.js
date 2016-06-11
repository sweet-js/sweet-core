"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expand = expand;
exports.parse = parse;
exports.compile = compile;

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

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

function expand(source_731) {
  let options_732 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  let bindings_733 = new _bindingMap2.default();
  let modules_734 = new _modules.Modules({ cwd: options_732.cwd, filename: options_732.filename, transform: options_732.transform ? options_732.transform : function (x_737) {
      return { code: x_737 };
    }, moduleResolver: options_732.moduleResolver, moduleLoader: options_732.moduleLoader, bindings: bindings_733 });
  let compiledMod_735 = modules_734.compileEntrypoint(source_731, options_732.filename, options_732.enforcePragma);
  let nativeImports_736 = compiledMod_735.importEntries.filter(imp_738 => !modules_734.has(imp_738.moduleSpecifier.val()));
  return new _terms2.default("Module", { directives: (0, _immutable.List)(), items: nativeImports_736.concat(compiledMod_735.body).concat(compiledMod_735.exportEntries.interpose(new _terms2.default("EmptyStatement", {}))) });
}
function parse(source_739, options_740) {
  let includeImports_741 = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  return (0, _shiftReducer2.default)(new _parseReducer2.default({ phase: 0 }), expand(source_739, options_740).gen({ includeImports: includeImports_741 }));
}
function compile(source_742) {
  let options_743 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  let ast_744 = parse(source_742, options_743, options_743.includeImports);
  let gen_745 = (0, _shiftCodegen2.default)(ast_744, new _shiftCodegen.FormattedCodeGen());
  return options_743.transform && !options_743.noBabel ? options_743.transform(gen_745, { babelrc: true, filename: options_743.filename }) : { code: gen_745 };
}