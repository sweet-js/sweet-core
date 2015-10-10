import stampit from "stampit";
import { Cloneable, Frozen } from "./stamps";


var TokenName,
    FnExprTokens,
    Syntax,
    PropertyKind,
    Messages,
    Regex,
    SyntaxTreeDelegate,
    ClassPropertyType,
    source,
    strict,
    index,
    lineNumber,
    lineStart,
    sm_lineNumber,
    sm_lineStart,
    sm_range,
    sm_index,
    length,
    delegate,
    tokenStream,
    streamIndex,
    lookahead,
    lookaheadIndex,
    state,
    phase,
    extra;

export var Token = {
    BooleanLiteral: 1,
    EOF: 2,
    Identifier: 3,
    Keyword: 4,
    NullLiteral: 5,
    NumericLiteral: 6,
    Punctuator: 7,
    StringLiteral: 8,
    RegularExpression: 9,
    Template: 10,
    Delimiter: 11
};

const makeToken = stampit().init(({instance}) => {
    if (instance.type === Token.Delimiter) {
        // move the line info to an open and close property
        instance.openInfo = {};
        instance.closeInfo = {};

        instance.openInfo.lineNumber = instance.startLineNumber;
        instance.closeInfo.lineNumber = instance.endLineNumber;
        delete instance.startLineNumber;
        delete instance.endLineNumber;

        instance.openInfo.lineStart = instance.startLineStart;
        instance.closeInfo.lineStart = instance.endLineStart;
        delete instance.startLineStart;
        delete instance.endLineStart;

        instance.openInfo.range = instance.startRange;
        instance.closeInfo.range = instance.endRange;
        delete instance.startRange;
        delete instance.endRange;
    }
}).compose(Frozen);

TokenName = {};
TokenName[Token.BooleanLiteral] = 'Boolean';
TokenName[Token.EOF] = '<end>';
TokenName[Token.Identifier] = 'Identifier';
TokenName[Token.Keyword] = 'Keyword';
TokenName[Token.NullLiteral] = 'Null';
TokenName[Token.NumericLiteral] = 'Numeric';
TokenName[Token.Punctuator] = 'Punctuator';
TokenName[Token.StringLiteral] = 'String';
TokenName[Token.RegularExpression] = 'RegularExpression';
TokenName[Token.Delimiter] = 'Delimiter';

// A function following one of those tokens is an expression.
FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                'return', 'case', 'delete', 'throw', 'void',
                // assignment operators
                '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                '&=', '|=', '^=', ',',
                // binary/unary operators
                '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                '<=', '<', '>', '!=', '!=='];
Messages = {
    UnexpectedToken: 'Unexpected token %0',
    UnexpectedNumber: 'Unexpected number',
    UnexpectedString: 'Unexpected string',
    UnexpectedIdentifier: 'Unexpected identifier',
    UnexpectedReserved: 'Unexpected reserved word',
    UnexpectedTemplate: 'Unexpected quasi %0',
    UnexpectedEOS: 'Unexpected end of input',
    NewlineAfterThrow: 'Illegal newline after throw',
    InvalidRegExp: 'Invalid regular expression',
    UnterminatedRegExp: 'Invalid regular expression: missing /',
    InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
    InvalidLHSInForIn: 'Invalid left-hand side in for-in',
    InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
    MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
    NoCatchOrFinally: 'Missing catch or finally after try',
    UnknownLabel: 'Undefined label \'%0\'',
    Redeclaration: '%0 \'%1\' has already been declared',
    IllegalContinue: 'Illegal continue statement',
    IllegalBreak: 'Illegal break statement',
    IllegalReturn: 'Illegal return statement',
    StrictModeWith: 'Strict mode code may not include a with statement',
    StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
    StrictVarName: 'Variable name may not be eval or arguments in strict mode',
    StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
    StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
    StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
    StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
    StrictDelete: 'Delete of an unqualified identifier in strict mode.',
    StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
    StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
    StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
    StrictReservedWord: 'Use of future reserved word in strict mode',
    TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
    ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
    DefaultRestParameter: 'Unexpected token =',
    ObjectPatternAsRestParameter: 'Unexpected token {',
    DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
    ConstructorSpecialMethod: 'Class constructor may not be an accessor',
    DuplicateConstructor: 'A class may only have one constructor',
    StaticPrototype: 'Classes may not have static property named prototype',
    MissingFromClause: 'Unexpected token',
    NoAsAfterImportNamespace: 'Unexpected token',
    InvalidModuleSpecifier: 'Unexpected token',
    IllegalImportDeclaration: 'Unexpected token',
    IllegalExportDeclaration: 'Unexpected token',
    DuplicateBinding: 'Duplicate binding %0'
};

function constructError(msg, column) {
    var error = new Error(msg);
    try {
        throw error;
    } catch (base) {
        /* istanbul ignore else */
        if (Object.create && Object.defineProperty) {
            error = Object.create(base);
            Object.defineProperty(error, 'column', { value: column });
        }
    } finally {
        return error;
    }
}
function createError(line, pos, description) {
    var msg, column, error;

    msg = 'Line ' + line + ': ' + description;
    column = pos - lineStart + 1;
    error = constructError(msg, column);
    error.lineNumber = line;
    error.description = description;
    error.index = pos;
    return error;
}

