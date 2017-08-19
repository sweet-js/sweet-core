// @flow
import SweetModule from './sweet-module';
import Syntax from './syntax';

export class FunctionDeclTransform {}
export class VariableDeclTransform {}
export class NewTransform {}
export class ThrowTransform {}
export class LetDeclTransform {}
export class ConstDeclTransform {}
export class TryTransform {}
export class WhileTransform {}
export class IfTransform {}
export class ForTransform {}
export class SwitchTransform {}
export class BreakTransform {}
export class ContinueTransform {}
export class DoTransform {}
export class WithTransform {}
export class ImportTransform {}
export class ExportTransform {}
export class SuperTransform {}
export class YieldTransform {}
export class ThisTransform {}
export class ClassTransform {}
export class DefaultTransform {}
export class DebuggerTransform {}
export class SyntaxrecDeclTransform {}
export class SyntaxDeclTransform {}
export class OperatorDeclTransform {}
export class ReturnStatementTransform {}
export class AsyncTransform {}
export class AwaitTransform {}
export class ModuleNamespaceTransform {
  namespace: Syntax;
  mod: SweetModule;

  constructor(namespace: Syntax, mod: SweetModule) {
    this.namespace = namespace;
    this.mod = mod;
  }
}
export class VarBindingTransform {
  id: Syntax;

  constructor(id: Syntax) {
    this.id = id;
  }
}
export class CompiletimeTransform {
  value: any;

  constructor(value: any) {
    this.value = value;
  }
}
