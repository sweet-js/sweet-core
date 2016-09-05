"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ALL_PHASES = exports.Types = undefined;

var _immutable = require("immutable");

var _errors = require("./errors");

var _bindingMap = require("./binding-map");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _ramdaFantasy = require("ramda-fantasy");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _tokenizer = require("shift-parser/dist/tokenizer");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFirstSlice(stx) {
  if (!stx || typeof stx.isDelimiter !== 'function') return null; // TODO: should not have to do this
  if (!stx.isDelimiter()) {
    return stx.token.slice;
  }
  return stx.token.get(0).token.slice;
}

function sizeDecending(a, b) {
  if (a.scopes.size > b.scopes.size) {
    return -1;
  } else if (b.scopes.size > a.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}

let Types = exports.Types = {
  null: {
    match: token => !Types.delimiter.match(token) && token.type === _tokenizer.TokenType.NULL,
    create: (value, stx) => new Syntax({
      type: _tokenizer.TokenType.NULL,
      value: null
    }, stx)
  },
  number: {
    match: token => !Types.delimiter.match(token) && token.type.klass === _tokenizer.TokenClass.NumericLiteral,
    create: (value, stx) => new Syntax({
      type: _tokenizer.TokenType.NUMBER,
      value: value
    }, stx)
  },
  string: {
    match: token => !Types.delimiter.match(token) && token.type.klass === _tokenizer.TokenClass.StringLiteral,
    create: (value, stx) => new Syntax({
      type: _tokenizer.TokenType.STRING,
      str: value
    }, stx)
  },
  punctuator: {
    match: token => !Types.delimiter.match(token) && token.type.klass === _tokenizer.TokenClass.Punctuator,
    create: (value, stx) => new Syntax({
      type: {
        klass: _tokenizer.TokenClass.Punctuator,
        name: value
      },
      value: value
    }, stx)
  },
  keyword: {
    match: token => !Types.delimiter.match(token) && token.type.klass === _tokenizer.TokenClass.Keyword,
    create: (value, stx) => new Syntax({
      type: {
        klass: _tokenizer.TokenClass.Keyword,
        name: value
      },
      value: value
    }, stx)
  },
  identifier: {
    match: token => !Types.delimiter.match(token) && token.type.klass === _tokenizer.TokenClass.Ident,
    create: (value, stx) => new Syntax({
      type: _tokenizer.TokenType.IDENTIFIER,
      value: value
    }, stx)
  },
  regularExpression: {
    match: token => !Types.delimiter.match(token) && token.type.klass === _tokenizer.TokenClass.RegularExpression,
    create: (value, stx) => new Syntax({
      type: _tokenizer.TokenType.REGEXP,
      value: value
    }, stx)
  },
  braces: {
    match: token => Types.delimiter.match(token) && token.get(0).token.type === _tokenizer.TokenType.LBRACE,
    create: (inner, stx) => {
      let left = new Syntax({
        type: _tokenizer.TokenType.LBRACE,
        value: "{",
        slice: getFirstSlice(stx)
      });
      let right = new Syntax({
        type: _tokenizer.TokenType.RBRACE,
        value: "}",
        slice: getFirstSlice(stx)
      });
      return new Syntax(_immutable.List.of(left).concat(inner).push(right), stx);
    }
  },
  brackets: {
    match: token => Types.delimiter.match(token) && token.get(0).token.type === _tokenizer.TokenType.LBRACK,
    create: (inner, stx) => {
      let left = new Syntax({
        type: _tokenizer.TokenType.LBRACK,
        value: "[",
        slice: getFirstSlice(stx)
      });
      let right = new Syntax({
        type: _tokenizer.TokenType.RBRACK,
        value: "]",
        slice: getFirstSlice(stx)
      });
      return new Syntax(_immutable.List.of(left).concat(inner).push(right), stx);
    }
  },
  parens: {
    match: token => Types.delimiter.match(token) && token.get(0).token.type === _tokenizer.TokenType.LPAREN,
    create: (inner, stx) => {
      let left = new Syntax({
        type: _tokenizer.TokenType.LPAREN,
        value: "(",
        slice: getFirstSlice(stx)
      });
      let right = new Syntax({
        type: _tokenizer.TokenType.RPAREN,
        value: ")",
        slice: getFirstSlice(stx)
      });
      return new Syntax(_immutable.List.of(left).concat(inner).push(right), stx);
    }
  },

  assign: {
    match: token => {
      if (Types.punctuator.match(token)) {
        switch (token.value) {
          case "=":
          case "|=":
          case "^=":
          case "&=":
          case "<<=":
          case ">>=":
          case ">>>=":
          case "+=":
          case "-=":
          case "*=":
          case "/=":
          case "%=":
            return true;
          default:
            return false;
        }
      }
      return false;
    }
  },

  boolean: {
    match: token => !Types.delimiter.match(token) && token.type === _tokenizer.TokenType.TRUE || token.type === _tokenizer.TokenType.FALSE
  },

  template: {
    match: token => !Types.delimiter.match(token) && token.type === _tokenizer.TokenType.TEMPLATE
  },

  delimiter: {
    match: token => _immutable.List.isList(token)
  },

  syntaxTemplate: {
    match: token => Types.delimiter.match(token) && token.get(0).val() === '#`'
  },

  eof: {
    match: token => !Types.delimiter.match(token) && token.type === _tokenizer.TokenType.EOS
  }
};
const ALL_PHASES = exports.ALL_PHASES = {};

class Syntax {

  constructor(token, oldstx) {
    this.token = token;
    this.bindings = oldstx && oldstx.bindings != null ? oldstx.bindings : new _bindingMap2.default();
    this.scopesets = oldstx && oldstx.scopesets != null ? oldstx.scopesets : {
      all: (0, _immutable.List)(),
      phase: (0, _immutable.Map)()
    };
    Object.freeze(this);
  }
  // token: Token | List<Token>;


  static of(token, stx) {
    return new Syntax(token, stx);
  }

  static from(type, value, stx) {
    if (!Types[type]) {
      throw new Error(type + " is not a valid type");
    } else if (!Types[type].create) {
      throw new Error("Cannot create a syntax from type " + type);
    }
    let newstx = Types[type].create(value, stx);
    let slice = getFirstSlice(stx);
    if (slice != null) {
      newstx.token.slice = slice;
    }
    return newstx;
  }

  from(type, value) {
    return Syntax.from(type, value, this);
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

  static fromNull(stx) {
    return Syntax.from("null", null, stx);
  }

  static fromNumber(value, stx) {
    return Syntax.from("number", value, stx);
  }

  static fromString(value, stx) {
    return Syntax.from("string", value, stx);
  }

  static fromPunctuator(value, stx) {
    return Syntax.from("punctuator", value, stx);
  }

  static fromKeyword(value, stx) {
    return Syntax.from("keyword", value, stx);
  }

  static fromIdentifier(value, stx) {
    return Syntax.from("identifier", value, stx);
  }

  static fromRegularExpression(value, stx) {
    return Syntax.from("regularExpression", value, stx);
  }

  static fromBraces(inner, stx) {
    return Syntax.from("braces", inner, stx);
  }

  static fromBrackets(inner, stx) {
    return Syntax.from("brackets", inner, stx);
  }

  static fromParens(inner, stx) {
    return Syntax.from("parens", inner, stx);
  }

  // () -> string
  resolve(phase) {
    (0, _errors.assert)(phase != null, "must provide a phase to resolve");
    let allScopes = this.scopesets.all;
    let stxScopes = this.scopesets.phase.has(phase) ? this.scopesets.phase.get(phase) : (0, _immutable.List)();
    stxScopes = allScopes.concat(stxScopes);
    if (stxScopes.size === 0 || !(this.match('identifier') || this.match('keyword'))) {
      return this.token.value;
    }
    let scope = stxScopes.last();
    let bindings = this.bindings;
    if (scope) {
      // List<{ scopes: List<Scope>, binding: Symbol }>
      let scopesetBindingList = bindings.get(this);

      if (scopesetBindingList) {
        // { scopes: List<Scope>, binding: Symbol }
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;

          return scopes.isSubset(stxScopes);
        }).sort(sizeDecending);

        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = '{' + stxScopes.map(s => s.toString()).join(', ') + '}';
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return '{' + scopes.map(s => s.toString()).join(', ') + '}';
          }).join(', ');
          throw new Error('Scopeset ' + debugBase + ' has ambiguous subsets ' + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            // null never happens because we just checked if it is a Just
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase);
          }
          return bindingStr;
        }
      }
    }
    return this.token.value;
  }

  val() {
    (0, _errors.assert)(!this.match("delimiter"), "cannot get the val of a delimiter");
    if (this.match("string")) {
      return this.token.str;
    }
    if (this.match("template")) {
      return this.token.items.map(el => {
        if (typeof el.match === 'function' && el.match("delimiter")) {
          return '${...}';
        }
        return el.slice.text;
      }).join('');
    }
    return this.token.value;
  }

  lineNumber() {
    if (!this.match("delimiter")) {
      return this.token.slice.startLocation.line;
    } else {
      return this.token.get(0).lineNumber();
    }
  }

  setLineNumber(line) {
    let newTok = {};
    if (this.isDelimiter()) {
      newTok = this.token.map(s => s.setLineNumber(line));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok[key] = this.token[key];
      }
      (0, _errors.assert)(newTok.slice && newTok.slice.startLocation, 'all tokens must have line info');
      newTok.slice.startLocation.line = line;
    }
    return new Syntax(newTok, this);
  }

  // () -> List<Syntax>
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }

  addScope(scope, bindings, phase) {
    let options = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token = this.match('delimiter') ? this.token.map(s => s.addScope(scope, bindings, phase, options)) : this.token;
    if (this.match('template')) {
      token = _.merge(token, {
        items: token.items.map(it => {
          if (it instanceof Syntax && it.match('delimiter')) {
            return it.addScope(scope, bindings, phase, options);
          }
          return it;
        })
      });
    }
    let oldScopeset;
    if (phase === ALL_PHASES) {
      oldScopeset = this.scopesets.all;
    } else {
      oldScopeset = this.scopesets.phase.has(phase) ? this.scopesets.phase.get(phase) : (0, _immutable.List)();
    }
    let newScopeset;
    if (options.flip) {
      let index = oldScopeset.indexOf(scope);
      if (index !== -1) {
        newScopeset = oldScopeset.remove(index);
      } else {
        newScopeset = oldScopeset.push(scope);
      }
    } else {
      newScopeset = oldScopeset.push(scope);
    }
    let newstx = {
      bindings: bindings,
      scopesets: {
        all: this.scopesets.all,
        phase: this.scopesets.phase
      }
    };

    if (phase === ALL_PHASES) {
      newstx.scopesets.all = newScopeset;
    } else {
      newstx.scopesets.phase = newstx.scopesets.phase.set(phase, newScopeset);
    }
    return new Syntax(token, newstx);
  }

  removeScope(scope, phase) {
    let token = this.match('delimiter') ? this.token.map(s => s.removeScope(scope, phase)) : this.token;
    let phaseScopeset = this.scopesets.phase.has(phase) ? this.scopesets.phase.get(phase) : (0, _immutable.List)();
    let allScopeset = this.scopesets.all;
    let newstx = {
      bindings: this.bindings,
      scopesets: {
        all: this.scopesets.all,
        phase: this.scopesets.phase
      }
    };

    let phaseIndex = phaseScopeset.indexOf(scope);
    let allIndex = allScopeset.indexOf(scope);
    if (phaseIndex !== -1) {
      newstx.scopesets.phase = this.scopesets.phase.set(phase, phaseScopeset.remove(phaseIndex));
    } else if (allIndex !== -1) {
      newstx.scopesets.all = allScopeset.remove(allIndex);
    }
    return new Syntax(token, newstx);
  }

  match(type, value) {
    if (!Types[type]) {
      throw new Error(type + " is an invalid type");
    }
    return Types[type].match(this.token) && (value == null || (value instanceof RegExp ? value.test(this.val()) : this.val() == value));
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

  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s => s.toString()).join(" ");
    }
    if (this.match("string")) {
      return "'" + this.token.str;
    }
    if (this.match("template")) {
      return this.val();
    }
    return this.token.value;
  }
}
exports.default = Syntax;
//# sourceMappingURL=data:application/json;base64,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R0FBTCxFQUFQO0FBQ0Q7QUFDRCxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQWxCO0FBQ0Q7QUFsV3lCO2tCQUFQLE0iLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcbmltcG9ydCB7IExpc3QsIE1hcCB9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXBcIjtcbmltcG9ydCB7IE1heWJlIH0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSAncmFtZGEnO1xuXG5pbXBvcnQgeyBUb2tlblR5cGUsIFRva2VuQ2xhc3MgfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5cbnR5cGUgVG9rZW4gPSB7XG4gIHR5cGU6IGFueTtcbiAgdmFsdWU6IGFueTtcbiAgc2xpY2U6IGFueTtcbn07XG5cbnR5cGUgVG9rZW5UYWcgPVxuICAnbnVsbCcgfFxuICAnbnVtYmVyJyB8XG4gICdzdHJpbmcnIHxcbiAgJ3B1bmN0dWF0b3InIHxcbiAgJ2tleXdvcmQnIHxcbiAgJ2lkZW50aWZpZXInIHxcbiAgJ3JlZ3VsYXJFeHByZXNzaW9uJyB8XG4gICdib29sZWFuJyB8XG4gICdicmFjZXMnIHxcbiAgJ3BhcmVucycgfFxuICAnZGVsaW1pdGVyJyB8XG4gICdlb2YnIHxcbiAgJ3RlbXBsYXRlJyB8XG4gICdhc3NpZ24nIHxcbiAgJ3N5bnRheFRlbXBsYXRlJyB8XG4gICdicmFja2V0cydcblxuZnVuY3Rpb24gZ2V0Rmlyc3RTbGljZShzdHg6ID9TeW50YXgpIHtcbiAgaWYgKCghc3R4KSB8fCB0eXBlb2Ygc3R4LmlzRGVsaW1pdGVyICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gbnVsbDsgLy8gVE9ETzogc2hvdWxkIG5vdCBoYXZlIHRvIGRvIHRoaXNcbiAgaWYgKCFzdHguaXNEZWxpbWl0ZXIoKSkge1xuICAgIHJldHVybiBzdHgudG9rZW4uc2xpY2U7XG4gIH1cbiAgcmV0dXJuIHN0eC50b2tlbi5nZXQoMCkudG9rZW4uc2xpY2U7XG59XG5cbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmcoYSwgYikge1xuICBpZiAoYS5zY29wZXMuc2l6ZSA+IGIuc2NvcGVzLnNpemUpIHtcbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSBpZiAoYi5zY29wZXMuc2l6ZSA+IGEuc2NvcGVzLnNpemUpIHtcbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG50eXBlIFR5cGVzSGVscGVyID0ge1xuICBba2V5OiBUb2tlblRhZ106IHtcbiAgICBtYXRjaCh0b2tlbjogYW55KTogYm9vbGVhbjtcbiAgICBjcmVhdGU/OiAodmFsdWU6IGFueSwgc3R4OiA/U3ludGF4KSA9PiBTeW50YXg7XG4gIH1cbn1cblxuZXhwb3J0IGxldCBUeXBlczogVHlwZXNIZWxwZXIgPSB7XG4gIG51bGw6IHtcbiAgICBtYXRjaDogdG9rZW4gPT4gIVR5cGVzLmRlbGltaXRlci5tYXRjaCh0b2tlbikgJiYgdG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLk5VTEwsXG4gICAgY3JlYXRlOiAodmFsdWUsIHN0eCkgPT4gbmV3IFN5bnRheCh7XG4gICAgICB0eXBlOiBUb2tlblR5cGUuTlVMTCxcbiAgICAgIHZhbHVlOiBudWxsXG4gICAgfSwgc3R4KVxuICB9LFxuICBudW1iZXI6IHtcbiAgICBtYXRjaDogdG9rZW4gPT4gIVR5cGVzLmRlbGltaXRlci5tYXRjaCh0b2tlbikgJiYgdG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5OdW1lcmljTGl0ZXJhbCxcbiAgICBjcmVhdGU6ICh2YWx1ZSwgc3R4KSA9PiBuZXcgU3ludGF4KHtcbiAgICAgIHR5cGU6IFRva2VuVHlwZS5OVU1CRVIsXG4gICAgICB2YWx1ZVxuICAgIH0sIHN0eClcbiAgfSxcbiAgc3RyaW5nOiB7XG5cdFx0bWF0Y2g6IHRva2VuID0+ICFUeXBlcy5kZWxpbWl0ZXIubWF0Y2godG9rZW4pICYmIHRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuU3RyaW5nTGl0ZXJhbCxcbiAgICBjcmVhdGU6ICh2YWx1ZSwgc3R4KSA9PiBuZXcgU3ludGF4KHtcbiAgICAgIHR5cGU6IFRva2VuVHlwZS5TVFJJTkcsXG4gICAgICBzdHI6IHZhbHVlXG4gICAgfSwgc3R4KVxuICB9LFxuICBwdW5jdHVhdG9yOiB7XG5cdFx0bWF0Y2g6IHRva2VuID0+ICFUeXBlcy5kZWxpbWl0ZXIubWF0Y2godG9rZW4pICYmIHRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUHVuY3R1YXRvcixcbiAgICBjcmVhdGU6ICh2YWx1ZSwgc3R4KSA9PiBuZXcgU3ludGF4KHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAga2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvcixcbiAgICAgICAgbmFtZTogdmFsdWVcbiAgICAgIH0sXG4gICAgICB2YWx1ZVxuICAgIH0sIHN0eClcbiAgfSxcbiAga2V5d29yZDoge1xuXHRcdG1hdGNoOiB0b2tlbiA9PiAhVHlwZXMuZGVsaW1pdGVyLm1hdGNoKHRva2VuKSAmJiB0b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLktleXdvcmQsXG4gICAgY3JlYXRlOiAodmFsdWUsIHN0eCkgPT4gbmV3IFN5bnRheCh7XG4gICAgICB0eXBlOiB7XG4gICAgICAgIGtsYXNzOiBUb2tlbkNsYXNzLktleXdvcmQsXG4gICAgICAgIG5hbWU6IHZhbHVlXG4gICAgICB9LFxuICAgICAgdmFsdWVcbiAgICB9LCBzdHgpXG4gIH0sXG4gIGlkZW50aWZpZXI6IHtcblx0XHRtYXRjaDogdG9rZW4gPT4gIVR5cGVzLmRlbGltaXRlci5tYXRjaCh0b2tlbikgJiYgdG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5JZGVudCxcbiAgICBjcmVhdGU6ICh2YWx1ZSwgc3R4KSA9PiBuZXcgU3ludGF4KHtcbiAgICAgIHR5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLFxuICAgICAgdmFsdWVcbiAgICB9LCBzdHgpXG4gIH0sXG4gIHJlZ3VsYXJFeHByZXNzaW9uOiB7XG5cdFx0bWF0Y2g6IHRva2VuID0+ICFUeXBlcy5kZWxpbWl0ZXIubWF0Y2godG9rZW4pICYmIHRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUmVndWxhckV4cHJlc3Npb24sXG4gICAgY3JlYXRlOiAodmFsdWUsIHN0eCkgPT4gbmV3IFN5bnRheCh7XG4gICAgICB0eXBlOiBUb2tlblR5cGUuUkVHRVhQLFxuICAgICAgdmFsdWVcbiAgICB9LCBzdHgpXG4gIH0sXG4gIGJyYWNlczoge1xuXHRcdG1hdGNoOiB0b2tlbiA9PiBUeXBlcy5kZWxpbWl0ZXIubWF0Y2godG9rZW4pICYmXG4gICAgICAgICAgIHRva2VuLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNFLFxuICAgIGNyZWF0ZTogKGlubmVyLCBzdHgpID0+IHtcbiAgICAgIGxldCBsZWZ0ID0gbmV3IFN5bnRheCh7XG4gICAgICAgIHR5cGU6IFRva2VuVHlwZS5MQlJBQ0UsXG4gICAgICAgIHZhbHVlOiBcIntcIixcbiAgICAgICAgc2xpY2U6IGdldEZpcnN0U2xpY2Uoc3R4KVxuICAgICAgfSk7XG4gICAgICBsZXQgcmlnaHQgPSBuZXcgU3ludGF4KHtcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLlJCUkFDRSxcbiAgICAgICAgdmFsdWU6IFwifVwiLFxuICAgICAgICBzbGljZTogZ2V0Rmlyc3RTbGljZShzdHgpXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdCkuY29uY2F0KGlubmVyKS5wdXNoKHJpZ2h0KSwgc3R4KTtcbiAgICB9XG4gIH0sXG4gIGJyYWNrZXRzOiB7XG5cdFx0bWF0Y2g6IHRva2VuID0+IFR5cGVzLmRlbGltaXRlci5tYXRjaCh0b2tlbikgJiZcbiAgICAgICAgICAgdG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0ssXG4gICAgY3JlYXRlOiAoaW5uZXIsIHN0eCkgPT4ge1xuICAgICAgbGV0IGxlZnQgPSBuZXcgU3ludGF4KHtcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLkxCUkFDSyxcbiAgICAgICAgdmFsdWU6IFwiW1wiLFxuICAgICAgICBzbGljZTogZ2V0Rmlyc3RTbGljZShzdHgpXG4gICAgICB9KTtcbiAgICAgIGxldCByaWdodCA9IG5ldyBTeW50YXgoe1xuICAgICAgICB0eXBlOiBUb2tlblR5cGUuUkJSQUNLLFxuICAgICAgICB2YWx1ZTogXCJdXCIsXG4gICAgICAgIHNsaWNlOiBnZXRGaXJzdFNsaWNlKHN0eClcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0KS5jb25jYXQoaW5uZXIpLnB1c2gocmlnaHQpLCBzdHgpO1xuICAgIH1cbiAgfSxcbiAgcGFyZW5zOiB7XG5cdFx0bWF0Y2g6IHRva2VuID0+IFR5cGVzLmRlbGltaXRlci5tYXRjaCh0b2tlbikgJiZcbiAgICAgICAgICAgdG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sXG4gICAgY3JlYXRlOiAoaW5uZXIsIHN0eCkgPT4ge1xuICAgICAgbGV0IGxlZnQgPSBuZXcgU3ludGF4KHtcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLkxQQVJFTixcbiAgICAgICAgdmFsdWU6IFwiKFwiLFxuICAgICAgICBzbGljZTogZ2V0Rmlyc3RTbGljZShzdHgpXG4gICAgICB9KTtcbiAgICAgIGxldCByaWdodCA9IG5ldyBTeW50YXgoe1xuICAgICAgICB0eXBlOiBUb2tlblR5cGUuUlBBUkVOLFxuICAgICAgICB2YWx1ZTogXCIpXCIsXG4gICAgICAgIHNsaWNlOiBnZXRGaXJzdFNsaWNlKHN0eClcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0KS5jb25jYXQoaW5uZXIpLnB1c2gocmlnaHQpLCBzdHgpO1xuICAgIH1cbiAgfSxcblxuICBhc3NpZ246IHtcbiAgICBtYXRjaDogdG9rZW4gPT4ge1xuICAgICAgaWYgKFR5cGVzLnB1bmN0dWF0b3IubWF0Y2godG9rZW4pKSB7XG4gICAgICAgIHN3aXRjaCAodG9rZW4udmFsdWUpIHtcbiAgICAgICAgICBjYXNlIFwiPVwiOlxuICAgICAgICAgIGNhc2UgXCJ8PVwiOlxuICAgICAgICAgIGNhc2UgXCJePVwiOlxuICAgICAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgICAgIGNhc2UgXCI8PD1cIjpcbiAgICAgICAgICBjYXNlIFwiPj49XCI6XG4gICAgICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgICAgICBjYXNlIFwiKz1cIjpcbiAgICAgICAgICBjYXNlIFwiLT1cIjpcbiAgICAgICAgICBjYXNlIFwiKj1cIjpcbiAgICAgICAgICBjYXNlIFwiLz1cIjpcbiAgICAgICAgICBjYXNlIFwiJT1cIjpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgYm9vbGVhbjoge1xuICAgIG1hdGNoOiB0b2tlbiA9PiAhVHlwZXMuZGVsaW1pdGVyLm1hdGNoKHRva2VuKSAmJiB0b2tlbi50eXBlID09PSBUb2tlblR5cGUuVFJVRSB8fFxuICAgICAgICAgICB0b2tlbi50eXBlID09PSBUb2tlblR5cGUuRkFMU0VcbiAgfSxcblxuICB0ZW1wbGF0ZToge1xuICAgIG1hdGNoOiB0b2tlbiA9PiAhVHlwZXMuZGVsaW1pdGVyLm1hdGNoKHRva2VuKSAmJiB0b2tlbi50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEVcbiAgfSxcblxuICBkZWxpbWl0ZXI6IHtcbiAgICBtYXRjaDogdG9rZW4gPT4gTGlzdC5pc0xpc3QodG9rZW4pXG4gIH0sXG5cbiAgc3ludGF4VGVtcGxhdGU6IHtcbiAgICBtYXRjaDogdG9rZW4gPT4gVHlwZXMuZGVsaW1pdGVyLm1hdGNoKHRva2VuKSAmJiB0b2tlbi5nZXQoMCkudmFsKCkgPT09ICcjYCdcbiAgfSxcblxuICBlb2Y6IHtcbiAgICBtYXRjaDogdG9rZW4gPT4gIVR5cGVzLmRlbGltaXRlci5tYXRjaCh0b2tlbikgJiYgdG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkVPU1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBBTExfUEhBU0VTID0ge307XG5cbnR5cGUgU2NvcGVzZXQgPSB7XG4gIGFsbDogTGlzdDxhbnk+O1xuICBwaGFzZTogTWFwPG51bWJlciwgYW55Pjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ludGF4IHtcbiAgLy8gdG9rZW46IFRva2VuIHwgTGlzdDxUb2tlbj47XG4gIHRva2VuOiBhbnk7XG4gIGJpbmRpbmdzOiBCaW5kaW5nTWFwO1xuICBzY29wZXNldHM6IFNjb3Blc2V0O1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuOiBhbnksIG9sZHN0eDogP3sgYmluZGluZ3M6IGFueTsgc2NvcGVzZXRzOiBhbnl9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMuYmluZGluZ3MgPSBvbGRzdHggJiYgKG9sZHN0eC5iaW5kaW5ncyAhPSBudWxsKSA/IG9sZHN0eC5iaW5kaW5ncyA6IG5ldyBCaW5kaW5nTWFwKCk7XG4gICAgdGhpcy5zY29wZXNldHMgPSBvbGRzdHggJiYgKG9sZHN0eC5zY29wZXNldHMgIT0gbnVsbCkgPyBvbGRzdHguc2NvcGVzZXRzIDoge1xuICAgICAgYWxsOiBMaXN0KCksXG4gICAgICBwaGFzZTogTWFwKClcbiAgICB9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cblxuICBzdGF0aWMgb2YodG9rZW46IFRva2VuLCBzdHg6ID9TeW50YXgpIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbiwgc3R4KTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tKHR5cGUsIHZhbHVlLCBzdHg6ID9TeW50YXgpIHtcbiAgICBpZiAoIVR5cGVzW3R5cGVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZSArIFwiIGlzIG5vdCBhIHZhbGlkIHR5cGVcIik7XG4gICAgfVxuICAgIGVsc2UgaWYgKCFUeXBlc1t0eXBlXS5jcmVhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBzeW50YXggZnJvbSB0eXBlIFwiICsgdHlwZSk7XG4gICAgfVxuICAgIGxldCBuZXdzdHggPSBUeXBlc1t0eXBlXS5jcmVhdGUodmFsdWUsIHN0eCk7XG4gICAgbGV0IHNsaWNlID0gZ2V0Rmlyc3RTbGljZShzdHgpO1xuICAgIGlmIChzbGljZSAhPSBudWxsKSB7XG4gICAgICBuZXdzdHgudG9rZW4uc2xpY2UgPSBzbGljZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld3N0eDtcbiAgfVxuXG4gIGZyb20odHlwZTogVG9rZW5UYWcsIHZhbHVlOiBhbnkpIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20odHlwZSwgdmFsdWUsIHRoaXMpO1xuICB9XG5cbiAgZnJvbU51bGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcIm51bGxcIiwgbnVsbCk7XG4gIH1cblxuICBmcm9tTnVtYmVyKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKCdudW1iZXInLCB2YWx1ZSk7XG4gIH1cblxuICBmcm9tU3RyaW5nKHZhbHVlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwic3RyaW5nXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGZyb21QdW5jdHVhdG9yKHZhbHVlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZSk7XG4gIH1cblxuICBmcm9tS2V5d29yZCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImtleXdvcmRcIiwgdmFsdWUpO1xuICB9XG5cbiAgZnJvbUlkZW50aWZpZXIodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJpZGVudGlmaWVyXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGZyb21CcmFjZXMoaW5uZXI6IExpc3Q8U3ludGF4Pikge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJicmFjZXNcIiwgaW5uZXIpO1xuICB9XG5cbiAgZnJvbUJyYWNrZXRzKGlubmVyOiBMaXN0PFN5bnRheD4pIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwiYnJhY2tldHNcIiwgaW5uZXIpO1xuICB9XG5cbiAgZnJvbVBhcmVucyhpbm5lcjogTGlzdDxTeW50YXg+KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInBhcmVuc1wiLCBpbm5lcik7XG4gIH1cblxuICBzdGF0aWMgZnJvbU51bGwoc3R4OiBTeW50YXgpIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJudWxsXCIsIG51bGwsIHN0eCk7XG4gIH1cblxuICBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZSwgc3R4KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwibnVtYmVyXCIsIHZhbHVlLCBzdHgpO1xuICB9XG5cbiAgc3RhdGljIGZyb21TdHJpbmcodmFsdWUsIHN0eCkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInN0cmluZ1wiLCB2YWx1ZSwgc3R4KTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUHVuY3R1YXRvcih2YWx1ZSwgc3R4KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZSwgc3R4KTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZSwgc3R4KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwia2V5d29yZFwiLCB2YWx1ZSwgc3R4KTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSWRlbnRpZmllcih2YWx1ZSwgc3R4KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiaWRlbnRpZmllclwiLCB2YWx1ZSwgc3R4KTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWUsIHN0eCkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlLCBzdHgpO1xuICB9XG5cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXIsIHN0eCkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImJyYWNlc1wiLCBpbm5lciwgc3R4KTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tQnJhY2tldHMoaW5uZXIsIHN0eCkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImJyYWNrZXRzXCIsIGlubmVyLCBzdHgpO1xuICB9XG5cbiAgc3RhdGljIGZyb21QYXJlbnMoaW5uZXIsIHN0eCkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInBhcmVuc1wiLCBpbm5lciwgc3R4KTtcbiAgfVxuXG4gIC8vICgpIC0+IHN0cmluZ1xuICByZXNvbHZlKHBoYXNlOiBhbnkpIHtcbiAgICBhc3NlcnQocGhhc2UgIT0gbnVsbCwgXCJtdXN0IHByb3ZpZGUgYSBwaGFzZSB0byByZXNvbHZlXCIpO1xuICAgIGxldCBhbGxTY29wZXMgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IHN0eFNjb3BlcyA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZSkgPyB0aGlzLnNjb3Blc2V0cy5waGFzZS5nZXQocGhhc2UpIDogTGlzdCgpO1xuICAgIHN0eFNjb3BlcyA9IGFsbFNjb3Blcy5jb25jYXQoc3R4U2NvcGVzKTtcbiAgICBpZiAoc3R4U2NvcGVzLnNpemUgPT09IDAgfHwgISh0aGlzLm1hdGNoKCdpZGVudGlmaWVyJykgfHwgdGhpcy5tYXRjaCgna2V5d29yZCcpKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gICAgfVxuICAgIGxldCBzY29wZSA9IHN0eFNjb3Blcy5sYXN0KCk7XG4gICAgbGV0IGJpbmRpbmdzID0gdGhpcy5iaW5kaW5ncztcbiAgICBpZiAoc2NvcGUpIHtcbiAgICAgIC8vIExpc3Q8eyBzY29wZXM6IExpc3Q8U2NvcGU+LCBiaW5kaW5nOiBTeW1ib2wgfT5cbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3MuZ2V0KHRoaXMpO1xuXG4gICAgICBpZiAoc2NvcGVzZXRCaW5kaW5nTGlzdCkge1xuICAgICAgICAvLyB7IHNjb3BlczogTGlzdDxTY29wZT4sIGJpbmRpbmc6IFN5bWJvbCB9XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blcyk7XG4gICAgICAgIH0pLnNvcnQoc2l6ZURlY2VuZGluZyk7XG5cbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiZcbiAgICAgICAgICAgIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuc2NvcGVzLnNpemUgPT09IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMSkuc2NvcGVzLnNpemUpIHtcbiAgICAgICAgICBsZXQgZGVidWdCYXNlID0gJ3snICsgc3R4U2NvcGVzLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbignLCAnKSArICd9JztcbiAgICAgICAgICBsZXQgZGVidWdBbWJpZ291c1Njb3Blc2V0cyA9IGJpZ2dlc3RCaW5kaW5nUGFpci5tYXAoKHtzY29wZXN9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJ3snICsgc2NvcGVzLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbignLCAnKSArICd9JztcbiAgICAgICAgICB9KS5qb2luKCcsICcpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2NvcGVzZXQgJyArIGRlYnVnQmFzZSArICcgaGFzIGFtYmlndW91cyBzdWJzZXRzICcgKyBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChiaWdnZXN0QmluZGluZ1BhaXIuc2l6ZSAhPT0gMCkge1xuICAgICAgICAgIGxldCBiaW5kaW5nU3RyID0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5iaW5kaW5nLnRvU3RyaW5nKCk7XG4gICAgICAgICAgaWYgKE1heWJlLmlzSnVzdChiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzKSkge1xuICAgICAgICAgICAgLy8gbnVsbCBuZXZlciBoYXBwZW5zIGJlY2F1c2Ugd2UganVzdCBjaGVja2VkIGlmIGl0IGlzIGEgSnVzdFxuICAgICAgICAgICAgcmV0dXJuIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYWxpYXMuZ2V0T3JFbHNlKG51bGwpLnJlc29sdmUocGhhc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYmluZGluZ1N0cjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxuXG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2Fubm90IGdldCB0aGUgdmFsIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLml0ZW1zLm1hcChlbCA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZWwubWF0Y2ggPT09ICdmdW5jdGlvbicgJiYgZWwubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgICAgICByZXR1cm4gJyR7Li4ufSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsLnNsaWNlLnRleHQ7XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cblxuICBsaW5lTnVtYmVyKCkge1xuICAgIGlmICghdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5nZXQoMCkubGluZU51bWJlcigpO1xuICAgIH1cbiAgfVxuXG4gIHNldExpbmVOdW1iZXIobGluZTogbnVtYmVyKSB7XG4gICAgbGV0IG5ld1RvayA9IHt9O1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIG5ld1RvayA9IHRoaXMudG9rZW4ubWFwKHMgPT4gcy5zZXRMaW5lTnVtYmVyKGxpbmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMudG9rZW4pKSB7XG4gICAgICAgIG5ld1Rva1trZXldID0gdGhpcy50b2tlbltrZXldO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KG5ld1Rvay5zbGljZSAmJiBuZXdUb2suc2xpY2Uuc3RhcnRMb2NhdGlvbiwgJ2FsbCB0b2tlbnMgbXVzdCBoYXZlIGxpbmUgaW5mbycpO1xuICAgICAgbmV3VG9rLnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZSA9IGxpbmU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KG5ld1RvaywgdGhpcyk7XG4gIH1cblxuICAvLyAoKSAtPiBMaXN0PFN5bnRheD5cbiAgaW5uZXIoKSB7XG4gICAgYXNzZXJ0KHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuXG4gIGFkZFNjb3BlKHNjb3BlOiBhbnksIGJpbmRpbmdzOiBhbnksIHBoYXNlOiBudW1iZXIsIG9wdGlvbnM6IGFueSA9IHsgZmxpcDogZmFsc2UgfSkge1xuICAgIGxldCB0b2tlbiA9IHRoaXMubWF0Y2goJ2RlbGltaXRlcicpID8gdGhpcy50b2tlbi5tYXAocyA9PiBzLmFkZFNjb3BlKHNjb3BlLCBiaW5kaW5ncywgcGhhc2UsIG9wdGlvbnMpKSA6IHRoaXMudG9rZW47XG4gICAgaWYgKHRoaXMubWF0Y2goJ3RlbXBsYXRlJykpIHtcbiAgICAgIHRva2VuID0gXy5tZXJnZSh0b2tlbiwge1xuICAgICAgICBpdGVtczogdG9rZW4uaXRlbXMubWFwKGl0ID0+IHtcbiAgICAgICAgICBpZiAoaXQgaW5zdGFuY2VvZiBTeW50YXggJiYgaXQubWF0Y2goJ2RlbGltaXRlcicpKSB7XG4gICAgICAgICAgICByZXR1cm4gaXQuYWRkU2NvcGUoc2NvcGUsIGJpbmRpbmdzLCBwaGFzZSwgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBsZXQgb2xkU2NvcGVzZXQ7XG4gICAgaWYgKHBoYXNlID09PSBBTExfUEhBU0VTKSB7XG4gICAgICBvbGRTY29wZXNldCA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkU2NvcGVzZXQgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2UpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlKSA6IExpc3QoKTtcbiAgICB9XG4gICAgbGV0IG5ld1Njb3Blc2V0O1xuICAgIGlmIChvcHRpb25zLmZsaXApIHtcbiAgICAgIGxldCBpbmRleCA9IG9sZFNjb3Blc2V0LmluZGV4T2Yoc2NvcGUpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBuZXdTY29wZXNldCA9IG9sZFNjb3Blc2V0LnJlbW92ZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTY29wZXNldCA9IG9sZFNjb3Blc2V0LnB1c2goc2NvcGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY29wZXNldCA9IG9sZFNjb3Blc2V0LnB1c2goc2NvcGUpO1xuICAgIH1cbiAgICBsZXQgbmV3c3R4ID0ge1xuICAgICAgYmluZGluZ3MsXG4gICAgICBzY29wZXNldHM6IHtcbiAgICAgICAgYWxsOiB0aGlzLnNjb3Blc2V0cy5hbGwsXG4gICAgICAgIHBoYXNlOiB0aGlzLnNjb3Blc2V0cy5waGFzZVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAocGhhc2UgPT09IEFMTF9QSEFTRVMpIHtcbiAgICAgIG5ld3N0eC5zY29wZXNldHMuYWxsID0gbmV3U2NvcGVzZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld3N0eC5zY29wZXNldHMucGhhc2UgPSBuZXdzdHguc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZSwgbmV3U2NvcGVzZXQpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbiwgbmV3c3R4KTtcbiAgfVxuXG4gIHJlbW92ZVNjb3BlKHNjb3BlOiBhbnksIHBoYXNlOiBudW1iZXIpIHtcbiAgICBsZXQgdG9rZW4gPSB0aGlzLm1hdGNoKCdkZWxpbWl0ZXInKSA/IHRoaXMudG9rZW4ubWFwKHMgPT4gcy5yZW1vdmVTY29wZShzY29wZSwgcGhhc2UpKSA6IHRoaXMudG9rZW47XG4gICAgbGV0IHBoYXNlU2NvcGVzZXQgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2UpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlKSA6IExpc3QoKTtcbiAgICBsZXQgYWxsU2NvcGVzZXQgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IG5ld3N0eCA9IHtcbiAgICAgIGJpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLFxuICAgICAgc2NvcGVzZXRzOiB7XG4gICAgICAgIGFsbDogdGhpcy5zY29wZXNldHMuYWxsLFxuICAgICAgICBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2VcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IHBoYXNlSW5kZXggPSBwaGFzZVNjb3Blc2V0LmluZGV4T2Yoc2NvcGUpO1xuICAgIGxldCBhbGxJbmRleCA9IGFsbFNjb3Blc2V0LmluZGV4T2Yoc2NvcGUpO1xuICAgIGlmIChwaGFzZUluZGV4ICE9PSAtMSkge1xuICAgICAgbmV3c3R4LnNjb3Blc2V0cy5waGFzZSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZSwgcGhhc2VTY29wZXNldC5yZW1vdmUocGhhc2VJbmRleCkpO1xuICAgIH0gZWxzZSBpZiAoYWxsSW5kZXggIT09IC0xKSB7XG4gICAgICBuZXdzdHguc2NvcGVzZXRzLmFsbCA9IGFsbFNjb3Blc2V0LnJlbW92ZShhbGxJbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuLCBuZXdzdHgpO1xuICB9XG5cbiAgbWF0Y2godHlwZTogVG9rZW5UYWcsIHZhbHVlOiBhbnkpIHtcbiAgICBpZiAoIVR5cGVzW3R5cGVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZSArIFwiIGlzIGFuIGludmFsaWQgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFR5cGVzW3R5cGVdLm1hdGNoKHRoaXMudG9rZW4pICYmICh2YWx1ZSA9PSBudWxsIHx8XG4gICAgICAodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHAgPyB2YWx1ZS50ZXN0KHRoaXMudmFsKCkpIDogdGhpcy52YWwoKSA9PSB2YWx1ZSkpO1xuICB9XG5cbiAgaXNJZGVudGlmaWVyKHZhbHVlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImlkZW50aWZpZXJcIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNBc3NpZ24odmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzQm9vbGVhbkxpdGVyYWwodmFsdWU6IGJvb2xlYW4pIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNLZXl3b3JkKHZhbHVlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImtleXdvcmRcIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJudWxsXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzTnVtZXJpY0xpdGVyYWwodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzUHVuY3R1YXRvcih2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwdW5jdHVhdG9yXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzdHJpbmdcIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbih2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc1RlbXBsYXRlKHZhbHVlOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInRlbXBsYXRlXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzRGVsaW1pdGVyKHZhbHVlOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImRlbGltaXRlclwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc1BhcmVucyh2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNCcmFjZXModmFsdWU6IGFueSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYnJhY2VzXCIsIHZhbHVlKTtcbiAgfVxuXG4gIGlzQnJhY2tldHModmFsdWU6IGFueSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYnJhY2tldHNcIiwgdmFsdWUpO1xuICB9XG5cbiAgaXNTeW50YXhUZW1wbGF0ZSh2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZSk7XG4gIH1cblxuICBpc0VPRih2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJlb2ZcIiwgdmFsdWUpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbihcIiBcIik7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gXCInXCIgKyB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG59XG4iXX0=