function unexpectedTokenError(token, message) {
    var value, msg = message || Messages.UnexpectedToken;

    if (token) {
        if (!message) {
            msg = (token.type === Token.EOF) ? Messages.UnexpectedEOS :
                (token.type === Token.Identifier) ? Messages.UnexpectedIdentifier :
                (token.type === Token.NumericLiteral) ? Messages.UnexpectedNumber :
                (token.type === Token.StringLiteral) ? Messages.UnexpectedString :
                (token.type === Token.Template) ? Messages.UnexpectedTemplate :
                Messages.UnexpectedToken;

            if (token.type === Token.Keyword) {
                if (isFutureReservedWord(token.value)) {
                    msg = Messages.UnexpectedReserved;
                } else if (strict && isStrictModeReservedWord(token.value)) {
                    msg = Messages.StrictReservedWord;
                }
            }
        }

        value = (token.type === Token.Template) ? token.value.raw : token.value;
    } else {
        value = 'ILLEGAL';
    }

    msg = msg.replace('%0', value);

    return (token && typeof token.lineNumber === 'number') ?
        createError(token.lineNumber, token.start, msg) :
        createError(lineNumber, index, msg);
}

function throwUnexpectedToken(token, message) {
    throw unexpectedTokenError(token, message);
}

function advanceSlash() {
    var prevToken,
        checkToken;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken = extra.tokens[extra.tokens.length - 1];
    if (!prevToken) {
        // Nothing before that: it cannot be a division.
        return scanRegExp();
    }
    if (prevToken.type === 'Punctuator') {
        if (prevToken.value === ')') {
            checkToken = extra.tokens[extra.openParenToken - 1];
            if (checkToken &&
                    checkToken.type === 'Keyword' &&
                    (checkToken.value === 'if' ||
                     checkToken.value === 'while' ||
                     checkToken.value === 'for' ||
                     checkToken.value === 'with')) {
                return scanRegExp();
            }
            return scanPunctuator();
        }
        if (prevToken.value === '}') {
            // Dividing a function by anything makes little sense,
            // but we have to check for that.
            if (extra.tokens[extra.openCurlyToken - 3] &&
                    extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
                // Anonymous function.
                checkToken = extra.tokens[extra.openCurlyToken - 4];
                if (!checkToken) {
                    return scanPunctuator();
                }
            } else if (extra.tokens[extra.openCurlyToken - 4] &&
                    extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
                // Named function.
                checkToken = extra.tokens[extra.openCurlyToken - 5];
                if (!checkToken) {
                    return scanRegExp();
                }
            } else {
                return scanPunctuator();
            }
            // checkToken determines whether the function is
            // a declaration or an expression.
            if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                // It is an expression.
                return scanPunctuator();
            }
            // It is a declaration.
            return scanRegExp();
        }
        return scanRegExp();
    }
    if (prevToken.type === 'Keyword') {
        return scanRegExp();
    }
    return scanPunctuator();
}

function advance() {
    var ch;

    skipComment();

    if (index >= length) {
        return {
            type: Token.EOF,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [index, index]
        };
    }

    ch = source.charCodeAt(index);

    // Very common: ( and ) and ;
    if (ch === 40 || ch === 41 || ch === 58) {
        return scanPunctuator();
    }

    // String literal starts with single quote (#39) or double quote (#34).
    if (ch === 39 || ch === 34) {
        return scanStringLiteral();
    }

    if (ch === 0x60 || (ch === 0x7D && state.curlyStack[state.curlyStack.length - 1] === '${')) {

        return scanTemplate();
    }
    if (isIdentifierStart(ch)) {
        return scanIdentifier();
    }

    // # and @ are allowed for sweet.js
    if (ch === 35 || ch === 64) {
        ++index;
        return {
            type: Token.Punctuator,
            value: String.fromCharCode(ch),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [index-1, index]
        }
    }

    // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    if (ch === 46) {
        if (isDecimalDigit(source.charCodeAt(index + 1))) {
            return scanNumericLiteral();
        }
        return scanPunctuator();
    }

    if (isDecimalDigit(ch)) {
        return scanNumericLiteral();
    }

    // Slash (/) char #47 can also start a regex.
    if (extra.tokenize && ch === 47) {
        return advanceSlash();
    }

    return scanPunctuator();
}
// Ensure the condition is true, otherwise throw an error.
// This is only to have a better contract semantic, i.e. another safety net
// to catch a logic error. The condition shall be fulfilled in normal case.
// Do NOT use this to enforce a certain condition on any user input.

function assert(condition, message) {
    if (!condition) {
        throw new Error('ASSERT: ' + message);
    }
}

function isIn(el, list) {
    return list.indexOf(el) !== -1;
}

function isDecimalDigit(ch) {
    return (ch >= 48 && ch <= 57);   // 0..9
}

function isHexDigit(ch) {
    return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
}

function isOctalDigit(ch) {
    return '01234567'.indexOf(ch) >= 0;
}


// 7.2 White Space

