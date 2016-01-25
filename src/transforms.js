export class FunctionDeclTransform { }
export class VariableDeclTransform { }
export class NewTransform { }
export class ThrowTransform { }
export class LetDeclTransform { }
export class ConstDeclTransform { }
export class TryTransform { }
export class WhileTransform { }
export class IfTransform { }
export class ForTransform { }
export class SwitchTransform { }
export class BreakTransform { }
export class ContinueTransform { }
export class DoTransform { }
export class WithTransform { }
export class DebuggerTransform { }
export class SyntaxrecDeclTransform { }
export class SyntaxDeclTransform { }
export class SyntaxQuoteTransform { }
export class ReturnStatementTransform { }
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
