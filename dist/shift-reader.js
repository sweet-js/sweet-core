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

var Just_443 = _ramdaFantasy.Maybe.Just;var Nothing_444 = _ramdaFantasy.Maybe.Nothing;var LSYNTAX_445 = { name: "left-syntax" };var RSYNTAX_446 = { name: "right-syntax" };var literalKeywords_447 = ["this", "null", "true", "false"];var isLeftBracket_448 = R.whereEq({ type: _tokenizer.TokenType.LBRACK });var isLeftBrace_449 = R.whereEq({ type: _tokenizer.TokenType.LBRACE });var isLeftParen_450 = R.whereEq({ type: _tokenizer.TokenType.LPAREN });var isRightBracket_451 = R.whereEq({ type: _tokenizer.TokenType.RBRACK });var isRightBrace_452 = R.whereEq({ type: _tokenizer.TokenType.RBRACE });var isRightParen_453 = R.whereEq({ type: _tokenizer.TokenType.RPAREN });var isEOS_454 = R.whereEq({ type: _tokenizer.TokenType.EOS });var isHash_455 = R.whereEq({ type: _tokenizer.TokenType.IDENTIFIER, value: "#" });var isLeftSyntax_456 = R.whereEq({ type: LSYNTAX_445 });var isRightSyntax_457 = R.whereEq({ type: RSYNTAX_446 });var isLeftDelimiter_458 = R.anyPass([isLeftBracket_448, isLeftBrace_449, isLeftParen_450, isLeftSyntax_456]);var isRightDelimiter_459 = R.anyPass([isRightBracket_451, isRightBrace_452, isRightParen_453, isRightSyntax_457]);var isMatchingDelimiters_460 = R.cond([[isLeftBracket_448, function (_, b) {
  return isRightBracket_451(b);
}], [isLeftBrace_449, function (_, b) {
  return isRightBrace_452(b);
}], [isLeftParen_450, function (_, b) {
  return isRightParen_453(b);
}], [isLeftSyntax_456, function (_, b) {
  return isRightSyntax_457(b);
}], [R.T, R.F]]);var assignOps_461 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];var binaryOps_462 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];var unaryOps_463 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];var isEmpty_464 = R.whereEq({ size: 0 });var isPunctuator_465 = function isPunctuator_465(s) {
  return s.isPunctuator();
};var isKeyword_466 = function isKeyword_466(s) {
  return s.isKeyword();
};var isDelimiter_467 = function isDelimiter_467(s) {
  return s.isDelimiter();
};var isParens_468 = function isParens_468(s) {
  return s.isParens();
};var isBraces_469 = function isBraces_469(s) {
  return s.isBraces();
};var isBrackets_470 = function isBrackets_470(s) {
  return s.isBrackets();
};var isIdentifier_471 = function isIdentifier_471(s) {
  return s.isIdentifier();
};var val_472 = function val_472(s) {
  return s.val();
};var isVal_473 = R.curry(function (v, s) {
  return s.val() === v;
});var isDot_474 = R.allPass([isPunctuator_465, isVal_473(".")]);var isColon_475 = R.allPass([isPunctuator_465, isVal_473(":")]);var isFunctionKeyword_476 = R.allPass([isKeyword_466, isVal_473("function")]);var isOperator_477 = function isOperator_477(s) {
  return (s.isPunctuator() || s.isKeyword()) && R.any(R.equals(s.val()), assignOps_461.concat(binaryOps_462).concat(unaryOps_463));
};var isNonLiteralKeyword_478 = R.allPass([isKeyword_466, function (s) {
  return R.none(R.equals(s.val()), literalKeywords_447);
}]);var isKeywordExprPrefix_479 = R.allPass([isKeyword_466, function (s) {
  return R.any(R.equals(s.val()), ["instanceof", "typeof", "delete", "void", "yield", "throw", "new", "case"]);
}]);var last_480 = function last_480(p) {
  return p.last();
};var safeLast_481 = R.pipe(R.cond([[isEmpty_464, R.always(Nothing_444())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last_480)]]));var stuffTrue_482 = R.curry(function (p, b) {
  return b ? Just_443(p) : Nothing_444();
});var stuffFalse_483 = R.curry(function (p, b) {
  return !b ? Just_443(p) : Nothing_444();
});var isTopColon_484 = R.pipe(safeLast_481, R.map(isColon_475), _ramdaFantasy.Maybe.maybe(false, R.identity));var isTopPunctuator_485 = R.pipe(safeLast_481, R.map(isPunctuator_465), _ramdaFantasy.Maybe.maybe(false, R.identity));var isExprReturn_486 = R.curry(function (l, p) {
  var retKwd_501 = safeLast_481(p);var maybeDot_502 = pop_497(p).chain(safeLast_481);if (maybeDot_502.map(isDot_474).getOrElse(false)) {
    return true;
  }return retKwd_501.map(function (s) {
    return s.isKeyword() && s.val() === "return" && s.lineNumber() === l;
  }).getOrElse(false);
});var isTopOperator_487 = R.pipe(safeLast_481, R.map(isOperator_477), _ramdaFantasy.Maybe.maybe(false, R.identity));var isTopKeywordExprPrefix_488 = R.pipe(safeLast_481, R.map(isKeywordExprPrefix_479), _ramdaFantasy.Maybe.maybe(false, R.identity));var isExprPrefix_489 = R.curry(function (l, b) {
  return R.cond([[isEmpty_464, R.always(b)], [isTopColon_484, R.always(b)], [isTopKeywordExprPrefix_488, R.T], [isTopOperator_487, R.T], [isTopPunctuator_485, R.always(b)], [isExprReturn_486(l), R.T], [R.T, R.F]]);
});var curly_490 = function curly_490(p) {
  return safeLast_481(p).map(isBraces_469).chain(stuffTrue_482(p));
};var paren_491 = function paren_491(p) {
  return safeLast_481(p).map(isParens_468).chain(stuffTrue_482(p));
};var func_492 = function func_492(p) {
  return safeLast_481(p).map(isFunctionKeyword_476).chain(stuffTrue_482(p));
};var ident_493 = function ident_493(p) {
  return safeLast_481(p).map(isIdentifier_471).chain(stuffTrue_482(p));
};var nonLiteralKeyword_494 = function nonLiteralKeyword_494(p) {
  return safeLast_481(p).map(isNonLiteralKeyword_478).chain(stuffTrue_482(p));
};var opt_495 = R.curry(function (a, b, p) {
  var result_503 = R.pipeK(a, b)(_ramdaFantasy.Maybe.of(p));return _ramdaFantasy.Maybe.isJust(result_503) ? result_503 : _ramdaFantasy.Maybe.of(p);
});var notDot_496 = R.ifElse(R.whereEq({ size: 0 }), Just_443, function (p) {
  return safeLast_481(p).map(function (s) {
    return !(s.isPunctuator() && s.val() === ".");
  }).chain(stuffTrue_482(p));
});var pop_497 = R.compose(Just_443, function (p) {
  return p.pop();
});var functionPrefix_498 = R.pipeK(curly_490, pop_497, paren_491, pop_497, opt_495(ident_493, pop_497), func_492);var isRegexPrefix_499 = function isRegexPrefix_499(b) {
  return R.anyPass([isEmpty_464, isTopPunctuator_485, R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword_494, pop_497, notDot_496), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren_491, pop_497, nonLiteralKeyword_494, pop_497, notDot_496), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_498, R.chain(function (p) {
    return safeLast_481(p).map(function (s) {
      return s.lineNumber();
    }).chain(function (fnLine) {
      return pop_497(p).map(isExprPrefix_489(fnLine, b));
    }).chain(stuffFalse_483(p));
  }), _ramdaFantasy.Maybe.isJust), function (p) {
    var isCurly_504 = _ramdaFantasy.Maybe.isJust(safeLast_481(p).map(isBraces_469));var alreadyCheckedFunction_505 = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_498, _ramdaFantasy.Maybe.isJust)(p);if (alreadyCheckedFunction_505) {
      return false;
    }return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly_490), R.chain(function (p) {
      return safeLast_481(p).map(function (s) {
        return s.lineNumber();
      }).chain(function (curlyLine) {
        return pop_497(p).map(isExprPrefix_489(curlyLine, b));
      }).chain(stuffFalse_483(p));
    }), _ramdaFantasy.Maybe.isJust)(p);
  }]);
};function lastEl_500(l_506) {
  return l_506[l_506.length - 1];
}
var Reader = function (_Tokenizer) {
  _inherits(Reader, _Tokenizer);

  function Reader(strings_507, context_508, replacements_509) {
    _classCallCheck(this, Reader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Reader).call(this, Array.isArray(strings_507) ? strings_507.join("") : strings_507));

    _this.delimStack = new Map();_this.insideSyntaxTemplate = [false];_this.context = context_508;if (Array.isArray(strings_507)) {
      (function () {
        var totalIndex = 0;_this.replacementIndex = R.reduce(function (acc, strRep) {
          acc.push({ index: totalIndex + strRep[0].length, replacement: strRep[1] });totalIndex += strRep[0].length;return acc;
        }, [], R.zip(strings_507, replacements_509));
      })();
    }return _this;
  }

  _createClass(Reader, [{
    key: "read",
    value: function read() {
      var stack_510 = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var b_511 = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var singleDelimiter_512 = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      var prefix_513 = (0, _immutable.List)();while (true) {
        var tok = this.advance(prefix_513, b_511);if (tok instanceof _syntax2.default || tok instanceof _terms2.default) {
          stack_510.push(tok);continue;
        }if (Array.isArray(tok)) {
          Array.prototype.push.apply(stack_510, tok);continue;
        }if (_immutable.List.isList(tok)) {
          Array.prototype.push.apply(stack_510, tok.toArray());continue;
        }if (isEOS_454(tok)) {
          if (stack_510[0] && isLeftDelimiter_458(stack_510[0].token)) {
            throw this.createUnexpected(tok);
          }break;
        }if (isLeftDelimiter_458(tok)) {
          if (isLeftSyntax_456(tok)) {
            this.insideSyntaxTemplate.push(true);
          }var line = tok.slice.startLocation.line;var innerB = isLeftBrace_449(tok) ? isExprPrefix_489(line, b_511)(prefix_513) : true;var inner = this.read([new _syntax2.default(tok)], innerB, false);var stx = new _syntax2.default(inner, this.context);prefix_513 = prefix_513.concat(stx);stack_510.push(stx);if (singleDelimiter_512) {
            break;
          }
        } else if (isRightDelimiter_459(tok)) {
          if (stack_510[0] && !isMatchingDelimiters_460(stack_510[0].token, tok)) {
            throw this.createUnexpected(tok);
          }var _stx = new _syntax2.default(tok, this.context);stack_510.push(_stx);if (lastEl_500(this.insideSyntaxTemplate) && isRightSyntax_457(tok)) {
            this.insideSyntaxTemplate.pop();
          }break;
        } else {
          var _stx2 = new _syntax2.default(tok, this.context);prefix_513 = prefix_513.concat(_stx2);stack_510.push(_stx2);
        }
      }return (0, _immutable.List)(stack_510);
    }
  }, {
    key: "advance",
    value: function advance(prefix_514, b_515) {
      var startLocation_516 = this.getLocation();this.lastIndex = this.index;this.lastLine = this.line;this.lastLineStart = this.lineStart;this.skipComment();this.startIndex = this.index;this.startLine = this.line;this.startLineStart = this.lineStart;if (this.replacementIndex && this.replacementIndex[0] && this.index >= this.replacementIndex[0].index) {
        var rep = this.replacementIndex[0].replacement;this.replacementIndex.shift();return rep;
      }var charCode_517 = this.source.charCodeAt(this.index);if (charCode_517 === 96) {
        var element = void 0,
            items = [];var _startLocation_ = this.getLocation();var start = this.index;this.index++;if (lastEl_500(this.insideSyntaxTemplate)) {
          var slice = this.getSlice(start, _startLocation_);return { type: RSYNTAX_446, value: "`", slice: slice };
        }do {
          element = this.scanTemplateElement();items.push(element);if (element.interp) {
            element = this.read([], false, true);(0, _errors.assert)(element.size === 1, "should only have read a single delimiter inside a template");items.push(element.get(0));
          }
        } while (!element.tail);return { type: _tokenizer.TokenType.TEMPLATE, items: (0, _immutable.List)(items) };
      } else if (charCode_517 === 35) {
        var _startLocation_2 = this.getLocation();var _start = this.index;var _slice = this.getSlice(_start, _startLocation_2);this.index++;if (this.source.charCodeAt(this.index) === 96) {
          this.index++;return { type: LSYNTAX_445, value: "#`", slice: _slice };
        }return { type: _tokenizer.TokenType.IDENTIFIER, value: "#", slice: _slice };
      }var lookahead_518 = _get(Object.getPrototypeOf(Reader.prototype), "advance", this).call(this);if (lookahead_518.type === _tokenizer.TokenType.DIV && isRegexPrefix_499(b_515)(prefix_514)) {
        return _get(Object.getPrototypeOf(Reader.prototype), "scanRegExp", this).call(this, "/");
      }return lookahead_518;
    }
  }, {
    key: "scanTemplateElement",
    value: function scanTemplateElement() {
      var startLocation_519 = this.getLocation();var start_520 = this.index;while (this.index < this.source.length) {
        var ch = this.source.charCodeAt(this.index);switch (ch) {case 96:
            var slice = this.getSlice(start_520, startLocation_519);this.index++;return { type: _tokenizer.TokenType.TEMPLATE, tail: true, interp: false, slice: slice };case 36:
            if (this.source.charCodeAt(this.index + 1) === 123) {
              var _slice2 = this.getSlice(start_520, startLocation_519);this.index += 1;return { type: _tokenizer.TokenType.TEMPLATE, tail: false, interp: true, slice: _slice2 };
            }this.index++;break;case 92:
            {
              var octal = this.scanStringEscape("", null)[1];if (octal != null) {
                throw this.createILLEGAL();
              }break;
            }default:
            this.index++;}
      }throw this.createILLEGAL();
    }
  }]);

  return Reader;
}(_tokenizer2.default);

exports.default = Reader;
//# sourceMappingURL=shift-reader.js.map
