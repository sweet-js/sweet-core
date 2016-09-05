"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tokenizer = require("shift-parser/dist/tokenizer");

var _tokenizer2 = _interopRequireDefault(_tokenizer);

var _immutable = require("immutable");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _ramda = require("ramda");

var R = _interopRequireWildcard(_ramda);

var _ramdaFantasy = require("ramda-fantasy");

var _errors = require("./errors");

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Just = _ramdaFantasy.Maybe.Just;
const Nothing = _ramdaFantasy.Maybe.Nothing;


const LSYNTAX = { name: 'left-syntax' };
const RSYNTAX = { name: 'right-syntax' };
const AT = { klass: _tokenizer.TokenClass.Punctuator, name: "@" };

// TODO: also, need to handle contextual yield
const literalKeywords = ['this', 'null', 'true', 'false'];

// Token -> Boolean
const isLeftBracket = R.whereEq({ type: _tokenizer.TokenType.LBRACK });
const isLeftBrace = R.whereEq({ type: _tokenizer.TokenType.LBRACE });
const isLeftParen = R.whereEq({ type: _tokenizer.TokenType.LPAREN });
const isRightBracket = R.whereEq({ type: _tokenizer.TokenType.RBRACK });
const isRightBrace = R.whereEq({ type: _tokenizer.TokenType.RBRACE });
const isRightParen = R.whereEq({ type: _tokenizer.TokenType.RPAREN });

const isEOS = R.whereEq({ type: _tokenizer.TokenType.EOS });

// const isHash = R.whereEq({ type: TokenType.IDENTIFIER, value: '#'});
const isLeftSyntax = R.whereEq({ type: LSYNTAX });
const isRightSyntax = R.whereEq({ type: RSYNTAX });

const isLeftDelimiter = R.anyPass([isLeftBracket, isLeftBrace, isLeftParen, isLeftSyntax]);

const isRightDelimiter = R.anyPass([isRightBracket, isRightBrace, isRightParen, isRightSyntax]);

const isMatchingDelimiters = R.cond([[isLeftBracket, (_, b) => isRightBracket(b)], [isLeftBrace, (_, b) => isRightBrace(b)], [isLeftParen, (_, b) => isRightParen(b)], [isLeftSyntax, (_, b) => isRightSyntax(b)], [R.T, R.F]]);

const assignOps = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];

const binaryOps = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];

const unaryOps = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];

// List -> Boolean
const isEmpty = R.whereEq({ size: 0 });

// Syntax -> Boolean
const isPunctuator = s => s.match("punctuator");
const isKeyword = s => s.match("keyword");
const isParens = s => s.match("parens");
const isBraces = s => s.match("braces");
const isIdentifier = s => s.match("identifier");

// Any -> Syntax -> Boolean
const isVal = R.curry((v, s) => s.val() === v);

// Syntax -> Boolean
const isDot = R.allPass([isPunctuator, isVal('.')]);
const isColon = R.allPass([isPunctuator, isVal(':')]);
const isFunctionKeyword = R.allPass([isKeyword, isVal('function')]);
const isOperator = s => (s.match("punctuator") || s.match("keyword")) && R.any(R.equals(s.val()), assignOps.concat(binaryOps).concat(unaryOps));
const isNonLiteralKeyword = R.allPass([isKeyword, s => R.none(R.equals(s.val()), literalKeywords)]);
const isKeywordExprPrefix = R.allPass([isKeyword, s => R.any(R.equals(s.val()), ['instanceof', 'typeof', 'delete', 'void', 'yield', 'throw', 'new', 'case'])]);
// List a -> a?
let last = p => p.last();
// List a -> Maybe a
let safeLast = R.pipe(R.cond([[isEmpty, R.always(Nothing())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last)]]));

// TODO: better name
// List -> Boolean -> Maybe List
let stuffTrue = R.curry((p, b) => b ? Just(p) : Nothing());
let stuffFalse = R.curry((p, b) => !b ? Just(p) : Nothing());

// List a -> Boolean
let isTopColon = R.pipe(safeLast, R.map(isColon), _ramdaFantasy.Maybe.maybe(false, R.identity));
// List a -> Boolean
let isTopPunctuator = R.pipe(safeLast, R.map(isPunctuator), _ramdaFantasy.Maybe.maybe(false, R.identity));

// Number -> List -> Boolean
let isExprReturn = R.curry((l, p) => {
  let retKwd = safeLast(p);
  let maybeDot = pop(p).chain(safeLast);

  if (maybeDot.map(isDot).getOrElse(false)) {
    return true;
  }
  return retKwd.map(s => {
    return s.match("keyword") && s.val() === 'return' && s.lineNumber() === l;
  }).getOrElse(false);
});

const isTopOperator = R.pipe(safeLast, R.map(isOperator), _ramdaFantasy.Maybe.maybe(false, R.identity));

const isTopKeywordExprPrefix = R.pipe(safeLast, R.map(isKeywordExprPrefix), _ramdaFantasy.Maybe.maybe(false, R.identity));

// Number -> Boolean -> List -> Boolean
let isExprPrefix = R.curry((l, b) => R.cond([
// ... ({x: 42} /r/i)
[isEmpty, R.always(b)],
// ... ({x: {x: 42} /r/i })
[isTopColon, R.always(b)],
// ... throw {x: 42} /r/i
[isTopKeywordExprPrefix, R.T],
// ... 42 + {x: 42} /r/i
[isTopOperator, R.T],
// ... for ( ; {x: 42}/r/i)
[isTopPunctuator, R.always(b)],
// ... return {x: 42} /r /i
// ... return\n{x: 42} /r /i
[isExprReturn(l), R.T], [R.T, R.F]]));

// List a -> Maybe List a
let curly = p => safeLast(p).map(isBraces).chain(stuffTrue(p));
let paren = p => safeLast(p).map(isParens).chain(stuffTrue(p));
let func = p => safeLast(p).map(isFunctionKeyword).chain(stuffTrue(p));
let ident = p => safeLast(p).map(isIdentifier).chain(stuffTrue(p));
let nonLiteralKeyword = p => safeLast(p).map(isNonLiteralKeyword).chain(stuffTrue(p));

let opt = R.curry((a, b, p) => {
  let result = R.pipeK(a, b)(_ramdaFantasy.Maybe.of(p));
  return _ramdaFantasy.Maybe.isJust(result) ? result : _ramdaFantasy.Maybe.of(p);
});

