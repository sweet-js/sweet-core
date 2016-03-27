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

var geval_291 = eval;
function sanitizeReplacementValues(values_294) {
  if (Array.isArray(values_294)) {
    return sanitizeReplacementValues((0, _immutable.List)(values_294));
  } else if (_immutable.List.isList(values_294)) {
    return values_294.map(sanitizeReplacementValues);
  } else if (values_294 == null) {
    throw new Error("replacement values for syntax template must not but null or undefined");
  } else if (typeof values_294.next === "function") {
    return sanitizeReplacementValues((0, _immutable.List)(values_294));
  }
  return (0, _macroContext.unwrap)(values_294);
}
function loadForCompiletime_292(expr_295, context_296) {
  var deserializer_297 = (0, _serializer.makeDeserializer)(context_296.bindings);
  var sandbox_298 = { syntaxQuote: function syntaxQuote(strings_305) {
      for (var _len = arguments.length, values_304 = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values_304[_key - 1] = arguments[_key];
      }

      var ctx_306 = deserializer_297.read(_.last(values_304));
      var reader_307 = new _shiftReader2.default(strings_305, ctx_306.context, _.take(values_304.length - 1, values_304));
      return reader_307.read();
    }, syntaxTemplate: function syntaxTemplate(str_309) {
      for (var _len2 = arguments.length, values_308 = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values_308[_key2 - 1] = arguments[_key2];
      }

      return (0, _templateProcessor.replaceTemplate)(deserializer_297.read(str_309), sanitizeReplacementValues(values_308));
    } };
  var sandboxKeys_299 = (0, _immutable.List)(Object.keys(sandbox_298));
  var sandboxVals_300 = sandboxKeys_299.map(function (k) {
    return sandbox_298[k];
  }).toArray();
  var parsed_301 = (0, _shiftReducer2.default)(new _parseReducer2.default(), new _terms2.default("Module", { directives: (0, _immutable.List)(), items: _immutable.List.of(new _terms2.default("ExpressionStatement", { expression: new _terms2.default("FunctionExpression", { isGenerator: false, name: null, params: new _terms2.default("FormalParameters", { items: sandboxKeys_299.map(function (param) {
            return new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier(param) });
          }), rest: null }), body: new _terms2.default("FunctionBody", { directives: _immutable.List.of(new _terms2.default("Directive", { rawValue: "use strict" })), statements: _immutable.List.of(new _terms2.default("ReturnStatement", { expression: expr_295 })) }) }) })) }));
  var gen_302 = (0, _shiftCodegen2.default)(parsed_301, new _shiftCodegen.FormattedCodeGen());
  var result_303 = context_296.transform(gen_302);
  return geval_291(result_303.code).apply(undefined, sandboxVals_300);
}
var loadSyntax_293 = _.cond([[_.where({ binding: _terms.isBindingIdentifier }), _.curry(function (_ref, context, env) {
  var binding = _ref.binding;
  var init = _ref.init;

  var termExpander_310 = new _termExpander2.default(context);
  var initValue_311 = loadForCompiletime_292(termExpander_310.expand(init), context);
  env.set(binding.name.resolve(), new _transforms.CompiletimeTransform(initValue_311));
})], [_.T, function (_) {
  return assert(false, "not implemented yet");
}]]);
exports.default = loadSyntax_293;
//# sourceMappingURL=data:application/json;base64,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LEVBQTRCLEVBQUMsWUFBWSxRQUFaLEVBQTdCLENBQVIsQ0FBWixFQUFoRyxDQUFOLEVBRjZILENBQVosRUFBakMsQ0FBUixDQUFQLEVBQXhDLENBQTFCLENBQWIsQ0FYaUQ7QUFjckQsTUFBSSxVQUFVLDRCQUFRLFVBQVIsRUFBb0Isb0NBQXBCLENBQVYsQ0FkaUQ7QUFlckQsTUFBSSxhQUFhLFlBQVksU0FBWixDQUFzQixPQUF0QixDQUFiLENBZmlEO0FBZ0JyRCxTQUFPLFVBQVUsV0FBVyxJQUFYLENBQVYsQ0FBMkIsS0FBM0IsQ0FBaUMsU0FBakMsRUFBNEMsZUFBNUMsQ0FBUCxDQWhCcUQ7Q0FBdkQ7QUFrQkEsSUFBTSxpQkFBaUIsRUFBRSxJQUFGLENBQU8sQ0FBQyxDQUFDLEVBQUUsS0FBRixDQUFRLEVBQUMsbUNBQUQsRUFBUixDQUFELEVBQTBDLEVBQUUsS0FBRixDQUFRLGdCQUFrQixPQUFsQixFQUEyQixHQUEzQixFQUFtQztNQUFqQyx1QkFBaUM7TUFBeEIsaUJBQXdCOztBQUNsSCxNQUFJLG1CQUFtQiwyQkFBaUIsT0FBakIsQ0FBbkIsQ0FEOEc7QUFFbEgsTUFBSSxnQkFBZ0IsdUJBQXVCLGlCQUFpQixNQUFqQixDQUF3QixJQUF4QixDQUF2QixFQUFzRCxPQUF0RCxDQUFoQixDQUY4RztBQUdsSCxNQUFJLEdBQUosQ0FBUSxRQUFRLElBQVIsQ0FBYSxPQUFiLEVBQVIsRUFBZ0MscUNBQXlCLGFBQXpCLENBQWhDLEVBSGtIO0NBQW5DLENBQWxELENBQUQsRUFJekIsQ0FBQyxFQUFFLENBQUYsRUFBSztTQUFLLE9BQU8sS0FBUCxFQUFjLHFCQUFkO0NBQUwsQ0FKbUIsQ0FBUCxDQUFqQjtrQkFLUyIsImZpbGUiOiJsb2FkLXN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm1FeHBhbmRlciBmcm9tIFwiLi90ZXJtLWV4cGFuZGVyXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBQYXJzZVJlZHVjZXIgZnJvbSBcIi4vcGFyc2UtcmVkdWNlci5qc1wiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQge21ha2VEZXNlcmlhbGl6ZXJ9IGZyb20gXCIuL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgY29kZWdlbiwge0Zvcm1hdHRlZENvZGVHZW59IGZyb20gXCJzaGlmdC1jb2RlZ2VuXCI7XG5pbXBvcnQge1ZhckJpbmRpbmdUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCB7dW53cmFwfSBmcm9tIFwiLi9tYWNyby1jb250ZXh0XCI7XG5pbXBvcnQge3JlcGxhY2VUZW1wbGF0ZX0gZnJvbSBcIi4vdGVtcGxhdGUtcHJvY2Vzc29yXCI7XG5sZXQgZ2V2YWxfMjkxID0gZXZhbDtcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHZhbHVlc18yOTQpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVzXzI5NCkpIHtcbiAgICByZXR1cm4gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhMaXN0KHZhbHVlc18yOTQpKTtcbiAgfSBlbHNlIGlmIChMaXN0LmlzTGlzdCh2YWx1ZXNfMjk0KSkge1xuICAgIHJldHVybiB2YWx1ZXNfMjk0Lm1hcChzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKTtcbiAgfSBlbHNlIGlmICh2YWx1ZXNfMjk0ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXBsYWNlbWVudCB2YWx1ZXMgZm9yIHN5bnRheCB0ZW1wbGF0ZSBtdXN0IG5vdCBidXQgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlc18yOTQubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMoTGlzdCh2YWx1ZXNfMjk0KSk7XG4gIH1cbiAgcmV0dXJuIHVud3JhcCh2YWx1ZXNfMjk0KTtcbn1cbmZ1bmN0aW9uIGxvYWRGb3JDb21waWxldGltZV8yOTIoZXhwcl8yOTUsIGNvbnRleHRfMjk2KSB7XG4gIGxldCBkZXNlcmlhbGl6ZXJfMjk3ID0gbWFrZURlc2VyaWFsaXplcihjb250ZXh0XzI5Ni5iaW5kaW5ncyk7XG4gIGxldCBzYW5kYm94XzI5OCA9IHtzeW50YXhRdW90ZTogZnVuY3Rpb24gKHN0cmluZ3NfMzA1LCAuLi52YWx1ZXNfMzA0KSB7XG4gICAgbGV0IGN0eF8zMDYgPSBkZXNlcmlhbGl6ZXJfMjk3LnJlYWQoXy5sYXN0KHZhbHVlc18zMDQpKTtcbiAgICBsZXQgcmVhZGVyXzMwNyA9IG5ldyBSZWFkZXIoc3RyaW5nc18zMDUsIGN0eF8zMDYuY29udGV4dCwgXy50YWtlKHZhbHVlc18zMDQubGVuZ3RoIC0gMSwgdmFsdWVzXzMwNCkpO1xuICAgIHJldHVybiByZWFkZXJfMzA3LnJlYWQoKTtcbiAgfSwgc3ludGF4VGVtcGxhdGU6IGZ1bmN0aW9uIChzdHJfMzA5LCAuLi52YWx1ZXNfMzA4KSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUZW1wbGF0ZShkZXNlcmlhbGl6ZXJfMjk3LnJlYWQoc3RyXzMwOSksIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXModmFsdWVzXzMwOCkpO1xuICB9fTtcbiAgbGV0IHNhbmRib3hLZXlzXzI5OSA9IExpc3QoT2JqZWN0LmtleXMoc2FuZGJveF8yOTgpKTtcbiAgbGV0IHNhbmRib3hWYWxzXzMwMCA9IHNhbmRib3hLZXlzXzI5OS5tYXAoayA9PiBzYW5kYm94XzI5OFtrXSkudG9BcnJheSgpO1xuICBsZXQgcGFyc2VkXzMwMSA9IHJlZHVjZXIobmV3IFBhcnNlUmVkdWNlciwgbmV3IFRlcm0oXCJNb2R1bGVcIiwge2RpcmVjdGl2ZXM6IExpc3QoKSwgaXRlbXM6IExpc3Qub2YobmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7aXNHZW5lcmF0b3I6IGZhbHNlLCBuYW1lOiBudWxsLCBwYXJhbXM6IG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IHNhbmRib3hLZXlzXzI5OS5tYXAocGFyYW0gPT4ge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIocGFyYW0pfSk7XG4gIH0pLCByZXN0OiBudWxsfSksIGJvZHk6IG5ldyBUZXJtKFwiRnVuY3Rpb25Cb2R5XCIsIHtkaXJlY3RpdmVzOiBMaXN0Lm9mKG5ldyBUZXJtKFwiRGlyZWN0aXZlXCIsIHtyYXdWYWx1ZTogXCJ1c2Ugc3RyaWN0XCJ9KSksIHN0YXRlbWVudHM6IExpc3Qub2YobmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJfMjk1fSkpfSl9KX0pKX0pKTtcbiAgbGV0IGdlbl8zMDIgPSBjb2RlZ2VuKHBhcnNlZF8zMDEsIG5ldyBGb3JtYXR0ZWRDb2RlR2VuKTtcbiAgbGV0IHJlc3VsdF8zMDMgPSBjb250ZXh0XzI5Ni50cmFuc2Zvcm0oZ2VuXzMwMik7XG4gIHJldHVybiBnZXZhbF8yOTEocmVzdWx0XzMwMy5jb2RlKS5hcHBseSh1bmRlZmluZWQsIHNhbmRib3hWYWxzXzMwMCk7XG59XG5jb25zdCBsb2FkU3ludGF4XzI5MyA9IF8uY29uZChbW18ud2hlcmUoe2JpbmRpbmc6IGlzQmluZGluZ0lkZW50aWZpZXJ9KSwgXy5jdXJyeSgoe2JpbmRpbmcsIGluaXR9LCBjb250ZXh0LCBlbnYpID0+IHtcbiAgbGV0IHRlcm1FeHBhbmRlcl8zMTAgPSBuZXcgVGVybUV4cGFuZGVyKGNvbnRleHQpO1xuICBsZXQgaW5pdFZhbHVlXzMxMSA9IGxvYWRGb3JDb21waWxldGltZV8yOTIodGVybUV4cGFuZGVyXzMxMC5leHBhbmQoaW5pdCksIGNvbnRleHQpO1xuICBlbnYuc2V0KGJpbmRpbmcubmFtZS5yZXNvbHZlKCksIG5ldyBDb21waWxldGltZVRyYW5zZm9ybShpbml0VmFsdWVfMzExKSk7XG59KV0sIFtfLlQsIF8gPT4gYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIildXSk7XG5leHBvcnQgZGVmYXVsdCBsb2FkU3ludGF4XzI5MztcbiJdfQ==