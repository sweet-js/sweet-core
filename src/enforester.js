import Term from "./terms";

import {
  FunctionDeclTransform,
  VariableDeclTransform,
  LetDeclTransform,
  ConstDeclTransform,
  SyntaxDeclTransform,
  SyntaxQuoteTransform,
  ReturnStatementTransform,
  CompiletimeTransform
} from "./transforms";
import { List } from "immutable";
import { expect, assert } from "./errors";
import {
  isOperator,
  getOperatorAssoc,
  getOperatorPrec,
  operatorLt
} from "./operators";
import Syntax from "./syntax";

import { freshScope } from "./scope";

import MacroContext from "./macro-context";

export class Enforester {
  constructor(stxl, prev, context) {
    this.done = false;
    assert(List.isList(stxl), "expecting a list of terms to enforest");
    assert(List.isList(prev), "expecting a list of terms to enforest");
    assert(context, "expecting a context to enforest");
    this.term = null;

    this.rest = stxl;
    this.prev = prev;

    this.context = context;
  }

  peek(n = 0) {
    return this.rest.get(n);
  }

  advance() {
    let ret = this.rest.first();
    this.rest = this.rest.rest();
    return ret;
  }

  /*
   enforest works over:
   prev - a list of the previously enforest Terms
   term - the current term being enforested (initially null)
   rest - remaining Terms to enforest
   */
  enforest(type = "Module") {
    // initialize the term
    this.term = null;

    if (this.rest.size === 0) {
      this.done = true;
      return this.term;
    }

    if (this.isEOF(this.peek())) {
      this.term = new Term("EOF", {});
      this.advance();
      return this.term;
    }

    let result;
    if (type === "expression") {
      result = this.enforestExpressionLoop();
    } else {
      result = this.enforestModule();
    }

    if (this.rest.size === 0) {
      this.done = true;
    }
    return result;
  }

  enforestModule() {
    return this.enforestBody();
  }

  enforestBody() {
    return this.enforestModuleItem();
  }

  enforestModuleItem() {
    let lookahead = this.peek();
    if (this.isKeyword(lookahead, 'import')) {
      this.advance();
      return this.enforestImportDeclaration();
    } else if (this.isKeyword(lookahead, 'export')) {
      this.advance();
      return this.enforestExportDeclaration();
    }
    return this.enforestStatement();
  }

  enforestExportDeclaration() {
    let lookahead = this.peek();
    if (this.isVarDeclTransform(lookahead) ||
        this.isLetDeclTransform(lookahead) ||
        this.isConstDeclTransform(lookahead) ||
        this.isSyntaxDeclTransform(lookahead)) {
      return new Term('Export', {
        declaration: this.enforestVariableDeclaration()
      });
    }
    throw "not implemented yet";
  }

  enforestImportDeclaration() {
    let lookahead = this.peek();

    if (this.isCurlyDelimiter(lookahead)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();

      return new Term("Import", {
        defaultBinding: null,
        // List(ImportSpecifier)
        namedImports: imports,
        // String
        moduleSpecifier: fromClause
      });
    }
    throw "not implemented yet";
  }

  enforestNamedImports() {
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    let result = [];
    while (enf.rest.size !== 0) {
      result.push(enf.enforestImportSpecifiers());
    }
    return List(result);
  }

  enforestImportSpecifiers() {
    let lookahead = this.peek();
    if (this.isIdentifier(lookahead)) {
      let name = this.advance();
      this.consumeComma();
      return new Term('ImportSpecifier', {
        name: null,
        binding: new Term('BindingIdentifier', {
          name: name
        })
      });
    }
    throw this.createError(lookahead, 'unexpected token in import specifier');
  }

  enforestFromClause() {
    this.matchIdentifier('from');
    let lookahead = this.matchStringLiteral();
    this.consumeSemicolon();
    return lookahead.val();
  }


  enforestStatement() {
    let lookahead = this.peek();

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      return this.expandMacro();
    }

