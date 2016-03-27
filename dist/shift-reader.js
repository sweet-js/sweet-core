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

var Just_443 = _ramdaFantasy.Maybe.Just;
var Nothing_444 = _ramdaFantasy.Maybe.Nothing;

var LSYNTAX_445 = { name: "left-syntax" };
var RSYNTAX_446 = { name: "right-syntax" };
var literalKeywords_447 = ["this", "null", "true", "false"];
var isLeftBracket_448 = R.whereEq({ type: _tokenizer.TokenType.LBRACK });
var isLeftBrace_449 = R.whereEq({ type: _tokenizer.TokenType.LBRACE });
var isLeftParen_450 = R.whereEq({ type: _tokenizer.TokenType.LPAREN });
var isRightBracket_451 = R.whereEq({ type: _tokenizer.TokenType.RBRACK });
var isRightBrace_452 = R.whereEq({ type: _tokenizer.TokenType.RBRACE });
var isRightParen_453 = R.whereEq({ type: _tokenizer.TokenType.RPAREN });
var isEOS_454 = R.whereEq({ type: _tokenizer.TokenType.EOS });
var isHash_455 = R.whereEq({ type: _tokenizer.TokenType.IDENTIFIER, value: "#" });
var isLeftSyntax_456 = R.whereEq({ type: LSYNTAX_445 });
var isRightSyntax_457 = R.whereEq({ type: RSYNTAX_446 });
var isLeftDelimiter_458 = R.anyPass([isLeftBracket_448, isLeftBrace_449, isLeftParen_450, isLeftSyntax_456]);
var isRightDelimiter_459 = R.anyPass([isRightBracket_451, isRightBrace_452, isRightParen_453, isRightSyntax_457]);
var isMatchingDelimiters_460 = R.cond([[isLeftBracket_448, function (_, b) {
  return isRightBracket_451(b);
}], [isLeftBrace_449, function (_, b) {
  return isRightBrace_452(b);
}], [isLeftParen_450, function (_, b) {
  return isRightParen_453(b);
}], [isLeftSyntax_456, function (_, b) {
  return isRightSyntax_457(b);
}], [R.T, R.F]]);
var assignOps_461 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
var binaryOps_462 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
var unaryOps_463 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
var isEmpty_464 = R.whereEq({ size: 0 });
var isPunctuator_465 = function isPunctuator_465(s) {
  return s.isPunctuator();
};
var isKeyword_466 = function isKeyword_466(s) {
  return s.isKeyword();
};
var isDelimiter_467 = function isDelimiter_467(s) {
  return s.isDelimiter();
};
var isParens_468 = function isParens_468(s) {
  return s.isParens();
};
var isBraces_469 = function isBraces_469(s) {
  return s.isBraces();
};
var isBrackets_470 = function isBrackets_470(s) {
  return s.isBrackets();
};
var isIdentifier_471 = function isIdentifier_471(s) {
  return s.isIdentifier();
};
var val_472 = function val_472(s) {
  return s.val();
};
var isVal_473 = R.curry(function (v, s) {
  return s.val() === v;
});
var isDot_474 = R.allPass([isPunctuator_465, isVal_473(".")]);
var isColon_475 = R.allPass([isPunctuator_465, isVal_473(":")]);
var isFunctionKeyword_476 = R.allPass([isKeyword_466, isVal_473("function")]);
var isOperator_477 = function isOperator_477(s) {
  return (s.isPunctuator() || s.isKeyword()) && R.any(R.equals(s.val()), assignOps_461.concat(binaryOps_462).concat(unaryOps_463));
};
var isNonLiteralKeyword_478 = R.allPass([isKeyword_466, function (s) {
  return R.none(R.equals(s.val()), literalKeywords_447);
}]);
var isKeywordExprPrefix_479 = R.allPass([isKeyword_466, function (s) {
  return R.any(R.equals(s.val()), ["instanceof", "typeof", "delete", "void", "yield", "throw", "new", "case"]);
}]);
var last_480 = function last_480(p) {
  return p.last();
};
var safeLast_481 = R.pipe(R.cond([[isEmpty_464, R.always(Nothing_444())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last_480)]]));
var stuffTrue_482 = R.curry(function (p, b) {
  return b ? Just_443(p) : Nothing_444();
});
var stuffFalse_483 = R.curry(function (p, b) {
  return !b ? Just_443(p) : Nothing_444();
});
var isTopColon_484 = R.pipe(safeLast_481, R.map(isColon_475), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopPunctuator_485 = R.pipe(safeLast_481, R.map(isPunctuator_465), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprReturn_486 = R.curry(function (l, p) {
  var retKwd_501 = safeLast_481(p);
  var maybeDot_502 = pop_497(p).chain(safeLast_481);
  if (maybeDot_502.map(isDot_474).getOrElse(false)) {
    return true;
  }
  return retKwd_501.map(function (s) {
    return s.isKeyword() && s.val() === "return" && s.lineNumber() === l;
  }).getOrElse(false);
});
var isTopOperator_487 = R.pipe(safeLast_481, R.map(isOperator_477), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isTopKeywordExprPrefix_488 = R.pipe(safeLast_481, R.map(isKeywordExprPrefix_479), _ramdaFantasy.Maybe.maybe(false, R.identity));
var isExprPrefix_489 = R.curry(function (l, b) {
  return R.cond([[isEmpty_464, R.always(b)], [isTopColon_484, R.always(b)], [isTopKeywordExprPrefix_488, R.T], [isTopOperator_487, R.T], [isTopPunctuator_485, R.always(b)], [isExprReturn_486(l), R.T], [R.T, R.F]]);
});
var curly_490 = function curly_490(p) {
  return safeLast_481(p).map(isBraces_469).chain(stuffTrue_482(p));
};
var paren_491 = function paren_491(p) {
  return safeLast_481(p).map(isParens_468).chain(stuffTrue_482(p));
};
var func_492 = function func_492(p) {
  return safeLast_481(p).map(isFunctionKeyword_476).chain(stuffTrue_482(p));
};
var ident_493 = function ident_493(p) {
  return safeLast_481(p).map(isIdentifier_471).chain(stuffTrue_482(p));
};
var nonLiteralKeyword_494 = function nonLiteralKeyword_494(p) {
  return safeLast_481(p).map(isNonLiteralKeyword_478).chain(stuffTrue_482(p));
};
var opt_495 = R.curry(function (a, b, p) {
  var result_503 = R.pipeK(a, b)(_ramdaFantasy.Maybe.of(p));
  return _ramdaFantasy.Maybe.isJust(result_503) ? result_503 : _ramdaFantasy.Maybe.of(p);
});
var notDot_496 = R.ifElse(R.whereEq({ size: 0 }), Just_443, function (p) {
  return safeLast_481(p).map(function (s) {
    return !(s.isPunctuator() && s.val() === ".");
  }).chain(stuffTrue_482(p));
});
var pop_497 = R.compose(Just_443, function (p) {
  return p.pop();
});
var functionPrefix_498 = R.pipeK(curly_490, pop_497, paren_491, pop_497, opt_495(ident_493, pop_497), func_492);
var isRegexPrefix_499 = function isRegexPrefix_499(b) {
  return R.anyPass([isEmpty_464, isTopPunctuator_485, R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword_494, pop_497, notDot_496), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren_491, pop_497, nonLiteralKeyword_494, pop_497, notDot_496), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_498, R.chain(function (p) {
    return safeLast_481(p).map(function (s) {
      return s.lineNumber();
    }).chain(function (fnLine) {
      return pop_497(p).map(isExprPrefix_489(fnLine, b));
    }).chain(stuffFalse_483(p));
  }), _ramdaFantasy.Maybe.isJust), function (p) {
    var isCurly_504 = _ramdaFantasy.Maybe.isJust(safeLast_481(p).map(isBraces_469));
    var alreadyCheckedFunction_505 = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_498, _ramdaFantasy.Maybe.isJust)(p);
    if (alreadyCheckedFunction_505) {
      return false;
    }
    return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly_490), R.chain(function (p) {
      return safeLast_481(p).map(function (s) {
        return s.lineNumber();
      }).chain(function (curlyLine) {
        return pop_497(p).map(isExprPrefix_489(curlyLine, b));
      }).chain(stuffFalse_483(p));
    }), _ramdaFantasy.Maybe.isJust)(p);
  }]);
};
function lastEl_500(l_506) {
  return l_506[l_506.length - 1];
}

