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

var Just_486 = _ramdaFantasy.Maybe.Just;
var Nothing_487 = _ramdaFantasy.Maybe.Nothing;

var LSYNTAX_488 = { name: "left-syntax" };
var RSYNTAX_489 = { name: "right-syntax" };
var literalKeywords_490 = ["this", "null", "true", "false"];
var isLeftBracket_491 = R.whereEq({ type: _tokenizer.TokenType.LBRACK });
var isLeftBrace_492 = R.whereEq({ type: _tokenizer.TokenType.LBRACE });
var isLeftParen_493 = R.whereEq({ type: _tokenizer.TokenType.LPAREN });
var isRightBracket_494 = R.whereEq({ type: _tokenizer.TokenType.RBRACK });
var isRightBrace_495 = R.whereEq({ type: _tokenizer.TokenType.RBRACE });
var isRightParen_496 = R.whereEq({ type: _tokenizer.TokenType.RPAREN });
var isEOS_497 = R.whereEq({ type: _tokenizer.TokenType.EOS });
var isHash_498 = R.whereEq({ type: _tokenizer.TokenType.IDENTIFIER, value: "#" });
var isLeftSyntax_499 = R.whereEq({ type: LSYNTAX_488 });
var isRightSyntax_500 = R.whereEq({ type: RSYNTAX_489 });
var isLeftDelimiter_501 = R.anyPass([isLeftBracket_491, isLeftBrace_492, isLeftParen_493, isLeftSyntax_499]);
var isRightDelimiter_502 = R.anyPass([isRightBracket_494, isRightBrace_495, isRightParen_496, isRightSyntax_500]);
var isMatchingDelimiters_503 = R.cond([[isLeftBracket_491, function (__544, b_545) {
  return isRightBracket_494(b_545);
}], [isLeftBrace_492, function (__546, b_547) {
  return isRightBrace_495(b_547);
}], [isLeftParen_493, function (__548, b_549) {
  return isRightParen_496(b_549);
}], [isLeftSyntax_499, function (__550, b_551) {
  return isRightSyntax_500(b_551);
}], [R.T, R.F]]);
var assignOps_504 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
var binaryOps_505 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
var unaryOps_506 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
var isEmpty_507 = R.whereEq({ size: 0 });
var isPunctuator_508 = function isPunctuator_508(s_552) {
  return s_552.isPunctuator();
};
var isKeyword_509 = function isKeyword_509(s_553) {
  return s_553.isKeyword();
};
var isDelimiter_510 = function isDelimiter_510(s_554) {
  return s_554.isDelimiter();
};
var isParens_511 = function isParens_511(s_555) {
  return s_555.isParens();
};
var isBraces_512 = function isBraces_512(s_556) {
  return s_556.isBraces();
};
var isBrackets_513 = function isBrackets_513(s_557) {
  return s_557.isBrackets();
};
var isIdentifier_514 = function isIdentifier_514(s_558) {
  return s_558.isIdentifier();
};
var val_515 = function val_515(s_559) {
  return s_559.val();
};
var isVal_516 = R.curry(function (v_560, s_561) {
  return s_561.val() === v_560;
});
var isDot_517 = R.allPass([isPunctuator_508, isVal_516(".")]);
var isColon_518 = R.allPass([isPunctuator_508, isVal_516(":")]);
var isFunctionKeyword_519 = R.allPass([isKeyword_509, isVal_516("function")]);
var isOperator_520 = function isOperator_520(s_562) {
  return (s_562.isPunctuator() || s_562.isKeyword()) && R.any(R.equals(s_562.val()), assignOps_504.concat(binaryOps_505).concat(unaryOps_506));
};
var isNonLiteralKeyword_521 = R.allPass([isKeyword_509, function (s_563) {
  return R.none(R.equals(s_563.val()), literalKeywords_490);
}]);
var isKeywordExprPrefix_522 = R.allPass([isKeyword_509, function (s_564) {
  return R.any(R.equals(s_564.val()), ["instanceof", "typeof", "delete", "void", "yield", "throw", "new", "case"]);
}]);
var last_523 = function last_523(p_565) {
  return p_565.last();
};
var safeLast_524 = R.pipe(R.cond([[isEmpty_507, R.always(Nothing_487())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last_523)]]));
var stuffTrue_525 = R.curry(function (p_566, b_567) {
  return b_567 ? Just_486(p_566) : Nothing_487();
});
var stuffFalse_526 = R.curry(function (p_568, b_569) {
  return !b_569 ? Just_486(p_568) : Nothing_487();
});
var isTopColon_527 = R.pipe(safeLast_524, R.map(isColon_518), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopPunctuator_528 = R.pipe(safeLast_524, R.map(isPunctuator_508), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprReturn_529 = R.curry(function (l_570, p_571) {
  var retKwd_572 = safeLast_524(p_571);
  var maybeDot_573 = pop_540(p_571).chain(safeLast_524);
  if (maybeDot_573.map(isDot_517).getOrElse(false)) {
    return true;
  }
  return retKwd_572.map(function (s_574) {
    return s_574.isKeyword() && s_574.val() === "return" && s_574.lineNumber() === l_570;
  }).getOrElse(false);
});
var isTopOperator_530 = R.pipe(safeLast_524, R.map(isOperator_520), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopKeywordExprPrefix_531 = R.pipe(safeLast_524, R.map(isKeywordExprPrefix_522), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprPrefix_532 = R.curry(function (l_575, b_576) {
  return R.cond([[isEmpty_507, R.always(b_576)], [isTopColon_527, R.always(b_576)], [isTopKeywordExprPrefix_531, R.T], [isTopOperator_530, R.T], [isTopPunctuator_528, R.always(b_576)], [isExprReturn_529(l_575), R.T], [R.T, R.F]]);
});
var curly_533 = function curly_533(p_577) {
  return safeLast_524(p_577).map(isBraces_512).chain(stuffTrue_525(p_577));
};
var paren_534 = function paren_534(p_578) {
  return safeLast_524(p_578).map(isParens_511).chain(stuffTrue_525(p_578));
};
var func_535 = function func_535(p_579) {
  return safeLast_524(p_579).map(isFunctionKeyword_519).chain(stuffTrue_525(p_579));
};
var ident_536 = function ident_536(p_580) {
  return safeLast_524(p_580).map(isIdentifier_514).chain(stuffTrue_525(p_580));
};
var nonLiteralKeyword_537 = function nonLiteralKeyword_537(p_581) {
  return safeLast_524(p_581).map(isNonLiteralKeyword_521).chain(stuffTrue_525(p_581));
};
var opt_538 = R.curry(function (a_582, b_583, p_584) {
  var result_585 = R.pipeK(a_582, b_583)(_ramdaFantasy.Maybe.of(p_584));
  return _ramdaFantasy.Maybe.isJust(result_585) ? result_585 : _ramdaFantasy.Maybe.of(p_584);
});
var notDot_539 = R.ifElse(R.whereEq({ size: 0 }), Just_486, function (p_586) {
  return safeLast_524(p_586).map(function (s_587) {
    return !(s_587.isPunctuator() && s_587.val() === ".");
  }).chain(stuffTrue_525(p_586));
});
var pop_540 = R.compose(Just_486, function (p_588) {
  return p_588.pop();
});
var functionPrefix_541 = R.pipeK(curly_533, pop_540, paren_534, pop_540, opt_538(ident_536, pop_540), func_535);
var isRegexPrefix_542 = function isRegexPrefix_542(b_589) {
  return R.anyPass([isEmpty_507, isTopPunctuator_528, R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword_537, pop_540, notDot_539), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren_534, pop_540, nonLiteralKeyword_537, pop_540, notDot_539), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_541, R.chain(function (p_590) {
    return safeLast_524(p_590).map(function (s_591) {
      return s_591.lineNumber();
    }).chain(function (fnLine_592) {
      return pop_540(p_590).map(isExprPrefix_532(fnLine_592, b_589));
    }).chain(stuffFalse_526(p_590));
  }), _ramdaFantasy.Maybe.isJust), function (p_593) {
    var isCurly_594 = _ramdaFantasy.Maybe.isJust(safeLast_524(p_593).map(isBraces_512));
    var alreadyCheckedFunction_595 = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_541, _ramdaFantasy.Maybe.isJust)(p_593);
    if (alreadyCheckedFunction_595) {
      return false;
    }
    return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly_533), R.chain(function (p_596) {
      return safeLast_524(p_596).map(function (s_597) {
        return s_597.lineNumber();
      }).chain(function (curlyLine_598) {
        return pop_540(p_596).map(isExprPrefix_532(curlyLine_598, b_589));
      }).chain(stuffFalse_526(p_596));
    }), _ramdaFantasy.Maybe.isJust)(p_593);
  }]);
};
function lastEl_543(l_599) {
  return l_599[l_599.length - 1];
}