    // TODO: put somewhere else
    if (this.term === null && this.isKeyword(lookahead, "class")) {
      return this.enforestClass({isExpr: false});
    }

    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionDeclaration();
    }

    if (this.term === null &&
        (this.isVarDeclTransform(lookahead) ||
         this.isLetDeclTransform(lookahead) ||
         this.isConstDeclTransform(lookahead) ||
         this.isSyntaxDeclTransform(lookahead))) {
      return this.enforestVariableDeclaration();
    }

    if (this.term === null && this.isReturnStmtTransform(lookahead)) {
      return this.enforestReturnStatement();
    }

    if (this.term === null && this.isPunctuator(lookahead, ";")) {
      this.advance();
      return new Term("EmptyStatement", {});
    }

    return this.enforestExpressionStatement();
  }

  enforestClass({ isExpr }) {
    this.advance();
    let name = this.enforestBindingIdentifier();
    this.advance();
    return new Term("ClassDeclaration", {
      name: name,
      elements: List()
    });
  }

  enforestBindingTarget() {
    let lookahead = this.peek();
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead, "yield") ||
        this.isKeyword(lookahead, "let")) {
      return this.enforestBindingIdentifier();
    }
    throw "not implemented yet";
  }

  enforestBindingIdentifier() {
    return new Term("BindingIdentifier", {
      name: this.enforestIdentifier()
    });
  }

  enforestIdentifier() {
    let lookahead = this.peek();
    // TODO handle yields
    if (this.isIdentifier(lookahead)) {
      return this.advance();
    }
    throw this.createError(lookahead, "expecting an identifier");
  }

  // TODO: something like this
  // enforestStatementListItem() {
  //     let lookahead = this.peek();
  //     if (this.isKeyword("function")) {
  //         return this.enforestFunction({ isExpr: false });
  //     } else if (this.isKeyword("class")) {
  //         return this.enforestClass({ isExpr: false });
  //     }
  // }

  enforestReturnStatement() {
    let kw = this.advance();
    let lookahead = this.peek();

    // short circuit for the empty expression case
    if (this.rest.size === 0 ||
        (lookahead && !this.lineNumberEq(kw, lookahead))) {
      return new Term("ReturnStatement", {
        expression: null
      });
    }

    let term = this.enforestExpressionLoop();
    expect(term != null, "Expecting an expression to follow return keyword", lookahead, this.rest);
    this.consumeSemicolon();

    return new Term("ReturnStatement", {
      expression: term
    });
  }

  enforestVariableDeclaration() {
    let kind;
    let lookahead = this.advance();
    let kindSyn = lookahead;

    if (kindSyn &&
        this.context.env.get(kindSyn.resolve()) === VariableDeclTransform) {
      kind = "var";
    } else if (kindSyn &&
               this.context.env.get(kindSyn.resolve()) === LetDeclTransform) {
      kind = "let";
    } else if (kindSyn &&
               this.context.env.get(kindSyn.resolve()) === ConstDeclTransform) {
      kind = "const";
    } else if (kindSyn &&
               this.context.env.get(kindSyn.resolve()) === SyntaxDeclTransform) {
      kind = "syntax";
    }

    let decls = List();

    while (true) {
      let term = this.enforestVariableDeclarator();
      let lookahead = this.peek();
      decls = decls.concat(term);

      if (this.isPunctuator(lookahead, ",")) {
        this.advance();
      } else {
        break;
      }
    }

    this.consumeSemicolon();

    return new Term('VariableDeclarationStatement', {
      declaration: new Term("VariableDeclaration", {
        kind: kind,
        declarators: decls
      })
    });
  }

  enforestVariableDeclarator() {
    let id = this.enforestBindingTarget();
    let eq = this.advance();

    let init, rest;
    if (eq && eq.val() === "=") {
      let enf = new Enforester(this.rest, List(), this.context);
      init = enf.enforest("expression");
      this.rest = enf.rest;
    } else {
      init = null;
    }
    return new Term("VariableDeclarator", {
      binding: id,
      init: init
    });
  }

  enforestExpressionStatement() {
    let start = this.rest.get(0);
    let expr = this.enforestExpressionLoop();
    if (expr === null) {
      throw this.createError(start, "not a valid expression");
    }
    this.consumeSemicolon();

    return new Term("ExpressionStatement", {
      expression: expr
    });
  }

  enforestExpressionLoop() {
    let lastTerm;
    let firstTime = true;

    this.term = null;
    this.opCtx = {
      prec: 0,
      combine: (x) => x,
      stack: List()
    };

    do {
      lastTerm = this.term;
      this.term = this.enforestExpression();

      if (firstTime) {
        firstTime = false;
        if (this.term === null) {
          break;
        }
      }

      // if nothing changed, maybe we just need to pop the expr stack
      if (lastTerm === this.term && this.opCtx.stack.size > 0) {
        this.term = this.opCtx.combine(this.term);
        let {prec, combine} = this.opCtx.stack.last();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        this.opCtx.stack = this.opCtx.stack.pop();
      }
      // if we had that chance to pop the operator stack and still the
      // current term and last term are null then we got into an infinite
      // loop
      assert(!(this.term === null && lastTerm === null),
        "enforesting an expression should never be null");

    } while (lastTerm !== this.term);  // get a fixpoint
    return this.term;
  }

  enforestExpression() {
    let lookahead = this.peek();

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      let term = this.expandMacro("expression");
      // TODO: need to figure out the right way of checking if terms are expressions
      // if (!(term instanceof T.ExpressionTerm)) {
      //     throw this.createError(term,
      //                            "expecting macro to return an expression");
      // }
      return term;
    }

    // todo: not complete
    // $x:ident = $init:expr
    if (this.term === null && this.isIdentifier(lookahead) &&
        this.isPunctuator(this.peek(1), "=")) {
      return this.enforestAssignmentExpression();
    }

    // syntaxQuote { ... }
    if (this.term === null && this.isSyntaxQuoteTransform(lookahead)) {
      return this.enforestSyntaxQuote();
    }

    // $x:ThisExpression
    if (this.term === null && this.isKeyword(lookahead, "this")) {
      return new Term("ThisExpression", {
        stx: this.advance()
      });
    }
    // $x:ident
    if (this.term === null && this.isIdentifier(lookahead)) {
      return new Term("IdentifierExpression", {
        name: this.advance()
      });
    }
    if (this.term === null && this.isNumericLiteral(lookahead)) {
      return new Term("LiteralNumericExpression", {
        value: this.advance()
      });
    }
    if (this.term === null && this.isStringLiteral(lookahead)) {
      return new Term("LiteralStringExpression", {
        value: this.advance()
      });
    }
    if (this.term === null && this.isBooleanLiteral(lookahead)) {
      return new Term("LiteralBooleanExpression", {
        value: this.advance()
      });
    }
    if (this.term === null && this.isNullLiteral(lookahead)) {
      this.advance();
      return new Term("LiteralNullExpression", {});
    }
    if (this.term === null && this.isRegularExpression(lookahead)) {
      let reStx = this.advance();
      return new Term("LiteralRegExpExpression", {
        pattern: reStx.token.regex.pattern,
        flags: reStx.token.regex.flags
      });
    }
    // ($x:expr)
    if (this.term === null && this.isParenDelimiter(lookahead)) {
      return new Term("ParenthesizedExpression", {
        inner: this.advance().inner()
      });
    }
    // $x:FunctionExpression
    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionExpression();
    }

    // { $p:prop (,) ... }
    if (this.term === null && this.isCurlyDelimiter(lookahead)) {
      return this.enforestObjectExpression();
    }

    // [$x:expr (,) ...]
    if (this.term === null && this.isSquareDelimiter(lookahead)) {
      return this.enforestArrayExpression();
    }

    // and then check the cases where the term part of p is something...

    // $x:expr . $prop:ident
    if (this.term && this.isPunctuator(lookahead, ".")) {
      return this.enforestStaticMemberExpression();
    }
    // $l:expr $op:binaryOperator $r:expr
    if (this.term && this.isOperator(lookahead)) {
      return this.enforestBinaryExpression();
    }
    // $x:expr (...)
    if (this.term && this.isParenDelimiter(lookahead)) {
      let paren = this.advance();
      return new Term("CallExpression", {
        callee: this.term,
        arguments: paren
      });
    }

    return this.term;
  }

  enforestAssignmentExpression() {
    let id = this.enforestBindingTarget();
    let op = this.advance();
    // todo: too restrictive right now
    assert(this.isPunctuator(op, "="), "expecting an assignment operator");

    let enf = new Enforester(this.rest, List(), this.context);
    let init = enf.enforest("expression");
    this.rest = enf.rest;

    return new Term("AssignmentExpression", {
      binding: id,
      expression: init
    });
  }

  enforestSyntaxQuote() {
    let name = this.advance();
    let body = this.matchCurlies();

    return new Term("SyntaxQuote", {
      name: name,
      stx: body
    });
  }

  enforestStaticMemberExpression() {
    let object = this.term;
    let dot = this.advance();
    let property = this.matchIdentifier();

    return new Term("StaticMemberExpression", {
      object: object,
      property: property
    });
  }

  enforestArrayExpression() {
    let arr = this.advance();

    let elements = List();

    let enf = new Enforester(arr.inner(), List(), this.context);

    while (enf.rest.size > 0) {
      let lookahead = enf.peek();
      if (enf.isPunctuator(lookahead, ",")) {
        enf.advance();
        elements = elements.concat(null);
      } else {
        let term = enf.enforestExpressionLoop();
        elements = elements.concat(term);
        enf.consumeComma();
      }
    }

    return new Term("ArrayExpression", {
      elements: elements
    });
  }

  enforestObjectExpression() {
    let obj = this.advance();

    let properties = List();

    let enf = new Enforester(obj.inner(), List(), this.context);

    let lastProp = null;
    while (enf.rest.size > 0) {
      let prop = enf.enforestProperty();
      properties = properties.concat(prop);

      if (lastProp === prop) {
        throw enf.createError(prop, "invalid syntax in object");
      }
      lastProp = prop;
    }

    return new Term("ObjectExpression", {
      properties: properties
    });
  }

  enforestProperty() {
    let key = this.matchIdentifier();
    let colon = this.matchPunctuator(":");

    let value = this.enforestExpressionLoop();
    this.consumeComma();

    let name = new Term("StaticPropertyName", {
      value: key
    });

    return new Term("DataProperty", {
      name: name,
      expression: value
    });
  }

  enforestFunctionExpression() {
    let name = null, params, body, rest;
    let isGenerator = false;
    // eat the function keyword
    this.advance();
    let lookahead = this.peek();

    if (this.isPunctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
      lookahead = this.peek();
    }

    if (this.isIdentifier(lookahead)) {
      name = this.enforestBindingIdentifier();
    }

    params = this.matchParens("expecting a function parameter list");
    body = this.matchCurlies("expecting a function body");

    let enf = new Enforester(params, List(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new Term("FunctionExpression", {
      name: name,
      isGenerator: isGenerator,
      params: formalParams,
      body: body
    });
  }

  enforestFunctionDeclaration() {
    let name, params, body, rest;
    let isGenerator = false;
    // eat the function keyword
    this.advance();
    let lookahead = this.peek();

    if (this.isPunctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
    }

    name = this.enforestBindingIdentifier();

    params = this.matchParens("expecting a function parameter list");
    body = this.matchCurlies("expecting a function body");

    let enf = new Enforester(params, List(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new Term("FunctionDeclaration", {
      name: name,
      isGenerator: isGenerator,
      params: formalParams,
      body: body
    });
  }

  enforestFormalParameters() {
    let items = [];
    while (this.rest.size !== 0) {
      let lookahead = this.peek();

      if (this.isIdentifier(lookahead)) {
        items.push(this.enforestBindingIdentifier());
      } else if (this.isPunctuator(lookahead, ",")) {
        this.advance();
      } else {
        assert(false, "not implemented yet");
      }
    }
    return new Term("FormalParameters", {
      items: List(items),
      rest: null
    });
  }

  enforestBinaryExpression() {

    let leftTerm = this.term;
    let opStx = this.peek();
    let op = opStx.val();
    let opPrec = getOperatorPrec(op);
    let opAssoc = getOperatorAssoc(op);

    if (operatorLt(this.opCtx.prec, opPrec, opAssoc)) {
      this.opCtx.stack = this.opCtx.stack.push({
        prec: this.opCtx.prec,
        combine: this.opCtx.combine
      });
      this.opCtx.prec = opPrec;
      this.opCtx.combine = (rightTerm) => {
        return new Term("BinaryExpression", {
          left: leftTerm,
          operator: opStx,
          right: rightTerm
        });
      };
      this.advance();
      return null;
    } else {
      let term = this.opCtx.combine(leftTerm);
      // this.rest does not change
      let { prec, combine } = this.opCtx.stack.last();
      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
      return term;
    }
  }

  expandMacro(enforestType) {
    let name = this.advance();

    let ct = this.context.env.get(name.resolve());
    if (ct == null || typeof ct.value !== "function") {
      throw this.createError(name,
        "the macro name was not bound to a value that could be invoked");
    }
    let useSiteScope = freshScope("u");
    let introducedScope = freshScope("i");
    this.context.useScope = useSiteScope;

    let ctx = new MacroContext(this, name, this.context, useSiteScope, introducedScope);

    let result = ct.value(ctx).map(stx => {
      return stx.addScope(introducedScope, this.context.bindings, { flip: true });
    });

    // enforesting result to handle precedence issues
    // (this surrounds macro results with implicit parens)
    let enf = new Enforester(result, List(), this.context);
    let term = enf.enforest(enforestType);

    this.rest = enf.rest.concat(this.rest);

    return term;

  }

  consumeSemicolon() {
    let lookahead = this.peek();

    if (lookahead && this.isPunctuator(lookahead, ";")) {
      this.advance();
    }
  }

  consumeComma() {
    let lookahead = this.peek();

    if (lookahead && this.isPunctuator(lookahead, ',')) {
      this.advance();
    }
  }

  isEOF(term) {
    return term && (term instanceof Syntax) && term.isEOF();
  }

  isIdentifier(term, val = null) {
    return term && (term instanceof Syntax) && term.isIdentifier() &&
            ((val === null) || (term.val() === val));
  }

  isNumericLiteral(term) {
    return term && (term instanceof Syntax) && term.isNumericLiteral();
  }

  isStringLiteral(term) {
    return term && (term instanceof Syntax) && term.isStringLiteral();
  }

  isBooleanLiteral(term) {
    return term && (term instanceof Syntax) && term.isBooleanLiteral();
  }

  isNullLiteral(term) {
    return term && (term instanceof Syntax) && term.isNullLiteral();
  }

  isRegularExpression(term) {
    return term && (term instanceof Syntax) && term.isRegularExpression();
  }

  isParenDelimiter(term) {
    return term && (term instanceof Syntax) && term.isParenDelimiter();
  }

  isCurlyDelimiter(term) {
    return term && (term instanceof Syntax) && term.isCurlyDelimiter();
  }

  isSquareDelimiter(term) {
    return term && (term instanceof Syntax) && term.isSquareDelimiter();
  }

  isKeyword(term, val = null) {
    return term && (term instanceof Syntax) &&
           term.isKeyword() && ((val === null) || (term.val() === val));
  }

  isPunctuator(term, val = null) {
    return term && (term instanceof Syntax) &&
           term.isPunctuator() && ((val === null) || (term.val() === val));
  }

  isOperator(term) {
    return term && (term instanceof Syntax) && isOperator(term);
  }

  isFnDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === FunctionDeclTransform;
  }

  isVarDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === VariableDeclTransform;
  }

  isLetDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === LetDeclTransform;
  }

  isConstDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === ConstDeclTransform;
  }

  isSyntaxDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === SyntaxDeclTransform;
  }

  isSyntaxQuoteTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === SyntaxQuoteTransform;
  }

  isReturnStmtTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === ReturnStatementTransform;
  }

  isCompiletimeTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) instanceof CompiletimeTransform;
  }

  lineNumberEq(a, b) {
    if (!(a && b)) {
      return false;
    }
    assert(a instanceof Syntax, "expecting a syntax object");
    assert(b instanceof Syntax, "expecting a syntax object");
    return a.lineNumber() === b.lineNumber();
  }

  matchIdentifier(val) {
    let lookahead = this.advance();
    if (this.isIdentifier(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting an identifier");
  }

  matchKeyword(val) {
    let lookahead = this.advance();
    if (this.isKeyword(lookahead, val)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting ' + val);
  }

  matchLiteral() {
    let lookahead = this.advance();
    if (this.isNumericLiteral(lookahead) ||
        this.isStringLiteral(lookahead) ||
        this.isBooleanLiteral(lookahead) ||
        this.isNullLiteral(lookahead) ||
        this.isRegularExpression(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting a literal");
  }

  matchStringLiteral() {
    let lookahead = this.advance();
    if (this.isStringLiteral(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting a string literal');
  }

  matchParens() {
    let lookahead = this.advance();
    if (this.isParenDelimiter(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting parens");
  }

  matchCurlies() {
    let lookahead = this.advance();
    if (this.isCurlyDelimiter(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting curly braces");
  }

  matchPunctuator(val) {
    let lookahead = this.advance();
    if (this.isPunctuator(lookahead)) {
      if (typeof val !== 'undefined') {
        if (lookahead.val() === val) {
          return lookahead;
        } else {
          throw this.createError(lookahead,
            "expecting a " + val + " punctuator");
        }
      }
      return lookahead;
    }
    throw this.createError(lookahead, "expecting a punctuator");
  }

  createError(stx, message) {
    let ctx = "";
    let offending = stx;
    if (this.rest.size > 0) {
      ctx = this.rest.slice(0, 20).map(term => {
        if (term.isDelimiter()) {
          return term.inner();
        }
        return List.of(term);
      }).flatten().map(s => {
        if (s === offending) {
          return "__" + s.val() + "__";
        }
        return s.val();
      }).join(" ");
    }
    return new Error("[error]: " + message + "\n" + ctx);
  }
}
