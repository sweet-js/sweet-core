import Tokenizer from "shift-parser/dist/tokenizer";
import { TokenClass, TokenType } from "shift-parser/dist/tokenizer";
import { List } from "immutable";
import Syntax from "./syntax";
import * as R from 'ramda';
import { Maybe } from 'ramda-fantasy';
import { assert } from './errors';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;
import Term from './terms';

const LSYNTAX = { name: 'left-syntax' };
const RSYNTAX = { name: 'right-syntax' };


// TODO: also, need to handle contextual yield
const literalKeywords = ['this', 'null', 'true', 'false'];

// Token -> Boolean
const isLeftBracket  = R.whereEq({ type: TokenType.LBRACK });
const isLeftBrace    = R.whereEq({ type: TokenType.LBRACE });
const isLeftParen    = R.whereEq({ type: TokenType.LPAREN });
const isRightBracket = R.whereEq({ type: TokenType.RBRACK });
const isRightBrace   = R.whereEq({ type: TokenType.RBRACE });
const isRightParen   = R.whereEq({ type: TokenType.RPAREN });

const isEOS = R.whereEq({ type: TokenType.EOS });

const isHash = R.whereEq({ type: TokenType.IDENTIFIER, value: '#'});
const isLeftSyntax = R.whereEq({ type: LSYNTAX });
const isRightSyntax = R.whereEq({ type: RSYNTAX });

const isLeftDelimiter = R.anyPass([isLeftBracket,
                                   isLeftBrace,
                                   isLeftParen,
                                   isLeftSyntax]);

const isRightDelimiter = R.anyPass([isRightBracket,
                                    isRightBrace,
                                    isRightParen,
                                    isRightSyntax]);

const isMatchingDelimiters = R.cond([
  [isLeftBracket, (_, b) => isRightBracket(b)],
  [isLeftBrace, (_, b) => isRightBrace(b)],
  [isLeftParen, (_, b) => isRightParen(b)],
  [isLeftSyntax, (_, b) => isRightSyntax(b)],
  [R.T, R.F]
]);

const assignOps =  ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
                  "&=", "|=", "^=", ","];

const binaryOps = ["+", "-", "*", "/", "%","<<", ">>", ">>>", "&", "|", "^",
                 "&&", "||", "?", ":",
                 "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];

const unaryOps = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];

// List -> Boolean
const isEmpty = R.whereEq({size: 0});

// Syntax -> Boolean
const isPunctuator = s => s.isPunctuator();
const isKeyword = s => s.isKeyword();
const isDelimiter = s => s.isDelimiter();
const isParens = s => s.isParens();
const isBraces = s => s.isBraces();
const isBrackets = s => s.isBrackets();
const isIdentifier = s => s.isIdentifier();

// Syntax -> any
const val = s => s.val();
// Any -> Syntax -> Boolean
const isVal = R.curry((v, s) => s.val() === v);

// Syntax -> Boolean
const isDot = R.allPass([isPunctuator, isVal('.')]);
const isColon = R.allPass([isPunctuator, isVal(':')]);
const isFunctionKeyword = R.allPass([isKeyword, isVal('function')]);
const isOperator = s => (s.isPunctuator() || s.isKeyword()) &&
                          R.any(R.equals(s.val()),
                                assignOps.concat(binaryOps).concat(unaryOps));
const isNonLiteralKeyword = R.allPass([isKeyword,
                                       s => R.none(R.equals(s.val()), literalKeywords)]);
const isKeywordExprPrefix = R.allPass([isKeyword,
  s => R.any(R.equals(s.val()), ['instanceof', 'typeof', 'delete', 'void',
                                  'yield', 'throw', 'new', 'case'])]);
// List a -> a?
let last = p => p.last();
// List a -> Maybe a
let safeLast = R.pipe(R.cond([
  [isEmpty, R.always(Nothing())],
  [R.T, R.compose(Maybe.of, last)]
]));

// TODO: better name
// List -> Boolean -> Maybe List
let stuffTrue = R.curry((p, b) => b ? Just(p) : Nothing());
let stuffFalse = R.curry((p, b) => !b ? Just(p) : Nothing());

// List a -> Boolean
let isTopColon = R.pipe(
  safeLast,
  R.map(isColon),
  Maybe.maybe(false, R.identity)
);
// List a -> Boolean
let isTopPunctuator = R.pipe(
  safeLast,
  R.map(isPunctuator),
  Maybe.maybe(false, R.identity)
);

// Number -> List -> Boolean
let isExprReturn = R.curry((l, p) => {
  let retKwd = safeLast(p);
  let maybeDot = pop(p).chain(safeLast);

  if (maybeDot.map(isDot).getOrElse(false)) {
    return true;
  }
  return retKwd.map(s => {
    return s.isKeyword() && s.val() === 'return' && s.lineNumber() === l;
  }).getOrElse(false);
});

const isTopOperator = R.pipe(
  safeLast,
  R.map(isOperator),
  Maybe.maybe(false, R.identity)
);

const isTopKeywordExprPrefix = R.pipe(
  safeLast,
  R.map(isKeywordExprPrefix),
  Maybe.maybe(false, R.identity)
);

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
  [isExprReturn(l), R.T],
  [R.T, R.F],
]));

// List a -> Maybe List a
let curly = p => safeLast(p).map(isBraces).chain(stuffTrue(p));
let paren = p => safeLast(p).map(isParens).chain(stuffTrue(p));
let func = p => safeLast(p).map(isFunctionKeyword).chain(stuffTrue(p));
let ident = p => safeLast(p).map(isIdentifier).chain(stuffTrue(p));
let nonLiteralKeyword = p => safeLast(p).map(isNonLiteralKeyword).chain(stuffTrue(p));

