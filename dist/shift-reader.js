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

const Just_596 = _ramdaFantasy.Maybe.Just;
const Nothing_597 = _ramdaFantasy.Maybe.Nothing;

const LSYNTAX_598 = { name: "left-syntax" };
const RSYNTAX_599 = { name: "right-syntax" };
const AT_600 = { klass: _tokenizer.TokenClass.Punctuator, name: "@" };
const literalKeywords_601 = ["this", "null", "true", "false"];
const isLeftBracket_602 = R.whereEq({ type: _tokenizer.TokenType.LBRACK });
const isLeftBrace_603 = R.whereEq({ type: _tokenizer.TokenType.LBRACE });
const isLeftParen_604 = R.whereEq({ type: _tokenizer.TokenType.LPAREN });
const isRightBracket_605 = R.whereEq({ type: _tokenizer.TokenType.RBRACK });
const isRightBrace_606 = R.whereEq({ type: _tokenizer.TokenType.RBRACE });
const isRightParen_607 = R.whereEq({ type: _tokenizer.TokenType.RPAREN });
const isEOS_608 = R.whereEq({ type: _tokenizer.TokenType.EOS });
const isHash_609 = R.whereEq({ type: _tokenizer.TokenType.IDENTIFIER, value: "#" });
const isLeftSyntax_610 = R.whereEq({ type: LSYNTAX_598 });
const isRightSyntax_611 = R.whereEq({ type: RSYNTAX_599 });
const isLeftDelimiter_612 = R.anyPass([isLeftBracket_602, isLeftBrace_603, isLeftParen_604, isLeftSyntax_610]);
const isRightDelimiter_613 = R.anyPass([isRightBracket_605, isRightBrace_606, isRightParen_607, isRightSyntax_611]);
const isMatchingDelimiters_614 = R.cond([[isLeftBracket_602, (__655, b_656) => isRightBracket_605(b_656)], [isLeftBrace_603, (__657, b_658) => isRightBrace_606(b_658)], [isLeftParen_604, (__659, b_660) => isRightParen_607(b_660)], [isLeftSyntax_610, (__661, b_662) => isRightSyntax_611(b_662)], [R.T, R.F]]);
const assignOps_615 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
const binaryOps_616 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
const unaryOps_617 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
const isEmpty_618 = R.whereEq({ size: 0 });
const isPunctuator_619 = s_663 => s_663.match("punctuator");
const isKeyword_620 = s_664 => s_664.match("keyword");
const isDelimiter_621 = s_665 => s_665.match("delimiter");
const isParens_622 = s_666 => s_666.match("parens");
const isBraces_623 = s_667 => s_667.match("braces");
const isBrackets_624 = s_668 => s_668.match("brackets");
const isIdentifier_625 = s_669 => s_669.match("identifier");
const val_626 = s_670 => s_670.val();
const isVal_627 = R.curry((v_671, s_672) => s_672.val() === v_671);
const isDot_628 = R.allPass([isPunctuator_619, isVal_627(".")]);
const isColon_629 = R.allPass([isPunctuator_619, isVal_627(":")]);
const isFunctionKeyword_630 = R.allPass([isKeyword_620, isVal_627("function")]);
const isOperator_631 = s_673 => (s_673.match("punctuator") || s_673.match("keyword")) && R.any(R.equals(s_673.val()), assignOps_615.concat(binaryOps_616).concat(unaryOps_617));
const isNonLiteralKeyword_632 = R.allPass([isKeyword_620, s_674 => R.none(R.equals(s_674.val()), literalKeywords_601)]);
const isKeywordExprPrefix_633 = R.allPass([isKeyword_620, s_675 => R.any(R.equals(s_675.val()), ["instanceof", "typeof", "delete", "void", "yield", "throw", "new", "case"])]);
let last_634 = p_676 => p_676.last();
let safeLast_635 = R.pipe(R.cond([[isEmpty_618, R.always(Nothing_597())], [R.T, R.compose(_ramdaFantasy.Maybe.of, last_634)]]));
let stuffTrue_636 = R.curry((p_677, b_678) => b_678 ? Just_596(p_677) : Nothing_597());
let stuffFalse_637 = R.curry((p_679, b_680) => !b_680 ? Just_596(p_679) : Nothing_597());
let isTopColon_638 = R.pipe(safeLast_635, R.map(isColon_629), _ramdaFantasy.Maybe.maybe(false, R.identity));
let isTopPunctuator_639 = R.pipe(safeLast_635, R.map(isPunctuator_619), _ramdaFantasy.Maybe.maybe(false, R.identity));
let isExprReturn_640 = R.curry((l_681, p_682) => {
  let retKwd_683 = safeLast_635(p_682);
  let maybeDot_684 = pop_651(p_682).chain(safeLast_635);
  if (maybeDot_684.map(isDot_628).getOrElse(false)) {
    return true;
  }
  return retKwd_683.map(s_685 => {
    return s_685.match("keyword") && s_685.val() === "return" && s_685.lineNumber() === l_681;
  }).getOrElse(false);
});
const isTopOperator_641 = R.pipe(safeLast_635, R.map(isOperator_631), _ramdaFantasy.Maybe.maybe(false, R.identity));
const isTopKeywordExprPrefix_642 = R.pipe(safeLast_635, R.map(isKeywordExprPrefix_633), _ramdaFantasy.Maybe.maybe(false, R.identity));
let isExprPrefix_643 = R.curry((l_686, b_687) => R.cond([[isEmpty_618, R.always(b_687)], [isTopColon_638, R.always(b_687)], [isTopKeywordExprPrefix_642, R.T], [isTopOperator_641, R.T], [isTopPunctuator_639, R.always(b_687)], [isExprReturn_640(l_686), R.T], [R.T, R.F]]));
let curly_644 = p_688 => safeLast_635(p_688).map(isBraces_623).chain(stuffTrue_636(p_688));
let paren_645 = p_689 => safeLast_635(p_689).map(isParens_622).chain(stuffTrue_636(p_689));
let func_646 = p_690 => safeLast_635(p_690).map(isFunctionKeyword_630).chain(stuffTrue_636(p_690));
let ident_647 = p_691 => safeLast_635(p_691).map(isIdentifier_625).chain(stuffTrue_636(p_691));
let nonLiteralKeyword_648 = p_692 => safeLast_635(p_692).map(isNonLiteralKeyword_632).chain(stuffTrue_636(p_692));
let opt_649 = R.curry((a_693, b_694, p_695) => {
  let result_696 = R.pipeK(a_693, b_694)(_ramdaFantasy.Maybe.of(p_695));
  return _ramdaFantasy.Maybe.isJust(result_696) ? result_696 : _ramdaFantasy.Maybe.of(p_695);
});
let notDot_650 = R.ifElse(R.whereEq({ size: 0 }), Just_596, p_697 => safeLast_635(p_697).map(s_698 => !(s_698.match("punctuator") && s_698.val() === ".")).chain(stuffTrue_636(p_697)));
let pop_651 = R.compose(Just_596, p_699 => p_699.pop());
const functionPrefix_652 = R.pipeK(curly_644, pop_651, paren_645, pop_651, opt_649(ident_647, pop_651), func_646);
const isRegexPrefix_653 = b_700 => R.anyPass([isEmpty_618, isTopPunctuator_639, R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(nonLiteralKeyword_648, pop_651, notDot_650), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, R.pipeK(paren_645, pop_651, nonLiteralKeyword_648, pop_651, notDot_650), _ramdaFantasy.Maybe.isJust), R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_652, R.chain(p_701 => {
  return safeLast_635(p_701).map(s_702 => s_702.lineNumber()).chain(fnLine_703 => {
    return pop_651(p_701).map(isExprPrefix_643(fnLine_703, b_700));
  }).chain(stuffFalse_637(p_701));
}), _ramdaFantasy.Maybe.isJust), p_704 => {
  let isCurly_705 = _ramdaFantasy.Maybe.isJust(safeLast_635(p_704).map(isBraces_623));
  let alreadyCheckedFunction_706 = R.pipe(_ramdaFantasy.Maybe.of, functionPrefix_652, _ramdaFantasy.Maybe.isJust)(p_704);
  if (alreadyCheckedFunction_706) {
    return false;
  }
  return R.pipe(_ramdaFantasy.Maybe.of, R.chain(curly_644), R.chain(p_707 => {
    return safeLast_635(p_707).map(s_708 => s_708.lineNumber()).chain(curlyLine_709 => {
      return pop_651(p_707).map(isExprPrefix_643(curlyLine_709, b_700));
    }).chain(stuffFalse_637(p_707));
  }), _ramdaFantasy.Maybe.isJust)(p_704);
}]);
function lastEl_654(l_710) {
  return l_710[l_710.length - 1];
}
class Reader extends _tokenizer2.default {
  constructor(strings_711, context_712, replacements_713) {
    super(Array.isArray(strings_711) ? strings_711.join("") : strings_711);
    this.delimStack = new Map();
    this.insideSyntaxTemplate = [false];
    this.context = context_712;
    if (Array.isArray(strings_711)) {
      let totalIndex = 0;
      this.replacementIndex = R.reduce((acc_714, strRep_715) => {
        acc_714.push({ index: totalIndex + strRep_715[0].length, replacement: strRep_715[1] });
        totalIndex += strRep_715[0].length;
        return acc_714;
      }, [], R.zip(strings_711, replacements_713));
    }
  }
  read() {
    let stack_716 = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    let b_717 = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    let singleDelimiter_718 = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    let prefix_719 = (0, _immutable.List)();
    while (true) {
      let tok = this.advance(prefix_719, b_717);
      if (tok instanceof _syntax2.default || tok instanceof _terms2.default) {
        stack_716.push(tok);
        continue;
      }
      if (Array.isArray(tok)) {
        Array.prototype.push.apply(stack_716, tok);
        continue;
      }
      if (_immutable.List.isList(tok)) {
        Array.prototype.push.apply(stack_716, tok.toArray());
        continue;
      }
      if (isEOS_608(tok)) {
        if (stack_716[0] && isLeftDelimiter_612(stack_716[0].token)) {
          throw this.createUnexpected(tok);
        }
        break;
      }
      if (isLeftDelimiter_612(tok)) {
        if (isLeftSyntax_610(tok)) {
          this.insideSyntaxTemplate.push(true);
        }
        let line = tok.slice.startLocation.line;
        let innerB = isLeftBrace_603(tok) ? isExprPrefix_643(line, b_717)(prefix_719) : true;
        let inner = this.read([new _syntax2.default(tok, this.context)], innerB, false);
        let stx = new _syntax2.default(inner, this.context);
        prefix_719 = prefix_719.concat(stx);
        stack_716.push(stx);
        if (singleDelimiter_718) {
          break;
        }
      } else if (isRightDelimiter_613(tok)) {
        if (stack_716[0] && !isMatchingDelimiters_614(stack_716[0].token, tok)) {
          throw this.createUnexpected(tok);
        }
        let stx = new _syntax2.default(tok, this.context);
        stack_716.push(stx);
        if (lastEl_654(this.insideSyntaxTemplate) && isRightSyntax_611(tok)) {
          this.insideSyntaxTemplate.pop();
        }
        break;
      } else {
        let stx = new _syntax2.default(tok, this.context);
        prefix_719 = prefix_719.concat(stx);
        stack_716.push(stx);
      }
    }
    return (0, _immutable.List)(stack_716);
  }
  advance(prefix_720, b_721) {
    let startLocation_722 = this.getLocation();
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
    let charCode_723 = this.source.charCodeAt(this.index);
    if (charCode_723 === 96) {
      let element,
          items = [];
      let startLocation_722 = this.getLocation();
      let start = this.index;
      this.index++;
      if (lastEl_654(this.insideSyntaxTemplate)) {
        let slice = this.getSlice(start, startLocation_722);
        return { type: RSYNTAX_599, value: "`", slice: slice };
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
    } else if (charCode_723 === 35) {
      let startLocation_722 = this.getLocation();
      let start = this.index;
      let slice = this.getSlice(start, startLocation_722);
      this.index++;
      if (this.source.charCodeAt(this.index) === 96) {
        this.index++;
        return { type: LSYNTAX_598, value: "#`", slice: slice };
      }
      return { type: _tokenizer.TokenType.IDENTIFIER, value: "#", slice: slice };
    } else if (charCode_723 === 64) {
      let startLocation_722 = this.getLocation();
      let start = this.index;
      let slice = this.getSlice(start, startLocation_722);
      this.index++;
      return { type: AT_600, value: "@", slice: slice };
    }
    let lookahead_724 = super.advance();
    if (lookahead_724.type === _tokenizer.TokenType.DIV && isRegexPrefix_653(b_721)(prefix_720)) {
      return super.scanRegExp("/");
    }
    return lookahead_724;
  }
  scanTemplateElement() {
    let startLocation_725 = this.getLocation();
    let start_726 = this.index;
    while (this.index < this.source.length) {
      let ch = this.source.charCodeAt(this.index);
      switch (ch) {
        case 96:
          let slice = this.getSlice(start_726, startLocation_725);
          this.index++;
          return { type: _tokenizer.TokenType.TEMPLATE, tail: true, interp: false, slice: slice };
        case 36:
          if (this.source.charCodeAt(this.index + 1) === 123) {
            let slice = this.getSlice(start_726, startLocation_725);
            this.index += 1;
            return { type: _tokenizer.TokenType.TEMPLATE, tail: false, interp: true, slice: slice };
          }
          this.index++;
          break;
        case 92:
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