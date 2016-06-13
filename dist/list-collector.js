"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

let EMPTY_337;
class ListCollector {
  constructor(x_338) {
    this.value = x_338;
  }
  static empty() {
    return EMPTY_337;
  }
  concat(a_339) {
    return new ListCollector(this.value.concat(a_339.value));
  }
  extract() {
    return this.value;
  }
}
exports.default = ListCollector;
EMPTY_337 = new ListCollector((0, _immutable.List)());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2xpc3QtY29sbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBLElBQUksU0FBSjtBQUNlLE1BQU0sYUFBTixDQUFvQjtBQUNqQyxjQUFZLEtBQVosRUFBbUI7QUFDakIsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNEO0FBQ0QsU0FBTyxLQUFQLEdBQWU7QUFDYixXQUFPLFNBQVA7QUFDRDtBQUNELFNBQU8sS0FBUCxFQUFjO0FBQ1osV0FBTyxJQUFJLGFBQUosQ0FBa0IsS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixNQUFNLEtBQXhCLENBQWxCLENBQVA7QUFDRDtBQUNELFlBQVU7QUFDUixXQUFPLEtBQUssS0FBWjtBQUNEO0FBWmdDO2tCQUFkLGE7QUFjckIsWUFBWSxJQUFJLGFBQUosQ0FBa0Isc0JBQWxCLENBQVoiLCJmaWxlIjoibGlzdC1jb2xsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmxldCBFTVBUWV8zMzc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaXN0Q29sbGVjdG9yIHtcbiAgY29uc3RydWN0b3IoeF8zMzgpIHtcbiAgICB0aGlzLnZhbHVlID0geF8zMzg7XG4gIH1cbiAgc3RhdGljIGVtcHR5KCkge1xuICAgIHJldHVybiBFTVBUWV8zMzc7XG4gIH1cbiAgY29uY2F0KGFfMzM5KSB7XG4gICAgcmV0dXJuIG5ldyBMaXN0Q29sbGVjdG9yKHRoaXMudmFsdWUuY29uY2F0KGFfMzM5LnZhbHVlKSk7XG4gIH1cbiAgZXh0cmFjdCgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuRU1QVFlfMzM3ID0gbmV3IExpc3RDb2xsZWN0b3IoTGlzdCgpKTtcbiJdfQ==