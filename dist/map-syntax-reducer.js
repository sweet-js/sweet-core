"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MapSyntaxReducer extends _shiftReducer.CloneReducer {
  constructor(fn_462) {
    super();
    this.fn = fn_462;
  }
  reduceBindingIdentifier(node_463, state_464) {
    let name_465 = this.fn(node_463.name);
    return new _terms2.default("BindingIdentifier", { name: name_465 });
  }
  reduceIdentifierExpression(node_466, state_467) {
    let name_468 = this.fn(node_466.name);
    return new _terms2.default("IdentifierExpression", { name: name_468 });
  }
}
exports.default = MapSyntaxReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hcC1zeW50YXgtcmVkdWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ2UsTUFBTSxnQkFBTixvQ0FBNEM7QUFDekQsY0FBWSxNQUFaLEVBQW9CO0FBQ2xCO0FBQ0EsU0FBSyxFQUFMLEdBQVUsTUFBVjtBQUNEO0FBQ0QsMEJBQXdCLFFBQXhCLEVBQWtDLFNBQWxDLEVBQTZDO0FBQzNDLFFBQUksV0FBVyxLQUFLLEVBQUwsQ0FBUSxTQUFTLElBQWpCLENBQWY7QUFDQSxXQUFPLG9CQUFTLG1CQUFULEVBQThCLEVBQUMsTUFBTSxRQUFQLEVBQTlCLENBQVA7QUFDRDtBQUNELDZCQUEyQixRQUEzQixFQUFxQyxTQUFyQyxFQUFnRDtBQUM5QyxRQUFJLFdBQVcsS0FBSyxFQUFMLENBQVEsU0FBUyxJQUFqQixDQUFmO0FBQ0EsV0FBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sUUFBUCxFQUFqQyxDQUFQO0FBQ0Q7QUFad0Q7a0JBQXRDLGdCIiwiZmlsZSI6Im1hcC1zeW50YXgtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge0Nsb25lUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcFN5bnRheFJlZHVjZXIgZXh0ZW5kcyBDbG9uZVJlZHVjZXIge1xuICBjb25zdHJ1Y3Rvcihmbl80NjIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZm4gPSBmbl80NjI7XG4gIH1cbiAgcmVkdWNlQmluZGluZ0lkZW50aWZpZXIobm9kZV80NjMsIHN0YXRlXzQ2NCkge1xuICAgIGxldCBuYW1lXzQ2NSA9IHRoaXMuZm4obm9kZV80NjMubmFtZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfNDY1fSk7XG4gIH1cbiAgcmVkdWNlSWRlbnRpZmllckV4cHJlc3Npb24obm9kZV80NjYsIHN0YXRlXzQ2Nykge1xuICAgIGxldCBuYW1lXzQ2OCA9IHRoaXMuZm4obm9kZV80NjYubmFtZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfNDY4fSk7XG4gIH1cbn1cbiJdfQ==