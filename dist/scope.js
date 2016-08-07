"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scope = exports.freshScope = undefined;

var _errors = require("./errors");

var _symbol = require("./symbol");

let scopeIndex_619 = 0;
function freshScope_620() {
  let name_622 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex_619++;
  return (0, _symbol.Symbol)(name_622 + "_" + scopeIndex_619);
}
;
function Scope_621(name_623) {
  return (0, _symbol.Symbol)(name_623);
}
exports.freshScope = freshScope_620;
exports.Scope = Scope_621;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Njb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQSxJQUFJLGlCQUFpQixDQUFyQjtBQUNBLFNBQVMsY0FBVCxHQUE0QztBQUFBLE1BQXBCLFFBQW9CLHlEQUFULE9BQVM7O0FBQzFDO0FBQ0EsU0FBTyxvQkFBTyxXQUFXLEdBQVgsR0FBaUIsY0FBeEIsQ0FBUDtBQUNEO0FBQ0Q7QUFDQSxTQUFTLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkI7QUFDM0IsU0FBTyxvQkFBTyxRQUFQLENBQVA7QUFDRDtRQUN5QixVLEdBQWxCLGM7UUFDYSxLLEdBQWIsUyIsImZpbGUiOiJzY29wZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtTeW1ib2wsIGdlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5sZXQgc2NvcGVJbmRleF82MTkgPSAwO1xuZnVuY3Rpb24gZnJlc2hTY29wZV82MjAobmFtZV82MjIgPSBcInNjb3BlXCIpIHtcbiAgc2NvcGVJbmRleF82MTkrKztcbiAgcmV0dXJuIFN5bWJvbChuYW1lXzYyMiArIFwiX1wiICsgc2NvcGVJbmRleF82MTkpO1xufVxuO1xuZnVuY3Rpb24gU2NvcGVfNjIxKG5hbWVfNjIzKSB7XG4gIHJldHVybiBTeW1ib2wobmFtZV82MjMpO1xufVxuZXhwb3J0IHtmcmVzaFNjb3BlXzYyMCBhcyBmcmVzaFNjb3BlfTtcbmV4cG9ydCB7U2NvcGVfNjIxIGFzIFNjb3BlfSJdfQ==