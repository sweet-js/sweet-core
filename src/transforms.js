export class FunctionDeclTransform {
}
export class VariableDeclTransform {
}
export class LetDeclTransform {
}
export class ConstDeclTransform {
}
export class SyntaxDeclTransform {
}
export class SyntaxQuoteTransform {
}
export class ReturnStatementTransform {
}
export class VarBindingTransform {
  constructor(id) {
    this.id = id;
  }
}
export class CompiletimeTransform {
  constructor(value) {
    this.value = value;
  }
}
