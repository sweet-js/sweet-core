"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modules = undefined;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _immutable = require("immutable");

var _env = require("./env");

var _env2 = _interopRequireDefault(_env);

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _tokenExpander = require("./token-expander.js");

var _tokenExpander2 = _interopRequireDefault(_tokenExpander);

var _bindingMap = require("./binding-map.js");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _loadSyntax = require("./load-syntax");

var _loadSyntax2 = _interopRequireDefault(_loadSyntax);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module_391 = (function () {
  function Module_391(moduleSpecifier_393, importEntries_394, exportEntries_395, body_396) {
    _classCallCheck(this, Module_391);

    this.moduleSpecifier = moduleSpecifier_393;
    this.importEntries = importEntries_394;
    this.exportEntries = exportEntries_395;
    this.body = body_396;
  }

  _createClass(Module_391, [{
    key: "visit",
    value: function visit(context_397) {
      this.exportEntries.forEach(function (ex_398) {
        if ((0, _terms.isSyntaxDeclaration)(ex_398.declaration) || (0, _terms.isSyntaxrecDeclaration)(ex_398.declaration)) {
          ex_398.declaration.declarators.forEach((0, _loadSyntax2.default)(_.__, context_397, context_397.store));
        }
      });
      return context_397.store;
    }
  }]);

  return Module_391;
})();

var pragmaRegep_392 = /^\s*#\w*/;

