"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target_939, source_940) {
  var F_941 = function (_target_) {
    _inherits(F_941, _target_);

    function F_941() {
      _classCallCheck(this, F_941);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F_941).apply(this, arguments));
    }

    return F_941;
  }(target_939);

  Object.getOwnPropertyNames(source_940.prototype).forEach(function (name_942) {
    if (name_942 !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source_940.prototype, name_942);
      Object.defineProperty(F_941.prototype, name_942, newProp);
    }
  });
  return F_941;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBQWdCLEssR0FBQSxLOzs7Ozs7OztBQUFULFNBQVMsS0FBVCxDQUFlLFVBQWYsRUFBMkIsVUFBM0IsRUFBdUM7QUFBQSxNQUN0QyxLQURzQztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBLElBQ3hCLFVBRHdCOztBQUU1QyxTQUFPLG1CQUFQLENBQTJCLFdBQVcsU0FBdEMsRUFBaUQsT0FBakQsQ0FBeUQsb0JBQVk7QUFDbkUsUUFBSSxhQUFhLGFBQWpCLEVBQWdDO0FBQzlCLFVBQUksVUFBVSxPQUFPLHdCQUFQLENBQWdDLFdBQVcsU0FBM0MsRUFBc0QsUUFBdEQsQ0FBZDtBQUNBLGFBQU8sY0FBUCxDQUFzQixNQUFNLFNBQTVCLEVBQXVDLFFBQXZDLEVBQWlELE9BQWpEO0FBQ0Q7QUFDRixHQUxEO0FBTUEsU0FBTyxLQUFQO0FBQ0QiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gbWl4aW4odGFyZ2V0XzkzOSwgc291cmNlXzk0MCkge1xuICBjbGFzcyBGXzk0MSBleHRlbmRzIHRhcmdldF85Mzkge31cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc291cmNlXzk0MC5wcm90b3R5cGUpLmZvckVhY2gobmFtZV85NDIgPT4ge1xuICAgIGlmIChuYW1lXzk0MiAhPT0gXCJjb25zdHJ1Y3RvclwiKSB7XG4gICAgICBsZXQgbmV3UHJvcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlXzk0MC5wcm90b3R5cGUsIG5hbWVfOTQyKTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGXzk0MS5wcm90b3R5cGUsIG5hbWVfOTQyLCBuZXdQcm9wKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gRl85NDE7XG59XG4iXX0=