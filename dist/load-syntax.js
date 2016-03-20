"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeReplacementValues = sanitizeReplacementValues;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var geval_291 = eval;function sanitizeReplacementValues(values_294) {
  if (Array.isArray(values_294)) {
    return sanitizeReplacementValues((0, _immutable.List)(values_294));
  } else if (_immutable.List.isList(values_294)) {
    return values_294.map(sanitizeReplacementValues);
  } else if (values_294 == null) {
    throw new Error("replacement values for syntax template must not but null or undefined");
  } else if (typeof values_294.next === "function") {
    return sanitizeReplacementValues((0, _immutable.List)(values_294));
  }return (0, _macroContext.unwrap)(values_294);
}function loadForCompiletime_292(expr_295, context_296) {
  var deserializer_297 = (0, _serializer.makeDeserializer)(context_296.bindings);var sandbox_298 = { syntaxQuote: function syntaxQuote(strings_305) {
      for (var _len = arguments.length, values_304 = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values_304[_key - 1] = arguments[_key];
      }

      var ctx_306 = deserializer_297.read(_.last(values_304));var reader_307 = new _shiftReader2.default(strings_305, ctx_306.context, _.take(values_304.length - 1, values_304));return reader_307.read();
    }, syntaxTemplate: function syntaxTemplate(str_309) {
      for (var _len2 = arguments.length, values_308 = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values_308[_key2 - 1] = arguments[_key2];
      }

      return (0, _templateProcessor.replaceTemplate)(deserializer_297.read(str_309), sanitizeReplacementValues(values_308));
    } };var sandboxKeys_299 = (0, _immutable.List)(Object.keys(sandbox_298));var sandboxVals_300 = sandboxKeys_299.map(function (k) {
    return sandbox_298[k];
  }).toArray();var parsed_301 = (0, _shiftReducer2.default)(new _parseReducer2.default(), new _terms2.default("Module", { directives: (0, _immutable.List)(), items: _immutable.List.of(new _terms2.default("ExpressionStatement", { expression: new _terms2.default("FunctionExpression", { isGenerator: false, name: null, params: new _terms2.default("FormalParameters", { items: sandboxKeys_299.map(function (param) {
            return new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier(param) });
          }), rest: null }), body: new _terms2.default("FunctionBody", { directives: _immutable.List.of(new _terms2.default("Directive", { rawValue: "use strict" })), statements: _immutable.List.of(new _terms2.default("ReturnStatement", { expression: expr_295 })) }) }) })) }));var gen_302 = (0, _shiftCodegen2.default)(parsed_301, new _shiftCodegen.FormattedCodeGen());var result_303 = context_296.transform(gen_302);return geval_291(result_303.code).apply(undefined, sandboxVals_300);
}var loadSyntax_293 = _.cond([[_.where({ binding: _terms.isBindingIdentifier }), _.curry(function (_ref, context, env) {
  var binding = _ref.binding;
  var init = _ref.init;
  var termExpander_310 = new _termExpander2.default(context);var initValue_311 = loadForCompiletime_292(termExpander_310.expand(init), context);env.set(binding.name.resolve(), new _transforms.CompiletimeTransform(initValue_311));
})], [_.T, function (_) {
  return assert(false, "not implemented yet");
}]]);exports.default = loadSyntax_293;
//# sourceMappingURL=load-syntax.js.map
