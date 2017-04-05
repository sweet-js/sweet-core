import { expect } from './errors';
import { List } from 'immutable';
import { Enforester } from './enforester';
import { ALL_PHASES } from './syntax';
import * as _ from 'ramda';
import ScopeReducer from './scope-reducer';
import * as T from 'sweet-spec';
import Term, * as S from 'sweet-spec';
import Syntax from './syntax';
import { isTemplate, isDelimiter, getKind } from './tokens';
import type { TokenTree } from './tokens';

export function wrapInTerms(stx: List<TokenTree>): List<Term> {
  return stx.map(s => {
    if (isTemplate(s)) {
      if (s.items) {
        s.items = wrapInTerms(s.items);
        return new T.RawSyntax({
          value: new Syntax(s),
        });
      }
      return new T.RawSyntax({
        value: new Syntax(s),
      });
    } else if (isDelimiter(s)) {
      return new S.RawDelimiter({
        kind: getKind(s),
        inner: wrapInTerms(s),
      });
    }
    return new S.RawSyntax({
      value: new Syntax(s),
    });
  });
}

const privateData = new WeakMap();

function cloneEnforester(enf) {
  const { rest, prev, context } = enf;
  return new Enforester(rest, prev, context);
}

function Marker() {}

/*
ctx :: {
  of: (Syntax) -> ctx
  next: (String) -> Syntax or Term
}
*/
export default class MacroContext {
  constructor(enf, name, context, useScope, introducedScope) {
    const startMarker = new Marker();
    const startEnf = cloneEnforester(enf);
    const priv = {
      name,
      context,
      enf: startEnf,
      startMarker,
      markers: new Map([[startMarker, enf]]),
    };

    if (useScope && introducedScope) {
      priv.noScopes = false;
      priv.useScope = useScope;
      priv.introducedScope = introducedScope;
    } else {
      priv.noScopes = true;
    }
    privateData.set(this, priv);
    this.reset(); // set current enforester

    this[Symbol.iterator] = () => this;
  }

  name() {
    const { name } = privateData.get(this);
    return new T.RawSyntax({ value: name });
  }

  contextify(delim: any) {
    if (!(delim instanceof T.RawDelimiter)) {
      throw new Error(`Can only contextify a delimiter but got ${delim}`);
    }
    const { context } = privateData.get(this);

    let enf = new Enforester(
      delim.inner.slice(1, delim.inner.size - 1),
      List(),
      context,
    );
    return new MacroContext(enf, 'inner', context);
  }

  expand(type) {
    const { enf } = privateData.get(this);
    if (enf.rest.size === 0) {
      return {
        done: true,
        value: null,
      };
    }
    enf.expandMacro();
    let originalRest = enf.rest;
    let value;
    switch (type) {
      case 'AssignmentExpression':
      case 'expr':
        value = enf.enforestExpressionLoop();
        break;
      case 'Expression':
        value = enf.enforestExpression();
        break;
      case 'Statement':
      case 'stmt':
        value = enf.enforestStatement();
        break;
      case 'BlockStatement':
      case 'WhileStatement':
      case 'IfStatement':
      case 'ForStatement':
      case 'SwitchStatement':
      case 'BreakStatement':
      case 'ContinueStatement':
      case 'DebuggerStatement':
      case 'WithStatement':
      case 'TryStatement':
      case 'ThrowStatement':
      case 'ClassDeclaration':
      case 'FunctionDeclaration':
      case 'LabeledStatement':
      case 'VariableDeclarationStatement':
      case 'ReturnStatement':
      case 'ExpressionStatement':
        value = enf.enforestStatement();
        expect(
          _.whereEq({ type }, value),
          `Expecting a ${type}`,
          value,
          originalRest,
        );
        break;
      case 'YieldExpression':
        value = enf.enforestYieldExpression();
        break;
      case 'ClassExpression':
        value = enf.enforestClass({ isExpr: true });
        break;
      case 'ArrowExpression':
        value = enf.enforestArrowExpression();
        break;
      case 'NewExpression':
        value = enf.enforestNewExpression();
        break;
      case 'ThisExpression':
      case 'FunctionExpression':
      case 'IdentifierExpression':
      case 'LiteralNumericExpression':
      case 'LiteralInfinityExpression':
      case 'LiteralStringExpression':
      case 'TemplateExpression':
      case 'LiteralBooleanExpression':
      case 'LiteralNullExpression':
      case 'LiteralRegExpExpression':
      case 'ObjectExpression':
      case 'ArrayExpression':
        value = enf.enforestPrimaryExpression();
        break;
      case 'UnaryExpression':
      case 'UpdateExpression':
      case 'BinaryExpression':
      case 'StaticMemberExpression':
      case 'ComputedMemberExpression':
      case 'CompoundAssignmentExpression':
      case 'ConditionalExpression':
        value = enf.enforestExpressionLoop();
        expect(
          _.whereEq({ type }, value),
          `Expecting a ${type}`,
          value,
          originalRest,
        );
        break;
      default:
        throw new Error('Unknown term type: ' + type);
    }
    return {
      done: false,
      value: value,
    };
  }

  _rest(enf) {
    const priv = privateData.get(this);
    if (priv.markers.get(priv.startMarker) === enf) {
      return priv.enf.rest;
    }
    throw Error('Unauthorized access!');
  }

  reset(marker) {
    const priv = privateData.get(this);
    let enf;
    if (marker == null) {
      // go to the beginning
      enf = priv.markers.get(priv.startMarker);
    } else if (marker && marker instanceof Marker) {
      // marker could be from another context
      if (priv.markers.has(marker)) {
        enf = priv.markers.get(marker);
      } else {
        throw new Error('marker must originate from this context');
      }
    } else {
      throw new Error('marker must be an instance of Marker');
    }
    priv.enf = cloneEnforester(enf);
  }

  mark() {
    const priv = privateData.get(this);
    let marker;

    // the idea here is that marking at the beginning shouldn't happen more than once.
    // We can reuse startMarker.
    if (priv.enf.rest === priv.markers.get(priv.startMarker).rest) {
      marker = priv.startMarker;
    } else if (priv.enf.rest.isEmpty()) {
      // same reason as above
      if (!priv.endMarker) priv.endMarker = new Marker();
      marker = priv.endMarker;
    } else {
      //TODO(optimization/dubious): check that there isn't already a marker for this index?
      marker = new Marker();
    }
    if (!priv.markers.has(marker)) {
      priv.markers.set(marker, cloneEnforester(priv.enf));
    }
    return marker;
  }

  next() {
    const {
      enf,
      noScopes,
      useScope,
      introducedScope,
      context,
    } = privateData.get(this);
    if (enf.rest.size === 0) {
      return {
        done: true,
        value: null,
      };
    }
    let value = enf.advance();
    if (!noScopes) {
      value = value.reduce(
        new ScopeReducer(
          [
            { scope: useScope, phase: ALL_PHASES, flip: false },
            { scope: introducedScope, phase: ALL_PHASES, flip: true },
          ],
          context.bindings,
        ),
      );
    }
    return {
      done: false,
      value: value,
    };
  }
}
