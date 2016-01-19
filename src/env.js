import {
  FunctionDeclTransform,
  VariableDeclTransform,
  LetDeclTransform,
  ConstDeclTransform,
  SyntaxDeclTransform,
  SyntaxQuoteTransform,
  ReturnStatementTransform,
  IfTransform,
  ForTransform,
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
    this.map.set("syntax", SyntaxDeclTransform);
    this.map.set("return", ReturnStatementTransform);
    this.map.set("while", WhileTransform);
    this.map.set("if", IfTransform);
    this.map.set("for", ForTransform);
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
