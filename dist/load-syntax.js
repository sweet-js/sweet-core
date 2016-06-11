"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeReplacementValues = sanitizeReplacementValues;
exports.evalRuntimeValues = evalRuntimeValues;
exports.evalCompiletimeValue = evalCompiletimeValue;

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _termExpander = require("./term-expander");

var _termExpander2 = _interopRequireDefault(_termExpander);

var _immutable = require("immutable");

var _parseReducer = require("./parse-reducer.js");

var _parseReducer2 = _interopRequireDefault(_parseReducer);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _serializer = require("./serializer");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _shiftCodegen = require("shift-codegen");

var _shiftCodegen2 = _interopRequireDefault(_shiftCodegen);

var _transforms = require("./transforms");

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _macroContext = require("./macro-context");

var _templateProcessor = require("./template-processor");

var _vm = require("vm");

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let geval_335 = eval;
function sanitizeReplacementValues(values_336) {
  if (Array.isArray(values_336)) {
    return sanitizeReplacementValues((0, _immutable.List)(values_336));
  } else if (_immutable.List.isList(values_336)) {
    return values_336.map(sanitizeReplacementValues);
  } else if (values_336 == null) {
    throw new Error("replacement values for syntax template must not be null or undefined");
  } else if (typeof values_336.next === "function") {
    return sanitizeReplacementValues((0, _immutable.List)(values_336));
  }
  return (0, _macroContext.unwrap)(values_336);
}
function evalRuntimeValues(terms_337, context_338) {
  let prepped_339 = terms_337.reduce((acc_345, term_346) => {
    let result_347 = (0, _immutable.List)();
    if ((0, _terms.isExport)(term_346)) {
      if ((0, _terms.isVariableDeclaration)(term_346.declaration)) {
        return acc_345.concat(new _terms2.default("VariableDeclarationStatement", { declaration: term_346.declaration })).concat(term_346.declaration.declarators.map(decl_348 => {
          return new _terms2.default("ExpressionStatement", { expression: new _terms2.default("AssignmentExpression", { binding: new _terms2.default("StaticMemberExpression", { object: new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("exports") }), property: decl_348.binding.name }), expression: new _terms2.default("IdentifierExpression", { name: decl_348.binding.name }) }) });
        }));
      }
    } else if ((0, _terms.isImport)(term_346)) {
      return acc_345;
    }
    return acc_345.concat(term_346);
  }, (0, _immutable.List)());
  let parsed_340 = (0, _shiftReducer2.default)(new _parseReducer2.default(context_338, false), new _terms2.default("Module", { directives: (0, _immutable.List)(), items: prepped_339 }).gen({ includeImports: false }));
  let gen_341 = (0, _shiftCodegen2.default)(parsed_340, new _shiftCodegen.FormattedCodeGen());
  let result_342 = context_338.transform(gen_341, { babelrc: true, filename: context_338.filename });
  let exportsObj_343 = {};
  context_338.store.set("exports", exportsObj_343);
  let val_344 = _vm2.default.runInContext(result_342.code, context_338.store.getNodeContext());
  return exportsObj_343;
}
function evalCompiletimeValue(expr_349, context_350) {
  let deserializer_351 = (0, _serializer.makeDeserializer)(context_350.bindings);
  let sandbox_352 = { syntaxQuote: function syntaxQuote(strings_360) {
      for (var _len = arguments.length, values_359 = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values_359[_key - 1] = arguments[_key];
      }

      let ctx_361 = deserializer_351.read(_.last(values_359));
      let reader_362 = new _shiftReader2.default(strings_360, ctx_361, _.take(values_359.length - 1, values_359));
      return reader_362.read();
    }, syntaxTemplate: function syntaxTemplate(str_364) {
      for (var _len2 = arguments.length, values_363 = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values_363[_key2 - 1] = arguments[_key2];
      }

      return (0, _templateProcessor.replaceTemplate)(deserializer_351.read(str_364), sanitizeReplacementValues(values_363));
    } };
  let sandboxKeys_353 = (0, _immutable.List)(Object.keys(sandbox_352));
  let sandboxVals_354 = sandboxKeys_353.map(k_365 => sandbox_352[k_365]).toArray();
  let parsed_355 = (0, _shiftReducer2.default)(new _parseReducer2.default(context_350), new _terms2.default("Module", { directives: (0, _immutable.List)(), items: _immutable.List.of(new _terms2.default("ExpressionStatement", { expression: new _terms2.default("FunctionExpression", { isGenerator: false, name: null, params: new _terms2.default("FormalParameters", { items: sandboxKeys_353.map(param_366 => {
            return new _terms2.default("BindingIdentifier", { name: _syntax2.default.from("identifier", param_366) });
          }), rest: null }), body: new _terms2.default("FunctionBody", { directives: _immutable.List.of(new _terms2.default("Directive", { rawValue: "use strict" })), statements: _immutable.List.of(new _terms2.default("ReturnStatement", { expression: expr_349 })) }) }) })) }));
  let gen_356 = (0, _shiftCodegen2.default)(parsed_355, new _shiftCodegen.FormattedCodeGen());
  let result_357 = context_350.transform(gen_356, { babelrc: true, filename: context_350.filename });
  let val_358 = _vm2.default.runInContext(result_357.code, context_350.store.getNodeContext());
  return val_358.apply(undefined, sandboxVals_354);
}