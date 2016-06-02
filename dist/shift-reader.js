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

var Just_489 = _ramdaFantasy.Maybe.Just;
var Nothing_490 = _ramdaFantasy.Maybe.Nothing;

var LSYNTAX_491 = { name: "left-syntax" };
var RSYNTAX_492 = { name: "right-syntax" };
var AT_493 = { klass: _tokenizer.TokenClass.Punctuator, name: "@" };
var literalKeywords_494 = ["this", "null", "true", "false"];
var isLeftBracket_495 = R.whereEq({ type: _tokenizer.TokenType.LBRACK });
var isLeftBrace_496 = R.whereEq({ type: _tokenizer.TokenType.LBRACE });
var isLeftParen_497 = R.whereEq({ type: _tokenizer.TokenType.LPAREN });
var isRightBracket_498 = R.whereEq({ type: _tokenizer.TokenType.RBRACK });
var isRightBrace_499 = R.whereEq({ type: _tokenizer.TokenType.RBRACE });
var isRightParen_500 = R.whereEq({ type: _tokenizer.TokenType.RPAREN });
var isEOS_501 = R.whereEq({ type: _tokenizer.TokenType.EOS });
var isHash_502 = R.whereEq({ type: _tokenizer.TokenType.IDENTIFIER, value: "#" });
var isLeftSyntax_503 = R.whereEq({ type: LSYNTAX_491 });
var isRightSyntax_504 = R.whereEq({ type: RSYNTAX_492 });
var isLeftDelimiter_505 = R.anyPass([isLeftBracket_495, isLeftBrace_496, isLeftParen_497, isLeftSyntax_503]);
var isRightDelimiter_506 = R.anyPass([isRightBracket_498, isRightBrace_499, isRightParen_500, isRightSyntax_504]);
var isMatchingDelimiters_507 = R.cond([[isLeftBracket_495, function (__551, b_552) {
  return isRightBracket_498(b_552);
}], [isLeftBrace_496, function (__553, b_554) {
  return isRightBrace_499(b_554);
}], [isLeftParen_497, function (__555, b_556) {
  return isRightParen_500(b_556);
}], [isLeftSyntax_503, function (__557, b_558) {
  return isRightSyntax_504(b_558);
}], [R.T, R.F]]);
var assignOps_508 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
var binaryOps_509 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
var unaryOps_510 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
var isNotFalse_511 = R.compose(R.not, R.curry(R.equals)(false));
var isEmpty_512 = R.whereEq({ size: 0 });
var isPunctuator_513 = function isPunctuator_513(s_559) {
  return s_559.isPunctuator();
};
var isKeyword_514 = function isKeyword_514(s_560) {
  return s_560.isKeyword();
};
var isDelimiter_515 = function isDelimiter_515(s_561) {
  return s_561.isDelimiter();
};
var isParens_516 = function isParens_516(s_562) {
  return s_562.isParens();
};
var isBraces_517 = function isBraces_517(s_563) {
  return s_563.isBraces();
};
var isBrackets_518 = function isBrackets_518(s_564) {
  return s_564.isBrackets();
};
var isIdentifier_519 = function isIdentifier_519(s_565) {
  return s_565.isIdentifier();
};
var val_520 = function val_520(s_566) {
  return s_566.val();
};
var isVal_521 = R.curry(function (v_567, s_568) {
  return s_568.val() === v_567;
});
var isDot_522 = R.allPass([isPunctuator_513, isVal_521(".")]);
var isColon_523 = R.allPass([isPunctuator_513, isVal_521(":")]);
var isFunctionKeyword_524 = R.allPass([isKeyword_514, isVal_521("function")]);
var isOperator_525 = function isOperator_525(s_569) {
  return (s_569.isPunctuator() || s_569.isKeyword()) && R.any(R.equals(s_569.val()), assignOps_508.concat(binaryOps_509).concat(unaryOps_510));
};
var isNonLiteralKeyword_526 = R.allPass([isKeyword_514, function (s_570) {
  return R.none(R.equals(s_570.val()), literalKeywords_494);
}]);
var isKeywordExprPrefix_527 = R.allPass([isKeyword_514, function (s_571) {
  return R.any(R.equals(s_571.val()), ["instanceof", "typeof", "delete", "void", "yield", "throw", "new", "case"]);
}]);
var last_528 = function last_528(p_572) {
  return p_572.last();
};
var safeLast_529 = R.pipe(R.cond([[isEmpty_512, R.always(Nothing_490())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last_528)]]));
var stuffTrue_530 = R.curry(function (p_573, b_574) {
  return b_574 ? Just_489(p_573) : Nothing_490();
});
var stuffFalse_531 = R.curry(function (p_575, b_576) {
  return !b_576 ? Just_489(p_575) : Nothing_490();
});
var isTopColon_532 = R.pipe(safeLast_529, R.map(isColon_523), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopPunctuator_533 = R.pipe(safeLast_529, R.map(isPunctuator_513), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprReturn_534 = R.curry(function (l_577, p_578) {
  var retKwd_579 = safeLast_529(p_578);
  var maybeDot_580 = pop_545(p_578).chain(safeLast_529);
  if (maybeDot_580.map(isDot_522).getOrElse(false)) {
    return true;
  }
  return retKwd_579.map(function (s_581) {
    return s_581.isKeyword() && s_581.val() === "return" && s_581.lineNumber() === l_577;
  }).getOrElse(false);
});
var isTopOperator_535 = R.pipe(safeLast_529, R.map(isOperator_525), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopKeywordExprPrefix_536 = R.pipe(safeLast_529, R.map(isKeywordExprPrefix_527), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprPrefix_537 = R.curry(function (l_582, b_583) {
  return R.cond([[isEmpty_512, R.always(b_583)], [isTopColon_532, R.always(b_583)], [isTopKeywordExprPrefix_536, R.T], [isTopOperator_535, R.T], [isTopPunctuator_533, R.always(b_583)], [isExprReturn_534(l_582), R.T], [R.T, R.F]]);
});
var curly_538 = function curly_538(p_584) {
  return safeLast_529(p_584).map(isBraces_517).chain(stuffTrue_530(p_584));
};
var paren_539 = function paren_539(p_585) {
  return safeLast_529(p_585).map(isParens_516).chain(stuffTrue_530(p_585));
};
var func_540 = function func_540(p_586) {
  return safeLast_529(p_586).map(isFunctionKeyword_524).chain(stuffTrue_530(p_586));
};
var ident_541 = function ident_541(p_587) {
  return safeLast_529(p_587).map(isIdentifier_519).chain(stuffTrue_530(p_587));
};
var nonLiteralKeyword_542 = function nonLiteralKeyword_542(p_588) {
  return safeLast_529(p_588).map(isNonLiteralKeyword_526).chain(stuffTrue_530(p_588));
};
var opt_543 = R.curry(function (a_589, b_590, p_591) {
  var result_592 = R.pipeK(a_589, b_590)(_ramdaFantasy.Maybe.of(p_591));
  return _ramdaFantasy.Maybe.isJust(result_592) ? result_592 : _ramdaFantasy.Maybe.of(p_591);
});
var notDot_544 = R.ifElse(R.whereEq({ size: 0 }), Just_489, function (p_593) {
  return safeLast_529(p_593).map(function (s_594) {
    return !(s_594.isPunctuator() && s_594.val() === ".");
  }).chain(stuffTrue_530(p_593));
});
var pop_545 = R.compose(Just_489, function (p_595) {
  return p_595.pop();
});
var functionPrefix_546 = R.pipeK(curly_538, pop_545, paren_539, pop_545, opt_543(ident_541, pop_545), func_540);
var isRegexPrefix_547 = function isRegexPrefix_547(b_596) {
  return R.anyPass([isEmpty_512, isTopPunctuator_533, R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword_542, pop_545, notDot_544), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren_539, pop_545, nonLiteralKeyword_542, pop_545, notDot_544), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_546, R.chain(function (p_597) {
    return safeLast_529(p_597).map(function (s_598) {
      return s_598.lineNumber();
    }).chain(function (fnLine_599) {
      return pop_545(p_597).map(isExprPrefix_537(fnLine_599, b_596));
    }).chain(stuffFalse_531(p_597));
  }), _ramdaFantasy.Maybe.isJust), function (p_600) {
    var isCurly_601 = _ramdaFantasy.Maybe.isJust(safeLast_529(p_600).map(isBraces_517));
    var alreadyCheckedFunction_602 = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_546, _ramdaFantasy.Maybe.isJust)(p_600);
    if (alreadyCheckedFunction_602) {
      return false;
    }
    return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly_538), R.chain(function (p_603) {
      return safeLast_529(p_603).map(function (s_604) {
        return s_604.lineNumber();
      }).chain(function (curlyLine_605) {
        return pop_545(p_603).map(isExprPrefix_537(curlyLine_605, b_596));
      }).chain(stuffFalse_531(p_603));
    }), _ramdaFantasy.Maybe.isJust)(p_600);
  }]);
};
function lastEl_548(l_606) {
  return l_606[l_606.length - 1];
}
function countSlashes_549(reader_607) {
  var index_608 = reader_607.index;
  var onSlash_609 = function onSlash_609() {
    return reader_607.source.charCodeAt(index_608) === 92;
  };
  var length_610 = reader_607.source.length;
  var count_611 = onSlash_609() ? 1 : 0;
  while (++index_608 < length_610 && onSlash_609()) {
    ++count_611;
  }
  return count_611;
}
var calcDepth_550 = R.compose(Math.log2, R.inc);

