'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ASTDispatcher {
  constructor(prefix, errorIfMissing) {
    this.errorIfMissing = errorIfMissing;
    this.prefix = prefix;
  }

  dispatch(term) {
    let field = this.prefix + term.type;
    if (typeof this[field] === 'function') {
      return this[field](term);
    } else if (!this.errorIfMissing) {
      return term;
    }
    throw new Error(`Missing implementation for: ${ field }`);
  }
}
exports.default = ASTDispatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hc3QtZGlzcGF0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFlLE1BQU0sYUFBTixDQUFvQjtBQUNqQyxjQUFZLE1BQVosRUFBb0IsY0FBcEIsRUFBb0M7QUFDbEMsU0FBSyxjQUFMLEdBQXNCLGNBQXRCO0FBQ0EsU0FBSyxNQUFMLEdBQWMsTUFBZDtBQUNEOztBQUVELFdBQVMsSUFBVCxFQUFlO0FBQ2IsUUFBSSxRQUFRLEtBQUssTUFBTCxHQUFjLEtBQUssSUFBL0I7QUFDQSxRQUFJLE9BQU8sS0FBSyxLQUFMLENBQVAsS0FBdUIsVUFBM0IsRUFBdUM7QUFDckMsYUFBTyxLQUFLLEtBQUwsRUFBWSxJQUFaLENBQVA7QUFDRCxLQUZELE1BRU8sSUFBSSxDQUFDLEtBQUssY0FBVixFQUEwQjtBQUMvQixhQUFPLElBQVA7QUFDRDtBQUNELFVBQU0sSUFBSSxLQUFKLENBQVcsZ0NBQThCLEtBQU0sR0FBL0MsQ0FBTjtBQUNEO0FBZGdDO2tCQUFkLGEiLCJmaWxlIjoiYXN0LWRpc3BhdGNoZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IocHJlZml4LCBlcnJvcklmTWlzc2luZykge1xuICAgIHRoaXMuZXJyb3JJZk1pc3NpbmcgPSBlcnJvcklmTWlzc2luZztcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgfVxuXG4gIGRpc3BhdGNoKHRlcm0pIHtcbiAgICBsZXQgZmllbGQgPSB0aGlzLnByZWZpeCArIHRlcm0udHlwZTtcbiAgICBpZiAodHlwZW9mIHRoaXNbZmllbGRdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpc1tmaWVsZF0odGVybSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5lcnJvcklmTWlzc2luZykge1xuICAgICAgcmV0dXJuIHRlcm07XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBpbXBsZW1lbnRhdGlvbiBmb3I6ICR7ZmllbGR9YCk7XG4gIH1cbn1cbiJdfQ==