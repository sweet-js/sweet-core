"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MapSyntaxReducer extends _shiftReducer.CloneReducer {
  constructor(fn_423) {
    super();
    this.fn = fn_423;
  }
  reduceBindingIdentifier(node_424, state_425) {
    let name_426 = this.fn(node_424.name);
    return new _terms2.default("BindingIdentifier", { name: name_426 });
  }
  reduceIdentifierExpression(node_427, state_428) {
    let name_429 = this.fn(node_427.name);
    return new _terms2.default("IdentifierExpression", { name: name_429 });
  }
}
exports.default = MapSyntaxReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hcC1zeW50YXgtcmVkdWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ2UsTUFBTSxnQkFBTixvQ0FBNEM7QUFDekQsY0FBWSxNQUFaLEVBQW9CO0FBQ2xCO0FBQ0EsU0FBSyxFQUFMLEdBQVUsTUFBVjtBQUNEO0FBQ0QsMEJBQXdCLFFBQXhCLEVBQWtDLFNBQWxDLEVBQTZDO0FBQzNDLFFBQUksV0FBVyxLQUFLLEVBQUwsQ0FBUSxTQUFTLElBQWpCLENBQWY7QUFDQSxXQUFPLG9CQUFTLG1CQUFULEVBQThCLEVBQUMsTUFBTSxRQUFQLEVBQTlCLENBQVA7QUFDRDtBQUNELDZCQUEyQixRQUEzQixFQUFxQyxTQUFyQyxFQUFnRDtBQUM5QyxRQUFJLFdBQVcsS0FBSyxFQUFMLENBQVEsU0FBUyxJQUFqQixDQUFmO0FBQ0EsV0FBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sUUFBUCxFQUFqQyxDQUFQO0FBQ0Q7QUFad0Q7a0JBQXRDLGdCIiwiZmlsZSI6Im1hcC1zeW50YXgtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge0Nsb25lUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcFN5bnRheFJlZHVjZXIgZXh0ZW5kcyBDbG9uZVJlZHVjZXIge1xuICBjb25zdHJ1Y3Rvcihmbl80MjMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZm4gPSBmbl80MjM7XG4gIH1cbiAgcmVkdWNlQmluZGluZ0lkZW50aWZpZXIobm9kZV80MjQsIHN0YXRlXzQyNSkge1xuICAgIGxldCBuYW1lXzQyNiA9IHRoaXMuZm4obm9kZV80MjQubmFtZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfNDI2fSk7XG4gIH1cbiAgcmVkdWNlSWRlbnRpZmllckV4cHJlc3Npb24obm9kZV80MjcsIHN0YXRlXzQyOCkge1xuICAgIGxldCBuYW1lXzQyOSA9IHRoaXMuZm4obm9kZV80MjcubmFtZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfNDI5fSk7XG4gIH1cbn1cbiJdfQ==