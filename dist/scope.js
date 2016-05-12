"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freshScope = freshScope;
exports.Scope = Scope;

var _errors = require("./errors");

var _symbol = require("./symbol");

var scopeIndex_466 = 0;
function freshScope() {
  var name_467 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex_466++;
  return (0, _symbol.Symbol)(name_467 + "_" + scopeIndex_466);
}
;
function Scope(name_468) {
  return (0, _symbol.Symbol)(name_468);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Njb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBR2dCLFUsR0FBQSxVO1FBS0EsSyxHQUFBLEs7O0FBUmhCOztBQUNBOztBQUNBLElBQUksaUJBQWlCLENBQXJCO0FBQ08sU0FBUyxVQUFULEdBQXdDO0FBQUEsTUFBcEIsUUFBb0IseURBQVQsT0FBUzs7QUFDN0M7QUFDQSxTQUFPLG9CQUFPLFdBQVcsR0FBWCxHQUFpQixjQUF4QixDQUFQO0FBQ0Q7QUFDRDtBQUNPLFNBQVMsS0FBVCxDQUFlLFFBQWYsRUFBeUI7QUFDOUIsU0FBTyxvQkFBTyxRQUFQLENBQVA7QUFDRCIsImZpbGUiOiJzY29wZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtTeW1ib2wsIGdlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5sZXQgc2NvcGVJbmRleF80NjYgPSAwO1xuZXhwb3J0IGZ1bmN0aW9uIGZyZXNoU2NvcGUobmFtZV80NjcgPSBcInNjb3BlXCIpIHtcbiAgc2NvcGVJbmRleF80NjYrKztcbiAgcmV0dXJuIFN5bWJvbChuYW1lXzQ2NyArIFwiX1wiICsgc2NvcGVJbmRleF80NjYpO1xufVxuO1xuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlKG5hbWVfNDY4KSB7XG4gIHJldHVybiBTeW1ib2wobmFtZV80NjgpO1xufVxuIl19