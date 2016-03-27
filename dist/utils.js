"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target_936, source_937) {
  var F_938 = function (_target_) {
    _inherits(F_938, _target_);

    function F_938() {
      _classCallCheck(this, F_938);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F_938).apply(this, arguments));
    }

    return F_938;
  }(target_936);

  Object.getOwnPropertyNames(source_937.prototype).forEach(function (name_939) {
    if (name_939 !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source_937.prototype, name_939);
      Object.defineProperty(F_938.prototype, name_939, newProp);
    }
  });
  return F_938;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBQWdCOzs7Ozs7OztBQUFULFNBQVMsS0FBVCxDQUFlLFVBQWYsRUFBMkIsVUFBM0IsRUFBdUM7TUFDdEM7Ozs7Ozs7Ozs7SUFBYyxZQUR3Qjs7QUFFNUMsU0FBTyxtQkFBUCxDQUEyQixXQUFXLFNBQVgsQ0FBM0IsQ0FBaUQsT0FBakQsQ0FBeUQsb0JBQVk7QUFDbkUsUUFBSSxhQUFhLGFBQWIsRUFBNEI7QUFDOUIsVUFBSSxVQUFVLE9BQU8sd0JBQVAsQ0FBZ0MsV0FBVyxTQUFYLEVBQXNCLFFBQXRELENBQVYsQ0FEMEI7QUFFOUIsYUFBTyxjQUFQLENBQXNCLE1BQU0sU0FBTixFQUFpQixRQUF2QyxFQUFpRCxPQUFqRCxFQUY4QjtLQUFoQztHQUR1RCxDQUF6RCxDQUY0QztBQVE1QyxTQUFPLEtBQVAsQ0FSNEM7Q0FBdkMiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gbWl4aW4odGFyZ2V0XzkzNiwgc291cmNlXzkzNykge1xuICBjbGFzcyBGXzkzOCBleHRlbmRzIHRhcmdldF85MzYge31cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc291cmNlXzkzNy5wcm90b3R5cGUpLmZvckVhY2gobmFtZV85MzkgPT4ge1xuICAgIGlmIChuYW1lXzkzOSAhPT0gXCJjb25zdHJ1Y3RvclwiKSB7XG4gICAgICBsZXQgbmV3UHJvcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlXzkzNy5wcm90b3R5cGUsIG5hbWVfOTM5KTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGXzkzOC5wcm90b3R5cGUsIG5hbWVfOTM5LCBuZXdQcm9wKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gRl85Mzg7XG59XG4iXX0=