function isWhiteSpace(ch) {
    return (ch === 32) ||  // space
        (ch === 9) ||      // tab
        (ch === 0xB) ||
        (ch === 0xC) ||
        (ch === 0xA0) ||
        (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
}

// 7.3 Line Terminators

function isLineTerminator(ch) {
    return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
}

// 7.6 Identifier Names and Identifiers

function isIdentifierStart(ch) {
    return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
        (ch >= 65 && ch <= 90) ||         // A..Z
        (ch >= 97 && ch <= 122) ||        // a..z
        (ch === 92) ||                    // \ (backslash)
        ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
}

function isIdentifierPart(ch) {
    return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
        (ch >= 65 && ch <= 90) ||         // A..Z
        (ch >= 97 && ch <= 122) ||        // a..z
        (ch >= 48 && ch <= 57) ||         // 0..9
        (ch === 92) ||                    // \ (backslash)
        ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
}

// 7.6.1.2 Future Reserved Words

function isFutureReservedWord(id) {
    switch (id) {
    case 'class':
    case 'enum':
    case 'export':
    case 'extends':
    case 'import':
    case 'super':
        return true;
    default:
        return false;
    }
}

function isStrictModeReservedWord(id) {
    switch (id) {
    case 'implements':
    case 'interface':
    case 'package':
    case 'private':
    case 'protected':
    case 'public':
    case 'static':
    case 'yield':
    case 'let':
        return true;
    default:
        return false;
    }
}

function isRestrictedWord(id) {
    return id === 'eval' || id === 'arguments';
}

// 7.6.1.1 Keywords

function isKeyword(id) {
    if (strict && isStrictModeReservedWord(id)) {
        return true;
    }

    // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.

    switch (id.length) {
    case 2:
        return (id === 'if') || (id === 'in') || (id === 'do');
    case 3:
        return (id === 'var') || (id === 'for') || (id === 'new') ||
            (id === 'try') || (id === 'let');
    case 4:
        return (id === 'this') || (id === 'else') || (id === 'case') ||
            (id === 'void') || (id === 'with') || (id === 'enum');
    case 5:
        return (id === 'while') || (id === 'break') || (id === 'catch') ||
            (id === 'throw') || (id === 'const') ||
            (id === 'class') || (id === 'super');
    case 6:
        return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
            (id === 'switch') || (id === 'export') || (id === 'import');
    case 7:
        return (id === 'default') || (id === 'finally') || (id === 'extends');
    case 8:
        return (id === 'function') || (id === 'continue') || (id === 'debugger');
    case 10:
        return (id === 'instanceof');
    default:
        return false;
    }
}

// 7.4 Comments

function addComment(type, value, start, end, loc) {
    var comment;

    assert(typeof start === 'number', 'Comment must have valid position');

    // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    if (state.lastCommentStart >= start) {
        return;
    }
    state.lastCommentStart = start;

    comment = {
        type: type,
        value: value
    };
    if (extra.range) {
        comment.range = [start, end];
    }
    if (extra.loc) {
        comment.loc = loc;
    }
    extra.comments.push(comment);
    if (extra.attachComment) {
        extra.leadingComments.push(comment);
        extra.trailingComments.push(comment);
    }
}