var Reader = function (_Tokenizer) {
  _inherits(Reader, _Tokenizer);

  function Reader(strings_612, context_613, replacements_614) {
    _classCallCheck(this, Reader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Reader).call(this, Array.isArray(strings_612) ? strings_612.join("") : strings_612));

    _this.delimStack = new Map();
    _this.syntaxNestingDepth = 0;
    _this.context = context_613;
    if (Array.isArray(strings_612)) {
      (function () {
        var totalIndex = 0;
        _this.replacementIndex = R.reduce(function (acc_615, strRep_616) {
          acc_615.push({ index: totalIndex + strRep_616[0].length, replacement: strRep_616[1] });
          totalIndex += strRep_616[0].length;
          return acc_615;
        }, [], R.zip(strings_612, replacements_614));
      })();
    }
    return _this;
  }

  _createClass(Reader, [{
    key: "read",
    value: function read() {
      var stack_617 = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var b_618 = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var singleDelimiter_619 = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var prefix_620 = (0, _immutable.List)();
      while (true) {
        var tok = this.advance(prefix_620, b_618);
        if (tok instanceof _syntax2.default || tok instanceof _terms2.default) {
          stack_617.push(tok);
          continue;
        }
        if (Array.isArray(tok)) {
          Array.prototype.push.apply(stack_617, tok);
          continue;
        }
        if (_immutable.List.isList(tok)) {
          Array.prototype.push.apply(stack_617, tok.toArray());
          continue;
        }
        if (isEOS_501(tok)) {
          if (stack_617[0] && isLeftDelimiter_505(stack_617[0].token)) {
            throw this.createUnexpected(tok);
          }
          break;
        }
        if (isLeftDelimiter_505(tok)) {
          if (isLeftSyntax_503(tok)) {
            this.syntaxNestingDepth++;
          }
          var line = tok.slice.startLocation.line;
          var innerB = isLeftBrace_496(tok) ? isExprPrefix_537(line, b_618)(prefix_620) : true;
          var inner = this.read([new _syntax2.default(tok)], innerB, false);
          var stx = new _syntax2.default(inner, this.context);
          prefix_620 = prefix_620.concat(stx);
          stack_617.push(stx);
          if (singleDelimiter_619) {
            break;
          }
        } else if (isRightDelimiter_506(tok)) {
          if (stack_617[0] && !isMatchingDelimiters_507(stack_617[0].token, tok)) {
            throw this.createUnexpected(tok);
          }
          var _stx = new _syntax2.default(tok, this.context);
          stack_617.push(_stx);
          if (this.syntaxNestingDepth && isRightSyntax_504(tok)) {
            this.syntaxNestingDepth--;
          }
          break;
        } else {
          var _stx2 = new _syntax2.default(tok, this.context);
          prefix_620 = prefix_620.concat(_stx2);
          stack_617.push(_stx2);
        }
      }
      return (0, _immutable.List)(stack_617);
    }
  }, {
    key: "advance",
    value: function advance(prefix_621, b_622) {
      var startLocation_623 = this.getLocation();
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
      var charCode_624 = this.source.charCodeAt(this.index);
      if (charCode_624 === 96) {
        var element = void 0,
            items = [];
        var _startLocation_ = this.getLocation();
        var start = this.index;
        this.index++;
        if (this.syntaxNestingDepth === 1) {
          var slice = this.getSlice(start, _startLocation_);
          return { type: RSYNTAX_492, value: "`", slice: slice };
        }
        do {
          element = this.scanTemplateElement();
          items.push(element);
          if (element.interp) {
            element = this.read([], false, true);
            (0, _errors.assert)(element.size === 1, "should only have read a single delimiter inside a template");
            items.push(element.get(0));
          }
        } while (!element.tail);
        return { type: _tokenizer.TokenType.TEMPLATE, items: (0, _immutable.List)(items) };
      } else if (this.syntaxNestingDepth && charCode_624 === 92) {
        var numSlashes = countSlashes_549(this);
        var depth = calcDepth_550(numSlashes);
        if (this.source.charCodeAt(this.index + numSlashes) === 96) {
          if (depth > this.syntaxNestingDepth) {
            this.index += Math.pow(2, this.syntaxNestingDepth) - 1;
            throw this.createILLEGAL();
          } else if (depth < this.syntaxNestingDepth - 1) {
            this.index += numSlashes;
            throw this.createILLEGAL();
          }
          var isClosing = depth === this.syntaxNestingDepth - 1;
          var _startLocation_2 = this.getLocation();
          var _start = this.index;
          var _slice = this.getSlice(_start, _startLocation_2);
          this.index += numSlashes + 1;
          return { type: isClosing ? RSYNTAX_492 : LSYNTAX_491, value: "\\".repeat(numSlashes).concat("'"), slice: _slice };
        }
      } else if (charCode_624 === 35) {
        var _startLocation_3 = this.getLocation();
        var _start2 = this.index;
        var _slice2 = this.getSlice(_start2, _startLocation_3);
        this.index++;
        if (this.source.charCodeAt(this.index) === 96) {
          this.index++;
          return { type: LSYNTAX_491, value: "#`", slice: _slice2 };
        }
        return { type: _tokenizer.TokenType.IDENTIFIER, value: "#", slice: _slice2 };
      } else if (charCode_624 === 64) {
        var _startLocation_4 = this.getLocation();
        var _start3 = this.index;
        var _slice3 = this.getSlice(_start3, _startLocation_4);
        this.index++;
        return { type: AT_493, value: "@", slice: _slice3 };
      }
      var lookahead_625 = _get(Object.getPrototypeOf(Reader.prototype), "advance", this).call(this);
      if (lookahead_625.type === _tokenizer.TokenType.DIV && isRegexPrefix_547(b_622)(prefix_621)) {
        return _get(Object.getPrototypeOf(Reader.prototype), "scanRegExp", this).call(this, "/");
      }
      return lookahead_625;
    }
  }, {
    key: "scanTemplateElement",
    value: function scanTemplateElement() {
      var startLocation_626 = this.getLocation();
      var start_627 = this.index;
      while (this.index < this.source.length) {
        var ch = this.source.charCodeAt(this.index);
        switch (ch) {
          case 96:
            var slice = this.getSlice(start_627, startLocation_626);
            this.index++;
            return { type: _tokenizer.TokenType.TEMPLATE, tail: true, interp: false, slice: slice };
          case 36:
            if (this.source.charCodeAt(this.index + 1) === 123) {
              var _slice4 = this.getSlice(start_627, startLocation_626);
              this.index += 1;
              return { type: _tokenizer.TokenType.TEMPLATE, tail: false, interp: true, slice: _slice4 };
            }
            this.index++;
            break;
          case 92:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3NoaWZ0LXJlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOztJQUFhLEM7O0FBQ2I7O0FBQ0E7O0FBR0E7Ozs7Ozs7Ozs7Ozs7O0FBRkEsSUFBTSxXQUFXLG9CQUFNLElBQXZCO0FBQ0EsSUFBTSxjQUFjLG9CQUFNLE9BQTFCOztBQUVBLElBQU0sY0FBYyxFQUFDLE1BQU0sYUFBUCxFQUFwQjtBQUNBLElBQU0sY0FBYyxFQUFDLE1BQU0sY0FBUCxFQUFwQjtBQUNBLElBQU0sU0FBUyxFQUFDLE9BQU8sc0JBQVcsVUFBbkIsRUFBK0IsTUFBTSxHQUFyQyxFQUFmO0FBQ0EsSUFBTSxzQkFBc0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixPQUF6QixDQUE1QjtBQUNBLElBQU0sb0JBQW9CLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFqQixFQUFWLENBQTFCO0FBQ0EsSUFBTSxrQkFBa0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQVYsQ0FBeEI7QUFDQSxJQUFNLGtCQUFrQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBVixDQUF4QjtBQUNBLElBQU0scUJBQXFCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFqQixFQUFWLENBQTNCO0FBQ0EsSUFBTSxtQkFBbUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQVYsQ0FBekI7QUFDQSxJQUFNLG1CQUFtQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBVixDQUF6QjtBQUNBLElBQU0sWUFBWSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsR0FBakIsRUFBVixDQUFsQjtBQUNBLElBQU0sYUFBYSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJB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QUFtQjtBQUNqQixzQkFBTSxLQUFLLGFBQUwsRUFBTjtBQUNEO0FBQ0Q7QUFDRDtBQUNIO0FBQ0UsaUJBQUssS0FBTDtBQXRCSjtBQXdCRDtBQUNELFlBQU0sS0FBSyxhQUFMLEVBQU47QUFDRDs7Ozs7O2tCQTlLa0IsTSIsImZpbGUiOiJzaGlmdC1yZWFkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVG9rZW5pemVyIGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmltcG9ydCB7VG9rZW5DbGFzcywgVG9rZW5UeXBlfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgICogYXMgUiBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5jb25zdCBKdXN0XzQ4OSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzQ5MCA9IE1heWJlLk5vdGhpbmc7XG5pbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuY29uc3QgTFNZTlRBWF80OTEgPSB7bmFtZTogXCJsZWZ0LXN5bnRheFwifTtcbmNvbnN0IFJTWU5UQVhfNDkyID0ge25hbWU6IFwicmlnaHQtc3ludGF4XCJ9O1xuY29uc3QgQVRfNDkzID0ge2tsYXNzOiBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIG5hbWU6IFwiQFwifTtcbmNvbnN0IGxpdGVyYWxLZXl3b3Jkc180OTQgPSBbXCJ0aGlzXCIsIFwibnVsbFwiLCBcInRydWVcIiwgXCJmYWxzZVwiXTtcbmNvbnN0IGlzTGVmdEJyYWNrZXRfNDk1ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuTEJSQUNLfSk7XG5jb25zdCBpc0xlZnRCcmFjZV80OTYgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5MQlJBQ0V9KTtcbmNvbnN0IGlzTGVmdFBhcmVuXzQ5NyA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLkxQQVJFTn0pO1xuY29uc3QgaXNSaWdodEJyYWNrZXRfNDk4ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLfSk7XG5jb25zdCBpc1JpZ2h0QnJhY2VfNDk5ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuUkJSQUNFfSk7XG5jb25zdCBpc1JpZ2h0UGFyZW5fNTAwID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuUlBBUkVOfSk7XG5jb25zdCBpc0VPU181MDEgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5FT1N9KTtcbmNvbnN0IGlzSGFzaF81MDIgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogXCIjXCJ9KTtcbmNvbnN0IGlzTGVmdFN5bnRheF81MDMgPSBSLndoZXJlRXEoe3R5cGU6IExTWU5UQVhfNDkxfSk7XG5jb25zdCBpc1JpZ2h0U3ludGF4XzUwNCA9IFIud2hlcmVFcSh7dHlwZTogUlNZTlRBWF80OTJ9KTtcbmNvbnN0IGlzTGVmdERlbGltaXRlcl81MDUgPSBSLmFueVBhc3MoW2lzTGVmdEJyYWNrZXRfNDk1LCBpc0xlZnRCcmFjZV80OTYsIGlzTGVmdFBhcmVuXzQ5NywgaXNMZWZ0U3ludGF4XzUwM10pO1xuY29uc3QgaXNSaWdodERlbGltaXRlcl81MDYgPSBSLmFueVBhc3MoW2lzUmlnaHRCcmFja2V0XzQ5OCwgaXNSaWdodEJyYWNlXzQ5OSwgaXNSaWdodFBhcmVuXzUwMCwgaXNSaWdodFN5bnRheF81MDRdKTtcbmNvbnN0IGlzTWF0Y2hpbmdEZWxpbWl0ZXJzXzUwNyA9IFIuY29uZChbW2lzTGVmdEJyYWNrZXRfNDk1LCAoX181NTEsIGJfNTUyKSA9PiBpc1JpZ2h0QnJhY2tldF80OTgoYl81NTIpXSwgW2lzTGVmdEJyYWNlXzQ5NiwgKF9fNTUzLCBiXzU1NCkgPT4gaXNSaWdodEJyYWNlXzQ5OShiXzU1NCldLCBbaXNMZWZ0UGFyZW5fNDk3LCAoX181NTUsIGJfNTU2KSA9PiBpc1JpZ2h0UGFyZW5fNTAwKGJfNTU2KV0sIFtpc0xlZnRTeW50YXhfNTAzLCAoX181NTcsIGJfNTU4KSA9PiBpc1JpZ2h0U3ludGF4XzUwNChiXzU1OCldLCBbUi5ULCBSLkZdXSk7XG5jb25zdCBhc3NpZ25PcHNfNTA4ID0gW1wiPVwiLCBcIis9XCIsIFwiLT1cIiwgXCIqPVwiLCBcIi89XCIsIFwiJT1cIiwgXCI8PD1cIiwgXCI+Pj1cIiwgXCI+Pj49XCIsIFwiJj1cIiwgXCJ8PVwiLCBcIl49XCIsIFwiLFwiXTtcbmNvbnN0IGJpbmFyeU9wc181MDkgPSBbXCIrXCIsIFwiLVwiLCBcIipcIiwgXCIvXCIsIFwiJVwiLCBcIjw8XCIsIFwiPj5cIiwgXCI+Pj5cIiwgXCImXCIsIFwifFwiLCBcIl5cIiwgXCImJlwiLCBcInx8XCIsIFwiP1wiLCBcIjpcIiwgXCI9PT1cIiwgXCI9PVwiLCBcIj49XCIsIFwiPD1cIiwgXCI8XCIsIFwiPlwiLCBcIiE9XCIsIFwiIT09XCIsIFwiaW5zdGFuY2VvZlwiXTtcbmNvbnN0IHVuYXJ5T3BzXzUxMCA9IFtcIisrXCIsIFwiLS1cIiwgXCJ+XCIsIFwiIVwiLCBcImRlbGV0ZVwiLCBcInZvaWRcIiwgXCJ0eXBlb2ZcIiwgXCJ5aWVsZFwiLCBcInRocm93XCIsIFwibmV3XCJdO1xuY29uc3QgaXNOb3RGYWxzZV81MTEgPSBSLmNvbXBvc2UoUi5ub3QsIFIuY3VycnkoUi5lcXVhbHMpKGZhbHNlKSk7XG5jb25zdCBpc0VtcHR5XzUxMiA9IFIud2hlcmVFcSh7c2l6ZTogMH0pO1xuY29uc3QgaXNQdW5jdHVhdG9yXzUxMyA9IHNfNTU5ID0+IHNfNTU5LmlzUHVuY3R1YXRvcigpO1xuY29uc3QgaXNLZXl3b3JkXzUxNCA9IHNfNTYwID0+IHNfNTYwLmlzS2V5d29yZCgpO1xuY29uc3QgaXNEZWxpbWl0ZXJfNTE1ID0gc181NjEgPT4gc181NjEuaXNEZWxpbWl0ZXIoKTtcbmNvbnN0IGlzUGFyZW5zXzUxNiA9IHNfNTYyID0+IHNfNTYyLmlzUGFyZW5zKCk7XG5jb25zdCBpc0JyYWNlc181MTcgPSBzXzU2MyA9PiBzXzU2My5pc0JyYWNlcygpO1xuY29uc3QgaXNCcmFja2V0c181MTggPSBzXzU2NCA9PiBzXzU2NC5pc0JyYWNrZXRzKCk7XG5jb25zdCBpc0lkZW50aWZpZXJfNTE5ID0gc181NjUgPT4gc181NjUuaXNJZGVudGlmaWVyKCk7XG5jb25zdCB2YWxfNTIwID0gc181NjYgPT4gc181NjYudmFsKCk7XG5jb25zdCBpc1ZhbF81MjEgPSBSLmN1cnJ5KCh2XzU2Nywgc181NjgpID0+IHNfNTY4LnZhbCgpID09PSB2XzU2Nyk7XG5jb25zdCBpc0RvdF81MjIgPSBSLmFsbFBhc3MoW2lzUHVuY3R1YXRvcl81MTMsIGlzVmFsXzUyMShcIi5cIildKTtcbmNvbnN0IGlzQ29sb25fNTIzID0gUi5hbGxQYXNzKFtpc1B1bmN0dWF0b3JfNTEzLCBpc1ZhbF81MjEoXCI6XCIpXSk7XG5jb25zdCBpc0Z1bmN0aW9uS2V5d29yZF81MjQgPSBSLmFsbFBhc3MoW2lzS2V5d29yZF81MTQsIGlzVmFsXzUyMShcImZ1bmN0aW9uXCIpXSk7XG5jb25zdCBpc09wZXJhdG9yXzUyNSA9IHNfNTY5ID0+IChzXzU2OS5pc1B1bmN0dWF0b3IoKSB8fCBzXzU2OS5pc0tleXdvcmQoKSkgJiYgUi5hbnkoUi5lcXVhbHMoc181NjkudmFsKCkpLCBhc3NpZ25PcHNfNTA4LmNvbmNhdChiaW5hcnlPcHNfNTA5KS5jb25jYXQodW5hcnlPcHNfNTEwKSk7XG5jb25zdCBpc05vbkxpdGVyYWxLZXl3b3JkXzUyNiA9IFIuYWxsUGFzcyhbaXNLZXl3b3JkXzUxNCwgc181NzAgPT4gUi5ub25lKFIuZXF1YWxzKHNfNTcwLnZhbCgpKSwgbGl0ZXJhbEtleXdvcmRzXzQ5NCldKTtcbmNvbnN0IGlzS2V5d29yZEV4cHJQcmVmaXhfNTI3ID0gUi5hbGxQYXNzKFtpc0tleXdvcmRfNTE0LCBzXzU3MSA9PiBSLmFueShSLmVxdWFscyhzXzU3MS52YWwoKSksIFtcImluc3RhbmNlb2ZcIiwgXCJ0eXBlb2ZcIiwgXCJkZWxldGVcIiwgXCJ2b2lkXCIsIFwieWllbGRcIiwgXCJ0aHJvd1wiLCBcIm5ld1wiLCBcImNhc2VcIl0pXSk7XG5sZXQgbGFzdF81MjggPSBwXzU3MiA9PiBwXzU3Mi5sYXN0KCk7XG5sZXQgc2FmZUxhc3RfNTI5ID0gUi5waXBlKFIuY29uZChbW2lzRW1wdHlfNTEyLCBSLmFsd2F5cyhOb3RoaW5nXzQ5MCgpKV0sIFtSLlQsIFIuY29tcG9zZShNYXliZS5vZiwgbGFzdF81MjgpXV0pKTtcbmxldCBzdHVmZlRydWVfNTMwID0gUi5jdXJyeSgocF81NzMsIGJfNTc0KSA9PiBiXzU3NCA/IEp1c3RfNDg5KHBfNTczKSA6IE5vdGhpbmdfNDkwKCkpO1xubGV0IHN0dWZmRmFsc2VfNTMxID0gUi5jdXJyeSgocF81NzUsIGJfNTc2KSA9PiAhYl81NzYgPyBKdXN0XzQ4OShwXzU3NSkgOiBOb3RoaW5nXzQ5MCgpKTtcbmxldCBpc1RvcENvbG9uXzUzMiA9IFIucGlwZShzYWZlTGFzdF81MjksIFIubWFwKGlzQ29sb25fNTIzKSwgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpKTtcbmxldCBpc1RvcFB1bmN0dWF0b3JfNTMzID0gUi5waXBlKHNhZmVMYXN0XzUyOSwgUi5tYXAoaXNQdW5jdHVhdG9yXzUxMyksIE1heWJlLm1heWJlKGZhbHNlLCBSLmlkZW50aXR5KSk7XG5sZXQgaXNFeHByUmV0dXJuXzUzNCA9IFIuY3VycnkoKGxfNTc3LCBwXzU3OCkgPT4ge1xuICBsZXQgcmV0S3dkXzU3OSA9IHNhZmVMYXN0XzUyOShwXzU3OCk7XG4gIGxldCBtYXliZURvdF81ODAgPSBwb3BfNTQ1KHBfNTc4KS5jaGFpbihzYWZlTGFzdF81MjkpO1xuICBpZiAobWF5YmVEb3RfNTgwLm1hcChpc0RvdF81MjIpLmdldE9yRWxzZShmYWxzZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcmV0S3dkXzU3OS5tYXAoc181ODEgPT4ge1xuICAgIHJldHVybiBzXzU4MS5pc0tleXdvcmQoKSAmJiBzXzU4MS52YWwoKSA9PT0gXCJyZXR1cm5cIiAmJiBzXzU4MS5saW5lTnVtYmVyKCkgPT09IGxfNTc3O1xuICB9KS5nZXRPckVsc2UoZmFsc2UpO1xufSk7XG5jb25zdCBpc1RvcE9wZXJhdG9yXzUzNSA9IFIucGlwZShzYWZlTGFzdF81MjksIFIubWFwKGlzT3BlcmF0b3JfNTI1KSwgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpKTtcbmNvbnN0IGlzVG9wS2V5d29yZEV4cHJQcmVmaXhfNTM2ID0gUi5waXBlKHNhZmVMYXN0XzUyOSwgUi5tYXAoaXNLZXl3b3JkRXhwclByZWZpeF81MjcpLCBNYXliZS5tYXliZShmYWxzZSwgUi5pZGVudGl0eSkpO1xubGV0IGlzRXhwclByZWZpeF81MzcgPSBSLmN1cnJ5KChsXzU4MiwgYl81ODMpID0+IFIuY29uZChbW2lzRW1wdHlfNTEyLCBSLmFsd2F5cyhiXzU4MyldLCBbaXNUb3BDb2xvbl81MzIsIFIuYWx3YXlzKGJfNTgzKV0sIFtpc1RvcEtleXdvcmRFeHByUHJlZml4XzUzNiwgUi5UXSwgW2lzVG9wT3BlcmF0b3JfNTM1LCBSLlRdLCBbaXNUb3BQdW5jdHVhdG9yXzUzMywgUi5hbHdheXMoYl81ODMpXSwgW2lzRXhwclJldHVybl81MzQobF81ODIpLCBSLlRdLCBbUi5ULCBSLkZdXSkpO1xubGV0IGN1cmx5XzUzOCA9IHBfNTg0ID0+IHNhZmVMYXN0XzUyOShwXzU4NCkubWFwKGlzQnJhY2VzXzUxNykuY2hhaW4oc3R1ZmZUcnVlXzUzMChwXzU4NCkpO1xubGV0IHBhcmVuXzUzOSA9IHBfNTg1ID0+IHNhZmVMYXN0XzUyOShwXzU4NSkubWFwKGlzUGFyZW5zXzUxNikuY2hhaW4oc3R1ZmZUcnVlXzUzMChwXzU4NSkpO1xubGV0IGZ1bmNfNTQwID0gcF81ODYgPT4gc2FmZUxhc3RfNTI5KHBfNTg2KS5tYXAoaXNGdW5jdGlvbktleXdvcmRfNTI0KS5jaGFpbihzdHVmZlRydWVfNTMwKHBfNTg2KSk7XG5sZXQgaWRlbnRfNTQxID0gcF81ODcgPT4gc2FmZUxhc3RfNTI5KHBfNTg3KS5tYXAoaXNJZGVudGlmaWVyXzUxOSkuY2hhaW4oc3R1ZmZUcnVlXzUzMChwXzU4NykpO1xubGV0IG5vbkxpdGVyYWxLZXl3b3JkXzU0MiA9IHBfNTg4ID0+IHNhZmVMYXN0XzUyOShwXzU4OCkubWFwKGlzTm9uTGl0ZXJhbEtleXdvcmRfNTI2KS5jaGFpbihzdHVmZlRydWVfNTMwKHBfNTg4KSk7XG5sZXQgb3B0XzU0MyA9IFIuY3VycnkoKGFfNTg5LCBiXzU5MCwgcF81OTEpID0+IHtcbiAgbGV0IHJlc3VsdF81OTIgPSBSLnBpcGVLKGFfNTg5LCBiXzU5MCkoTWF5YmUub2YocF81OTEpKTtcbiAgcmV0dXJuIE1heWJlLmlzSnVzdChyZXN1bHRfNTkyKSA/IHJlc3VsdF81OTIgOiBNYXliZS5vZihwXzU5MSk7XG59KTtcbmxldCBub3REb3RfNTQ0ID0gUi5pZkVsc2UoUi53aGVyZUVxKHtzaXplOiAwfSksIEp1c3RfNDg5LCBwXzU5MyA9PiBzYWZlTGFzdF81MjkocF81OTMpLm1hcChzXzU5NCA9PiAhKHNfNTk0LmlzUHVuY3R1YXRvcigpICYmIHNfNTk0LnZhbCgpID09PSBcIi5cIikpLmNoYWluKHN0dWZmVHJ1ZV81MzAocF81OTMpKSk7XG5sZXQgcG9wXzU0NSA9IFIuY29tcG9zZShKdXN0XzQ4OSwgcF81OTUgPT4gcF81OTUucG9wKCkpO1xuY29uc3QgZnVuY3Rpb25QcmVmaXhfNTQ2ID0gUi5waXBlSyhjdXJseV81MzgsIHBvcF81NDUsIHBhcmVuXzUzOSwgcG9wXzU0NSwgb3B0XzU0MyhpZGVudF81NDEsIHBvcF81NDUpLCBmdW5jXzU0MCk7XG5jb25zdCBpc1JlZ2V4UHJlZml4XzU0NyA9IGJfNTk2ID0+IFIuYW55UGFzcyhbaXNFbXB0eV81MTIsIGlzVG9wUHVuY3R1YXRvcl81MzMsIFIucGlwZShNYXliZS5vZiwgUi5waXBlSyhub25MaXRlcmFsS2V5d29yZF81NDIsIHBvcF81NDUsIG5vdERvdF81NDQpLCBNYXliZS5pc0p1c3QpLCBSLnBpcGUoTWF5YmUub2YsIFIucGlwZUsocGFyZW5fNTM5LCBwb3BfNTQ1LCBub25MaXRlcmFsS2V5d29yZF81NDIsIHBvcF81NDUsIG5vdERvdF81NDQpLCBNYXliZS5pc0p1c3QpLCBSLnBpcGUoTWF5YmUub2YsIGZ1bmN0aW9uUHJlZml4XzU0NiwgUi5jaGFpbihwXzU5NyA9PiB7XG4gIHJldHVybiBzYWZlTGFzdF81MjkocF81OTcpLm1hcChzXzU5OCA9PiBzXzU5OC5saW5lTnVtYmVyKCkpLmNoYWluKGZuTGluZV81OTkgPT4ge1xuICAgIHJldHVybiBwb3BfNTQ1KHBfNTk3KS5tYXAoaXNFeHByUHJlZml4XzUzNyhmbkxpbmVfNTk5LCBiXzU5NikpO1xuICB9KS5jaGFpbihzdHVmZkZhbHNlXzUzMShwXzU5NykpO1xufSksIE1heWJlLmlzSnVzdCksIHBfNjAwID0+IHtcbiAgbGV0IGlzQ3VybHlfNjAxID0gTWF5YmUuaXNKdXN0KHNhZmVMYXN0XzUyOShwXzYwMCkubWFwKGlzQnJhY2VzXzUxNykpO1xuICBsZXQgYWxyZWFkeUNoZWNrZWRGdW5jdGlvbl82MDIgPSBSLnBpcGUoTWF5YmUub2YsIGZ1bmN0aW9uUHJlZml4XzU0NiwgTWF5YmUuaXNKdXN0KShwXzYwMCk7XG4gIGlmIChhbHJlYWR5Q2hlY2tlZEZ1bmN0aW9uXzYwMikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gUi5waXBlKE1heWJlLm9mLCBSLmNoYWluKGN1cmx5XzUzOCksIFIuY2hhaW4ocF82MDMgPT4ge1xuICAgIHJldHVybiBzYWZlTGFzdF81MjkocF82MDMpLm1hcChzXzYwNCA9PiBzXzYwNC5saW5lTnVtYmVyKCkpLmNoYWluKGN1cmx5TGluZV82MDUgPT4ge1xuICAgICAgcmV0dXJuIHBvcF81NDUocF82MDMpLm1hcChpc0V4cHJQcmVmaXhfNTM3KGN1cmx5TGluZV82MDUsIGJfNTk2KSk7XG4gICAgfSkuY2hhaW4oc3R1ZmZGYWxzZV81MzEocF82MDMpKTtcbiAgfSksIE1heWJlLmlzSnVzdCkocF82MDApO1xufV0pO1xuZnVuY3Rpb24gbGFzdEVsXzU0OChsXzYwNikge1xuICByZXR1cm4gbF82MDZbbF82MDYubGVuZ3RoIC0gMV07XG59XG5mdW5jdGlvbiBjb3VudFNsYXNoZXNfNTQ5KHJlYWRlcl82MDcpIHtcbiAgbGV0IGluZGV4XzYwOCA9IHJlYWRlcl82MDcuaW5kZXg7XG4gIGxldCBvblNsYXNoXzYwOSA9ICgpID0+IHJlYWRlcl82MDcuc291cmNlLmNoYXJDb2RlQXQoaW5kZXhfNjA4KSA9PT0gOTI7XG4gIGxldCBsZW5ndGhfNjEwID0gcmVhZGVyXzYwNy5zb3VyY2UubGVuZ3RoO1xuICBsZXQgY291bnRfNjExID0gb25TbGFzaF82MDkoKSA/IDEgOiAwO1xuICB3aGlsZSAoKytpbmRleF82MDggPCBsZW5ndGhfNjEwICYmIG9uU2xhc2hfNjA5KCkpIHtcbiAgICArK2NvdW50XzYxMTtcbiAgfVxuICByZXR1cm4gY291bnRfNjExO1xufVxuY29uc3QgY2FsY0RlcHRoXzU1MCA9IFIuY29tcG9zZShNYXRoLmxvZzIsIFIuaW5jKTtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWRlciBleHRlbmRzIFRva2VuaXplciB7XG4gIGNvbnN0cnVjdG9yKHN0cmluZ3NfNjEyLCBjb250ZXh0XzYxMywgcmVwbGFjZW1lbnRzXzYxNCkge1xuICAgIHN1cGVyKEFycmF5LmlzQXJyYXkoc3RyaW5nc182MTIpID8gc3RyaW5nc182MTIuam9pbihcIlwiKSA6IHN0cmluZ3NfNjEyKTtcbiAgICB0aGlzLmRlbGltU3RhY2sgPSBuZXcgTWFwO1xuICAgIHRoaXMuc3ludGF4TmVzdGluZ0RlcHRoID0gMDtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzYxMztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzdHJpbmdzXzYxMikpIHtcbiAgICAgIGxldCB0b3RhbEluZGV4ID0gMDtcbiAgICAgIHRoaXMucmVwbGFjZW1lbnRJbmRleCA9IFIucmVkdWNlKChhY2NfNjE1LCBzdHJSZXBfNjE2KSA9PiB7XG4gICAgICAgIGFjY182MTUucHVzaCh7aW5kZXg6IHRvdGFsSW5kZXggKyBzdHJSZXBfNjE2WzBdLmxlbmd0aCwgcmVwbGFjZW1lbnQ6IHN0clJlcF82MTZbMV19KTtcbiAgICAgICAgdG90YWxJbmRleCArPSBzdHJSZXBfNjE2WzBdLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGFjY182MTU7XG4gICAgICB9LCBbXSwgUi56aXAoc3RyaW5nc182MTIsIHJlcGxhY2VtZW50c182MTQpKTtcbiAgICB9XG4gIH1cbiAgcmVhZChzdGFja182MTcgPSBbXSwgYl82MTggPSBmYWxzZSwgc2luZ2xlRGVsaW1pdGVyXzYxOSA9IGZhbHNlKSB7XG4gICAgbGV0IHByZWZpeF82MjAgPSBMaXN0KCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCB0b2sgPSB0aGlzLmFkdmFuY2UocHJlZml4XzYyMCwgYl82MTgpO1xuICAgICAgaWYgKHRvayBpbnN0YW5jZW9mIFN5bnRheCB8fCB0b2sgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICAgIHN0YWNrXzYxNy5wdXNoKHRvayk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodG9rKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzdGFja182MTcsIHRvayk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKExpc3QuaXNMaXN0KHRvaykpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoc3RhY2tfNjE3LCB0b2sudG9BcnJheSgpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoaXNFT1NfNTAxKHRvaykpIHtcbiAgICAgICAgaWYgKHN0YWNrXzYxN1swXSAmJiBpc0xlZnREZWxpbWl0ZXJfNTA1KHN0YWNrXzYxN1swXS50b2tlbikpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZVVuZXhwZWN0ZWQodG9rKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChpc0xlZnREZWxpbWl0ZXJfNTA1KHRvaykpIHtcbiAgICAgICAgaWYgKGlzTGVmdFN5bnRheF81MDModG9rKSkge1xuICAgICAgICAgIHRoaXMuc3ludGF4TmVzdGluZ0RlcHRoKys7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxpbmUgPSB0b2suc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lO1xuICAgICAgICBsZXQgaW5uZXJCID0gaXNMZWZ0QnJhY2VfNDk2KHRvaykgPyBpc0V4cHJQcmVmaXhfNTM3KGxpbmUsIGJfNjE4KShwcmVmaXhfNjIwKSA6IHRydWU7XG4gICAgICAgIGxldCBpbm5lciA9IHRoaXMucmVhZChbbmV3IFN5bnRheCh0b2spXSwgaW5uZXJCLCBmYWxzZSk7XG4gICAgICAgIGxldCBzdHggPSBuZXcgU3ludGF4KGlubmVyLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICBwcmVmaXhfNjIwID0gcHJlZml4XzYyMC5jb25jYXQoc3R4KTtcbiAgICAgICAgc3RhY2tfNjE3LnB1c2goc3R4KTtcbiAgICAgICAgaWYgKHNpbmdsZURlbGltaXRlcl82MTkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc1JpZ2h0RGVsaW1pdGVyXzUwNih0b2spKSB7XG4gICAgICAgIGlmIChzdGFja182MTdbMF0gJiYgIWlzTWF0Y2hpbmdEZWxpbWl0ZXJzXzUwNyhzdGFja182MTdbMF0udG9rZW4sIHRvaykpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZVVuZXhwZWN0ZWQodG9rKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc3R4ID0gbmV3IFN5bnRheCh0b2ssIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHN0YWNrXzYxNy5wdXNoKHN0eCk7XG4gICAgICAgIGlmICh0aGlzLnN5bnRheE5lc3RpbmdEZXB0aCAmJiBpc1JpZ2h0U3ludGF4XzUwNCh0b2spKSB7XG4gICAgICAgICAgdGhpcy5zeW50YXhOZXN0aW5nRGVwdGgtLTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBzdHggPSBuZXcgU3ludGF4KHRvaywgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgcHJlZml4XzYyMCA9IHByZWZpeF82MjAuY29uY2F0KHN0eCk7XG4gICAgICAgIHN0YWNrXzYxNy5wdXNoKHN0eCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHN0YWNrXzYxNyk7XG4gIH1cbiAgYWR2YW5jZShwcmVmaXhfNjIxLCBiXzYyMikge1xuICAgIGxldCBzdGFydExvY2F0aW9uXzYyMyA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICB0aGlzLmxhc3RJbmRleCA9IHRoaXMuaW5kZXg7XG4gICAgdGhpcy5sYXN0TGluZSA9IHRoaXMubGluZTtcbiAgICB0aGlzLmxhc3RMaW5lU3RhcnQgPSB0aGlzLmxpbmVTdGFydDtcbiAgICB0aGlzLnNraXBDb21tZW50KCk7XG4gICAgdGhpcy5zdGFydEluZGV4ID0gdGhpcy5pbmRleDtcbiAgICB0aGlzLnN0YXJ0TGluZSA9IHRoaXMubGluZTtcbiAgICB0aGlzLnN0YXJ0TGluZVN0YXJ0ID0gdGhpcy5saW5lU3RhcnQ7XG4gICAgaWYgKHRoaXMucmVwbGFjZW1lbnRJbmRleCAmJiB0aGlzLnJlcGxhY2VtZW50SW5kZXhbMF0gJiYgdGhpcy5pbmRleCA+PSB0aGlzLnJlcGxhY2VtZW50SW5kZXhbMF0uaW5kZXgpIHtcbiAgICAgIGxldCByZXAgPSB0aGlzLnJlcGxhY2VtZW50SW5kZXhbMF0ucmVwbGFjZW1lbnQ7XG4gICAgICB0aGlzLnJlcGxhY2VtZW50SW5kZXguc2hpZnQoKTtcbiAgICAgIHJldHVybiByZXA7XG4gICAgfVxuICAgIGxldCBjaGFyQ29kZV82MjQgPSB0aGlzLnNvdXJjZS5jaGFyQ29kZUF0KHRoaXMuaW5kZXgpO1xuICAgIGlmIChjaGFyQ29kZV82MjQgPT09IDk2KSB7XG4gICAgICBsZXQgZWxlbWVudCwgaXRlbXMgPSBbXTtcbiAgICAgIGxldCBzdGFydExvY2F0aW9uXzYyMyA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICBpZiAodGhpcy5zeW50YXhOZXN0aW5nRGVwdGggPT09IDEpIHtcbiAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbl82MjMpO1xuICAgICAgICByZXR1cm4ge3R5cGU6IFJTWU5UQVhfNDkyLCB2YWx1ZTogXCJgXCIsIHNsaWNlOiBzbGljZX07XG4gICAgICB9XG4gICAgICBkbyB7XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLnNjYW5UZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgaXRlbXMucHVzaChlbGVtZW50KTtcbiAgICAgICAgaWYgKGVsZW1lbnQuaW50ZXJwKSB7XG4gICAgICAgICAgZWxlbWVudCA9IHRoaXMucmVhZChbXSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIGFzc2VydChlbGVtZW50LnNpemUgPT09IDEsIFwic2hvdWxkIG9ubHkgaGF2ZSByZWFkIGEgc2luZ2xlIGRlbGltaXRlciBpbnNpZGUgYSB0ZW1wbGF0ZVwiKTtcbiAgICAgICAgICBpdGVtcy5wdXNoKGVsZW1lbnQuZ2V0KDApKTtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoIWVsZW1lbnQudGFpbCk7XG4gICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5URU1QTEFURSwgaXRlbXM6IExpc3QoaXRlbXMpfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3ludGF4TmVzdGluZ0RlcHRoICYmIGNoYXJDb2RlXzYyNCA9PT0gOTIpIHtcbiAgICAgIGxldCBudW1TbGFzaGVzID0gY291bnRTbGFzaGVzXzU0OSh0aGlzKTtcbiAgICAgIGxldCBkZXB0aCA9IGNhbGNEZXB0aF81NTAobnVtU2xhc2hlcyk7XG4gICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4ICsgbnVtU2xhc2hlcykgPT09IDk2KSB7XG4gICAgICAgIGlmIChkZXB0aCA+IHRoaXMuc3ludGF4TmVzdGluZ0RlcHRoKSB7XG4gICAgICAgICAgdGhpcy5pbmRleCArPSBNYXRoLnBvdygyLCB0aGlzLnN5bnRheE5lc3RpbmdEZXB0aCkgLSAxO1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlSUxMRUdBTCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGRlcHRoIDwgdGhpcy5zeW50YXhOZXN0aW5nRGVwdGggLSAxKSB7XG4gICAgICAgICAgdGhpcy5pbmRleCArPSBudW1TbGFzaGVzO1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlSUxMRUdBTCgpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpc0Nsb3NpbmcgPSBkZXB0aCA9PT0gdGhpcy5zeW50YXhOZXN0aW5nRGVwdGggLSAxO1xuICAgICAgICBsZXQgc3RhcnRMb2NhdGlvbl82MjMgPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICAgIGxldCBzbGljZSA9IHRoaXMuZ2V0U2xpY2Uoc3RhcnQsIHN0YXJ0TG9jYXRpb25fNjIzKTtcbiAgICAgICAgdGhpcy5pbmRleCArPSBudW1TbGFzaGVzICsgMTtcbiAgICAgICAgcmV0dXJuIHt0eXBlOiBpc0Nsb3NpbmcgPyBSU1lOVEFYXzQ5MiA6IExTWU5UQVhfNDkxLCB2YWx1ZTogXCJcXFxcXCIucmVwZWF0KG51bVNsYXNoZXMpLmNvbmNhdChcIidcIiksIHNsaWNlOiBzbGljZX07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyQ29kZV82MjQgPT09IDM1KSB7XG4gICAgICBsZXQgc3RhcnRMb2NhdGlvbl82MjMgPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbl82MjMpO1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgaWYgKHRoaXMuc291cmNlLmNoYXJDb2RlQXQodGhpcy5pbmRleCkgPT09IDk2KSB7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgcmV0dXJuIHt0eXBlOiBMU1lOVEFYXzQ5MSwgdmFsdWU6IFwiI2BcIiwgc2xpY2U6IHNsaWNlfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLklERU5USUZJRVIsIHZhbHVlOiBcIiNcIiwgc2xpY2U6IHNsaWNlfTtcbiAgICB9IGVsc2UgaWYgKGNoYXJDb2RlXzYyNCA9PT0gNjQpIHtcbiAgICAgIGxldCBzdGFydExvY2F0aW9uXzYyMyA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0LCBzdGFydExvY2F0aW9uXzYyMyk7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICByZXR1cm4ge3R5cGU6IEFUXzQ5MywgdmFsdWU6IFwiQFwiLCBzbGljZTogc2xpY2V9O1xuICAgIH1cbiAgICBsZXQgbG9va2FoZWFkXzYyNSA9IHN1cGVyLmFkdmFuY2UoKTtcbiAgICBpZiAobG9va2FoZWFkXzYyNS50eXBlID09PSBUb2tlblR5cGUuRElWICYmIGlzUmVnZXhQcmVmaXhfNTQ3KGJfNjIyKShwcmVmaXhfNjIxKSkge1xuICAgICAgcmV0dXJuIHN1cGVyLnNjYW5SZWdFeHAoXCIvXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbG9va2FoZWFkXzYyNTtcbiAgfVxuICBzY2FuVGVtcGxhdGVFbGVtZW50KCkge1xuICAgIGxldCBzdGFydExvY2F0aW9uXzYyNiA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICBsZXQgc3RhcnRfNjI3ID0gdGhpcy5pbmRleDtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuc291cmNlLmxlbmd0aCkge1xuICAgICAgbGV0IGNoID0gdGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KTtcbiAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSA5NjpcbiAgICAgICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0XzYyNywgc3RhcnRMb2NhdGlvbl82MjYpO1xuICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5URU1QTEFURSwgdGFpbDogdHJ1ZSwgaW50ZXJwOiBmYWxzZSwgc2xpY2U6IHNsaWNlfTtcbiAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4ICsgMSkgPT09IDEyMykge1xuICAgICAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydF82MjcsIHN0YXJ0TG9jYXRpb25fNjI2KTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLlRFTVBMQVRFLCB0YWlsOiBmYWxzZSwgaW50ZXJwOiB0cnVlLCBzbGljZTogc2xpY2V9O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgbGV0IG9jdGFsID0gdGhpcy5zY2FuU3RyaW5nRXNjYXBlKFwiXCIsIG51bGwpWzFdO1xuICAgICAgICAgICAgaWYgKG9jdGFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVJTExFR0FMKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUlMTEVHQUwoKTtcbiAgfVxufVxuIl19