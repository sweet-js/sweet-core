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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2xvYWQtc3ludGF4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBY2dCOztBQWRoQjs7SUFBYTs7QUFDYjs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFDQSxJQUFJLFlBQVksSUFBWjtBQUNHLFNBQVMseUJBQVQsQ0FBbUMsVUFBbkMsRUFBK0M7QUFDcEQsTUFBSSxNQUFNLE9BQU4sQ0FBYyxVQUFkLENBQUosRUFBK0I7QUFDN0IsV0FBTywwQkFBMEIscUJBQUssVUFBTCxDQUExQixDQUFQLENBRDZCO0dBQS9CLE1BRU8sSUFBSSxnQkFBSyxNQUFMLENBQVksVUFBWixDQUFKLEVBQTZCO0FBQ2xDLFdBQU8sV0FBVyxHQUFYLENBQWUseUJBQWYsQ0FBUCxDQURrQztHQUE3QixNQUVBLElBQUksY0FBYyxJQUFkLEVBQW9CO0FBQzdCLFVBQU0sSUFBSSxLQUFKLENBQVUsc0VBQVYsQ0FBTixDQUQ2QjtHQUF4QixNQUVBLElBQUksT0FBTyxXQUFXLElBQVgsS0FBb0IsVUFBM0IsRUFBdUM7QUFDaEQsV0FBTywwQkFBMEIscUJBQUssVUFBTCxDQUExQixDQUFQLENBRGdEO0dBQTNDO0FBR1AsU0FBTywwQkFBTyxVQUFQLENBQVAsQ0FWb0Q7Q0FBL0M7QUFZUCxTQUFTLHNCQUFULENBQWdDLFFBQWhDLEVBQTBDLFdBQTFDLEVBQXVEO0FBQ3JELE1BQUksbUJBQW1CLGtDQUFpQixZQUFZLFFBQVosQ0FBcEMsQ0FEaUQ7QUFFckQsTUFBSSxjQUFjLEVBQUMsYUFBYSxxQkFBVSxXQUFWLEVBQXNDO3dDQUFaOztPQUFZOztBQUNwRSxVQUFJLFVBQVUsaUJBQWlCLElBQWpCLENBQXNCLEVBQUUsSUFBRixDQUFPLFVBQVAsQ0FBdEIsQ0FBVixDQURnRTtBQUVwRSxVQUFJLGFBQWEsMEJBQVcsV0FBWCxFQUF3QixRQUFRLE9BQVIsRUFBaUIsRUFBRSxJQUFGLENBQU8sV0FBVyxNQUFYLEdBQW9CLENBQXBCLEVBQXVCLFVBQTlCLENBQXpDLENBQWIsQ0FGZ0U7QUFHcEUsYUFBTyxXQUFXLElBQVgsRUFBUCxDQUhvRTtLQUF0QyxFQUk3QixnQkFBZ0Isd0JBQVUsT0FBVixFQUFrQzt5Q0FBWjs7T0FBWTs7QUFDbkQsYUFBTyx3Q0FBZ0IsaUJBQWlCLElBQWpCLENBQXNCLE9BQXRCLENBQWhCLEVBQWdELDBCQUEwQixVQUExQixDQUFoRCxDQUFQLENBRG1EO0tBQWxDLEVBSmYsQ0FGaUQ7QUFTckQsTUFBSSxrQkFBa0IscUJBQUssT0FBTyxJQUFQLENBQVksV0FBWixDQUFMLENBQWxCLENBVGlEO0FBVXJELE1BQUksa0JBQWtCLGdCQUFnQixHQUFoQixDQUFvQjtXQUFTLFlBQVksS0FBWjtHQUFULENBQXBCLENBQWlELE9BQWpELEVBQWxCLENBVmlEO0FBV3JELE1BQUksYUFBYSw0QkFBUSw0QkFBUixFQUEwQixvQkFBUyxRQUFULEVBQW1CLEVBQUMsWUFBWSxzQkFBWixFQUFvQixPQUFPLGdCQUFLLEVBQUwsQ0FBUSxvQkFBUyxxQkFBVCxFQUFnQyxFQUFDLFlBQVksb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxhQUFhLEtBQWIsRUFBb0IsTUFBTSxJQUFOLEVBQVksUUFBUSxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE9BQU8sZ0JBQWdCLEdBQWhCLENBQW9CLHFCQUFhO0FBQzNSLG1CQUFPLG9CQUFTLG1CQUFULEVBQThCLEVBQUMsTUFBTSxpQkFBTyxjQUFQLENBQXNCLFNBQXRCLENBQU4sRUFBL0IsQ0FBUCxDQUQyUjtXQUFiLENBQTNCLEVBRWpQLE1BQU0sSUFBTixFQUZtTixDQUFSLEVBRTdMLE1BQU0sb0JBQVMsY0FBVCxFQUF5QixFQUFDLFlBQVksZ0JBQUssRUFBTCxDQUFRLG9CQUFTLFdBQVQsRUFBc0IsRUFBQyxVQUFVLFlBQVYsRUFBdkIsQ0FBUixDQUFaLEVBQXNFLFlBQVksZ0JBQUssRUFBTCxDQUFRLG9CQUFTLGlCQUFULEVBQTRCLEVBQUMsWUFBWSxRQUFaLEVBQTdCLENBQVIsQ0FBWixFQUFoRyxDQUFOLEVBRjZILENBQVosRUFBakMsQ0FBUixDQUFQLEVBQXhDLENBQTFCLENBQWIsQ0FYaUQ7QUFjckQsTUFBSSxVQUFVLDRCQUFRLFVBQVIsRUFBb0Isb0NBQXBCLENBQVYsQ0FkaUQ7QUFlckQsTUFBSSxhQUFhLFlBQVksU0FBWixDQUFzQixPQUF0QixDQUFiLENBZmlEO0FBZ0JyRCxTQUFPLFVBQVUsV0FBVyxJQUFYLENBQVYsQ0FBMkIsS0FBM0IsQ0FBaUMsU0FBakMsRUFBNEMsZUFBNUMsQ0FBUCxDQWhCcUQ7Q0FBdkQ7QUFrQkEsSUFBTSxpQkFBaUIsRUFBRSxJQUFGLENBQU8sQ0FBQyxDQUFDLEVBQUUsS0FBRixDQUFRLEVBQUMsbUNBQUQsRUFBUixDQUFELEVBQTBDLEVBQUUsS0FBRixDQUFRLGdCQUFrQixXQUFsQixFQUErQixPQUEvQixFQUEyQztNQUF6Qyx1QkFBeUM7TUFBaEMsaUJBQWdDOztBQUMxSCxNQUFJLG1CQUFtQiwyQkFBaUIsV0FBakIsQ0FBbkIsQ0FEc0g7QUFFMUgsTUFBSSxnQkFBZ0IsdUJBQXVCLGlCQUFpQixNQUFqQixDQUF3QixJQUF4QixDQUF2QixFQUFzRCxXQUF0RCxDQUFoQixDQUZzSDtBQUcxSCxVQUFRLEdBQVIsQ0FBWSxRQUFRLElBQVIsQ0FBYSxPQUFiLEVBQVosRUFBb0MscUNBQXlCLGFBQXpCLENBQXBDLEVBSDBIO0NBQTNDLENBQWxELENBQUQsRUFJekIsQ0FBQyxFQUFFLENBQUYsRUFBSztTQUFTLE9BQU8sS0FBUCxFQUFjLHFCQUFkO0NBQVQsQ0FKbUIsQ0FBUCxDQUFqQjtrQkFLUyIsImZpbGUiOiJsb2FkLXN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm1FeHBhbmRlciBmcm9tIFwiLi90ZXJtLWV4cGFuZGVyXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBQYXJzZVJlZHVjZXIgZnJvbSBcIi4vcGFyc2UtcmVkdWNlci5qc1wiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQge21ha2VEZXNlcmlhbGl6ZXJ9IGZyb20gXCIuL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgY29kZWdlbiwge0Zvcm1hdHRlZENvZGVHZW59IGZyb20gXCJzaGlmdC1jb2RlZ2VuXCI7XG5pbXBvcnQge1ZhckJpbmRpbmdUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCB7dW53cmFwfSBmcm9tIFwiLi9tYWNyby1jb250ZXh0XCI7XG5pbXBvcnQge3JlcGxhY2VUZW1wbGF0ZX0gZnJvbSBcIi4vdGVtcGxhdGUtcHJvY2Vzc29yXCI7XG5sZXQgZ2V2YWxfMzA3ID0gZXZhbDtcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHZhbHVlc18zMTApIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVzXzMxMCkpIHtcbiAgICByZXR1cm4gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhMaXN0KHZhbHVlc18zMTApKTtcbiAgfSBlbHNlIGlmIChMaXN0LmlzTGlzdCh2YWx1ZXNfMzEwKSkge1xuICAgIHJldHVybiB2YWx1ZXNfMzEwLm1hcChzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKTtcbiAgfSBlbHNlIGlmICh2YWx1ZXNfMzEwID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXBsYWNlbWVudCB2YWx1ZXMgZm9yIHN5bnRheCB0ZW1wbGF0ZSBtdXN0IG5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWVzXzMxMC5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhMaXN0KHZhbHVlc18zMTApKTtcbiAgfVxuICByZXR1cm4gdW53cmFwKHZhbHVlc18zMTApO1xufVxuZnVuY3Rpb24gbG9hZEZvckNvbXBpbGV0aW1lXzMwOChleHByXzMxMSwgY29udGV4dF8zMTIpIHtcbiAgbGV0IGRlc2VyaWFsaXplcl8zMTMgPSBtYWtlRGVzZXJpYWxpemVyKGNvbnRleHRfMzEyLmJpbmRpbmdzKTtcbiAgbGV0IHNhbmRib3hfMzE0ID0ge3N5bnRheFF1b3RlOiBmdW5jdGlvbiAoc3RyaW5nc18zMjEsIC4uLnZhbHVlc18zMjApIHtcbiAgICBsZXQgY3R4XzMyMiA9IGRlc2VyaWFsaXplcl8zMTMucmVhZChfLmxhc3QodmFsdWVzXzMyMCkpO1xuICAgIGxldCByZWFkZXJfMzIzID0gbmV3IFJlYWRlcihzdHJpbmdzXzMyMSwgY3R4XzMyMi5jb250ZXh0LCBfLnRha2UodmFsdWVzXzMyMC5sZW5ndGggLSAxLCB2YWx1ZXNfMzIwKSk7XG4gICAgcmV0dXJuIHJlYWRlcl8zMjMucmVhZCgpO1xuICB9LCBzeW50YXhUZW1wbGF0ZTogZnVuY3Rpb24gKHN0cl8zMjUsIC4uLnZhbHVlc18zMjQpIHtcbiAgICByZXR1cm4gcmVwbGFjZVRlbXBsYXRlKGRlc2VyaWFsaXplcl8zMTMucmVhZChzdHJfMzI1KSwgc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyh2YWx1ZXNfMzI0KSk7XG4gIH19O1xuICBsZXQgc2FuZGJveEtleXNfMzE1ID0gTGlzdChPYmplY3Qua2V5cyhzYW5kYm94XzMxNCkpO1xuICBsZXQgc2FuZGJveFZhbHNfMzE2ID0gc2FuZGJveEtleXNfMzE1Lm1hcChrXzMyNiA9PiBzYW5kYm94XzMxNFtrXzMyNl0pLnRvQXJyYXkoKTtcbiAgbGV0IHBhcnNlZF8zMTcgPSByZWR1Y2VyKG5ldyBQYXJzZVJlZHVjZXIsIG5ldyBUZXJtKFwiTW9kdWxlXCIsIHtkaXJlY3RpdmVzOiBMaXN0KCksIGl0ZW1zOiBMaXN0Lm9mKG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJGdW5jdGlvbkV4cHJlc3Npb25cIiwge2lzR2VuZXJhdG9yOiBmYWxzZSwgbmFtZTogbnVsbCwgcGFyYW1zOiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiBzYW5kYm94S2V5c18zMTUubWFwKHBhcmFtXzMyNyA9PiB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihwYXJhbV8zMjcpfSk7XG4gIH0pLCByZXN0OiBudWxsfSksIGJvZHk6IG5ldyBUZXJtKFwiRnVuY3Rpb25Cb2R5XCIsIHtkaXJlY3RpdmVzOiBMaXN0Lm9mKG5ldyBUZXJtKFwiRGlyZWN0aXZlXCIsIHtyYXdWYWx1ZTogXCJ1c2Ugc3RyaWN0XCJ9KSksIHN0YXRlbWVudHM6IExpc3Qub2YobmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJfMzExfSkpfSl9KX0pKX0pKTtcbiAgbGV0IGdlbl8zMTggPSBjb2RlZ2VuKHBhcnNlZF8zMTcsIG5ldyBGb3JtYXR0ZWRDb2RlR2VuKTtcbiAgbGV0IHJlc3VsdF8zMTkgPSBjb250ZXh0XzMxMi50cmFuc2Zvcm0oZ2VuXzMxOCk7XG4gIHJldHVybiBnZXZhbF8zMDcocmVzdWx0XzMxOS5jb2RlKS5hcHBseSh1bmRlZmluZWQsIHNhbmRib3hWYWxzXzMxNik7XG59XG5jb25zdCBsb2FkU3ludGF4XzMwOSA9IF8uY29uZChbW18ud2hlcmUoe2JpbmRpbmc6IGlzQmluZGluZ0lkZW50aWZpZXJ9KSwgXy5jdXJyeSgoe2JpbmRpbmcsIGluaXR9LCBjb250ZXh0XzMyOCwgZW52XzMyOSkgPT4ge1xuICBsZXQgdGVybUV4cGFuZGVyXzMzMCA9IG5ldyBUZXJtRXhwYW5kZXIoY29udGV4dF8zMjgpO1xuICBsZXQgaW5pdFZhbHVlXzMzMSA9IGxvYWRGb3JDb21waWxldGltZV8zMDgodGVybUV4cGFuZGVyXzMzMC5leHBhbmQoaW5pdCksIGNvbnRleHRfMzI4KTtcbiAgZW52XzMyOS5zZXQoYmluZGluZy5uYW1lLnJlc29sdmUoKSwgbmV3IENvbXBpbGV0aW1lVHJhbnNmb3JtKGluaXRWYWx1ZV8zMzEpKTtcbn0pXSwgW18uVCwgX18zMzIgPT4gYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIildXSk7XG5leHBvcnQgZGVmYXVsdCBsb2FkU3ludGF4XzMwOTtcbiJdfQ==