import { spec } from '../macros/spec.js';

spec Term {}

// Bindings
spec BindingWithDefault : Term {
  'binding';
  'init';
}
spec BindingIdentifier : Term {
  'name';
}
spec ArrayBinding : Term {
  'elements';
  'restElement';
}
spec ObjectBinding : Term {
  'properties';
}
spec BindingPropertyIdentifier : Term {
  'binding';
  'init';
}
spec BindingPropertyProperty : Term {
  'name';
  'binding';
}


spec Statement : Term {}
spec Expression : Term {}

// class
spec ClassExpression : Expression {
  'name';
  'super';
  'elements';
}
spec ClassDeclaration : Statement {
  'name';
  'super';
  'elements';
}
spec ClassElement : Term {
  'isStatic';
  'method';
}


// modules
spec Module : Term {
  'directives'
  'items';
}
spec Import : Term {
  'moduleSpecifier';
  'defaultBinding';
  'namedImports';
  'forSyntax';
}
spec ImportNamespace : Term {
  'moduleSpecifier';
  'defaultBinding';
  'namespaceBinding';
}
spec ImportSpecifier : Term {
  'name';
  'binding';
}
spec ExportAllFrom : Term {
  'moduleSpecifier';
}
spec ExportFrom : Term {
  'namedExports';
  'moduleSpecifier';
}
spec Export : Term {
  'declaration';
}
spec ExportDefault : Term {
  'body';
}
spec ExportSpecifier : Term {
  'name';
  'exportedName';
}

// property definition
spec Method : Term {
  'name';
  'body';
  'isGenerator';
  'params';
}
spec Getter : Term {
  'name';
  'body';
}
spec Setter : Term {
  'name';
  'body';
  'param';
}
spec DataProperty : Term {
  'name';
  'expression';
}
spec ShorthandProperty : Term {
  'expression';
}
spec StaticPropertyName : Term {
  'value';
}

// literals
spec LiteralBooleanExpression : Expression {
  'value';
}
spec LiteralInfinityExpression : Expression { }
spec LiteralNullExpression : Expression { }
spec LiteralNumericExpression : Expression {
  'value';
}
spec LiteralRegExpExpression : Expression {
  'pattern';
  'flags';
}
spec LiteralStringExpression : Expression {
  'value';
}


// expressions
spec ArrayExpression : Expression {
  'elements';
}
spec ArrowExpression : Expression {
  'params';
  'body';
}
spec AssignmentExpression : Expression {
  'binding';
  'expression';
}
spec BinaryExpression : Expression {
  'operator';
  'left';
  'right';
}
spec CallExpression : Expression {
  'callee';
  'arguments';
}
spec ComputedAssignmentExpression : Expression {
  'operator';
  'binding';
  'expression';
}
spec ComputedMemberExpression : Expression {
  'object';
  'expression';
}
spec ConditionalExpression : Expression {
  'test';
  'consequent';
  'alternate';
}
spec FunctionExpression : Expression {
  'name';
  'isGenerator';
  'params';
  'body';
}
spec IdentifierExpression : Expression {
  'name';
}
spec NewExpression : Expression {
  'callee';
  'arguments';
}
spec NewTargetExpression : Expression { }
spec ObjectExpression : Expression {
  'properties';
}
spec UnaryExpression : Expression {
  'operator';
  'operand';
}
spec StaticMemberExpression : Expression {
  'object';
  'property';
}
spec TemplateExpression : Expression {
  'tag';
  'elements';
}
spec ThisExpression : Expression { }
spec UpdateExpression : Expression {
  'isPrefix';
  'operator';
  'operand';
}
spec YieldExpression : Expression {
  'expression';
}
spec YieldGeneratorExpression : Expression {
  'expression';
}
spec ParenthesizedExpression : Expression {
  'inner';
}

// statements
spec BlockStatement : Statement {
  'block';
}
spec BreakStatement : Statement {
  'label';
}
spec ContinueStatement : Statement {
  'label';
}
spec CompoundAssignmentExpression : Statement {
  'binding';
  'operator';
  'expression';
}
spec DebuggerStatement : Statement { }
spec DoWhileStatement : Statement {
  'test';
  'body';
}
spec EmptyStatement : Statement { }
spec ExpressionStatement : Statement {
  'expression';
}
spec ForInStatement : Statement {
  'left';
  'right';
  'body';
}
spec ForOfStatement : Statement {
  'left';
  'right';
  'body';
}
spec ForStatement : Statement {
  'init';
  'test';
  'update';
  'body';
}
spec IfStatement : Statement {
  'test';
  'consequent';
  'alternate';
}
spec LabeledStatement : Statement {
  'label';
  'body';
}
spec ReturnStatement : Statement {
  'expression';
}
spec SwitchStatement : Statement {
  'discriminant';
  'cases';
}
spec SwitchStatementWithDefault : Statement {
  'discriminant';
  'preDefaultCases';
  'defaultCase';
  'postDefaultCases';
}
spec ThrowStatement : Statement {
  'expression';
}
spec TryCatchStatement : Statement {
  'body';
  'catchClause';
}
spec TryFinallyStatement : Statement {
  'body';
  'catchClause';
  'finalizer';
}
spec VariableDeclarationStatement : Statement {
  'declaration';
}
spec WithStatement : Statement {
  'object';
  'body';
}
spec WhileStatement : Statement {
  'test';
  'body';
}

// other
spec Pragma : Term {
  'kind';
  'items';
}
spec Block : Term {
  'statements';
}
spec CatchClause : Term {
  'binding';
  'body';
}
spec Directive : Term {
  'rawValue';
}
spec FormalParameters : Term {
  'items';
  'rest';
}
spec FunctionBody : Term {
  'directives';
  'statements';
}
spec FunctionDeclaration : Statement {
  'name';
  'isGenerator';
  'params';
  'body';
}
spec Script : Term {
  'directives';
  'statements';
}
spec SpreadElement : Term {
  'expression';
}
spec Super : Term { }
spec SwitchCase : Term {
  'test';
  'consequent';
}
spec SwitchDefault : Term {
  'consequent';
}
spec TemplateElement : Term {
  'rawValue';
}
spec SyntaxTemplate : Term {
  'template';
}
spec VariableDeclaration : Term {
  'kind';
  'declarators';
}
spec VariableDeclarator : Term {
  'binding';
  'init';
}


export default Term;
