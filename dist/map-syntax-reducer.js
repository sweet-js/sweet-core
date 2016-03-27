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

  function MapSyntaxReducer(fn_378) {
    _classCallCheck(this, MapSyntaxReducer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MapSyntaxReducer).call(this));

    _this.fn = fn_378;
    return _this;
  }

  _createClass(MapSyntaxReducer, [{
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node_379, state_380) {
      var name_381 = this.fn(node_379.name);
      return new _terms2.default("BindingIdentifier", { name: name_381 });
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node_382, state_383) {
      var name_384 = this.fn(node_382.name);
      return new _terms2.default("IdentifierExpression", { name: name_384 });
    }
  }]);

  return MapSyntaxReducer;
}(_shiftReducer.CloneReducer);

exports.default = MapSyntaxReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hcC1zeW50YXgtcmVkdWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7SUFDcUI7OztBQUNuQixXQURtQixnQkFDbkIsQ0FBWSxNQUFaLEVBQW9COzBCQURELGtCQUNDOzt1RUFERCw4QkFDQzs7QUFFbEIsVUFBSyxFQUFMLEdBQVUsTUFBVixDQUZrQjs7R0FBcEI7O2VBRG1COzs0Q0FLSyxVQUFVLFdBQVc7QUFDM0MsVUFBSSxXQUFXLEtBQUssRUFBTCxDQUFRLFNBQVMsSUFBVCxDQUFuQixDQUR1QztBQUUzQyxhQUFPLG9CQUFTLG1CQUFULEVBQThCLEVBQUMsTUFBTSxRQUFOLEVBQS9CLENBQVAsQ0FGMkM7Ozs7K0NBSWxCLFVBQVUsV0FBVztBQUM5QyxVQUFJLFdBQVcsS0FBSyxFQUFMLENBQVEsU0FBUyxJQUFULENBQW5CLENBRDBDO0FBRTlDLGFBQU8sb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxNQUFNLFFBQU4sRUFBbEMsQ0FBUCxDQUY4Qzs7OztTQVQ3QiIsImZpbGUiOiJtYXAtc3ludGF4LXJlZHVjZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtDbG9uZVJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBTeW50YXhSZWR1Y2VyIGV4dGVuZHMgQ2xvbmVSZWR1Y2VyIHtcbiAgY29uc3RydWN0b3IoZm5fMzc4KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmZuID0gZm5fMzc4O1xuICB9XG4gIHJlZHVjZUJpbmRpbmdJZGVudGlmaWVyKG5vZGVfMzc5LCBzdGF0ZV8zODApIHtcbiAgICBsZXQgbmFtZV8zODEgPSB0aGlzLmZuKG5vZGVfMzc5Lm5hbWUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzM4MX0pO1xuICB9XG4gIHJlZHVjZUlkZW50aWZpZXJFeHByZXNzaW9uKG5vZGVfMzgyLCBzdGF0ZV8zODMpIHtcbiAgICBsZXQgbmFtZV8zODQgPSB0aGlzLmZuKG5vZGVfMzgyLm5hbWUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzM4NH0pO1xuICB9XG59XG4iXX0=