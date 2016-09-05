"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expand = expand;
exports.parse = parse;
exports.compile = compile;

var _immutable = require("immutable");

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _parseReducer = require("./parse-reducer");

var _parseReducer2 = _interopRequireDefault(_parseReducer);

var _shiftCodegen = require("shift-codegen");

var _shiftCodegen2 = _interopRequireDefault(_shiftCodegen);

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

function expand(source) {
  let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  let bindings = new _bindingMap2.default();
  let modules = new _modules.Modules({
    bindings: bindings,
    cwd: options.cwd || process.cwd(),
    filename: options.filename,
    transform: options.transform || _babelCore.transform || function (c) {
      return { code: c };
    },
    moduleResolver: options.moduleResolver || _nodeModuleResolver2.default,
    moduleLoader: options.moduleLoader || _nodeModuleLoader2.default
  });
  let compiledMod = modules.compileEntrypoint(source, options.filename, options.enforcePragma);
  let nativeImports = compiledMod.importEntries.filter(imp => !modules.has(imp.moduleSpecifier.val()));
  return new _terms2.default("Module", {
    directives: (0, _immutable.List)(),
    items: nativeImports.concat(compiledMod.body).concat(compiledMod.exportEntries.interpose(new _terms2.default('EmptyStatement', {})))
  });
}

// not available in browser

function parse(source, options) {
  let includeImports = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  return (0, _shiftReducer2.default)(new _parseReducer2.default({ phase: 0 }), expand(source, options).gen(includeImports));
}

