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

function expand(source_616) {
  var options_617 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var reader_618 = new _shiftReader2.default(source_616);
  var stxl_619 = reader_618.read();
  var scope_620 = (0, _scope.freshScope)("top");
  var bindings_621 = new _bindingMap2.default();
  var expander_622 = new _expander2.default({ env: new _env2.default(), store: new _env2.default(), bindings: bindings_621, cwd: options_617.cwd, filename: options_617.filename, modules: new _modules.Modules(), currentScope: [scope_620], transform: options_617.transform ? options_617.transform : function (x_624) {
      return { code: x_624 };
    }, moduleResolver: options_617.moduleResolver, moduleLoader: options_617.moduleLoader });
  var exStxl_623 = expander_622.expand(stxl_619.map(function (s_625) {
    return s_625.addScope(scope_620, bindings_621);
  }));
  return new _terms2.default("Module", { directives: (0, _immutable.List)(), items: exStxl_623 });
}
function parse(source_626) {
  var options_627 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _shiftReducer2.default)(new _parseReducer2.default(), expand(source_626, options_627));
}
function compile(source_628) {
  var options_629 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var ast_630 = parse(source_628, options_629);
  var gen_631 = (0, _shiftCodegen2.default)(ast_630, new _shiftCodegen.FormattedCodeGen());
  return options_629.transform && !options_629.noBabel ? options_629.transform(gen_631, { babelrc: true, filename: options_629.filename }) : { code: gen_631 };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N3ZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBWWdCO1FBV0E7UUFHQTs7QUExQmhCOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ08sU0FBUyxNQUFULENBQWdCLFVBQWhCLEVBQThDO01BQWxCLG9FQUFjLGtCQUFJOztBQUNuRCxNQUFJLGFBQWEsMEJBQVcsVUFBWCxDQUFiLENBRCtDO0FBRW5ELE1BQUksV0FBVyxXQUFXLElBQVgsRUFBWCxDQUYrQztBQUduRCxNQUFJLFlBQVksdUJBQVcsS0FBWCxDQUFaLENBSCtDO0FBSW5ELE1BQUksZUFBZSwwQkFBZixDQUorQztBQUtuRCxNQUFJLGVBQWUsdUJBQWEsRUFBQyxLQUFLLG1CQUFMLEVBQWMsT0FBTyxtQkFBUCxFQUFnQixVQUFVLFlBQVYsRUFBd0IsS0FBSyxZQUFZLEdBQVosRUFBaUIsVUFBVSxZQUFZLFFBQVosRUFBc0IsU0FBUyxzQkFBVCxFQUFzQixjQUFjLENBQUMsU0FBRCxDQUFkLEVBQTJCLFdBQVcsWUFBWSxTQUFaLEdBQXdCLFlBQVksU0FBWixHQUF3QixVQUFVLEtBQVYsRUFBaUI7QUFDeFEsYUFBTyxFQUFDLE1BQU0sS0FBTixFQUFSLENBRHdRO0tBQWpCLEVBRXRQLGdCQUFnQixZQUFZLGNBQVosRUFBNEIsY0FBYyxZQUFZLFlBQVosRUFGMUMsQ0FBZixDQUwrQztBQVFuRCxNQUFJLGFBQWEsYUFBYSxNQUFiLENBQW9CLFNBQVMsR0FBVCxDQUFhO1dBQVMsTUFBTSxRQUFOLENBQWUsU0FBZixFQUEwQixZQUExQjtHQUFULENBQWpDLENBQWIsQ0FSK0M7QUFTbkQsU0FBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsWUFBWSxzQkFBWixFQUFvQixPQUFPLFVBQVAsRUFBeEMsQ0FBUCxDQVRtRDtDQUE5QztBQVdBLFNBQVMsS0FBVCxDQUFlLFVBQWYsRUFBNkM7TUFBbEIsb0VBQWMsa0JBQUk7O0FBQ2xELFNBQU8sNEJBQU8sNEJBQVAsRUFBeUIsT0FBTyxVQUFQLEVBQW1CLFdBQW5CLENBQXpCLENBQVAsQ0FEa0Q7Q0FBN0M7QUFHQSxTQUFTLE9BQVQsQ0FBaUIsVUFBakIsRUFBK0M7TUFBbEIsb0VBQWMsa0JBQUk7O0FBQ3BELE1BQUksVUFBVSxNQUFNLFVBQU4sRUFBa0IsV0FBbEIsQ0FBVixDQURnRDtBQUVwRCxNQUFJLFVBQVUsNEJBQVEsT0FBUixFQUFpQixvQ0FBakIsQ0FBVixDQUZnRDtBQUdwRCxTQUFPLFlBQVksU0FBWixJQUF5QixDQUFDLFlBQVksT0FBWixHQUFzQixZQUFZLFNBQVosQ0FBc0IsT0FBdEIsRUFBK0IsRUFBQyxTQUFTLElBQVQsRUFBZSxVQUFVLFlBQVksUUFBWixFQUF6RCxDQUFoRCxHQUFrSSxFQUFDLE1BQU0sT0FBTixFQUFuSSxDQUg2QztDQUEvQyIsImZpbGUiOiJzd2VldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFkZXIgZnJvbSBcIi4vc2hpZnQtcmVhZGVyXCI7XG5pbXBvcnQgRXhwYW5kZXIgZnJvbSBcIi4vZXhwYW5kZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgcmVkdWNlIGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgUGFyc2VSZWR1Y2VyIGZyb20gXCIuL3BhcnNlLXJlZHVjZXJcIjtcbmltcG9ydCBjb2RlZ2VuLCB7Rm9ybWF0dGVkQ29kZUdlbn0gZnJvbSBcInNoaWZ0LWNvZGVnZW5cIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcC5qc1wiO1xuaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7TW9kdWxlc30gZnJvbSBcIi4vbW9kdWxlc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZChzb3VyY2VfNjE2LCBvcHRpb25zXzYxNyA9IHt9KSB7XG4gIGxldCByZWFkZXJfNjE4ID0gbmV3IFJlYWRlcihzb3VyY2VfNjE2KTtcbiAgbGV0IHN0eGxfNjE5ID0gcmVhZGVyXzYxOC5yZWFkKCk7XG4gIGxldCBzY29wZV82MjAgPSBmcmVzaFNjb3BlKFwidG9wXCIpO1xuICBsZXQgYmluZGluZ3NfNjIxID0gbmV3IEJpbmRpbmdNYXA7XG4gIGxldCBleHBhbmRlcl82MjIgPSBuZXcgRXhwYW5kZXIoe2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBiaW5kaW5nc182MjEsIGN3ZDogb3B0aW9uc182MTcuY3dkLCBmaWxlbmFtZTogb3B0aW9uc182MTcuZmlsZW5hbWUsIG1vZHVsZXM6IG5ldyBNb2R1bGVzLCBjdXJyZW50U2NvcGU6IFtzY29wZV82MjBdLCB0cmFuc2Zvcm06IG9wdGlvbnNfNjE3LnRyYW5zZm9ybSA/IG9wdGlvbnNfNjE3LnRyYW5zZm9ybSA6IGZ1bmN0aW9uICh4XzYyNCkge1xuICAgIHJldHVybiB7Y29kZTogeF82MjR9O1xuICB9LCBtb2R1bGVSZXNvbHZlcjogb3B0aW9uc182MTcubW9kdWxlUmVzb2x2ZXIsIG1vZHVsZUxvYWRlcjogb3B0aW9uc182MTcubW9kdWxlTG9hZGVyfSk7XG4gIGxldCBleFN0eGxfNjIzID0gZXhwYW5kZXJfNjIyLmV4cGFuZChzdHhsXzYxOS5tYXAoc182MjUgPT4gc182MjUuYWRkU2NvcGUoc2NvcGVfNjIwLCBiaW5kaW5nc182MjEpKSk7XG4gIHJldHVybiBuZXcgVGVybShcIk1vZHVsZVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBpdGVtczogZXhTdHhsXzYyM30pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNvdXJjZV82MjYsIG9wdGlvbnNfNjI3ID0ge30pIHtcbiAgcmV0dXJuIHJlZHVjZShuZXcgUGFyc2VSZWR1Y2VyLCBleHBhbmQoc291cmNlXzYyNiwgb3B0aW9uc182MjcpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlKHNvdXJjZV82MjgsIG9wdGlvbnNfNjI5ID0ge30pIHtcbiAgbGV0IGFzdF82MzAgPSBwYXJzZShzb3VyY2VfNjI4LCBvcHRpb25zXzYyOSk7XG4gIGxldCBnZW5fNjMxID0gY29kZWdlbihhc3RfNjMwLCBuZXcgRm9ybWF0dGVkQ29kZUdlbik7XG4gIHJldHVybiBvcHRpb25zXzYyOS50cmFuc2Zvcm0gJiYgIW9wdGlvbnNfNjI5Lm5vQmFiZWwgPyBvcHRpb25zXzYyOS50cmFuc2Zvcm0oZ2VuXzYzMSwge2JhYmVscmM6IHRydWUsIGZpbGVuYW1lOiBvcHRpb25zXzYyOS5maWxlbmFtZX0pIDoge2NvZGU6IGdlbl82MzF9O1xufVxuIl19