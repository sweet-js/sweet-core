import { List } from 'immutable';
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";
import { Scope, freshScope } from "./scope";
import ApplyScopeInParamsReducer from "./apply-scope-in-params-reducer";
import reducer, { MonoidalReducer } from "shift-reducer";
import expand from './expander';
import Syntax, {makeString, makeIdentifier} from "./syntax";
import { serializer, makeDeserializer } from "./serializer";
import { enforestExpr, Enforester } from "./enforester";
// TODO: fix default import fail
let reduce = reducer.default;

function expandExpressionList(stxl, context) {
  let result = List();
  let prev = List();
  if (stxl.size === 0) {
    return List();
  }
  let enf = new Enforester(stxl, prev, context);
  let lastTerm = null;
  while (!enf.done) {
    let term = enf.enforest("expression");
    if (term == null) {
      throw enf.createError(null, "expecting an expression");
    }
    result = result.concat(term);

    if (!enf.isPunctuator(enf.peek(), ",") && enf.rest.size !== 0) {
      throw enf.createError(enf.peek(), "expecting a comma");
    }
    enf.advance();
  }
  let te = new TermExpander(context);
  return result.map(t => te.expand(t));
}

export default class TermExpander {
  constructor(context) {
    this.context = context;
  }

  expand(term) {
    let field = "expand" + term.type;
    if (typeof this[field] === 'function') {
      return this[field](term);
    }
    assert(false, "expand not implemented yet for: " + term.type);
  }

  expandVariableDeclarationStatement(term) {
    return new Term('VariableDeclarationStatement', {
      declaration: this.expand(term.declaration)
    });
  }
  expandReturnStatement(term) {
    if (term.expression == null) {
      return term;
    }
    return new Term("ReturnStatement", {
      expression: this.expand(term.expression)
    });
  }

  expandClassDeclaration(term) {
    return term;
  }

  expandThisExpression(term) {
    return term;
  }

  expandSyntaxQuote(term) {
    let id = new Term("IdentifierExpression", {
      name: term.name
    });

    let str = new Term("LiteralStringExpression", {
      value: makeString(serializer.write(term.stx))
    });

    return new Term("CallExpression", {
      callee: id,
      arguments: List.of(str)
    });
  }

  expandStaticMemberExpression(term) {
    return new Term("StaticMemberExpression", {
      object: this.expand(term.object),
      property: term.property
    });
  }

  expandArrayExpression(term) {
    return new Term("ArrayExpression", {
      elements: term.elements.map(t => t == null ? t : this.expand(t))
    });
  }

  expandImport(term) {
    return term;
  }

  expandExport(term) {
    return new Term('Export', {
      declaration: this.expand(term.declaration)
    });
  }

  expandStaticPropertyName(term) {
    return term;
  }

  expandDataProperty(term) {
    return new Term("DataProperty", {
      name: this.expand(term.name),
      expression: this.expand(term.expression)
    });
  }

  expandObjectExpression(term) {
    return new Term("ObjectExpression", {
      properties: term.properties.map(t => this.expand(t))
    });
  }

  expandVariableDeclarator(term) {
    let init = term.init == null ? null : this.expand(term.init);
    return new Term("VariableDeclarator", {
      binding: term.binding,
      init: init
    });
  }

  expandVariableDeclaration(term) {
    return new Term("VariableDeclaration", {
      kind: term.kind,
      declarators: term.declarators.map(d => this.expand(d))
    });
  }

  expandParenthesizedExpression(term) {
    let enf = new Enforester(term.inner, List(), this.context);
    let t = enf.enforest("expression");
    if (!enf.done || t == null) {
      throw enf.createError(enf.peek(), "unexpected syntax");
    }
    return this.expand(t);
  }

  expandBinaryExpression(term) {
    let left = this.expand(term.left);
    let right = this.expand(term.right);
    return new Term("BinaryExpression", {
      left: left,
      operator: term.operator,
      right: right
    });
  }

  expandCallExpression(term) {
    let callee = this.expand(term.callee);
    let args = expandExpressionList(term.arguments.inner(), this.context);
    return new Term("CallExpression", {
      callee: callee,
      arguments: args
    });
  }

  expandExpressionStatement(term) {
    let child = this.expand(term.expression);
    return new Term("ExpressionStatement", {
      expression: child
    });
  }

  doFunctionExpansion(term, type) {
    let scope = freshScope("fun");
    let markedBody = term.body.map(b => b.addScope(scope, this.context.bindings));
    let red = new ApplyScopeInParamsReducer(scope, this.context);
    let params = reduce(red, term.params);
    // let expander = new Expander(markedBody, this.context);

    let bodyTerm = new Term("FunctionBody", {
      directives: List(),
      statements: expand(markedBody, this.context)
    });

    return new Term(type, {
      name: term.name,
      isGenerator: term.isGenerator,
      params: params,
      body: bodyTerm
    });
  }

  expandFunctionDeclaration(term) {
    return this.doFunctionExpansion(term, "FunctionDeclaration");
  }

  expandFunctionExpression(term) {
    return this.doFunctionExpansion(term, "FunctionExpression");
  }

  expandAssignmentExpression(term) {
    return new Term("AssignmentExpression", {
      binding: term.binding,
      expression: this.expand(term.expression)
    });
  }

  expandEmptyStatement(term) {
    return term;
  }

  expandLiteralBooleanExpression(term) {
    return term;
  }

  expandLiteralNumericExpression(term) {
    return term;
  }

  expandIdentifierExpression(term) {
    let trans = this.context.env.get(term.name.resolve());
    if (trans) {
      return new Term("IdentifierExpression", {
        name: trans.id
      });
    }
    return term;
  }

  expandLiteralNullExpression(term) {
    return term;
  }

  expandLiteralStringExpression(term) {
    return term;
  }

  expandLiteralRegExpExpression(term) {
    return term;
  }
}
