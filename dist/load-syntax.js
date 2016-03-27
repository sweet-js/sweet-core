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

var geval_307 = eval;
function sanitizeReplacementValues(values_310) {
  if (Array.isArray(values_310)) {
    return sanitizeReplacementValues((0, _immutable.List)(values_310));
  } else if (_immutable.List.isList(values_310)) {
    return values_310.map(sanitizeReplacementValues);
  } else if (values_310 == null) {
    throw new Error("replacement values for syntax template must not but null or undefined");
  } else if (typeof values_310.next === "function") {
    return sanitizeReplacementValues((0, _immutable.List)(values_310));
  }
  return (0, _macroContext.unwrap)(values_310);
}
function loadForCompiletime_308(expr_311, context_312) {
  var deserializer_313 = (0, _serializer.makeDeserializer)(context_312.bindings);
  var sandbox_314 = { syntaxQuote: function syntaxQuote(strings_321) {
      for (var _len = arguments.length, values_320 = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values_320[_key - 1] = arguments[_key];
      }

      var ctx_322 = deserializer_313.read(_.last(values_320));
      var reader_323 = new _shiftReader2.default(strings_321, ctx_322.context, _.take(values_320.length - 1, values_320));
      return reader_323.read();
    }, syntaxTemplate: function syntaxTemplate(str_325) {
      for (var _len2 = arguments.length, values_324 = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values_324[_key2 - 1] = arguments[_key2];
      }

      return (0, _templateProcessor.replaceTemplate)(deserializer_313.read(str_325), sanitizeReplacementValues(values_324));
    } };
  var sandboxKeys_315 = (0, _immutable.List)(Object.keys(sandbox_314));
  var sandboxVals_316 = sandboxKeys_315.map(function (k_326) {
    return sandbox_314[k_326];
  }).toArray();
  var parsed_317 = (0, _shiftReducer2.default)(new _parseReducer2.default(), new _terms2.default("Module", { directives: (0, _immutable.List)(), items: _immutable.List.of(new _terms2.default("ExpressionStatement", { expression: new _terms2.default("FunctionExpression", { isGenerator: false, name: null, params: new _terms2.default("FormalParameters", { items: sandboxKeys_315.map(function (param_327) {
            return new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier(param_327) });
          }), rest: null }), body: new _terms2.default("FunctionBody", { directives: _immutable.List.of(new _terms2.default("Directive", { rawValue: "use strict" })), statements: _immutable.List.of(new _terms2.default("ReturnStatement", { expression: expr_311 })) }) }) })) }));
  var gen_318 = (0, _shiftCodegen2.default)(parsed_317, new _shiftCodegen.FormattedCodeGen());
  var result_319 = context_312.transform(gen_318);
  return geval_307(result_319.code).apply(undefined, sandboxVals_316);
}
var loadSyntax_309 = _.cond([[_.where({ binding: _terms.isBindingIdentifier }), _.curry(function (_ref, context_328, env_329) {
  var binding = _ref.binding;
  var init = _ref.init;

  var termExpander_330 = new _termExpander2.default(context_328);
  var initValue_331 = loadForCompiletime_308(termExpander_330.expand(init), context_328);
  env_329.set(binding.name.resolve(), new _transforms.CompiletimeTransform(initValue_331));
})], [_.T, function (__332) {
  return assert(false, "not implemented yet");
}]]);
exports.default = loadSyntax_309;
//# sourceMappingURL=data:application/json;base64,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LEVBQTRCLEVBQUMsWUFBWSxRQUFaLEVBQTdCLENBQVIsQ0FBWixFQUFoRyxDQUFOLEVBRjZILENBQVosRUFBakMsQ0FBUixDQUFQLEVBQXhDLENBQTFCLENBQWIsQ0FYaUQ7QUFjckQsTUFBSSxVQUFVLDRCQUFRLFVBQVIsRUFBb0Isb0NBQXBCLENBQVYsQ0FkaUQ7QUFlckQsTUFBSSxhQUFhLFlBQVksU0FBWixDQUFzQixPQUF0QixDQUFiLENBZmlEO0FBZ0JyRCxTQUFPLFVBQVUsV0FBVyxJQUFYLENBQVYsQ0FBMkIsS0FBM0IsQ0FBaUMsU0FBakMsRUFBNEMsZUFBNUMsQ0FBUCxDQWhCcUQ7Q0FBdkQ7QUFrQkEsSUFBTSxpQkFBaUIsRUFBRSxJQUFGLENBQU8sQ0FBQyxDQUFDLEVBQUUsS0FBRixDQUFRLEVBQUMsbUNBQUQsRUFBUixDQUFELEVBQTBDLEVBQUUsS0FBRixDQUFRLGdCQUFrQixXQUFsQixFQUErQixPQUEvQixFQUEyQztNQUF6Qyx1QkFBeUM7TUFBaEMsaUJBQWdDOztBQUMxSCxNQUFJLG1CQUFtQiwyQkFBaUIsV0FBakIsQ0FBbkIsQ0FEc0g7QUFFMUgsTUFBSSxnQkFBZ0IsdUJBQXVCLGlCQUFpQixNQUFqQixDQUF3QixJQUF4QixDQUF2QixFQUFzRCxXQUF0RCxDQUFoQixDQUZzSDtBQUcxSCxVQUFRLEdBQVIsQ0FBWSxRQUFRLElBQVIsQ0FBYSxPQUFiLEVBQVosRUFBb0MscUNBQXlCLGFBQXpCLENBQXBDLEVBSDBIO0NBQTNDLENBQWxELENBQUQsRUFJekIsQ0FBQyxFQUFFLENBQUYsRUFBSztTQUFTLE9BQU8sS0FBUCxFQUFjLHFCQUFkO0NBQVQsQ0FKbUIsQ0FBUCxDQUFqQjtrQkFLUyIsImZpbGUiOiJsb2FkLXN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm1FeHBhbmRlciBmcm9tIFwiLi90ZXJtLWV4cGFuZGVyXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBQYXJzZVJlZHVjZXIgZnJvbSBcIi4vcGFyc2UtcmVkdWNlci5qc1wiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQge21ha2VEZXNlcmlhbGl6ZXJ9IGZyb20gXCIuL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgY29kZWdlbiwge0Zvcm1hdHRlZENvZGVHZW59IGZyb20gXCJzaGlmdC1jb2RlZ2VuXCI7XG5pbXBvcnQge1ZhckJpbmRpbmdUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCB7dW53cmFwfSBmcm9tIFwiLi9tYWNyby1jb250ZXh0XCI7XG5pbXBvcnQge3JlcGxhY2VUZW1wbGF0ZX0gZnJvbSBcIi4vdGVtcGxhdGUtcHJvY2Vzc29yXCI7XG5sZXQgZ2V2YWxfMzA3ID0gZXZhbDtcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHZhbHVlc18zMTApIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVzXzMxMCkpIHtcbiAgICByZXR1cm4gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhMaXN0KHZhbHVlc18zMTApKTtcbiAgfSBlbHNlIGlmIChMaXN0LmlzTGlzdCh2YWx1ZXNfMzEwKSkge1xuICAgIHJldHVybiB2YWx1ZXNfMzEwLm1hcChzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKTtcbiAgfSBlbHNlIGlmICh2YWx1ZXNfMzEwID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXBsYWNlbWVudCB2YWx1ZXMgZm9yIHN5bnRheCB0ZW1wbGF0ZSBtdXN0IG5vdCBidXQgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlc18zMTAubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMoTGlzdCh2YWx1ZXNfMzEwKSk7XG4gIH1cbiAgcmV0dXJuIHVud3JhcCh2YWx1ZXNfMzEwKTtcbn1cbmZ1bmN0aW9uIGxvYWRGb3JDb21waWxldGltZV8zMDgoZXhwcl8zMTEsIGNvbnRleHRfMzEyKSB7XG4gIGxldCBkZXNlcmlhbGl6ZXJfMzEzID0gbWFrZURlc2VyaWFsaXplcihjb250ZXh0XzMxMi5iaW5kaW5ncyk7XG4gIGxldCBzYW5kYm94XzMxNCA9IHtzeW50YXhRdW90ZTogZnVuY3Rpb24gKHN0cmluZ3NfMzIxLCAuLi52YWx1ZXNfMzIwKSB7XG4gICAgbGV0IGN0eF8zMjIgPSBkZXNlcmlhbGl6ZXJfMzEzLnJlYWQoXy5sYXN0KHZhbHVlc18zMjApKTtcbiAgICBsZXQgcmVhZGVyXzMyMyA9IG5ldyBSZWFkZXIoc3RyaW5nc18zMjEsIGN0eF8zMjIuY29udGV4dCwgXy50YWtlKHZhbHVlc18zMjAubGVuZ3RoIC0gMSwgdmFsdWVzXzMyMCkpO1xuICAgIHJldHVybiByZWFkZXJfMzIzLnJlYWQoKTtcbiAgfSwgc3ludGF4VGVtcGxhdGU6IGZ1bmN0aW9uIChzdHJfMzI1LCAuLi52YWx1ZXNfMzI0KSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUZW1wbGF0ZShkZXNlcmlhbGl6ZXJfMzEzLnJlYWQoc3RyXzMyNSksIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXModmFsdWVzXzMyNCkpO1xuICB9fTtcbiAgbGV0IHNhbmRib3hLZXlzXzMxNSA9IExpc3QoT2JqZWN0LmtleXMoc2FuZGJveF8zMTQpKTtcbiAgbGV0IHNhbmRib3hWYWxzXzMxNiA9IHNhbmRib3hLZXlzXzMxNS5tYXAoa18zMjYgPT4gc2FuZGJveF8zMTRba18zMjZdKS50b0FycmF5KCk7XG4gIGxldCBwYXJzZWRfMzE3ID0gcmVkdWNlcihuZXcgUGFyc2VSZWR1Y2VyLCBuZXcgVGVybShcIk1vZHVsZVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBpdGVtczogTGlzdC5vZihuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IG5ldyBUZXJtKFwiRnVuY3Rpb25FeHByZXNzaW9uXCIsIHtpc0dlbmVyYXRvcjogZmFsc2UsIG5hbWU6IG51bGwsIHBhcmFtczogbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogc2FuZGJveEtleXNfMzE1Lm1hcChwYXJhbV8zMjcgPT4ge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIocGFyYW1fMzI3KX0pO1xuICB9KSwgcmVzdDogbnVsbH0pLCBib2R5OiBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdC5vZihuZXcgVGVybShcIkRpcmVjdGl2ZVwiLCB7cmF3VmFsdWU6IFwidXNlIHN0cmljdFwifSkpLCBzdGF0ZW1lbnRzOiBMaXN0Lm9mKG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBleHByXzMxMX0pKX0pfSl9KSl9KSk7XG4gIGxldCBnZW5fMzE4ID0gY29kZWdlbihwYXJzZWRfMzE3LCBuZXcgRm9ybWF0dGVkQ29kZUdlbik7XG4gIGxldCByZXN1bHRfMzE5ID0gY29udGV4dF8zMTIudHJhbnNmb3JtKGdlbl8zMTgpO1xuICByZXR1cm4gZ2V2YWxfMzA3KHJlc3VsdF8zMTkuY29kZSkuYXBwbHkodW5kZWZpbmVkLCBzYW5kYm94VmFsc18zMTYpO1xufVxuY29uc3QgbG9hZFN5bnRheF8zMDkgPSBfLmNvbmQoW1tfLndoZXJlKHtiaW5kaW5nOiBpc0JpbmRpbmdJZGVudGlmaWVyfSksIF8uY3VycnkoKHtiaW5kaW5nLCBpbml0fSwgY29udGV4dF8zMjgsIGVudl8zMjkpID0+IHtcbiAgbGV0IHRlcm1FeHBhbmRlcl8zMzAgPSBuZXcgVGVybUV4cGFuZGVyKGNvbnRleHRfMzI4KTtcbiAgbGV0IGluaXRWYWx1ZV8zMzEgPSBsb2FkRm9yQ29tcGlsZXRpbWVfMzA4KHRlcm1FeHBhbmRlcl8zMzAuZXhwYW5kKGluaXQpLCBjb250ZXh0XzMyOCk7XG4gIGVudl8zMjkuc2V0KGJpbmRpbmcubmFtZS5yZXNvbHZlKCksIG5ldyBDb21waWxldGltZVRyYW5zZm9ybShpbml0VmFsdWVfMzMxKSk7XG59KV0sIFtfLlQsIF9fMzMyID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0XCIpXV0pO1xuZXhwb3J0IGRlZmF1bHQgbG9hZFN5bnRheF8zMDk7XG4iXX0=