var Reader = function (_Tokenizer) {
  _inherits(Reader, _Tokenizer);

  function Reader(strings_507, context_508, replacements_509) {
    _classCallCheck(this, Reader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Reader).call(this, Array.isArray(strings_507) ? strings_507.join("") : strings_507));

    _this.delimStack = new Map();
    _this.insideSyntaxTemplate = [false];
    _this.context = context_508;
    if (Array.isArray(strings_507)) {
      (function () {
        var totalIndex = 0;
        _this.replacementIndex = R.reduce(function (acc, strRep) {
          acc.push({ index: totalIndex + strRep[0].length, replacement: strRep[1] });
          totalIndex += strRep[0].length;
          return acc;
        }, [], R.zip(strings_507, replacements_509));
      })();
    }
    return _this;
  }

  _createClass(Reader, [{
    key: "read",
    value: function read() {
      var stack_510 = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var b_511 = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var singleDelimiter_512 = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var prefix_513 = (0, _immutable.List)();
      while (true) {
        var tok = this.advance(prefix_513, b_511);
        if (tok instanceof _syntax2.default || tok instanceof _terms2.default) {
          stack_510.push(tok);
          continue;
        }
        if (Array.isArray(tok)) {
          Array.prototype.push.apply(stack_510, tok);
          continue;
        }
        if (_immutable.List.isList(tok)) {
          Array.prototype.push.apply(stack_510, tok.toArray());
          continue;
        }
        if (isEOS_454(tok)) {
          if (stack_510[0] && isLeftDelimiter_458(stack_510[0].token)) {
            throw this.createUnexpected(tok);
          }
          break;
        }
        if (isLeftDelimiter_458(tok)) {
          if (isLeftSyntax_456(tok)) {
            this.insideSyntaxTemplate.push(true);
          }
          var line = tok.slice.startLocation.line;
          var innerB = isLeftBrace_449(tok) ? isExprPrefix_489(line, b_511)(prefix_513) : true;
          var inner = this.read([new _syntax2.default(tok)], innerB, false);
          var stx = new _syntax2.default(inner, this.context);
          prefix_513 = prefix_513.concat(stx);
          stack_510.push(stx);
          if (singleDelimiter_512) {
            break;
          }
        } else if (isRightDelimiter_459(tok)) {
          if (stack_510[0] && !isMatchingDelimiters_460(stack_510[0].token, tok)) {
            throw this.createUnexpected(tok);
          }
          var _stx = new _syntax2.default(tok, this.context);
          stack_510.push(_stx);
          if (lastEl_500(this.insideSyntaxTemplate) && isRightSyntax_457(tok)) {
            this.insideSyntaxTemplate.pop();
          }
          break;
        } else {
          var _stx2 = new _syntax2.default(tok, this.context);
          prefix_513 = prefix_513.concat(_stx2);
          stack_510.push(_stx2);
        }
      }
      return (0, _immutable.List)(stack_510);
    }
  }, {
    key: "advance",
    value: function advance(prefix_514, b_515) {
      var startLocation_516 = this.getLocation();
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
      var charCode_517 = this.source.charCodeAt(this.index);
      if (charCode_517 === 96) {
        var element = void 0,
            items = [];
        var _startLocation_ = this.getLocation();
        var start = this.index;
        this.index++;
        if (lastEl_500(this.insideSyntaxTemplate)) {
          var slice = this.getSlice(start, _startLocation_);
          return { type: RSYNTAX_446, value: "`", slice: slice };
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
      } else if (charCode_517 === 35) {
        var _startLocation_2 = this.getLocation();
        var _start = this.index;
        var _slice = this.getSlice(_start, _startLocation_2);
        this.index++;
        if (this.source.charCodeAt(this.index) === 96) {
          this.index++;
          return { type: LSYNTAX_445, value: "#`", slice: _slice };
        }
        return { type: _tokenizer.TokenType.IDENTIFIER, value: "#", slice: _slice };
      }
      var lookahead_518 = _get(Object.getPrototypeOf(Reader.prototype), "advance", this).call(this);
      if (lookahead_518.type === _tokenizer.TokenType.DIV && isRegexPrefix_499(b_515)(prefix_514)) {
        return _get(Object.getPrototypeOf(Reader.prototype), "scanRegExp", this).call(this, "/");
      }
      return lookahead_518;
    }
  }, {
    key: "scanTemplateElement",
    value: function scanTemplateElement() {
      var startLocation_519 = this.getLocation();
      var start_520 = this.index;
      while (this.index < this.source.length) {
        var ch = this.source.charCodeAt(this.index);
        switch (ch) {
          case 96:
            var slice = this.getSlice(start_520, startLocation_519);
            this.index++;
            return { type: _tokenizer.TokenType.TEMPLATE, tail: true, interp: false, slice: slice };
          case 36:
            if (this.source.charCodeAt(this.index + 1) === 123) {
              var _slice2 = this.getSlice(start_520, startLocation_519);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3NoaWZ0LXJlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOztJQUFhOztBQUNiOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7OztBQUZBLElBQU0sV0FBVyxvQkFBTSxJQUFOO0FBQ2pCLElBQU0sY0FBYyxvQkFBTSxPQUFOOztBQUVwQixJQUFNLGNBQWMsRUFBQyxNQUFNLGFBQU4sRUFBZjtBQUNOLElBQU0sY0FBYyxFQUFDLE1BQU0sY0FBTixFQUFmO0FBQ04sSUFBTSxzQkFBc0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixPQUF6QixDQUF0QjtBQUNOLElBQU0sb0JBQW9CLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFWLEVBQWpCLENBQXBCO0FBQ04sSUFBTSxrQkFBa0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBakIsQ0FBbEI7QUFDTixJQUFNLGtCQUFrQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBVixFQUFqQixDQUFsQjtBQUNOLElBQU0scUJBQXFCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxNQUFWLEVBQWpCLENBQXJCO0FBQ04sSUFBTSxtQkFBbUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBakIsQ0FBbkI7QUFDTixJQUFNLG1CQUFtQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsTUFBVixFQUFqQixDQUFuQjtBQUNOLElBQU0sWUFBWSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0scUJBQVUsR0FBVixFQUFqQixDQUFaO0FBQ04sSUFBTSxhQUFhLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBVSxVQUFWLEVBQXNCLE9BQU8sR0FBUCxFQUF2QyxDQUFiO0FBQ04sSUFBTSxtQkFBbUIsRUFBRSxPQUFGLENB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QUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEtBQUssS0FBTCxHQUFhLENBQWIsQ0FBdkIsS0FBMkMsR0FBM0MsRUFBZ0Q7QUFDbEQsa0JBQUksVUFBUSxLQUFLLFFBQUwsQ0FBYyxTQUFkLEVBQXlCLGlCQUF6QixDQUFSLENBRDhDO0FBRWxELG1CQUFLLEtBQUwsSUFBYyxDQUFkLENBRmtEO0FBR2xELHFCQUFPLEVBQUMsTUFBTSxxQkFBVSxRQUFWLEVBQW9CLE1BQU0sS0FBTixFQUFhLFFBQVEsSUFBUixFQUFjLE9BQU8sT0FBUCxFQUE3RCxDQUhrRDthQUFwRDtBQUtBLGlCQUFLLEtBQUwsR0FORjtBQU9FLGtCQVBGO0FBTEYsZUFhTyxFQUFMO0FBQ0U7QUFDRSxrQkFBSSxRQUFRLEtBQUssZ0JBQUwsQ0FBc0IsRUFBdEIsRUFBMEIsSUFBMUIsRUFBZ0MsQ0FBaEMsQ0FBUixDQUROO0FBRUUsa0JBQUksU0FBUyxJQUFULEVBQWU7QUFDakIsc0JBQU0sS0FBSyxhQUFMLEVBQU4sQ0FEaUI7ZUFBbkI7QUFHQSxvQkFMRjthQURGO0FBYkY7QUFzQkksaUJBQUssS0FBTCxHQURGO0FBckJGLFNBRnNDO09BQXhDO0FBMkJBLFlBQU0sS0FBSyxhQUFMLEVBQU4sQ0E5Qm9COzs7O1NBdkhIIiwiZmlsZSI6InNoaWZ0LXJlYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUb2tlbml6ZXIgZnJvbSBcInNoaWZ0LXBhcnNlci9kaXN0L3Rva2VuaXplclwiO1xuaW1wb3J0IHtUb2tlbkNsYXNzLCBUb2tlblR5cGV9IGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCAgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmNvbnN0IEp1c3RfNDQzID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNDQ0ID0gTWF5YmUuTm90aGluZztcbmltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5jb25zdCBMU1lOVEFYXzQ0NSA9IHtuYW1lOiBcImxlZnQtc3ludGF4XCJ9O1xuY29uc3QgUlNZTlRBWF80NDYgPSB7bmFtZTogXCJyaWdodC1zeW50YXhcIn07XG5jb25zdCBsaXRlcmFsS2V5d29yZHNfNDQ3ID0gW1widGhpc1wiLCBcIm51bGxcIiwgXCJ0cnVlXCIsIFwiZmFsc2VcIl07XG5jb25zdCBpc0xlZnRCcmFja2V0XzQ0OCA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLkxCUkFDS30pO1xuY29uc3QgaXNMZWZ0QnJhY2VfNDQ5ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFfSk7XG5jb25zdCBpc0xlZnRQYXJlbl80NTAgPSBSLndoZXJlRXEoe3R5cGU6IFRva2VuVHlwZS5MUEFSRU59KTtcbmNvbnN0IGlzUmlnaHRCcmFja2V0XzQ1MSA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLlJCUkFDS30pO1xuY29uc3QgaXNSaWdodEJyYWNlXzQ1MiA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLlJCUkFDRX0pO1xuY29uc3QgaXNSaWdodFBhcmVuXzQ1MyA9IFIud2hlcmVFcSh7dHlwZTogVG9rZW5UeXBlLlJQQVJFTn0pO1xuY29uc3QgaXNFT1NfNDU0ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuRU9TfSk7XG5jb25zdCBpc0hhc2hfNDU1ID0gUi53aGVyZUVxKHt0eXBlOiBUb2tlblR5cGUuSURFTlRJRklFUiwgdmFsdWU6IFwiI1wifSk7XG5jb25zdCBpc0xlZnRTeW50YXhfNDU2ID0gUi53aGVyZUVxKHt0eXBlOiBMU1lOVEFYXzQ0NX0pO1xuY29uc3QgaXNSaWdodFN5bnRheF80NTcgPSBSLndoZXJlRXEoe3R5cGU6IFJTWU5UQVhfNDQ2fSk7XG5jb25zdCBpc0xlZnREZWxpbWl0ZXJfNDU4ID0gUi5hbnlQYXNzKFtpc0xlZnRCcmFja2V0XzQ0OCwgaXNMZWZ0QnJhY2VfNDQ5LCBpc0xlZnRQYXJlbl80NTAsIGlzTGVmdFN5bnRheF80NTZdKTtcbmNvbnN0IGlzUmlnaHREZWxpbWl0ZXJfNDU5ID0gUi5hbnlQYXNzKFtpc1JpZ2h0QnJhY2tldF80NTEsIGlzUmlnaHRCcmFjZV80NTIsIGlzUmlnaHRQYXJlbl80NTMsIGlzUmlnaHRTeW50YXhfNDU3XSk7XG5jb25zdCBpc01hdGNoaW5nRGVsaW1pdGVyc180NjAgPSBSLmNvbmQoW1tpc0xlZnRCcmFja2V0XzQ0OCwgKF8sIGIpID0+IGlzUmlnaHRCcmFja2V0XzQ1MShiKV0sIFtpc0xlZnRCcmFjZV80NDksIChfLCBiKSA9PiBpc1JpZ2h0QnJhY2VfNDUyKGIpXSwgW2lzTGVmdFBhcmVuXzQ1MCwgKF8sIGIpID0+IGlzUmlnaHRQYXJlbl80NTMoYildLCBbaXNMZWZ0U3ludGF4XzQ1NiwgKF8sIGIpID0+IGlzUmlnaHRTeW50YXhfNDU3KGIpXSwgW1IuVCwgUi5GXV0pO1xuY29uc3QgYXNzaWduT3BzXzQ2MSA9IFtcIj1cIiwgXCIrPVwiLCBcIi09XCIsIFwiKj1cIiwgXCIvPVwiLCBcIiU9XCIsIFwiPDw9XCIsIFwiPj49XCIsIFwiPj4+PVwiLCBcIiY9XCIsIFwifD1cIiwgXCJePVwiLCBcIixcIl07XG5jb25zdCBiaW5hcnlPcHNfNDYyID0gW1wiK1wiLCBcIi1cIiwgXCIqXCIsIFwiL1wiLCBcIiVcIiwgXCI8PFwiLCBcIj4+XCIsIFwiPj4+XCIsIFwiJlwiLCBcInxcIiwgXCJeXCIsIFwiJiZcIiwgXCJ8fFwiLCBcIj9cIiwgXCI6XCIsIFwiPT09XCIsIFwiPT1cIiwgXCI+PVwiLCBcIjw9XCIsIFwiPFwiLCBcIj5cIiwgXCIhPVwiLCBcIiE9PVwiLCBcImluc3RhbmNlb2ZcIl07XG5jb25zdCB1bmFyeU9wc180NjMgPSBbXCIrK1wiLCBcIi0tXCIsIFwiflwiLCBcIiFcIiwgXCJkZWxldGVcIiwgXCJ2b2lkXCIsIFwidHlwZW9mXCIsIFwieWllbGRcIiwgXCJ0aHJvd1wiLCBcIm5ld1wiXTtcbmNvbnN0IGlzRW1wdHlfNDY0ID0gUi53aGVyZUVxKHtzaXplOiAwfSk7XG5jb25zdCBpc1B1bmN0dWF0b3JfNDY1ID0gcyA9PiBzLmlzUHVuY3R1YXRvcigpO1xuY29uc3QgaXNLZXl3b3JkXzQ2NiA9IHMgPT4gcy5pc0tleXdvcmQoKTtcbmNvbnN0IGlzRGVsaW1pdGVyXzQ2NyA9IHMgPT4gcy5pc0RlbGltaXRlcigpO1xuY29uc3QgaXNQYXJlbnNfNDY4ID0gcyA9PiBzLmlzUGFyZW5zKCk7XG5jb25zdCBpc0JyYWNlc180NjkgPSBzID0+IHMuaXNCcmFjZXMoKTtcbmNvbnN0IGlzQnJhY2tldHNfNDcwID0gcyA9PiBzLmlzQnJhY2tldHMoKTtcbmNvbnN0IGlzSWRlbnRpZmllcl80NzEgPSBzID0+IHMuaXNJZGVudGlmaWVyKCk7XG5jb25zdCB2YWxfNDcyID0gcyA9PiBzLnZhbCgpO1xuY29uc3QgaXNWYWxfNDczID0gUi5jdXJyeSgodiwgcykgPT4gcy52YWwoKSA9PT0gdik7XG5jb25zdCBpc0RvdF80NzQgPSBSLmFsbFBhc3MoW2lzUHVuY3R1YXRvcl80NjUsIGlzVmFsXzQ3MyhcIi5cIildKTtcbmNvbnN0IGlzQ29sb25fNDc1ID0gUi5hbGxQYXNzKFtpc1B1bmN0dWF0b3JfNDY1LCBpc1ZhbF80NzMoXCI6XCIpXSk7XG5jb25zdCBpc0Z1bmN0aW9uS2V5d29yZF80NzYgPSBSLmFsbFBhc3MoW2lzS2V5d29yZF80NjYsIGlzVmFsXzQ3MyhcImZ1bmN0aW9uXCIpXSk7XG5jb25zdCBpc09wZXJhdG9yXzQ3NyA9IHMgPT4gKHMuaXNQdW5jdHVhdG9yKCkgfHwgcy5pc0tleXdvcmQoKSkgJiYgUi5hbnkoUi5lcXVhbHMocy52YWwoKSksIGFzc2lnbk9wc180NjEuY29uY2F0KGJpbmFyeU9wc180NjIpLmNvbmNhdCh1bmFyeU9wc180NjMpKTtcbmNvbnN0IGlzTm9uTGl0ZXJhbEtleXdvcmRfNDc4ID0gUi5hbGxQYXNzKFtpc0tleXdvcmRfNDY2LCBzID0+IFIubm9uZShSLmVxdWFscyhzLnZhbCgpKSwgbGl0ZXJhbEtleXdvcmRzXzQ0NyldKTtcbmNvbnN0IGlzS2V5d29yZEV4cHJQcmVmaXhfNDc5ID0gUi5hbGxQYXNzKFtpc0tleXdvcmRfNDY2LCBzID0+IFIuYW55KFIuZXF1YWxzKHMudmFsKCkpLCBbXCJpbnN0YW5jZW9mXCIsIFwidHlwZW9mXCIsIFwiZGVsZXRlXCIsIFwidm9pZFwiLCBcInlpZWxkXCIsIFwidGhyb3dcIiwgXCJuZXdcIiwgXCJjYXNlXCJdKV0pO1xubGV0IGxhc3RfNDgwID0gcCA9PiBwLmxhc3QoKTtcbmxldCBzYWZlTGFzdF80ODEgPSBSLnBpcGUoUi5jb25kKFtbaXNFbXB0eV80NjQsIFIuYWx3YXlzKE5vdGhpbmdfNDQ0KCkpXSwgW1IuVCwgUi5jb21wb3NlKE1heWJlLm9mLCBsYXN0XzQ4MCldXSkpO1xubGV0IHN0dWZmVHJ1ZV80ODIgPSBSLmN1cnJ5KChwLCBiKSA9PiBiID8gSnVzdF80NDMocCkgOiBOb3RoaW5nXzQ0NCgpKTtcbmxldCBzdHVmZkZhbHNlXzQ4MyA9IFIuY3VycnkoKHAsIGIpID0+ICFiID8gSnVzdF80NDMocCkgOiBOb3RoaW5nXzQ0NCgpKTtcbmxldCBpc1RvcENvbG9uXzQ4NCA9IFIucGlwZShzYWZlTGFzdF80ODEsIFIubWFwKGlzQ29sb25fNDc1KSwgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpKTtcbmxldCBpc1RvcFB1bmN0dWF0b3JfNDg1ID0gUi5waXBlKHNhZmVMYXN0XzQ4MSwgUi5tYXAoaXNQdW5jdHVhdG9yXzQ2NSksIE1heWJlLm1heWJlKGZhbHNlLCBSLmlkZW50aXR5KSk7XG5sZXQgaXNFeHByUmV0dXJuXzQ4NiA9IFIuY3VycnkoKGwsIHApID0+IHtcbiAgbGV0IHJldEt3ZF81MDEgPSBzYWZlTGFzdF80ODEocCk7XG4gIGxldCBtYXliZURvdF81MDIgPSBwb3BfNDk3KHApLmNoYWluKHNhZmVMYXN0XzQ4MSk7XG4gIGlmIChtYXliZURvdF81MDIubWFwKGlzRG90XzQ3NCkuZ2V0T3JFbHNlKGZhbHNlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiByZXRLd2RfNTAxLm1hcChzID0+IHtcbiAgICByZXR1cm4gcy5pc0tleXdvcmQoKSAmJiBzLnZhbCgpID09PSBcInJldHVyblwiICYmIHMubGluZU51bWJlcigpID09PSBsO1xuICB9KS5nZXRPckVsc2UoZmFsc2UpO1xufSk7XG5jb25zdCBpc1RvcE9wZXJhdG9yXzQ4NyA9IFIucGlwZShzYWZlTGFzdF80ODEsIFIubWFwKGlzT3BlcmF0b3JfNDc3KSwgTWF5YmUubWF5YmUoZmFsc2UsIFIuaWRlbnRpdHkpKTtcbmNvbnN0IGlzVG9wS2V5d29yZEV4cHJQcmVmaXhfNDg4ID0gUi5waXBlKHNhZmVMYXN0XzQ4MSwgUi5tYXAoaXNLZXl3b3JkRXhwclByZWZpeF80NzkpLCBNYXliZS5tYXliZShmYWxzZSwgUi5pZGVudGl0eSkpO1xubGV0IGlzRXhwclByZWZpeF80ODkgPSBSLmN1cnJ5KChsLCBiKSA9PiBSLmNvbmQoW1tpc0VtcHR5XzQ2NCwgUi5hbHdheXMoYildLCBbaXNUb3BDb2xvbl80ODQsIFIuYWx3YXlzKGIpXSwgW2lzVG9wS2V5d29yZEV4cHJQcmVmaXhfNDg4LCBSLlRdLCBbaXNUb3BPcGVyYXRvcl80ODcsIFIuVF0sIFtpc1RvcFB1bmN0dWF0b3JfNDg1LCBSLmFsd2F5cyhiKV0sIFtpc0V4cHJSZXR1cm5fNDg2KGwpLCBSLlRdLCBbUi5ULCBSLkZdXSkpO1xubGV0IGN1cmx5XzQ5MCA9IHAgPT4gc2FmZUxhc3RfNDgxKHApLm1hcChpc0JyYWNlc180NjkpLmNoYWluKHN0dWZmVHJ1ZV80ODIocCkpO1xubGV0IHBhcmVuXzQ5MSA9IHAgPT4gc2FmZUxhc3RfNDgxKHApLm1hcChpc1BhcmVuc180NjgpLmNoYWluKHN0dWZmVHJ1ZV80ODIocCkpO1xubGV0IGZ1bmNfNDkyID0gcCA9PiBzYWZlTGFzdF80ODEocCkubWFwKGlzRnVuY3Rpb25LZXl3b3JkXzQ3NikuY2hhaW4oc3R1ZmZUcnVlXzQ4MihwKSk7XG5sZXQgaWRlbnRfNDkzID0gcCA9PiBzYWZlTGFzdF80ODEocCkubWFwKGlzSWRlbnRpZmllcl80NzEpLmNoYWluKHN0dWZmVHJ1ZV80ODIocCkpO1xubGV0IG5vbkxpdGVyYWxLZXl3b3JkXzQ5NCA9IHAgPT4gc2FmZUxhc3RfNDgxKHApLm1hcChpc05vbkxpdGVyYWxLZXl3b3JkXzQ3OCkuY2hhaW4oc3R1ZmZUcnVlXzQ4MihwKSk7XG5sZXQgb3B0XzQ5NSA9IFIuY3VycnkoKGEsIGIsIHApID0+IHtcbiAgbGV0IHJlc3VsdF81MDMgPSBSLnBpcGVLKGEsIGIpKE1heWJlLm9mKHApKTtcbiAgcmV0dXJuIE1heWJlLmlzSnVzdChyZXN1bHRfNTAzKSA/IHJlc3VsdF81MDMgOiBNYXliZS5vZihwKTtcbn0pO1xubGV0IG5vdERvdF80OTYgPSBSLmlmRWxzZShSLndoZXJlRXEoe3NpemU6IDB9KSwgSnVzdF80NDMsIHAgPT4gc2FmZUxhc3RfNDgxKHApLm1hcChzID0+ICEocy5pc1B1bmN0dWF0b3IoKSAmJiBzLnZhbCgpID09PSBcIi5cIikpLmNoYWluKHN0dWZmVHJ1ZV80ODIocCkpKTtcbmxldCBwb3BfNDk3ID0gUi5jb21wb3NlKEp1c3RfNDQzLCBwID0+IHAucG9wKCkpO1xuY29uc3QgZnVuY3Rpb25QcmVmaXhfNDk4ID0gUi5waXBlSyhjdXJseV80OTAsIHBvcF80OTcsIHBhcmVuXzQ5MSwgcG9wXzQ5Nywgb3B0XzQ5NShpZGVudF80OTMsIHBvcF80OTcpLCBmdW5jXzQ5Mik7XG5jb25zdCBpc1JlZ2V4UHJlZml4XzQ5OSA9IGIgPT4gUi5hbnlQYXNzKFtpc0VtcHR5XzQ2NCwgaXNUb3BQdW5jdHVhdG9yXzQ4NSwgUi5waXBlKE1heWJlLm9mLCBSLnBpcGVLKG5vbkxpdGVyYWxLZXl3b3JkXzQ5NCwgcG9wXzQ5Nywgbm90RG90XzQ5NiksIE1heWJlLmlzSnVzdCksIFIucGlwZShNYXliZS5vZiwgUi5waXBlSyhwYXJlbl80OTEsIHBvcF80OTcsIG5vbkxpdGVyYWxLZXl3b3JkXzQ5NCwgcG9wXzQ5Nywgbm90RG90XzQ5NiksIE1heWJlLmlzSnVzdCksIFIucGlwZShNYXliZS5vZiwgZnVuY3Rpb25QcmVmaXhfNDk4LCBSLmNoYWluKHAgPT4ge1xuICByZXR1cm4gc2FmZUxhc3RfNDgxKHApLm1hcChzID0+IHMubGluZU51bWJlcigpKS5jaGFpbihmbkxpbmUgPT4ge1xuICAgIHJldHVybiBwb3BfNDk3KHApLm1hcChpc0V4cHJQcmVmaXhfNDg5KGZuTGluZSwgYikpO1xuICB9KS5jaGFpbihzdHVmZkZhbHNlXzQ4MyhwKSk7XG59KSwgTWF5YmUuaXNKdXN0KSwgcCA9PiB7XG4gIGxldCBpc0N1cmx5XzUwNCA9IE1heWJlLmlzSnVzdChzYWZlTGFzdF80ODEocCkubWFwKGlzQnJhY2VzXzQ2OSkpO1xuICBsZXQgYWxyZWFkeUNoZWNrZWRGdW5jdGlvbl81MDUgPSBSLnBpcGUoTWF5YmUub2YsIGZ1bmN0aW9uUHJlZml4XzQ5OCwgTWF5YmUuaXNKdXN0KShwKTtcbiAgaWYgKGFscmVhZHlDaGVja2VkRnVuY3Rpb25fNTA1KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBSLnBpcGUoTWF5YmUub2YsIFIuY2hhaW4oY3VybHlfNDkwKSwgUi5jaGFpbihwID0+IHtcbiAgICByZXR1cm4gc2FmZUxhc3RfNDgxKHApLm1hcChzID0+IHMubGluZU51bWJlcigpKS5jaGFpbihjdXJseUxpbmUgPT4ge1xuICAgICAgcmV0dXJuIHBvcF80OTcocCkubWFwKGlzRXhwclByZWZpeF80ODkoY3VybHlMaW5lLCBiKSk7XG4gICAgfSkuY2hhaW4oc3R1ZmZGYWxzZV80ODMocCkpO1xuICB9KSwgTWF5YmUuaXNKdXN0KShwKTtcbn1dKTtcbmZ1bmN0aW9uIGxhc3RFbF81MDAobF81MDYpIHtcbiAgcmV0dXJuIGxfNTA2W2xfNTA2Lmxlbmd0aCAtIDFdO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhZGVyIGV4dGVuZHMgVG9rZW5pemVyIHtcbiAgY29uc3RydWN0b3Ioc3RyaW5nc181MDcsIGNvbnRleHRfNTA4LCByZXBsYWNlbWVudHNfNTA5KSB7XG4gICAgc3VwZXIoQXJyYXkuaXNBcnJheShzdHJpbmdzXzUwNykgPyBzdHJpbmdzXzUwNy5qb2luKFwiXCIpIDogc3RyaW5nc181MDcpO1xuICAgIHRoaXMuZGVsaW1TdGFjayA9IG5ldyBNYXA7XG4gICAgdGhpcy5pbnNpZGVTeW50YXhUZW1wbGF0ZSA9IFtmYWxzZV07XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF81MDg7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3RyaW5nc181MDcpKSB7XG4gICAgICBsZXQgdG90YWxJbmRleCA9IDA7XG4gICAgICB0aGlzLnJlcGxhY2VtZW50SW5kZXggPSBSLnJlZHVjZSgoYWNjLCBzdHJSZXApID0+IHtcbiAgICAgICAgYWNjLnB1c2goe2luZGV4OiB0b3RhbEluZGV4ICsgc3RyUmVwWzBdLmxlbmd0aCwgcmVwbGFjZW1lbnQ6IHN0clJlcFsxXX0pO1xuICAgICAgICB0b3RhbEluZGV4ICs9IHN0clJlcFswXS5sZW5ndGg7XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCBbXSwgUi56aXAoc3RyaW5nc181MDcsIHJlcGxhY2VtZW50c181MDkpKTtcbiAgICB9XG4gIH1cbiAgcmVhZChzdGFja181MTAgPSBbXSwgYl81MTEgPSBmYWxzZSwgc2luZ2xlRGVsaW1pdGVyXzUxMiA9IGZhbHNlKSB7XG4gICAgbGV0IHByZWZpeF81MTMgPSBMaXN0KCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCB0b2sgPSB0aGlzLmFkdmFuY2UocHJlZml4XzUxMywgYl81MTEpO1xuICAgICAgaWYgKHRvayBpbnN0YW5jZW9mIFN5bnRheCB8fCB0b2sgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICAgIHN0YWNrXzUxMC5wdXNoKHRvayk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodG9rKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzdGFja181MTAsIHRvayk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKExpc3QuaXNMaXN0KHRvaykpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoc3RhY2tfNTEwLCB0b2sudG9BcnJheSgpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoaXNFT1NfNDU0KHRvaykpIHtcbiAgICAgICAgaWYgKHN0YWNrXzUxMFswXSAmJiBpc0xlZnREZWxpbWl0ZXJfNDU4KHN0YWNrXzUxMFswXS50b2tlbikpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZVVuZXhwZWN0ZWQodG9rKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChpc0xlZnREZWxpbWl0ZXJfNDU4KHRvaykpIHtcbiAgICAgICAgaWYgKGlzTGVmdFN5bnRheF80NTYodG9rKSkge1xuICAgICAgICAgIHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUucHVzaCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGluZSA9IHRvay5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgICAgIGxldCBpbm5lckIgPSBpc0xlZnRCcmFjZV80NDkodG9rKSA/IGlzRXhwclByZWZpeF80ODkobGluZSwgYl81MTEpKHByZWZpeF81MTMpIDogdHJ1ZTtcbiAgICAgICAgbGV0IGlubmVyID0gdGhpcy5yZWFkKFtuZXcgU3ludGF4KHRvayldLCBpbm5lckIsIGZhbHNlKTtcbiAgICAgICAgbGV0IHN0eCA9IG5ldyBTeW50YXgoaW5uZXIsIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHByZWZpeF81MTMgPSBwcmVmaXhfNTEzLmNvbmNhdChzdHgpO1xuICAgICAgICBzdGFja181MTAucHVzaChzdHgpO1xuICAgICAgICBpZiAoc2luZ2xlRGVsaW1pdGVyXzUxMikge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzUmlnaHREZWxpbWl0ZXJfNDU5KHRvaykpIHtcbiAgICAgICAgaWYgKHN0YWNrXzUxMFswXSAmJiAhaXNNYXRjaGluZ0RlbGltaXRlcnNfNDYwKHN0YWNrXzUxMFswXS50b2tlbiwgdG9rKSkge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlVW5leHBlY3RlZCh0b2spO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdHggPSBuZXcgU3ludGF4KHRvaywgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgc3RhY2tfNTEwLnB1c2goc3R4KTtcbiAgICAgICAgaWYgKGxhc3RFbF81MDAodGhpcy5pbnNpZGVTeW50YXhUZW1wbGF0ZSkgJiYgaXNSaWdodFN5bnRheF80NTcodG9rKSkge1xuICAgICAgICAgIHRoaXMuaW5zaWRlU3ludGF4VGVtcGxhdGUucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgc3R4ID0gbmV3IFN5bnRheCh0b2ssIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHByZWZpeF81MTMgPSBwcmVmaXhfNTEzLmNvbmNhdChzdHgpO1xuICAgICAgICBzdGFja181MTAucHVzaChzdHgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTGlzdChzdGFja181MTApO1xuICB9XG4gIGFkdmFuY2UocHJlZml4XzUxNCwgYl81MTUpIHtcbiAgICBsZXQgc3RhcnRMb2NhdGlvbl81MTYgPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgdGhpcy5sYXN0SW5kZXggPSB0aGlzLmluZGV4O1xuICAgIHRoaXMubGFzdExpbmUgPSB0aGlzLmxpbmU7XG4gICAgdGhpcy5sYXN0TGluZVN0YXJ0ID0gdGhpcy5saW5lU3RhcnQ7XG4gICAgdGhpcy5za2lwQ29tbWVudCgpO1xuICAgIHRoaXMuc3RhcnRJbmRleCA9IHRoaXMuaW5kZXg7XG4gICAgdGhpcy5zdGFydExpbmUgPSB0aGlzLmxpbmU7XG4gICAgdGhpcy5zdGFydExpbmVTdGFydCA9IHRoaXMubGluZVN0YXJ0O1xuICAgIGlmICh0aGlzLnJlcGxhY2VtZW50SW5kZXggJiYgdGhpcy5yZXBsYWNlbWVudEluZGV4WzBdICYmIHRoaXMuaW5kZXggPj0gdGhpcy5yZXBsYWNlbWVudEluZGV4WzBdLmluZGV4KSB7XG4gICAgICBsZXQgcmVwID0gdGhpcy5yZXBsYWNlbWVudEluZGV4WzBdLnJlcGxhY2VtZW50O1xuICAgICAgdGhpcy5yZXBsYWNlbWVudEluZGV4LnNoaWZ0KCk7XG4gICAgICByZXR1cm4gcmVwO1xuICAgIH1cbiAgICBsZXQgY2hhckNvZGVfNTE3ID0gdGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KTtcbiAgICBpZiAoY2hhckNvZGVfNTE3ID09PSA5Nikge1xuICAgICAgbGV0IGVsZW1lbnQsIGl0ZW1zID0gW107XG4gICAgICBsZXQgc3RhcnRMb2NhdGlvbl81MTYgPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgaWYgKGxhc3RFbF81MDAodGhpcy5pbnNpZGVTeW50YXhUZW1wbGF0ZSkpIHtcbiAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydCwgc3RhcnRMb2NhdGlvbl81MTYpO1xuICAgICAgICByZXR1cm4ge3R5cGU6IFJTWU5UQVhfNDQ2LCB2YWx1ZTogXCJgXCIsIHNsaWNlOiBzbGljZX07XG4gICAgICB9XG4gICAgICBkbyB7XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLnNjYW5UZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgaXRlbXMucHVzaChlbGVtZW50KTtcbiAgICAgICAgaWYgKGVsZW1lbnQuaW50ZXJwKSB7XG4gICAgICAgICAgZWxlbWVudCA9IHRoaXMucmVhZChbXSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIGFzc2VydChlbGVtZW50LnNpemUgPT09IDEsIFwic2hvdWxkIG9ubHkgaGF2ZSByZWFkIGEgc2luZ2xlIGRlbGltaXRlciBpbnNpZGUgYSB0ZW1wbGF0ZVwiKTtcbiAgICAgICAgICBpdGVtcy5wdXNoKGVsZW1lbnQuZ2V0KDApKTtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoIWVsZW1lbnQudGFpbCk7XG4gICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5URU1QTEFURSwgaXRlbXM6IExpc3QoaXRlbXMpfTtcbiAgICB9IGVsc2UgaWYgKGNoYXJDb2RlXzUxNyA9PT0gMzUpIHtcbiAgICAgIGxldCBzdGFydExvY2F0aW9uXzUxNiA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0LCBzdGFydExvY2F0aW9uXzUxNik7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KSA9PT0gOTYpIHtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICByZXR1cm4ge3R5cGU6IExTWU5UQVhfNDQ1LCB2YWx1ZTogXCIjYFwiLCBzbGljZTogc2xpY2V9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuSURFTlRJRklFUiwgdmFsdWU6IFwiI1wiLCBzbGljZTogc2xpY2V9O1xuICAgIH1cbiAgICBsZXQgbG9va2FoZWFkXzUxOCA9IHN1cGVyLmFkdmFuY2UoKTtcbiAgICBpZiAobG9va2FoZWFkXzUxOC50eXBlID09PSBUb2tlblR5cGUuRElWICYmIGlzUmVnZXhQcmVmaXhfNDk5KGJfNTE1KShwcmVmaXhfNTE0KSkge1xuICAgICAgcmV0dXJuIHN1cGVyLnNjYW5SZWdFeHAoXCIvXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbG9va2FoZWFkXzUxODtcbiAgfVxuICBzY2FuVGVtcGxhdGVFbGVtZW50KCkge1xuICAgIGxldCBzdGFydExvY2F0aW9uXzUxOSA9IHRoaXMuZ2V0TG9jYXRpb24oKTtcbiAgICBsZXQgc3RhcnRfNTIwID0gdGhpcy5pbmRleDtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuc291cmNlLmxlbmd0aCkge1xuICAgICAgbGV0IGNoID0gdGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4KTtcbiAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSA5NjpcbiAgICAgICAgICBsZXQgc2xpY2UgPSB0aGlzLmdldFNsaWNlKHN0YXJ0XzUyMCwgc3RhcnRMb2NhdGlvbl81MTkpO1xuICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5URU1QTEFURSwgdGFpbDogdHJ1ZSwgaW50ZXJwOiBmYWxzZSwgc2xpY2U6IHNsaWNlfTtcbiAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICBpZiAodGhpcy5zb3VyY2UuY2hhckNvZGVBdCh0aGlzLmluZGV4ICsgMSkgPT09IDEyMykge1xuICAgICAgICAgICAgbGV0IHNsaWNlID0gdGhpcy5nZXRTbGljZShzdGFydF81MjAsIHN0YXJ0TG9jYXRpb25fNTE5KTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLlRFTVBMQVRFLCB0YWlsOiBmYWxzZSwgaW50ZXJwOiB0cnVlLCBzbGljZTogc2xpY2V9O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgbGV0IG9jdGFsID0gdGhpcy5zY2FuU3RyaW5nRXNjYXBlKFwiXCIsIG51bGwpWzFdO1xuICAgICAgICAgICAgaWYgKG9jdGFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVJTExFR0FMKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUlMTEVHQUwoKTtcbiAgfVxufVxuIl19