var Reader = function (_Tokenizer) {
  _inherits(Reader, _Tokenizer);

  function Reader(strings_600, context_601, replacements_602) {
    _classCallCheck(this, Reader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Reader).call(this, Array.isArray(strings_600) ? strings_600.join("") : strings_600));

    _this.delimStack = new Map();
    _this.insideSyntaxTemplate = [false];
    _this.context = context_601;
    if (Array.isArray(strings_600)) {
      (function () {
        var totalIndex = 0;
        _this.replacementIndex = R.reduce(function (acc_603, strRep_604) {
          acc_603.push({ index: totalIndex + strRep_604[0].length, replacement: strRep_604[1] });
          totalIndex += strRep_604[0].length;
          return acc_603;
        }, [], R.zip(strings_600, replacements_602));
      })();
    }
    return _this;
  }

  _createClass(Reader, [{
    key: "read",
    value: function read() {
      var stack_605 = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var b_606 = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var singleDelimiter_607 = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var prefix_608 = (0, _immutable.List)();
      while (true) {
        var tok = this.advance(prefix_608, b_606);
        if (tok instanceof _syntax2.default || tok instanceof _terms2.default) {
          stack_605.push(tok);
          continue;
        }
        if (Array.isArray(tok)) {
          Array.prototype.push.apply(stack_605, tok);
          continue;
        }
        if (_immutable.List.isList(tok)) {
          Array.prototype.push.apply(stack_605, tok.toArray());
          continue;
        }
        if (isEOS_497(tok)) {
          if (stack_605[0] && isLeftDelimiter_501(stack_605[0].token)) {
            throw this.createUnexpected(tok);
          }
          break;
        }
        if (isLeftDelimiter_501(tok)) {
          if (isLeftSyntax_499(tok)) {
            this.insideSyntaxTemplate.push(true);
          }
          var line = tok.slice.startLocation.line;
          var innerB = isLeftBrace_492(tok) ? isExprPrefix_532(line, b_606)(prefix_608) : true;
          var inner = this.read([new _syntax2.default(tok)], innerB, false);
          var stx = new _syntax2.default(inner, this.context);
          prefix_608 = prefix_608.concat(stx);
          stack_605.push(stx);
          if (singleDelimiter_607) {
            break;
          }
        } else if (isRightDelimiter_502(tok)) {
          if (stack_605[0] && !isMatchingDelimiters_503(stack_605[0].token, tok)) {
            throw this.createUnexpected(tok);
          }
          var _stx = new _syntax2.default(tok, this.context);
          stack_605.push(_stx);
          if (lastEl_543(this.insideSyntaxTemplate) && isRightSyntax_500(tok)) {
            this.insideSyntaxTemplate.pop();
          }
          break;
        } else {
          var _stx2 = new _syntax2.default(tok, this.context);
          prefix_608 = prefix_608.concat(_stx2);
          stack_605.push(_stx2);
        }
      }
      return (0, _immutable.List)(stack_605);
    }
  }, {
    key: "advance",
    value: function advance(prefix_609, b_610) {
      var startLocation_611 = this.getLocation();
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
      var charCode_612 = this.source.charCodeAt(this.index);
      if (charCode_612 === 96) {
        var element = void 0,
            items = [];
        var _startLocation_ = this.getLocation();
        var start = this.index;
        this.index++;
        if (lastEl_543(this.insideSyntaxTemplate)) {
          var slice = this.getSlice(start, _startLocation_);
          return { type: RSYNTAX_489, value: "`", slice: slice };
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
      } else if (charCode_612 === 35) {
        var _startLocation_2 = this.getLocation();
        var _start = this.index;
        var _slice = this.getSlice(_start, _startLocation_2);
        this.index++;
        if (this.source.charCodeAt(this.index) === 96) {
          this.index++;
          return { type: LSYNTAX_488, value: "#`", slice: _slice };
        }
        return { type: _tokenizer.TokenType.IDENTIFIER, value: "#", slice: _slice };
      }
      var lookahead_613 = _get(Object.getPrototypeOf(Reader.prototype), "advance", this).call(this);
      if (lookahead_613.type === _tokenizer.TokenType.DIV && isRegexPrefix_542(b_610)(prefix_609)) {
        return _get(Object.getPrototypeOf(Reader.prototype), "scanRegExp", this).call(this, "/");
      }
      return lookahead_613;
    }
  }, {
    key: "scanTemplateElement",
    value: function scanTemplateElement() {
      var startLocation_614 = this.getLocation();
      var start_615 = this.index;
      while (this.index < this.source.length) {
        var ch = this.source.charCodeAt(this.index);
        switch (ch) {
          case 96:
            var slice = this.getSlice(start_615, startLocation_614);
            this.index++;
            return { type: _tokenizer.TokenType.TEMPLATE, tail: true, interp: false, slice: slice };
          case 36:
            if (this.source.charCodeAt(this.index + 1) === 123) {
              var _slice2 = this.getSlice(start_615, startLocation_614);
              this.index += 1;
              return { type: _tokenizer.TokenType.TEMPLATE, tail: false, interp: true, slice: _slice2 };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3NoaWZ0LXJlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOztJQUFhOztBQUNiOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7OztBQUZBLElBQU0sV0FBVyxvQkFBTSxJQUFOO0FBQ2pCLElBQU0sY0FBYyxvQkFBTSxPQUFOOztBQUVwQixJQUFNLGNBQWMsRUFBQyxNQUFNLGFBQU4sRUFBZjtBQUNOLElBQU0sY0FBYyxFQUFDLE1BQU0sY0FBTixFQUFmO0FBQ04sSUFBTSxzQkFBc0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixPQUF6QixDQUF0QjtBQUNOLElBQU0sb0JBQW9CLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFWLEVBQWpCLENBQXBCO0FBQ04sSUFBTSxrQkFBa0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBakIsQ0FBbEI7QUFDTixJQUFNLGtCQUFrQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBVixFQUFqQixDQUFsQjtBQUNOLElBQU0scUJBQXFCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFWLEVBQWpCLENBQXJCO0FBQ04sSUFBTSxtQkFBbUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBakIsQ0FBbkI7QUFDTixJQUFNLG1CQUFtQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBVixFQUFqQixDQUFuQjtBQUNOLElBQU0sWUFBWSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsR0FBVixFQUFqQixDQUFaO0FBQ04sSUFBTSxhQUFhLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxVQUFWLEVBQXNCLE9BQU8sR0FBUCxFQUF2QyxDQUFiO0FBQ04sSUFBTSxtQkFBbUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLFdBQU4sRUFBWCxDQUFuQjtBQUNOLElBQU0sb0JBQW9CLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxXQUFOLEVBQVgsQ0FBcEI7QUFDTixJQUFNLHNCQUFzQixFQUFFLE9BQUYsQ0FBVSxDQUFDLGlCQUFELEVBQW9CLGVBQXBCLEVBQXFDLGVBQXJDLEVBQXNELGdCQUF0RCxDQUFWLENBQXRCO0FBQ04sSUFBTSx1QkFBdUIsRUFBRSxPQUFGLENBQVUsQ0FBQyxrQkFBRCxFQUFxQixnQkFBckIsRUFBdUMsZ0JBQXZDLEVBQXlELGlCQUF6RCxDQUFWLENBQXZCO0FBQ04sSUFBTSwyQkFBMkIsRUFBRSxJQUFGLENBQU8sQ0FBQyxDQUFDLGlCQUFELEVBQW9CLFVBQUMsS0FBRCxFQUFRLEtBQVI7U0FBa0IsbUJBQW1CLEtBQW5CO0NBQWxCLENBQXJCLEVBQW1FLENBQUMsZUFBRCxFQUFrQixVQUFDLEtBQUQsRUFBUSxLQUFSO1NBQWtCLGlCQUFpQixLQUFqQjtDQUFsQixDQUFyRixFQUFpSSxDQUFDLGVBQUQsRUFBa0IsVUFBQyxLQUFELEVBQVEsS0FBUjtTQUFrQixpQkFBaUIsS0FBakI7Q0FBbEIsQ0FBbkosRUFBK0wsQ0FBQyxnQkFBRCxFQUFtQixVQUFDLEtBQUQsRUFBUSxLQUFSO1NBQWtCLGtCQUFrQixLQUFsQjtDQUFsQixDQUFsTixFQUErUCxDQUFDLEVBQUUsQ0FBRixFQUFLLEVBQUUsQ0FBRixDQUFyUSxDQUFQLENBQTNCO0FBQ04sSUFBTSxnQkFBZ0IsQ0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVosRUFBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0MsS0FBcEMsRUFBMkMsS0FBM0MsRUFBa0QsTUFBbEQsRUFBMEQsSUFBMUQsRUFBZ0UsSUFBaEUsRUFBc0UsSUFBdEUsRUFBNEUsR0FBNUUsQ0FBaEI7QUFDTixJQUFNLGdCQUFnQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixJQUExQixFQUFnQyxJQUFoQyxFQUFzQyxLQUF0QyxFQUE2QyxHQUE3QyxFQUFrRCxHQUFsRCxFQUF1RCxHQUF2RCxFQUE0RCxJQUE1RCxFQUFrRSxJQUFsRSxFQUF3RSxHQUF4RSxFQUE2RSxHQUE3RSxFQUFrRixLQUFsRixFQUF5RixJQUF6RixFQUErRixJQUEvRixFQUFxRyxJQUFyRyxFQUEyRyxHQUEzRyxFQUFnSCxHQUFoSCxFQUFxSCxJQUFySCxFQUEySCxLQUEzSCxFQUFrSSxZQUFsSSxDQUFoQjtBQUNOLElBQU0sZUFBZSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsR0FBYixFQUFrQixHQUFsQixFQUF1QixRQUF2QixFQUFpQyxNQUFqQyxFQUF5QyxRQUF6QyxFQUFtRCxPQUFuRCxFQUE0RCxPQUE1RCxFQUFxRSxLQUFyRSxDQUFmO0FBQ04sSUFBTSxjQUFjLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxDQUFOLEVBQVgsQ0FBZDtBQUNOLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQjtTQUFTLE1BQU0sWUFBTjtDQUFUO0FBQ3pCLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCO1NBQVMsTUFBTSxTQUFOO0NBQVQ7QUFDdEIsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0I7U0FBUyxNQUFNLFdBQU47Q0FBVDtBQUN4QixJQUFNLGVBQWUsU0FBZixZQUFlO1NBQVMsTUFBTSxRQUFOO0NBQVQ7QUFDckIsSUFBTSxlQUFlLFNBQWYsWUFBZTtTQUFTLE1BQU0sUUFBTjtDQUFUO0FBQ3JCLElBQU0saUJBQWlCLFNBQWpCLGNBQWlCO1NBQVMsTUFBTSxVQUFOO0NBQVQ7QUFDdkIsSUFBTSxtQkFBbUIsU0FBbkIsZ0JBQW1CO1NBQVMsTUFBTSxZQUFOO0NBQVQ7QUFDekIsSUFBTSxVQUFVLFNBQVYsT0FBVTtTQUFTLE1BQU0sR0FBTjtDQUFUO0FBQ2hCLElBQU0sWUFBWSxFQUFFLEtBQUYsQ0FBUSxVQUFDLEtBQUQsRUFBUSxLQUFSO1NBQWtCLE1BQU0sR0FBTixPQUFnQixLQUFoQjtDQUFsQixDQUFwQjtBQUNOLElBQU0sWUFBWSxFQUFFLE9BQUYsQ0FBVSxDQUFDLGdCQUFELEVBQW1CLFVBQVUsR0FBVixDQUFuQixDQUFWLENBQVo7QUFDTixJQUFNLGNBQWMsRUFBRSxPQUFGLENBQVUsQ0FBQyxnQkFBRCxFQUFtQixVQUFVLEdBQVYsQ0FBbkIsQ0FBVixDQUFkO0FBQ04sSUFBTSx3QkFBd0IsRUFBRSxPQUFGLENBQVUsQ0FBQyxhQUFELEVBQWdCLFVBQVUsVUFBVixDQUFoQixDQUFWLENBQXhCO0FBQ04sSUFBTSxpQkFBaUIsU0FBakIsY0FBaUI7U0FBUyxDQUFDLE1BQU0sWUFBTixNQUF3QixNQUFNLFNBQU4sRUFBeEIsQ0FBRCxJQUErQyxFQUFFLEdBQUYsQ0FBTSxFQUFFLE1BQUYsQ0FBUyxNQUFNLEdBQU4sRUFBVCxDQUFOLEVBQTZCLGNBQWMsTUFBZCxDQUFxQixhQUFyQixFQUFvQyxNQUFwQyxDQUEyQyxZQUEzQyxDQUE3QixDQUEvQztDQUFUO0FBQ3ZCLElBQU0sMEJBQTBCLEVBQUUsT0FBRixDQUFVLENBQUMsYUFBRCxFQUFnQjtTQUFTLEVBQUUsSUFBRixDQUFPLEVBQUUsTUFBRixDQUFTLE1BQU0sR0FBTixFQUFULENBQVAsRUFBOEIsbUJBQTlCO0NBQVQsQ0FBMUIsQ0FBMUI7QUFDTixJQUFNLDBCQUEwQixFQUFFLE9BQUYsQ0FBVSxDQUFDLGFBQUQsRUFBZ0I7U0FBUyxFQUFFLEdBQUYsQ0FBTSxFQUFFLE1BQUYsQ0FBUyxNQUFNLEdBQU4sRUFBVCxDQUFOLEVBQTZCLENBQUMsWUFBRCxFQUFlLFFBQWYsRUFBeUIsUUFBekIsRUFBbUMsTUFBbkMsRUFBMkMsT0FBM0MsRUFBb0QsT0FBcEQsRUFBNkQsS0FBN0QsRUFBb0UsTUFBcEUsQ0FBN0I7Q0FBVCxDQUExQixDQUExQjtBQUNOLElBQUksV0FBVyxTQUFYLFFBQVc7U0FBUyxNQUFNLElBQU47Q0FBVDtBQUNmLElBQUksZUFBZSxFQUFFLElBQUYsQ0FBTyxFQUFFLElBQUYsQ0FBTyxDQUFDLENBQUMsV0FBRCxFQUFjLEVBQUUsTUFBRixDQUFTLGFBQVQsQ0FBZCxDQUFELEVBQXlDLENBQUMsRUFBRSxDQUFGLEVBQUssRUFBRSxPQUFGLENBQVUsb0JBQU0sRUFBTixFQUFVLFFBQXBCLENBQU4sQ0FBekMsQ0FBUCxDQUFQLENBQWY7QUFDSixJQUFJLGdCQUFnQixFQUFFLEtBQUYsQ0FBUSxVQUFDLEtBQUQsRUFBUSxLQUFSO1NBQWtCLFFBQVEsU0FBUyxLQUFULENBQVIsR0FBMEIsYUFBMUI7Q0FBbEIsQ0FBeEI7QUFDSixJQUFJLGlCQUFpQixFQUFFLEtBQUYsQ0FBUSxVQUFDLEtBQUQsRUFBUSxLQUFSO1NBQWtCLENBQUMsS0FBRCxHQUFTLFNBQVMsS0FBVCxDQUFULEdBQTJCLGFBQTNCO0NBQWxCLENBQXpCO0FBQ0osSUFBSSxpQkFBaUIsRUFBRSxJQUFGLENBQU8sWUFBUCxFQUFxQixFQUFFLEdBQUYsQ0FBTSxXQUFOLENBQXJCLEVBQXlDLG9CQUFNLEtBQU4sQ0FBWSxLQUFaLEVBQW1CLEVBQUUsUUFBRixDQUE1RCxDQUFqQjtBQUNKLElBQUksc0JBQXNCLEVBQUUsSUFBRixDQUFPLFlBQVAsRUFBcUIsRUFBRSxHQUFGLENBQU0sZ0JBQU4sQ0FBckIsRUFBOEMsb0JBQU0sS0FBTixDQUFZLEtBQVosRUFBbUIsRUFBRSxRQUFGLENBQWpFLENBQXRCO0FBQ0osSUFBSSxtQkFBbUIsRUFBRSxLQUFGLENBQVEsVUFBQyxLQUFELEVBQVEsS0FBUixFQUFrQjtBQUMvQyxNQUFJLGFBQWEsYUFBYSxLQUFiLENBQWIsQ0FEMkM7QUFFL0MsTUFBSSxlQUFlLFFBQVEsS0FBUixFQUFlLEtBQWYsQ0FBcUIsWUFBckIsQ0FBZixDQUYyQztBQUcvQyxNQUFJLGFBQWEsR0FBYixDQUFpQixTQUFqQixFQUE0QixTQUE1QixDQUFzQyxLQUF0QyxDQUFKLEVBQWtEO0FBQ2hELFdBQU8sSUFBUCxDQURnRDtHQUFsRDtBQUdBLFNBQU8sV0FBVyxHQUFYLENBQWUsaUJBQVM7QUFDN0IsV0FBTyxNQUFNLFNBQU4sTUFBcUIsTUFBTSxHQUFOLE9BQWdCLFFBQWhCLElBQTRCLE1BQU0sVUFBTixPQUF1QixLQUF2QixDQUQzQjtHQUFULENBQWYsQ0FFSixTQUZJLENBRU0sS0FGTixDQUFQLENBTitDO0NBQWxCLENBQTNCO0FBVUosSUFBTSxvQkFBb0IsRUFBRSxJQUFGLENBQU8sWUFBUCxFQUFxQixFQUFFLEdBQUYsQ0FBTSxjQUFOLENBQXJCLEVBQTRDLG9CQUFNLEtBQU4sQ0FBWSxLQUFaLEVBQW1CLEVBQUUsUUFBRixDQUEvRCxDQUFwQjtBQUNOLElBQU0sNkJBQTZCLEVBQUUsSUFBRixDQUFPLFlBQVAsRUFBcUIsRUFBRSxHQUFGLENBQU0sdUJBQU4sQ0FBckIsRUFBcUQsb0JBQU0sS0FBTixDQUFZLEtBQVosRUFBbUIsRUFBRSxRQUFGLENBQXhFLENBQTdCO0FBQ04sSUFBSSxtQkFBbUIsRUFBRSxLQUFGLENBQVEsVUFBQyxLQUFELEVBQVEsS0FBUjtTQUFrQixFQUFFLElBQUYsQ0FBTyxDQUFDLENBQUMsV0FBRCxFQUFjLEVBQUUsTUFBRixDQUFTLEtBQVQsQ0FBZCxDQUFELEVBQWlDLENBQUMsY0FBRCxFQUFpQixFQUFFLE1BQUYsQ0FBUyxLQUFULENBQWpCLENBQWpDLEVBQW9FLENBQUMsMEJBQUQsRUFBNkIsRUFBRSxDQUFGLENBQWpHLEVBQXVHLENBQUMsaUJBQUQsRUFBb0IsRUFBRSxDQUFGLENBQTNILEVBQWlJLENBQUMsbUJBQUQsRUFBc0IsRUFBRSxNQUFGLENBQVMsS0FBVCxDQUF0QixDQUFqSSxFQUF5SyxDQUFDLGlCQUFpQixLQUFqQixDQUFELEVBQTBCLEVBQUUsQ0FBRixDQUFuTSxFQUF5TSxDQUFDLEVBQUUsQ0FBRixFQUFLLEVBQUUsQ0FBRixDQUEvTSxDQUFQO0NBQWxCLENBQTNCO0FBQ0osSUFBSSxZQUFZLFNBQVosU0FBWTtTQUFTLGFBQWEsS0FBYixFQUFvQixHQUFwQixDQUF3QixZQUF4QixFQUFzQyxLQUF0QyxDQUE0QyxjQUFjLEtBQWQsQ0FBNUM7Q0FBVDtBQUNoQixJQUFJLFlBQVksU0FBWixTQUFZO1NBQVMsYUFBYSxLQUFiLEVBQW9CLEdBQXBCLENBQXdCLFlBQXhCLEVBQXNDLEtBQXRDLENBQTRDLGNBQWMsS0FBZCxDQUE1QztDQUFUO0FBQ2hCLElBQUksV0FBVyxTQUFYLFFBQVc7U0FBUyxhQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FBd0IscUJBQXhCLEVBQStDLEtBQS9DLENBQXFELGNBQWMsS0FBZCxDQUFyRDtDQUFUO0FBQ2YsSUFBSSxZQUFZLFNBQVosU0FBWTtTQUFTLGFBQWEsS0FBYixFQUFvQixHQUFwQixDQUF3QixnQkFBeEIsRUFBMEMsS0FBMUMsQ0FBZ0QsY0FBYyxLQUFkLENBQWhEO0NBQVQ7QUFDaEIsSUFBSSx3QkFBd0IsU0FBeEIscUJBQXdCO1NBQVMsYUFBYSxLQUFiLEVBQW9CLEdBQXBCLENBQXdCLHVCQUF4QixFQUFpRCxLQUFqRCxDQUF1RCxjQUFjLEtBQWQsQ0FBdkQ7Q0FBVDtBQUM1QixJQUFJLFVBQVUsRUFBRSxLQUFGLENBQVEsVUFBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBeUI7QUFDN0MsTUFBSSxhQUFhLEVBQUUsS0FBRixDQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLG9CQUFNLEVBQU4sQ0FBUyxLQUFULENBQXRCLENBQWIsQ0FEeUM7QUFFN0MsU0FBTyxvQkFBTSxNQUFOLENBQWEsVUFBYixJQUEyQixVQUEzQixHQUF3QyxvQkFBTSxFQUFOLENBQVMsS0FBVCxDQUF4QyxDQUZzQztDQUF6QixDQUFsQjtBQUlKLElBQUksYUFBYSxFQUFFLE1BQUYsQ0FBUyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sQ0FBTixFQUFYLENBQVQsRUFBK0IsUUFBL0IsRUFBeUM7U0FBUyxhQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FBd0I7V0FBUyxFQUFFLE1BQU0sWUFBTixNQUF3QixNQUFNLEdBQU4sT0FBZ0IsR0FBaEIsQ0FBMUI7R0FBVCxDQUF4QixDQUFpRixLQUFqRixDQUF1RixjQUFjLEtBQWQsQ0FBdkY7Q0FBVCxDQUF0RDtBQUNKLElBQUksVUFBVSxFQUFFLE9BQUYsQ0FBVSxRQUFWLEVBQW9CO1NBQVMsTUFBTSxHQUFOO0NBQVQsQ0FBOUI7QUFDSixJQUFNLHFCQUFxQixFQUFFLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLE9BQW5CLEVBQTRCLFNBQTVCLEVBQXVDLE9BQXZDLEVBQWdELFFBQVEsU0FBUixFQUFtQixPQUFuQixDQUFoRCxFQUE2RSxRQUE3RSxDQUFyQjtBQUNOLElBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQjtTQUFTLEVBQUUsT0FBRixDQUFVLENBQUMsV0FBRCxFQUFjLG1CQUFkLEVBQW1DLEVBQUUsSUFBRixDQUFPLG9CQUFNLEVBQU4sRUFBVSxFQUFFLEtBQUYsQ0FBUSxxQkFBUixFQUErQixPQUEvQixFQUF3QyxVQUF4QyxDQUFqQixFQUFzRSxvQkFBTSxNQUFOLENBQXpHLEVBQXdILEVBQUUsSUFBRixDQUFPLG9CQUFNLEVBQU4sRUFBVSxFQUFFLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLE9BQW5CLEVBQTRCLHFCQUE1QixFQUFtRCxPQUFuRCxFQUE0RCxVQUE1RCxDQUFqQixFQUEwRixvQkFBTSxNQUFOLENBQWxOLEVBQWlPLEVBQUUsSUFBRixDQUFPLG9CQUFNLEVBQU4sRUFBVSxrQkFBakIsRUFBcUMsRUFBRSxLQUFGLENBQVEsaUJBQVM7QUFDbFUsV0FBTyxhQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FBd0I7YUFBUyxNQUFNLFVBQU47S0FBVCxDQUF4QixDQUFxRCxLQUFyRCxDQUEyRCxzQkFBYztBQUM5RSxhQUFPLFFBQVEsS0FBUixFQUFlLEdBQWYsQ0FBbUIsaUJBQWlCLFVBQWpCLEVBQTZCLEtBQTdCLENBQW5CLENBQVAsQ0FEOEU7S0FBZCxDQUEzRCxDQUVKLEtBRkksQ0FFRSxlQUFlLEtBQWYsQ0FGRixDQUFQLENBRGtVO0dBQVQsQ0FBN0MsRUFJMVEsb0JBQU0sTUFBTixDQUp5QyxFQUkxQixpQkFBUztBQUMxQixRQUFJLGNBQWMsb0JBQU0sTUFBTixDQUFhLGFBQWEsS0FBYixFQUFvQixHQUFwQixDQUF3QixZQUF4QixDQUFiLENBQWQsQ0FEc0I7QUFFMUIsUUFBSSw2QkFBNkIsRUFBRSxJQUFGLENBQU8sb0JBQU0sRUFBTixFQUFVLGtCQUFqQixFQUFxQyxvQkFBTSxNQUFOLENBQXJDLENBQW1ELEtBQW5ELENBQTdCLENBRnNCO0FBRzFCLFFBQUksMEJBQUosRUFBZ0M7QUFDOUIsYUFBTyxLQUFQLENBRDhCO0tBQWhDO0FBR0EsV0FBTyxFQUFFLElBQUYsQ0FBTyxvQkFBTSxFQUFOLEVBQVUsRUFBRSxLQUFGLENBQVEsU0FBUixDQUFqQixFQUFxQyxFQUFFLEtBQUYsQ0FBUSxpQkFBUztBQUMzRCxhQUFPLGFBQWEsS0FBYixFQUFvQixHQUFwQixDQUF3QjtlQUFTLE1BQU0sVUFBTjtPQUFULENBQXhCLENBQXFELEtBQXJELENBQTJELHlCQUFpQjtBQUNqRixlQUFPLFFBQVEsS0FBUixFQUFlLEdBQWYsQ0FBbUIsaUJBQWlCLGFBQWpCLEVBQWdDLEtBQWhDLENBQW5CLENBQVAsQ0FEaUY7T0FBakIsQ0FBM0QsQ0FFSixLQUZJLENBRUUsZUFBZSxLQUFmLENBRkYsQ0FBUCxDQUQyRDtLQUFULENBQTdDLEVBSUgsb0JBQU0sTUFBTixDQUpHLENBSVcsS0FKWCxDQUFQLENBTjBCO0dBQVQsQ0FKZ0I7Q0FBVDtBQWdCMUIsU0FBUyxVQUFULENBQW9CLEtBQXBCLEVBQTJCO0FBQ3pCLFNBQU8sTUFBTSxNQUFNLE1BQU4sR0FBZSxDQUFmLENBQWIsQ0FEeUI7Q0FBM0I7O0lBR3FCOzs7QUFDbkIsV0FEbUIsTUFDbkIsQ0FBWSxXQUFaLEVBQXlCLFdBQXpCLEVBQXNDLGdCQUF0QyxFQUF3RDswQkFEckMsUUFDcUM7O3VFQURyQyxtQkFFWCxNQUFNLE9BQU4sQ0FBYyxXQUFkLElBQTZCLFlBQVksSUFBWixDQUFpQixFQUFqQixDQUE3QixHQUFvRCxXQUFwRCxHQURnRDs7QUFFdEQsVUFBSyxVQUFMLEdBQWtCLElBQUksR0FBSixFQUFsQixDQUZzRDtBQUd0RCxVQUFLLG9CQUFMLEdBQTRCLENBQUMsS0FBRCxDQUE1QixDQUhzRDtBQUl0RCxVQUFLLE9BQUwsR0FBZSxXQUFmLENBSnNEO0FBS3RELFFBQUksTUFBTSxPQUFOLENBQWMsV0FBZCxDQUFKLEVBQWdDOztBQUM5QixZQUFJLGFBQWEsQ0FBYjtBQUNKLGNBQUssZ0JBQUwsR0FBd0IsRUFBRSxNQUFGLENBQVMsVUFBQyxPQUFELEVBQVUsVUFBVixFQUF5QjtBQUN4RCxrQkFBUSxJQUFSLENBQWEsRUFBQyxPQUFPLGFBQWEsV0FBVyxDQUFYLEVBQWMsTUFBZCxFQUFzQixhQUFhLFdBQVcsQ0FBWCxDQUFiLEVBQXhELEVBRHdEO0FBRXhELHdCQUFjLFdBQVcsQ0FBWCxFQUFjLE1BQWQsQ0FGMEM7QUFHeEQsaUJBQU8sT0FBUCxDQUh3RDtTQUF6QixFQUk5QixFQUpxQixFQUlqQixFQUFFLEdBQUYsQ0FBTSxXQUFOLEVBQW1CLGdCQUFuQixDQUppQixDQUF4QjtXQUY4QjtLQUFoQztpQkFMc0Q7R0FBeEQ7O2VBRG1COzsyQkFlOEM7VUFBNUQsa0VBQVksa0JBQWdEO1VBQTVDLDhEQUFRLHFCQUFvQztVQUE3Qiw0RUFBc0IscUJBQU87O0FBQy9ELFVBQUksYUFBYSxzQkFBYixDQUQyRDtBQUUvRCxhQUFPLElBQVAsRUFBYTtBQUNYLFlBQUksTUFBTSxLQUFLLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLEtBQXpCLENBQU4sQ0FETztBQUVYLFlBQUksbUNBQXlCLDhCQUF6QixFQUE4QztBQUNoRCxvQkFBVSxJQUFWLENBQWUsR0FBZixFQURnRDtBQUVoRCxtQkFGZ0Q7U0FBbEQ7QUFJQSxZQUFJLE1BQU0sT0FBTixDQUFjLEdBQWQsQ0FBSixFQUF3QjtBQUN0QixnQkFBTSxTQUFOLENBQWdCLElBQWhCLENBQXFCLEtBQXJCLENBQTJCLFNBQTNCLEVBQXNDLEdBQXRDLEVBRHNCO0FBRXRCLG1CQUZzQjtTQUF4QjtBQUlBLFlBQUksZ0JBQUssTUFBTCxDQUFZLEdBQVosQ0FBSixFQUFzQjtBQUNwQixnQkFBTSxTQUFOLENBQWdCLElBQWhCLENBQXFCLEtBQXJCLENBQTJCLFNBQTNCLEVBQXNDLElBQUksT0FBSixFQUF0QyxFQURvQjtBQUVwQixtQkFGb0I7U0FBdEI7QUFJQSxZQUFJLFVBQVUsR0FBVixDQUFKLEVBQW9CO0FBQ2xCLGNBQUksVUFBVSxDQUFWLEtBQWdCLG9CQUFvQixVQUFVLENBQVYsRUFBYSxLQUFiLENBQXBDLEVBQXlEO0FBQzNELGtCQUFNLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsQ0FBTixDQUQyRDtXQUE3RDtBQUdBLGdCQUprQjtTQUFwQjtBQU1BLFlBQUksb0JBQW9CLEdBQXBCLENBQUosRUFBOEI7QUFDNUIsY0FBSSxpQkFBaUIsR0FBakIsQ0FBSixFQUEyQjtBQUN6QixpQkFBSyxvQkFBTCxDQUEwQixJQUExQixDQUErQixJQUEvQixFQUR5QjtXQUEzQjtBQUdBLGNBQUksT0FBTyxJQUFJLEtBQUosQ0FBVSxhQUFWLENBQXdCLElBQXhCLENBSmlCO0FBSzVCLGNBQUksU0FBUyxnQkFBZ0IsR0FBaEIsSUFBdUIsaUJBQWlCLElBQWpCLEVBQXVCLEtBQXZCLEVBQThCLFVBQTlCLENBQXZCLEdBQW1FLElBQW5FLENBTGU7QUFNNUIsY0FBSSxRQUFRLEtBQUssSUFBTCxDQUFVLENBQUMscUJBQVcsR0FBWCxDQUFELENBQVYsRUFBNkIsTUFBN0IsRUFBcUMsS0FBckMsQ0FBUixDQU53QjtBQU81QixjQUFJLE1BQU0scUJBQVcsS0FBWCxFQUFrQixLQUFLLE9BQUwsQ0FBeEIsQ0FQd0I7QUFRNUIsdUJBQWEsV0FBVyxNQUFYLENBQWtCLEdBQWxCLENBQWIsQ0FSNEI7QUFTNUIsb0JBQVUsSUFBVixDQUFlLEdBQWYsRUFUNEI7QUFVNUIsY0FBSSxtQkFBSixFQUF5QjtBQUN2QixrQkFEdUI7V0FBekI7U0FWRixNQWFPLElBQUkscUJBQXFCLEdBQXJCLENBQUosRUFBK0I7QUFDcEMsY0FBSSxVQUFVLENBQVYsS0FBZ0IsQ0FBQyx5QkFBeUIsVUFBVSxDQUFWLEVBQWEsS0FBYixFQUFvQixHQUE3QyxDQUFELEVBQW9EO0FBQ3RFLGtCQUFNLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsQ0FBTixDQURzRTtXQUF4RTtBQUdBLGNBQUksT0FBTSxxQkFBVyxHQUFYLEVBQWdCLEtBQUssT0FBTCxDQUF0QixDQUpnQztBQUtwQyxvQkFBVSxJQUFWLENBQWUsSUFBZixFQUxvQztBQU1wQyxjQUFJLFdBQVcsS0FBSyxvQkFBTCxDQUFYLElBQXlDLGtCQUFrQixHQUFsQixDQUF6QyxFQUFpRTtBQUNuRSxpQkFBSyxvQkFBTCxDQUEwQixHQUExQixHQURtRTtXQUFyRTtBQUdBLGdCQVRvQztTQUEvQixNQVVBO0FBQ0wsY0FBSSxRQUFNLHFCQUFXLEdBQVgsRUFBZ0IsS0FBSyxPQUFMLENBQXRCLENBREM7QUFFTCx1QkFBYSxXQUFXLE1BQVgsQ0FBa0IsS0FBbEIsQ0FBYixDQUZLO0FBR0wsb0JBQVUsSUFBVixDQUFlLEtBQWYsRUFISztTQVZBO09BakNUO0FBaURBLGFBQU8scUJBQUssU0FBTCxDQUFQLENBbkQrRDs7Ozs0QkFxRHpELFlBQVksT0FBTztBQUN6QixVQUFJLG9CQUFvQixLQUFLLFdBQUwsRUFBcEIsQ0FEcUI7QUFFekIsV0FBSyxTQUFMLEdBQWlCLEtBQUssS0FBTCxDQUZRO0FBR3pCLFdBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FIUztBQUl6QixXQUFLLGFBQUwsR0FBcUIsS0FBSyxTQUFMLENBSkk7QUFLekIsV0FBSyxXQUFMLEdBTHlCO0FBTXpCLFdBQUssVUFBTCxHQUFrQixLQUFLLEtBQUwsQ0FOTztBQU96QixXQUFLLFNBQUwsR0FBaUIsS0FBSyxJQUFMLENBUFE7QUFRekIsV0FBSyxjQUFMLEdBQXNCLEtBQUssU0FBTCxDQVJHO0FBU3pCLFVBQUksS0FBSyxnQkFBTCxJQUF5QixLQUFLLGdCQUFMLENBQXNCLENBQXRCLENBQXpCLElBQXFELEtBQUssS0FBTCxJQUFjLEtBQUssZ0JBQUwsQ0FBc0IsQ0FBdEIsRUFBeUIsS0FBekIsRUFBZ0M7QUFDckcsWUFBSSxNQUFNLEtBQUssZ0JBQUwsQ0FBc0IsQ0FBdEIsRUFBeUIsV0FBekIsQ0FEMkY7QUFFckcsYUFBSyxnQkFBTCxDQUFzQixLQUF0QixHQUZxRztBQUdyRyxlQUFPLEdBQVAsQ0FIcUc7T0FBdkc7QUFLQSxVQUFJLGVBQWUsS0FBSyxNQUFMLENBQVksVUFBWixDQUF1QixLQUFLLEtBQUwsQ0FBdEMsQ0FkcUI7QUFlekIsVUFBSSxpQkFBaUIsRUFBakIsRUFBcUI7QUFDdkIsWUFBSSxnQkFBSjtZQUFhLFFBQVEsRUFBUixDQURVO0FBRXZCLFlBQUksa0JBQW9CLEtBQUssV0FBTCxFQUFwQixDQUZtQjtBQUd2QixZQUFJLFFBQVEsS0FBSyxLQUFMLENBSFc7QUFJdkIsYUFBSyxLQUFMLEdBSnVCO0FBS3ZCLFlBQUksV0FBVyxLQUFLLG9CQUFMLENBQWYsRUFBMkM7QUFDekMsY0FBSSxRQUFRLEtBQUssUUFBTCxDQUFjLEtBQWQsRUFBcUIsZUFBckIsQ0FBUixDQURxQztBQUV6QyxpQkFBTyxFQUFDLE1BQU0sV0FBTixFQUFtQixPQUFPLEdBQVAsRUFBWSxPQUFPLEtBQVAsRUFBdkMsQ0FGeUM7U0FBM0M7QUFJQSxXQUFHO0FBQ0Qsb0JBQVUsS0FBSyxtQkFBTCxFQUFWLENBREM7QUFFRCxnQkFBTSxJQUFOLENBQVcsT0FBWCxFQUZDO0FBR0QsY0FBSSxRQUFRLE1BQVIsRUFBZ0I7QUFDbEIsc0JBQVUsS0FBSyxJQUFMLENBQVUsRUFBVixFQUFjLEtBQWQsRUFBcUIsSUFBckIsQ0FBVixDQURrQjtBQUVsQixnQ0FBTyxRQUFRLElBQVIsS0FBaUIsQ0FBakIsRUFBb0IsNERBQTNCLEVBRmtCO0FBR2xCLGtCQUFNLElBQU4sQ0FBVyxRQUFRLEdBQVIsQ0FBWSxDQUFaLENBQVgsRUFIa0I7V0FBcEI7U0FIRixRQVFTLENBQUMsUUFBUSxJQUFSLEVBakJhO0FBa0J2QixlQUFPLEVBQUMsTUFBTSxxQkFBVSxRQUFWLEVBQW9CLE9BQU8scUJBQUssS0FBTCxDQUFQLEVBQWxDLENBbEJ1QjtPQUF6QixNQW1CTyxJQUFJLGlCQUFpQixFQUFqQixFQUFxQjtBQUM5QixZQUFJLG1CQUFvQixLQUFLLFdBQUwsRUFBcEIsQ0FEMEI7QUFFOUIsWUFBSSxTQUFRLEtBQUssS0FBTCxDQUZrQjtBQUc5QixZQUFJLFNBQVEsS0FBSyxRQUFMLENBQWMsTUFBZCxFQUFxQixnQkFBckIsQ0FBUixDQUgwQjtBQUk5QixhQUFLLEtBQUwsR0FKOEI7QUFLOUIsWUFBSSxLQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEtBQUssS0FBTCxDQUF2QixLQUF1QyxFQUF2QyxFQUEyQztBQUM3QyxlQUFLLEtBQUwsR0FENkM7QUFFN0MsaUJBQU8sRUFBQyxNQUFNLFdBQU4sRUFBbUIsT0FBTyxJQUFQLEVBQWEsT0FBTyxNQUFQLEVBQXhDLENBRjZDO1NBQS9DO0FBSUEsZUFBTyxFQUFDLE1BQU0scUJBQVUsVUFBVixFQUFzQixPQUFPLEdBQVAsRUFBWSxPQUFPLE1BQVAsRUFBaEQsQ0FUOEI7T0FBekI7QUFXUCxVQUFJLDJDQWpIYSw4Q0FpSGIsQ0E3Q3FCO0FBOEN6QixVQUFJLGNBQWMsSUFBZCxLQUF1QixxQkFBVSxHQUFWLElBQWlCLGtCQUFrQixLQUFsQixFQUF5QixVQUF6QixDQUF4QyxFQUE4RTtBQUNoRiwwQ0FuSGUsa0RBbUhTLElBQXhCLENBRGdGO09BQWxGO0FBR0EsYUFBTyxhQUFQLENBakR5Qjs7OzswQ0FtREw7QUFDcEIsVUFBSSxvQkFBb0IsS0FBSyxXQUFMLEVBQXBCLENBRGdCO0FBRXBCLFVBQUksWUFBWSxLQUFLLEtBQUwsQ0FGSTtBQUdwQixhQUFPLEtBQUssS0FBTCxHQUFhLEtBQUssTUFBTCxDQUFZLE1BQVosRUFBb0I7QUFDdEMsWUFBSSxLQUFLLEtBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsS0FBSyxLQUFMLENBQTVCLENBRGtDO0FBRXRDLGdCQUFRLEVBQVI7QUFDRSxlQUFLLEVBQUw7QUFDRSxnQkFBSSxRQUFRLEtBQUssUUFBTCxDQUFjLFNBQWQsRUFBeUIsaUJBQXpCLENBQVIsQ0FETjtBQUVFLGlCQUFLLEtBQUwsR0FGRjtBQUdFLG1CQUFPLEVBQUMsTUFBTSxxQkFBVSxRQUFWLEVBQW9CLE1BQU0sSUFBTixFQUFZLFFBQVEsS0FBUixFQUFlLE9BQU8sS0FBUCxFQUE3RCxDQUhGO0FBREYsZUFLTyxFQUFMO0FBQ0UsZ0JBQUksS0FBSyxNQUFMLENBQVksVUFBWixDQUF1QixLQUFLLEtBQUwsR0FBYSxDQUFiLENBQXZCLEtBQTJDLEdBQTNDLEVBQWdEO0FBQ2xELGtCQUFJLFVBQVEsS0FBSyxRQUFMLENBQWMsU0FBZCxFQUF5QixpQkFBekIsQ0FBUixDQUQ4QztBQUVsRCxtQkFBSyxLQUFMLElBQWMsQ0FBZCxDQUZrRDtBQUdsRCxxQkFBTyxFQUFDLE1BQU0scUJBQVUsUUFBVixFQUFvQixNQUFNLEtBQU4sRUFBYSxRQUFRLElBQVIsRUFBYyxPQUFPLE9BQVAsRUFBN0QsQ0FIa0Q7YUFBcEQ7QUFLQSxpQkFBSyxLQUFMLEdBTkY7QUFPRSxrQkFQRjtBQUxGLGVBYU8sRUFBTDtBQUNFO0FBQ0Usa0JBQUksUUFBUSxLQUFLLGdCQUFMLENBQXNCLEVBQXRCLEVBQTBCLElBQTFCLEVBQWdDLENBQWhDLENBQVIsQ0FETjtBQUVFLGtCQUFJLFNBQVMsSUFBVCxFQUFlO0FBQ2pCLHNCQUFNLEtBQUssYUFBTCxFQUFOLENBRGlCO2VBQW5CO0FBR0Esb0JBTEY7YUFERjtBQWJGO0FBc0JJLGlCQUFLLEtBQUwsR0FERjtBQXJCRixTQUZzQztPQUF4QztBQTJCQSxZQUFNLEtBQUssYUFBTCxFQUFOLENBOUJvQjs7OztTQXZISCIsImZpbGUiOiJzaGlmdC1yZWFkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVG9rZW5pemVyIGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmltcG9ydCB7VG9rZW5DbGFzcywgVG9rZW5UeXBlfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgICogYXMgUiBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5jb25zdCBKdXN0XzQ4NiA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzQ4NyA9IE1heWJlLk5vdGhpbmc7XG5pbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuY29uc3QgTFNZTlRBWF80ODggPSB7bmFtZTogXCJsZWZ0LXN5bnRheFwifTtcbmNvbnN0IFJTWU5UQVhfNDg5ID0ge25hbWU6IFwicmlnaHQtc3ludGF4XCJ9O1xuY29uc3QgbGl0ZXJhbEtleXdvcmRzXzQ5MCA9IFtcInRoaXNcIiwgXCJudWxsXCIsIFwidHJ1ZVwiLCBcImZhbHNlXCJdO1xuY29uc3QgaXNMZWZ0QnJhY2tldF80OTEgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5MQlJBQ0t9KTtcbmNvbnN0IGlzTGVmdEJyYWNlXzQ5MiA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLkxCUkFDRX0pO1xuY29uc3QgaXNMZWZ0UGFyZW5fNDkzID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOfSk7XG5jb25zdCBpc1JpZ2h0QnJhY2tldF80OTQgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0t9KTtcbmNvbnN0IGlzUmlnaHRCcmFjZV80OTUgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0V9KTtcbmNvbnN0IGlzUmlnaHRQYXJlbl80OTYgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU59KTtcbmNvbnN0IGlzRU9TXzQ5NyA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLkVPU30pO1xuY29uc3QgaXNIYXNoXzQ5OCA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLklERU5USUZJRVIsIHZhbHVlOiBcIiNcIn0pO1xuY29uc3QgaXNMZWZ0U3ludGF4XzQ5OSA9IFIud2hlcmVFcSh7dHlwZTogTFNZTlRBWF80ODh9KTtcbmNvbnN0IGlzUmlnaHRTeW50YXhfNTAwID0gUi53aGVyZUVxKHt0eXBlOiBSU1lOVEFYXzQ4OX0pO1xuY29uc3QgaXNMZWZ0RGVsaW1pdGVyXzUwMSA9IFIuYW55UGFzcyhbaXNMZWZ0QnJhY2tldF80OTEsIGlzTGVmdEJyYWNlXzQ5MiwgaXNMZWZ0UGFyZW5fNDkzLCBpc0xlZnRTeW50YXhfNDk5XSk7XG5jb25zdCBpc1JpZ2h0RGVsaW1pdGVyXzUwMiA9IFIuYW55UGFzcyhbaXNSaWdodEJyYWNrZXRfNDk0LCBpc1JpZ2h0QnJhY2VfNDk1LCBpc1JpZ2h0UGFyZW5fNDk2LCBpc1JpZ2h0U3ludGF4XzUwMF0pO1xuY29uc3QgaXNNYXRjaGluZ0RlbGltaXRlcnNfNTAzID0gUi5jb25kKFtbaXNMZWZ0QnJhY2tldF80OTEsIChfXzU0NCwgYl81NDUpID0+IGlzUmlnaHRCcmFja2V0XzQ5NChiXzU0NSldLCBbaXNMZWZ0QnJhY2VfNDkyLCAoX181NDYsIGJfNTQ3KSA9PiBpc1JpZ2h0QnJhY2VfNDk1KGJfNTQ3KV0sIFtpc0xlZnRQYXJlbl80OTMsIChfXzU0OCwgYl81NDkpID0+IGlzUmlnaHRQYXJlbl80OTYoYl81NDkpXSwgW2lzTGVmdFN5bnRheF80OTksIChfXzU1MCwgYl81NTEpID0+IGlzUmlnaHRTeW50YXhfNTAwKGJfNTUxKV0sIFtSLlQsIFIuRl1dKTtcbmNvbnN0IGFzc2lnbk9wc181MDQgPSBbXCI9XCIsIFwiKz1cIiwgXCItPVwiLCBcIio9XCIsIFwiLz1cIiwgXCIlPVwiLCBcIjw8PVwiLCBcIj4+PVwiLCBcIj4+Pj1cIiwgXCImPVwiLCBcInw9XCIsIFwiXj1cIiwgXCIsXCJdO1xuY29uc3QgYmluYXJ5T3BzXzUwNSA9IFtcIitcIiwgXCItXCIsIFwiKlwiLCBcIi9cIiwgXCIlXCIsIFwiPDxcIiwgXCI+PlwiLCBcIj4+PlwiLCBcIiZcIiwgXCJ8XCIsIFwiXlwiLCBcIiYmXCIsIFwifHxcIiwgXCI/XCIsIFwiOlwiLCBcIj09PVwiLCBcIj09XCIsIFwiPj1cIiwgXCI8PVwiLCBcIjxcIiwgXCI+XCIsIFwiIT1cIiwgXCIhPT1cIiwgXCJpbnN0YW5jZW9mXCJdO1xuY29uc3QgdW5hcnlPcHNfNTA2ID0gW1wiKytcIiwgXCItLVwiLCBcIn5cIiwgXCIhXCIsIFwiZGVsZXRlXCIsIFwidm9pZFwiLCBcInR5cGVvZlwiLCBcInlpZWxkXCIsIFwidGhyb3dcIiwgXCJuZXdcIl07XG5jb25zdCBpc0VtcHR5XzUwNyA9IFIud2hlcmVFcSh7c2l6ZTogMH0pO1xuY29uc3QgaXNQdW5jdHVhdG9yXzUwOCA9IHNfNTUyID0+IHNfNTUyLmlzUHVuY3R1YXRvcigpO1xuY29uc3QgaXNLZXl3b3JkXzUwOSA9IHNfNTUzID0+IHNfNTUzLmlzS2V5d29yZCgpO1xuY29uc3QgaXNEZWxpbWl0ZXJfNTEwID0gc181NTQgPT4gc181NTQuaXNEZWxpbWl0ZXIoKTtcbmNvbnN0IGlzUGFyZW5zXzUxMSA9IHNfNTU1ID0+IHNfNTU1LmlzUGFyZW5zKCk7XG5jb25zdCBpc0JyYWNlc181MTIgPSBzXzU1NiA9PiBzXzU1Ni5pc0JyYWNlcygpO1xuY29uc3QgaXNCcmFja2V0c181MTMgPSBzXzU1NyA9PiBzXzU1Ny5pc0JyYWNrZXRzKCk7XG5jb25zdCBpc0lkZW50aWZpZXJfNTE0ID0gc181NTggPT4gc181NTguaXNJZGVudGlmaWVyKCk7XG5jb25zdCB2YWxfNTE1ID0gc181NTkgPT4gc181NTkudmFsKCk7XG5jb25zdCBpc1ZhbF81MTYgPSBSLmN1cnJ5KCh2XzU2MCwgc181NjEpID0+IHNfNTYxLnZhbCgpID09PSB2XzU2MCk7XG5jb25zdCBpc0RvdF81MTcgPSBSLmFsbFBhc3MoW2lzUHVuY3R1YXRvcl81MDgsIGlzVmFsXzUxNihcIi5cIildKTtcbmNvbnN0IGlzQ29sb25fNTE4ID0gUi5hbGxQYXNzKFtpc1B1bmN0dWF0b3JfNTA4LCBpc1ZhbF81MTYoXCI6XCIpXSk7XG5jb25zdCBpc0Z1bmN0aW9uS2V5d29yZF81MTkgPSBSLmFsbFBhc3MoW2lzS2V5d29yZF81MDksIGlzVmFsXzUxNihcImZ1bmN0aW9uXCIpXSk7XG5jb25zdCBpc09wZXJhdG9yXzUyMCA9IHNfNTYyID0+IChzXzU2Mi5pc1B1bmN0dWF0b3IoKSB8fCBzXzU2Mi5pc0tleXdvcmQoKSkgJiYgUi5hbnkoUi5lcXVhbHMoc181NjIudmFsKCkpLCBhc3NpZ25PcHNfNTA0LmNvbmNhdChiaW5hcnlPcHNfNTA1KS5jb25jYXQodW5hcnlPcHNfNTA2KSk7XG5jb25zdCBpc05vbkxpdGVyYWxLZXl3b3JkXzUyMSA9IFIuYWxsUGFzcyhbaXNLZXl3b3JkXzUwOSwgc181NjMgPT4gUi5ub25lKFIuZXF1YWxzKHNfNTYzLnZhbCgpKSwgbGl0ZXJhbEtleXdvcmRzXzQ5MCldKTtcbmNvbnN0IGlzS2V5d29yZEV4cHJQcmVmaXhfNTIyID0gUi5hbGxQYXNzKFtpc0tleXdvcmRfNTA5LCBzXzU2NCA9PiBSLmFueShSLmVxdWFscyhzXzU2NC52YWwoKSksIFtcImluc3RhbmNlb2ZcIiwgXCJ0eXBlb2ZcIiwgXCJkZWxldGVcIiwgXCJ2b2lkXCIsIFwieWllbGRcIiwgXCJ0aHJvd1wiLCBcIm5ld1wiLCBcImNhc2VcIl0pXSk7XG5sZXQgbGFzdF81MjMgPSBwXzU2NSA9PiBwXzU2NS5sYXN0KCk7XG5sZXQgc2FmZUxhc3RfNTI0ID0gUi5waXBlKFIuY29uZChbW2lzRW1wdHlfNTA3LCBSLmFsd2F5cyhOb3RoaW5nXzQ4NygpKV0sIFtSLlQsIFIuY29tcG9zZShNYXliZS5vZiwgbGFzdF81MjMpXV0pKTtcbmxldCBzdHVmZlRydWVfNTI1ID0gUi5jdXJyeSgocF81NjYsIGJfNTY3KSA9PiBiXzU2NyA/IEp1c3RfNDg2KHBfNTY2KSA6IE5vdGhpbmdfNDg3KCkpO1xubGV0IHN0dWZmRmFsc2VfNTI2ID0gUi5jdXJyeSgocF81NjgsIGJfNTY5KSA9PiAhYl81NjkgPyBKdXN0XzQ4NihwXzU2OCkgOiBOb3RoaW5nXzQ4NygpKTtcbmxldCBpc1RvcENvbG9uXzUyNyA9IFIucGlwZShzYWZlTGFzdF81MjQsIFIubWFwKGlzQ29sb25fNTE4KSwgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpKTtcbmxldCBpc1RvcFB1bmN0dWF0b3JfNTI4ID0gUi5waXBlKHNhZmVMYXN0XzUyNCwgUi5tYXAoaXNQdW5jdHVhdG9yXzUwOCksIE1heWJlLm1heWJlKGZhbHNlLCBSLmlkZW50aXR5KSk7XG5sZXQgaXNFeHByUmV0dXJuXzUyOSA9IFIuY3VycnkoKGxfNTcwLCBwXzU3MSkgPT4ge1xuICBsZXQgcmV0S3dkXzU3MiA9IHNhZmVMYXN0XzUyNChwXzU3MSk7XG4gIGxldCBtYXliZURvdF81NzMgPSBwb3BfNTQwKHBfNTcxKS5jaGFpbihzYWZlTGFzdF81MjQpO1xuICBpZiAobWF5YmVEb3RfNTczLm1hcChpc0RvdF81MTcpLmdldE9yRWxzZShmYWxzZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcmV0S3dkXzU3Mi5tYXAoc181NzQgPT4ge1xuICAgIHJldHVybiBzXzU3NC5pc0tleXdvcmQoKSAmJiBzXzU3NC52YWwoKSA9PT0gXCJyZXR1cm5cIiAmJiBzXzU3NC5saW5lTnVtYmVyKCkgPT09IGxfNTcwO1xuICB9KS5nZXRPckVsc2UoZmFsc2UpO1xufSk7XG5jb25zdCBpc1RvcE9wZXJhdG9yXzUzMCA9IFIucGlwZShzYWZlTGFzdF81MjQsIFIubWFwKGlzT3BlcmF0b3JfNTIwKSwgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpKTtcbmNvbnN0IGlzVG9wS2V5d29yZEV4cHJQcmVmaXhfNTMxID0gUi5waXBlKHNhZmVMYXN0XzUyNCwgUi5tYXAoaXNLZXl3b3JkRXhwclByZWZpeF81MjIpLCBNYXliZS5tYXliZShmYWxzZSwgUi5pZGVudGl0eSkpO1xubGV0IGlzRXhwclByZWZpeF81MzIgPSBSLmN1cnJ5KChsXzU3NSwgYl81NzYpID0+IFIuY29uZChbW2lzRW1wdHlfNTA3LCBSLmFsd2F5cyhiXzU3NildLCBbaXNUb3BDb2xvbl81MjcsIFIuYWx3YXlzKGJfNTc2KV0sIFtpc1RvcEtleXdvcmRFeHByUHJlZml4XzUzMSwgUi5UXSwgW2lzVG9wT3BlcmF0b3JfNTMwLCBSLlRdLCBbaXNUb3BQdW5jdHVhdG9yXzUyOCwgUi5hbHdheXMoYl81NzYpXSwgW2lzRXhwclJldHVybl81MjkobF81NzUpLCBSLlRdLCBbUi5ULCBSLkZdXSkpO1xubGV0IGN1cmx5XzUzMyA9IHBfNTc3ID0+IHNhZmVMYXN0XzUyNChwXzU3NykubWFwKGlzQnJhY2VzXzUxMikuY2hhaW4oc3R1ZmZUcnVlXzUyNShwXzU3NykpO1xubGV0IHBhcmVuXzUzNCA9IHBfNTc4ID0+IHNhZmVMYXN0XzUyNChwXzU3OCkubWFwKGlzUGFyZW5zXzUxMSkuY2hhaW4oc3R1ZmZUcnVlXzUyNShwXzU3OCkpO1xubGV0IGZ1bmNfNTM1ID0gcF81NzkgPT4gc2FmZUxhc3RfNTI0KHBfNTc5KS5tYXAoaXNGdW5jdGlvbktleXdvcmRfNTE5KS5jaGFpbihzdHVmZlRydWVfNTI1KHBfNTc5KSk7XG5sZXQgaWRlbnRfNTM2ID0gcF81ODAgPT4gc2FmZUxhc3RfNTI0KHBfNTgwKS5tYXAoaXNJZGVudGlmaWVyXzUxNCkuY2hhaW4oc3R1ZmZUcnVlXzUyNShwXzU4MCkpO1xubGV0IG5vbkxpdGVyYWxLZXl3b3JkXzUzNyA9IHBfNTgxID0+IHNhZmVMYXN0XzUyNChwXzU4MSkubWFwKGlzTm9uTGl0ZXJhbEtleXdvcmRfNTIxKS5jaGFpbihzdHVmZlRydWVfNTI1KHBfNTgxKSk7XG5sZXQgb3B0XzUzOCA9IFIuY3VycnkoKGFfNTgyLCBiXzU4MywgcF81ODQpID0+IHtcbiAgbGV0IHJlc3VsdF81ODUgPSBSLnBpcGVLKGFfNTgyLCBiXzU4MykoTWF5YmUub2YocF81ODQpKTtcbiAgcmV0dXJuIE1heWJlLmlzSnVzdChyZXN1bHRfNTg1KSA/IHJlc3VsdF81ODUgOiBNYXliZS5vZihwXzU4NCk7XG59KTtcbmxldCBub3REb3RfNTM5ID0gUi5pZkVsc2UoUi53aGVyZUVxKHtzaXplOiAwfSksIEp1c3RfNDg2LCBwXzU4NiA9PiBzYWZlTGFzdF81MjQocF81ODYpLm1hcChzXzU4NyA9PiAhKHNfNTg3LmlzUHVuY3R1YXRvcigpICYmIHNfNTg3LnZhbCgpID09PSBcIi5cIikpLmNoYWluKHN0dWZmVHJ1ZV81MjUocF81ODYpKSk7XG5sZXQgcG9wXzU0MCA9IFIuY29tcG9zZShKdXN0XzQ4NiwgcF81ODggPT4gcF81ODgucG9wKCkpO1xuY29uc3QgZnVuY3Rpb25QcmVmaXhfNTQxID0gUi5waXBlSyhjdXJseV81MzMsIHBvcF81NDAsIHBhcmVuXzUzNCwgcG9wXzU0MCwgb3B0XzUzOChpZGVudF81MzYsIHBvcF81NDApLCBmdW5jXzUzNSk7XG5jb25zdCBpc1JlZ2V4UHJlZml4XzU0MiA9IGJfNTg5ID0+IFIuYW55UGFzcyhbaXNFbXB0eV81MDcsIGlzVG9wUHVuY3R1YXRvcl81MjgsIFIucGlwZShNYXliZS5vZiwgUi5waXBlSyhub25MaXRlcmFsS2V5d29yZF81MzcsIHBvcF81NDAsIG5vdERvdF81MzkpLCBNYXliZS5pc0p1c3QpLCBSLnBpcGUoTWF5YmUub2YsIFIucGlwZUsocGFyZW5fNTM0LCBwb3BfNTQwLCBub25MaXRlcmFsS2V5d29yZF81MzcsIHBvcF81NDAsIG5vdERvdF81MzkpLCBNYXliZS5pc0p1c3QpLCBSLnBpcGUoTWF5YmUub2YsIGZ1bmN0aW9uUHJlZml4XzU0MSwgUi5jaGFpbihwXzU5MCA9PiB7XG4gIHJldHVybiBzYWZlTGFzdF81MjQocF81OTApLm1hcChzXzU5MSA9PiBzXzU5MS5saW5lTnVtYmVyKCkpLmNoYWluKGZuTGluZV81OTIgPT4ge1xuICAgIHJldHVybiBwb3BfNTQwKHBfNTkwKS5tYXAoaXNFeHByUHJlZml4XzUzMihmbkxpbmVfNTkyLCBiXzU4OSkpO1xuICB9KS5jaGFpbihzdHVmZkZhbHNlXzUyNihwXzU5MCkpO1xufSksIE1heWJlLmlzSnVzdCksIHBfNTkzID0+IHtcbiAgbGV0IGlzQ3VybHlfNTk0ID0gTWF5YmUuaXNKdXN0KHNhZmVMYXN0XzUyNChwXzU5MykubWFwKGlzQnJhY2VzXzUxMikpO1xuICBsZXQgYWxyZWFkeUNoZWNrZWRGdW5jdGlvbl81OTUgPSBSLnBpcGUoTWF5YmUub2YsIGZ1bmN0aW9uUHJlZml4XzU0MSwgTWF5YmUuaXNKdXN0KShwXzU5Myk7XG4gIGlmIChhbHJlYWR5Q2hlY2tlZEZ1bmN0aW9uXzU5NSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gUi5waXBlKE1heWJlLm9mLCBSLmNoYWluKGN1cmx5XzUzMyksIFIuY2hhaW4ocF81OTYgPT4ge1xuICAgIHJldHVybiBzYWZlTGFzdF81MjQocF81OTYpLm1hcChzXzU5NyA9PiBzXzU5Ny5saW5lTnVtYmVyKCkpLmNoYWluKGN1cmx5TGluZV81OTggPT4ge1xuICAgICAgcmV0dXJuIHBvcF81NDAocF81OTYpLm1hcChpc0V4cHJQcmVmaXhfNTMyKGN1cmx5TGluZV81OTgsIGJfNTg5KSk7XG4gICAgfSkuY2hhaW4oc3R1ZmZGYWxzZV81MjYocF81OTYpKTtcbiAgfSksIE1heWJlLmlzSnVzdCkocF81OTMpO1xufV0pO1xuZnVuY3Rpb24gbGFzdEVsXzU0MyhsXzU5OSkge1xuICByZXR1cm4gbF81OTlbbF81OTkubGVuZ3RoIC0gMV07XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFkZXIgZXh0ZW5kcyBUb2tlbml6ZXIge1xuICBjb25zdHJ1Y3RvcihzdHJpbmdzXzYwMCwgY29udGV4dF82MDEsIHJlcGxhY2VtZW50c182MDIpIHtcbiAgICBzdXBlcihBcnJheS5pc0FycmF5KHN0cmluZ3NfNjAwKSA/IHN0cmluZ3NfNjAwLmpvaW4oXCJcIikgOiBzdHJpbmdzXzYwMCk7XG4gICAgdGhpcy5kZWxpbVN0YWNrID0gbmV3IE1hcDtcbiAgICB0aGlzLmluc2lkZVN5bnRheFRlbXBsYXRlID0gW2ZhbHNlXTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzYwMTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzdHJpbmdzXzYwMCkpIHtcbiAgICAgIGxldCB0b3RhbEluZGV4ID0gMDtcbiAgICAgIHRoaXMucmVwbGFjZW1lbnRJbmRleCA9IFIucmVkdWNlKChhY2NfNjAzLCBzdHJSZXBfNjA0KSA9PiB7XG4gICAgICAgIGFjY182MDMucHVzaCh7aW5kZXg6IHRvdGFsSW5kZXggKyBzdHJSZXBfNjA0WzBdLmxlbmd0aCwgcmVwbGFjZW1lbnQ6IHN0clJlcF82MDRbMV19KTtcbiAgICAgICAgdG90YWxJbmRleCArPSBzdHJSZXBfNjA0WzBdLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGFjY182MDM7XG4gICAgICB9LCBbXSwgUi56aXAoc3RyaW5nc182MDAsIHJlcGxhY2VtZW50c182MDIpKTtcbiAgICB9XG4gIH1cbiAgcmVhZChzdGFja182MDUgPSBbXSwgYl82MDYgPSBmYWxzZSwgc2luZ2xlRGVsaW1pdGVyXzYwNyA9IGZhbHNlKSB7XG4gICAgbGV0IHByZWZpeF82MDggPSBMaXN0KCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCB0b2sgPSB0aGlzLmFkdmFuY2UocHJlZml4XzYwOCwgYl82MDYpO1xuICAgICAgaWYgKHRvayBpbnN0YW5jZW9mIFN5bnRheCB8fCB0b2sgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICAgIHN0YWNrXzYwNS5wdXNoKHRvayk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodG9rKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzdGFja182MDUsIHRvayk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKExpc3QuaXNMaXN0KHRvaykpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoc3RhY2tfNjA1LCB0b2sudG9BcnJheSgpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoaXNFT1NfNDk3KHRvaykpIHtcbiAgICAgICAgaWYgKHN0YWNrXzYwNVswXSAmJiBpc0xlZnREZWxpbWl0ZXJfNTAxKHN0YWNrXzYwNVswXS50b2tlbikpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZVVuZXhwZWN0ZWQodG9rKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChpc0xlZnREZWxpbWl0ZXJfNTAxKHRvaykpIHtcbiAgICAgICAgaWYgKGlzTGVmdFN5bnRheF80OTkodG9rKSkge1xuICAgICAgICAgIHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUucHVzaCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGluZSA9IHRvay5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgICAgIGxldCBpbm5lckIgPSBpc0xlZnRCcmFjZV80OTIodG9rKSA/IGlzRXhwclByZWZpeF81MzIobGluZSwgYl82MDYpKHByZWZpeF82MDgpIDogdHJ1ZTtcbiAgICAgICAgbGV0IGlubmVyID0gdGhpcy5yZWFkKFtuZXcgU3ludGF4KHRvayldLCBpbm5lckIsIGZhbHNlKTtcbiAgICAgICAgbGV0IHN0eCA9IG5ldyBTeW50YXgoaW5uZXIsIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHByZWZpeF82MDggPSBwcmVmaXhfNjA4LmNvbmNhdChzdHgpO1xuICAgICAgICBzdGFja182MDUucHVzaChzdHgpO1xuICAgICAgICBpZiAoc2luZ2xlRGVsaW1pdGVyXzYwNykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzUmlnaHREZWxpbWl0ZXJfNTAyKHRvaykpIHtcbiAgICAgICAgaWYgKHN0YWNrXzYwNVswXSAmJiAhaXNNYXRjaGluZ0RlbGltaXRlcnNfNTAzKHN0YWNrXzYwNVswXS50b2tlbiwgdG9rKSkge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlVW5leHBlY3RlZCh0b2spO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdHggPSBuZXcgU3ludGF4KHRvaywgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgc3RhY2tfNjA1LnB1c2goc3R4KTtcbiAgICAgICAgaWYgKGxhc3RFbF81NDModGhpcy5pbnNpZGVTeW50YXhUZW1wbGF0ZSkgJiYgaXNSaWdodFN5bnRheF81MDAodG9rKSkge1xuICAgICAgICAgIHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgc3R4ID0gbmV3IFN5bnRheCh0b2ssIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHByZWZpeF82MDggPSBwcmVmaXhfNjA4LmNvbmNhdChzdHgpO1xuICAgICAgICBzdGFja182MDUucHVzaChzdHgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTGlzdChzdGFja182MDUpO1xuICB9XG4gIGFkdmFuY2UocHJlZml4XzYwOSwgYl82MTApIHtcbiAgICBsZXQgc3RhcnRMb2NhdGlvbl82MTEgPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgdGhpcy5sYXN0SW5kZXggPSB0aGlzLmluZGV4O1xuICAgIHRoaXMubGFzdExpbmUgPSB0aGlzLmxpbmU7XG4gICAgdGhpcy5sYXN0TGluZVN0YXJ0ID0gdGhpcy5saW5lU3RhcnQ7XG4gICAgdGhpcy5za2lwQ29tbWVudCgpO1xuICAgIHRoaXMuc3RhcnRJbmRleCA9IHRoaXMuaW5kZXg7XG4gICAgdGhpcy5zdGFydExpbmUgPSB0aGlzLmxpbmU7XG4gICAgdGhpcy5zdGFydExpbmVTdGFydCA9IHRoaXMubGluZVN0YXJ0O1xuICAgIGlmICh0aGlzLnJlcGxhY2VtZW50SW5kZXggJiYgdGhpcy5yZXBsYWNlbWVudEluZGV4WzBdICYmIHRoaXMuaW5kZXggPj0gdGhpcy5yZXBsYWNlbWVudEluZGV4WzBdLmluZGV4KSB7XG4gICAgICBsZXQgcmVwID0gdGhpcy5yZXBsYWNlbWVudEluZGV4WzBdLnJlcGxhY2VtZW50O1xuICAgICAgdGhpcy5yZXBsYWNlbWVudEluZGV4LnNoaWZ0KCk7XG4gICAgICByZXR1cm4gcmVwO1xuICAgIH1cbiAgICBsZXQgY2hhckNvZGVfNjEyID0gdGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KTtcbiAgICBpZiAoY2hhckNvZGVfNjEyID09PSA5Nikge1xuICAgICAgbGV0IGVsZW1lbnQsIGl0ZW1zID0gW107XG4gICAgICBsZXQgc3RhcnRMb2NhdGlvbl82MTEgPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgaWYgKGxhc3RFbF81NDModGhpcy5pbnNpZGVTeW50YXhUZW1wbGF0ZSkpIHtcbiAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbl82MTEpO1xuICAgICAgICByZXR1cm4ge3R5cGU6IFJTWU5UQVhfNDg5LCB2YWx1ZTogXCJgXCIsIHNsaWNlOiBzbGljZX07XG4gICAgICB9XG4gICAgICBkbyB7XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLnNjYW5UZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgaXRlbXMucHVzaChlbGVtZW50KTtcbiAgICAgICAgaWYgKGVsZW1lbnQuaW50ZXJwKSB7XG4gICAgICAgICAgZWxlbWVudCA9IHRoaXMucmVhZChbXSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIGFzc2VydChlbGVtZW50LnNpemUgPT09IDEsIFwic2hvdWxkIG9ubHkgaGF2ZSByZWFkIGEgc2luZ2xlIGRlbGltaXRlciBpbnNpZGUgYSB0ZW1wbGF0ZVwiKTtcbiAgICAgICAgICBpdGVtcy5wdXNoKGVsZW1lbnQuZ2V0KDApKTtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoIWVsZW1lbnQudGFpbCk7XG4gICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5URU1QTEFURSwgaXRlbXM6IExpc3QoaXRlbXMpfTtcbiAgICB9IGVsc2UgaWYgKGNoYXJDb2RlXzYxMiA9PT0gMzUpIHtcbiAgICAgIGxldCBzdGFydExvY2F0aW9uXzYxMSA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0LCBzdGFydExvY2F0aW9uXzYxMSk7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KSA9PT0gOTYpIHtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICByZXR1cm4ge3R5cGU6IExTWU5UQVhfNDg4LCB2YWx1ZTogXCIjYFwiLCBzbGljZTogc2xpY2V9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuSURFTlRJRklFUiwgdmFsdWU6IFwiI1wiLCBzbGljZTogc2xpY2V9O1xuICAgIH1cbiAgICBsZXQgbG9va2FoZWFkXzYxMyA9IHN1cGVyLmFkdmFuY2UoKTtcbiAgICBpZiAobG9va2FoZWFkXzYxMy50eXBlID09PSBUb2tlblR5cGUuRElWICYmIGlzUmVnZXhQcmVmaXhfNTQyKGJfNjEwKShwcmVmaXhfNjA5KSkge1xuICAgICAgcmV0dXJuIHN1cGVyLnNjYW5SZWdFeHAoXCIvXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbG9va2FoZWFkXzYxMztcbiAgfVxuICBzY2FuVGVtcGxhdGVFbGVtZW50KCkge1xuICAgIGxldCBzdGFydExvY2F0aW9uXzYxNCA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICBsZXQgc3RhcnRfNjE1ID0gdGhpcy5pbmRleDtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuc291cmNlLmxlbmd0aCkge1xuICAgICAgbGV0IGNoID0gdGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KTtcbiAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSA5NjpcbiAgICAgICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0XzYxNSwgc3RhcnRMb2NhdGlvbl82MTQpO1xuICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5URU1QTEFURSwgdGFpbDogdHJ1ZSwgaW50ZXJwOiBmYWxzZSwgc2xpY2U6IHNsaWNlfTtcbiAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4ICsgMSkgPT09IDEyMykge1xuICAgICAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydF82MTUsIHN0YXJ0TG9jYXRpb25fNjE0KTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLlRFTVBMQVRFLCB0YWlsOiBmYWxzZSwgaW50ZXJwOiB0cnVlLCBzbGljZTogc2xpY2V9O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgbGV0IG9jdGFsID0gdGhpcy5zY2FuU3RyaW5nRXNjYXBlKFwiXCIsIG51bGwpWzFdO1xuICAgICAgICAgICAgaWYgKG9jdGFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVJTExFR0FMKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUlMTEVHQUwoKTtcbiAgfVxufVxuIl19