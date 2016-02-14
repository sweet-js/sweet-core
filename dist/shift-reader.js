"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Just = _ramdaFantasy.Maybe.Just;
var Nothing = _ramdaFantasy.Maybe.Nothing;


var LSYNTAX = { name: 'left-syntax' };
var RSYNTAX = { name: 'right-syntax' };

// TODO: also, need to handle contextual yield
var literalKeywords = ['this', 'null', 'true', 'false'];

// Token -> Boolean
var isLeftBracket = R.whereEq({ type: _tokenizer.TokenType.LBRACK });
var isLeftBrace = R.whereEq({ type: _tokenizer.TokenType.LBRACE });
var isLeftParen = R.whereEq({ type: _tokenizer.TokenType.LPAREN });
var isRightBracket = R.whereEq({ type: _tokenizer.TokenType.RBRACK });
var isRightBrace = R.whereEq({ type: _tokenizer.TokenType.RBRACE });
var isRightParen = R.whereEq({ type: _tokenizer.TokenType.RPAREN });

var isEOS = R.whereEq({ type: _tokenizer.TokenType.EOS });

var isHash = R.whereEq({ type: _tokenizer.TokenType.IDENTIFIER, value: '#' });
var isLeftSyntax = R.whereEq({ type: LSYNTAX });
var isRightSyntax = R.whereEq({ type: RSYNTAX });

var isLeftDelimiter = R.anyPass([isLeftBracket, isLeftBrace, isLeftParen, isLeftSyntax]);

var isRightDelimiter = R.anyPass([isRightBracket, isRightBrace, isRightParen, isRightSyntax]);

var isMatchingDelimiters = R.cond([[isLeftBracket, function (_, b) {
  return isRightBracket(b);
}], [isLeftBrace, function (_, b) {
  return isRightBrace(b);
}], [isLeftParen, function (_, b) {
  return isRightParen(b);
}], [isLeftSyntax, function (_, b) {
  return isRightSyntax(b);
}], [R.T, R.F]]);

var assignOps = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];

var binaryOps = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];

var unaryOps = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];

// List -> Boolean
var isEmpty = R.whereEq({ size: 0 });

// Syntax -> Boolean
var isPunctuator = function isPunctuator(s) {
  return s.isPunctuator();
};
var isKeyword = function isKeyword(s) {
  return s.isKeyword();
};
var isDelimiter = function isDelimiter(s) {
  return s.isDelimiter();
};
var isParens = function isParens(s) {
  return s.isParens();
};
var isBraces = function isBraces(s) {
  return s.isBraces();
};
var isBrackets = function isBrackets(s) {
  return s.isBrackets();
};
var isIdentifier = function isIdentifier(s) {
  return s.isIdentifier();
};

// Syntax -> any
var val = function val(s) {
  return s.val();
};
// Any -> Syntax -> Boolean
var isVal = R.curry(function (v, s) {
  return s.val() === v;
});

// Syntax -> Boolean
var isDot = R.allPass([isPunctuator, isVal('.')]);
var isColon = R.allPass([isPunctuator, isVal(':')]);
var isFunctionKeyword = R.allPass([isKeyword, isVal('function')]);
var isOperator = function isOperator(s) {
  return (s.isPunctuator() || s.isKeyword()) && R.any(R.equals(s.val()), assignOps.concat(binaryOps).concat(unaryOps));
};
var isNonLiteralKeyword = R.allPass([isKeyword, function (s) {
  return R.none(R.equals(s.val()), literalKeywords);
}]);
var isKeywordExprPrefix = R.allPass([isKeyword, function (s) {
  return R.any(R.equals(s.val()), ['instanceof', 'typeof', 'delete', 'void', 'yield', 'throw', 'new', 'case']);
}]);
// List a -> a?
var last = function last(p) {
  return p.last();
};
// List a -> Maybe a
var safeLast = R.pipe(R.cond([[isEmpty, R.always(Nothing())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last)]]));

// TODO: better name
// List -> Boolean -> Maybe List
var stuffTrue = R.curry(function (p, b) {
  return b ? Just(p) : Nothing();
});
var stuffFalse = R.curry(function (p, b) {
  return !b ? Just(p) : Nothing();
});

// List a -> Boolean
var isTopColon = R.pipe(safeLast, R.map(isColon), _ramdaFantasy.Maybe.maybe(false, R.identity));
// List a -> Boolean
var isTopPunctuator = R.pipe(safeLast, R.map(isPunctuator), _ramdaFantasy.Maybe.maybe(false, R.identity));

