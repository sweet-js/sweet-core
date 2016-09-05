'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntaxOrTermWrapper = undefined;
exports.unwrap = unwrap;

var _errors = require('./errors');

var _immutable = require('immutable');

var _enforester = require('./enforester');

var _syntax = require('./syntax');

var _ramda = require('ramda');

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const symWrap = Symbol('wrapper');
const privateData = new WeakMap();

const getVal = t => {
  if (t.match("delimiter")) {
    return null;
  }
  if (typeof t.val === 'function') {
    return t.val();
  }
  return null;
};

class SyntaxOrTermWrapper {
  constructor(s) {
    let context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this[symWrap] = s;
    this.context = context;
  }

  from(type, value) {
    let stx = this[symWrap];
    if (typeof stx.from === 'function') {
      return stx.from(type, value);
    }
  }
  fromNull() {
    return this.from("null", null);
  }

  fromNumber(value) {
    return this.from('number', value);
  }

  fromString(value) {
    return this.from("string", value);
  }

  fromPunctuator(value) {
    return this.from("punctuator", value);
  }

  fromKeyword(value) {
    return this.from("keyword", value);
  }

  fromIdentifier(value) {
    return this.from("identifier", value);
  }

  fromRegularExpression(value) {
    return this.from("regularExpression", value);
  }

  fromBraces(inner) {
    return this.from("braces", inner);
  }

  fromBrackets(inner) {
    return this.from("brackets", inner);
  }

  fromParens(inner) {
    return this.from("parens", inner);
  }

  match(type, value) {
    let stx = this[symWrap];
    if (typeof stx.match === 'function') {
      return stx.match(type, value);
    }
  }

  isIdentifier(value) {
    return this.match("identifier", value);
  }

  isAssign(value) {
    return this.match("assign", value);
  }

  isBooleanLiteral(value) {
    return this.match("boolean", value);
  }

  isKeyword(value) {
    return this.match("keyword", value);
  }

  isNullLiteral(value) {
    return this.match("null", value);
  }

  isNumericLiteral(value) {
    return this.match("number", value);
  }

  isPunctuator(value) {
    return this.match("punctuator", value);
  }

  isStringLiteral(value) {
    return this.match("string", value);
  }

  isRegularExpression(value) {
    return this.match("regularExpression", value);
  }

  isTemplate(value) {
    return this.match("template", value);
  }

  isDelimiter(value) {
    return this.match("delimiter", value);
  }

  isParens(value) {
    return this.match("parens", value);
  }

  isBraces(value) {
    return this.match("braces", value);
  }

  isBrackets(value) {
    return this.match("brackets", value);
  }

  isSyntaxTemplate(value) {
    return this.match("syntaxTemplate", value);
  }

  isEOF(value) {
    return this.match("eof", value);
  }

  lineNumber() {
    return this[symWrap].lineNumber();
  }

  val() {
    return getVal(this[symWrap]);
  }

  inner() {
    let stx = this[symWrap];
    if (!stx.match("delimiter")) {
      throw new Error('Can only get inner syntax on a delimiter');
    }

    let enf = new _enforester.Enforester(stx.inner(), (0, _immutable.List)(), this.context);
    return new MacroContext(enf, 'inner', this.context);
  }
}

exports.SyntaxOrTermWrapper = SyntaxOrTermWrapper;
function unwrap(x) {
  if (x instanceof SyntaxOrTermWrapper) {
    return x[symWrap];
  }
  return x;
}

function cloneEnforester(enf) {
  const rest = enf.rest;
  const prev = enf.prev;
  const context = enf.context;

  return new _enforester.Enforester(rest, prev, context);
}

function Marker() {}

/*
ctx :: {
  of: (Syntax) -> ctx
  next: (String) -> Syntax or Term
}
*/
class MacroContext {

