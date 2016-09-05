"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freshScope = freshScope;
exports.Scope = Scope;

var _symbol = require("./symbol");

let scopeIndex = 0;

function freshScope() {
  let name = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex++;
  return (0, _symbol.Symbol)(name + "_" + scopeIndex);
}

function Scope(name) {
  return (0, _symbol.Symbol)(name);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY29wZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUlnQixVLEdBQUEsVTtRQUtBLEssR0FBQSxLOztBQVRoQjs7QUFFQSxJQUFJLGFBQWEsQ0FBakI7O0FBRU8sU0FBUyxVQUFULEdBQW9DO0FBQUEsTUFBaEIsSUFBZ0IseURBQVQsT0FBUzs7QUFDekM7QUFDQSxTQUFPLG9CQUFPLE9BQU8sR0FBUCxHQUFhLFVBQXBCLENBQVA7QUFDRDs7QUFFTSxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQXFCO0FBQzFCLFNBQU8sb0JBQU8sSUFBUCxDQUFQO0FBQ0QiLCJmaWxlIjoic2NvcGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTeW1ib2wgfSBmcm9tIFwiLi9zeW1ib2xcIjtcblxubGV0IHNjb3BlSW5kZXggPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gZnJlc2hTY29wZShuYW1lID0gXCJzY29wZVwiKSB7XG4gIHNjb3BlSW5kZXgrKztcbiAgcmV0dXJuIFN5bWJvbChuYW1lICsgXCJfXCIgKyBzY29wZUluZGV4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlKG5hbWUpIHtcbiAgcmV0dXJuIFN5bWJvbChuYW1lKTtcbn1cbiJdfQ==