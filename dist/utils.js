"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target_767, source_768) {
  var F_769 = function (_target_) {
    _inherits(F_769, _target_);

    function F_769() {
      _classCallCheck(this, F_769);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F_769).apply(this, arguments));
    }

    return F_769;
  }(target_767);

  Object.getOwnPropertyNames(source_768.prototype).forEach(function (name) {
    if (name !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source_768.prototype, name);Object.defineProperty(F_769.prototype, name, newProp);
    }
  });return F_769;
}
//# sourceMappingURL=utils.js.map
