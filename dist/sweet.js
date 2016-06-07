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

function expand(source_628) {
  var options_629 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var reader_630 = new _shiftReader2.default(source_628);
  var stxl_631 = reader_630.read();
  var scope_632 = (0, _scope.freshScope)("top");
  var bindings_633 = new _bindingMap2.default();
  var expander_634 = new _expander2.default({ env: new _env2.default(), store: new _env2.default(), bindings: bindings_633, cwd: options_629.cwd, filename: options_629.filename, modules: new _modules.Modules(), currentScope: [scope_632], transform: options_629.transform ? options_629.transform : function (x_636) {
      return { code: x_636 };
    }, moduleResolver: options_629.moduleResolver, moduleLoader: options_629.moduleLoader });
  var exStxl_635 = expander_634.expand(stxl_631.map(function (s_637) {
    return s_637.addScope(scope_632, bindings_633);
  }));
  return new _terms2.default("Module", { directives: (0, _immutable.List)(), items: exStxl_635 });
}
function parse(source_638) {
  var options_639 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _shiftReducer2.default)(new _parseReducer2.default(), expand(source_638, options_639));
}
function compile(source_640) {
  var options_641 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var ast_642 = parse(source_640, options_641);
  var gen_643 = (0, _shiftCodegen2.default)(ast_642, new _shiftCodegen.FormattedCodeGen());
  return options_641.transform && !options_641.noBabel ? options_641.transform(gen_643, { babelrc: true, filename: options_641.filename }) : { code: gen_643 };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N3ZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBWWdCLE0sR0FBQSxNO1FBV0EsSyxHQUFBLEs7UUFHQSxPLEdBQUEsTzs7QUExQmhCOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ08sU0FBUyxNQUFULENBQWdCLFVBQWhCLEVBQThDO0FBQUEsTUFBbEIsV0FBa0IseURBQUosRUFBSTs7QUFDbkQsTUFBSSxhQUFhLDBCQUFXLFVBQVgsQ0FBakI7QUFDQSxNQUFJLFdBQVcsV0FBVyxJQUFYLEVBQWY7QUFDQSxNQUFJLFlBQVksdUJBQVcsS0FBWCxDQUFoQjtBQUNBLE1BQUksZUFBZSwwQkFBbkI7QUFDQSxNQUFJLGVBQWUsdUJBQWEsRUFBQyxLQUFLLG1CQUFOLEVBQWUsT0FBTyxtQkFBdEIsRUFBK0IsVUFBVSxZQUF6QyxFQUF1RCxLQUFLLFlBQVksR0FBeEUsRUFBNkUsVUFBVSxZQUFZLFFBQW5HLEVBQTZHLFNBQVMsc0JBQXRILEVBQW1JLGNBQWMsQ0FBQyxTQUFELENBQWpKLEVBQThKLFdBQVcsWUFBWSxTQUFaLEdBQXdCLFlBQVksU0FBcEMsR0FBZ0QsVUFBVSxLQUFWLEVBQWlCO0FBQ3hRLGFBQU8sRUFBQyxNQUFNLEtBQVAsRUFBUDtBQUNELEtBRitCLEVBRTdCLGdCQUFnQixZQUFZLGNBRkMsRUFFZSxjQUFjLFlBQVksWUFGekMsRUFBYixDQUFuQjtBQUdBLE1BQUksYUFBYSxhQUFhLE1BQWIsQ0FBb0IsU0FBUyxHQUFULENBQWE7QUFBQSxXQUFTLE1BQU0sUUFBTixDQUFlLFNBQWYsRUFBMEIsWUFBMUIsQ0FBVDtBQUFBLEdBQWIsQ0FBcEIsQ0FBakI7QUFDQSxTQUFPLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxZQUFZLHNCQUFiLEVBQXFCLE9BQU8sVUFBNUIsRUFBbkIsQ0FBUDtBQUNEO0FBQ00sU0FBUyxLQUFULENBQWUsVUFBZixFQUE2QztBQUFBLE1BQWxCLFdBQWtCLHlEQUFKLEVBQUk7O0FBQ2xELFNBQU8sNEJBQU8sNEJBQVAsRUFBeUIsT0FBTyxVQUFQLEVBQW1CLFdBQW5CLENBQXpCLENBQVA7QUFDRDtBQUNNLFNBQVMsT0FBVCxDQUFpQixVQUFqQixFQUErQztBQUFBLE1BQWxCLFdBQWtCLHlEQUFKLEVBQUk7O0FBQ3BELE1BQUksVUFBVSxNQUFNLFVBQU4sRUFBa0IsV0FBbEIsQ0FBZDtBQUNBLE1BQUksVUFBVSw0QkFBUSxPQUFSLEVBQWlCLG9DQUFqQixDQUFkO0FBQ0EsU0FBTyxZQUFZLFNBQVosSUFBeUIsQ0FBQyxZQUFZLE9BQXRDLEdBQWdELFlBQVksU0FBWixDQUFzQixPQUF0QixFQUErQixFQUFDLFNBQVMsSUFBVixFQUFnQixVQUFVLFlBQVksUUFBdEMsRUFBL0IsQ0FBaEQsR0FBa0ksRUFBQyxNQUFNLE9BQVAsRUFBekk7QUFDRCIsImZpbGUiOiJzd2VldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFkZXIgZnJvbSBcIi4vc2hpZnQtcmVhZGVyXCI7XG5pbXBvcnQgRXhwYW5kZXIgZnJvbSBcIi4vZXhwYW5kZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgcmVkdWNlIGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgUGFyc2VSZWR1Y2VyIGZyb20gXCIuL3BhcnNlLXJlZHVjZXJcIjtcbmltcG9ydCBjb2RlZ2VuLCB7Rm9ybWF0dGVkQ29kZUdlbn0gZnJvbSBcInNoaWZ0LWNvZGVnZW5cIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcC5qc1wiO1xuaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7TW9kdWxlc30gZnJvbSBcIi4vbW9kdWxlc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZChzb3VyY2VfNjI4LCBvcHRpb25zXzYyOSA9IHt9KSB7XG4gIGxldCByZWFkZXJfNjMwID0gbmV3IFJlYWRlcihzb3VyY2VfNjI4KTtcbiAgbGV0IHN0eGxfNjMxID0gcmVhZGVyXzYzMC5yZWFkKCk7XG4gIGxldCBzY29wZV82MzIgPSBmcmVzaFNjb3BlKFwidG9wXCIpO1xuICBsZXQgYmluZGluZ3NfNjMzID0gbmV3IEJpbmRpbmdNYXA7XG4gIGxldCBleHBhbmRlcl82MzQgPSBuZXcgRXhwYW5kZXIoe2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBiaW5kaW5nc182MzMsIGN3ZDogb3B0aW9uc182MjkuY3dkLCBmaWxlbmFtZTogb3B0aW9uc182MjkuZmlsZW5hbWUsIG1vZHVsZXM6IG5ldyBNb2R1bGVzLCBjdXJyZW50U2NvcGU6IFtzY29wZV82MzJdLCB0cmFuc2Zvcm06IG9wdGlvbnNfNjI5LnRyYW5zZm9ybSA/IG9wdGlvbnNfNjI5LnRyYW5zZm9ybSA6IGZ1bmN0aW9uICh4XzYzNikge1xuICAgIHJldHVybiB7Y29kZTogeF82MzZ9O1xuICB9LCBtb2R1bGVSZXNvbHZlcjogb3B0aW9uc182MjkubW9kdWxlUmVzb2x2ZXIsIG1vZHVsZUxvYWRlcjogb3B0aW9uc182MjkubW9kdWxlTG9hZGVyfSk7XG4gIGxldCBleFN0eGxfNjM1ID0gZXhwYW5kZXJfNjM0LmV4cGFuZChzdHhsXzYzMS5tYXAoc182MzcgPT4gc182MzcuYWRkU2NvcGUoc2NvcGVfNjMyLCBiaW5kaW5nc182MzMpKSk7XG4gIHJldHVybiBuZXcgVGVybShcIk1vZHVsZVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBpdGVtczogZXhTdHhsXzYzNX0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNvdXJjZV82MzgsIG9wdGlvbnNfNjM5ID0ge30pIHtcbiAgcmV0dXJuIHJlZHVjZShuZXcgUGFyc2VSZWR1Y2VyLCBleHBhbmQoc291cmNlXzYzOCwgb3B0aW9uc182MzkpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlKHNvdXJjZV82NDAsIG9wdGlvbnNfNjQxID0ge30pIHtcbiAgbGV0IGFzdF82NDIgPSBwYXJzZShzb3VyY2VfNjQwLCBvcHRpb25zXzY0MSk7XG4gIGxldCBnZW5fNjQzID0gY29kZWdlbihhc3RfNjQyLCBuZXcgRm9ybWF0dGVkQ29kZUdlbik7XG4gIHJldHVybiBvcHRpb25zXzY0MS50cmFuc2Zvcm0gJiYgIW9wdGlvbnNfNjQxLm5vQmFiZWwgPyBvcHRpb25zXzY0MS50cmFuc2Zvcm0oZ2VuXzY0Mywge2JhYmVscmM6IHRydWUsIGZpbGVuYW1lOiBvcHRpb25zXzY0MS5maWxlbmFtZX0pIDoge2NvZGU6IGdlbl82NDN9O1xufVxuIl19