let opt = R.curry((a, b, p) => {
  let result = R.pipeK(a, b)(Maybe.of(p));
  return Maybe.isJust(result) ? result : Maybe.of(p);
});

let notDot = R.ifElse(
  R.whereEq({size: 0}),
  Just,
  p => safeLast(p).map(s => !(s.isPunctuator() && s.val() === '.')).chain(stuffTrue(p))
);

// List a -> Maybe List a
let pop = R.compose(Just, p => p.pop());

// Maybe List a -> Maybe List a
const functionPrefix = R.pipeK(
    curly,
    pop,
    paren,
    pop,
    opt(ident, pop),
    func);

// Boolean -> List a -> Boolean
const isRegexPrefix = b => R.anyPass([
  // ε
  isEmpty,
  // P . t   where t ∈ Punctuator
  isTopPunctuator,
  // P . t . t'  where t \not = "." and t' ∈ (Keyword \setminus  LiteralKeyword)
  R.pipe(
    Maybe.of,
    R.pipeK(
      nonLiteralKeyword,
      pop,
      notDot
    ),
    Maybe.isJust
  ),
  // P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
  R.pipe(
    Maybe.of,
    R.pipeK(
      paren,
      pop,
      nonLiteralKeyword,
      pop,
      notDot
    ),
    Maybe.isJust
  ),
  // P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
  R.pipe(
    Maybe.of,
    functionPrefix,
    R.chain(p => {
        return safeLast(p)
          .map(s => s.lineNumber())
          .chain(fnLine => {
            return pop(p).map(isExprPrefix(fnLine, b));
          })
          .chain(stuffFalse(p));
      }
    ),
    Maybe.isJust
  ),
  // P . {T}^l  where isExprPrefix(P, b, l) = false
  p => {
    let isCurly = Maybe.isJust(safeLast(p).map(isBraces));
    let alreadyCheckedFunction = R.pipe(
      Maybe.of,
      functionPrefix,
      Maybe.isJust
    )(p);
    if (alreadyCheckedFunction) {
      return false;
    }
    return R.pipe(
      Maybe.of,
      R.chain(curly),
      R.chain(p => {
        return safeLast(p)
        .map(s => s.lineNumber())
        .chain(curlyLine => {
          return pop(p).map(isExprPrefix(curlyLine, b));
        })
        .chain(stuffFalse(p));
      }),
      Maybe.isJust
    )(p);
  }


]);

function lastEl(l) {
  return l[l.length - 1];
}

export default class Reader extends Tokenizer {
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

  read(stack = [], b = false, singleDelimiter = false) {
    let prefix = List();
    while (true) {
      let tok = this.advance(prefix, b);

      // splicing allows syntax and terms
      if (tok instanceof Syntax || tok instanceof Term) {
        stack.push(tok);
        continue;
      }
      if (Array.isArray(tok)) {
        Array.prototype.push.apply(stack, tok);
        continue;
      }
      if (List.isList(tok)) {
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
        let inner = this.read([new Syntax(tok)],
                              innerB,
                              false);
        let stx = new Syntax(inner, this.context);
        prefix = prefix.concat(stx);
        stack.push(stx);
        if (singleDelimiter) {
          break;
        }
      } else if (isRightDelimiter(tok)) {
        if (stack[0] && !isMatchingDelimiters(stack[0].token, tok)) {
          throw this.createUnexpected(tok);
        }
        let stx = new Syntax(tok, this.context);
        stack.push(stx);
        if (lastEl(this.insideSyntaxTemplate) && isRightSyntax(tok)) {
          this.insideSyntaxTemplate.pop();
        }
        break;
      } else {
        let stx = new Syntax(tok, this.context);
        prefix = prefix.concat(stx);
        stack.push(stx);
      }
    }
    return List(stack);
  }

  advance(prefix, b)/*: any */ {
    let startLocation = this.getLocation();

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

    if (charCode === 0x60) { // `
      let element, items = [];
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
          assert(element.size === 1, "should only have read a single delimiter inside a template");
          items.push(element.get(0));
        }
      } while (!element.tail);
      return {
        type: TokenType.TEMPLATE,
        items: List(items)
      };
    } else if (charCode === 35) { // #
      let startLocation = this.getLocation();
      let start = this.index;
      let slice = this.getSlice(start, startLocation);
      this.index++;
      // TODO: handle ` inside of syntax template interpolations
      if (this.source.charCodeAt(this.index) === 0x60) { // `
        this.index++;
        return {
          type: LSYNTAX,
          value: '#`',
          slice: slice
        };
      }
      return {
        type: TokenType.IDENTIFIER,
        value: '#',
        slice: slice
      };
    }

    let lookahead = super.advance();
    if (lookahead.type === TokenType.DIV && isRegexPrefix(b)(prefix)) {
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
        case 0x60:  // `
          // don't include the traling "`"
          let slice = this.getSlice(start, startLocation);
          this.index++;
          return {
            type: TokenType.TEMPLATE,
            tail: true,
            interp: false,
            slice: slice
          };
        case 0x24:  // $
          if (this.source.charCodeAt(this.index + 1) === 0x7B) {  // {
            // don't include the trailing "$"
            let slice = this.getSlice(start, startLocation);
            this.index += 1;
            return {
              type: TokenType.TEMPLATE,
              tail: false,
              interp: true,
              slice: slice
            };
          }
          this.index++;
          break;
        case 0x5C:  // \\
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
