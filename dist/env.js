"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _transforms = require("./transforms");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Env = (function () {
  function Env() {
    _classCallCheck(this, Env);

    this.map = new Map();
    this.map.set("function", _transforms.FunctionDeclTransform);
    this.map.set("var", _transforms.VariableDeclTransform);
    this.map.set("let", _transforms.LetDeclTransform);
    this.map.set("const", _transforms.ConstDeclTransform);
    this.map.set("syntaxQuote", _transforms.SyntaxQuoteTransform);
    this.map.set("syntaxrec", _transforms.SyntaxrecDeclTransform);
    this.map.set("syntax", _transforms.SyntaxDeclTransform);
    this.map.set("return", _transforms.ReturnStatementTransform);
    this.map.set("while", _transforms.WhileTransform);
    this.map.set("if", _transforms.IfTransform);
    this.map.set("for", _transforms.ForTransform);
    this.map.set("switch", _transforms.SwitchTransform);
    this.map.set("break", _transforms.BreakTransform);
    this.map.set("continue", _transforms.ContinueTransform);
    this.map.set("do", _transforms.DoTransform);
    this.map.set("debugger", _transforms.DebuggerTransform);
    this.map.set("with", _transforms.WithTransform);
    this.map.set("try", _transforms.TryTransform);
    this.map.set("throw", _transforms.ThrowTransform);
    this.map.set("new", _transforms.NewTransform);
  }

  _createClass(Env, [{
    key: "has",
    value: function has(key_293) {
      return this.map.has(key_293);
    }
  }, {
    key: "get",
    value: function get(key_294) {
      return this.map.get(key_294);
    }
  }, {
    key: "set",
    value: function set(key_295, val_296) {
      return this.map.set(key_295, val_296);
    }
  }]);

  return Env;
})();

exports.default = Env;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2Vudi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDcUIsR0FBRztBQUN0QixXQURtQixHQUFHLEdBQ1I7MEJBREssR0FBRzs7QUFFcEIsUUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBQSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsb0NBQXdCLENBQUM7QUFDaEQsUUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxvQ0FBd0IsQ0FBQztBQUMzQyxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLCtCQUFtQixDQUFDO0FBQ3RDLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8saUNBQXFCLENBQUM7QUFDMUMsUUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxtQ0FBdUIsQ0FBQztBQUNsRCxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLHFDQUF5QixDQUFDO0FBQ2xELFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsa0NBQXNCLENBQUM7QUFDNUMsUUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSx1Q0FBMkIsQ0FBQztBQUNqRCxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLDZCQUFpQixDQUFDO0FBQ3RDLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksMEJBQWMsQ0FBQztBQUNoQyxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLDJCQUFlLENBQUM7QUFDbEMsUUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSw4QkFBa0IsQ0FBQztBQUN4QyxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLDZCQUFpQixDQUFDO0FBQ3RDLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsZ0NBQW9CLENBQUM7QUFDNUMsUUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSwwQkFBYyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsZ0NBQW9CLENBQUM7QUFDNUMsUUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSw0QkFBZ0IsQ0FBQztBQUNwQyxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLDJCQUFlLENBQUM7QUFDbEMsUUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyw2QkFBaUIsQ0FBQztBQUN0QyxRQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLDJCQUFlLENBQUM7R0FDbkM7O2VBdkJrQixHQUFHOzt3QkF3QmxCLE9BQU8sRUFBRTtBQUNYLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDOUI7Ozt3QkFDRyxPQUFPLEVBQUU7QUFDWCxhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzlCOzs7d0JBQ0csT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUNwQixhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN2Qzs7O1NBaENrQixHQUFHOzs7a0JBQUgsR0FBRyIsImZpbGUiOiJlbnYuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Z1bmN0aW9uRGVjbFRyYW5zZm9ybSwgVmFyaWFibGVEZWNsVHJhbnNmb3JtLCBMZXREZWNsVHJhbnNmb3JtLCBDb25zdERlY2xUcmFuc2Zvcm0sIFN5bnRheERlY2xUcmFuc2Zvcm0sIFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0sIFN5bnRheFF1b3RlVHJhbnNmb3JtLCBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm0sIElmVHJhbnNmb3JtLCBGb3JUcmFuc2Zvcm0sIFN3aXRjaFRyYW5zZm9ybSwgQnJlYWtUcmFuc2Zvcm0sIENvbnRpbnVlVHJhbnNmb3JtLCBEb1RyYW5zZm9ybSwgRGVidWdnZXJUcmFuc2Zvcm0sIFdpdGhUcmFuc2Zvcm0sIFRyeVRyYW5zZm9ybSwgVGhyb3dUcmFuc2Zvcm0sIE5ld1RyYW5zZm9ybSwgV2hpbGVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVudiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWFwID0gbmV3IE1hcDtcbiAgICB0aGlzLm1hcC5zZXQoXCJmdW5jdGlvblwiLCBGdW5jdGlvbkRlY2xUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcInZhclwiLCBWYXJpYWJsZURlY2xUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcImxldFwiLCBMZXREZWNsVHJhbnNmb3JtKTtcbiAgICB0aGlzLm1hcC5zZXQoXCJjb25zdFwiLCBDb25zdERlY2xUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcInN5bnRheFF1b3RlXCIsIFN5bnRheFF1b3RlVHJhbnNmb3JtKTtcbiAgICB0aGlzLm1hcC5zZXQoXCJzeW50YXhyZWNcIiwgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSk7XG4gICAgdGhpcy5tYXAuc2V0KFwic3ludGF4XCIsIFN5bnRheERlY2xUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcInJldHVyblwiLCBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcIndoaWxlXCIsIFdoaWxlVHJhbnNmb3JtKTtcbiAgICB0aGlzLm1hcC5zZXQoXCJpZlwiLCBJZlRyYW5zZm9ybSk7XG4gICAgdGhpcy5tYXAuc2V0KFwiZm9yXCIsIEZvclRyYW5zZm9ybSk7XG4gICAgdGhpcy5tYXAuc2V0KFwic3dpdGNoXCIsIFN3aXRjaFRyYW5zZm9ybSk7XG4gICAgdGhpcy5tYXAuc2V0KFwiYnJlYWtcIiwgQnJlYWtUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcImNvbnRpbnVlXCIsIENvbnRpbnVlVHJhbnNmb3JtKTtcbiAgICB0aGlzLm1hcC5zZXQoXCJkb1wiLCBEb1RyYW5zZm9ybSk7XG4gICAgdGhpcy5tYXAuc2V0KFwiZGVidWdnZXJcIiwgRGVidWdnZXJUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcIndpdGhcIiwgV2l0aFRyYW5zZm9ybSk7XG4gICAgdGhpcy5tYXAuc2V0KFwidHJ5XCIsIFRyeVRyYW5zZm9ybSk7XG4gICAgdGhpcy5tYXAuc2V0KFwidGhyb3dcIiwgVGhyb3dUcmFuc2Zvcm0pO1xuICAgIHRoaXMubWFwLnNldChcIm5ld1wiLCBOZXdUcmFuc2Zvcm0pO1xuICB9XG4gIGhhcyhrZXlfMjkzKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhcyhrZXlfMjkzKTtcbiAgfVxuICBnZXQoa2V5XzI5NCkge1xuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoa2V5XzI5NCk7XG4gIH1cbiAgc2V0KGtleV8yOTUsIHZhbF8yOTYpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuc2V0KGtleV8yOTUsIHZhbF8yOTYpO1xuICB9XG59XG4iXX0=