function compile(source) {
  let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  let ast = parse(source, options, options.includeImports);
  let gen = (0, _shiftCodegen2.default)(ast, new _shiftCodegen.FormattedCodeGen());
  return options.transform && !options.noBabel ? options.transform(gen, {
    babelrc: true,
    filename: options.filename
  }) : { code: gen };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zd2VldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQTZCZ0IsTSxHQUFBLE07UUFvQkEsSyxHQUFBLEs7UUFJQSxPLEdBQUEsTzs7QUFwRGhCOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBRUE7Ozs7QUFDQTs7QUFJQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFjTyxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBaUU7QUFBQSxNQUFqQyxPQUFpQyx5REFBVCxFQUFTOztBQUN0RSxNQUFJLFdBQVcsMEJBQWY7QUFDQSxNQUFJLFVBQVUscUJBQVk7QUFDeEIsc0JBRHdCO0FBRXhCLFNBQUssUUFBUSxHQUFSLElBQWUsUUFBUSxHQUFSLEVBRkk7QUFHeEIsY0FBVSxRQUFRLFFBSE07QUFJeEIsZUFBVyxRQUFRLFNBQVIsNEJBQXVDLFVBQVMsQ0FBVCxFQUFZO0FBQzVELGFBQU8sRUFBQyxNQUFNLENBQVAsRUFBUDtBQUNELEtBTnVCO0FBT3hCLG9CQUFnQixRQUFRLGNBQVIsZ0NBUFE7QUFReEIsa0JBQWMsUUFBUSxZQUFSO0FBUlUsR0FBWixDQUFkO0FBVUEsTUFBSSxjQUFjLFFBQVEsaUJBQVIsQ0FBMEIsTUFBMUIsRUFBa0MsUUFBUSxRQUExQyxFQUFvRCxRQUFRLGFBQTVELENBQWxCO0FBQ0EsTUFBSSxnQkFBZ0IsWUFBWSxhQUFaLENBQTBCLE1BQTFCLENBQWlDLE9BQU8sQ0FBQyxRQUFRLEdBQVIsQ0FBWSxJQUFJLGVBQUosQ0FBb0IsR0FBcEIsRUFBWixDQUF6QyxDQUFwQjtBQUNBLFNBQU8sb0JBQVMsUUFBVCxFQUFtQjtBQUN4QixnQkFBWSxzQkFEWTtBQUV4QixXQUFPLGNBQWMsTUFBZCxDQUFxQixZQUFZLElBQWpDLEVBQXVDLE1BQXZDLENBQThDLFlBQVksYUFBWixDQUEwQixTQUExQixDQUFvQyxvQkFBUyxnQkFBVCxFQUEyQixFQUEzQixDQUFwQyxDQUE5QztBQUZpQixHQUFuQixDQUFQO0FBSUQ7O0FBcENEOztBQXNDTyxTQUFTLEtBQVQsQ0FBZSxNQUFmLEVBQStCLE9BQS9CLEVBQTJGO0FBQUEsTUFBckMsY0FBcUMseURBQVgsSUFBVzs7QUFDaEcsU0FBTyw0QkFBTywyQkFBaUIsRUFBQyxPQUFPLENBQVIsRUFBakIsQ0FBUCxFQUFxQyxPQUFPLE1BQVAsRUFBZSxPQUFmLEVBQXdCLEdBQXhCLENBQTRCLGNBQTVCLENBQXJDLENBQVA7QUFDRDs7QUFFTSxTQUFTLE9BQVQsQ0FBaUIsTUFBakIsRUFBeUU7QUFBQSxNQUF4QyxPQUF3Qyx5REFBaEIsRUFBZ0I7O0FBQzlFLE1BQUksTUFBTSxNQUFNLE1BQU4sRUFBYyxPQUFkLEVBQXVCLFFBQVEsY0FBL0IsQ0FBVjtBQUNBLE1BQUksTUFBTSw0QkFBUSxHQUFSLEVBQWEsb0NBQWIsQ0FBVjtBQUNBLFNBQU8sUUFBUSxTQUFSLElBQXNCLENBQUMsUUFBUSxPQUEvQixHQUEwQyxRQUFRLFNBQVIsQ0FBa0IsR0FBbEIsRUFBdUI7QUFDdEUsYUFBUyxJQUQ2RDtBQUV0RSxjQUFVLFFBQVE7QUFGb0QsR0FBdkIsQ0FBMUMsR0FHRixFQUFFLE1BQU0sR0FBUixFQUhMO0FBSUQiLCJmaWxlIjoic3dlZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xuaW1wb3J0IHsgTGlzdCB9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCByZWR1Y2UgZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCBQYXJzZVJlZHVjZXIgZnJvbSBcIi4vcGFyc2UtcmVkdWNlclwiO1xuaW1wb3J0IGNvZGVnZW4sIHsgRm9ybWF0dGVkQ29kZUdlbiB9IGZyb20gXCJzaGlmdC1jb2RlZ2VuXCI7XG5cbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5cbmltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQgeyBNb2R1bGVzIH0gZnJvbSAnLi9tb2R1bGVzJztcblxuLy8gbm90IGF2YWlsYWJsZSBpbiBicm93c2VyXG5cbmltcG9ydCB7IHRyYW5zZm9ybSBhcyBiYWJlbFRyYW5zZm9ybSB9IGZyb20gXCJiYWJlbC1jb3JlXCI7XG5pbXBvcnQgbm9kZVJlc29sdmVyIGZyb20gXCIuL25vZGUtbW9kdWxlLXJlc29sdmVyXCI7XG5pbXBvcnQgbm9kZUxvYWRlciBmcm9tIFwiLi9ub2RlLW1vZHVsZS1sb2FkZXJcIjtcblxudHlwZSBDb2RlT3V0cHV0ID0ge1xuICBjb2RlOiBzdHJpbmdcbn1cblxudHlwZSBTd2VldE9wdGlvbnMgPSB7XG4gIGluY2x1ZGVJbXBvcnRzPzogYm9vbGVhbjtcbiAgY3dkPzogc3RyaW5nO1xuICBlbmZvcmNlUHJhZ21hPzogYm9vbGVhbjtcbiAgZmlsZW5hbWU/OiBzdHJpbmc7XG4gIHRyYW5zZm9ybT86IChzOiBzdHJpbmcpID0+IHsgY29kZTogc3RyaW5nIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHBhbmQoc291cmNlOiBzdHJpbmcsIG9wdGlvbnM6IFN3ZWV0T3B0aW9ucyA9IHt9KTogYW55IHtcbiAgbGV0IGJpbmRpbmdzID0gbmV3IEJpbmRpbmdNYXAoKTtcbiAgbGV0IG1vZHVsZXMgPSBuZXcgTW9kdWxlcyh7XG4gICAgYmluZGluZ3MsXG4gICAgY3dkOiBvcHRpb25zLmN3ZCB8fCBwcm9jZXNzLmN3ZCgpLFxuICAgIGZpbGVuYW1lOiBvcHRpb25zLmZpbGVuYW1lLFxuICAgIHRyYW5zZm9ybTogb3B0aW9ucy50cmFuc2Zvcm0gfHwgYmFiZWxUcmFuc2Zvcm0gfHwgZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIHtjb2RlOiBjfTtcbiAgICB9LFxuICAgIG1vZHVsZVJlc29sdmVyOiBvcHRpb25zLm1vZHVsZVJlc29sdmVyIHx8IG5vZGVSZXNvbHZlcixcbiAgICBtb2R1bGVMb2FkZXI6IG9wdGlvbnMubW9kdWxlTG9hZGVyIHx8IG5vZGVMb2FkZXJcbiAgfSk7XG4gIGxldCBjb21waWxlZE1vZCA9IG1vZHVsZXMuY29tcGlsZUVudHJ5cG9pbnQoc291cmNlLCBvcHRpb25zLmZpbGVuYW1lLCBvcHRpb25zLmVuZm9yY2VQcmFnbWEpO1xuICBsZXQgbmF0aXZlSW1wb3J0cyA9IGNvbXBpbGVkTW9kLmltcG9ydEVudHJpZXMuZmlsdGVyKGltcCA9PiAhbW9kdWxlcy5oYXMoaW1wLm1vZHVsZVNwZWNpZmllci52YWwoKSkpO1xuICByZXR1cm4gbmV3IFRlcm0oXCJNb2R1bGVcIiwge1xuICAgIGRpcmVjdGl2ZXM6IExpc3QoKSxcbiAgICBpdGVtczogbmF0aXZlSW1wb3J0cy5jb25jYXQoY29tcGlsZWRNb2QuYm9keSkuY29uY2F0KGNvbXBpbGVkTW9kLmV4cG9ydEVudHJpZXMuaW50ZXJwb3NlKG5ldyBUZXJtKCdFbXB0eVN0YXRlbWVudCcsIHt9KSkpXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc291cmNlOiBzdHJpbmcsIG9wdGlvbnM6IFN3ZWV0T3B0aW9ucywgaW5jbHVkZUltcG9ydHM6IGJvb2xlYW4gPSB0cnVlKTogYW55IHtcbiAgcmV0dXJuIHJlZHVjZShuZXcgUGFyc2VSZWR1Y2VyKHtwaGFzZTogMH0pLCBleHBhbmQoc291cmNlLCBvcHRpb25zKS5nZW4oaW5jbHVkZUltcG9ydHMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGUoc291cmNlOiBzdHJpbmcsIG9wdGlvbnM6IFN3ZWV0T3B0aW9ucyA9IHt9KTogQ29kZU91dHB1dCB7XG4gIGxldCBhc3QgPSBwYXJzZShzb3VyY2UsIG9wdGlvbnMsIG9wdGlvbnMuaW5jbHVkZUltcG9ydHMpO1xuICBsZXQgZ2VuID0gY29kZWdlbihhc3QsIG5ldyBGb3JtYXR0ZWRDb2RlR2VuKCkpO1xuICByZXR1cm4gb3B0aW9ucy50cmFuc2Zvcm0gJiYgKCFvcHRpb25zLm5vQmFiZWwpID8gb3B0aW9ucy50cmFuc2Zvcm0oZ2VuLCB7XG4gICAgYmFiZWxyYzogdHJ1ZSxcbiAgICBmaWxlbmFtZTogb3B0aW9ucy5maWxlbmFtZVxuICB9KSA6IHsgY29kZTogZ2VuIH07XG59XG4iXX0=