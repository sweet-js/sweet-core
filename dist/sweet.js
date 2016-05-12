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

function expand(source_620) {
  var options_621 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var reader_622 = new _shiftReader2.default(source_620);
  var stxl_623 = reader_622.read();
  var scope_624 = (0, _scope.freshScope)("top");
  var bindings_625 = new _bindingMap2.default();
  var expander_626 = new _expander2.default({ env: new _env2.default(), store: new _env2.default(), bindings: bindings_625, cwd: options_621.cwd, filename: options_621.filename, modules: new _modules.Modules(), currentScope: [scope_624], transform: options_621.transform ? options_621.transform : function (x_628) {
      return { code: x_628 };
    }, moduleResolver: options_621.moduleResolver, moduleLoader: options_621.moduleLoader });
  var exStxl_627 = expander_626.expand(stxl_623.map(function (s_629) {
    return s_629.addScope(scope_624, bindings_625);
  }));
  return new _terms2.default("Module", { directives: (0, _immutable.List)(), items: exStxl_627 });
}
function parse(source_630) {
  var options_631 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _shiftReducer2.default)(new _parseReducer2.default(), expand(source_630, options_631));
}
function compile(source_632) {
  var options_633 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var ast_634 = parse(source_632, options_633);
  var gen_635 = (0, _shiftCodegen2.default)(ast_634, new _shiftCodegen.FormattedCodeGen());
  return options_633.transform && !options_633.noBabel ? options_633.transform(gen_635, { babelrc: true, filename: options_633.filename }) : { code: gen_635 };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N3ZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBWWdCLE0sR0FBQSxNO1FBV0EsSyxHQUFBLEs7UUFHQSxPLEdBQUEsTzs7QUExQmhCOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ08sU0FBUyxNQUFULENBQWdCLFVBQWhCLEVBQThDO0FBQUEsTUFBbEIsV0FBa0IseURBQUosRUFBSTs7QUFDbkQsTUFBSSxhQUFhLDBCQUFXLFVBQVgsQ0FBakI7QUFDQSxNQUFJLFdBQVcsV0FBVyxJQUFYLEVBQWY7QUFDQSxNQUFJLFlBQVksdUJBQVcsS0FBWCxDQUFoQjtBQUNBLE1BQUksZUFBZSwwQkFBbkI7QUFDQSxNQUFJLGVBQWUsdUJBQWEsRUFBQyxLQUFLLG1CQUFOLEVBQWUsT0FBTyxtQkFBdEIsRUFBK0IsVUFBVSxZQUF6QyxFQUF1RCxLQUFLLFlBQVksR0FBeEUsRUFBNkUsVUFBVSxZQUFZLFFBQW5HLEVBQTZHLFNBQVMsc0JBQXRILEVBQW1JLGNBQWMsQ0FBQyxTQUFELENBQWpKLEVBQThKLFdBQVcsWUFBWSxTQUFaLEdBQXdCLFlBQVksU0FBcEMsR0FBZ0QsVUFBVSxLQUFWLEVBQWlCO0FBQ3hRLGFBQU8sRUFBQyxNQUFNLEtBQVAsRUFBUDtBQUNELEtBRitCLEVBRTdCLGdCQUFnQixZQUFZLGNBRkMsRUFFZSxjQUFjLFlBQVksWUFGekMsRUFBYixDQUFuQjtBQUdBLE1BQUksYUFBYSxhQUFhLE1BQWIsQ0FBb0IsU0FBUyxHQUFULENBQWE7QUFBQSxXQUFTLE1BQU0sUUFBTixDQUFlLFNBQWYsRUFBMEIsWUFBMUIsQ0FBVDtBQUFBLEdBQWIsQ0FBcEIsQ0FBakI7QUFDQSxTQUFPLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxZQUFZLHNCQUFiLEVBQXFCLE9BQU8sVUFBNUIsRUFBbkIsQ0FBUDtBQUNEO0FBQ00sU0FBUyxLQUFULENBQWUsVUFBZixFQUE2QztBQUFBLE1BQWxCLFdBQWtCLHlEQUFKLEVBQUk7O0FBQ2xELFNBQU8sNEJBQU8sNEJBQVAsRUFBeUIsT0FBTyxVQUFQLEVBQW1CLFdBQW5CLENBQXpCLENBQVA7QUFDRDtBQUNNLFNBQVMsT0FBVCxDQUFpQixVQUFqQixFQUErQztBQUFBLE1BQWxCLFdBQWtCLHlEQUFKLEVBQUk7O0FBQ3BELE1BQUksVUFBVSxNQUFNLFVBQU4sRUFBa0IsV0FBbEIsQ0FBZDtBQUNBLE1BQUksVUFBVSw0QkFBUSxPQUFSLEVBQWlCLG9DQUFqQixDQUFkO0FBQ0EsU0FBTyxZQUFZLFNBQVosSUFBeUIsQ0FBQyxZQUFZLE9BQXRDLEdBQWdELFlBQVksU0FBWixDQUFzQixPQUF0QixFQUErQixFQUFDLFNBQVMsSUFBVixFQUFnQixVQUFVLFlBQVksUUFBdEMsRUFBL0IsQ0FBaEQsR0FBa0ksRUFBQyxNQUFNLE9BQVAsRUFBekk7QUFDRCIsImZpbGUiOiJzd2VldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFkZXIgZnJvbSBcIi4vc2hpZnQtcmVhZGVyXCI7XG5pbXBvcnQgRXhwYW5kZXIgZnJvbSBcIi4vZXhwYW5kZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgcmVkdWNlIGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgUGFyc2VSZWR1Y2VyIGZyb20gXCIuL3BhcnNlLXJlZHVjZXJcIjtcbmltcG9ydCBjb2RlZ2VuLCB7Rm9ybWF0dGVkQ29kZUdlbn0gZnJvbSBcInNoaWZ0LWNvZGVnZW5cIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcC5qc1wiO1xuaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7TW9kdWxlc30gZnJvbSBcIi4vbW9kdWxlc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZChzb3VyY2VfNjIwLCBvcHRpb25zXzYyMSA9IHt9KSB7XG4gIGxldCByZWFkZXJfNjIyID0gbmV3IFJlYWRlcihzb3VyY2VfNjIwKTtcbiAgbGV0IHN0eGxfNjIzID0gcmVhZGVyXzYyMi5yZWFkKCk7XG4gIGxldCBzY29wZV82MjQgPSBmcmVzaFNjb3BlKFwidG9wXCIpO1xuICBsZXQgYmluZGluZ3NfNjI1ID0gbmV3IEJpbmRpbmdNYXA7XG4gIGxldCBleHBhbmRlcl82MjYgPSBuZXcgRXhwYW5kZXIoe2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBiaW5kaW5nc182MjUsIGN3ZDogb3B0aW9uc182MjEuY3dkLCBmaWxlbmFtZTogb3B0aW9uc182MjEuZmlsZW5hbWUsIG1vZHVsZXM6IG5ldyBNb2R1bGVzLCBjdXJyZW50U2NvcGU6IFtzY29wZV82MjRdLCB0cmFuc2Zvcm06IG9wdGlvbnNfNjIxLnRyYW5zZm9ybSA/IG9wdGlvbnNfNjIxLnRyYW5zZm9ybSA6IGZ1bmN0aW9uICh4XzYyOCkge1xuICAgIHJldHVybiB7Y29kZTogeF82Mjh9O1xuICB9LCBtb2R1bGVSZXNvbHZlcjogb3B0aW9uc182MjEubW9kdWxlUmVzb2x2ZXIsIG1vZHVsZUxvYWRlcjogb3B0aW9uc182MjEubW9kdWxlTG9hZGVyfSk7XG4gIGxldCBleFN0eGxfNjI3ID0gZXhwYW5kZXJfNjI2LmV4cGFuZChzdHhsXzYyMy5tYXAoc182MjkgPT4gc182MjkuYWRkU2NvcGUoc2NvcGVfNjI0LCBiaW5kaW5nc182MjUpKSk7XG4gIHJldHVybiBuZXcgVGVybShcIk1vZHVsZVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBpdGVtczogZXhTdHhsXzYyN30pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNvdXJjZV82MzAsIG9wdGlvbnNfNjMxID0ge30pIHtcbiAgcmV0dXJuIHJlZHVjZShuZXcgUGFyc2VSZWR1Y2VyLCBleHBhbmQoc291cmNlXzYzMCwgb3B0aW9uc182MzEpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlKHNvdXJjZV82MzIsIG9wdGlvbnNfNjMzID0ge30pIHtcbiAgbGV0IGFzdF82MzQgPSBwYXJzZShzb3VyY2VfNjMyLCBvcHRpb25zXzYzMyk7XG4gIGxldCBnZW5fNjM1ID0gY29kZWdlbihhc3RfNjM0LCBuZXcgRm9ybWF0dGVkQ29kZUdlbik7XG4gIHJldHVybiBvcHRpb25zXzYzMy50cmFuc2Zvcm0gJiYgIW9wdGlvbnNfNjMzLm5vQmFiZWwgPyBvcHRpb25zXzYzMy50cmFuc2Zvcm0oZ2VuXzYzNSwge2JhYmVscmM6IHRydWUsIGZpbGVuYW1lOiBvcHRpb25zXzYzMy5maWxlbmFtZX0pIDoge2NvZGU6IGdlbl82MzV9O1xufVxuIl19