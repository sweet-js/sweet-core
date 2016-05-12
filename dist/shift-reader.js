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
var isMatchingDelimiters_507 = R.cond([[isLeftBracket_495, function (__548, b_549) {
  return isRightBracket_498(b_549);
}], [isLeftBrace_496, function (__550, b_551) {
  return isRightBrace_499(b_551);
}], [isLeftParen_497, function (__552, b_553) {
  return isRightParen_500(b_553);
}], [isLeftSyntax_503, function (__554, b_555) {
  return isRightSyntax_504(b_555);
}], [R.T, R.F]]);
var assignOps_508 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
var binaryOps_509 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
var unaryOps_510 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
var isEmpty_511 = R.whereEq({ size: 0 });
var isPunctuator_512 = function isPunctuator_512(s_556) {
  return s_556.isPunctuator();
};
var isKeyword_513 = function isKeyword_513(s_557) {
  return s_557.isKeyword();
};
var isDelimiter_514 = function isDelimiter_514(s_558) {
  return s_558.isDelimiter();
};
var isParens_515 = function isParens_515(s_559) {
  return s_559.isParens();
};
var isBraces_516 = function isBraces_516(s_560) {
  return s_560.isBraces();
};
var isBrackets_517 = function isBrackets_517(s_561) {
  return s_561.isBrackets();
};
var isIdentifier_518 = function isIdentifier_518(s_562) {
  return s_562.isIdentifier();
};
var val_519 = function val_519(s_563) {
  return s_563.val();
};
var isVal_520 = R.curry(function (v_564, s_565) {
  return s_565.val() === v_564;
});
var isDot_521 = R.allPass([isPunctuator_512, isVal_520(".")]);
var isColon_522 = R.allPass([isPunctuator_512, isVal_520(":")]);
var isFunctionKeyword_523 = R.allPass([isKeyword_513, isVal_520("function")]);
var isOperator_524 = function isOperator_524(s_566) {
  return (s_566.isPunctuator() || s_566.isKeyword()) && R.any(R.equals(s_566.val()), assignOps_508.concat(binaryOps_509).concat(unaryOps_510));
};
var isNonLiteralKeyword_525 = R.allPass([isKeyword_513, function (s_567) {
  return R.none(R.equals(s_567.val()), literalKeywords_494);
}]);
var isKeywordExprPrefix_526 = R.allPass([isKeyword_513, function (s_568) {
  return R.any(R.equals(s_568.val()), ["instanceof", "typeof", "delete", "void", "yield", "throw", "new", "case"]);
}]);
var last_527 = function last_527(p_569) {
  return p_569.last();
};
var safeLast_528 = R.pipe(R.cond([[isEmpty_511, R.always(Nothing_490())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last_527)]]));
var stuffTrue_529 = R.curry(function (p_570, b_571) {
  return b_571 ? Just_489(p_570) : Nothing_490();
});
var stuffFalse_530 = R.curry(function (p_572, b_573) {
  return !b_573 ? Just_489(p_572) : Nothing_490();
});
var isTopColon_531 = R.pipe(safeLast_528, R.map(isColon_522), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopPunctuator_532 = R.pipe(safeLast_528, R.map(isPunctuator_512), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprReturn_533 = R.curry(function (l_574, p_575) {
  var retKwd_576 = safeLast_528(p_575);
  var maybeDot_577 = pop_544(p_575).chain(safeLast_528);
  if (maybeDot_577.map(isDot_521).getOrElse(false)) {
    return true;
  }
  return retKwd_576.map(function (s_578) {
    return s_578.isKeyword() && s_578.val() === "return" && s_578.lineNumber() === l_574;
  }).getOrElse(false);
});
var isTopOperator_534 = R.pipe(safeLast_528, R.map(isOperator_524), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopKeywordExprPrefix_535 = R.pipe(safeLast_528, R.map(isKeywordExprPrefix_526), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprPrefix_536 = R.curry(function (l_579, b_580) {
  return R.cond([[isEmpty_511, R.always(b_580)], [isTopColon_531, R.always(b_580)], [isTopKeywordExprPrefix_535, R.T], [isTopOperator_534, R.T], [isTopPunctuator_532, R.always(b_580)], [isExprReturn_533(l_579), R.T], [R.T, R.F]]);
});
var curly_537 = function curly_537(p_581) {
  return safeLast_528(p_581).map(isBraces_516).chain(stuffTrue_529(p_581));
};
var paren_538 = function paren_538(p_582) {
  return safeLast_528(p_582).map(isParens_515).chain(stuffTrue_529(p_582));
};
var func_539 = function func_539(p_583) {
  return safeLast_528(p_583).map(isFunctionKeyword_523).chain(stuffTrue_529(p_583));
};
var ident_540 = function ident_540(p_584) {
  return safeLast_528(p_584).map(isIdentifier_518).chain(stuffTrue_529(p_584));
};
var nonLiteralKeyword_541 = function nonLiteralKeyword_541(p_585) {
  return safeLast_528(p_585).map(isNonLiteralKeyword_525).chain(stuffTrue_529(p_585));
};
var opt_542 = R.curry(function (a_586, b_587, p_588) {
  var result_589 = R.pipeK(a_586, b_587)(_ramdaFantasy.Maybe.of(p_588));
  return _ramdaFantasy.Maybe.isJust(result_589) ? result_589 : _ramdaFantasy.Maybe.of(p_588);
});
var notDot_543 = R.ifElse(R.whereEq({ size: 0 }), Just_489, function (p_590) {
  return safeLast_528(p_590).map(function (s_591) {
    return !(s_591.isPunctuator() && s_591.val() === ".");
  }).chain(stuffTrue_529(p_590));
});
var pop_544 = R.compose(Just_489, function (p_592) {
  return p_592.pop();
});
var functionPrefix_545 = R.pipeK(curly_537, pop_544, paren_538, pop_544, opt_542(ident_540, pop_544), func_539);
var isRegexPrefix_546 = function isRegexPrefix_546(b_593) {
  return R.anyPass([isEmpty_511, isTopPunctuator_532, R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword_541, pop_544, notDot_543), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren_538, pop_544, nonLiteralKeyword_541, pop_544, notDot_543), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_545, R.chain(function (p_594) {
    return safeLast_528(p_594).map(function (s_595) {
      return s_595.lineNumber();
    }).chain(function (fnLine_596) {
      return pop_544(p_594).map(isExprPrefix_536(fnLine_596, b_593));
    }).chain(stuffFalse_530(p_594));
  }), _ramdaFantasy.Maybe.isJust), function (p_597) {
    var isCurly_598 = _ramdaFantasy.Maybe.isJust(safeLast_528(p_597).map(isBraces_516));
    var alreadyCheckedFunction_599 = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_545, _ramdaFantasy.Maybe.isJust)(p_597);
    if (alreadyCheckedFunction_599) {
      return false;
    }
    return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly_537), R.chain(function (p_600) {
      return safeLast_528(p_600).map(function (s_601) {
        return s_601.lineNumber();
      }).chain(function (curlyLine_602) {
        return pop_544(p_600).map(isExprPrefix_536(curlyLine_602, b_593));
      }).chain(stuffFalse_530(p_600));
    }), _ramdaFantasy.Maybe.isJust)(p_597);
  }]);
};
function lastEl_547(l_603) {
  return l_603[l_603.length - 1];
}

