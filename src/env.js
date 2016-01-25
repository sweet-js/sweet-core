import {
  FunctionDeclTransform,
  VariableDeclTransform,
  LetDeclTransform,
  ConstDeclTransform,
  SyntaxDeclTransform,
  SyntaxrecDeclTransform,
  SyntaxQuoteTransform,
  ReturnStatementTransform,
  IfTransform,
  ForTransform,
  SwitchTransform,
  BreakTransform,
  ContinueTransform,
  DoTransform,
  DebuggerTransform,
  WithTransform,
  TryTransform,
  ThrowTransform,
  NewTransform,
  WhileTransform
} from "./transforms";

export default class Env {
  constructor() {
    this.map = new Map();
    this.map.set("function", FunctionDeclTransform);
    this.map.set("var", VariableDeclTransform);
    this.map.set("let", LetDeclTransform);
    this.map.set("const", ConstDeclTransform);
    this.map.set("syntaxQuote", SyntaxQuoteTransform);
    this.map.set("syntaxrec", SyntaxrecDeclTransform);
    this.map.set("syntax", SyntaxDeclTransform);
    this.map.set("return", ReturnStatementTransform);
    this.map.set("while", WhileTransform);
    this.map.set("if", IfTransform);
    this.map.set("for", ForTransform);
    this.map.set("switch", SwitchTransform);
    this.map.set("break", BreakTransform);
    this.map.set("continue", ContinueTransform);
    this.map.set("do", DoTransform);
    this.map.set("debugger", DebuggerTransform);
    this.map.set("with", WithTransform);
    this.map.set("try", TryTransform);
    this.map.set("throw", ThrowTransform);
    this.map.set("new", NewTransform);
  }

  has(key) {
    return this.map.has(key);
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, val) {
    return this.map.set(key, val);
  }
}
