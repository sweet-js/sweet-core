"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target_935, source_936) {
  var F_937 = function (_target_) {
    _inherits(F_937, _target_);

    function F_937() {
      _classCallCheck(this, F_937);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F_937).apply(this, arguments));
    }

    return F_937;
  }(target_935);

  Object.getOwnPropertyNames(source_936.prototype).forEach(function (name_938) {
    if (name_938 !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source_936.prototype, name_938);
      Object.defineProperty(F_937.prototype, name_938, newProp);
    }
  });
  return F_937;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBQWdCOzs7Ozs7OztBQUFULFNBQVMsS0FBVCxDQUFlLFVBQWYsRUFBMkIsVUFBM0IsRUFBdUM7TUFDdEM7Ozs7Ozs7Ozs7SUFBYyxZQUR3Qjs7QUFFNUMsU0FBTyxtQkFBUCxDQUEyQixXQUFXLFNBQVgsQ0FBM0IsQ0FBaUQsT0FBakQsQ0FBeUQsb0JBQVk7QUFDbkUsUUFBSSxhQUFhLGFBQWIsRUFBNEI7QUFDOUIsVUFBSSxVQUFVLE9BQU8sd0JBQVAsQ0FBZ0MsV0FBVyxTQUFYLEVBQXNCLFFBQXRELENBQVYsQ0FEMEI7QUFFOUIsYUFBTyxjQUFQLENBQXNCLE1BQU0sU0FBTixFQUFpQixRQUF2QyxFQUFpRCxPQUFqRCxFQUY4QjtLQUFoQztHQUR1RCxDQUF6RCxDQUY0QztBQVE1QyxTQUFPLEtBQVAsQ0FSNEM7Q0FBdkMiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gbWl4aW4odGFyZ2V0XzkzNSwgc291cmNlXzkzNikge1xuICBjbGFzcyBGXzkzNyBleHRlbmRzIHRhcmdldF85MzUge31cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc291cmNlXzkzNi5wcm90b3R5cGUpLmZvckVhY2gobmFtZV85MzggPT4ge1xuICAgIGlmIChuYW1lXzkzOCAhPT0gXCJjb25zdHJ1Y3RvclwiKSB7XG4gICAgICBsZXQgbmV3UHJvcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlXzkzNi5wcm90b3R5cGUsIG5hbWVfOTM4KTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGXzkzNy5wcm90b3R5cGUsIG5hbWVfOTM4LCBuZXdQcm9wKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gRl85Mzc7XG59XG4iXX0=