let notDot = R.ifElse(R.whereEq({ size: 0 }), Just, p => safeLast(p).map(s => !(s.match("punctuator") && s.val() === '.')).chain(stuffTrue(p)));

// List a -> Maybe List a
let pop = R.compose(Just, p => p.pop());

// Maybe List a -> Maybe List a
const functionPrefix = R.pipeK(curly, pop, paren, pop, opt(ident, pop), func);

// Boolean -> List a -> Boolean
const isRegexPrefix = b => R.anyPass([
// ε
isEmpty,
// P . t   where t ∈ Punctuator
isTopPunctuator,
// P . t . t'  where t \not = "." and t' ∈ (Keyword \setminus  LiteralKeyword)
R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword, pop, notDot), _ramdaFantasy.Maybe.isJust),
// P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren, pop, nonLiteralKeyword, pop, notDot), _ramdaFantasy.Maybe.isJust),
// P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
R.pipe(_ramdaFantasy.Maybe.of, functionPrefix, R.chain(p => {
  return safeLast(p).map(s => s.lineNumber()).chain(fnLine => {
    return pop(p).map(isExprPrefix(fnLine, b));
  }).chain(stuffFalse(p));
}), _ramdaFantasy.Maybe.isJust),
// P . {T}^l  where isExprPrefix(P, b, l) = false
p => {
  let alreadyCheckedFunction = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix, _ramdaFantasy.Maybe.isJust)(p);
  if (alreadyCheckedFunction) {
    return false;
  }
  return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly), R.chain(p => {
    return safeLast(p).map(s => s.lineNumber()).chain(curlyLine => {
      return pop(p).map(isExprPrefix(curlyLine, b));
    }).chain(stuffFalse(p));
  }), _ramdaFantasy.Maybe.isJust)(p);
}]);

function lastEl(l) {
  return l[l.length - 1];
}

class Reader extends _tokenizer2.default {
  constructor(strings, context, replacements) {
    super(Array.isArray(strings) ? strings.join('') : strings);
    this.delimStack = new Map();
    this.insideSyntaxTemplate = [false];
    this.context = context;

    // setup splicing replacement array
    if (Array.isArray(strings)) {
      let totalIndex = 0;
      this.replacementIndex = R.reduce((acc, strRep) => {
        acc.push({
          index: totalIndex + strRep[0].length,
          replacement: strRep[1]
        });
        totalIndex += strRep[0].length;
        return acc;
      }, [], R.zip(strings, replacements));
    }
  }

  read() {
    let stack = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    let b = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    let singleDelimiter = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    let prefix = (0, _immutable.List)();
    while (true) {
      let tok = this.advance(prefix, b);

      // splicing allows syntax and terms
      if (tok.scopesets || tok instanceof _terms2.default) {
        stack.push(tok);
        continue;
      }
      if (Array.isArray(tok)) {
        Array.prototype.push.apply(stack, tok);
        continue;
      }
      if (_immutable.List.isList(tok)) {
        Array.prototype.push.apply(stack, tok.toArray());
        continue;
      }

      if (isEOS(tok)) {
        if (stack[0] && isLeftDelimiter(stack[0].token)) {
          throw this.createUnexpected(tok);
        }
        break;
      }

      if (isLeftDelimiter(tok)) {
        if (isLeftSyntax(tok)) {
          this.insideSyntaxTemplate.push(true);
        }
        let line = tok.slice.startLocation.line;
        let innerB = isLeftBrace(tok) ? isExprPrefix(line, b)(prefix) : true;
        let inner = this.read([new _syntax2.default(tok, this.context)], innerB, false);
        let stx = new _syntax2.default(inner, this.context);
        prefix = prefix.concat(stx);
        stack.push(stx);
        if (singleDelimiter) {
          break;
        }
      } else if (isRightDelimiter(tok)) {
        if (stack[0] && !isMatchingDelimiters(stack[0].token, tok)) {
          throw this.createUnexpected(tok);
        }
        let stx = new _syntax2.default(tok, this.context);
        stack.push(stx);
        if (lastEl(this.insideSyntaxTemplate) && isRightSyntax(tok)) {
          this.insideSyntaxTemplate.pop();
        }
        break;
      } else {
        let stx = new _syntax2.default(tok, this.context);
        prefix = prefix.concat(stx);
        stack.push(stx);
      }
    }
    return (0, _immutable.List)(stack);
  }

  advance(prefix, b) {
    this.lastIndex = this.index;
    this.lastLine = this.line;
    this.lastLineStart = this.lineStart;

    this.skipComment();

    this.startIndex = this.index;
    this.startLine = this.line;
    this.startLineStart = this.lineStart;

    if (this.replacementIndex && this.replacementIndex[0] && this.index >= this.replacementIndex[0].index) {
      let rep = this.replacementIndex[0].replacement;
      this.replacementIndex.shift();
      return rep;
    }

    let charCode = this.source.charCodeAt(this.index);

    if (charCode === 0x60) {
      // `
      let element,
          items = [];
      let startLocation = this.getLocation();
      let start = this.index;
      this.index++;
      if (lastEl(this.insideSyntaxTemplate)) {

        let slice = this.getSlice(start, startLocation);
        return {
          type: RSYNTAX,
          value: '`',
          slice: slice
        };
      }
      do {
        element = this.scanTemplateElement();
        items.push(element);
        if (element.interp) {
          // only read the single delimiter
          element = this.read([], false, true);
          (0, _errors.assert)(element.size === 1, "should only have read a single delimiter inside a template");
          items.push(element.get(0));
        }
      } while (!element.tail);
      return {
        type: _tokenizer.TokenType.TEMPLATE,
        items: (0, _immutable.List)(items),
        slice: this.getSlice(start, startLocation)
      };
    } else if (charCode === 35) {
      // #
      let startLocation = this.getLocation();
      let start = this.index;
      let slice = this.getSlice(start, startLocation);
      this.index++;
      // TODO: handle ` inside of syntax template interpolations
      if (this.source.charCodeAt(this.index) === 0x60) {
        // `
        this.index++;
        return {
          type: LSYNTAX,
          value: '#`',
          slice: slice
        };
      }
      return {
        type: _tokenizer.TokenType.IDENTIFIER,
        value: '#',
        slice: slice
      };
    } else if (charCode === 64) {
      // @
      let startLocation = this.getLocation();
      let start = this.index;
      let slice = this.getSlice(start, startLocation);
      this.index++;
      return {
        type: AT,
        value: '@',
        slice: slice
      };
    }

    let lookahead = super.advance();
    if (lookahead.type === _tokenizer.TokenType.DIV && isRegexPrefix(b)(prefix)) {
      return super.scanRegExp("/");
    }
    return lookahead;
  }