  constructor(enf, name, context, useScope, introducedScope) {
    const startMarker = new Marker();
    const startEnf = cloneEnforester(enf);
    const priv = {
      name: name,
      context: context,
      enf: startEnf,
      startMarker: startMarker,
      markers: new Map([[startMarker, enf]])
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
    var _privateData$get = privateData.get(this);

    const name = _privateData$get.name;
    const context = _privateData$get.context;

    return new SyntaxOrTermWrapper(name, context);
  }

  expand(type) {
    var _privateData$get2 = privateData.get(this);

    const enf = _privateData$get2.enf;
    const context = _privateData$get2.context;

    if (enf.rest.size === 0) {
      return {
        done: true,
        value: null
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
        (0, _errors.expect)(_.whereEq({ type: type }, value), `Expecting a ${ type }`, value, originalRest);
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
        (0, _errors.expect)(_.whereEq({ type: type }, value), `Expecting a ${ type }`, value, originalRest);
        break;
      default:
        throw new Error('Unknown term type: ' + type);
    }
    return {
      done: false,
      value: new SyntaxOrTermWrapper(value, context)
    };
  }

  _rest(enf) {
    const priv = privateData.get(this);
    if (priv.markers.get(priv.startMarker) === enf) {
      return priv.enf.rest;
    }
    throw Error("Unauthorized access!");
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
    var _privateData$get3 = privateData.get(this);

    const enf = _privateData$get3.enf;
    const noScopes = _privateData$get3.noScopes;
    const useScope = _privateData$get3.useScope;
    const introducedScope = _privateData$get3.introducedScope;
    const context = _privateData$get3.context;

    if (enf.rest.size === 0) {
      return {
        done: true,
        value: null
      };
    }
    let value = enf.advance();
    if (!noScopes) {
      value = value.addScope(useScope, context.bindings, _syntax.ALL_PHASES).addScope(introducedScope, context.bindings, _syntax.ALL_PHASES, { flip: true });
    }
    return {
      done: false,
      value: new SyntaxOrTermWrapper(value, context)
    };
  }
}
exports.default = MacroContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWNyby1jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQWlLZ0IsTSxHQUFBLE07O0FBaktoQjs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7SUFBWSxDOzs7O0FBRVosTUFBTSxVQUFVLE9BQU8sU0FBUCxDQUFoQjtBQUNBLE1BQU0sY0FBYyxJQUFJLE9BQUosRUFBcEI7O0FBRUEsTUFBTSxTQUFTLEtBQUs7QUFDbEIsTUFBSSxFQUFFLEtBQUYsQ0FBUSxXQUFSLENBQUosRUFBMEI7QUFDeEIsV0FBTyxJQUFQO0FBQ0Q7QUFDRCxNQUFJLE9BQU8sRUFBRSxHQUFULEtBQWlCLFVBQXJCLEVBQWlDO0FBQy9CLFdBQU8sRUFBRSxHQUFGLEVBQVA7QUFDRDtBQUNELFNBQU8sSUFBUDtBQUNELENBUkQ7O0FBVU8sTUFBTSxtQkFBTixDQUEwQjtBQUMvQixjQUFZLENBQVosRUFBNkI7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDM0IsU0FBSyxPQUFMLElBQWdCLENBQWhCO0FBQ0EsU0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNEOztBQUVELE9BQUssSUFBTCxFQUFXLEtBQVgsRUFBa0I7QUFDaEIsUUFBSSxNQUFNLEtBQUssT0FBTCxDQUFWO0FBQ0EsUUFBSSxPQUFPLElBQUksSUFBWCxLQUFvQixVQUF4QixFQUFvQztBQUNsQyxhQUFPLElBQUksSUFBSixDQUFTLElBQVQsRUFBZSxLQUFmLENBQVA7QUFDRDtBQUNGO0FBQ0QsYUFBVztBQUNULFdBQU8sS0FBSyxJQUFMLENBQVUsTUFBVixFQUFrQixJQUFsQixDQUFQO0FBQ0Q7O0FBRUQsYUFBVyxLQUFYLEVBQWtCO0FBQ2hCLFdBQU8sS0FBSyxJQUFMLENBQVUsUUFBVixFQUFvQixLQUFwQixDQUFQO0FBQ0Q7O0FBRUQsYUFBVyxLQUFYLEVBQWtCO0FBQ2hCLFdBQU8sS0FBSyxJQUFMLENBQVUsUUFBVixFQUFvQixLQUFwQixDQUFQO0FBQ0Q7O0FBRUQsaUJB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aEIsQ0FEekQ7O0FBQUEsVUFDRyxHQURILHFCQUNHLEdBREg7QUFBQSxVQUNRLFFBRFIscUJBQ1EsUUFEUjtBQUFBLFVBQ2tCLFFBRGxCLHFCQUNrQixRQURsQjtBQUFBLFVBQzRCLGVBRDVCLHFCQUM0QixlQUQ1QjtBQUFBLFVBQzZDLE9BRDdDLHFCQUM2QyxPQUQ3Qzs7QUFFTCxRQUFJLElBQUksSUFBSixDQUFTLElBQVQsS0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsYUFBTztBQUNMLGNBQU0sSUFERDtBQUVMLGVBQU87QUFGRixPQUFQO0FBSUQ7QUFDRCxRQUFJLFFBQVEsSUFBSSxPQUFKLEVBQVo7QUFDQSxRQUFJLENBQUMsUUFBTCxFQUFlO0FBQ2IsY0FBUSxNQUNMLFFBREssQ0FDSSxRQURKLEVBQ2MsUUFBUSxRQUR0QixzQkFFTCxRQUZLLENBRUksZUFGSixFQUVxQixRQUFRLFFBRjdCLHNCQUVtRCxFQUFFLE1BQU0sSUFBUixFQUZuRCxDQUFSO0FBR0Q7QUFDRCxXQUFPO0FBQ0wsWUFBTSxLQUREO0FBRUwsYUFBTyxJQUFJLG1CQUFKLENBQXdCLEtBQXhCLEVBQStCLE9BQS9CO0FBRkYsS0FBUDtBQUlEO0FBMUwrQjtrQkFBYixZIiwiZmlsZSI6Im1hY3JvLWNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHBlY3QgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBMaXN0IH0gZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7IEVuZm9yZXN0ZXIgfSBmcm9tICcuL2VuZm9yZXN0ZXInO1xuaW1wb3J0IHsgQUxMX1BIQVNFUyB9IGZyb20gJy4vc3ludGF4JztcbmltcG9ydCAqIGFzIF8gZnJvbSAncmFtZGEnO1xuXG5jb25zdCBzeW1XcmFwID0gU3ltYm9sKCd3cmFwcGVyJyk7XG5jb25zdCBwcml2YXRlRGF0YSA9IG5ldyBXZWFrTWFwKCk7XG5cbmNvbnN0IGdldFZhbCA9IHQgPT4ge1xuICBpZiAodC5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0eXBlb2YgdC52YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdC52YWwoKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbmV4cG9ydCBjbGFzcyBTeW50YXhPclRlcm1XcmFwcGVyIHtcbiAgY29uc3RydWN0b3IocywgY29udGV4dCA9IHt9KSB7XG4gICAgdGhpc1tzeW1XcmFwXSA9IHM7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgfVxuXG4gIGZyb20odHlwZSwgdmFsdWUpIHtcbiAgICBsZXQgc3R4ID0gdGhpc1tzeW1XcmFwXTtcbiAgICBpZiAodHlwZW9mIHN0eC5mcm9tID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gc3R4LmZyb20odHlwZSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICBmcm9tTnVsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwibnVsbFwiLCBudWxsKTtcbiAgfVxuXG4gIGZyb21OdW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKCdudW1iZXInLCB2YWx1ZSk7XG4gIH1cblxuICBmcm9tU3RyaW5nKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInN0cmluZ1wiLCB2YWx1ZSk7XG4gIH1cblxuICBmcm9tUHVuY3R1YXRvcih2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJwdW5jdHVhdG9yXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGZyb21LZXl3b3JkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImtleXdvcmRcIiwgdmFsdWUpO1xuICB9XG5cbiAgZnJvbUlkZW50aWZpZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwiaWRlbnRpZmllclwiLCB2YWx1ZSk7XG4gIH1cblxuICBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicmVndWxhckV4cHJlc3Npb25cIiwgdmFsdWUpO1xuICB9XG5cbiAgZnJvbUJyYWNlcyhpbm5lcikge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJicmFjZXNcIiwgaW5uZXIpO1xuICB9XG5cbiAgZnJvbUJyYWNrZXRzKGlubmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImJyYWNrZXRzXCIsIGlubmVyKTtcbiAgfVxuXG4gIGZyb21QYXJlbnMoaW5uZXIpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicGFyZW5zXCIsIGlubmVyKTtcbiAgfVxuXG4gIG1hdGNoKHR5cGUsIHZhbHVlKSB7XG4gICAgbGV0IHN0eCA9IHRoaXNbc3ltV3JhcF07XG4gICAgaWYgKHR5cGVvZiBzdHgubWF0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBzdHgubWF0Y2godHlwZSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGlzSWRlbnRpZmllcih2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc0Fzc2lnbih2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzQm9vbGVhbkxpdGVyYWwodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNLZXl3b3JkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzTnVsbExpdGVyYWwodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNOdW1lcmljTGl0ZXJhbCh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzUHVuY3R1YXRvcih2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc1N0cmluZ0xpdGVyYWwodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZSk7XG4gIH1cblxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc1RlbXBsYXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc0RlbGltaXRlcih2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzUGFyZW5zKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNCcmFjZXModmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZSk7XG4gIH1cblxuICBpc0JyYWNrZXRzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZSk7XG4gIH1cblxuICBpc1N5bnRheFRlbXBsYXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc0VPRih2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgcmV0dXJuIHRoaXNbc3ltV3JhcF0ubGluZU51bWJlcigpO1xuICB9XG5cbiAgdmFsKCkge1xuICAgIHJldHVybiBnZXRWYWwodGhpc1tzeW1XcmFwXSk7XG4gIH1cblxuICBpbm5lcigpIHtcbiAgICBsZXQgc3R4ID0gdGhpc1tzeW1XcmFwXTtcbiAgICBpZiAoIXN0eC5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gb25seSBnZXQgaW5uZXIgc3ludGF4IG9uIGEgZGVsaW1pdGVyJyk7XG4gICAgfVxuXG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHN0eC5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBNYWNyb0NvbnRleHQoZW5mLCAnaW5uZXInLCB0aGlzLmNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAoeCkge1xuICBpZiAoeCBpbnN0YW5jZW9mIFN5bnRheE9yVGVybVdyYXBwZXIpIHtcbiAgICByZXR1cm4geFtzeW1XcmFwXTtcbiAgfVxuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gY2xvbmVFbmZvcmVzdGVyKGVuZikge1xuICBjb25zdCB7IHJlc3QsIHByZXYsIGNvbnRleHQgfSA9IGVuZjtcbiAgcmV0dXJuIG5ldyBFbmZvcmVzdGVyKHJlc3QsIHByZXYsIGNvbnRleHQpO1xufVxuXG5mdW5jdGlvbiBNYXJrZXIgKCkge31cblxuLypcbmN0eCA6OiB7XG4gIG9mOiAoU3ludGF4KSAtPiBjdHhcbiAgbmV4dDogKFN0cmluZykgLT4gU3ludGF4IG9yIFRlcm1cbn1cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNyb0NvbnRleHQge1xuXG4gIGNvbnN0cnVjdG9yKGVuZiwgbmFtZSwgY29udGV4dCwgdXNlU2NvcGUsIGludHJvZHVjZWRTY29wZSkge1xuICAgIGNvbnN0IHN0YXJ0TWFya2VyID0gbmV3IE1hcmtlcigpO1xuICAgIGNvbnN0IHN0YXJ0RW5mID0gY2xvbmVFbmZvcmVzdGVyKGVuZik7XG4gICAgY29uc3QgcHJpdiA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBjb250ZXh0LFxuICAgICAgZW5mOiBzdGFydEVuZixcbiAgICAgIHN0YXJ0TWFya2VyLFxuICAgICAgbWFya2VyczogbmV3IE1hcChbW3N0YXJ0TWFya2VyLCBlbmZdXSksXG4gICAgfTtcblxuICAgIGlmICh1c2VTY29wZSAmJiBpbnRyb2R1Y2VkU2NvcGUpIHtcbiAgICAgIHByaXYubm9TY29wZXMgPSBmYWxzZTtcbiAgICAgIHByaXYudXNlU2NvcGUgPSB1c2VTY29wZTtcbiAgICAgIHByaXYuaW50cm9kdWNlZFNjb3BlID0gaW50cm9kdWNlZFNjb3BlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcml2Lm5vU2NvcGVzID0gdHJ1ZTtcbiAgICB9XG4gICAgcHJpdmF0ZURhdGEuc2V0KHRoaXMsIHByaXYpO1xuICAgIHRoaXMucmVzZXQoKTsgLy8gc2V0IGN1cnJlbnQgZW5mb3Jlc3RlclxuXG4gICAgdGhpc1tTeW1ib2wuaXRlcmF0b3JdID0gKCkgPT4gdGhpcztcbiAgfVxuXG4gIG5hbWUoKSB7XG4gICAgY29uc3QgeyBuYW1lLCBjb250ZXh0IH0gPSBwcml2YXRlRGF0YS5nZXQodGhpcyk7XG4gICAgcmV0dXJuIG5ldyBTeW50YXhPclRlcm1XcmFwcGVyKG5hbWUsIGNvbnRleHQpO1xuICB9XG5cbiAgZXhwYW5kKHR5cGUpIHtcbiAgICBjb25zdCB7IGVuZiwgY29udGV4dCB9ID0gcHJpdmF0ZURhdGEuZ2V0KHRoaXMpO1xuICAgIGlmIChlbmYucmVzdC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkb25lOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgfTtcbiAgICB9XG4gICAgZW5mLmV4cGFuZE1hY3JvKCk7XG4gICAgbGV0IG9yaWdpbmFsUmVzdCA9IGVuZi5yZXN0O1xuICAgIGxldCB2YWx1ZTtcbiAgICBzd2l0Y2godHlwZSkge1xuICAgICAgY2FzZSAnQXNzaWdubWVudEV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnZXhwcic6XG4gICAgICAgIHZhbHVlID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdFeHByZXNzaW9uJzpcbiAgICAgICAgdmFsdWUgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnU3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ3N0bXQnOlxuICAgICAgICB2YWx1ZSA9IGVuZi5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Jsb2NrU3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ1doaWxlU3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ0lmU3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ0ZvclN0YXRlbWVudCc6XG4gICAgICBjYXNlICdTd2l0Y2hTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnQnJlYWtTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnQ29udGludWVTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnRGVidWdnZXJTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnV2l0aFN0YXRlbWVudCc6XG4gICAgICBjYXNlICdUcnlTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnVGhyb3dTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnQ2xhc3NEZWNsYXJhdGlvbic6XG4gICAgICBjYXNlICdGdW5jdGlvbkRlY2xhcmF0aW9uJzpcbiAgICAgIGNhc2UgJ0xhYmVsZWRTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCc6XG4gICAgICBjYXNlICdSZXR1cm5TdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnRXhwcmVzc2lvblN0YXRlbWVudCc6XG4gICAgICAgIHZhbHVlID0gZW5mLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgICAgIGV4cGVjdChfLndoZXJlRXEoe3R5cGV9LCB2YWx1ZSksIGBFeHBlY3RpbmcgYSAke3R5cGV9YCwgdmFsdWUsIG9yaWdpbmFsUmVzdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnWWllbGRFeHByZXNzaW9uJzpcbiAgICAgICAgdmFsdWUgPSBlbmYuZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdDbGFzc0V4cHJlc3Npb24nOlxuICAgICAgICB2YWx1ZSA9IGVuZi5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IHRydWV9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd0V4cHJlc3Npb24nOlxuICAgICAgICB2YWx1ZSA9IGVuZi5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ05ld0V4cHJlc3Npb24nOlxuICAgICAgICB2YWx1ZSA9IGVuZi5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdUaGlzRXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdGdW5jdGlvbkV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnSWRlbnRpZmllckV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uJzpcbiAgICAgIGNhc2UgJ0xpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnVGVtcGxhdGVFeHByZXNzaW9uJzpcbiAgICAgIGNhc2UgJ0xpdGVyYWxCb29sZWFuRXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdMaXRlcmFsTnVsbEV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnT2JqZWN0RXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdBcnJheUV4cHJlc3Npb24nOlxuICAgICAgICB2YWx1ZSA9IGVuZi5lbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnVW5hcnlFeHByZXNzaW9uJzpcbiAgICAgIGNhc2UgJ1VwZGF0ZUV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnQmluYXJ5RXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdTdGF0aWNNZW1iZXJFeHByZXNzaW9uJzpcbiAgICAgIGNhc2UgJ0NvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uJzpcbiAgICAgIGNhc2UgJ0NvbmRpdGlvbmFsRXhwcmVzc2lvbic6XG4gICAgICAgIHZhbHVlID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgZXhwZWN0KF8ud2hlcmVFcSh7dHlwZX0sIHZhbHVlKSwgYEV4cGVjdGluZyBhICR7dHlwZX1gLCB2YWx1ZSwgb3JpZ2luYWxSZXN0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdGVybSB0eXBlOiAnICsgdHlwZSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBkb25lOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBuZXcgU3ludGF4T3JUZXJtV3JhcHBlcih2YWx1ZSwgY29udGV4dClcbiAgICB9O1xuICB9XG5cbiAgX3Jlc3QoZW5mKSB7XG4gICAgY29uc3QgcHJpdiA9IHByaXZhdGVEYXRhLmdldCh0aGlzKTtcbiAgICBpZiAocHJpdi5tYXJrZXJzLmdldChwcml2LnN0YXJ0TWFya2VyKSA9PT0gZW5mKSB7XG4gICAgICByZXR1cm4gcHJpdi5lbmYucmVzdDtcbiAgICB9XG4gICAgdGhyb3cgRXJyb3IoXCJVbmF1dGhvcml6ZWQgYWNjZXNzIVwiKTtcbiAgfVxuXG4gIHJlc2V0KG1hcmtlcikge1xuICAgIGNvbnN0IHByaXYgPSBwcml2YXRlRGF0YS5nZXQodGhpcyk7XG4gICAgbGV0IGVuZjtcbiAgICBpZiAobWFya2VyID09IG51bGwpIHtcbiAgICAgIC8vIGdvIHRvIHRoZSBiZWdpbm5pbmdcbiAgICAgIGVuZiA9IHByaXYubWFya2Vycy5nZXQocHJpdi5zdGFydE1hcmtlcik7XG4gICAgfSBlbHNlIGlmIChtYXJrZXIgJiYgbWFya2VyIGluc3RhbmNlb2YgTWFya2VyKSB7XG4gICAgICAvLyBtYXJrZXIgY291bGQgYmUgZnJvbSBhbm90aGVyIGNvbnRleHRcbiAgICAgIGlmIChwcml2Lm1hcmtlcnMuaGFzKG1hcmtlcikpIHtcbiAgICAgICAgZW5mID0gcHJpdi5tYXJrZXJzLmdldChtYXJrZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZXIgbXVzdCBvcmlnaW5hdGUgZnJvbSB0aGlzIGNvbnRleHQnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZXIgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBNYXJrZXInKTtcbiAgICB9XG4gICAgcHJpdi5lbmYgPSBjbG9uZUVuZm9yZXN0ZXIoZW5mKTtcbiAgfVxuXG4gIG1hcmsoKSB7XG4gICAgY29uc3QgcHJpdiA9IHByaXZhdGVEYXRhLmdldCh0aGlzKTtcbiAgICBsZXQgbWFya2VyO1xuXG4gICAgLy8gdGhlIGlkZWEgaGVyZSBpcyB0aGF0IG1hcmtpbmcgYXQgdGhlIGJlZ2lubmluZyBzaG91bGRuJ3QgaGFwcGVuIG1vcmUgdGhhbiBvbmNlLlxuICAgIC8vIFdlIGNhbiByZXVzZSBzdGFydE1hcmtlci5cbiAgICBpZiAocHJpdi5lbmYucmVzdCA9PT0gcHJpdi5tYXJrZXJzLmdldChwcml2LnN0YXJ0TWFya2VyKS5yZXN0KSB7XG4gICAgICBtYXJrZXIgPSBwcml2LnN0YXJ0TWFya2VyO1xuICAgIH0gZWxzZSBpZiAocHJpdi5lbmYucmVzdC5pc0VtcHR5KCkpIHtcbiAgICAgIC8vIHNhbWUgcmVhc29uIGFzIGFib3ZlXG4gICAgICBpZiAoIXByaXYuZW5kTWFya2VyKSBwcml2LmVuZE1hcmtlciA9IG5ldyBNYXJrZXIoKTtcbiAgICAgIG1hcmtlciA9IHByaXYuZW5kTWFya2VyO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL1RPRE8ob3B0aW1pemF0aW9uL2R1YmlvdXMpOiBjaGVjayB0aGF0IHRoZXJlIGlzbid0IGFscmVhZHkgYSBtYXJrZXIgZm9yIHRoaXMgaW5kZXg/XG4gICAgICBtYXJrZXIgPSBuZXcgTWFya2VyKCk7XG4gICAgfVxuICAgIGlmICghcHJpdi5tYXJrZXJzLmhhcyhtYXJrZXIpKSB7XG4gICAgICBwcml2Lm1hcmtlcnMuc2V0KG1hcmtlciwgY2xvbmVFbmZvcmVzdGVyKHByaXYuZW5mKSk7XG4gICAgfVxuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cblxuICBuZXh0KCkge1xuICAgIGNvbnN0IHsgZW5mLCBub1Njb3BlcywgdXNlU2NvcGUsIGludHJvZHVjZWRTY29wZSwgY29udGV4dCB9ID0gcHJpdmF0ZURhdGEuZ2V0KHRoaXMpO1xuICAgIGlmIChlbmYucmVzdC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkb25lOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgfTtcbiAgICB9XG4gICAgbGV0IHZhbHVlID0gZW5mLmFkdmFuY2UoKTtcbiAgICBpZiAoIW5vU2NvcGVzKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlXG4gICAgICAgIC5hZGRTY29wZSh1c2VTY29wZSwgY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUylcbiAgICAgICAgLmFkZFNjb3BlKGludHJvZHVjZWRTY29wZSwgY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUywgeyBmbGlwOiB0cnVlIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZG9uZTogZmFsc2UsXG4gICAgICB2YWx1ZTogbmV3IFN5bnRheE9yVGVybVdyYXBwZXIodmFsdWUsIGNvbnRleHQpXG4gICAgfTtcbiAgfVxufVxuIl19