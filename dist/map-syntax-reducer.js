"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MapSyntaxReducer extends _shiftReducer.CloneReducer {
  constructor(fn) {
    super();
    this.fn = fn;
  }

  reduceBindingIdentifier(node) {
    let name = this.fn(node.name);

    return new _terms2.default("BindingIdentifier", {
      name: name
    });
  }

  reduceIdentifierExpression(node) {
    let name = this.fn(node.name);

    return new _terms2.default("IdentifierExpression", {
      name: name
    });
  }
}
exports.default = MapSyntaxReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXAtc3ludGF4LXJlZHVjZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUVlLE1BQU0sZ0JBQU4sb0NBQTRDO0FBQ3pELGNBQVksRUFBWixFQUFnQjtBQUNkO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNEOztBQUVELDBCQUF3QixJQUF4QixFQUE4QjtBQUM1QixRQUFJLE9BQU8sS0FBSyxFQUFMLENBQVEsS0FBSyxJQUFiLENBQVg7O0FBRUEsV0FBTyxvQkFBUyxtQkFBVCxFQUE4QjtBQUNuQyxZQUFNO0FBRDZCLEtBQTlCLENBQVA7QUFHRDs7QUFFRCw2QkFBMkIsSUFBM0IsRUFBaUM7QUFDL0IsUUFBSSxPQUFPLEtBQUssRUFBTCxDQUFRLEtBQUssSUFBYixDQUFYOztBQUVBLFdBQU8sb0JBQVMsc0JBQVQsRUFBaUM7QUFDdEMsWUFBTTtBQURnQyxLQUFqQyxDQUFQO0FBR0Q7QUFwQndEO2tCQUF0QyxnQiIsImZpbGUiOiJtYXAtc3ludGF4LXJlZHVjZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHsgQ2xvbmVSZWR1Y2VyIH0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwU3ludGF4UmVkdWNlciBleHRlbmRzIENsb25lUmVkdWNlciB7XG4gIGNvbnN0cnVjdG9yKGZuKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmZuID0gZm47XG4gIH1cblxuICByZWR1Y2VCaW5kaW5nSWRlbnRpZmllcihub2RlKSB7XG4gICAgbGV0IG5hbWUgPSB0aGlzLmZuKG5vZGUubmFtZSk7XG5cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7XG4gICAgICBuYW1lOiBuYW1lXG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VJZGVudGlmaWVyRXhwcmVzc2lvbihub2RlKSB7XG4gICAgbGV0IG5hbWUgPSB0aGlzLmZuKG5vZGUubmFtZSk7XG5cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7XG4gICAgICBuYW1lOiBuYW1lXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==