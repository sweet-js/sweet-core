"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freshScope = freshScope;
exports.Scope = Scope;

var _errors = require("./errors");

var _symbol = require("./symbol");

var scopeIndex_469 = 0;
function freshScope() {
  var name_470 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex_469++;
  return (0, _symbol.Symbol)(name_470 + "_" + scopeIndex_469);
}
;
function Scope(name_471) {
  return (0, _symbol.Symbol)(name_471);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Njb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBR2dCLFVBQVUsR0FBVixVQUFVO1FBS1YsS0FBSyxHQUFMLEtBQUs7Ozs7OztBQU5yQixJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDaEIsU0FBUyxVQUFVLEdBQXFCO01BQXBCLFFBQVEseURBQUcsT0FBTzs7QUFDM0MsZ0JBQWMsRUFBRSxDQUFDO0FBQ2pCLFNBQU8sb0JBQU8sUUFBUSxHQUFHLEdBQUcsR0FBRyxjQUFjLENBQUMsQ0FBQztDQUNoRDtBQUNELENBQUM7QUFDTSxTQUFTLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDOUIsU0FBTyxvQkFBTyxRQUFRLENBQUMsQ0FBQztDQUN6QiIsImZpbGUiOiJzY29wZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtTeW1ib2wsIGdlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5sZXQgc2NvcGVJbmRleF80NjkgPSAwO1xuZXhwb3J0IGZ1bmN0aW9uIGZyZXNoU2NvcGUobmFtZV80NzAgPSBcInNjb3BlXCIpIHtcbiAgc2NvcGVJbmRleF80NjkrKztcbiAgcmV0dXJuIFN5bWJvbChuYW1lXzQ3MCArIFwiX1wiICsgc2NvcGVJbmRleF80NjkpO1xufVxuO1xuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlKG5hbWVfNDcxKSB7XG4gIHJldHVybiBTeW1ib2wobmFtZV80NzEpO1xufVxuIl19