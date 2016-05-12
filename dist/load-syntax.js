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

var geval_309 = eval;
function sanitizeReplacementValues(values_312) {
  if (Array.isArray(values_312)) {
    return sanitizeReplacementValues((0, _immutable.List)(values_312));
  } else if (_immutable.List.isList(values_312)) {
    return values_312.map(sanitizeReplacementValues);
  } else if (values_312 == null) {
    throw new Error("replacement values for syntax template must not be null or undefined");
  } else if (typeof values_312.next === "function") {
    return sanitizeReplacementValues((0, _immutable.List)(values_312));
  }
  return (0, _macroContext.unwrap)(values_312);
}
function loadForCompiletime_310(expr_313, context_314) {
  var deserializer_315 = (0, _serializer.makeDeserializer)(context_314.bindings);
  var sandbox_316 = { syntaxQuote: function syntaxQuote(strings_323) {
      for (var _len = arguments.length, values_322 = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values_322[_key - 1] = arguments[_key];
      }

      var ctx_324 = deserializer_315.read(_.last(values_322));
      var reader_325 = new _shiftReader2.default(strings_323, ctx_324.context, _.take(values_322.length - 1, values_322));
      return reader_325.read();
    }, syntaxTemplate: function syntaxTemplate(str_327) {
      for (var _len2 = arguments.length, values_326 = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values_326[_key2 - 1] = arguments[_key2];
      }

      return (0, _templateProcessor.replaceTemplate)(deserializer_315.read(str_327), sanitizeReplacementValues(values_326));
    } };
  var sandboxKeys_317 = (0, _immutable.List)(Object.keys(sandbox_316));
  var sandboxVals_318 = sandboxKeys_317.map(function (k_328) {
    return sandbox_316[k_328];
  }).toArray();
  var parsed_319 = (0, _shiftReducer2.default)(new _parseReducer2.default(), new _terms2.default("Module", { directives: (0, _immutable.List)(), items: _immutable.List.of(new _terms2.default("ExpressionStatement", { expression: new _terms2.default("FunctionExpression", { isGenerator: false, name: null, params: new _terms2.default("FormalParameters", { items: sandboxKeys_317.map(function (param_329) {
            return new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier(param_329) });
          }), rest: null }), body: new _terms2.default("FunctionBody", { directives: _immutable.List.of(new _terms2.default("Directive", { rawValue: "use strict" })), statements: _immutable.List.of(new _terms2.default("ReturnStatement", { expression: expr_313 })) }) }) })) }));
  var gen_320 = (0, _shiftCodegen2.default)(parsed_319, new _shiftCodegen.FormattedCodeGen());
  var result_321 = context_314.transform(gen_320, { babelrc: true, filename: context_314.filename });
  return geval_309(result_321.code).apply(undefined, sandboxVals_318);
}
var loadSyntax_311 = _.cond([[_.where({ binding: _terms.isBindingIdentifier }), _.curry(function (_ref, context_330, env_331) {
  var binding = _ref.binding;
  var init = _ref.init;

  var termExpander_332 = new _termExpander2.default(context_330);
  var initValue_333 = loadForCompiletime_310(termExpander_332.expand(init), context_330);
  env_331.set(binding.name.resolve(), new _transforms.CompiletimeTransform(initValue_333));
})], [_.T, function (__334) {
  return assert(false, "not implemented yet");
}]]);
exports.default = loadSyntax_311;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2xvYWQtc3ludGF4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBY2dCLHlCLEdBQUEseUI7O0FBZGhCOztJQUFhLEM7O0FBQ2I7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7O0FBQ0EsSUFBSSxZQUFZLElBQWhCO0FBQ08sU0FBUyx5QkFBVCxDQUFtQyxVQUFuQyxFQUErQztBQUNwRCxNQUFJLE1BQU0sT0FBTixDQUFjLFVBQWQsQ0FBSixFQUErQjtBQUM3QixXQUFPLDBCQUEwQixxQkFBSyxVQUFMLENBQTFCLENBQVA7QUFDRCxHQUZELE1BRU8sSUFBSSxnQkFBSyxNQUFMLENBQVksVUFBWixDQUFKLEVBQTZCO0FBQ2xDLFdBQU8sV0FBVyxHQUFYLENBQWUseUJBQWYsQ0FBUDtBQUNELEdBRk0sTUFFQSxJQUFJLGNBQWMsSUFBbEIsRUFBd0I7QUFDN0IsVUFBTSxJQUFJLEtBQUosQ0FBVSxzRUFBVixDQUFOO0FBQ0QsR0FGTSxNQUVBLElBQUksT0FBTyxXQUFXLElBQWxCLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ2hELFdBQU8sMEJBQTBCLHFCQUFLLFVBQUwsQ0FBMUIsQ0FBUDtBQUNEO0FBQ0QsU0FBTywwQkFBTyxVQUFQLENBQVA7QUFDRDtBQUNELFNBQVMsc0JBQVQsQ0FBZ0MsUUFBaEMsRUFBMEMsV0FBMUMsRUFBdUQ7QUFDckQsTUFBSSxtQkFBbUIsa0NBQWlCLFlBQVksUUFBN0IsQ0FBdkI7QUFDQSxNQUFJLGNBQWMsRUFBQyxhQUFhLHFCQUFVLFdBQVYsRUFBc0M7QUFBQSx3Q0FBWixVQUFZO0FBQVosa0JBQVk7QUFBQTs7QUFDcEUsVUFBSSxVQUFVLGlCQUFpQixJQUFqQixDQUFzQixFQUFFLElBQUYsQ0FBTyxVQUFQLENBQXRCLENBQWQ7QUFDQSxVQUFJLGFBQWEsMEJBQVcsV0FBWCxFQUF3QixRQUFRLE9BQWhDLEVBQXlDLEVBQUUsSUFBRixDQUFPLFdBQVcsTUFBWCxHQUFvQixDQUEzQixFQUE4QixVQUE5QixDQUF6QyxDQUFqQjtBQUNBLGFBQU8sV0FBVyxJQUFYLEVBQVA7QUFDRCxLQUppQixFQUlmLGdCQUFnQix3QkFBVSxPQUFWLEVBQWtDO0FBQUEseUNBQVosVUFBWTtBQUFaLGtCQUFZO0FBQUE7O0FBQ25ELGFBQU8sd0NBQWdCLGlCQUFpQixJQUFqQixDQUFzQixPQUF0QixDQUFoQixFQUFnRCwwQkFBMEIsVUFBMUIsQ0FBaEQsQ0FBUDtBQUNELEtBTmlCLEVBQWxCO0FBT0EsTUFBSSxrQkFBa0IscUJBQUssT0FBTyxJQUFQLENBQVksV0FBWixDQUFMLENBQXRCO0FBQ0EsTUFBSSxrQkFBa0IsZ0JBQWdCLEdBQWhCLENBQW9CO0FBQUEsV0FBUyxZQUFZLEtBQVosQ0FBVDtBQUFBLEdBQXBCLEVBQWlELE9BQWpELEVBQXRCO0FBQ0EsTUFBSSxhQUFhLDRCQUFRLDRCQUFSLEVBQTBCLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxZQUFZLHNCQUFiLEVBQXFCLE9BQU8sZ0JBQUssRUFBTCxDQUFRLG9CQUFTLHFCQUFULEVBQWdDLEVBQUMsWUFBWSxvQkFBUyxvQkFBVCxFQUErQixFQUFDLGFBQWEsS0FBZCxFQUFxQixNQUFNLElBQTNCLEVBQWlDLFFBQVEsb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxPQUFPLGdCQUFnQixHQUFoQixDQUFvQixxQkFBYTtBQUMzUixtQkFBTyxvQkFBUyxtQkFBVCxFQUE4QixFQUFDLE1BQU0saUJBQU8sY0FBUCxDQUFzQixTQUF0QixDQUFQLEVBQTlCLENBQVA7QUFDRCxXQUYyUCxDQUFSLEVBRWhQLE1BQU0sSUFGME8sRUFBN0IsQ0FBekMsRUFFNUosTUFBTSxvQkFBUyxjQUFULEVBQXlCLEVBQUMsWUFBWSxnQkFBSyxFQUFMLENBQVEsb0JBQVMsV0FBVCxFQUFzQixFQUFDLFVBQVUsWUFBWCxFQUF0QixDQUFSLENBQWIsRUFBdUUsWUFBWSxnQkFBSyxFQUFMLENBQVEsb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxZQUFZLFFBQWIsRUFBNUIsQ0FBUixDQUFuRixFQUF6QixDQUZzSixFQUEvQixDQUFiLEVBQWhDLENBQVIsQ0FBNUIsRUFBbkIsQ0FBMUIsQ0FBakI7QUFHQSxNQUFJLFVBQVUsNEJBQVEsVUFBUixFQUFvQixvQ0FBcEIsQ0FBZDtBQUNBLE1BQUksYUFBYSxZQUFZLFNBQVosQ0FBc0IsT0FBdEIsRUFBK0IsRUFBQyxTQUFTLElBQVYsRUFBZ0IsVUFBVSxZQUFZLFFBQXRDLEVBQS9CLENBQWpCO0FBQ0EsU0FBTyxVQUFVLFdBQVcsSUFBckIsRUFBMkIsS0FBM0IsQ0FBaUMsU0FBakMsRUFBNEMsZUFBNUMsQ0FBUDtBQUNEO0FBQ0QsSUFBTSxpQkFBaUIsRUFBRSxJQUFGLENBQU8sQ0FBQyxDQUFDLEVBQUUsS0FBRixDQUFRLEVBQUMsbUNBQUQsRUFBUixDQUFELEVBQTBDLEVBQUUsS0FBRixDQUFRLGdCQUFrQixXQUFsQixFQUErQixPQUEvQixFQUEyQztBQUFBLE1BQXpDLE9BQXlDLFFBQXpDLE9BQXlDO0FBQUEsTUFBaEMsSUFBZ0MsUUFBaEMsSUFBZ0M7O0FBQzFILE1BQUksbUJBQW1CLDJCQUFpQixXQUFqQixDQUF2QjtBQUNBLE1BQUksZ0JBQWdCLHVCQUF1QixpQkFBaUIsTUFBakIsQ0FBd0IsSUFBeEIsQ0FBdkIsRUFBc0QsV0FBdEQsQ0FBcEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxRQUFRLElBQVIsQ0FBYSxPQUFiLEVBQVosRUFBb0MscUNBQXlCLGFBQXpCLENBQXBDO0FBQ0QsQ0FKd0UsQ0FBMUMsQ0FBRCxFQUl6QixDQUFDLEVBQUUsQ0FBSCxFQUFNO0FBQUEsU0FBUyxPQUFPLEtBQVAsRUFBYyxxQkFBZCxDQUFUO0FBQUEsQ0FBTixDQUp5QixDQUFQLENBQXZCO2tCQUtlLGMiLCJmaWxlIjoibG9hZC1zeW50YXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCBUZXJtRXhwYW5kZXIgZnJvbSBcIi4vdGVybS1leHBhbmRlclwiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgUGFyc2VSZWR1Y2VyIGZyb20gXCIuL3BhcnNlLXJlZHVjZXIuanNcIjtcbmltcG9ydCByZWR1Y2VyLCB7TW9ub2lkYWxSZWR1Y2VyfSBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IHttYWtlRGVzZXJpYWxpemVyfSBmcm9tIFwiLi9zZXJpYWxpemVyXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IGNvZGVnZW4sIHtGb3JtYXR0ZWRDb2RlR2VufSBmcm9tIFwic2hpZnQtY29kZWdlblwiO1xuaW1wb3J0IHtWYXJCaW5kaW5nVHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCBSZWFkZXIgZnJvbSBcIi4vc2hpZnQtcmVhZGVyXCI7XG5pbXBvcnQge3Vud3JhcH0gZnJvbSBcIi4vbWFjcm8tY29udGV4dFwiO1xuaW1wb3J0IHtyZXBsYWNlVGVtcGxhdGV9IGZyb20gXCIuL3RlbXBsYXRlLXByb2Nlc3NvclwiO1xubGV0IGdldmFsXzMwOSA9IGV2YWw7XG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyh2YWx1ZXNfMzEyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlc18zMTIpKSB7XG4gICAgcmV0dXJuIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMoTGlzdCh2YWx1ZXNfMzEyKSk7XG4gIH0gZWxzZSBpZiAoTGlzdC5pc0xpc3QodmFsdWVzXzMxMikpIHtcbiAgICByZXR1cm4gdmFsdWVzXzMxMi5tYXAoc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyk7XG4gIH0gZWxzZSBpZiAodmFsdWVzXzMxMiA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwicmVwbGFjZW1lbnQgdmFsdWVzIGZvciBzeW50YXggdGVtcGxhdGUgbXVzdCBub3QgYmUgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlc18zMTIubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMoTGlzdCh2YWx1ZXNfMzEyKSk7XG4gIH1cbiAgcmV0dXJuIHVud3JhcCh2YWx1ZXNfMzEyKTtcbn1cbmZ1bmN0aW9uIGxvYWRGb3JDb21waWxldGltZV8zMTAoZXhwcl8zMTMsIGNvbnRleHRfMzE0KSB7XG4gIGxldCBkZXNlcmlhbGl6ZXJfMzE1ID0gbWFrZURlc2VyaWFsaXplcihjb250ZXh0XzMxNC5iaW5kaW5ncyk7XG4gIGxldCBzYW5kYm94XzMxNiA9IHtzeW50YXhRdW90ZTogZnVuY3Rpb24gKHN0cmluZ3NfMzIzLCAuLi52YWx1ZXNfMzIyKSB7XG4gICAgbGV0IGN0eF8zMjQgPSBkZXNlcmlhbGl6ZXJfMzE1LnJlYWQoXy5sYXN0KHZhbHVlc18zMjIpKTtcbiAgICBsZXQgcmVhZGVyXzMyNSA9IG5ldyBSZWFkZXIoc3RyaW5nc18zMjMsIGN0eF8zMjQuY29udGV4dCwgXy50YWtlKHZhbHVlc18zMjIubGVuZ3RoIC0gMSwgdmFsdWVzXzMyMikpO1xuICAgIHJldHVybiByZWFkZXJfMzI1LnJlYWQoKTtcbiAgfSwgc3ludGF4VGVtcGxhdGU6IGZ1bmN0aW9uIChzdHJfMzI3LCAuLi52YWx1ZXNfMzI2KSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUZW1wbGF0ZShkZXNlcmlhbGl6ZXJfMzE1LnJlYWQoc3RyXzMyNyksIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXModmFsdWVzXzMyNikpO1xuICB9fTtcbiAgbGV0IHNhbmRib3hLZXlzXzMxNyA9IExpc3QoT2JqZWN0LmtleXMoc2FuZGJveF8zMTYpKTtcbiAgbGV0IHNhbmRib3hWYWxzXzMxOCA9IHNhbmRib3hLZXlzXzMxNy5tYXAoa18zMjggPT4gc2FuZGJveF8zMTZba18zMjhdKS50b0FycmF5KCk7XG4gIGxldCBwYXJzZWRfMzE5ID0gcmVkdWNlcihuZXcgUGFyc2VSZWR1Y2VyLCBuZXcgVGVybShcIk1vZHVsZVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBpdGVtczogTGlzdC5vZihuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IG5ldyBUZXJtKFwiRnVuY3Rpb25FeHByZXNzaW9uXCIsIHtpc0dlbmVyYXRvcjogZmFsc2UsIG5hbWU6IG51bGwsIHBhcmFtczogbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogc2FuZGJveEtleXNfMzE3Lm1hcChwYXJhbV8zMjkgPT4ge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIocGFyYW1fMzI5KX0pO1xuICB9KSwgcmVzdDogbnVsbH0pLCBib2R5OiBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdC5vZihuZXcgVGVybShcIkRpcmVjdGl2ZVwiLCB7cmF3VmFsdWU6IFwidXNlIHN0cmljdFwifSkpLCBzdGF0ZW1lbnRzOiBMaXN0Lm9mKG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBleHByXzMxM30pKX0pfSl9KSl9KSk7XG4gIGxldCBnZW5fMzIwID0gY29kZWdlbihwYXJzZWRfMzE5LCBuZXcgRm9ybWF0dGVkQ29kZUdlbik7XG4gIGxldCByZXN1bHRfMzIxID0gY29udGV4dF8zMTQudHJhbnNmb3JtKGdlbl8zMjAsIHtiYWJlbHJjOiB0cnVlLCBmaWxlbmFtZTogY29udGV4dF8zMTQuZmlsZW5hbWV9KTtcbiAgcmV0dXJuIGdldmFsXzMwOShyZXN1bHRfMzIxLmNvZGUpLmFwcGx5KHVuZGVmaW5lZCwgc2FuZGJveFZhbHNfMzE4KTtcbn1cbmNvbnN0IGxvYWRTeW50YXhfMzExID0gXy5jb25kKFtbXy53aGVyZSh7YmluZGluZzogaXNCaW5kaW5nSWRlbnRpZmllcn0pLCBfLmN1cnJ5KCh7YmluZGluZywgaW5pdH0sIGNvbnRleHRfMzMwLCBlbnZfMzMxKSA9PiB7XG4gIGxldCB0ZXJtRXhwYW5kZXJfMzMyID0gbmV3IFRlcm1FeHBhbmRlcihjb250ZXh0XzMzMCk7XG4gIGxldCBpbml0VmFsdWVfMzMzID0gbG9hZEZvckNvbXBpbGV0aW1lXzMxMCh0ZXJtRXhwYW5kZXJfMzMyLmV4cGFuZChpbml0KSwgY29udGV4dF8zMzApO1xuICBlbnZfMzMxLnNldChiaW5kaW5nLm5hbWUucmVzb2x2ZSgpLCBuZXcgQ29tcGlsZXRpbWVUcmFuc2Zvcm0oaW5pdFZhbHVlXzMzMykpO1xufSldLCBbXy5ULCBfXzMzNCA9PiBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldFwiKV1dKTtcbmV4cG9ydCBkZWZhdWx0IGxvYWRTeW50YXhfMzExO1xuIl19