var Reader = function (_Tokenizer) {
  _inherits(Reader, _Tokenizer);

  function Reader(strings_604, context_605, replacements_606) {
    _classCallCheck(this, Reader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Reader).call(this, Array.isArray(strings_604) ? strings_604.join("") : strings_604));

    _this.delimStack = new Map();
    _this.insideSyntaxTemplate = [false];
    _this.context = context_605;
    if (Array.isArray(strings_604)) {
      (function () {
        var totalIndex = 0;
        _this.replacementIndex = R.reduce(function (acc_607, strRep_608) {
          acc_607.push({ index: totalIndex + strRep_608[0].length, replacement: strRep_608[1] });
          totalIndex += strRep_608[0].length;
          return acc_607;
        }, [], R.zip(strings_604, replacements_606));
      })();
    }
    return _this;
  }

  _createClass(Reader, [{
    key: "read",
    value: function read() {
      var stack_609 = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var b_610 = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var singleDelimiter_611 = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var prefix_612 = (0, _immutable.List)();
      while (true) {
        var tok = this.advance(prefix_612, b_610);
        if (tok instanceof _syntax2.default || tok instanceof _terms2.default) {
          stack_609.push(tok);
          continue;
        }
        if (Array.isArray(tok)) {
          Array.prototype.push.apply(stack_609, tok);
          continue;
        }
        if (_immutable.List.isList(tok)) {
          Array.prototype.push.apply(stack_609, tok.toArray());
          continue;
        }
        if (isEOS_501(tok)) {
          if (stack_609[0] && isLeftDelimiter_505(stack_609[0].token)) {
            throw this.createUnexpected(tok);
          }
          break;
        }
        if (isLeftDelimiter_505(tok)) {
          if (isLeftSyntax_503(tok)) {
            this.insideSyntaxTemplate.push(true);
          }
          var line = tok.slice.startLocation.line;
          var innerB = isLeftBrace_496(tok) ? isExprPrefix_536(line, b_610)(prefix_612) : true;
          var inner = this.read([new _syntax2.default(tok)], innerB, false);
          var stx = new _syntax2.default(inner, this.context);
          prefix_612 = prefix_612.concat(stx);
          stack_609.push(stx);
          if (singleDelimiter_611) {
            break;
          }
        } else if (isRightDelimiter_506(tok)) {
          if (stack_609[0] && !isMatchingDelimiters_507(stack_609[0].token, tok)) {
            throw this.createUnexpected(tok);
          }
          var _stx = new _syntax2.default(tok, this.context);
          stack_609.push(_stx);
          if (lastEl_547(this.insideSyntaxTemplate) && isRightSyntax_504(tok)) {
            this.insideSyntaxTemplate.pop();
          }
          break;
        } else {
          var _stx2 = new _syntax2.default(tok, this.context);
          prefix_612 = prefix_612.concat(_stx2);
          stack_609.push(_stx2);
        }
      }
      return (0, _immutable.List)(stack_609);
    }
  }, {
    key: "advance",
    value: function advance(prefix_613, b_614) {
      var startLocation_615 = this.getLocation();
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
      var charCode_616 = this.source.charCodeAt(this.index);
      if (charCode_616 === 96) {
        var element = void 0,
            items = [];
        var _startLocation_ = this.getLocation();
        var start = this.index;
        this.index++;
        if (lastEl_547(this.insideSyntaxTemplate)) {
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
      } else if (charCode_616 === 35) {
        var _startLocation_2 = this.getLocation();
        var _start = this.index;
        var _slice = this.getSlice(_start, _startLocation_2);
        this.index++;
        if (this.source.charCodeAt(this.index) === 96) {
          this.index++;
          return { type: LSYNTAX_491, value: "#`", slice: _slice };
        }
        return { type: _tokenizer.TokenType.IDENTIFIER, value: "#", slice: _slice };
      } else if (charCode_616 === 64) {
        var _startLocation_3 = this.getLocation();
        var _start2 = this.index;
        var _slice2 = this.getSlice(_start2, _startLocation_3);
        this.index++;
        return { type: AT_493, value: "@", slice: _slice2 };
      }
      var lookahead_617 = _get(Object.getPrototypeOf(Reader.prototype), "advance", this).call(this);
      if (lookahead_617.type === _tokenizer.TokenType.DIV && isRegexPrefix_546(b_614)(prefix_613)) {
        return _get(Object.getPrototypeOf(Reader.prototype), "scanRegExp", this).call(this, "/");
      }
      return lookahead_617;
    }
  }, {
    key: "scanTemplateElement",
    value: function scanTemplateElement() {
      var startLocation_618 = this.getLocation();
      var start_619 = this.index;
      while (this.index < this.source.length) {
        var ch = this.source.charCodeAt(this.index);
        switch (ch) {
          case 96:
            var slice = this.getSlice(start_619, startLocation_618);
            this.index++;
            return { type: _tokenizer.TokenType.TEMPLATE, tail: true, interp: false, slice: slice };
          case 36:
            if (this.source.charCodeAt(this.index + 1) === 123) {
              var _slice3 = this.getSlice(start_619, startLocation_618);
              this.index += 1;
              return { type: _tokenizer.TokenType.TEMPLATE, tail: false, interp: true, slice: _slice3 };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3NoaWZ0LXJlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOztJQUFhLEM7O0FBQ2I7O0FBQ0E7O0FBR0E7Ozs7Ozs7Ozs7Ozs7O0FBRkEsSUFBTSxXQUFXLG9CQUFNLElBQXZCO0FBQ0EsSUFBTSxjQUFjLG9CQUFNLE9BQTFCOztBQUVBLElBQU0sY0FBYyxFQUFDLE1BQU0sYUFBUCxFQUFwQjtBQUNBLElBQU0sY0FBYyxFQUFDLE1BQU0sY0FBUCxFQUFwQjtBQUNBLElBQU0sU0FBUyxFQUFDLE9BQU8sc0JBQVcsVUFBbkIsRUFBK0IsTUFBTSxHQUFyQyxFQUFmO0FBQ0EsSUFBTSxzQkFBc0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixPQUF6QixDQUE1QjtBQUNBLElBQU0sb0JBQW9CLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFqQixFQUFWLENBQTFCO0FBQ0EsSUFBTSxrQkFBa0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQVYsQ0FBeEI7QUFDQSxJQUFNLGtCQUFrQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBVixDQUF4QjtBQUNBLElBQU0scUJBQXFCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFqQixFQUFWLENBQTNCO0FBQ0EsSUFBTSxtQkFBbUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQVYsQ0FBekI7QUFDQSxJQUFNLG1CQUFtQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBVixDQUF6QjtBQUNBLElBQU0sWUFBWSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsR0FBakIsRUFBVixDQUFsQjtBQUNBLElBQU0sYUFBYSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJB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QVosQ0FBdUIsS0FBSyxLQUE1QixDQUFUO0FBQ0EsZ0JBQVEsRUFBUjtBQUNFLGVBQUssRUFBTDtBQUNFLGdCQUFJLFFBQVEsS0FBSyxRQUFMLENBQWMsU0FBZCxFQUF5QixpQkFBekIsQ0FBWjtBQUNBLGlCQUFLLEtBQUw7QUFDQSxtQkFBTyxFQUFDLE1BQU0scUJBQVUsUUFBakIsRUFBMkIsTUFBTSxJQUFqQyxFQUF1QyxRQUFRLEtBQS9DLEVBQXNELE9BQU8sS0FBN0QsRUFBUDtBQUNGLGVBQUssRUFBTDtBQUNFLGdCQUFJLEtBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsS0FBSyxLQUFMLEdBQWEsQ0FBcEMsTUFBMkMsR0FBL0MsRUFBb0Q7QUFDbEQsa0JBQUksVUFBUSxLQUFLLFFBQUwsQ0FBYyxTQUFkLEVBQXlCLGlCQUF6QixDQUFaO0FBQ0EsbUJBQUssS0FBTCxJQUFjLENBQWQ7QUFDQSxxQkFBTyxFQUFDLE1BQU0scUJBQVUsUUFBakIsRUFBMkIsTUFBTSxLQUFqQyxFQUF3QyxRQUFRLElBQWhELEVBQXNELE9BQU8sT0FBN0QsRUFBUDtBQUNEO0FBQ0QsaUJBQUssS0FBTDtBQUNBO0FBQ0YsZUFBSyxFQUFMO0FBQ0U7QUFDRSxrQkFBSSxRQUFRLEtBQUssZ0JBQUwsQ0FBc0IsRUFBdEIsRUFBMEIsSUFBMUIsRUFBZ0MsQ0FBaEMsQ0FBWjtBQUNBLGtCQUFJLFNBQVMsSUFBYixFQUFtQjtBQUNqQixzQkFBTSxLQUFLLGFBQUwsRUFBTjtBQUNEO0FBQ0Q7QUFDRDtBQUNIO0FBQ0UsaUJBQUssS0FBTDtBQXRCSjtBQXdCRDtBQUNELFlBQU0sS0FBSyxhQUFMLEVBQU47QUFDRDs7Ozs7O2tCQTVKa0IsTSIsImZpbGUiOiJzaGlmdC1yZWFkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVG9rZW5pemVyIGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmltcG9ydCB7VG9rZW5DbGFzcywgVG9rZW5UeXBlfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgICogYXMgUiBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5jb25zdCBKdXN0XzQ4OSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzQ5MCA9IE1heWJlLk5vdGhpbmc7XG5pbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuY29uc3QgTFNZTlRBWF80OTEgPSB7bmFtZTogXCJsZWZ0LXN5bnRheFwifTtcbmNvbnN0IFJTWU5UQVhfNDkyID0ge25hbWU6IFwicmlnaHQtc3ludGF4XCJ9O1xuY29uc3QgQVRfNDkzID0ge2tsYXNzOiBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIG5hbWU6IFwiQFwifTtcbmNvbnN0IGxpdGVyYWxLZXl3b3Jkc180OTQgPSBbXCJ0aGlzXCIsIFwibnVsbFwiLCBcInRydWVcIiwgXCJmYWxzZVwiXTtcbmNvbnN0IGlzTGVmdEJyYWNrZXRfNDk1ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuTEJSQUNLfSk7XG5jb25zdCBpc0xlZnRCcmFjZV80OTYgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5MQlJBQ0V9KTtcbmNvbnN0IGlzTGVmdFBhcmVuXzQ5NyA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLkxQQVJFTn0pO1xuY29uc3QgaXNSaWdodEJyYWNrZXRfNDk4ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLfSk7XG5jb25zdCBpc1JpZ2h0QnJhY2VfNDk5ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuUkJSQUNFfSk7XG5jb25zdCBpc1JpZ2h0UGFyZW5fNTAwID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuUlBBUkVOfSk7XG5jb25zdCBpc0VPU181MDEgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5FT1N9KTtcbmNvbnN0IGlzSGFzaF81MDIgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogXCIjXCJ9KTtcbmNvbnN0IGlzTGVmdFN5bnRheF81MDMgPSBSLndoZXJlRXEoe3R5cGU6IExTWU5UQVhfNDkxfSk7XG5jb25zdCBpc1JpZ2h0U3ludGF4XzUwNCA9IFIud2hlcmVFcSh7dHlwZTogUlNZTlRBWF80OTJ9KTtcbmNvbnN0IGlzTGVmdERlbGltaXRlcl81MDUgPSBSLmFueVBhc3MoW2lzTGVmdEJyYWNrZXRfNDk1LCBpc0xlZnRCcmFjZV80OTYsIGlzTGVmdFBhcmVuXzQ5NywgaXNMZWZ0U3ludGF4XzUwM10pO1xuY29uc3QgaXNSaWdodERlbGltaXRlcl81MDYgPSBSLmFueVBhc3MoW2lzUmlnaHRCcmFja2V0XzQ5OCwgaXNSaWdodEJyYWNlXzQ5OSwgaXNSaWdodFBhcmVuXzUwMCwgaXNSaWdodFN5bnRheF81MDRdKTtcbmNvbnN0IGlzTWF0Y2hpbmdEZWxpbWl0ZXJzXzUwNyA9IFIuY29uZChbW2lzTGVmdEJyYWNrZXRfNDk1LCAoX181NDgsIGJfNTQ5KSA9PiBpc1JpZ2h0QnJhY2tldF80OTgoYl81NDkpXSwgW2lzTGVmdEJyYWNlXzQ5NiwgKF9fNTUwLCBiXzU1MSkgPT4gaXNSaWdodEJyYWNlXzQ5OShiXzU1MSldLCBbaXNMZWZ0UGFyZW5fNDk3LCAoX181NTIsIGJfNTUzKSA9PiBpc1JpZ2h0UGFyZW5fNTAwKGJfNTUzKV0sIFtpc0xlZnRTeW50YXhfNTAzLCAoX181NTQsIGJfNTU1KSA9PiBpc1JpZ2h0U3ludGF4XzUwNChiXzU1NSldLCBbUi5ULCBSLkZdXSk7XG5jb25zdCBhc3NpZ25PcHNfNTA4ID0gW1wiPVwiLCBcIis9XCIsIFwiLT1cIiwgXCIqPVwiLCBcIi89XCIsIFwiJT1cIiwgXCI8PD1cIiwgXCI+Pj1cIiwgXCI+Pj49XCIsIFwiJj1cIiwgXCJ8PVwiLCBcIl49XCIsIFwiLFwiXTtcbmNvbnN0IGJpbmFyeU9wc181MDkgPSBbXCIrXCIsIFwiLVwiLCBcIipcIiwgXCIvXCIsIFwiJVwiLCBcIjw8XCIsIFwiPj5cIiwgXCI+Pj5cIiwgXCImXCIsIFwifFwiLCBcIl5cIiwgXCImJlwiLCBcInx8XCIsIFwiP1wiLCBcIjpcIiwgXCI9PT1cIiwgXCI9PVwiLCBcIj49XCIsIFwiPD1cIiwgXCI8XCIsIFwiPlwiLCBcIiE9XCIsIFwiIT09XCIsIFwiaW5zdGFuY2VvZlwiXTtcbmNvbnN0IHVuYXJ5T3BzXzUxMCA9IFtcIisrXCIsIFwiLS1cIiwgXCJ+XCIsIFwiIVwiLCBcImRlbGV0ZVwiLCBcInZvaWRcIiwgXCJ0eXBlb2ZcIiwgXCJ5aWVsZFwiLCBcInRocm93XCIsIFwibmV3XCJdO1xuY29uc3QgaXNFbXB0eV81MTEgPSBSLndoZXJlRXEoe3NpemU6IDB9KTtcbmNvbnN0IGlzUHVuY3R1YXRvcl81MTIgPSBzXzU1NiA9PiBzXzU1Ni5pc1B1bmN0dWF0b3IoKTtcbmNvbnN0IGlzS2V5d29yZF81MTMgPSBzXzU1NyA9PiBzXzU1Ny5pc0tleXdvcmQoKTtcbmNvbnN0IGlzRGVsaW1pdGVyXzUxNCA9IHNfNTU4ID0+IHNfNTU4LmlzRGVsaW1pdGVyKCk7XG5jb25zdCBpc1BhcmVuc181MTUgPSBzXzU1OSA9PiBzXzU1OS5pc1BhcmVucygpO1xuY29uc3QgaXNCcmFjZXNfNTE2ID0gc181NjAgPT4gc181NjAuaXNCcmFjZXMoKTtcbmNvbnN0IGlzQnJhY2tldHNfNTE3ID0gc181NjEgPT4gc181NjEuaXNCcmFja2V0cygpO1xuY29uc3QgaXNJZGVudGlmaWVyXzUxOCA9IHNfNTYyID0+IHNfNTYyLmlzSWRlbnRpZmllcigpO1xuY29uc3QgdmFsXzUxOSA9IHNfNTYzID0+IHNfNTYzLnZhbCgpO1xuY29uc3QgaXNWYWxfNTIwID0gUi5jdXJyeSgodl81NjQsIHNfNTY1KSA9PiBzXzU2NS52YWwoKSA9PT0gdl81NjQpO1xuY29uc3QgaXNEb3RfNTIxID0gUi5hbGxQYXNzKFtpc1B1bmN0dWF0b3JfNTEyLCBpc1ZhbF81MjAoXCIuXCIpXSk7XG5jb25zdCBpc0NvbG9uXzUyMiA9IFIuYWxsUGFzcyhbaXNQdW5jdHVhdG9yXzUxMiwgaXNWYWxfNTIwKFwiOlwiKV0pO1xuY29uc3QgaXNGdW5jdGlvbktleXdvcmRfNTIzID0gUi5hbGxQYXNzKFtpc0tleXdvcmRfNTEzLCBpc1ZhbF81MjAoXCJmdW5jdGlvblwiKV0pO1xuY29uc3QgaXNPcGVyYXRvcl81MjQgPSBzXzU2NiA9PiAoc181NjYuaXNQdW5jdHVhdG9yKCkgfHwgc181NjYuaXNLZXl3b3JkKCkpICYmIFIuYW55KFIuZXF1YWxzKHNfNTY2LnZhbCgpKSwgYXNzaWduT3BzXzUwOC5jb25jYXQoYmluYXJ5T3BzXzUwOSkuY29uY2F0KHVuYXJ5T3BzXzUxMCkpO1xuY29uc3QgaXNOb25MaXRlcmFsS2V5d29yZF81MjUgPSBSLmFsbFBhc3MoW2lzS2V5d29yZF81MTMsIHNfNTY3ID0+IFIubm9uZShSLmVxdWFscyhzXzU2Ny52YWwoKSksIGxpdGVyYWxLZXl3b3Jkc180OTQpXSk7XG5jb25zdCBpc0tleXdvcmRFeHByUHJlZml4XzUyNiA9IFIuYWxsUGFzcyhbaXNLZXl3b3JkXzUxMywgc181NjggPT4gUi5hbnkoUi5lcXVhbHMoc181NjgudmFsKCkpLCBbXCJpbnN0YW5jZW9mXCIsIFwidHlwZW9mXCIsIFwiZGVsZXRlXCIsIFwidm9pZFwiLCBcInlpZWxkXCIsIFwidGhyb3dcIiwgXCJuZXdcIiwgXCJjYXNlXCJdKV0pO1xubGV0IGxhc3RfNTI3ID0gcF81NjkgPT4gcF81NjkubGFzdCgpO1xubGV0IHNhZmVMYXN0XzUyOCA9IFIucGlwZShSLmNvbmQoW1tpc0VtcHR5XzUxMSwgUi5hbHdheXMoTm90aGluZ180OTAoKSldLCBbUi5ULCBSLmNvbXBvc2UoTWF5YmUub2YsIGxhc3RfNTI3KV1dKSk7XG5sZXQgc3R1ZmZUcnVlXzUyOSA9IFIuY3VycnkoKHBfNTcwLCBiXzU3MSkgPT4gYl81NzEgPyBKdXN0XzQ4OShwXzU3MCkgOiBOb3RoaW5nXzQ5MCgpKTtcbmxldCBzdHVmZkZhbHNlXzUzMCA9IFIuY3VycnkoKHBfNTcyLCBiXzU3MykgPT4gIWJfNTczID8gSnVzdF80ODkocF81NzIpIDogTm90aGluZ180OTAoKSk7XG5sZXQgaXNUb3BDb2xvbl81MzEgPSBSLnBpcGUoc2FmZUxhc3RfNTI4LCBSLm1hcChpc0NvbG9uXzUyMiksIE1heWJlLm1heWJlKGZhbHNlLCBSLmlkZW50aXR5KSk7XG5sZXQgaXNUb3BQdW5jdHVhdG9yXzUzMiA9IFIucGlwZShzYWZlTGFzdF81MjgsIFIubWFwKGlzUHVuY3R1YXRvcl81MTIpLCBNYXliZS5tYXliZShmYWxzZSwgUi5pZGVudGl0eSkpO1xubGV0IGlzRXhwclJldHVybl81MzMgPSBSLmN1cnJ5KChsXzU3NCwgcF81NzUpID0+IHtcbiAgbGV0IHJldEt3ZF81NzYgPSBzYWZlTGFzdF81MjgocF81NzUpO1xuICBsZXQgbWF5YmVEb3RfNTc3ID0gcG9wXzU0NChwXzU3NSkuY2hhaW4oc2FmZUxhc3RfNTI4KTtcbiAgaWYgKG1heWJlRG90XzU3Ny5tYXAoaXNEb3RfNTIxKS5nZXRPckVsc2UoZmFsc2UpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHJldEt3ZF81NzYubWFwKHNfNTc4ID0+IHtcbiAgICByZXR1cm4gc181NzguaXNLZXl3b3JkKCkgJiYgc181NzgudmFsKCkgPT09IFwicmV0dXJuXCIgJiYgc181NzgubGluZU51bWJlcigpID09PSBsXzU3NDtcbiAgfSkuZ2V0T3JFbHNlKGZhbHNlKTtcbn0pO1xuY29uc3QgaXNUb3BPcGVyYXRvcl81MzQgPSBSLnBpcGUoc2FmZUxhc3RfNTI4LCBSLm1hcChpc09wZXJhdG9yXzUyNCksIE1heWJlLm1heWJlKGZhbHNlLCBSLmlkZW50aXR5KSk7XG5jb25zdCBpc1RvcEtleXdvcmRFeHByUHJlZml4XzUzNSA9IFIucGlwZShzYWZlTGFzdF81MjgsIFIubWFwKGlzS2V5d29yZEV4cHJQcmVmaXhfNTI2KSwgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpKTtcbmxldCBpc0V4cHJQcmVmaXhfNTM2ID0gUi5jdXJyeSgobF81NzksIGJfNTgwKSA9PiBSLmNvbmQoW1tpc0VtcHR5XzUxMSwgUi5hbHdheXMoYl81ODApXSwgW2lzVG9wQ29sb25fNTMxLCBSLmFsd2F5cyhiXzU4MCldLCBbaXNUb3BLZXl3b3JkRXhwclByZWZpeF81MzUsIFIuVF0sIFtpc1RvcE9wZXJhdG9yXzUzNCwgUi5UXSwgW2lzVG9wUHVuY3R1YXRvcl81MzIsIFIuYWx3YXlzKGJfNTgwKV0sIFtpc0V4cHJSZXR1cm5fNTMzKGxfNTc5KSwgUi5UXSwgW1IuVCwgUi5GXV0pKTtcbmxldCBjdXJseV81MzcgPSBwXzU4MSA9PiBzYWZlTGFzdF81MjgocF81ODEpLm1hcChpc0JyYWNlc181MTYpLmNoYWluKHN0dWZmVHJ1ZV81MjkocF81ODEpKTtcbmxldCBwYXJlbl81MzggPSBwXzU4MiA9PiBzYWZlTGFzdF81MjgocF81ODIpLm1hcChpc1BhcmVuc181MTUpLmNoYWluKHN0dWZmVHJ1ZV81MjkocF81ODIpKTtcbmxldCBmdW5jXzUzOSA9IHBfNTgzID0+IHNhZmVMYXN0XzUyOChwXzU4MykubWFwKGlzRnVuY3Rpb25LZXl3b3JkXzUyMykuY2hhaW4oc3R1ZmZUcnVlXzUyOShwXzU4MykpO1xubGV0IGlkZW50XzU0MCA9IHBfNTg0ID0+IHNhZmVMYXN0XzUyOChwXzU4NCkubWFwKGlzSWRlbnRpZmllcl81MTgpLmNoYWluKHN0dWZmVHJ1ZV81MjkocF81ODQpKTtcbmxldCBub25MaXRlcmFsS2V5d29yZF81NDEgPSBwXzU4NSA9PiBzYWZlTGFzdF81MjgocF81ODUpLm1hcChpc05vbkxpdGVyYWxLZXl3b3JkXzUyNSkuY2hhaW4oc3R1ZmZUcnVlXzUyOShwXzU4NSkpO1xubGV0IG9wdF81NDIgPSBSLmN1cnJ5KChhXzU4NiwgYl81ODcsIHBfNTg4KSA9PiB7XG4gIGxldCByZXN1bHRfNTg5ID0gUi5waXBlSyhhXzU4NiwgYl81ODcpKE1heWJlLm9mKHBfNTg4KSk7XG4gIHJldHVybiBNYXliZS5pc0p1c3QocmVzdWx0XzU4OSkgPyByZXN1bHRfNTg5IDogTWF5YmUub2YocF81ODgpO1xufSk7XG5sZXQgbm90RG90XzU0MyA9IFIuaWZFbHNlKFIud2hlcmVFcSh7c2l6ZTogMH0pLCBKdXN0XzQ4OSwgcF81OTAgPT4gc2FmZUxhc3RfNTI4KHBfNTkwKS5tYXAoc181OTEgPT4gIShzXzU5MS5pc1B1bmN0dWF0b3IoKSAmJiBzXzU5MS52YWwoKSA9PT0gXCIuXCIpKS5jaGFpbihzdHVmZlRydWVfNTI5KHBfNTkwKSkpO1xubGV0IHBvcF81NDQgPSBSLmNvbXBvc2UoSnVzdF80ODksIHBfNTkyID0+IHBfNTkyLnBvcCgpKTtcbmNvbnN0IGZ1bmN0aW9uUHJlZml4XzU0NSA9IFIucGlwZUsoY3VybHlfNTM3LCBwb3BfNTQ0LCBwYXJlbl81MzgsIHBvcF81NDQsIG9wdF81NDIoaWRlbnRfNTQwLCBwb3BfNTQ0KSwgZnVuY181MzkpO1xuY29uc3QgaXNSZWdleFByZWZpeF81NDYgPSBiXzU5MyA9PiBSLmFueVBhc3MoW2lzRW1wdHlfNTExLCBpc1RvcFB1bmN0dWF0b3JfNTMyLCBSLnBpcGUoTWF5YmUub2YsIFIucGlwZUsobm9uTGl0ZXJhbEtleXdvcmRfNTQxLCBwb3BfNTQ0LCBub3REb3RfNTQzKSwgTWF5YmUuaXNKdXN0KSwgUi5waXBlKE1heWJlLm9mLCBSLnBpcGVLKHBhcmVuXzUzOCwgcG9wXzU0NCwgbm9uTGl0ZXJhbEtleXdvcmRfNTQxLCBwb3BfNTQ0LCBub3REb3RfNTQzKSwgTWF5YmUuaXNKdXN0KSwgUi5waXBlKE1heWJlLm9mLCBmdW5jdGlvblByZWZpeF81NDUsIFIuY2hhaW4ocF81OTQgPT4ge1xuICByZXR1cm4gc2FmZUxhc3RfNTI4KHBfNTk0KS5tYXAoc181OTUgPT4gc181OTUubGluZU51bWJlcigpKS5jaGFpbihmbkxpbmVfNTk2ID0+IHtcbiAgICByZXR1cm4gcG9wXzU0NChwXzU5NCkubWFwKGlzRXhwclByZWZpeF81MzYoZm5MaW5lXzU5NiwgYl81OTMpKTtcbiAgfSkuY2hhaW4oc3R1ZmZGYWxzZV81MzAocF81OTQpKTtcbn0pLCBNYXliZS5pc0p1c3QpLCBwXzU5NyA9PiB7XG4gIGxldCBpc0N1cmx5XzU5OCA9IE1heWJlLmlzSnVzdChzYWZlTGFzdF81MjgocF81OTcpLm1hcChpc0JyYWNlc181MTYpKTtcbiAgbGV0IGFscmVhZHlDaGVja2VkRnVuY3Rpb25fNTk5ID0gUi5waXBlKE1heWJlLm9mLCBmdW5jdGlvblByZWZpeF81NDUsIE1heWJlLmlzSnVzdCkocF81OTcpO1xuICBpZiAoYWxyZWFkeUNoZWNrZWRGdW5jdGlvbl81OTkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIFIucGlwZShNYXliZS5vZiwgUi5jaGFpbihjdXJseV81MzcpLCBSLmNoYWluKHBfNjAwID0+IHtcbiAgICByZXR1cm4gc2FmZUxhc3RfNTI4KHBfNjAwKS5tYXAoc182MDEgPT4gc182MDEubGluZU51bWJlcigpKS5jaGFpbihjdXJseUxpbmVfNjAyID0+IHtcbiAgICAgIHJldHVybiBwb3BfNTQ0KHBfNjAwKS5tYXAoaXNFeHByUHJlZml4XzUzNihjdXJseUxpbmVfNjAyLCBiXzU5MykpO1xuICAgIH0pLmNoYWluKHN0dWZmRmFsc2VfNTMwKHBfNjAwKSk7XG4gIH0pLCBNYXliZS5pc0p1c3QpKHBfNTk3KTtcbn1dKTtcbmZ1bmN0aW9uIGxhc3RFbF81NDcobF82MDMpIHtcbiAgcmV0dXJuIGxfNjAzW2xfNjAzLmxlbmd0aCAtIDFdO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhZGVyIGV4dGVuZHMgVG9rZW5pemVyIHtcbiAgY29uc3RydWN0b3Ioc3RyaW5nc182MDQsIGNvbnRleHRfNjA1LCByZXBsYWNlbWVudHNfNjA2KSB7XG4gICAgc3VwZXIoQXJyYXkuaXNBcnJheShzdHJpbmdzXzYwNCkgPyBzdHJpbmdzXzYwNC5qb2luKFwiXCIpIDogc3RyaW5nc182MDQpO1xuICAgIHRoaXMuZGVsaW1TdGFjayA9IG5ldyBNYXA7XG4gICAgdGhpcy5pbnNpZGVTeW50YXhUZW1wbGF0ZSA9IFtmYWxzZV07XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF82MDU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3RyaW5nc182MDQpKSB7XG4gICAgICBsZXQgdG90YWxJbmRleCA9IDA7XG4gICAgICB0aGlzLnJlcGxhY2VtZW50SW5kZXggPSBSLnJlZHVjZSgoYWNjXzYwNywgc3RyUmVwXzYwOCkgPT4ge1xuICAgICAgICBhY2NfNjA3LnB1c2goe2luZGV4OiB0b3RhbEluZGV4ICsgc3RyUmVwXzYwOFswXS5sZW5ndGgsIHJlcGxhY2VtZW50OiBzdHJSZXBfNjA4WzFdfSk7XG4gICAgICAgIHRvdGFsSW5kZXggKz0gc3RyUmVwXzYwOFswXS5sZW5ndGg7XG4gICAgICAgIHJldHVybiBhY2NfNjA3O1xuICAgICAgfSwgW10sIFIuemlwKHN0cmluZ3NfNjA0LCByZXBsYWNlbWVudHNfNjA2KSk7XG4gICAgfVxuICB9XG4gIHJlYWQoc3RhY2tfNjA5ID0gW10sIGJfNjEwID0gZmFsc2UsIHNpbmdsZURlbGltaXRlcl82MTEgPSBmYWxzZSkge1xuICAgIGxldCBwcmVmaXhfNjEyID0gTGlzdCgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgdG9rID0gdGhpcy5hZHZhbmNlKHByZWZpeF82MTIsIGJfNjEwKTtcbiAgICAgIGlmICh0b2sgaW5zdGFuY2VvZiBTeW50YXggfHwgdG9rIGluc3RhbmNlb2YgVGVybSkge1xuICAgICAgICBzdGFja182MDkucHVzaCh0b2spO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRvaykpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoc3RhY2tfNjA5LCB0b2spO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChMaXN0LmlzTGlzdCh0b2spKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHN0YWNrXzYwOSwgdG9rLnRvQXJyYXkoKSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKGlzRU9TXzUwMSh0b2spKSB7XG4gICAgICAgIGlmIChzdGFja182MDlbMF0gJiYgaXNMZWZ0RGVsaW1pdGVyXzUwNShzdGFja182MDlbMF0udG9rZW4pKSB7XG4gICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVVbmV4cGVjdGVkKHRvayk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaXNMZWZ0RGVsaW1pdGVyXzUwNSh0b2spKSB7XG4gICAgICAgIGlmIChpc0xlZnRTeW50YXhfNTAzKHRvaykpIHtcbiAgICAgICAgICB0aGlzLmluc2lkZVN5bnRheFRlbXBsYXRlLnB1c2godHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxpbmUgPSB0b2suc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lO1xuICAgICAgICBsZXQgaW5uZXJCID0gaXNMZWZ0QnJhY2VfNDk2KHRvaykgPyBpc0V4cHJQcmVmaXhfNTM2KGxpbmUsIGJfNjEwKShwcmVmaXhfNjEyKSA6IHRydWU7XG4gICAgICAgIGxldCBpbm5lciA9IHRoaXMucmVhZChbbmV3IFN5bnRheCh0b2spXSwgaW5uZXJCLCBmYWxzZSk7XG4gICAgICAgIGxldCBzdHggPSBuZXcgU3ludGF4KGlubmVyLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICBwcmVmaXhfNjEyID0gcHJlZml4XzYxMi5jb25jYXQoc3R4KTtcbiAgICAgICAgc3RhY2tfNjA5LnB1c2goc3R4KTtcbiAgICAgICAgaWYgKHNpbmdsZURlbGltaXRlcl82MTEpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc1JpZ2h0RGVsaW1pdGVyXzUwNih0b2spKSB7XG4gICAgICAgIGlmIChzdGFja182MDlbMF0gJiYgIWlzTWF0Y2hpbmdEZWxpbWl0ZXJzXzUwNyhzdGFja182MDlbMF0udG9rZW4sIHRvaykpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZVVuZXhwZWN0ZWQodG9rKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc3R4ID0gbmV3IFN5bnRheCh0b2ssIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHN0YWNrXzYwOS5wdXNoKHN0eCk7XG4gICAgICAgIGlmIChsYXN0RWxfNTQ3KHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUpICYmIGlzUmlnaHRTeW50YXhfNTA0KHRvaykpIHtcbiAgICAgICAgICB0aGlzLmluc2lkZVN5bnRheFRlbXBsYXRlLnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHN0eCA9IG5ldyBTeW50YXgodG9rLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICBwcmVmaXhfNjEyID0gcHJlZml4XzYxMi5jb25jYXQoc3R4KTtcbiAgICAgICAgc3RhY2tfNjA5LnB1c2goc3R4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIExpc3Qoc3RhY2tfNjA5KTtcbiAgfVxuICBhZHZhbmNlKHByZWZpeF82MTMsIGJfNjE0KSB7XG4gICAgbGV0IHN0YXJ0TG9jYXRpb25fNjE1ID0gdGhpcy5nZXRMb2NhdGlvbigpO1xuICAgIHRoaXMubGFzdEluZGV4ID0gdGhpcy5pbmRleDtcbiAgICB0aGlzLmxhc3RMaW5lID0gdGhpcy5saW5lO1xuICAgIHRoaXMubGFzdExpbmVTdGFydCA9IHRoaXMubGluZVN0YXJ0O1xuICAgIHRoaXMuc2tpcENvbW1lbnQoKTtcbiAgICB0aGlzLnN0YXJ0SW5kZXggPSB0aGlzLmluZGV4O1xuICAgIHRoaXMuc3RhcnRMaW5lID0gdGhpcy5saW5lO1xuICAgIHRoaXMuc3RhcnRMaW5lU3RhcnQgPSB0aGlzLmxpbmVTdGFydDtcbiAgICBpZiAodGhpcy5yZXBsYWNlbWVudEluZGV4ICYmIHRoaXMucmVwbGFjZW1lbnRJbmRleFswXSAmJiB0aGlzLmluZGV4ID49IHRoaXMucmVwbGFjZW1lbnRJbmRleFswXS5pbmRleCkge1xuICAgICAgbGV0IHJlcCA9IHRoaXMucmVwbGFjZW1lbnRJbmRleFswXS5yZXBsYWNlbWVudDtcbiAgICAgIHRoaXMucmVwbGFjZW1lbnRJbmRleC5zaGlmdCgpO1xuICAgICAgcmV0dXJuIHJlcDtcbiAgICB9XG4gICAgbGV0IGNoYXJDb2RlXzYxNiA9IHRoaXMuc291cmNlLmNoYXJDb2RlQXQodGhpcy5pbmRleCk7XG4gICAgaWYgKGNoYXJDb2RlXzYxNiA9PT0gOTYpIHtcbiAgICAgIGxldCBlbGVtZW50LCBpdGVtcyA9IFtdO1xuICAgICAgbGV0IHN0YXJ0TG9jYXRpb25fNjE1ID0gdGhpcy5nZXRMb2NhdGlvbigpO1xuICAgICAgbGV0IHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIGlmIChsYXN0RWxfNTQ3KHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUpKSB7XG4gICAgICAgIGxldCBzbGljZSA9IHRoaXMuZ2V0U2xpY2Uoc3RhcnQsIHN0YXJ0TG9jYXRpb25fNjE1KTtcbiAgICAgICAgcmV0dXJuIHt0eXBlOiBSU1lOVEFYXzQ5MiwgdmFsdWU6IFwiYFwiLCBzbGljZTogc2xpY2V9O1xuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBlbGVtZW50ID0gdGhpcy5zY2FuVGVtcGxhdGVFbGVtZW50KCk7XG4gICAgICAgIGl0ZW1zLnB1c2goZWxlbWVudCk7XG4gICAgICAgIGlmIChlbGVtZW50LmludGVycCkge1xuICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLnJlYWQoW10sIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBhc3NlcnQoZWxlbWVudC5zaXplID09PSAxLCBcInNob3VsZCBvbmx5IGhhdmUgcmVhZCBhIHNpbmdsZSBkZWxpbWl0ZXIgaW5zaWRlIGEgdGVtcGxhdGVcIik7XG4gICAgICAgICAgaXRlbXMucHVzaChlbGVtZW50LmdldCgwKSk7XG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKCFlbGVtZW50LnRhaWwpO1xuICAgICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuVEVNUExBVEUsIGl0ZW1zOiBMaXN0KGl0ZW1zKX07XG4gICAgfSBlbHNlIGlmIChjaGFyQ29kZV82MTYgPT09IDM1KSB7XG4gICAgICBsZXQgc3RhcnRMb2NhdGlvbl82MTUgPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbl82MTUpO1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgaWYgKHRoaXMuc291cmNlLmNoYXJDb2RlQXQodGhpcy5pbmRleCkgPT09IDk2KSB7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgcmV0dXJuIHt0eXBlOiBMU1lOVEFYXzQ5MSwgdmFsdWU6IFwiI2BcIiwgc2xpY2U6IHNsaWNlfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLklERU5USUZJRVIsIHZhbHVlOiBcIiNcIiwgc2xpY2U6IHNsaWNlfTtcbiAgICB9IGVsc2UgaWYgKGNoYXJDb2RlXzYxNiA9PT0gNjQpIHtcbiAgICAgIGxldCBzdGFydExvY2F0aW9uXzYxNSA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0LCBzdGFydExvY2F0aW9uXzYxNSk7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICByZXR1cm4ge3R5cGU6IEFUXzQ5MywgdmFsdWU6IFwiQFwiLCBzbGljZTogc2xpY2V9O1xuICAgIH1cbiAgICBsZXQgbG9va2FoZWFkXzYxNyA9IHN1cGVyLmFkdmFuY2UoKTtcbiAgICBpZiAobG9va2FoZWFkXzYxNy50eXBlID09PSBUb2tlblR5cGUuRElWICYmIGlzUmVnZXhQcmVmaXhfNTQ2KGJfNjE0KShwcmVmaXhfNjEzKSkge1xuICAgICAgcmV0dXJuIHN1cGVyLnNjYW5SZWdFeHAoXCIvXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbG9va2FoZWFkXzYxNztcbiAgfVxuICBzY2FuVGVtcGxhdGVFbGVtZW50KCkge1xuICAgIGxldCBzdGFydExvY2F0aW9uXzYxOCA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICBsZXQgc3RhcnRfNjE5ID0gdGhpcy5pbmRleDtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuc291cmNlLmxlbmd0aCkge1xuICAgICAgbGV0IGNoID0gdGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KTtcbiAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSA5NjpcbiAgICAgICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0XzYxOSwgc3RhcnRMb2NhdGlvbl82MTgpO1xuICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5URU1QTEFURSwgdGFpbDogdHJ1ZSwgaW50ZXJwOiBmYWxzZSwgc2xpY2U6IHNsaWNlfTtcbiAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4ICsgMSkgPT09IDEyMykge1xuICAgICAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydF82MTksIHN0YXJ0TG9jYXRpb25fNjE4KTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLlRFTVBMQVRFLCB0YWlsOiBmYWxzZSwgaW50ZXJwOiB0cnVlLCBzbGljZTogc2xpY2V9O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgbGV0IG9jdGFsID0gdGhpcy5zY2FuU3RyaW5nRXNjYXBlKFwiXCIsIG51bGwpWzFdO1xuICAgICAgICAgICAgaWYgKG9jdGFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVJTExFR0FMKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUlMTEVHQUwoKTtcbiAgfVxufVxuIl19