// Number -> List -> Boolean
var isExprReturn = R.curry(function (l, p) {
  var retKwd = safeLast(p);
  var maybeDot = pop(p).chain(safeLast);

  if (maybeDot.map(isDot).getOrElse(false)) {
    return true;
  }
  return retKwd.map(function (s) {
    return s.isKeyword() && s.val() === 'return' && s.lineNumber() === l;
  }).getOrElse(false);
});

var isTopOperator = R.pipe(safeLast, R.map(isOperator), _ramdaFantasy.Maybe.maybe(false, R.identity));

var isTopKeywordExprPrefix = R.pipe(safeLast, R.map(isKeywordExprPrefix), _ramdaFantasy.Maybe.maybe(false, R.identity));

// Number -> Boolean -> List -> Boolean
var isExprPrefix = R.curry(function (l, b) {
  return R.cond([
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
  [isExprReturn(l), R.T], [R.T, R.F]]);
});

// List a -> Maybe List a
var curly = function curly(p) {
  return safeLast(p).map(isBraces).chain(stuffTrue(p));
};
var paren = function paren(p) {
  return safeLast(p).map(isParens).chain(stuffTrue(p));
};
var func = function func(p) {
  return safeLast(p).map(isFunctionKeyword).chain(stuffTrue(p));
};
var ident = function ident(p) {
  return safeLast(p).map(isIdentifier).chain(stuffTrue(p));
};
var nonLiteralKeyword = function nonLiteralKeyword(p) {
  return safeLast(p).map(isNonLiteralKeyword).chain(stuffTrue(p));
};

var opt = R.curry(function (a, b, p) {
  var result = R.pipeK(a, b)(_ramdaFantasy.Maybe.of(p));
  return _ramdaFantasy.Maybe.isJust(result) ? result : _ramdaFantasy.Maybe.of(p);
});

var notDot = R.ifElse(R.whereEq({ size: 0 }), Just, function (p) {
  return safeLast(p).map(function (s) {
    return !(s.isPunctuator() && s.val() === '.');
  }).chain(stuffTrue(p));
});

// List a -> Maybe List a
var pop = R.compose(Just, function (p) {
  return p.pop();
});

// Maybe List a -> Maybe List a
var functionPrefix = R.pipeK(curly, pop, paren, pop, opt(ident, pop), func);

// Boolean -> List a -> Boolean
var isRegexPrefix = function isRegexPrefix(b) {
  return R.anyPass([
  // ε
  isEmpty,
  // P . t   where t ∈ Punctuator
  isTopPunctuator,
  // P . t . t'  where t \not = "." and t' ∈ (Keyword \setminus  LiteralKeyword)
  R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword, pop, notDot), _ramdaFantasy.Maybe.isJust),
  // P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
  R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren, pop, nonLiteralKeyword, pop, notDot), _ramdaFantasy.Maybe.isJust),
  // P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
  R.pipe(_ramdaFantasy.Maybe.of, functionPrefix, R.chain(function (p) {
    return safeLast(p).map(function (s) {
      return s.lineNumber();
    }).chain(function (fnLine) {
      return pop(p).map(isExprPrefix(fnLine, b));
    }).chain(stuffFalse(p));
  }), _ramdaFantasy.Maybe.isJust),
  // P . {T}^l  where isExprPrefix(P, b, l) = false
  function (p) {
    var isCurly = _ramdaFantasy.Maybe.isJust(safeLast(p).map(isBraces));
    var alreadyCheckedFunction = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix, _ramdaFantasy.Maybe.isJust)(p);
    if (alreadyCheckedFunction) {
      return false;
    }
    return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly), R.chain(function (p) {
      return safeLast(p).map(function (s) {
        return s.lineNumber();
      }).chain(function (curlyLine) {
        return pop(p).map(isExprPrefix(curlyLine, b));
      }).chain(stuffFalse(p));
    }), _ramdaFantasy.Maybe.isJust)(p);
  }]);
};

function lastEl(l) {
  return l[l.length - 1];
}

