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

var _babelCore = require("babel-core");

var _nodeModuleResolver = require("./node-module-resolver");

var _nodeModuleResolver2 = _interopRequireDefault(_nodeModuleResolver);

var _nodeModuleLoader = require("./node-module-loader");

var _nodeModuleLoader2 = _interopRequireDefault(_nodeModuleLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function expand(source_620) {
  var options_621 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var reader_622 = new _shiftReader2.default(source_620);
  var stxl_623 = reader_622.read();
  var scope_624 = (0, _scope.freshScope)("top");
  var bindings_625 = new _bindingMap2.default();
  var expander_626 = new _expander2.default({ env: new _env2.default(), store: new _env2.default(), bindings: bindings_625, cwd: options_621.cwd || process.cwd(), filename: options_621.filename, modules: new _modules.Modules(), currentScope: [scope_624], transform: options_621.transform || _babelCore.transform || function (a_628) {
      return { code: a_628 };
    }, moduleResolver: options_621.moduleResolver || _nodeModuleResolver2.default, moduleLoader: options_621.moduleLoader || _nodeModuleLoader2.default });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N3ZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBZWdCLE1BQU0sR0FBTixNQUFNO1FBU04sS0FBSyxHQUFMLEtBQUs7UUFHTCxPQUFPLEdBQVAsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFaaEIsU0FBUyxNQUFNLENBQUMsVUFBVSxFQUFvQjtNQUFsQixXQUFXLHlEQUFHLEVBQUU7O0FBQ2pELE1BQUksVUFBVSxHQUFHLDBCQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3hDLE1BQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqQyxNQUFJLFNBQVMsR0FBRyx1QkFBVyxLQUFLLENBQUMsQ0FBQztBQUNsQyxNQUFJLFlBQVksR0FBRywwQkFBYyxDQUFDO0FBQ2xDLE1BQUksWUFBWSxHQUFHLHVCQUFhLEVBQUMsR0FBRyxFQUFFLG1CQUFPLEVBQUUsS0FBSyxFQUFFLG1CQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsV0FBVyxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLHNCQUFXLEVBQUUsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLHdCQUFrQixJQUFLLFVBQUEsS0FBSzthQUFLLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQztLQUFDLEFBQUMsRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDLGNBQWMsZ0NBQWdCLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxZQUFZLDhCQUFjLEVBQUMsQ0FBQyxDQUFDO0FBQ3BaLE1BQUksVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7R0FBQSxDQUFDLENBQUMsQ0FBQztBQUNyRyxTQUFPLG9CQUFTLFFBQVEsRUFBRSxFQUFDLFVBQVUsRUFBRSxzQkFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO0NBQ3BFO0FBQ00sU0FBUyxLQUFLLENBQUMsVUFBVSxFQUFvQjtNQUFsQixXQUFXLHlEQUFHLEVBQUU7O0FBQ2hELFNBQU8sNEJBQU8sNEJBQWdCLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0NBQ2xFO0FBQ00sU0FBUyxPQUFPLENBQUMsVUFBVSxFQUFvQjtNQUFsQixXQUFXLHlEQUFHLEVBQUU7O0FBQ2xELE1BQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDN0MsTUFBSSxPQUFPLEdBQUcsNEJBQVEsT0FBTyxFQUFFLG9DQUFvQixDQUFDLENBQUM7QUFDckQsU0FBTyxXQUFXLENBQUMsU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxHQUFHLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQzFKIiwiZmlsZSI6InN3ZWV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCBFeHBhbmRlciBmcm9tIFwiLi9leHBhbmRlclwiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IEVudiBmcm9tIFwiLi9lbnZcIjtcbmltcG9ydCByZWR1Y2UgZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCBQYXJzZVJlZHVjZXIgZnJvbSBcIi4vcGFyc2UtcmVkdWNlclwiO1xuaW1wb3J0IGNvZGVnZW4sIHtGb3JtYXR0ZWRDb2RlR2VufSBmcm9tIFwic2hpZnQtY29kZWdlblwiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtNb2R1bGVzfSBmcm9tIFwiLi9tb2R1bGVzXCI7XG5pbXBvcnQge3RyYW5zZm9ybSBhcyBiYWJlbFRyYW5zZm9ybX0gZnJvbSBcImJhYmVsLWNvcmVcIjtcbmltcG9ydCBub2RlUmVzb2x2ZXIgZnJvbSBcIi4vbm9kZS1tb2R1bGUtcmVzb2x2ZXJcIjtcbmltcG9ydCBub2RlTG9hZGVyIGZyb20gXCIuL25vZGUtbW9kdWxlLWxvYWRlclwiO1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZChzb3VyY2VfNjIwLCBvcHRpb25zXzYyMSA9IHt9KSB7XG4gIGxldCByZWFkZXJfNjIyID0gbmV3IFJlYWRlcihzb3VyY2VfNjIwKTtcbiAgbGV0IHN0eGxfNjIzID0gcmVhZGVyXzYyMi5yZWFkKCk7XG4gIGxldCBzY29wZV82MjQgPSBmcmVzaFNjb3BlKFwidG9wXCIpO1xuICBsZXQgYmluZGluZ3NfNjI1ID0gbmV3IEJpbmRpbmdNYXA7XG4gIGxldCBleHBhbmRlcl82MjYgPSBuZXcgRXhwYW5kZXIoe2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBiaW5kaW5nc182MjUsIGN3ZDogb3B0aW9uc182MjEuY3dkIHx8IHByb2Nlc3MuY3dkKCksIGZpbGVuYW1lOiBvcHRpb25zXzYyMS5maWxlbmFtZSwgbW9kdWxlczogbmV3IE1vZHVsZXMsIGN1cnJlbnRTY29wZTogW3Njb3BlXzYyNF0sIHRyYW5zZm9ybTogb3B0aW9uc182MjEudHJhbnNmb3JtIHx8IGJhYmVsVHJhbnNmb3JtIHx8IChhXzYyOCA9PiAoe2NvZGU6IGFfNjI4fSkpLCBtb2R1bGVSZXNvbHZlcjogb3B0aW9uc182MjEubW9kdWxlUmVzb2x2ZXIgfHwgbm9kZVJlc29sdmVyLCBtb2R1bGVMb2FkZXI6IG9wdGlvbnNfNjIxLm1vZHVsZUxvYWRlciB8fCBub2RlTG9hZGVyfSk7XG4gIGxldCBleFN0eGxfNjI3ID0gZXhwYW5kZXJfNjI2LmV4cGFuZChzdHhsXzYyMy5tYXAoc182MjkgPT4gc182MjkuYWRkU2NvcGUoc2NvcGVfNjI0LCBiaW5kaW5nc182MjUpKSk7XG4gIHJldHVybiBuZXcgVGVybShcIk1vZHVsZVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBpdGVtczogZXhTdHhsXzYyN30pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNvdXJjZV82MzAsIG9wdGlvbnNfNjMxID0ge30pIHtcbiAgcmV0dXJuIHJlZHVjZShuZXcgUGFyc2VSZWR1Y2VyLCBleHBhbmQoc291cmNlXzYzMCwgb3B0aW9uc182MzEpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlKHNvdXJjZV82MzIsIG9wdGlvbnNfNjMzID0ge30pIHtcbiAgbGV0IGFzdF82MzQgPSBwYXJzZShzb3VyY2VfNjMyLCBvcHRpb25zXzYzMyk7XG4gIGxldCBnZW5fNjM1ID0gY29kZWdlbihhc3RfNjM0LCBuZXcgRm9ybWF0dGVkQ29kZUdlbik7XG4gIHJldHVybiBvcHRpb25zXzYzMy50cmFuc2Zvcm0gJiYgIW9wdGlvbnNfNjMzLm5vQmFiZWwgPyBvcHRpb25zXzYzMy50cmFuc2Zvcm0oZ2VuXzYzNSwge2JhYmVscmM6IHRydWUsIGZpbGVuYW1lOiBvcHRpb25zXzYzMy5maWxlbmFtZX0pIDoge2NvZGU6IGdlbl82MzV9O1xufVxuIl19