var Modules = exports.Modules = (function () {
  function Modules() {
    _classCallCheck(this, Modules);

    this.loadedModules = new Map();
  }

  _createClass(Modules, [{
    key: "load",
    value: function load(modulePath_399, context_400) {
      var _this = this;

      var path_401 = context_400.moduleResolver(modulePath_399, context_400.cwd);
      if (!this.loadedModules.has(path_401)) {
        var modStr = context_400.moduleLoader(path_401);
        if (!pragmaRegep_392.test(modStr)) {
          this.loadedModules.set(path_401, new Module_391(path_401, (0, _immutable.List)(), (0, _immutable.List)(), (0, _immutable.List)()));
        } else {
          (function () {
            var reader = new _shiftReader2.default(modStr);
            var stxl = reader.read().slice(3);
            var tokenExpander = new _tokenExpander2.default(_.merge(context_400, { env: new _env2.default(), store: new _env2.default(), bindings: new _bindingMap2.default() }));
            var terms = tokenExpander.expand(stxl);
            var importEntries = [];
            var exportEntries = [];
            terms.forEach(function (t_402) {
              _.cond([[_terms.isImport, function (t_403) {
                return importEntries.push(t_403);
              }], [_terms.isExport, function (t_404) {
                return exportEntries.push(t_404);
              }]])(t_402);
            });
            _this.loadedModules.set(path_401, new Module_391(path_401, (0, _immutable.List)(importEntries), (0, _immutable.List)(exportEntries), terms));
          })();
        }
      }
      return this.loadedModules.get(path_401);
    }
  }]);

  return Modules;
})();
//# sourceMappingURL=data:application/json;base64,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QUFDLElBQUksQ0FBQyxLQUFLLENBQUM7ZUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2pILENBQUMsQ0FBQztBQUNILGtCQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBRSxxQkFBSyxhQUFhLENBQUMsRUFBRSxxQkFBSyxhQUFhLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDOztTQUM3RztPQUNGO0FBQ0QsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN6Qzs7O1NBeEJVLE9BQU8iLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IEVudiBmcm9tIFwiLi9lbnZcIjtcbmltcG9ydCBSZWFkZXIgZnJvbSBcIi4vc2hpZnQtcmVhZGVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCBUb2tlbkV4cGFuZGVyIGZyb20gXCIuL3Rva2VuLWV4cGFuZGVyLmpzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcC5qc1wiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNTeW50YXhyZWNEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCBsb2FkU3ludGF4IGZyb20gXCIuL2xvYWQtc3ludGF4XCI7XG5jbGFzcyBNb2R1bGVfMzkxIHtcbiAgY29uc3RydWN0b3IobW9kdWxlU3BlY2lmaWVyXzM5MywgaW1wb3J0RW50cmllc18zOTQsIGV4cG9ydEVudHJpZXNfMzk1LCBib2R5XzM5Nikge1xuICAgIHRoaXMubW9kdWxlU3BlY2lmaWVyID0gbW9kdWxlU3BlY2lmaWVyXzM5MztcbiAgICB0aGlzLmltcG9ydEVudHJpZXMgPSBpbXBvcnRFbnRyaWVzXzM5NDtcbiAgICB0aGlzLmV4cG9ydEVudHJpZXMgPSBleHBvcnRFbnRyaWVzXzM5NTtcbiAgICB0aGlzLmJvZHkgPSBib2R5XzM5NjtcbiAgfVxuICB2aXNpdChjb250ZXh0XzM5Nykge1xuICAgIHRoaXMuZXhwb3J0RW50cmllcy5mb3JFYWNoKGV4XzM5OCA9PiB7XG4gICAgICBpZiAoaXNTeW50YXhEZWNsYXJhdGlvbihleF8zOTguZGVjbGFyYXRpb24pIHx8IGlzU3ludGF4cmVjRGVjbGFyYXRpb24oZXhfMzk4LmRlY2xhcmF0aW9uKSkge1xuICAgICAgICBleF8zOTguZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChsb2FkU3ludGF4KF8uX18sIGNvbnRleHRfMzk3LCBjb250ZXh0XzM5Ny5zdG9yZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb250ZXh0XzM5Ny5zdG9yZTtcbiAgfVxufVxuY29uc3QgcHJhZ21hUmVnZXBfMzkyID0gL15cXHMqI1xcdyovO1xuZXhwb3J0IGNsYXNzIE1vZHVsZXMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmxvYWRlZE1vZHVsZXMgPSBuZXcgTWFwO1xuICB9XG4gIGxvYWQobW9kdWxlUGF0aF8zOTksIGNvbnRleHRfNDAwKSB7XG4gICAgbGV0IHBhdGhfNDAxID0gY29udGV4dF80MDAubW9kdWxlUmVzb2x2ZXIobW9kdWxlUGF0aF8zOTksIGNvbnRleHRfNDAwLmN3ZCk7XG4gICAgaWYgKCF0aGlzLmxvYWRlZE1vZHVsZXMuaGFzKHBhdGhfNDAxKSkge1xuICAgICAgbGV0IG1vZFN0ciA9IGNvbnRleHRfNDAwLm1vZHVsZUxvYWRlcihwYXRoXzQwMSk7XG4gICAgICBpZiAoIXByYWdtYVJlZ2VwXzM5Mi50ZXN0KG1vZFN0cikpIHtcbiAgICAgICAgdGhpcy5sb2FkZWRNb2R1bGVzLnNldChwYXRoXzQwMSwgbmV3IE1vZHVsZV8zOTEocGF0aF80MDEsIExpc3QoKSwgTGlzdCgpLCBMaXN0KCkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCByZWFkZXIgPSBuZXcgUmVhZGVyKG1vZFN0cik7XG4gICAgICAgIGxldCBzdHhsID0gcmVhZGVyLnJlYWQoKS5zbGljZSgzKTtcbiAgICAgICAgbGV0IHRva2VuRXhwYW5kZXIgPSBuZXcgVG9rZW5FeHBhbmRlcihfLm1lcmdlKGNvbnRleHRfNDAwLCB7ZW52OiBuZXcgRW52LCBzdG9yZTogbmV3IEVudiwgYmluZGluZ3M6IG5ldyBCaW5kaW5nTWFwfSkpO1xuICAgICAgICBsZXQgdGVybXMgPSB0b2tlbkV4cGFuZGVyLmV4cGFuZChzdHhsKTtcbiAgICAgICAgbGV0IGltcG9ydEVudHJpZXMgPSBbXTtcbiAgICAgICAgbGV0IGV4cG9ydEVudHJpZXMgPSBbXTtcbiAgICAgICAgdGVybXMuZm9yRWFjaCh0XzQwMiA9PiB7XG4gICAgICAgICAgXy5jb25kKFtbaXNJbXBvcnQsIHRfNDAzID0+IGltcG9ydEVudHJpZXMucHVzaCh0XzQwMyldLCBbaXNFeHBvcnQsIHRfNDA0ID0+IGV4cG9ydEVudHJpZXMucHVzaCh0XzQwNCldXSkodF80MDIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sb2FkZWRNb2R1bGVzLnNldChwYXRoXzQwMSwgbmV3IE1vZHVsZV8zOTEocGF0aF80MDEsIExpc3QoaW1wb3J0RW50cmllcyksIExpc3QoZXhwb3J0RW50cmllcyksIHRlcm1zKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxvYWRlZE1vZHVsZXMuZ2V0KHBhdGhfNDAxKTtcbiAgfVxufVxuIl19