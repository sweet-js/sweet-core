"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = undefined;
exports.default = compile;

var _es6ModuleLoader = require("es6-module-loader");

var _modules = require("./modules");

class SweetLoader extends _es6ModuleLoader.Loader {
  constructor(debugRegistry_757) {
    super();
    this.debugRegistry = debugRegistry_757;
    this.compiledSource = new Map();
  }
  normalize(name_758) {
    return name_758;
  }
  locate(_ref) {
    let name = _ref.name;
    let metadata = _ref.metadata;

    return name;
  }
  fetch(_ref2) {
    let name = _ref2.name;
    let address = _ref2.address;
    let metadata = _ref2.metadata;

    return this.debugRegistry[address];
  }
  translate(_ref3) {
    let name = _ref3.name;
    let address = _ref3.address;
    let source = _ref3.source;
    let metadata = _ref3.metadata;

    this.compiledSource.set(name, source);
    return source;
  }
  instantiate(_ref4) {
    let name = _ref4.name;
    let address = _ref4.address;
    let source = _ref4.source;
    let metadata = _ref4.metadata;

    let self_759 = this;
    return { deps: [], execute: function execute() {
        return self_759.newModule({ a: "a" });
      }
    };
  }
}
function load_756(entryPath_760, registry_761) {
  let l_762 = new SweetLoader(registry_761);
  return l_762.import(entryPath_760);
}
function compile(entryPath_763, registry_764) {
  let l_765 = new SweetLoader(registry_764);
  return l_765.import(entryPath_763).then(function (mod_766) {
    return l_765.compiledSource.get(l_765.normalize(entryPath_763));
  });
}
exports.load = load_756;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N3ZWV0LWxvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7a0JBZ0N3QixPOztBQWhDeEI7O0FBQ0E7O0FBQ0EsTUFBTSxXQUFOLGlDQUFpQztBQUMvQixjQUFZLGlCQUFaLEVBQStCO0FBQzdCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLGlCQUFyQjtBQUNBLFNBQUssY0FBTCxHQUFzQixJQUFJLEdBQUosRUFBdEI7QUFDRDtBQUNELFlBQVUsUUFBVixFQUFvQjtBQUNsQixXQUFPLFFBQVA7QUFDRDtBQUNELGVBQXlCO0FBQUEsUUFBakIsSUFBaUIsUUFBakIsSUFBaUI7QUFBQSxRQUFYLFFBQVcsUUFBWCxRQUFXOztBQUN2QixXQUFPLElBQVA7QUFDRDtBQUNELGVBQWlDO0FBQUEsUUFBMUIsSUFBMEIsU0FBMUIsSUFBMEI7QUFBQSxRQUFwQixPQUFvQixTQUFwQixPQUFvQjtBQUFBLFFBQVgsUUFBVyxTQUFYLFFBQVc7O0FBQy9CLFdBQU8sS0FBSyxhQUFMLENBQW1CLE9BQW5CLENBQVA7QUFDRDtBQUNELG1CQUE2QztBQUFBLFFBQWxDLElBQWtDLFNBQWxDLElBQWtDO0FBQUEsUUFBNUIsT0FBNEIsU0FBNUIsT0FBNEI7QUFBQSxRQUFuQixNQUFtQixTQUFuQixNQUFtQjtBQUFBLFFBQVgsUUFBVyxTQUFYLFFBQVc7O0FBQzNDLFNBQUssY0FBTCxDQUFvQixHQUFwQixDQUF3QixJQUF4QixFQUE4QixNQUE5QjtBQUNBLFdBQU8sTUFBUDtBQUNEO0FBQ0QscUJBQStDO0FBQUEsUUFBbEMsSUFBa0MsU0FBbEMsSUFBa0M7QUFBQSxRQUE1QixPQUE0QixTQUE1QixPQUE0QjtBQUFBLFFBQW5CLE1BQW1CLFNBQW5CLE1BQW1CO0FBQUEsUUFBWCxRQUFXLFNBQVgsUUFBVzs7QUFDN0MsUUFBSSxXQUFXLElBQWY7QUFDQSxXQUFPLEVBQUMsTUFBTSxFQUFQLEVBQVcsT0FBWCxxQkFBcUI7QUFDMUIsZUFBTyxTQUFTLFNBQVQsQ0FBbUIsRUFBQyxHQUFHLEdBQUosRUFBbkIsQ0FBUDtBQUNEO0FBRk0sS0FBUDtBQUdEO0FBeEI4QjtBQTBCakMsU0FBUyxRQUFULENBQWtCLGFBQWxCLEVBQWlDLFlBQWpDLEVBQStDO0FBQzdDLE1BQUksUUFBUSxJQUFJLFdBQUosQ0FBZ0IsWUFBaEIsQ0FBWjtBQUNBLFNBQU8sTUFBTSxNQUFOLENBQWEsYUFBYixDQUFQO0FBQ0Q7QUFDYyxTQUFTLE9BQVQsQ0FBaUIsYUFBakIsRUFBZ0MsWUFBaEMsRUFBOEM7QUFDM0QsTUFBSSxRQUFRLElBQUksV0FBSixDQUFnQixZQUFoQixDQUFaO0FBQ0EsU0FBTyxNQUFNLE1BQU4sQ0FBYSxhQUFiLEVBQTRCLElBQTVCLENBQWlDLFVBQVUsT0FBVixFQUFtQjtBQUN6RCxXQUFPLE1BQU0sY0FBTixDQUFxQixHQUFyQixDQUF5QixNQUFNLFNBQU4sQ0FBZ0IsYUFBaEIsQ0FBekIsQ0FBUDtBQUNELEdBRk0sQ0FBUDtBQUdEO1FBQ21CLEksR0FBWixRIiwiZmlsZSI6InN3ZWV0LWxvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TG9hZGVyfSBmcm9tIFwiZXM2LW1vZHVsZS1sb2FkZXJcIjtcbmltcG9ydCB7TW9kdWxlc30gZnJvbSBcIi4vbW9kdWxlc1wiO1xuY2xhc3MgU3dlZXRMb2FkZXIgZXh0ZW5kcyBMb2FkZXIge1xuICBjb25zdHJ1Y3RvcihkZWJ1Z1JlZ2lzdHJ5Xzc1Nykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5kZWJ1Z1JlZ2lzdHJ5ID0gZGVidWdSZWdpc3RyeV83NTc7XG4gICAgdGhpcy5jb21waWxlZFNvdXJjZSA9IG5ldyBNYXA7XG4gIH1cbiAgbm9ybWFsaXplKG5hbWVfNzU4KSB7XG4gICAgcmV0dXJuIG5hbWVfNzU4O1xuICB9XG4gIGxvY2F0ZSh7bmFtZSwgbWV0YWRhdGF9KSB7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbiAgZmV0Y2goe25hbWUsIGFkZHJlc3MsIG1ldGFkYXRhfSkge1xuICAgIHJldHVybiB0aGlzLmRlYnVnUmVnaXN0cnlbYWRkcmVzc107XG4gIH1cbiAgdHJhbnNsYXRlKHtuYW1lLCBhZGRyZXNzLCBzb3VyY2UsIG1ldGFkYXRhfSkge1xuICAgIHRoaXMuY29tcGlsZWRTb3VyY2Uuc2V0KG5hbWUsIHNvdXJjZSk7XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuICBpbnN0YW50aWF0ZSh7bmFtZSwgYWRkcmVzcywgc291cmNlLCBtZXRhZGF0YX0pIHtcbiAgICBsZXQgc2VsZl83NTkgPSB0aGlzO1xuICAgIHJldHVybiB7ZGVwczogW10sIGV4ZWN1dGUoKSB7XG4gICAgICByZXR1cm4gc2VsZl83NTkubmV3TW9kdWxlKHthOiBcImFcIn0pO1xuICAgIH19O1xuICB9XG59XG5mdW5jdGlvbiBsb2FkXzc1NihlbnRyeVBhdGhfNzYwLCByZWdpc3RyeV83NjEpIHtcbiAgbGV0IGxfNzYyID0gbmV3IFN3ZWV0TG9hZGVyKHJlZ2lzdHJ5Xzc2MSk7XG4gIHJldHVybiBsXzc2Mi5pbXBvcnQoZW50cnlQYXRoXzc2MCk7XG59XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb21waWxlKGVudHJ5UGF0aF83NjMsIHJlZ2lzdHJ5Xzc2NCkge1xuICBsZXQgbF83NjUgPSBuZXcgU3dlZXRMb2FkZXIocmVnaXN0cnlfNzY0KTtcbiAgcmV0dXJuIGxfNzY1LmltcG9ydChlbnRyeVBhdGhfNzYzKS50aGVuKGZ1bmN0aW9uIChtb2RfNzY2KSB7XG4gICAgcmV0dXJuIGxfNzY1LmNvbXBpbGVkU291cmNlLmdldChsXzc2NS5ub3JtYWxpemUoZW50cnlQYXRoXzc2MykpO1xuICB9KTtcbn1cbmV4cG9ydCB7bG9hZF83NTYgYXMgbG9hZH0iXX0=