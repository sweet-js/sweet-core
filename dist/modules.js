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

var Module_359 = function () {
  function Module_359(moduleSpecifier_361, importEntries_362, exportEntries_363, body_364) {
    _classCallCheck(this, Module_359);

    this.moduleSpecifier = moduleSpecifier_361;
    this.importEntries = importEntries_362;
    this.exportEntries = exportEntries_363;
    this.body = body_364;
  }

  _createClass(Module_359, [{
    key: "visit",
    value: function visit(context_365) {
      this.exportEntries.forEach(function (ex) {
        if ((0, _terms.isSyntaxDeclaration)(ex.declaration) || (0, _terms.isSyntaxrecDeclaration)(ex.declaration)) {
          ex.declaration.declarators.forEach((0, _loadSyntax2.default)(_.__, context_365, context_365.store));
        }
      });
      return context_365.store;
    }
  }]);

  return Module_359;
}();

var pragmaRegep_360 = /^\s*#\w*/;

var Modules = exports.Modules = function () {
  function Modules() {
    _classCallCheck(this, Modules);

    this.loadedModules = new Map();
  }

  _createClass(Modules, [{
    key: "load",
    value: function load(modulePath_366, context_367) {
      var _this = this;

      var path_368 = context_367.moduleResolver(modulePath_366, context_367.cwd);
      if (!this.loadedModules.has(path_368)) {
        var modStr = context_367.moduleLoader(path_368);
        if (!pragmaRegep_360.test(modStr)) {
          this.loadedModules.set(path_368, new Module_359(path_368, (0, _immutable.List)(), (0, _immutable.List)(), (0, _immutable.List)()));
        } else {
          (function () {
            var reader = new _shiftReader2.default(modStr);
            var stxl = reader.read().slice(3);
            var tokenExpander = new _tokenExpander2.default(_.merge(context_367, { env: new _env2.default(), store: new _env2.default(), bindings: new _bindingMap2.default() }));
            var terms = tokenExpander.expand(stxl);
            var importEntries = [];
            var exportEntries = [];
            terms.forEach(function (t) {
              _.cond([[_terms.isImport, function (t) {
                return importEntries.push(t);
              }], [_terms.isExport, function (t) {
                return exportEntries.push(t);
              }]])(t);
            });
            _this.loadedModules.set(path_368, new Module_359(path_368, (0, _immutable.List)(importEntries), (0, _immutable.List)(exportEntries), terms));
          })();
        }
      }
      return this.loadedModules.get(path_368);
    }
  }]);

  return Modules;
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21vZHVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFhOztBQUNiOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0lBQ007QUFDSixXQURJLFVBQ0osQ0FBWSxtQkFBWixFQUFpQyxpQkFBakMsRUFBb0QsaUJBQXBELEVBQXVFLFFBQXZFLEVBQWlGOzBCQUQ3RSxZQUM2RTs7QUFDL0UsU0FBSyxlQUFMLEdBQXVCLG1CQUF2QixDQUQrRTtBQUUvRSxTQUFLLGFBQUwsR0FBcUIsaUJBQXJCLENBRitFO0FBRy9FLFNBQUssYUFBTCxHQUFxQixpQkFBckIsQ0FIK0U7QUFJL0UsU0FBSyxJQUFMLEdBQVksUUFBWixDQUorRTtHQUFqRjs7ZUFESTs7MEJBT0UsYUFBYTtBQUNqQixXQUFLLGFBQUwsQ0FBbUIsT0FBbkIsQ0FBMkIsY0FBTTtBQUMvQixZQUFJLGdDQUFvQixHQUFHLFdBQUgsQ0FBcEIsSUFBdUMsbUNBQXVCLEdBQUcsV0FBSCxDQUE5RCxFQUErRTtBQUNqRixhQUFHLFdBQUgsQ0FBZSxXQUFmLENBQTJCLE9BQTNCLENBQW1DLDBCQUFXLEVBQUUsRUFBRixFQUFNLFdBQWpCLEVBQThCLFlBQVksS0FBWixDQUFqRSxFQURpRjtTQUFuRjtPQUR5QixDQUEzQixDQURpQjtBQU1qQixhQUFPLFlBQVksS0FBWixDQU5VOzs7O1NBUGY7OztBQWdCTixJQUFNLGtCQUFrQixVQUFsQjs7SUFDTztBQUNYLFdBRFcsT0FDWCxHQUFjOzBCQURILFNBQ0c7O0FBQ1osU0FBSyxhQUFMLEdBQXFCLElBQUksR0FBSixFQUFyQixDQURZO0dBQWQ7O2VBRFc7O3lCQUlOLGdCQUFnQixhQUFhOzs7QUFDaEMsVUFBSSxXQUFXLFlBQVksY0FBWixDQUEyQixjQUEzQixFQUEyQyxZQUFZLEdBQVosQ0FBdEQsQ0FENEI7QUFFaEMsVUFBSSxDQUFDLEtBQUssYUFBTCxDQUFtQixHQUFuQixDQUF1QixRQUF2QixDQUFELEVBQW1DO0FBQ3JDLFlBQUksU0FBUyxZQUFZLFlBQVosQ0FBeUIsUUFBekIsQ0FBVCxDQURpQztBQUVyQyxZQUFJLENBQUMsZ0JBQWdCLElBQWhCLENBQXFCLE1BQXJCLENBQUQsRUFBK0I7QUFDakMsZUFBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLFFBQXZCLEVBQWlDLElBQUksVUFBSixDQUFlLFFBQWYsRUFBeUIsc0JBQXpCLEVBQWlDLHNCQUFqQyxFQUF5QyxzQkFBekMsQ0FBakMsRUFEaUM7U0FBbkMsTUFFTzs7QUFDTCxnQkFBSSxTQUFTLDBCQUFXLE1BQVgsQ0FBVDtBQUNKLGdCQUFJLE9BQU8sT0FBTyxJQUFQLEdBQWMsS0FBZCxDQUFvQixDQUFwQixDQUFQO0FBQ0osZ0JBQUksZ0JBQWdCLDRCQUFrQixFQUFFLEtBQUYsQ0FBUSxXQUFSLEVBQXFCLEVBQUMsS0FBSyxtQkFBTCxFQUFjLE9BQU8sbUJBQVAsRUFBZ0IsVUFBVSwwQkFBVixFQUFwRCxDQUFsQixDQUFoQjtBQUNKLGdCQUFJLFFBQVEsY0FBYyxNQUFkLENBQXFCLElBQXJCLENBQVI7QUFDSixnQkFBSSxnQkFBZ0IsRUFBaEI7QUFDSixnQkFBSSxnQkFBZ0IsRUFBaEI7QUFDSixrQkFBTSxPQUFOLENBQWMsYUFBSztBQUNqQixnQkFBRSxJQUFGLENBQU8sQ0FBQyxrQkFBVzt1QkFBSyxjQUFjLElBQWQsQ0FBbUIsQ0FBbkI7ZUFBTCxDQUFaLEVBQXlDLGtCQUFXO3VCQUFLLGNBQWMsSUFBZCxDQUFtQixDQUFuQjtlQUFMLENBQXBELENBQVAsRUFBeUYsQ0FBekYsRUFEaUI7YUFBTCxDQUFkO0FBR0Esa0JBQUssYUFBTCxDQUFtQixHQUFuQixDQUF1QixRQUF2QixFQUFpQyxJQUFJLFVBQUosQ0FBZSxRQUFmLEVBQXlCLHFCQUFLLGFBQUwsQ0FBekIsRUFBOEMscUJBQUssYUFBTCxDQUE5QyxFQUFtRSxLQUFuRSxDQUFqQztlQVZLO1NBRlA7T0FGRjtBQWlCQSxhQUFPLEtBQUssYUFBTCxDQUFtQixHQUFuQixDQUF1QixRQUF2QixDQUFQLENBbkJnQzs7OztTQUp2QiIsImZpbGUiOiJtb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgRW52IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRva2VuRXhwYW5kZXIgZnJvbSBcIi4vdG9rZW4tZXhwYW5kZXIuanNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IGxvYWRTeW50YXggZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmNsYXNzIE1vZHVsZV8zNTkge1xuICBjb25zdHJ1Y3Rvcihtb2R1bGVTcGVjaWZpZXJfMzYxLCBpbXBvcnRFbnRyaWVzXzM2MiwgZXhwb3J0RW50cmllc18zNjMsIGJvZHlfMzY0KSB7XG4gICAgdGhpcy5tb2R1bGVTcGVjaWZpZXIgPSBtb2R1bGVTcGVjaWZpZXJfMzYxO1xuICAgIHRoaXMuaW1wb3J0RW50cmllcyA9IGltcG9ydEVudHJpZXNfMzYyO1xuICAgIHRoaXMuZXhwb3J0RW50cmllcyA9IGV4cG9ydEVudHJpZXNfMzYzO1xuICAgIHRoaXMuYm9keSA9IGJvZHlfMzY0O1xuICB9XG4gIHZpc2l0KGNvbnRleHRfMzY1KSB7XG4gICAgdGhpcy5leHBvcnRFbnRyaWVzLmZvckVhY2goZXggPT4ge1xuICAgICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24oZXguZGVjbGFyYXRpb24pIHx8IGlzU3ludGF4cmVjRGVjbGFyYXRpb24oZXguZGVjbGFyYXRpb24pKSB7XG4gICAgICAgIGV4LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2gobG9hZFN5bnRheChfLl9fLCBjb250ZXh0XzM2NSwgY29udGV4dF8zNjUuc3RvcmUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29udGV4dF8zNjUuc3RvcmU7XG4gIH1cbn1cbmNvbnN0IHByYWdtYVJlZ2VwXzM2MCA9IC9eXFxzKiNcXHcqLztcbmV4cG9ydCBjbGFzcyBNb2R1bGVzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sb2FkZWRNb2R1bGVzID0gbmV3IE1hcDtcbiAgfVxuICBsb2FkKG1vZHVsZVBhdGhfMzY2LCBjb250ZXh0XzM2Nykge1xuICAgIGxldCBwYXRoXzM2OCA9IGNvbnRleHRfMzY3Lm1vZHVsZVJlc29sdmVyKG1vZHVsZVBhdGhfMzY2LCBjb250ZXh0XzM2Ny5jd2QpO1xuICAgIGlmICghdGhpcy5sb2FkZWRNb2R1bGVzLmhhcyhwYXRoXzM2OCkpIHtcbiAgICAgIGxldCBtb2RTdHIgPSBjb250ZXh0XzM2Ny5tb2R1bGVMb2FkZXIocGF0aF8zNjgpO1xuICAgICAgaWYgKCFwcmFnbWFSZWdlcF8zNjAudGVzdChtb2RTdHIpKSB7XG4gICAgICAgIHRoaXMubG9hZGVkTW9kdWxlcy5zZXQocGF0aF8zNjgsIG5ldyBNb2R1bGVfMzU5KHBhdGhfMzY4LCBMaXN0KCksIExpc3QoKSwgTGlzdCgpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcmVhZGVyID0gbmV3IFJlYWRlcihtb2RTdHIpO1xuICAgICAgICBsZXQgc3R4bCA9IHJlYWRlci5yZWFkKCkuc2xpY2UoMyk7XG4gICAgICAgIGxldCB0b2tlbkV4cGFuZGVyID0gbmV3IFRva2VuRXhwYW5kZXIoXy5tZXJnZShjb250ZXh0XzM2Nywge2VudjogbmV3IEVudiwgc3RvcmU6IG5ldyBFbnYsIGJpbmRpbmdzOiBuZXcgQmluZGluZ01hcH0pKTtcbiAgICAgICAgbGV0IHRlcm1zID0gdG9rZW5FeHBhbmRlci5leHBhbmQoc3R4bCk7XG4gICAgICAgIGxldCBpbXBvcnRFbnRyaWVzID0gW107XG4gICAgICAgIGxldCBleHBvcnRFbnRyaWVzID0gW107XG4gICAgICAgIHRlcm1zLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgXy5jb25kKFtbaXNJbXBvcnQsIHQgPT4gaW1wb3J0RW50cmllcy5wdXNoKHQpXSwgW2lzRXhwb3J0LCB0ID0+IGV4cG9ydEVudHJpZXMucHVzaCh0KV1dKSh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubG9hZGVkTW9kdWxlcy5zZXQocGF0aF8zNjgsIG5ldyBNb2R1bGVfMzU5KHBhdGhfMzY4LCBMaXN0KGltcG9ydEVudHJpZXMpLCBMaXN0KGV4cG9ydEVudHJpZXMpLCB0ZXJtcykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sb2FkZWRNb2R1bGVzLmdldChwYXRoXzM2OCk7XG4gIH1cbn1cbiJdfQ==