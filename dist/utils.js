"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target_941, source_942) {
  var F_943 = (function (_target_) {
    _inherits(F_943, _target_);

    function F_943() {
      _classCallCheck(this, F_943);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F_943).apply(this, arguments));
    }

    return F_943;
  })(target_941);

  Object.getOwnPropertyNames(source_942.prototype).forEach(function (name_944) {
    if (name_944 !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source_942.prototype, name_944);
      Object.defineProperty(F_943.prototype, name_944, newProp);
    }
  });
  return F_943;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBQWdCLEtBQUssR0FBTCxLQUFLOzs7Ozs7OztBQUFkLFNBQVMsS0FBSyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUU7TUFDdEMsS0FBSztjQUFMLEtBQUs7O2FBQUwsS0FBSzs0QkFBTCxLQUFLOztvRUFBTCxLQUFLOzs7V0FBTCxLQUFLO0tBQVMsVUFBVTs7QUFDOUIsUUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDbkUsUUFBSSxRQUFRLEtBQUssYUFBYSxFQUFFO0FBQzlCLFVBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzlFLFlBQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDM0Q7R0FDRixDQUFDLENBQUM7QUFDSCxTQUFPLEtBQUssQ0FBQztDQUNkIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIG1peGluKHRhcmdldF85NDEsIHNvdXJjZV85NDIpIHtcbiAgY2xhc3MgRl85NDMgZXh0ZW5kcyB0YXJnZXRfOTQxIHt9XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZV85NDIucHJvdG90eXBlKS5mb3JFYWNoKG5hbWVfOTQ0ID0+IHtcbiAgICBpZiAobmFtZV85NDQgIT09IFwiY29uc3RydWN0b3JcIikge1xuICAgICAgbGV0IG5ld1Byb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZV85NDIucHJvdG90eXBlLCBuYW1lXzk0NCk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRl85NDMucHJvdG90eXBlLCBuYW1lXzk0NCwgbmV3UHJvcCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIEZfOTQzO1xufVxuIl19