var Reader = function (_Tokenizer) {
  _inherits(Reader, _Tokenizer);

  function Reader(strings, context, replacements) {
    _classCallCheck(this, Reader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Reader).call(this, Array.isArray(strings) ? strings.join('') : strings));

    _this.delimStack = new Map();
    _this.insideSyntaxTemplate = [false];
    _this.context = context;

    // setup splicing replacement array
    if (Array.isArray(strings)) {
      (function () {
        var totalIndex = 0;
        _this.replacementIndex = R.reduce(function (acc, strRep) {
          acc.push({
            index: totalIndex + strRep[0].length,
            replacement: strRep[1]
          });
          totalIndex += strRep[0].length;
          return acc;
        }, [], R.zip(strings, replacements));
      })();
    }
    return _this;
  }

  _createClass(Reader, [{
    key: "read",
    value: function read() {
      var stack = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var b = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var singleDelimiter = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var prefix = (0, _immutable.List)();
      while (true) {
        var tok = this.advance(prefix, b);

        // splicing allows syntax and terms
        if (tok instanceof _syntax2.default || tok instanceof _terms2.default) {
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
          var line = tok.slice.startLocation.line;
          var innerB = isLeftBrace(tok) ? isExprPrefix(line, b)(prefix) : true;
          var inner = this.read([new _syntax2.default(tok)], innerB, false);
          var stx = new _syntax2.default(inner, this.context);
          prefix = prefix.concat(stx);
          stack.push(stx);
          if (singleDelimiter) {
            break;
          }
        } else if (isRightDelimiter(tok)) {
          if (stack[0] && !isMatchingDelimiters(stack[0].token, tok)) {
            throw this.createUnexpected(tok);
          }
          var stx = new _syntax2.default(tok, this.context);
          stack.push(stx);
          if (lastEl(this.insideSyntaxTemplate) && isRightSyntax(tok)) {
            this.insideSyntaxTemplate.pop();
          }
          break;
        } else {
          var stx = new _syntax2.default(tok, this.context);
          prefix = prefix.concat(stx);
          stack.push(stx);
        }
      }
      return (0, _immutable.List)(stack);
    }
  }, {
    key: "advance",
    value: function advance(prefix, b) /*: any */{
      var startLocation = this.getLocation();

      this.lastIndex = this.index;
      this.lastLine = this.line;
      this.lastLineStart = this.lineStart;

      this.skipComment();

      this.startIndex = this.index;
      this.startLine = this.line;
      this.startLineStart = this.lineStart;

      if (this.replacementIndex && this.replacementIndex[0] && this.index >= this.replacementIndex[0].index) {
        var rep = this.replacementIndex[0].replacement;
        this.replacementIndex.shift();
        return rep;
      }

      var charCode = this.source.charCodeAt(this.index);

      if (charCode === 0x60) {
        // `
        var element = undefined,
            items = [];
        var _startLocation = this.getLocation();
        var start = this.index;
        this.index++;
        if (lastEl(this.insideSyntaxTemplate)) {

          var slice = this.getSlice(start, _startLocation);
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
          items: (0, _immutable.List)(items)
        };
      } else if (charCode === 35) {
        // #
        var _startLocation2 = this.getLocation();
        var start = this.index;
        var slice = this.getSlice(start, _startLocation2);
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
      }

      var lookahead = _get(Object.getPrototypeOf(Reader.prototype), "advance", this).call(this);
      if (lookahead.type === _tokenizer.TokenType.DIV && isRegexPrefix(b)(prefix)) {
        return _get(Object.getPrototypeOf(Reader.prototype), "scanRegExp", this).call(this, "/");
      }
      return lookahead;
    }

    // need to override how templates are lexed because of delimiters

  }, {
    key: "scanTemplateElement",
    value: function scanTemplateElement() {
      var startLocation = this.getLocation();
      var start = this.index;
      while (this.index < this.source.length) {
        var ch = this.source.charCodeAt(this.index);
        switch (ch) {
          case 0x60:
            // `
            // don't include the traling "`"
            var slice = this.getSlice(start, startLocation);
            this.index++;
            return {
              type: _tokenizer.TokenType.TEMPLATE,
              tail: true,
              interp: false,
              slice: slice
            };
          case 0x24:
            // $
            if (this.source.charCodeAt(this.index + 1) === 0x7B) {
              // {
              // don't include the trailing "$"
              var _slice = this.getSlice(start, startLocation);
              this.index += 1;
              return {
                type: _tokenizer.TokenType.TEMPLATE,
                tail: false,
                interp: true,
                slice: _slice
              };
            }
            this.index++;
            break;
          case 0x5C:
            // \\
            {
              var octal = this.scanStringEscape("", null)[1];
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
  }]);

  return Reader;
}(_tokenizer2.default);

exports.default = Reader;
//# sourceMappingURL=shift-reader.js.map
