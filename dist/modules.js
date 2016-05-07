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

var Module_388 = function () {
  function Module_388(moduleSpecifier_390, importEntries_391, exportEntries_392, body_393) {
    _classCallCheck(this, Module_388);

    this.moduleSpecifier = moduleSpecifier_390;
    this.importEntries = importEntries_391;
    this.exportEntries = exportEntries_392;
    this.body = body_393;
  }

  _createClass(Module_388, [{
    key: "visit",
    value: function visit(context_394) {
      this.exportEntries.forEach(function (ex_395) {
        if ((0, _terms.isSyntaxDeclaration)(ex_395.declaration) || (0, _terms.isSyntaxrecDeclaration)(ex_395.declaration)) {
          ex_395.declaration.declarators.forEach((0, _loadSyntax2.default)(_.__, context_394, context_394.store));
        }
      });
      return context_394.store;
    }
  }]);

  return Module_388;
}();

var pragmaRegep_389 = /^\s*#\w*/;

var Modules = exports.Modules = function () {
  function Modules() {
    _classCallCheck(this, Modules);

    this.loadedModules = new Map();
  }

  _createClass(Modules, [{
    key: "load",
    value: function load(modulePath_396, context_397) {
      var _this = this;

      var path_398 = context_397.moduleResolver(modulePath_396, context_397.cwd);
      if (!this.loadedModules.has(path_398)) {
        var modStr = context_397.moduleLoader(path_398);
        if (!pragmaRegep_389.test(modStr)) {
          this.loadedModules.set(path_398, new Module_388(path_398, (0, _immutable.List)(), (0, _immutable.List)(), (0, _immutable.List)()));
        } else {
          (function () {
            var reader = new _shiftReader2.default(modStr);
            var stxl = reader.read().slice(3);
            var tokenExpander = new _tokenExpander2.default(_.merge(context_397, { env: new _env2.default(), store: new _env2.default(), bindings: new _bindingMap2.default() }));
            var terms = tokenExpander.expand(stxl);
            var importEntries = [];
            var exportEntries = [];
            terms.forEach(function (t_399) {
              _.cond([[_terms.isImport, function (t_400) {
                return importEntries.push(t_400);
              }], [_terms.isExport, function (t_401) {
                return exportEntries.push(t_401);
              }]])(t_399);
            });
            _this.loadedModules.set(path_398, new Module_388(path_398, (0, _immutable.List)(importEntries), (0, _immutable.List)(exportEntries), terms));
          })();
        }
      }
      return this.loadedModules.get(path_398);
    }
  }]);

  return Modules;
}();
//# sourceMappingURL=data:application/json;base64,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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgUmVhZGVyIGZyb20gXCIuL3NoaWZ0LXJlYWRlclwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgVG9rZW5FeHBhbmRlciBmcm9tIFwiLi90b2tlbi1leHBhbmRlci5qc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXAuanNcIjtcbmltcG9ydCBUZXJtLCB7aXNFT0YsIGlzQmluZGluZ0lkZW50aWZpZXIsIGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24sIGlzRnVuY3Rpb25UZXJtLCBpc0Z1bmN0aW9uV2l0aE5hbWUsIGlzU3ludGF4RGVjbGFyYXRpb24sIGlzU3ludGF4cmVjRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBpc0ltcG9ydCwgaXNFeHBvcnR9IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQgbG9hZFN5bnRheCBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuY2xhc3MgTW9kdWxlXzM4OCB7XG4gIGNvbnN0cnVjdG9yKG1vZHVsZVNwZWNpZmllcl8zOTAsIGltcG9ydEVudHJpZXNfMzkxLCBleHBvcnRFbnRyaWVzXzM5MiwgYm9keV8zOTMpIHtcbiAgICB0aGlzLm1vZHVsZVNwZWNpZmllciA9IG1vZHVsZVNwZWNpZmllcl8zOTA7XG4gICAgdGhpcy5pbXBvcnRFbnRyaWVzID0gaW1wb3J0RW50cmllc18zOTE7XG4gICAgdGhpcy5leHBvcnRFbnRyaWVzID0gZXhwb3J0RW50cmllc18zOTI7XG4gICAgdGhpcy5ib2R5ID0gYm9keV8zOTM7XG4gIH1cbiAgdmlzaXQoY29udGV4dF8zOTQpIHtcbiAgICB0aGlzLmV4cG9ydEVudHJpZXMuZm9yRWFjaChleF8zOTUgPT4ge1xuICAgICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24oZXhfMzk1LmRlY2xhcmF0aW9uKSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKGV4XzM5NS5kZWNsYXJhdGlvbikpIHtcbiAgICAgICAgZXhfMzk1LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2gobG9hZFN5bnRheChfLl9fLCBjb250ZXh0XzM5NCwgY29udGV4dF8zOTQuc3RvcmUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29udGV4dF8zOTQuc3RvcmU7XG4gIH1cbn1cbmNvbnN0IHByYWdtYVJlZ2VwXzM4OSA9IC9eXFxzKiNcXHcqLztcbmV4cG9ydCBjbGFzcyBNb2R1bGVzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sb2FkZWRNb2R1bGVzID0gbmV3IE1hcDtcbiAgfVxuICBsb2FkKG1vZHVsZVBhdGhfMzk2LCBjb250ZXh0XzM5Nykge1xuICAgIGxldCBwYXRoXzM5OCA9IGNvbnRleHRfMzk3Lm1vZHVsZVJlc29sdmVyKG1vZHVsZVBhdGhfMzk2LCBjb250ZXh0XzM5Ny5jd2QpO1xuICAgIGlmICghdGhpcy5sb2FkZWRNb2R1bGVzLmhhcyhwYXRoXzM5OCkpIHtcbiAgICAgIGxldCBtb2RTdHIgPSBjb250ZXh0XzM5Ny5tb2R1bGVMb2FkZXIocGF0aF8zOTgpO1xuICAgICAgaWYgKCFwcmFnbWFSZWdlcF8zODkudGVzdChtb2RTdHIpKSB7XG4gICAgICAgIHRoaXMubG9hZGVkTW9kdWxlcy5zZXQocGF0aF8zOTgsIG5ldyBNb2R1bGVfMzg4KHBhdGhfMzk4LCBMaXN0KCksIExpc3QoKSwgTGlzdCgpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcmVhZGVyID0gbmV3IFJlYWRlcihtb2RTdHIpO1xuICAgICAgICBsZXQgc3R4bCA9IHJlYWRlci5yZWFkKCkuc2xpY2UoMyk7XG4gICAgICAgIGxldCB0b2tlbkV4cGFuZGVyID0gbmV3IFRva2VuRXhwYW5kZXIoXy5tZXJnZShjb250ZXh0XzM5Nywge2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBuZXcgQmluZGluZ01hcH0pKTtcbiAgICAgICAgbGV0IHRlcm1zID0gdG9rZW5FeHBhbmRlci5leHBhbmQoc3R4bCk7XG4gICAgICAgIGxldCBpbXBvcnRFbnRyaWVzID0gW107XG4gICAgICAgIGxldCBleHBvcnRFbnRyaWVzID0gW107XG4gICAgICAgIHRlcm1zLmZvckVhY2godF8zOTkgPT4ge1xuICAgICAgICAgIF8uY29uZChbW2lzSW1wb3J0LCB0XzQwMCA9PiBpbXBvcnRFbnRyaWVzLnB1c2godF80MDApXSwgW2lzRXhwb3J0LCB0XzQwMSA9PiBleHBvcnRFbnRyaWVzLnB1c2godF80MDEpXV0pKHRfMzk5KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubG9hZGVkTW9kdWxlcy5zZXQocGF0aF8zOTgsIG5ldyBNb2R1bGVfMzg4KHBhdGhfMzk4LCBMaXN0KGltcG9ydEVudHJpZXMpLCBMaXN0KGV4cG9ydEVudHJpZXMpLCB0ZXJtcykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sb2FkZWRNb2R1bGVzLmdldChwYXRoXzM5OCk7XG4gIH1cbn1cbiJdfQ==