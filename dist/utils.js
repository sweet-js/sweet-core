"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target_950, source_951) {
  var F_952 = (function (_target_) {
    _inherits(F_952, _target_);

    function F_952() {
      _classCallCheck(this, F_952);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F_952).apply(this, arguments));
    }

    return F_952;
  })(target_950);

  Object.getOwnPropertyNames(source_951.prototype).forEach(function (name_953) {
    if (name_953 !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source_951.prototype, name_953);
      Object.defineProperty(F_952.prototype, name_953, newProp);
    }
  });
  return F_952;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBQWdCLEtBQUssR0FBTCxLQUFLOzs7Ozs7OztBQUFkLFNBQVMsS0FBSyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUU7TUFDdEMsS0FBSztjQUFMLEtBQUs7O2FBQUwsS0FBSzs0QkFBTCxLQUFLOztvRUFBTCxLQUFLOzs7V0FBTCxLQUFLO0tBQVMsVUFBVTs7QUFDOUIsUUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDbkUsUUFBSSxRQUFRLEtBQUssYUFBYSxFQUFFO0FBQzlCLFVBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzlFLFlBQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDM0Q7R0FDRixDQUFDLENBQUM7QUFDSCxTQUFPLEtBQUssQ0FBQztDQUNkIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIG1peGluKHRhcmdldF85NTAsIHNvdXJjZV85NTEpIHtcbiAgY2xhc3MgRl85NTIgZXh0ZW5kcyB0YXJnZXRfOTUwIHt9XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZV85NTEucHJvdG90eXBlKS5mb3JFYWNoKG5hbWVfOTUzID0+IHtcbiAgICBpZiAobmFtZV85NTMgIT09IFwiY29uc3RydWN0b3JcIikge1xuICAgICAgbGV0IG5ld1Byb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZV85NTEucHJvdG90eXBlLCBuYW1lXzk1Myk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRl85NTIucHJvdG90eXBlLCBuYW1lXzk1MywgbmV3UHJvcCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIEZfOTUyO1xufVxuIl19