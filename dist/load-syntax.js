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
    throw new Error("replacement values for syntax template must not be null or undefined");
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
  var result_319 = context_312.transform(gen_318, { babelrc: true, filename: context_312.filename });
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
//# sourceMappingURL=data:application/json;base64,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LEVBQTRCLEVBQUMsWUFBWSxRQUFaLEVBQTdCLENBQVIsQ0FBWixFQUFoRyxDQUFOLEVBRjZILENBQVosRUFBakMsQ0FBUixDQUFQLEVBQXhDLENBQTFCLENBQWIsQ0FYaUQ7QUFjckQsTUFBSSxVQUFVLDRCQUFRLFVBQVIsRUFBb0Isb0NBQXBCLENBQVYsQ0FkaUQ7QUFlckQsTUFBSSxhQUFhLFlBQVksU0FBWixDQUFzQixPQUF0QixFQUErQixFQUFDLFNBQVMsSUFBVCxFQUFlLFVBQVUsWUFBWSxRQUFaLEVBQXpELENBQWIsQ0FmaUQ7QUFnQnJELFNBQU8sVUFBVSxXQUFXLElBQVgsQ0FBVixDQUEyQixLQUEzQixDQUFpQyxTQUFqQyxFQUE0QyxlQUE1QyxDQUFQLENBaEJxRDtDQUF2RDtBQWtCQSxJQUFNLGlCQUFpQixFQUFFLElBQUYsQ0FBTyxDQUFDLENBQUMsRUFBRSxLQUFGLENBQVEsRUFBQyxtQ0FBRCxFQUFSLENBQUQsRUFBMEMsRUFBRSxLQUFGLENBQVEsZ0JBQWtCLFdBQWxCLEVBQStCLE9BQS9CLEVBQTJDO01BQXpDLHVCQUF5QztNQUFoQyxpQkFBZ0M7O0FBQzFILE1BQUksbUJBQW1CLDJCQUFpQixXQUFqQixDQUFuQixDQURzSDtBQUUxSCxNQUFJLGdCQUFnQix1QkFBdUIsaUJBQWlCLE1BQWpCLENBQXdCLElBQXhCLENBQXZCLEVBQXNELFdBQXRELENBQWhCLENBRnNIO0FBRzFILFVBQVEsR0FBUixDQUFZLFFBQVEsSUFBUixDQUFhLE9BQWIsRUFBWixFQUFvQyxxQ0FBeUIsYUFBekIsQ0FBcEMsRUFIMEg7Q0FBM0MsQ0FBbEQsQ0FBRCxFQUl6QixDQUFDLEVBQUUsQ0FBRixFQUFLO1NBQVMsT0FBTyxLQUFQLEVBQWMscUJBQWQ7Q0FBVCxDQUptQixDQUFQLENBQWpCO2tCQUtTIiwiZmlsZSI6ImxvYWQtc3ludGF4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgVGVybUV4cGFuZGVyIGZyb20gXCIuL3Rlcm0tZXhwYW5kZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFBhcnNlUmVkdWNlciBmcm9tIFwiLi9wYXJzZS1yZWR1Y2VyLmpzXCI7XG5pbXBvcnQgcmVkdWNlciwge01vbm9pZGFsUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCB7bWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBjb2RlZ2VuLCB7Rm9ybWF0dGVkQ29kZUdlbn0gZnJvbSBcInNoaWZ0LWNvZGVnZW5cIjtcbmltcG9ydCB7VmFyQmluZGluZ1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCBUZXJtLCB7aXNFT0YsIGlzQmluZGluZ0lkZW50aWZpZXIsIGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24sIGlzRnVuY3Rpb25UZXJtLCBpc0Z1bmN0aW9uV2l0aE5hbWUsIGlzU3ludGF4RGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBpc0ltcG9ydCwgaXNFeHBvcnR9IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQgUmVhZGVyIGZyb20gXCIuL3NoaWZ0LXJlYWRlclwiO1xuaW1wb3J0IHt1bndyYXB9IGZyb20gXCIuL21hY3JvLWNvbnRleHRcIjtcbmltcG9ydCB7cmVwbGFjZVRlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3JcIjtcbmxldCBnZXZhbF8zMDcgPSBldmFsO1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXModmFsdWVzXzMxMCkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZXNfMzEwKSkge1xuICAgIHJldHVybiBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKExpc3QodmFsdWVzXzMxMCkpO1xuICB9IGVsc2UgaWYgKExpc3QuaXNMaXN0KHZhbHVlc18zMTApKSB7XG4gICAgcmV0dXJuIHZhbHVlc18zMTAubWFwKHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMpO1xuICB9IGVsc2UgaWYgKHZhbHVlc18zMTAgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInJlcGxhY2VtZW50IHZhbHVlcyBmb3Igc3ludGF4IHRlbXBsYXRlIG11c3Qgbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZXNfMzEwLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKExpc3QodmFsdWVzXzMxMCkpO1xuICB9XG4gIHJldHVybiB1bndyYXAodmFsdWVzXzMxMCk7XG59XG5mdW5jdGlvbiBsb2FkRm9yQ29tcGlsZXRpbWVfMzA4KGV4cHJfMzExLCBjb250ZXh0XzMxMikge1xuICBsZXQgZGVzZXJpYWxpemVyXzMxMyA9IG1ha2VEZXNlcmlhbGl6ZXIoY29udGV4dF8zMTIuYmluZGluZ3MpO1xuICBsZXQgc2FuZGJveF8zMTQgPSB7c3ludGF4UXVvdGU6IGZ1bmN0aW9uIChzdHJpbmdzXzMyMSwgLi4udmFsdWVzXzMyMCkge1xuICAgIGxldCBjdHhfMzIyID0gZGVzZXJpYWxpemVyXzMxMy5yZWFkKF8ubGFzdCh2YWx1ZXNfMzIwKSk7XG4gICAgbGV0IHJlYWRlcl8zMjMgPSBuZXcgUmVhZGVyKHN0cmluZ3NfMzIxLCBjdHhfMzIyLmNvbnRleHQsIF8udGFrZSh2YWx1ZXNfMzIwLmxlbmd0aCAtIDEsIHZhbHVlc18zMjApKTtcbiAgICByZXR1cm4gcmVhZGVyXzMyMy5yZWFkKCk7XG4gIH0sIHN5bnRheFRlbXBsYXRlOiBmdW5jdGlvbiAoc3RyXzMyNSwgLi4udmFsdWVzXzMyNCkge1xuICAgIHJldHVybiByZXBsYWNlVGVtcGxhdGUoZGVzZXJpYWxpemVyXzMxMy5yZWFkKHN0cl8zMjUpLCBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHZhbHVlc18zMjQpKTtcbiAgfX07XG4gIGxldCBzYW5kYm94S2V5c18zMTUgPSBMaXN0KE9iamVjdC5rZXlzKHNhbmRib3hfMzE0KSk7XG4gIGxldCBzYW5kYm94VmFsc18zMTYgPSBzYW5kYm94S2V5c18zMTUubWFwKGtfMzI2ID0+IHNhbmRib3hfMzE0W2tfMzI2XSkudG9BcnJheSgpO1xuICBsZXQgcGFyc2VkXzMxNyA9IHJlZHVjZXIobmV3IFBhcnNlUmVkdWNlciwgbmV3IFRlcm0oXCJNb2R1bGVcIiwge2RpcmVjdGl2ZXM6IExpc3QoKSwgaXRlbXM6IExpc3Qub2YobmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7aXNHZW5lcmF0b3I6IGZhbHNlLCBuYW1lOiBudWxsLCBwYXJhbXM6IG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IHNhbmRib3hLZXlzXzMxNS5tYXAocGFyYW1fMzI3ID0+IHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKHBhcmFtXzMyNyl9KTtcbiAgfSksIHJlc3Q6IG51bGx9KSwgYm9keTogbmV3IFRlcm0oXCJGdW5jdGlvbkJvZHlcIiwge2RpcmVjdGl2ZXM6IExpc3Qub2YobmV3IFRlcm0oXCJEaXJlY3RpdmVcIiwge3Jhd1ZhbHVlOiBcInVzZSBzdHJpY3RcIn0pKSwgc3RhdGVtZW50czogTGlzdC5vZihuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcl8zMTF9KSl9KX0pfSkpfSkpO1xuICBsZXQgZ2VuXzMxOCA9IGNvZGVnZW4ocGFyc2VkXzMxNywgbmV3IEZvcm1hdHRlZENvZGVHZW4pO1xuICBsZXQgcmVzdWx0XzMxOSA9IGNvbnRleHRfMzEyLnRyYW5zZm9ybShnZW5fMzE4LCB7YmFiZWxyYzogdHJ1ZSwgZmlsZW5hbWU6IGNvbnRleHRfMzEyLmZpbGVuYW1lfSk7XG4gIHJldHVybiBnZXZhbF8zMDcocmVzdWx0XzMxOS5jb2RlKS5hcHBseSh1bmRlZmluZWQsIHNhbmRib3hWYWxzXzMxNik7XG59XG5jb25zdCBsb2FkU3ludGF4XzMwOSA9IF8uY29uZChbW18ud2hlcmUoe2JpbmRpbmc6IGlzQmluZGluZ0lkZW50aWZpZXJ9KSwgXy5jdXJyeSgoe2JpbmRpbmcsIGluaXR9LCBjb250ZXh0XzMyOCwgZW52XzMyOSkgPT4ge1xuICBsZXQgdGVybUV4cGFuZGVyXzMzMCA9IG5ldyBUZXJtRXhwYW5kZXIoY29udGV4dF8zMjgpO1xuICBsZXQgaW5pdFZhbHVlXzMzMSA9IGxvYWRGb3JDb21waWxldGltZV8zMDgodGVybUV4cGFuZGVyXzMzMC5leHBhbmQoaW5pdCksIGNvbnRleHRfMzI4KTtcbiAgZW52XzMyOS5zZXQoYmluZGluZy5uYW1lLnJlc29sdmUoKSwgbmV3IENvbXBpbGV0aW1lVHJhbnNmb3JtKGluaXRWYWx1ZV8zMzEpKTtcbn0pXSwgW18uVCwgX18zMzIgPT4gYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIildXSk7XG5leHBvcnQgZGVmYXVsdCBsb2FkU3ludGF4XzMwOTtcbiJdfQ==