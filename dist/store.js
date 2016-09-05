'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Store {
  constructor() {
    this.map = new Map();
    this.nodeContext = _vm2.default.createContext();
  }

  has(key) {
    return this.map.has(key);
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, val) {
    this.nodeContext[key] = val;
    return this.map.set(key, val);
  }

  getNodeContext() {
    return this.nodeContext;
  }
}
exports.default = Store;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7O0FBRWUsTUFBTSxLQUFOLENBQVk7QUFDekIsZ0JBQWM7QUFDWixTQUFLLEdBQUwsR0FBVyxJQUFJLEdBQUosRUFBWDtBQUNBLFNBQUssV0FBTCxHQUFtQixhQUFHLGFBQUgsRUFBbkI7QUFDRDs7QUFFRCxNQUFJLEdBQUosRUFBUztBQUNQLFdBQU8sS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLEdBQWIsQ0FBUDtBQUNEOztBQUVELE1BQUksR0FBSixFQUFTO0FBQ1AsV0FBTyxLQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsR0FBYixDQUFQO0FBQ0Q7O0FBRUQsTUFBSSxHQUFKLEVBQVMsR0FBVCxFQUFjO0FBQ1osU0FBSyxXQUFMLENBQWlCLEdBQWpCLElBQXdCLEdBQXhCO0FBQ0EsV0FBTyxLQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsR0FBYixFQUFrQixHQUFsQixDQUFQO0FBQ0Q7O0FBRUQsbUJBQWlCO0FBQ2YsV0FBTyxLQUFLLFdBQVo7QUFDRDtBQXJCd0I7a0JBQU4sSyIsImZpbGUiOiJzdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB2bSBmcm9tICd2bSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5ub2RlQ29udGV4dCA9IHZtLmNyZWF0ZUNvbnRleHQoKTtcbiAgfVxuXG4gIGhhcyhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzKGtleSk7XG4gIH1cblxuICBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmdldChrZXkpO1xuICB9XG5cbiAgc2V0KGtleSwgdmFsKSB7XG4gICAgdGhpcy5ub2RlQ29udGV4dFtrZXldID0gdmFsO1xuICAgIHJldHVybiB0aGlzLm1hcC5zZXQoa2V5LCB2YWwpO1xuICB9XG5cbiAgZ2V0Tm9kZUNvbnRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZUNvbnRleHQ7XG4gIH1cbn1cbiJdfQ==