  // need to override how templates are lexed because of delimiters
  scanTemplateElement() {
    let startLocation = this.getLocation();
    let start = this.index;
    while (this.index < this.source.length) {
      let ch = this.source.charCodeAt(this.index);
      switch (ch) {
        case 0x60:
          {
            // `
            // don't include the traling "`"
            let slice = this.getSlice(start, startLocation);
            this.index++;
            return {
              type: _tokenizer.TokenType.TEMPLATE,
              tail: true,
              interp: false,
              slice: slice
            };
          }
        case 0x24:
          // $
          if (this.source.charCodeAt(this.index + 1) === 0x7B) {
            // {
            // don't include the trailing "$"
            let slice = this.getSlice(start, startLocation);
            this.index += 1;
            return {
              type: _tokenizer.TokenType.TEMPLATE,
              tail: false,
              interp: true,
              slice: slice
            };
          }
          this.index++;
          break;
        case 0x5C:
          // \\
          {
            let octal = this.scanStringEscape("", null)[1];
            if (octal != null) {
              throw this.createILLEGAL();
            }
            break;
          }
        default:
          this.index++;
      }
    }

    throw this.createILLEGAL();
  }
}
exports.default = Reader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaGlmdC1yZWFkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOztJQUFZLEM7O0FBQ1o7O0FBQ0E7O0FBR0E7Ozs7Ozs7O0FBRkEsTUFBTSxPQUFPLG9CQUFNLElBQW5CO0FBQ0EsTUFBTSxVQUFVLG9CQUFNLE9BQXRCOzs7QUFHQSxNQUFNLFVBQVUsRUFBRSxNQUFNLGFBQVIsRUFBaEI7QUFDQSxNQUFNLFVBQVUsRUFBRSxNQUFNLGNBQVIsRUFBaEI7QUFDQSxNQUFNLEtBQUssRUFBRSxPQUFPLHNCQUFXLFVBQXBCLEVBQWdDLE1BQU0sR0FBdEMsRUFBWDs7QUFHQTtBQUNBLE1BQU0sa0JBQWtCLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsT0FBekIsQ0FBeEI7O0FBRUE7QUFDQSxNQUFNLGdCQUFpQixFQUFFLE9BQUYsQ0FBVSxFQUFFLE1BQU0scUJBQVUsTUFBbEIsRUFBVixDQUF2QjtBQUNBLE1BQU0sY0FBaUIsRUFBRSxPQUFGLENBQVUsRUFBRSxNQUFNLHFCQUFVLE1BQWxCLEVBQVYsQ0FBdkI7QUFDQSxNQUFNLGNBQWlCLEVBQUUsT0FBRixDQUFVLEVBQUUsTUFBTSxxQkFBVSxNQUFsQixFQUFWLENBQXZCO0FBQ0EsTUFBTSxpQkFBaUIsRUFBRSxPQUFGLENBQVUsRUFBRSxNQUFNLHFCQUFVLE1BQWxCLEVBQVYsQ0FBdkI7QUFDQSxNQUFNLGVBQWlCLEVBQUUsT0FBRixDQUFVLEVBQUUsTUFBTSxxQkFBVSxNQUFsQixFQUFWLENBQXZCO0FBQ0EsTUFBTSxlQUFpQixFQUFFLE9BQUYsQ0FBVSxFQUFFLE1BQU0scUJBQVUsTUFBbEIsRUFBVixDQUF2Qjs7QUFFQSxNQUFNLFFBQVEsRUFBRSxPQUFGLENBQVUsRUFBRSxNQUFNLHFCQUFVLEdBQWxCLEVBQVYsQ0FBZDs7QUFFQTtBQUNBLE1BQU0sZUFBZSxFQUFFLE9BQUYsQ0FBVSxFQUFFLE1B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anMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVG9rZW5pemVyIGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmltcG9ydCB7IFRva2VuQ2xhc3MsIFRva2VuVHlwZSB9IGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmltcG9ydCB7IExpc3QgfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0ICogYXMgUiBmcm9tICdyYW1kYSc7XG5pbXBvcnQgeyBNYXliZSB9IGZyb20gJ3JhbWRhLWZhbnRhc3knO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi9lcnJvcnMnO1xuY29uc3QgSnVzdCA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nID0gTWF5YmUuTm90aGluZztcbmltcG9ydCBUZXJtIGZyb20gJy4vdGVybXMnO1xuXG5jb25zdCBMU1lOVEFYID0geyBuYW1lOiAnbGVmdC1zeW50YXgnIH07XG5jb25zdCBSU1lOVEFYID0geyBuYW1lOiAncmlnaHQtc3ludGF4JyB9O1xuY29uc3QgQVQgPSB7IGtsYXNzOiBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIG5hbWU6IFwiQFwiIH07XG5cblxuLy8gVE9ETzogYWxzbywgbmVlZCB0byBoYW5kbGUgY29udGV4dHVhbCB5aWVsZFxuY29uc3QgbGl0ZXJhbEtleXdvcmRzID0gWyd0aGlzJywgJ251bGwnLCAndHJ1ZScsICdmYWxzZSddO1xuXG4vLyBUb2tlbiAtPiBCb29sZWFuXG5jb25zdCBpc0xlZnRCcmFja2V0ICA9IFIud2hlcmVFcSh7IHR5cGU6IFRva2VuVHlwZS5MQlJBQ0sgfSk7XG5jb25zdCBpc0xlZnRCcmFjZSAgICA9IFIud2hlcmVFcSh7IHR5cGU6IFRva2VuVHlwZS5MQlJBQ0UgfSk7XG5jb25zdCBpc0xlZnRQYXJlbiAgICA9IFIud2hlcmVFcSh7IHR5cGU6IFRva2VuVHlwZS5MUEFSRU4gfSk7XG5jb25zdCBpc1JpZ2h0QnJhY2tldCA9IFIud2hlcmVFcSh7IHR5cGU6IFRva2VuVHlwZS5SQlJBQ0sgfSk7XG5jb25zdCBpc1JpZ2h0QnJhY2UgICA9IFIud2hlcmVFcSh7IHR5cGU6IFRva2VuVHlwZS5SQlJBQ0UgfSk7XG5jb25zdCBpc1JpZ2h0UGFyZW4gICA9IFIud2hlcmVFcSh7IHR5cGU6IFRva2VuVHlwZS5SUEFSRU4gfSk7XG5cbmNvbnN0IGlzRU9TID0gUi53aGVyZUVxKHsgdHlwZTogVG9rZW5UeXBlLkVPUyB9KTtcblxuLy8gY29uc3QgaXNIYXNoID0gUi53aGVyZUVxKHsgdHlwZTogVG9rZW5UeXBlLklERU5USUZJRVIsIHZhbHVlOiAnIyd9KTtcbmNvbnN0IGlzTGVmdFN5bnRheCA9IFIud2hlcmVFcSh7IHR5cGU6IExTWU5UQVggfSk7XG5jb25zdCBpc1JpZ2h0U3ludGF4ID0gUi53aGVyZUVxKHsgdHlwZTogUlNZTlRBWCB9KTtcblxuY29uc3QgaXNMZWZ0RGVsaW1pdGVyID0gUi5hbnlQYXNzKFtpc0xlZnRCcmFja2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0xlZnRCcmFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNMZWZ0UGFyZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTGVmdFN5bnRheF0pO1xuXG5jb25zdCBpc1JpZ2h0RGVsaW1pdGVyID0gUi5hbnlQYXNzKFtpc1JpZ2h0QnJhY2tldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmlnaHRCcmFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmlnaHRQYXJlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmlnaHRTeW50YXhdKTtcblxuY29uc3QgaXNNYXRjaGluZ0RlbGltaXRlcnMgPSBSLmNvbmQoW1xuICBbaXNMZWZ0QnJhY2tldCwgKF8sIGIpID0+IGlzUmlnaHRCcmFja2V0KGIpXSxcbiAgW2lzTGVmdEJyYWNlLCAoXywgYikgPT4gaXNSaWdodEJyYWNlKGIpXSxcbiAgW2lzTGVmdFBhcmVuLCAoXywgYikgPT4gaXNSaWdodFBhcmVuKGIpXSxcbiAgW2lzTGVmdFN5bnRheCwgKF8sIGIpID0+IGlzUmlnaHRTeW50YXgoYildLFxuICBbUi5ULCBSLkZdXG5dKTtcblxuY29uc3QgYXNzaWduT3BzID0gIFtcIj1cIiwgXCIrPVwiLCBcIi09XCIsIFwiKj1cIiwgXCIvPVwiLCBcIiU9XCIsIFwiPDw9XCIsIFwiPj49XCIsIFwiPj4+PVwiLFxuICAgICAgICAgICAgICAgICAgXCImPVwiLCBcInw9XCIsIFwiXj1cIiwgXCIsXCJdO1xuXG5jb25zdCBiaW5hcnlPcHMgPSBbXCIrXCIsIFwiLVwiLCBcIipcIiwgXCIvXCIsIFwiJVwiLFwiPDxcIiwgXCI+PlwiLCBcIj4+PlwiLCBcIiZcIiwgXCJ8XCIsIFwiXlwiLFxuICAgICAgICAgICAgICAgICBcIiYmXCIsIFwifHxcIiwgXCI/XCIsIFwiOlwiLFxuICAgICAgICAgICAgICAgICBcIj09PVwiLCBcIj09XCIsIFwiPj1cIiwgXCI8PVwiLCBcIjxcIiwgXCI+XCIsIFwiIT1cIiwgXCIhPT1cIiwgXCJpbnN0YW5jZW9mXCJdO1xuXG5jb25zdCB1bmFyeU9wcyA9IFtcIisrXCIsIFwiLS1cIiwgXCJ+XCIsIFwiIVwiLCBcImRlbGV0ZVwiLCBcInZvaWRcIiwgXCJ0eXBlb2ZcIiwgXCJ5aWVsZFwiLCBcInRocm93XCIsIFwibmV3XCJdO1xuXG4vLyBMaXN0IC0+IEJvb2xlYW5cbmNvbnN0IGlzRW1wdHkgPSBSLndoZXJlRXEoe3NpemU6IDB9KTtcblxuLy8gU3ludGF4IC0+IEJvb2xlYW5cbmNvbnN0IGlzUHVuY3R1YXRvciA9IHMgPT4gcy5tYXRjaChcInB1bmN0dWF0b3JcIik7XG5jb25zdCBpc0tleXdvcmQgPSBzID0+IHMubWF0Y2goXCJrZXl3b3JkXCIpO1xuY29uc3QgaXNQYXJlbnMgPSBzID0+IHMubWF0Y2goXCJwYXJlbnNcIik7XG5jb25zdCBpc0JyYWNlcyA9IHMgPT4gcy5tYXRjaChcImJyYWNlc1wiKTtcbmNvbnN0IGlzSWRlbnRpZmllciA9IHMgPT4gcy5tYXRjaChcImlkZW50aWZpZXJcIik7XG5cbi8vIEFueSAtPiBTeW50YXggLT4gQm9vbGVhblxuY29uc3QgaXNWYWwgPSBSLmN1cnJ5KCh2LCBzKSA9PiBzLnZhbCgpID09PSB2KTtcblxuLy8gU3ludGF4IC0+IEJvb2xlYW5cbmNvbnN0IGlzRG90ID0gUi5hbGxQYXNzKFtpc1B1bmN0dWF0b3IsIGlzVmFsKCcuJyldKTtcbmNvbnN0IGlzQ29sb24gPSBSLmFsbFBhc3MoW2lzUHVuY3R1YXRvciwgaXNWYWwoJzonKV0pO1xuY29uc3QgaXNGdW5jdGlvbktleXdvcmQgPSBSLmFsbFBhc3MoW2lzS2V5d29yZCwgaXNWYWwoJ2Z1bmN0aW9uJyldKTtcbmNvbnN0IGlzT3BlcmF0b3IgPSBzID0+IChzLm1hdGNoKFwicHVuY3R1YXRvclwiKSB8fCBzLm1hdGNoKFwia2V5d29yZFwiKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgUi5hbnkoUi5lcXVhbHMocy52YWwoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk9wcy5jb25jYXQoYmluYXJ5T3BzKS5jb25jYXQodW5hcnlPcHMpKTtcbmNvbnN0IGlzTm9uTGl0ZXJhbEtleXdvcmQgPSBSLmFsbFBhc3MoW2lzS2V5d29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPT4gUi5ub25lKFIuZXF1YWxzKHMudmFsKCkpLCBsaXRlcmFsS2V5d29yZHMpXSk7XG5jb25zdCBpc0tleXdvcmRFeHByUHJlZml4ID0gUi5hbGxQYXNzKFtpc0tleXdvcmQsXG4gIHMgPT4gUi5hbnkoUi5lcXVhbHMocy52YWwoKSksIFsnaW5zdGFuY2VvZicsICd0eXBlb2YnLCAnZGVsZXRlJywgJ3ZvaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5aWVsZCcsICd0aHJvdycsICduZXcnLCAnY2FzZSddKV0pO1xuLy8gTGlzdCBhIC0+IGE/XG5sZXQgbGFzdCA9IHAgPT4gcC5sYXN0KCk7XG4vLyBMaXN0IGEgLT4gTWF5YmUgYVxubGV0IHNhZmVMYXN0ID0gUi5waXBlKFIuY29uZChbXG4gIFtpc0VtcHR5LCBSLmFsd2F5cyhOb3RoaW5nKCkpXSxcbiAgW1IuVCwgUi5jb21wb3NlKE1heWJlLm9mLCBsYXN0KV1cbl0pKTtcblxuLy8gVE9ETzogYmV0dGVyIG5hbWVcbi8vIExpc3QgLT4gQm9vbGVhbiAtPiBNYXliZSBMaXN0XG5sZXQgc3R1ZmZUcnVlID0gUi5jdXJyeSgocCwgYikgPT4gYiA/IEp1c3QocCkgOiBOb3RoaW5nKCkpO1xubGV0IHN0dWZmRmFsc2UgPSBSLmN1cnJ5KChwLCBiKSA9PiAhYiA/IEp1c3QocCkgOiBOb3RoaW5nKCkpO1xuXG4vLyBMaXN0IGEgLT4gQm9vbGVhblxubGV0IGlzVG9wQ29sb24gPSBSLnBpcGUoXG4gIHNhZmVMYXN0LFxuICBSLm1hcChpc0NvbG9uKSxcbiAgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpXG4pO1xuLy8gTGlzdCBhIC0+IEJvb2xlYW5cbmxldCBpc1RvcFB1bmN0dWF0b3IgPSBSLnBpcGUoXG4gIHNhZmVMYXN0LFxuICBSLm1hcChpc1B1bmN0dWF0b3IpLFxuICBNYXliZS5tYXliZShmYWxzZSwgUi5pZGVudGl0eSlcbik7XG5cbi8vIE51bWJlciAtPiBMaXN0IC0+IEJvb2xlYW5cbmxldCBpc0V4cHJSZXR1cm4gPSBSLmN1cnJ5KChsLCBwKSA9PiB7XG4gIGxldCByZXRLd2QgPSBzYWZlTGFzdChwKTtcbiAgbGV0IG1heWJlRG90ID0gcG9wKHApLmNoYWluKHNhZmVMYXN0KTtcblxuICBpZiAobWF5YmVEb3QubWFwKGlzRG90KS5nZXRPckVsc2UoZmFsc2UpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHJldEt3ZC5tYXAocyA9PiB7XG4gICAgcmV0dXJuIHMubWF0Y2goXCJrZXl3b3JkXCIpICYmIHMudmFsKCkgPT09ICdyZXR1cm4nICYmIHMubGluZU51bWJlcigpID09PSBsO1xuICB9KS5nZXRPckVsc2UoZmFsc2UpO1xufSk7XG5cbmNvbnN0IGlzVG9wT3BlcmF0b3IgPSBSLnBpcGUoXG4gIHNhZmVMYXN0LFxuICBSLm1hcChpc09wZXJhdG9yKSxcbiAgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpXG4pO1xuXG5jb25zdCBpc1RvcEtleXdvcmRFeHByUHJlZml4ID0gUi5waXBlKFxuICBzYWZlTGFzdCxcbiAgUi5tYXAoaXNLZXl3b3JkRXhwclByZWZpeCksXG4gIE1heWJlLm1heWJlKGZhbHNlLCBSLmlkZW50aXR5KVxuKTtcblxuLy8gTnVtYmVyIC0+IEJvb2xlYW4gLT4gTGlzdCAtPiBCb29sZWFuXG5sZXQgaXNFeHByUHJlZml4ID0gUi5jdXJyeSgobCwgYikgPT4gUi5jb25kKFtcbiAgLy8gLi4uICh7eDogNDJ9IC9yL2kpXG4gIFtpc0VtcHR5LCBSLmFsd2F5cyhiKV0sXG4gIC8vIC4uLiAoe3g6IHt4OiA0Mn0gL3IvaSB9KVxuICBbaXNUb3BDb2xvbiwgUi5hbHdheXMoYildLFxuICAvLyAuLi4gdGhyb3cge3g6IDQyfSAvci9pXG4gIFtpc1RvcEtleXdvcmRFeHByUHJlZml4LCBSLlRdLFxuICAvLyAuLi4gNDIgKyB7eDogNDJ9IC9yL2lcbiAgW2lzVG9wT3BlcmF0b3IsIFIuVF0sXG4gIC8vIC4uLiBmb3IgKCA7IHt4OiA0Mn0vci9pKVxuICBbaXNUb3BQdW5jdHVhdG9yLCBSLmFsd2F5cyhiKV0sXG4gIC8vIC4uLiByZXR1cm4ge3g6IDQyfSAvciAvaVxuICAvLyAuLi4gcmV0dXJuXFxue3g6IDQyfSAvciAvaVxuICBbaXNFeHByUmV0dXJuKGwpLCBSLlRdLFxuICBbUi5ULCBSLkZdLFxuXSkpO1xuXG4vLyBMaXN0IGEgLT4gTWF5YmUgTGlzdCBhXG5sZXQgY3VybHkgPSBwID0+IHNhZmVMYXN0KHApLm1hcChpc0JyYWNlcykuY2hhaW4oc3R1ZmZUcnVlKHApKTtcbmxldCBwYXJlbiA9IHAgPT4gc2FmZUxhc3QocCkubWFwKGlzUGFyZW5zKS5jaGFpbihzdHVmZlRydWUocCkpO1xubGV0IGZ1bmMgPSBwID0+IHNhZmVMYXN0KHApLm1hcChpc0Z1bmN0aW9uS2V5d29yZCkuY2hhaW4oc3R1ZmZUcnVlKHApKTtcbmxldCBpZGVudCA9IHAgPT4gc2FmZUxhc3QocCkubWFwKGlzSWRlbnRpZmllcikuY2hhaW4oc3R1ZmZUcnVlKHApKTtcbmxldCBub25MaXRlcmFsS2V5d29yZCA9IHAgPT4gc2FmZUxhc3QocCkubWFwKGlzTm9uTGl0ZXJhbEtleXdvcmQpLmNoYWluKHN0dWZmVHJ1ZShwKSk7XG5cbmxldCBvcHQgPSBSLmN1cnJ5KChhLCBiLCBwKSA9PiB7XG4gIGxldCByZXN1bHQgPSBSLnBpcGVLKGEsIGIpKE1heWJlLm9mKHApKTtcbiAgcmV0dXJuIE1heWJlLmlzSnVzdChyZXN1bHQpID8gcmVzdWx0IDogTWF5YmUub2YocCk7XG59KTtcblxubGV0IG5vdERvdCA9IFIuaWZFbHNlKFxuICBSLndoZXJlRXEoe3NpemU6IDB9KSxcbiAgSnVzdCxcbiAgcCA9PiBzYWZlTGFzdChwKS5tYXAocyA9PiAhKHMubWF0Y2goXCJwdW5jdHVhdG9yXCIpICYmIHMudmFsKCkgPT09ICcuJykpLmNoYWluKHN0dWZmVHJ1ZShwKSlcbik7XG5cbi8vIExpc3QgYSAtPiBNYXliZSBMaXN0IGFcbmxldCBwb3AgPSBSLmNvbXBvc2UoSnVzdCwgcCA9PiBwLnBvcCgpKTtcblxuLy8gTWF5YmUgTGlzdCBhIC0+IE1heWJlIExpc3QgYVxuY29uc3QgZnVuY3Rpb25QcmVmaXggPSBSLnBpcGVLKFxuICAgIGN1cmx5LFxuICAgIHBvcCxcbiAgICBwYXJlbixcbiAgICBwb3AsXG4gICAgb3B0KGlkZW50LCBwb3ApLFxuICAgIGZ1bmMpO1xuXG4vLyBCb29sZWFuIC0+IExpc3QgYSAtPiBCb29sZWFuXG5jb25zdCBpc1JlZ2V4UHJlZml4ID0gYiA9PiBSLmFueVBhc3MoW1xuICAvLyDOtVxuICBpc0VtcHR5LFxuICAvLyBQIC4gdCAgIHdoZXJlIHQg4oiIIFB1bmN0dWF0b3JcbiAgaXNUb3BQdW5jdHVhdG9yLFxuICAvLyBQIC4gdCAuIHQnICB3aGVyZSB0IFxcbm90ID0gXCIuXCIgYW5kIHQnIOKIiCAoS2V5d29yZCBcXHNldG1pbnVzICBMaXRlcmFsS2V5d29yZClcbiAgUi5waXBlKFxuICAgIE1heWJlLm9mLFxuICAgIFIucGlwZUsoXG4gICAgICBub25MaXRlcmFsS2V5d29yZCxcbiAgICAgIHBvcCxcbiAgICAgIG5vdERvdFxuICAgICksXG4gICAgTWF5YmUuaXNKdXN0XG4gICksXG4gIC8vIFAgLiB0IC4gdCcgLiAoVCkgIHdoZXJlIHQgXFxub3QgPSBcIi5cIiBhbmQgdCcg4oiIIChLZXl3b3JkIFxcc2V0bWludXMgTGl0ZXJhbEtleXdvcmQpXG4gIFIucGlwZShcbiAgICBNYXliZS5vZixcbiAgICBSLnBpcGVLKFxuICAgICAgcGFyZW4sXG4gICAgICBwb3AsXG4gICAgICBub25MaXRlcmFsS2V5d29yZCxcbiAgICAgIHBvcCxcbiAgICAgIG5vdERvdFxuICAgICksXG4gICAgTWF5YmUuaXNKdXN0XG4gICksXG4gIC8vIFAgLiBmdW5jdGlvbl5sIC4geD8gLiAoKSAuIHt9ICAgICB3aGVyZSBpc0V4cHJQcmVmaXgoUCwgYiwgbCkgPSBmYWxzZVxuICBSLnBpcGUoXG4gICAgTWF5YmUub2YsXG4gICAgZnVuY3Rpb25QcmVmaXgsXG4gICAgUi5jaGFpbihwID0+IHtcbiAgICAgICAgcmV0dXJuIHNhZmVMYXN0KHApXG4gICAgICAgICAgLm1hcChzID0+IHMubGluZU51bWJlcigpKVxuICAgICAgICAgIC5jaGFpbihmbkxpbmUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHBvcChwKS5tYXAoaXNFeHByUHJlZml4KGZuTGluZSwgYikpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNoYWluKHN0dWZmRmFsc2UocCkpO1xuICAgICAgfVxuICAgICksXG4gICAgTWF5YmUuaXNKdXN0XG4gICksXG4gIC8vIFAgLiB7VH1ebCAgd2hlcmUgaXNFeHByUHJlZml4KFAsIGIsIGwpID0gZmFsc2VcbiAgcCA9PiB7XG4gICAgbGV0IGFscmVhZHlDaGVja2VkRnVuY3Rpb24gPSBSLnBpcGUoXG4gICAgICBNYXliZS5vZixcbiAgICAgIGZ1bmN0aW9uUHJlZml4LFxuICAgICAgTWF5YmUuaXNKdXN0XG4gICAgKShwKTtcbiAgICBpZiAoYWxyZWFkeUNoZWNrZWRGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gUi5waXBlKFxuICAgICAgTWF5YmUub2YsXG4gICAgICBSLmNoYWluKGN1cmx5KSxcbiAgICAgIFIuY2hhaW4ocCA9PiB7XG4gICAgICAgIHJldHVybiBzYWZlTGFzdChwKVxuICAgICAgICAubWFwKHMgPT4gcy5saW5lTnVtYmVyKCkpXG4gICAgICAgIC5jaGFpbihjdXJseUxpbmUgPT4ge1xuICAgICAgICAgIHJldHVybiBwb3AocCkubWFwKGlzRXhwclByZWZpeChjdXJseUxpbmUsIGIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNoYWluKHN0dWZmRmFsc2UocCkpO1xuICAgICAgfSksXG4gICAgICBNYXliZS5pc0p1c3RcbiAgICApKHApO1xuICB9XG5cblxuXSk7XG5cbmZ1bmN0aW9uIGxhc3RFbChsKSB7XG4gIHJldHVybiBsW2wubGVuZ3RoIC0gMV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWRlciBleHRlbmRzIFRva2VuaXplciB7XG4gIGNvbnN0cnVjdG9yKHN0cmluZ3MsIGNvbnRleHQsIHJlcGxhY2VtZW50cykge1xuICAgIHN1cGVyKEFycmF5LmlzQXJyYXkoc3RyaW5ncykgPyBzdHJpbmdzLmpvaW4oJycpIDogc3RyaW5ncyk7XG4gICAgdGhpcy5kZWxpbVN0YWNrID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUgPSBbZmFsc2VdO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG5cbiAgICAvLyBzZXR1cCBzcGxpY2luZyByZXBsYWNlbWVudCBhcnJheVxuICAgIGlmIChBcnJheS5pc0FycmF5KHN0cmluZ3MpKSB7XG4gICAgICBsZXQgdG90YWxJbmRleCA9IDA7XG4gICAgICB0aGlzLnJlcGxhY2VtZW50SW5kZXggPSBSLnJlZHVjZSgoYWNjLCBzdHJSZXApID0+IHtcbiAgICAgICAgYWNjLnB1c2goe1xuICAgICAgICAgIGluZGV4OiB0b3RhbEluZGV4ICsgc3RyUmVwWzBdLmxlbmd0aCxcbiAgICAgICAgICByZXBsYWNlbWVudDogc3RyUmVwWzFdXG4gICAgICAgIH0pO1xuICAgICAgICB0b3RhbEluZGV4ICs9IHN0clJlcFswXS5sZW5ndGg7XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCBbXSwgUi56aXAoc3RyaW5ncywgcmVwbGFjZW1lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcmVhZChzdGFjayA9IFtdLCBiID0gZmFsc2UsIHNpbmdsZURlbGltaXRlciA9IGZhbHNlKSB7XG4gICAgbGV0IHByZWZpeCA9IExpc3QoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHRvayA9IHRoaXMuYWR2YW5jZShwcmVmaXgsIGIpO1xuXG4gICAgICAvLyBzcGxpY2luZyBhbGxvd3Mgc3ludGF4IGFuZCB0ZXJtc1xuICAgICAgaWYgKHRvay5zY29wZXNldHMgfHwgdG9rIGluc3RhbmNlb2YgVGVybSkge1xuICAgICAgICBzdGFjay5wdXNoKHRvayk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodG9rKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzdGFjaywgdG9rKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoTGlzdC5pc0xpc3QodG9rKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzdGFjaywgdG9rLnRvQXJyYXkoKSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFT1ModG9rKSkge1xuICAgICAgICBpZiAoc3RhY2tbMF0gJiYgaXNMZWZ0RGVsaW1pdGVyKHN0YWNrWzBdLnRva2VuKSkge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlVW5leHBlY3RlZCh0b2spO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNMZWZ0RGVsaW1pdGVyKHRvaykpIHtcbiAgICAgICAgaWYgKGlzTGVmdFN5bnRheCh0b2spKSB7XG4gICAgICAgICAgdGhpcy5pbnNpZGVTeW50YXhUZW1wbGF0ZS5wdXNoKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsaW5lID0gdG9rLnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZTtcbiAgICAgICAgbGV0IGlubmVyQiA9IGlzTGVmdEJyYWNlKHRvaykgPyBpc0V4cHJQcmVmaXgobGluZSwgYikocHJlZml4KSA6IHRydWU7XG4gICAgICAgIGxldCBpbm5lciA9IHRoaXMucmVhZChbbmV3IFN5bnRheCh0b2ssIHRoaXMuY29udGV4dCldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJCLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UpO1xuICAgICAgICBsZXQgc3R4ID0gbmV3IFN5bnRheChpbm5lciwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgcHJlZml4ID0gcHJlZml4LmNvbmNhdChzdHgpO1xuICAgICAgICBzdGFjay5wdXNoKHN0eCk7XG4gICAgICAgIGlmIChzaW5nbGVEZWxpbWl0ZXIpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc1JpZ2h0RGVsaW1pdGVyKHRvaykpIHtcbiAgICAgICAgaWYgKHN0YWNrWzBdICYmICFpc01hdGNoaW5nRGVsaW1pdGVycyhzdGFja1swXS50b2tlbiwgdG9rKSkge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlVW5leHBlY3RlZCh0b2spO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdHggPSBuZXcgU3ludGF4KHRvaywgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgc3RhY2sucHVzaChzdHgpO1xuICAgICAgICBpZiAobGFzdEVsKHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUpICYmIGlzUmlnaHRTeW50YXgodG9rKSkge1xuICAgICAgICAgIHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgc3R4ID0gbmV3IFN5bnRheCh0b2ssIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHByZWZpeCA9IHByZWZpeC5jb25jYXQoc3R4KTtcbiAgICAgICAgc3RhY2sucHVzaChzdHgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTGlzdChzdGFjayk7XG4gIH1cblxuICBhZHZhbmNlKHByZWZpeCwgYikge1xuICAgIHRoaXMubGFzdEluZGV4ID0gdGhpcy5pbmRleDtcbiAgICB0aGlzLmxhc3RMaW5lID0gdGhpcy5saW5lO1xuICAgIHRoaXMubGFzdExpbmVTdGFydCA9IHRoaXMubGluZVN0YXJ0O1xuXG4gICAgdGhpcy5za2lwQ29tbWVudCgpO1xuXG4gICAgdGhpcy5zdGFydEluZGV4ID0gdGhpcy5pbmRleDtcbiAgICB0aGlzLnN0YXJ0TGluZSA9IHRoaXMubGluZTtcbiAgICB0aGlzLnN0YXJ0TGluZVN0YXJ0ID0gdGhpcy5saW5lU3RhcnQ7XG5cbiAgICBpZiAodGhpcy5yZXBsYWNlbWVudEluZGV4ICYmIHRoaXMucmVwbGFjZW1lbnRJbmRleFswXSAmJiB0aGlzLmluZGV4ID49IHRoaXMucmVwbGFjZW1lbnRJbmRleFswXS5pbmRleCkge1xuICAgICAgbGV0IHJlcCA9IHRoaXMucmVwbGFjZW1lbnRJbmRleFswXS5yZXBsYWNlbWVudDtcbiAgICAgIHRoaXMucmVwbGFjZW1lbnRJbmRleC5zaGlmdCgpO1xuICAgICAgcmV0dXJuIHJlcDtcbiAgICB9XG5cbiAgICBsZXQgY2hhckNvZGUgPSB0aGlzLnNvdXJjZS5jaGFyQ29kZUF0KHRoaXMuaW5kZXgpO1xuXG4gICAgaWYgKGNoYXJDb2RlID09PSAweDYwKSB7IC8vIGBcbiAgICAgIGxldCBlbGVtZW50LCBpdGVtcyA9IFtdO1xuICAgICAgbGV0IHN0YXJ0TG9jYXRpb24gPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgaWYgKGxhc3RFbCh0aGlzLmluc2lkZVN5bnRheFRlbXBsYXRlKSkge1xuXG4gICAgICAgIGxldCBzbGljZSA9IHRoaXMuZ2V0U2xpY2Uoc3RhcnQsIHN0YXJ0TG9jYXRpb24pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IFJTWU5UQVgsXG4gICAgICAgICAgdmFsdWU6ICdgJyxcbiAgICAgICAgICBzbGljZTogc2xpY2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGRvIHtcbiAgICAgICAgZWxlbWVudCA9IHRoaXMuc2NhblRlbXBsYXRlRWxlbWVudCgpO1xuICAgICAgICBpdGVtcy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICBpZiAoZWxlbWVudC5pbnRlcnApIHtcbiAgICAgICAgICAvLyBvbmx5IHJlYWQgdGhlIHNpbmdsZSBkZWxpbWl0ZXJcbiAgICAgICAgICBlbGVtZW50ID0gdGhpcy5yZWFkKFtdLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgYXNzZXJ0KGVsZW1lbnQuc2l6ZSA9PT0gMSwgXCJzaG91bGQgb25seSBoYXZlIHJlYWQgYSBzaW5nbGUgZGVsaW1pdGVyIGluc2lkZSBhIHRlbXBsYXRlXCIpO1xuICAgICAgICAgIGl0ZW1zLnB1c2goZWxlbWVudC5nZXQoMCkpO1xuICAgICAgICB9XG4gICAgICB9IHdoaWxlICghZWxlbWVudC50YWlsKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFRva2VuVHlwZS5URU1QTEFURSxcbiAgICAgICAgaXRlbXM6IExpc3QoaXRlbXMpLFxuICAgICAgICBzbGljZTogdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbilcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChjaGFyQ29kZSA9PT0gMzUpIHsgLy8gI1xuICAgICAgbGV0IHN0YXJ0TG9jYXRpb24gPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbik7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAvLyBUT0RPOiBoYW5kbGUgYCBpbnNpZGUgb2Ygc3ludGF4IHRlbXBsYXRlIGludGVycG9sYXRpb25zXG4gICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KSA9PT0gMHg2MCkgeyAvLyBgXG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBMU1lOVEFYLFxuICAgICAgICAgIHZhbHVlOiAnI2AnLFxuICAgICAgICAgIHNsaWNlOiBzbGljZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLklERU5USUZJRVIsXG4gICAgICAgIHZhbHVlOiAnIycsXG4gICAgICAgIHNsaWNlOiBzbGljZVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGNoYXJDb2RlID09PSA2NCkgeyAvLyBAXG4gICAgICBsZXQgc3RhcnRMb2NhdGlvbiA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0LCBzdGFydExvY2F0aW9uKTtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IEFULFxuICAgICAgICB2YWx1ZTogJ0AnLFxuICAgICAgICBzbGljZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgbG9va2FoZWFkID0gc3VwZXIuYWR2YW5jZSgpO1xuICAgIGlmIChsb29rYWhlYWQudHlwZSA9PT0gVG9rZW5UeXBlLkRJViAmJiBpc1JlZ2V4UHJlZml4KGIpKHByZWZpeCkpIHtcbiAgICAgIHJldHVybiBzdXBlci5zY2FuUmVnRXhwKFwiL1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvb2thaGVhZDtcbiAgfVxuXG4gIC8vIG5lZWQgdG8gb3ZlcnJpZGUgaG93IHRlbXBsYXRlcyBhcmUgbGV4ZWQgYmVjYXVzZSBvZiBkZWxpbWl0ZXJzXG4gIHNjYW5UZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgbGV0IHN0YXJ0TG9jYXRpb24gPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgbGV0IHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuc291cmNlLmxlbmd0aCkge1xuICAgICAgbGV0IGNoID0gdGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KTtcbiAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSAweDYwOiB7IC8vIGBcbiAgICAgICAgICAvLyBkb24ndCBpbmNsdWRlIHRoZSB0cmFsaW5nIFwiYFwiXG4gICAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbik7XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiBUb2tlblR5cGUuVEVNUExBVEUsXG4gICAgICAgICAgICB0YWlsOiB0cnVlLFxuICAgICAgICAgICAgaW50ZXJwOiBmYWxzZSxcbiAgICAgICAgICAgIHNsaWNlOiBzbGljZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAweDI0OiAgLy8gJFxuICAgICAgICAgIGlmICh0aGlzLnNvdXJjZS5jaGFyQ29kZUF0KHRoaXMuaW5kZXggKyAxKSA9PT0gMHg3QikgeyAgLy8ge1xuICAgICAgICAgICAgLy8gZG9uJ3QgaW5jbHVkZSB0aGUgdHJhaWxpbmcgXCIkXCJcbiAgICAgICAgICAgIGxldCBzbGljZSA9IHRoaXMuZ2V0U2xpY2Uoc3RhcnQsIHN0YXJ0TG9jYXRpb24pO1xuICAgICAgICAgICAgdGhpcy5pbmRleCArPSAxO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLlRFTVBMQVRFLFxuICAgICAgICAgICAgICB0YWlsOiBmYWxzZSxcbiAgICAgICAgICAgICAgaW50ZXJwOiB0cnVlLFxuICAgICAgICAgICAgICBzbGljZTogc2xpY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAweDVDOiAgLy8gXFxcXFxuICAgICAgICB7XG4gICAgICAgICAgbGV0IG9jdGFsID0gdGhpcy5zY2FuU3RyaW5nRXNjYXBlKFwiXCIsIG51bGwpWzFdO1xuICAgICAgICAgIGlmIChvY3RhbCAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUlMTEVHQUwoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgdGhpcy5jcmVhdGVJTExFR0FMKCk7XG4gIH1cbn1cbiJdfQ==