function scanComment() {
    var comment, ch, loc, start, blockComment, lineComment;

    comment = '';
    blockComment = false;
    lineComment = false;

    while (index < length) {
        ch = source[index];

        if (lineComment) {
            ch = source[index++];
            if (isLineTerminator(ch.charCodeAt(0))) {
                loc.end = {
                    line: lineNumber,
                    column: index - lineStart - 1
                };
                lineComment = false;
                addComment('Line', comment, start, index - 1, loc);
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                comment = '';
            } else if (index >= length) {
                lineComment = false;
                comment += ch;
                loc.end = {
                    line: lineNumber,
                    column: length - lineStart
                };
                addComment('Line', comment, start, length, loc);
            } else {
                comment += ch;
            }
        } else if (blockComment) {
            if (isLineTerminator(ch.charCodeAt(0))) {
                if (ch === '\r' && source[index + 1] === '\n') {
                    ++index;
                    comment += '\r\n';
                } else {
                    comment += ch;
                }
                ++lineNumber;
                ++index;
                lineStart = index;
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else {
                ch = source[index++];
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                comment += ch;
                if (ch === '*') {
                    ch = source[index];
                    if (ch === '/') {
                        comment = comment.substr(0, comment.length - 1);
                        blockComment = false;
                        ++index;
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        addComment('Block', comment, start, index, loc);
                        comment = '';
                    }
                }
            }
        } else if (ch === '/') {
            ch = source[index + 1];
            if (ch === '/') {
                loc = {
                    start: {
                        line: lineNumber,
                        column: index - lineStart
                    }
                };
                start = index;
                index += 2;
                lineComment = true;
                if (index >= length) {
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart
                    };
                    lineComment = false;
                    addComment('Line', comment, start, index, loc);
                }
            } else if (ch === '*') {
                start = index;
                index += 2;
                blockComment = true;
                loc = {
                    start: {
                        line: lineNumber,
                        column: index - lineStart - 2
                    }
                };
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else {
                break;
            }
        } else if (isWhiteSpace(ch.charCodeAt(0))) {
            ++index;
        } else if (isLineTerminator(ch.charCodeAt(0))) {
            ++index;
            if (ch ===  '\r' && source[index] === '\n') {
                ++index;
            }
            ++lineNumber;
            lineStart = index;
        } else {
            break;
        }
    }
}


function skipComment() {
    var ch, blockComment, lineComment;

    blockComment = false;
    lineComment = false;

    while (index < length) {
        ch = source.charCodeAt(index);

        if (lineComment) {
            ++index;
            if (isLineTerminator(ch)) {
                lineComment = false;
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            }
        } else if (blockComment) {
            if (isLineTerminator(ch)) {
                if (ch === 13 && source.charCodeAt(index + 1) === 10) {
                    ++index;
                }
                ++lineNumber;
                ++index;
                lineStart = index;
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else {
                ch = source.charCodeAt(index++);
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                // Block comment ends with '*/' (char #42, char #47).
                if (ch === 42) {
                    ch = source.charCodeAt(index);
                    if (ch === 47) {
                        ++index;
                        blockComment = false;
                    }
                }
            }
        } else if (ch === 47) {
            ch = source.charCodeAt(index + 1);
            // Line comment starts with '//' (char #47, char #47).
            if (ch === 47) {
                index += 2;
                lineComment = true;
            } else if (ch === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index += 2;
                blockComment = true;
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else {
                break;
            }
        } else if (isWhiteSpace(ch)) {
            ++index;
        } else if (isLineTerminator(ch)) {
            ++index;
            if (ch === 13 && source.charCodeAt(index) === 10) {
                ++index;
            }
            ++lineNumber;
            lineStart = index;
        } else {
            break;
        }
    }
}

function scanHexEscape(prefix) {
    var i, len, ch, code = 0;

    len = (prefix === 'u') ? 4 : 2;
    for (i = 0; i < len; ++i) {
        if (index < length && isHexDigit(source[index])) {
            ch = source[index++];
            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
        } else {
            return '';
        }
    }
    return String.fromCharCode(code);
}

function scanUnicodeCodePointEscape() {
    var ch, code, cu1, cu2;

    ch = source[index];
    code = 0;

    // At least, one hex digit is required.
    if (ch === '}') {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    while (index < length) {
        ch = source[index++];
        if (!isHexDigit(ch)) {
            break;
        }
        code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
    }

    if (code > 0x10FFFF || ch !== '}') {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    // UTF-16 Encoding
    if (code <= 0xFFFF) {
        return String.fromCharCode(code);
    }
    cu1 = ((code - 0x10000) >> 10) + 0xD800;
    cu2 = ((code - 0x10000) & 1023) + 0xDC00;
    return String.fromCharCode(cu1, cu2);
}

function getEscapedIdentifier() {
    var ch, id;

    ch = source.charCodeAt(index++);
    id = String.fromCharCode(ch);

    // '\u' (char #92, char #117) denotes an escaped character.
    if (ch === 92) {
        if (source.charCodeAt(index) !== 117) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        ++index;
        ch = scanHexEscape('u');
        if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        id = ch;
    }

    while (index < length) {
        ch = source.charCodeAt(index);
        if (!isIdentifierPart(ch)) {
            break;
        }
        ++index;
        id += String.fromCharCode(ch);

        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch === 92) {
            id = id.substr(0, id.length - 1);
            if (source.charCodeAt(index) !== 117) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            ++index;
            ch = scanHexEscape('u');
            if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            id += ch;
        }
    }

    return id;
}

function getIdentifier() {
    var start, ch;

    start = index++;
    while (index < length) {
        ch = source.charCodeAt(index);
        if (ch === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index = start;
            return getEscapedIdentifier();
        }
        if (isIdentifierPart(ch)) {
            ++index;
        } else {
            break;
        }
    }

    return source.slice(start, index);
}

function scanIdentifier() {
    var start, id, type;

    start = index;

    // Backslash (char #92) starts an escaped character.
    id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();

    // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    if (id.length === 1) {
        type = Token.Identifier;
    } else if (isKeyword(id)) {
        type = Token.Keyword;
    } else if (id === 'null') {
        type = Token.NullLiteral;
    } else if (id === 'true' || id === 'false') {
        type = Token.BooleanLiteral;
    } else {
        type = Token.Identifier;
    }

    return {
        type: type,
        value: id,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}


// 7.7 Punctuators

function scanPunctuator() {
    var start = index,
        code = source.charCodeAt(index),
        code2,
        ch1 = source[index],
        ch2,
        ch3,
        ch4;

    switch (code) {
    // Check for most common single-character punctuators.
    case 40:   // ( open bracket
    case 41:   // ) close bracket
    case 59:   // ; semicolon
    case 44:   // , comma
    case 123:  // { open curly brace
    case 125:  // } close curly brace
    case 91:   // [
    case 93:   // ]
    case 58:   // :
    case 63:   // ?
    case 126:  // ~
        ++index;
        if (extra.tokenize) {
            if (code === 40) {
                extra.openParenToken = extra.tokens.length;
            } else if (code === 123) {
                extra.openCurlyToken = extra.tokens.length;
            }
        }
        return {
            type: Token.Punctuator,
            value: String.fromCharCode(code),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };

    default:
        code2 = source.charCodeAt(index + 1);

        // '=' (char #61) marks an assignment or comparison operator.
        if (code2 === 61) {
            switch (code) {
            case 37:  // %
            case 38:  // &
            case 42:  // *:
            case 43:  // +
            case 45:  // -
            case 47:  // /
            case 60:  // <
            case 62:  // >
            case 94:  // ^
            case 124: // |
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: String.fromCharCode(code) + String.fromCharCode(code2),
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };

            case 33: // !
            case 61: // =
                index += 2;

                // !== and ===
                if (source.charCodeAt(index) === 61) {
                    ++index;
                }
                return {
                    type: Token.Punctuator,
                    value: source.slice(start, index),
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            default:
                break;
            }
        }
        break;
    }

    // Peek more characters.

    ch2 = source[index + 1];
    ch3 = source[index + 2];
    ch4 = source[index + 3];

    // 4-character punctuator: >>>=

    if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
        if (ch4 === '=') {
            index += 4;
            return {
                type: Token.Punctuator,
                value: '>>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    }

    // 3-character punctuators: === !== >>> <<= >>=

    if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
        index += 3;
        return {
            type: Token.Punctuator,
            value: '>>>',
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
        index += 3;
        return {
            type: Token.Punctuator,
            value: '<<=',
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
        index += 3;
        return {
            type: Token.Punctuator,
            value: '>>=',
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === '.' && ch2 === '.' && ch3 === '.') {
        index += 3;
        return {
            type: Token.Punctuator,
            value: '...',
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // Other 2-character punctuators: ++ -- << >> && ||

    if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
        index += 2;
        return {
            type: Token.Punctuator,
            value: ch1 + ch2,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === '=' && ch2 === '>') {
        index += 2;
        return {
            type: Token.Punctuator,
            value: '=>',
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
        ++index;
        return {
            type: Token.Punctuator,
            value: ch1,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === '.') {
        ++index;
        return {
            type: Token.Punctuator,
            value: ch1,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
}

// 7.8.3 Numeric Literals

function scanHexLiteral(start) {
    var number = '';

    while (index < length) {
        if (!isHexDigit(source[index])) {
            break;
        }
        number += source[index++];
    }

    if (number.length === 0) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    if (isIdentifierStart(source.charCodeAt(index))) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    return {
        type: Token.NumericLiteral,
        value: parseInt('0x' + number, 16),
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanOctalLiteral(prefix, start) {
    var number, octal;

    if (isOctalDigit(prefix)) {
        octal = true;
        number = '0' + source[index++];
    } else {
        octal = false;
        ++index;
        number = '';
    }

    while (index < length) {
        if (!isOctalDigit(source[index])) {
            break;
        }
        number += source[index++];
    }

    if (!octal && number.length === 0) {
        // only 0o or 0O
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    return {
        type: Token.NumericLiteral,
        value: parseInt(number, 8),
        octal: octal,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanNumericLiteral() {
    var number, start, ch, octal;

    ch = source[index];
    assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
        'Numeric literal must start with a decimal digit or a decimal point');

    start = index;
    number = '';
    if (ch !== '.') {
        number = source[index++];
        ch = source[index];

        // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        if (number === '0') {
            if (ch === 'x' || ch === 'X') {
                ++index;
                return scanHexLiteral(start);
            }
            if (ch === 'b' || ch === 'B') {
                ++index;
                number = '';

                while (index < length) {
                    ch = source[index];
                    if (ch !== '0' && ch !== '1') {
                        break;
                    }
                    number += source[index++];
                }

                if (number.length === 0) {
                    // only 0b or 0B
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }

                if (index < length) {
                    ch = source.charCodeAt(index);
                    if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                }
                return {
                    type: Token.NumericLiteral,
                    value: parseInt(number, 2),
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
            if (ch === 'o' || ch === 'O' || isOctalDigit(ch)) {
                return scanOctalLiteral(ch, start);
            }
            // decimal number starts with '0' such as '09' is illegal.
            if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        while (isDecimalDigit(source.charCodeAt(index))) {
            number += source[index++];
        }
        ch = source[index];
    }

    if (ch === '.') {
        number += source[index++];
        while (isDecimalDigit(source.charCodeAt(index))) {
            number += source[index++];
        }
        ch = source[index];
    }

    if (ch === 'e' || ch === 'E') {
        number += source[index++];

        ch = source[index];
        if (ch === '+' || ch === '-') {
            number += source[index++];
        }
        if (isDecimalDigit(source.charCodeAt(index))) {
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
        } else {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
    }

    if (isIdentifierStart(source.charCodeAt(index))) {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    return {
        type: Token.NumericLiteral,
        value: parseFloat(number),
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

// 7.8.4 String Literals

function scanStringLiteral() {
    var str = '', quote, start, ch, code, unescaped, restore, octal = false;

    quote = source[index];
    assert((quote === '\'' || quote === '"'),
        'String literal must starts with a quote');

    start = index;
    ++index;

    while (index < length) {
        ch = source[index++];

        if (ch === quote) {
            quote = '';
            break;
        } else if (ch === '\\') {
            ch = source[index++];
            if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                switch (ch) {
                case 'n':
                    str += '\n';
                    break;
                case 'r':
                    str += '\r';
                    break;
                case 't':
                    str += '\t';
                    break;
                case 'u':
                case 'x':
                    if (source[index] === '{') {
                        ++index;
                        str += scanUnicodeCodePointEscape();
                    } else {
                        restore = index;
                        unescaped = scanHexEscape(ch);
                        if (unescaped) {
                            str += unescaped;
                        } else {
                            index = restore;
                            str += ch;
                        }
                    }
                    break;
                case 'b':
                    str += '\b';
                    break;
                case 'f':
                    str += '\f';
                    break;
                case 'v':
                    str += '\x0B';
                    break;

                default:
                    if (isOctalDigit(ch)) {
                        code = '01234567'.indexOf(ch);

                        // \0 is not octal escape sequence
                        if (code !== 0) {
                            octal = true;
                        }

                        if (index < length && isOctalDigit(source[index])) {
                            octal = true;
                            code = code * 8 + '01234567'.indexOf(source[index++]);

                            // 3 digits are only allowed when string starts
                            // with 0, 1, 2, 3
                            if ('0123'.indexOf(ch) >= 0 &&
                                    index < length &&
                                    isOctalDigit(source[index])) {
                                code = code * 8 + '01234567'.indexOf(source[index++]);
                            }
                        }
                        str += String.fromCharCode(code);
                    } else {
                        str += ch;
                    }
                    break;
                }
            } else {
                ++lineNumber;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
                lineStart = index;
            }
        } else if (isLineTerminator(ch.charCodeAt(0))) {
            break;
        } else {
            str += ch;
        }
    }

    if (quote !== '') {
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    return {
        type: Token.StringLiteral,
        value: str,
        octal: octal,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanTemplate() {
    var cooked = '', ch, start, rawOffset, terminated, head, tail, restore, unescaped;

    terminated = false;
    tail = false;
    start = index;
    head = (source[index] === '`');
    rawOffset = 2;

    ++index;

    while (index < length) {
        ch = source[index++];
        if (ch === '`') {
            rawOffset = 1;
            tail = true;
            terminated = true;
            break;
        } else if (ch === '$') {
            if (source[index] === '{') {
                state.curlyStack.push('${');
                ++index;
                terminated = true;
                break;
            }
            cooked += ch;
        } else if (ch === '\\') {
            ch = source[index++];
            if (!isLineTerminator(ch.charCodeAt(0))) {
                switch (ch) {
                case 'n':
                    cooked += '\n';
                    break;
                case 'r':
                    cooked += '\r';
                    break;
                case 't':
                    cooked += '\t';
                    break;
                case 'u':
                case 'x':
                    if (source[index] === '{') {
                        ++index;
                        cooked += scanUnicodeCodePointEscape();
                    } else {
                        restore = index;
                        unescaped = scanHexEscape(ch);
                        if (unescaped) {
                            cooked += unescaped;
                        } else {
                            index = restore;
                            cooked += ch;
                        }
                    }
                    break;
                case 'b':
                    cooked += '\b';
                    break;
                case 'f':
                    cooked += '\f';
                    break;
                case 'v':
                    cooked += '\v';
                    break;

                default:
                    if (ch === '0') {
                        if (isDecimalDigit(source.charCodeAt(index))) {
                            // Illegal: \01 \02 and so on
                            throwError(Messages.TemplateOctalLiteral);
                        }
                        cooked += '\0';
                    } else if (isOctalDigit(ch)) {
                        // Illegal: \1 \2
                        throwError(Messages.TemplateOctalLiteral);
                    } else {
                        cooked += ch;
                    }
                    break;
                }
            } else {
                ++lineNumber;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                lineStart = index;
            }
        } else if (isLineTerminator(ch.charCodeAt(0))) {
            ++lineNumber;
            if (ch === '\r' && source[index] === '\n') {
                ++index;
            }
            lineStart = index;
            cooked += '\n';
        } else {
            cooked += ch;
        }
    }

    if (!terminated) {
        throwUnexpectedToken();
    }

    if (!head) {
        state.curlyStack.pop();
    }

    return {
        type: Token.Template,
        value: {
            cooked: cooked,
            raw: source.slice(start + 1, index - rawOffset)
        },
        head: head,
        tail: tail,
        lineNumber: lineNumber,
        lineStart: lineStart,
        start: start,
        end: index
    };
}

function scanRegExp() {
    var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false, tmp;

    lookahead = null;
    skipComment();

    start = index;
    ch = source[index];
    assert(ch === '/', 'Regular expression literal must start with a slash');
    str = source[index++];

    while (index < length) {
        ch = source[index++];
        str += ch;
        if (classMarker) {
            if (ch === ']') {
                classMarker = false;
            }
        } else {
            if (ch === '\\') {
                ch = source[index++];
                // ECMA-262 7.8.5
                if (isLineTerminator(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
                str += ch;
            } else if (ch === '/') {
                terminated = true;
                break;
            } else if (ch === '[') {
                classMarker = true;
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                throwError({}, Messages.UnterminatedRegExp);
            }
        }
    }

    if (!terminated) {
        throwError({}, Messages.UnterminatedRegExp);
    }

    // Exclude leading and trailing slash.
    pattern = str.substr(1, str.length - 2);

    flags = '';
    while (index < length) {
        ch = source[index];
        if (!isIdentifierPart(ch.charCodeAt(0))) {
            break;
        }

        ++index;
        if (ch === '\\' && index < length) {
            ch = source[index];
            if (ch === 'u') {
                ++index;
                restore = index;
                ch = scanHexEscape('u');
                if (ch) {
                    flags += ch;
                    for (str += '\\u'; restore < index; ++restore) {
                        str += source[restore];
                    }
                } else {
                    index = restore;
                    flags += 'u';
                    str += '\\u';
                }
            } else {
                str += '\\';
            }
        } else {
            flags += ch;
            str += ch;
        }
    }

    tmp = pattern;
    if (flags.indexOf('u') >= 0) {
        // Replace each astral symbol and every Unicode code point
        // escape sequence that represents such a symbol with a single
        // ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        tmp = tmp
            .replace(/\\u\{([0-9a-fA-F]{5,6})\}/g, 'x')
            .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, 'x');
    }

    // First, detect invalid regular expressions.
    try {
        value = new RegExp(tmp);
    } catch (e) {
        throwError({}, Messages.InvalidRegExp);
    }

    // Return a regular expression object for this pattern-flag pair, or
    // `null` in case the current environment doesn't support the flags it
    // uses.
    try {
        value = new RegExp(pattern, flags);
    } catch (exception) {
        value = null;
    }

    if (extra.tokenize) {
        return {
            type: Token.RegularExpression,
            value: value,
            regex: {
                pattern: pattern,
                flags: flags
            },
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }
    return {
        type: Token.RegularExpression,
        literal: str,
        regex: {
            pattern: pattern,
            flags: flags
        },
        value: value,
        range: [start, index]
    };
}

function isIdentifierName(token) {
    return token.type === Token.Identifier ||
        token.type === Token.Keyword ||
        token.type === Token.BooleanLiteral ||
        token.type === Token.NullLiteral;
}
// Determines if the {} delimiter is a block or an expression.
function blockAllowed(toks, start, inExprDelim, parentIsBlock) {

    var assignOps =  ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
                      "&=", "|=", "^=", ","];

    var binaryOps = ["+", "-", "*", "/", "%","<<", ">>", ">>>", "&", "|", "^",
                     "&&", "||", "?", ":",
                     "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];

    var unaryOps = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];

    function back(n) {
        var idx = (toks.length - n > 0) ? (toks.length - n) : 0;
        return toks[idx];
    }


    if (inExprDelim && (toks.length - (start + 2) <= 0)) {
        // ... ({...} ...)
        return false;
    }
    else if (back(start + 2).value === ":" && parentIsBlock) {
        // ...{a:{b:{...}}}
        return true;
    }
    else if (isIn(back(start + 2).value, unaryOps.concat(binaryOps).concat(assignOps))) {
        // ... + {...}
        return false;
    }
    else if (back(start + 2).value === "return") {
        // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        var currLineNumber = typeof back(start + 1).openInfo !== 'undefined' ?
            back(start + 1).openInfo.lineNumber :
            back(start + 1).lineNumber;
        if (back(start + 2).lineNumber !== currLineNumber) {
            return true;
        } else {
            return false;
        }
    }
    else if (isIn(back(start + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}

// Readtables
var readtables = {
    currentReadtable: {},

    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],

    // A readtable can only override punctuators
    punctuators: ';,.:!?~=%&*+-/<>^|#@',

    has: function(ch) {
        return readtables.currentReadtable[ch] &&
            readtables.punctuators.indexOf(ch) !== -1;
    },

    getQueued: function() {
        return readtables.queued.length ? readtables.queued.shift() : null;
    },

    peekQueued: function(lookahead) {
        lookahead = lookahead ? lookahead : 1;
        return readtables.queued.length ? readtables.queued[lookahead - 1] : null;
    },

    invoke: function(ch, toks) {
        var prevState = snapshotParserState();
        var newStream = readtables.currentReadtable[ch](
            ch, readtables.readerAPI, toks, source, index
        );

        if(!newStream) {
            // Reset the state
            restoreParserState(prevState);
            return null;
        }
        else if(!Array.isArray(newStream)) {
            newStream = [newStream];
        }

        this.queued = this.queued.concat(newStream);
        return this.getQueued();
    }
};

function snapshotParserState() {
    return {
        index: index,
        lineNumber: lineNumber,
        lineStart: lineStart,
    };
}

function restoreParserState(prevState) {
    index = prevState.index;
    lineNumber = prevState.lineNumber;
    lineStart = prevState.lineStart;
}

function suppressReadError(func) {
    var prevState = snapshotParserState();
    try {
        return func();
    }
    catch(e) {
        if(!(e instanceof SyntaxError) &&
           !(e instanceof TypeError)) {
            restoreParserState(prevState);
            return null;
        }
        throw e;
    }
}

function makeIdentifier(value, opts) {
    opts = opts || {};
    var type = Token.Identifier;
    if(isKeyword(value)) {
        type = Token.Keyword;
    }
    else if(value === 'null') {
        type = Token.NullLiteral;
    }
    else if(value === 'true' || value === 'false') {
        type = Token.BooleanLiteral;
    }

    return {
        type: type,
        value: value,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [opts.start || index, index]
    }
}

function makePunctuator(value, opts) {
    opts = opts || {};
    return {
        type: Token.Punctuator,
        value: value,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [opts.start || index, index]
    };
}

function makeStringLiteral(value, opts) {
    opts = opts || {};
    return {
        type: Token.StringLiteral,
        value: value,
        octal: !!opts.octal,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [opts.start || index, index]
    };
}

function makeNumericLiteral(value, opts) {
    opts = opts || {};
    return {
        type: Token.NumericLiteral,
        value: value,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [opts.start || index, index]
    };
}
function makeRegExp(value, opts) {
    opts = opts || {};
    return {
        type: Token.RegularExpression,
        value: value,
        literal: value.toString(),
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [opts.start || index, index]
    };
}
function makeDelimiter(value, inner) {
    var current = { lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [index, index] };
    var firstTok = inner.length ? inner[0] : current;
    var lastTok = inner.length ? inner[inner.length-1] : current;

    return {
        type: Token.Delimiter,
        value: value,
        inner: inner,
        startLineNumber: firstTok.lineNumber,
        startLineStart: firstTok.lineStart,
        startRange: firstTok.range,
        endLineNumber: lastTok.lineNumber,
        endLineStart: lastTok.lineStart,
        endRange: lastTok.range
    }
}
// Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
var readerAPI = {
    Token: Token,

    get source() { return source; },
    get index() { return index; },
    set index(x) { index = x; },
    get length() { return length; },
    set length(x) { length = x; },
    get lineNumber() { return lineNumber; },
    set lineNumber(x) { lineNumber = x; },
    get lineStart() { return lineStart; },
    set lineStart(x) { lineStart = x; },
    get extra() { return extra; },

    isIdentifierStart: isIdentifierStart,
    isIdentifierPart: isIdentifierPart,
    isLineTerminator: isLineTerminator,

    readIdentifier: scanIdentifier,
    readPunctuator: scanPunctuator,
    readStringLiteral: scanStringLiteral,
    readNumericLiteral: scanNumericLiteral,
    readRegExp: scanRegExp,
    readToken: function() {
        return readToken([], false, false);
    },
    readDelimiter: function() {
        return readDelim([], false, false);
    },
    skipComment: scanComment,

    makeIdentifier: makeIdentifier,
    makePunctuator: makePunctuator,
    makeStringLiteral: makeStringLiteral,
    makeNumericLiteral: makeNumericLiteral,
    makeRegExp: makeRegExp,
    makeDelimiter: makeDelimiter,

    suppressReadError: suppressReadError,
    peekQueued: readtables.peekQueued,
    getQueued: readtables.getQueued
};
readtables.readerAPI = readerAPI;
// Read the next token. Takes the previously read tokens, a
// boolean indicating if the parent delimiter is () or [], and a
// boolean indicating if the parent delimiter is {} a block
function readToken(toks, inExprDelim, parentIsBlock) {
    var delimiters = ['(', '{', '['];
    var parenIdents = ["if", "while", "for", "with"];
    var last = toks.length - 1;
    var comments, commentsLen = extra.comments.length;

    function back(n) {
        var idx = (toks.length - n > 0) ? (toks.length - n) : 0;
        return toks[idx];
    }

    function attachComments(token) {
        if (comments) {
            token.leadingComments = comments;
        }
        return token;
    }

    function _advance() { return attachComments(advance()); }
    function _scanRegExp() { return attachComments(scanRegExp()); }

    skipComment();
    var ch = source[index];

    if (extra.comments.length > commentsLen) {
        comments = extra.comments.slice(commentsLen);
    }

    if (isIn(source[index], delimiters)) {
        return attachComments(readDelim(toks, inExprDelim, parentIsBlock));
    }

    // Check if we should get the token from the readtable
    var readtableToken;
    if((readtableToken = readtables.getQueued()) ||
       (readtables.has(ch) &&
        (readtableToken = readtables.invoke(ch, toks)))) {
        return readtableToken;
    }

    if (ch === "/") {
        var prev = back(1);
        if (prev) {
            if (prev.value === "()") {
                if (isIn(back(2).value, parenIdents) && back(3).value !== ".") {
                    // ... if (...) / ...
                    return _scanRegExp();
                }
                // ... (...) / ...
                return _advance();
            }
            if (prev.value === "{}") {
                if(blockAllowed(toks, 0, inExprDelim, parentIsBlock)) {
                    if (back(2).value === "()") {
                        // named function
                        if (back(4).value === "function") {
                            if (!blockAllowed(toks, 3, inExprDelim, parentIsBlock)) {
                                // new function foo (...) {...} / ...
                                return _advance();
                            }
                            if ((toks.length - 5 <= 0) && inExprDelim) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance();
                            }
                        }
                        // unnamed function
                        if (back(3).value === "function") {
                            if (!blockAllowed(toks, 2, inExprDelim, parentIsBlock)) {
                                // new function (...) {...} / ...
                                return _advance();
                            }
                            if ((toks.length - 4 <= 0) && inExprDelim) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp();

                } else {
                    // ... + {...} / ...
                    return _advance();
                }
            }

            if (prev.type === Token.Punctuator) {
                // ... + /...
                return _scanRegExp();
            }
            if (isKeyword(prev.value) &&
                prev.value !== "this" &&
                prev.value !== "let"&&
                prev.value !== "export") {
                // typeof /...
                return _scanRegExp();
            }
            return _advance();
        }
        return _scanRegExp();
    }
    return _advance();
}

function readDelim(toks, inExprDelim, parentIsBlock) {
    var startDelim = advance(),
        matchDelim = {
            '(': ')',
            '{': '}',
            '[': ']'
        },
        inner = [];

    var delimiters = ['(', '{', '['];
    assert(delimiters.indexOf(startDelim.value) !== -1, "Need to begin at the delimiter");

    var token = startDelim;
    var startLineNumber = token.lineNumber;
    var startLineStart = token.lineStart;
    var startRange = token.range;

    var delimToken = {};
    delimToken.type = Token.Delimiter;
    delimToken.value = startDelim.value + matchDelim[startDelim.value];
    delimToken.startLineNumber = startLineNumber;
    delimToken.startLineStart = startLineStart;
    delimToken.startRange = startRange;

    var delimIsBlock = false;
    if(startDelim.value === "{") {
        delimIsBlock = blockAllowed(toks.concat(delimToken), 0, inExprDelim, parentIsBlock);
    }

    while(index <= length) {
        token = readToken(inner,
                          (startDelim.value === "(" || startDelim.value === "["),
                          delimIsBlock);
        if((token.type === Token.Punctuator) && (token.value === matchDelim[startDelim.value])) {
            if (token.leadingComments) {
                delimToken.trailingComments = token.leadingComments;
            }
            break;
        } else if(token.type === Token.EOF) {
            throwError({}, Messages.UnexpectedEOS);
        } else {
            inner.push(makeToken(token));
        }
    }

    // at the end of the stream but the very last char wasn't the closing delimiter
    if(index >= length && matchDelim[startDelim.value] !== source[length-1]) {
        throwError({}, Messages.UnexpectedEOS);
    }

    var endLineNumber = token.lineNumber;
    var endLineStart = token.lineStart;
    var endRange = token.range;

    delimToken.inner = inner;
    delimToken.endLineNumber = endLineNumber;
    delimToken.endLineStart = endLineStart;
    delimToken.endRange = endRange;
    return makeToken(delimToken);
}

function setReadtable(readtable, syn) {
    readtables.currentReadtable = readtable;

    if(syn) {
        readtables.readerAPI.throwSyntaxError = function(name, message, tok) {
            var sx = syn.syntaxFromToken(tok);
            var err = new syn.MacroSyntaxError(name, message, sx)
            throw new SyntaxError(syn.printSyntaxError(source, err));
        }
    }
}
function currentReadtable() {
    return readtables.currentReadtable;
}


function patch() {
    if (extra.comments) {
        extra.skipComment = skipComment;
        skipComment = scanComment;
    }

    if (typeof extra.tokens !== 'undefined') {
        extra.advance = advance;
        extra.scanRegExp = scanRegExp;

        advance = collectToken;
        scanRegExp = collectRegex;
    }
}

// (Str) -> [...CSyntax]
export default function read(code) {
    var token, tokenTree = [];

    extra = {};
    extra.comments = [];
    extra.range = true;
    extra.loc = true;
    patch();

    source = code;
    index = 0;
    lineNumber = (source.length > 0) ? 1 : 0;
    lineStart = 0;
    length = source.length;
    state = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        curlyStack: []
    };

    while(index < length || readtables.peekQueued()) {
        tokenTree.push(readToken(tokenTree, false, false));
    }
    var last = tokenTree[tokenTree.length-1];
    if(last && last.type !== Token.EOF) {
        tokenTree.push(makeToken({
            type: Token.EOF,
            value: "",
            lineNumber: last.lineNumber,
            lineStart: last.lineStart,
            range: [index, index]
        }));
    }

    return tokenTree;
}
