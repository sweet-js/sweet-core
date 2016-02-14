"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _transforms = require("./transforms");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Env = function () {
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
    value: function has(key) {
      return this.map.has(key);
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.map.get(key);
    }
  }, {
    key: "set",
    value: function set(key, val) {
      return this.map.set(key, val);
    }
  }]);

  return Env;
}();

exports.default = Env;
//# sourceMappingURL=env.js.map
