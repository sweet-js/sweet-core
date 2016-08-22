import { spec } from '../macros/spec.js';

spec Term {}

// Bindings
spec BindingWithDefault : Term {
  binding : any;
  init : any;
}
spec BindingIdentifier : Term {
  name : any;
}
spec ArrayBinding : Term {
  elements : any;
  restElement : any;
}
spec ObjectBinding : Term {
  properties : any;
}
spec BindingPropertyIdentifier : Term {
  binding : any;
  init : any;
}
spec BindingPropertyProperty : Term {
  name : any;
  binding : any;
}


spec Statement : Term {}
spec Expression : Term {}

// class
spec ClassExpression : Expression {
  name : any;
  super : any;
  elements : any;
}
spec ClassDeclaration : Statement {
  name : any;
  super : any;
  elements : any;
}
spec ClassElement : Term {
  isStatic : any;
  method : any;
}


// modules
spec Module : Term {
  directives : any;
  items : any;
}
spec Import : Term {
  moduleSpecifier : any;
  defaultBinding : any;
  namedImports : any;
  forSyntax : any;
}
spec ImportNamespace : Term {
  moduleSpecifier : any;
  defaultBinding : any;
  namespaceBinding : any;
}
spec ImportSpecifier : Term {
  name : any;
  binding : any;
}
spec ExportAllFrom : Term {
  moduleSpecifier : any;
}
spec ExportFrom : Term {
  namedExports : any;
  moduleSpecifier : any;
}
spec Export : Term {
  declaration : any;
}
spec ExportDefault : Term {
  body : any;
}
spec ExportSpecifier : Term {
  name : any;
  exportedName : any;
}

// property definition
spec Method : Term {
  name : any;
  body : any;
  isGenerator : any;
  params : any;
}
spec Getter : Term {
  name : any;
  body : any;
}
spec Setter : Term {
  name : any;
  body : any;
  param : any;
}
spec DataProperty : Term {
  name : any;
  expression : any;
}
spec ShorthandProperty : Term {
  expression : any;
}
spec StaticPropertyName : Term {
  value : any;
}

// literals
spec LiteralBooleanExpression : Expression {
  value : any;
}
spec LiteralInfinityExpression : Expression { }
spec LiteralNullExpression : Expression { }
spec LiteralNumericExpression : Expression {
  value : any;
}
spec LiteralRegExpExpression : Expression {
  pattern : any;
  flags : any;
}
spec LiteralStringExpression : Expression {
  value : any;
}


// expressions
spec ArrayExpression : Expression {
  elements : any;
}
spec ArrowExpression : Expression {
  params : any;
  body : any;
}
spec AssignmentExpression : Expression {
  binding : any;
  expression : any;
}
spec BinaryExpression : Expression {
  operator : any;
  left : any;
  right : any;
}
spec CallExpression : Expression {
  callee : any;
  arguments : any;
}
spec ComputedAssignmentExpression : Expression {
  operator : any;
  binding : any;
  expression : any;
}
spec ComputedMemberExpression : Expression {
  object : any;
  expression : any;
}
spec ConditionalExpression : Expression {
  test : any;
  consequent : any;
  alternate : any;
}
spec FunctionExpression : Expression {
  name : any;
  isGenerator : any;
  params : any;
  body : any;
}
spec IdentifierExpression : Expression {
  name : any;
}
spec NewExpression : Expression {
  callee : any;
  arguments : any;
}
spec NewTargetExpression : Expression { }
spec ObjectExpression : Expression {
  properties : any;
}
spec UnaryExpression : Expression {
  operator : any;
  operand : any;
}
spec StaticMemberExpression : Expression {
  object : any;
  property : any;
}
spec TemplateExpression : Expression {
  tag : any;
  elements : any;
}
spec ThisExpression : Expression { }
spec UpdateExpression : Expression {
  isPrefix : any;
  operator : any;
  operand : any;
}
spec YieldExpression : Expression {
  expression : any;
}
spec YieldGeneratorExpression : Expression {
  expression : any;
}
spec ParenthesizedExpression : Expression {
  inner : any;
}

// statements
spec BlockStatement : Statement {
  block : any;
}
spec BreakStatement : Statement {
  label : any;
}
spec ContinueStatement : Statement {
  label : any;
}
spec CompoundAssignmentExpression : Statement {
  binding : any;
  operator : any;
  expression : any;
}
spec DebuggerStatement : Statement { }
spec DoWhileStatement : Statement {
  test : any;
  body : any;
}
spec EmptyStatement : Statement { }
spec ExpressionStatement : Statement {
  expression : any;
}
spec ForInStatement : Statement {
  left : any;
  right : any;
  body : any;
}
spec ForOfStatement : Statement {
  left : any;
  right : any;
  body : any;
}
spec ForStatement : Statement {
  init : any;
  test : any;
  update : any;
  body : any;
}
spec IfStatement : Statement {
  test : any;
  consequent : any;
  alternate : any;
}
spec LabeledStatement : Statement {
  label : any;
  body : any;
}
spec ReturnStatement : Statement {
  expression : any;
}
spec SwitchStatement : Statement {
  discriminant : any;
  cases : any;
}
spec SwitchStatementWithDefault : Statement {
  discriminant : any;
  preDefaultCases : any;
  defaultCase : any;
  postDefaultCases : any;
}
spec ThrowStatement : Statement {
  expression : any;
}
spec TryCatchStatement : Statement {
  body : any;
  catchClause : any;
}
spec TryFinallyStatement : Statement {
  body : any;
  catchClause : any;
  finalizer : any;
}
spec VariableDeclarationStatement : Statement {
  declaration : any;
}
spec WithStatement : Statement {
  object : any;
  body : any;
}
spec WhileStatement : Statement {
  test : any;
  body : any;
}

// other
spec Pragma : Term {
  kind : any;
  items : any;
}
spec Block : Term {
  statements : any;
}
spec CatchClause : Term {
  binding : any;
  body : any;
}
spec Directive : Term {
  rawValue : any;
}
spec FormalParameters : Term {
  items : any;
  rest : any;
}
spec FunctionBody : Term {
  directives : any;
  statements : any;
}
spec FunctionDeclaration : Statement {
  name : any;
  isGenerator : any;
  params : any;
  body : any;
}
spec Script : Term {
  directives : any;
  statements : any;
}
spec SpreadElement : Term {
  expression : any;
}
spec Super : Term { }
spec SwitchCase : Term {
  test : any;
  consequent : any;
}
spec SwitchDefault : Term {
  consequent : any;
}
spec TemplateElement : Term {
  rawValue : any;
}
spec SyntaxTemplate : Term {
  template : any;
}
spec VariableDeclaration : Term {
  kind : any;
  declarators : any;
}
spec VariableDeclarator : Term {
  binding : any;
  init : any;
}


export default Term;
