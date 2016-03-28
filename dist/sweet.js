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

function expand(source_622) {
  var options_623 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var reader_624 = new _shiftReader2.default(source_622);
  var stxl_625 = reader_624.read();
  var scope_626 = (0, _scope.freshScope)("top");
  var bindings_627 = new _bindingMap2.default();
  var expander_628 = new _expander2.default({ env: new _env2.default(), store: new _env2.default(), bindings: bindings_627, cwd: options_623.cwd, filename: options_623.filename, modules: new _modules.Modules(), currentScope: [scope_626], transform: options_623.transform ? options_623.transform : function (x_630) {
      return { code: x_630 };
    }, moduleResolver: options_623.moduleResolver, moduleLoader: options_623.moduleLoader });
  var exStxl_629 = expander_628.expand(stxl_625.map(function (s_631) {
    return s_631.addScope(scope_626, bindings_627);
  }));
  return new _terms2.default("Module", { directives: (0, _immutable.List)(), items: exStxl_629 });
}
function parse(source_632) {
  var options_633 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _shiftReducer2.default)(new _parseReducer2.default(), expand(source_632, options_633));
}
function compile(source_634) {
  var options_635 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var ast_636 = parse(source_634, options_635);
  var gen_637 = (0, _shiftCodegen2.default)(ast_636, new _shiftCodegen.FormattedCodeGen());
  return options_635.transform && !options_635.noBabel ? options_635.transform(gen_637, { babelrc: true, filename: options_635.filename }) : { code: gen_637 };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N3ZWV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBWWdCLE1BQU0sR0FBTixNQUFNO1FBV04sS0FBSyxHQUFMLEtBQUs7UUFHTCxPQUFPLEdBQVAsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWRoQixTQUFTLE1BQU0sQ0FBQyxVQUFVLEVBQW9CO01BQWxCLFdBQVcseURBQUcsRUFBRTs7QUFDakQsTUFBSSxVQUFVLEdBQUcsMEJBQVcsVUFBVSxDQUFDLENBQUM7QUFDeEMsTUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2pDLE1BQUksU0FBUyxHQUFHLHVCQUFXLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLE1BQUksWUFBWSxHQUFHLDBCQUFjLENBQUM7QUFDbEMsTUFBSSxZQUFZLEdBQUcsdUJBQWEsRUFBQyxHQUFHLEVBQUUsbUJBQU8sRUFBRSxLQUFLLEVBQUUsbUJBQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxzQkFBVyxFQUFFLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLEdBQUcsVUFBVSxLQUFLLEVBQUU7QUFDeFEsYUFBTyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztLQUN0QixFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsY0FBYyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQztBQUN4RixNQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO1dBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUM7QUFDckcsU0FBTyxvQkFBUyxRQUFRLEVBQUUsRUFBQyxVQUFVLEVBQUUsc0JBQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztDQUNwRTtBQUNNLFNBQVMsS0FBSyxDQUFDLFVBQVUsRUFBb0I7TUFBbEIsV0FBVyx5REFBRyxFQUFFOztBQUNoRCxTQUFPLDRCQUFPLDRCQUFnQixFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztDQUNsRTtBQUNNLFNBQVMsT0FBTyxDQUFDLFVBQVUsRUFBb0I7TUFBbEIsV0FBVyx5REFBRyxFQUFFOztBQUNsRCxNQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzdDLE1BQUksT0FBTyxHQUFHLDRCQUFRLE9BQU8sRUFBRSxvQ0FBb0IsQ0FBQyxDQUFDO0FBQ3JELFNBQU8sV0FBVyxDQUFDLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFDLENBQUMsR0FBRyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUMxSiIsImZpbGUiOiJzd2VldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFkZXIgZnJvbSBcIi4vc2hpZnQtcmVhZGVyXCI7XG5pbXBvcnQgRXhwYW5kZXIgZnJvbSBcIi4vZXhwYW5kZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgcmVkdWNlIGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgUGFyc2VSZWR1Y2VyIGZyb20gXCIuL3BhcnNlLXJlZHVjZXJcIjtcbmltcG9ydCBjb2RlZ2VuLCB7Rm9ybWF0dGVkQ29kZUdlbn0gZnJvbSBcInNoaWZ0LWNvZGVnZW5cIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcC5qc1wiO1xuaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7TW9kdWxlc30gZnJvbSBcIi4vbW9kdWxlc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZChzb3VyY2VfNjIyLCBvcHRpb25zXzYyMyA9IHt9KSB7XG4gIGxldCByZWFkZXJfNjI0ID0gbmV3IFJlYWRlcihzb3VyY2VfNjIyKTtcbiAgbGV0IHN0eGxfNjI1ID0gcmVhZGVyXzYyNC5yZWFkKCk7XG4gIGxldCBzY29wZV82MjYgPSBmcmVzaFNjb3BlKFwidG9wXCIpO1xuICBsZXQgYmluZGluZ3NfNjI3ID0gbmV3IEJpbmRpbmdNYXA7XG4gIGxldCBleHBhbmRlcl82MjggPSBuZXcgRXhwYW5kZXIoe2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBiaW5kaW5nc182MjcsIGN3ZDogb3B0aW9uc182MjMuY3dkLCBmaWxlbmFtZTogb3B0aW9uc182MjMuZmlsZW5hbWUsIG1vZHVsZXM6IG5ldyBNb2R1bGVzLCBjdXJyZW50U2NvcGU6IFtzY29wZV82MjZdLCB0cmFuc2Zvcm06IG9wdGlvbnNfNjIzLnRyYW5zZm9ybSA/IG9wdGlvbnNfNjIzLnRyYW5zZm9ybSA6IGZ1bmN0aW9uICh4XzYzMCkge1xuICAgIHJldHVybiB7Y29kZTogeF82MzB9O1xuICB9LCBtb2R1bGVSZXNvbHZlcjogb3B0aW9uc182MjMubW9kdWxlUmVzb2x2ZXIsIG1vZHVsZUxvYWRlcjogb3B0aW9uc182MjMubW9kdWxlTG9hZGVyfSk7XG4gIGxldCBleFN0eGxfNjI5ID0gZXhwYW5kZXJfNjI4LmV4cGFuZChzdHhsXzYyNS5tYXAoc182MzEgPT4gc182MzEuYWRkU2NvcGUoc2NvcGVfNjI2LCBiaW5kaW5nc182MjcpKSk7XG4gIHJldHVybiBuZXcgVGVybShcIk1vZHVsZVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBpdGVtczogZXhTdHhsXzYyOX0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNvdXJjZV82MzIsIG9wdGlvbnNfNjMzID0ge30pIHtcbiAgcmV0dXJuIHJlZHVjZShuZXcgUGFyc2VSZWR1Y2VyLCBleHBhbmQoc291cmNlXzYzMiwgb3B0aW9uc182MzMpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlKHNvdXJjZV82MzQsIG9wdGlvbnNfNjM1ID0ge30pIHtcbiAgbGV0IGFzdF82MzYgPSBwYXJzZShzb3VyY2VfNjM0LCBvcHRpb25zXzYzNSk7XG4gIGxldCBnZW5fNjM3ID0gY29kZWdlbihhc3RfNjM2LCBuZXcgRm9ybWF0dGVkQ29kZUdlbik7XG4gIHJldHVybiBvcHRpb25zXzYzNS50cmFuc2Zvcm0gJiYgIW9wdGlvbnNfNjM1Lm5vQmFiZWwgPyBvcHRpb25zXzYzNS50cmFuc2Zvcm0oZ2VuXzYzNywge2JhYmVscmM6IHRydWUsIGZpbGVuYW1lOiBvcHRpb25zXzYzNS5maWxlbmFtZX0pIDoge2NvZGU6IGdlbl82Mzd9O1xufVxuIl19