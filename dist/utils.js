"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin(target, source) {
  var F = function (_target) {
    _inherits(F, _target);

    function F() {
      _classCallCheck(this, F);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(F).apply(this, arguments));
    }

    return F;
  }(target);

  Object.getOwnPropertyNames(source.prototype).forEach(function (name) {
    if (name !== "constructor") {
      var newProp = Object.getOwnPropertyDescriptor(source.prototype, name);
      Object.defineProperty(F.prototype, name, newProp);
    }
  });
  return F;
}
//# sourceMappingURL=utils.js.map
