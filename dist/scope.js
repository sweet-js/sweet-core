"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freshScope = freshScope;
exports.Scope = Scope;

var _errors = require("./errors");

var _symbol = require("./symbol");

var scopeIndex_463 = 0;
function freshScope() {
  var name_464 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex_463++;
  return (0, _symbol.Symbol)(name_464 + "_" + scopeIndex_463);
}
;
function Scope(name_465) {
  return (0, _symbol.Symbol)(name_465);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Njb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBR2dCO1FBS0E7O0FBUmhCOztBQUNBOztBQUNBLElBQUksaUJBQWlCLENBQWpCO0FBQ0csU0FBUyxVQUFULEdBQXdDO01BQXBCLGlFQUFXLHVCQUFTOztBQUM3QyxtQkFENkM7QUFFN0MsU0FBTyxvQkFBTyxXQUFXLEdBQVgsR0FBaUIsY0FBakIsQ0FBZCxDQUY2QztDQUF4QztBQUlQO0FBQ08sU0FBUyxLQUFULENBQWUsUUFBZixFQUF5QjtBQUM5QixTQUFPLG9CQUFPLFFBQVAsQ0FBUCxDQUQ4QjtDQUF6QiIsImZpbGUiOiJzY29wZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtTeW1ib2wsIGdlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5sZXQgc2NvcGVJbmRleF80NjMgPSAwO1xuZXhwb3J0IGZ1bmN0aW9uIGZyZXNoU2NvcGUobmFtZV80NjQgPSBcInNjb3BlXCIpIHtcbiAgc2NvcGVJbmRleF80NjMrKztcbiAgcmV0dXJuIFN5bWJvbChuYW1lXzQ2NCArIFwiX1wiICsgc2NvcGVJbmRleF80NjMpO1xufVxuO1xuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlKG5hbWVfNDY1KSB7XG4gIHJldHVybiBTeW1ib2wobmFtZV80NjUpO1xufVxuIl19