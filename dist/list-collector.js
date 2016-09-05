'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

let EMPTY;
class ListCollector {
  constructor(x) {
    this.value = x;
  }
  static empty() {
    return EMPTY;
  }
  concat(a) {
    return new ListCollector(this.value.concat(a.value));
  }
  extract() {
    return this.value;
  }
}
exports.default = ListCollector;
EMPTY = new ListCollector((0, _immutable.List)());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0LWNvbGxlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFQSxJQUFJLEtBQUo7QUFDZSxNQUFNLGFBQU4sQ0FBb0I7QUFDakMsY0FBWSxDQUFaLEVBQWU7QUFBRSxTQUFLLEtBQUwsR0FBYSxDQUFiO0FBQWlCO0FBQ2xDLFNBQU8sS0FBUCxHQUFlO0FBQUUsV0FBTyxLQUFQO0FBQWU7QUFDaEMsU0FBTyxDQUFQLEVBQVU7QUFBRSxXQUFPLElBQUksYUFBSixDQUFrQixLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLEVBQUUsS0FBcEIsQ0FBbEIsQ0FBUDtBQUF1RDtBQUNuRSxZQUFVO0FBQUUsV0FBTyxLQUFLLEtBQVo7QUFBb0I7QUFKQztrQkFBZCxhO0FBTXJCLFFBQVEsSUFBSSxhQUFKLENBQWtCLHNCQUFsQixDQUFSIiwiZmlsZSI6Imxpc3QtY29sbGVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGlzdCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5cbmxldCBFTVBUWTtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpc3RDb2xsZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcih4KSB7IHRoaXMudmFsdWUgPSB4OyB9XG4gIHN0YXRpYyBlbXB0eSgpIHsgcmV0dXJuIEVNUFRZOyB9XG4gIGNvbmNhdChhKSB7IHJldHVybiBuZXcgTGlzdENvbGxlY3Rvcih0aGlzLnZhbHVlLmNvbmNhdChhLnZhbHVlKSk7IH1cbiAgZXh0cmFjdCgpIHsgcmV0dXJuIHRoaXMudmFsdWU7IH1cbn1cbkVNUFRZID0gbmV3IExpc3RDb2xsZWN0b3IoTGlzdCgpKTtcbiJdfQ==