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

  var reader_523 = new _shiftReader2.default(source_521);
  var stxl_524 = reader_523.read();
  var scope_525 = (0, _scope.freshScope)("top");
  var bindings_526 = new _bindingMap2.default();
  var expander_527 = new _expander2.default({ env: new _env2.default(), store: new _env2.default(), bindings: bindings_526, cwd: options_522.cwd, modules: new _modules.Modules(), currentScope: [scope_525], transform: options_522.transform ? options_522.transform : function (x_529) {
      return { code: x_529 };
    }, moduleResolver: options_522.moduleResolver, moduleLoader: options_522.moduleLoader });
  var exStxl_528 = expander_527.expand(stxl_524.map(function (s) {
    return s.addScope(scope_525, bindings_526);
  }));
  return new _terms2.default("Module", { directives: (0, _immutable.List)(), items: exStxl_528 });
}
function parse(source_530) {
  var options_531 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _shiftReducer2.default)(new _parseReducer2.default(), expand(source_530, options_531));
}
function compile(source_532) {
  var options_533 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var ast_534 = parse(source_532, options_533);
  var gen_535 = (0, _shiftCodegen2.default)(ast_534, new _shiftCodegen.FormattedCodeGen());
  return options_533.transform && !options_533.noBabel ? options_533.transform(gen_535, { presets: ["es2015"] }) : { code: gen_535 };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N3ZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBWWdCO1FBV0E7UUFHQTs7QUExQmhCOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ08sU0FBUyxNQUFULENBQWdCLFVBQWhCLEVBQThDO01BQWxCLG9FQUFjLGtCQUFJOztBQUNuRCxNQUFJLGFBQWEsMEJBQVcsVUFBWCxDQUFiLENBRCtDO0FBRW5ELE1BQUksV0FBVyxXQUFXLElBQVgsRUFBWCxDQUYrQztBQUduRCxNQUFJLFlBQVksdUJBQVcsS0FBWCxDQUFaLENBSCtDO0FBSW5ELE1BQUksZUFBZSwwQkFBZixDQUorQztBQUtuRCxNQUFJLGVBQWUsdUJBQWEsRUFBQyxLQUFLLG1CQUFMLEVBQWMsT0FBTyxtQkFBUCxFQUFnQixVQUFVLFlBQVYsRUFBd0IsS0FBSyxZQUFZLEdBQVosRUFBaUIsU0FBUyxzQkFBVCxFQUFzQixjQUFjLENBQUMsU0FBRCxDQUFkLEVBQTJCLFdBQVcsWUFBWSxTQUFaLEdBQXdCLFlBQVksU0FBWixHQUF3QixVQUFVLEtBQVYsRUFBaUI7QUFDeE8sYUFBTyxFQUFDLE1BQU0sS0FBTixFQUFSLENBRHdPO0tBQWpCLEVBRXROLGdCQUFnQixZQUFZLGNBQVosRUFBNEIsY0FBYyxZQUFZLFlBQVosRUFGMUMsQ0FBZixDQUwrQztBQVFuRCxNQUFJLGFBQWEsYUFBYSxNQUFiLENBQW9CLFNBQVMsR0FBVCxDQUFhO1dBQUssRUFBRSxRQUFGLENBQVcsU0FBWCxFQUFzQixZQUF0QjtHQUFMLENBQWpDLENBQWIsQ0FSK0M7QUFTbkQsU0FBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsWUFBWSxzQkFBWixFQUFvQixPQUFPLFVBQVAsRUFBeEMsQ0FBUCxDQVRtRDtDQUE5QztBQVdBLFNBQVMsS0FBVCxDQUFlLFVBQWYsRUFBNkM7TUFBbEIsb0VBQWMsa0JBQUk7O0FBQ2xELFNBQU8sNEJBQU8sNEJBQVAsRUFBeUIsT0FBTyxVQUFQLEVBQW1CLFdBQW5CLENBQXpCLENBQVAsQ0FEa0Q7Q0FBN0M7QUFHQSxTQUFTLE9BQVQsQ0FBaUIsVUFBakIsRUFBK0M7TUFBbEIsb0VBQWMsa0JBQUk7O0FBQ3BELE1BQUksVUFBVSxNQUFNLFVBQU4sRUFBa0IsV0FBbEIsQ0FBVixDQURnRDtBQUVwRCxNQUFJLFVBQVUsNEJBQVEsT0FBUixFQUFpQixvQ0FBakIsQ0FBVixDQUZnRDtBQUdwRCxTQUFPLFlBQVksU0FBWixJQUF5QixDQUFDLFlBQVksT0FBWixHQUFzQixZQUFZLFNBQVosQ0FBc0IsT0FBdEIsRUFBK0IsRUFBQyxTQUFTLENBQUMsUUFBRCxDQUFULEVBQWhDLENBQWhELEdBQXdHLEVBQUMsTUFBTSxPQUFOLEVBQXpHLENBSDZDO0NBQS9DIiwiZmlsZSI6InN3ZWV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCBFeHBhbmRlciBmcm9tIFwiLi9leHBhbmRlclwiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IEVudiBmcm9tIFwiLi9lbnZcIjtcbmltcG9ydCByZWR1Y2UgZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCBQYXJzZVJlZHVjZXIgZnJvbSBcIi4vcGFyc2UtcmVkdWNlclwiO1xuaW1wb3J0IGNvZGVnZW4sIHtGb3JtYXR0ZWRDb2RlR2VufSBmcm9tIFwic2hpZnQtY29kZWdlblwiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtNb2R1bGVzfSBmcm9tIFwiLi9tb2R1bGVzXCI7XG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kKHNvdXJjZV81MjEsIG9wdGlvbnNfNTIyID0ge30pIHtcbiAgbGV0IHJlYWRlcl81MjMgPSBuZXcgUmVhZGVyKHNvdXJjZV81MjEpO1xuICBsZXQgc3R4bF81MjQgPSByZWFkZXJfNTIzLnJlYWQoKTtcbiAgbGV0IHNjb3BlXzUyNSA9IGZyZXNoU2NvcGUoXCJ0b3BcIik7XG4gIGxldCBiaW5kaW5nc181MjYgPSBuZXcgQmluZGluZ01hcDtcbiAgbGV0IGV4cGFuZGVyXzUyNyA9IG5ldyBFeHBhbmRlcih7ZW52OiBuZXcgRW52LCBzdG9yZTogbmV3IEVudiwgYmluZGluZ3M6IGJpbmRpbmdzXzUyNiwgY3dkOiBvcHRpb25zXzUyMi5jd2QsIG1vZHVsZXM6IG5ldyBNb2R1bGVzLCBjdXJyZW50U2NvcGU6IFtzY29wZV81MjVdLCB0cmFuc2Zvcm06IG9wdGlvbnNfNTIyLnRyYW5zZm9ybSA/IG9wdGlvbnNfNTIyLnRyYW5zZm9ybSA6IGZ1bmN0aW9uICh4XzUyOSkge1xuICAgIHJldHVybiB7Y29kZTogeF81Mjl9O1xuICB9LCBtb2R1bGVSZXNvbHZlcjogb3B0aW9uc181MjIubW9kdWxlUmVzb2x2ZXIsIG1vZHVsZUxvYWRlcjogb3B0aW9uc181MjIubW9kdWxlTG9hZGVyfSk7XG4gIGxldCBleFN0eGxfNTI4ID0gZXhwYW5kZXJfNTI3LmV4cGFuZChzdHhsXzUyNC5tYXAocyA9PiBzLmFkZFNjb3BlKHNjb3BlXzUyNSwgYmluZGluZ3NfNTI2KSkpO1xuICByZXR1cm4gbmV3IFRlcm0oXCJNb2R1bGVcIiwge2RpcmVjdGl2ZXM6IExpc3QoKSwgaXRlbXM6IGV4U3R4bF81Mjh9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzb3VyY2VfNTMwLCBvcHRpb25zXzUzMSA9IHt9KSB7XG4gIHJldHVybiByZWR1Y2UobmV3IFBhcnNlUmVkdWNlciwgZXhwYW5kKHNvdXJjZV81MzAsIG9wdGlvbnNfNTMxKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZShzb3VyY2VfNTMyLCBvcHRpb25zXzUzMyA9IHt9KSB7XG4gIGxldCBhc3RfNTM0ID0gcGFyc2Uoc291cmNlXzUzMiwgb3B0aW9uc181MzMpO1xuICBsZXQgZ2VuXzUzNSA9IGNvZGVnZW4oYXN0XzUzNCwgbmV3IEZvcm1hdHRlZENvZGVHZW4pO1xuICByZXR1cm4gb3B0aW9uc181MzMudHJhbnNmb3JtICYmICFvcHRpb25zXzUzMy5ub0JhYmVsID8gb3B0aW9uc181MzMudHJhbnNmb3JtKGdlbl81MzUsIHtwcmVzZXRzOiBbXCJlczIwMTVcIl19KSA6IHtjb2RlOiBnZW5fNTM1fTtcbn1cbiJdfQ==