"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transforms = require("./transforms");

class Env {
  constructor() {
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
  has(key_311) {
    return this.map.has(key_311);
  }
  get(key_312) {
    return this.map.get(key_312);
  }
  set(key_313, val_314) {
    return this.map.set(key_313, val_314);
  }
}
exports.default = Env;