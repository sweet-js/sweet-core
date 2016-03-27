"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target_768, source_769) {
  var F_770 = function (_target_) {
    _inherits(F_770, _target_);

    function F_770() {
      _classCallCheck(this, F_770);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F_770).apply(this, arguments));
    }

    return F_770;
  }(target_768);

  Object.getOwnPropertyNames(source_769.prototype).forEach(function (name) {
    if (name !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source_769.prototype, name);
      Object.defineProperty(F_770.prototype, name, newProp);
    }
  });
  return F_770;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBQWdCOzs7Ozs7OztBQUFULFNBQVMsS0FBVCxDQUFlLFVBQWYsRUFBMkIsVUFBM0IsRUFBdUM7TUFDdEM7Ozs7Ozs7Ozs7SUFBYyxZQUR3Qjs7QUFFNUMsU0FBTyxtQkFBUCxDQUEyQixXQUFXLFNBQVgsQ0FBM0IsQ0FBaUQsT0FBakQsQ0FBeUQsZ0JBQVE7QUFDL0QsUUFBSSxTQUFTLGFBQVQsRUFBd0I7QUFDMUIsVUFBSSxVQUFVLE9BQU8sd0JBQVAsQ0FBZ0MsV0FBVyxTQUFYLEVBQXNCLElBQXRELENBQVYsQ0FEc0I7QUFFMUIsYUFBTyxjQUFQLENBQXNCLE1BQU0sU0FBTixFQUFpQixJQUF2QyxFQUE2QyxPQUE3QyxFQUYwQjtLQUE1QjtHQUR1RCxDQUF6RCxDQUY0QztBQVE1QyxTQUFPLEtBQVAsQ0FSNEM7Q0FBdkMiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gbWl4aW4odGFyZ2V0Xzc2OCwgc291cmNlXzc2OSkge1xuICBjbGFzcyBGXzc3MCBleHRlbmRzIHRhcmdldF83Njgge31cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc291cmNlXzc2OS5wcm90b3R5cGUpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgaWYgKG5hbWUgIT09IFwiY29uc3RydWN0b3JcIikge1xuICAgICAgbGV0IG5ld1Byb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZV83NjkucHJvdG90eXBlLCBuYW1lKTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGXzc3MC5wcm90b3R5cGUsIG5hbWUsIG5ld1Byb3ApO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBGXzc3MDtcbn1cbiJdfQ==