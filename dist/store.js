"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vm = require("vm");

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Store {
  constructor() {
    this.map = new Map();
    this.nodeContext = _vm2.default.createContext();
  }
  has(key_746) {
    return this.map.has(key_746);
  }
  get(key_747) {
    return this.map.get(key_747);
  }
  set(key_748, val_749) {
    this.nodeContext[key_748] = val_749;
    return this.map.set(key_748, val_749);
  }
  getNodeContext() {
    return this.nodeContext;
  }
}
exports.default = Store;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFDZSxNQUFNLEtBQU4sQ0FBWTtBQUN6QixnQkFBYztBQUNaLFNBQUssR0FBTCxHQUFXLElBQUksR0FBSixFQUFYO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLGFBQUcsYUFBSCxFQUFuQjtBQUNEO0FBQ0QsTUFBSSxPQUFKLEVBQWE7QUFDWCxXQUFPLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxPQUFiLENBQVA7QUFDRDtBQUNELE1BQUksT0FBSixFQUFhO0FBQ1gsV0FBTyxLQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsT0FBYixDQUFQO0FBQ0Q7QUFDRCxNQUFJLE9BQUosRUFBYSxPQUFiLEVBQXNCO0FBQ3BCLFNBQUssV0FBTCxDQUFpQixPQUFqQixJQUE0QixPQUE1QjtBQUNBLFdBQU8sS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLE9BQWIsRUFBc0IsT0FBdEIsQ0FBUDtBQUNEO0FBQ0QsbUJBQWlCO0FBQ2YsV0FBTyxLQUFLLFdBQVo7QUFDRDtBQWpCd0I7a0JBQU4sSyIsImZpbGUiOiJzdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB2bSBmcm9tIFwidm1cIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tYXAgPSBuZXcgTWFwO1xuICAgIHRoaXMubm9kZUNvbnRleHQgPSB2bS5jcmVhdGVDb250ZXh0KCk7XG4gIH1cbiAgaGFzKGtleV83NDYpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzKGtleV83NDYpO1xuICB9XG4gIGdldChrZXlfNzQ3KSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmdldChrZXlfNzQ3KTtcbiAgfVxuICBzZXQoa2V5Xzc0OCwgdmFsXzc0OSkge1xuICAgIHRoaXMubm9kZUNvbnRleHRba2V5Xzc0OF0gPSB2YWxfNzQ5O1xuICAgIHJldHVybiB0aGlzLm1hcC5zZXQoa2V5Xzc0OCwgdmFsXzc0OSk7XG4gIH1cbiAgZ2V0Tm9kZUNvbnRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZUNvbnRleHQ7XG4gIH1cbn1cbiJdfQ==