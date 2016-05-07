"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MapSyntaxReducer = function (_CloneReducer) {
  _inherits(MapSyntaxReducer, _CloneReducer);

  function MapSyntaxReducer(fn_381) {
    _classCallCheck(this, MapSyntaxReducer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MapSyntaxReducer).call(this));

    _this.fn = fn_381;
    return _this;
  }

  _createClass(MapSyntaxReducer, [{
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node_382, state_383) {
      var name_384 = this.fn(node_382.name);
      return new _terms2.default("BindingIdentifier", { name: name_384 });
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node_385, state_386) {
      var name_387 = this.fn(node_385.name);
      return new _terms2.default("IdentifierExpression", { name: name_387 });
    }
  }]);

  return MapSyntaxReducer;
}(_shiftReducer.CloneReducer);

exports.default = MapSyntaxReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hcC1zeW50YXgtcmVkdWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7SUFDcUIsZ0I7OztBQUNuQiw0QkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQUE7O0FBRWxCLFVBQUssRUFBTCxHQUFVLE1BQVY7QUFGa0I7QUFHbkI7Ozs7NENBQ3VCLFEsRUFBVSxTLEVBQVc7QUFDM0MsVUFBSSxXQUFXLEtBQUssRUFBTCxDQUFRLFNBQVMsSUFBakIsQ0FBZjtBQUNBLGFBQU8sb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxNQUFNLFFBQVAsRUFBOUIsQ0FBUDtBQUNEOzs7K0NBQzBCLFEsRUFBVSxTLEVBQVc7QUFDOUMsVUFBSSxXQUFXLEtBQUssRUFBTCxDQUFRLFNBQVMsSUFBakIsQ0FBZjtBQUNBLGFBQU8sb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxNQUFNLFFBQVAsRUFBakMsQ0FBUDtBQUNEOzs7Ozs7a0JBWmtCLGdCIiwiZmlsZSI6Im1hcC1zeW50YXgtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge0Nsb25lUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcFN5bnRheFJlZHVjZXIgZXh0ZW5kcyBDbG9uZVJlZHVjZXIge1xuICBjb25zdHJ1Y3Rvcihmbl8zODEpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZm4gPSBmbl8zODE7XG4gIH1cbiAgcmVkdWNlQmluZGluZ0lkZW50aWZpZXIobm9kZV8zODIsIHN0YXRlXzM4Mykge1xuICAgIGxldCBuYW1lXzM4NCA9IHRoaXMuZm4obm9kZV8zODIubmFtZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMzg0fSk7XG4gIH1cbiAgcmVkdWNlSWRlbnRpZmllckV4cHJlc3Npb24obm9kZV8zODUsIHN0YXRlXzM4Nikge1xuICAgIGxldCBuYW1lXzM4NyA9IHRoaXMuZm4obm9kZV8zODUubmFtZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfMzg3fSk7XG4gIH1cbn1cbiJdfQ==