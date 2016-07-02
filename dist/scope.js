"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scope = exports.freshScope = undefined;

var _errors = require("./errors");

var _symbol = require("./symbol");

let scopeIndex_588 = 0;
function freshScope_589() {
  let name_591 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex_588++;
  return (0, _symbol.Symbol)(name_591 + "_" + scopeIndex_588);
}
;
function Scope_590(name_592) {
  return (0, _symbol.Symbol)(name_592);
}
exports.freshScope = freshScope_589;
exports.Scope = Scope_590;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Njb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQSxJQUFJLGlCQUFpQixDQUFyQjtBQUNBLFNBQVMsY0FBVCxHQUE0QztBQUFBLE1BQXBCLFFBQW9CLHlEQUFULE9BQVM7O0FBQzFDO0FBQ0EsU0FBTyxvQkFBTyxXQUFXLEdBQVgsR0FBaUIsY0FBeEIsQ0FBUDtBQUNEO0FBQ0Q7QUFDQSxTQUFTLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkI7QUFDM0IsU0FBTyxvQkFBTyxRQUFQLENBQVA7QUFDRDtRQUN5QixVLEdBQWxCLGM7UUFDYSxLLEdBQWIsUyIsImZpbGUiOiJzY29wZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtTeW1ib2wsIGdlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5sZXQgc2NvcGVJbmRleF81ODggPSAwO1xuZnVuY3Rpb24gZnJlc2hTY29wZV81ODkobmFtZV81OTEgPSBcInNjb3BlXCIpIHtcbiAgc2NvcGVJbmRleF81ODgrKztcbiAgcmV0dXJuIFN5bWJvbChuYW1lXzU5MSArIFwiX1wiICsgc2NvcGVJbmRleF81ODgpO1xufVxuO1xuZnVuY3Rpb24gU2NvcGVfNTkwKG5hbWVfNTkyKSB7XG4gIHJldHVybiBTeW1ib2wobmFtZV81OTIpO1xufVxuZXhwb3J0IHtmcmVzaFNjb3BlXzU4OSBhcyBmcmVzaFNjb3BlfTtcbmV4cG9ydCB7U2NvcGVfNTkwIGFzIFNjb3BlfSJdfQ==