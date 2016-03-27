"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modules = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var Module_385 = function () {
  function Module_385(moduleSpecifier_387, importEntries_388, exportEntries_389, body_390) {
    _classCallCheck(this, Module_385);

    this.moduleSpecifier = moduleSpecifier_387;
    this.importEntries = importEntries_388;
    this.exportEntries = exportEntries_389;
    this.body = body_390;
  }

  _createClass(Module_385, [{
    key: "visit",
    value: function visit(context_391) {
      this.exportEntries.forEach(function (ex_392) {
        if ((0, _terms.isSyntaxDeclaration)(ex_392.declaration) || (0, _terms.isSyntaxrecDeclaration)(ex_392.declaration)) {
          ex_392.declaration.declarators.forEach((0, _loadSyntax2.default)(_.__, context_391, context_391.store));
        }
      });
      return context_391.store;
    }
  }]);

  return Module_385;
}();

var pragmaRegep_386 = /^\s*#\w*/;

var Modules = exports.Modules = function () {
  function Modules() {
    _classCallCheck(this, Modules);

    this.loadedModules = new Map();
  }

  _createClass(Modules, [{
    key: "load",
    value: function load(modulePath_393, context_394) {
      var _this = this;

      var path_395 = context_394.moduleResolver(modulePath_393, context_394.cwd);
      if (!this.loadedModules.has(path_395)) {
        var modStr = context_394.moduleLoader(path_395);
        if (!pragmaRegep_386.test(modStr)) {
          this.loadedModules.set(path_395, new Module_385(path_395, (0, _immutable.List)(), (0, _immutable.List)(), (0, _immutable.List)()));
        } else {
          (function () {
            var reader = new _shiftReader2.default(modStr);
            var stxl = reader.read().slice(3);
            var tokenExpander = new _tokenExpander2.default(_.merge(context_394, { env: new _env2.default(), store: new _env2.default(), bindings: new _bindingMap2.default() }));
            var terms = tokenExpander.expand(stxl);
            var importEntries = [];
            var exportEntries = [];
            terms.forEach(function (t_396) {
              _.cond([[_terms.isImport, function (t_397) {
                return importEntries.push(t_397);
              }], [_terms.isExport, function (t_398) {
                return exportEntries.push(t_398);
              }]])(t_396);
            });
            _this.loadedModules.set(path_395, new Module_385(path_395, (0, _immutable.List)(importEntries), (0, _immutable.List)(exportEntries), terms));
          })();
        }
      }
      return this.loadedModules.get(path_395);
    }
  }]);

  return Modules;
}();
//# sourceMappingURL=data:application/json;base64,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SyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLFFBQXZCLENBQVAsQ0FuQmdDOzs7O1NBSnZCIiwiZmlsZSI6Im1vZHVsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgUmVhZGVyIGZyb20gXCIuL3NoaWZ0LXJlYWRlclwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgVG9rZW5FeHBhbmRlciBmcm9tIFwiLi90b2tlbi1leHBhbmRlci5qc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXAuanNcIjtcbmltcG9ydCBUZXJtLCB7aXNFT0YsIGlzQmluZGluZ0lkZW50aWZpZXIsIGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24sIGlzRnVuY3Rpb25UZXJtLCBpc0Z1bmN0aW9uV2l0aE5hbWUsIGlzU3ludGF4RGVjbGFyYXRpb24sIGlzU3ludGF4cmVjRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBpc0ltcG9ydCwgaXNFeHBvcnR9IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQgbG9hZFN5bnRheCBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuY2xhc3MgTW9kdWxlXzM4NSB7XG4gIGNvbnN0cnVjdG9yKG1vZHVsZVNwZWNpZmllcl8zODcsIGltcG9ydEVudHJpZXNfMzg4LCBleHBvcnRFbnRyaWVzXzM4OSwgYm9keV8zOTApIHtcbiAgICB0aGlzLm1vZHVsZVNwZWNpZmllciA9IG1vZHVsZVNwZWNpZmllcl8zODc7XG4gICAgdGhpcy5pbXBvcnRFbnRyaWVzID0gaW1wb3J0RW50cmllc18zODg7XG4gICAgdGhpcy5leHBvcnRFbnRyaWVzID0gZXhwb3J0RW50cmllc18zODk7XG4gICAgdGhpcy5ib2R5ID0gYm9keV8zOTA7XG4gIH1cbiAgdmlzaXQoY29udGV4dF8zOTEpIHtcbiAgICB0aGlzLmV4cG9ydEVudHJpZXMuZm9yRWFjaChleF8zOTIgPT4ge1xuICAgICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24oZXhfMzkyLmRlY2xhcmF0aW9uKSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKGV4XzM5Mi5kZWNsYXJhdGlvbikpIHtcbiAgICAgICAgZXhfMzkyLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2gobG9hZFN5bnRheChfLl9fLCBjb250ZXh0XzM5MSwgY29udGV4dF8zOTEuc3RvcmUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29udGV4dF8zOTEuc3RvcmU7XG4gIH1cbn1cbmNvbnN0IHByYWdtYVJlZ2VwXzM4NiA9IC9eXFxzKiNcXHcqLztcbmV4cG9ydCBjbGFzcyBNb2R1bGVzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sb2FkZWRNb2R1bGVzID0gbmV3IE1hcDtcbiAgfVxuICBsb2FkKG1vZHVsZVBhdGhfMzkzLCBjb250ZXh0XzM5NCkge1xuICAgIGxldCBwYXRoXzM5NSA9IGNvbnRleHRfMzk0Lm1vZHVsZVJlc29sdmVyKG1vZHVsZVBhdGhfMzkzLCBjb250ZXh0XzM5NC5jd2QpO1xuICAgIGlmICghdGhpcy5sb2FkZWRNb2R1bGVzLmhhcyhwYXRoXzM5NSkpIHtcbiAgICAgIGxldCBtb2RTdHIgPSBjb250ZXh0XzM5NC5tb2R1bGVMb2FkZXIocGF0aF8zOTUpO1xuICAgICAgaWYgKCFwcmFnbWFSZWdlcF8zODYudGVzdChtb2RTdHIpKSB7XG4gICAgICAgIHRoaXMubG9hZGVkTW9kdWxlcy5zZXQocGF0aF8zOTUsIG5ldyBNb2R1bGVfMzg1KHBhdGhfMzk1LCBMaXN0KCksIExpc3QoKSwgTGlzdCgpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcmVhZGVyID0gbmV3IFJlYWRlcihtb2RTdHIpO1xuICAgICAgICBsZXQgc3R4bCA9IHJlYWRlci5yZWFkKCkuc2xpY2UoMyk7XG4gICAgICAgIGxldCB0b2tlbkV4cGFuZGVyID0gbmV3IFRva2VuRXhwYW5kZXIoXy5tZXJnZShjb250ZXh0XzM5NCwge2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBuZXcgQmluZGluZ01hcH0pKTtcbiAgICAgICAgbGV0IHRlcm1zID0gdG9rZW5FeHBhbmRlci5leHBhbmQoc3R4bCk7XG4gICAgICAgIGxldCBpbXBvcnRFbnRyaWVzID0gW107XG4gICAgICAgIGxldCBleHBvcnRFbnRyaWVzID0gW107XG4gICAgICAgIHRlcm1zLmZvckVhY2godF8zOTYgPT4ge1xuICAgICAgICAgIF8uY29uZChbW2lzSW1wb3J0LCB0XzM5NyA9PiBpbXBvcnRFbnRyaWVzLnB1c2godF8zOTcpXSwgW2lzRXhwb3J0LCB0XzM5OCA9PiBleHBvcnRFbnRyaWVzLnB1c2godF8zOTgpXV0pKHRfMzk2KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubG9hZGVkTW9kdWxlcy5zZXQocGF0aF8zOTUsIG5ldyBNb2R1bGVfMzg1KHBhdGhfMzk1LCBMaXN0KGltcG9ydEVudHJpZXMpLCBMaXN0KGV4cG9ydEVudHJpZXMpLCB0ZXJtcykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sb2FkZWRNb2R1bGVzLmdldChwYXRoXzM5NSk7XG4gIH1cbn1cbiJdfQ==