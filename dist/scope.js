"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scope = exports.freshScope = undefined;

var _errors = require("./errors");

var _symbol = require("./symbol");

let scopeIndex_625 = 0;
function freshScope_626() {
  let name_628 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex_625++;
  return (0, _symbol.Symbol)(name_628 + "_" + scopeIndex_625);
}
;
function Scope_627(name_629) {
  return (0, _symbol.Symbol)(name_629);
}
exports.freshScope = freshScope_626;
exports.Scope = Scope_627;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Njb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQSxJQUFJLGlCQUFpQixDQUFyQjtBQUNBLFNBQVMsY0FBVCxHQUE0QztBQUFBLE1BQXBCLFFBQW9CLHlEQUFULE9BQVM7O0FBQzFDO0FBQ0EsU0FBTyxvQkFBTyxXQUFXLEdBQVgsR0FBaUIsY0FBeEIsQ0FBUDtBQUNEO0FBQ0Q7QUFDQSxTQUFTLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkI7QUFDM0IsU0FBTyxvQkFBTyxRQUFQLENBQVA7QUFDRDtRQUN5QixVLEdBQWxCLGM7UUFDYSxLLEdBQWIsUyIsImZpbGUiOiJzY29wZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtTeW1ib2wsIGdlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5sZXQgc2NvcGVJbmRleF82MjUgPSAwO1xuZnVuY3Rpb24gZnJlc2hTY29wZV82MjYobmFtZV82MjggPSBcInNjb3BlXCIpIHtcbiAgc2NvcGVJbmRleF82MjUrKztcbiAgcmV0dXJuIFN5bWJvbChuYW1lXzYyOCArIFwiX1wiICsgc2NvcGVJbmRleF82MjUpO1xufVxuO1xuZnVuY3Rpb24gU2NvcGVfNjI3KG5hbWVfNjI5KSB7XG4gIHJldHVybiBTeW1ib2wobmFtZV82MjkpO1xufVxuZXhwb3J0IHtmcmVzaFNjb3BlXzYyNiBhcyBmcmVzaFNjb3BlfTtcbmV4cG9ydCB7U2NvcGVfNjI3IGFzIFNjb3BlfSJdfQ==