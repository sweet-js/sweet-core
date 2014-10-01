(function (root$3537, factory$3538) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3538(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$3538);
    }
}(this, function (exports$3539, _$3540, parser$3541, expander$3542) {
    function assert$3543(condition$3571, message$3572) {
        if (!condition$3571) {
            throw new Error('ASSERT: ' + message$3572);
        }
    }
    // Keep an incrementing global counter so that a particular
    // each new context object is assigned a unique "instance number"
    // that it can be identified by. This helps with the memoization
    // of the recursive resolveCtx implementation in expander.js.
    // The memoization addresses issue #232.
    var globalContextInstanceNumber$3544 = 1;
    function Rename$3545(id$3573, name$3574, ctx$3575, defctx$3576, phase$3577) {
        defctx$3576 = defctx$3576 || null;
        this.id = id$3573;
        this.name = name$3574;
        this.context = ctx$3575;
        this.def = defctx$3576;
        this.instNum = globalContextInstanceNumber$3544++;
        this.phase = phase$3577;
    }
    function Mark$3546(mark$3578, ctx$3579) {
        this.mark = mark$3578;
        this.context = ctx$3579;
        this.instNum = globalContextInstanceNumber$3544++;
    }
    function Def$3547(defctx$3580, ctx$3581) {
        this.defctx = defctx$3580;
        this.context = ctx$3581;
        this.instNum = globalContextInstanceNumber$3544++;
    }
    function Imported$3548(id$3582, name$3583, ctx$3584, phase$3585) {
        this.id = id$3582;
        this.name = name$3583;
        this.phase = phase$3585;
        this.context = ctx$3584;
        this.instNum = globalContextInstanceNumber$3544++;
    }
    function Syntax$3549(token$3586, oldstx$3587) {
        this.token = token$3586;
        this.context = oldstx$3587 && oldstx$3587.context ? oldstx$3587.context : null;
        this.deferredContext = oldstx$3587 && oldstx$3587.deferredContext ? oldstx$3587.deferredContext : null;
        this.props = oldstx$3587 && oldstx$3587.props ? oldstx$3587.props : {};
    }
    Syntax$3549.prototype = {
        // (Int) -> CSyntax
        // non mutating
        mark: function (newMark$3588) {
            if (this.token.inner) {
                this.token.inner = this.token.inner.map(function (stx$3589) {
                    return stx$3589.mark(newMark$3588);
                });
                return syntaxFromToken$3550(this.token, {
                    context: new Mark$3546(newMark$3588, this.context),
                    props: this.props
                });
            }
            return syntaxFromToken$3550(this.token, {
                context: new Mark$3546(newMark$3588, this.context),
                props: this.props
            });
        },
        // (CSyntax or [...CSyntax], Str) -> CSyntax
        // non mutating
        rename: function (id$3590, name$3591, defctx$3592, phase$3593) {
            if (// defer renaming of delimiters
                this.token.inner) {
                this.token.inner = this.token.inner.map(function (stx$3594) {
                    return stx$3594.rename(id$3590, name$3591, defctx$3592, phase$3593);
                });
                return syntaxFromToken$3550(this.token, {
                    context: new Rename$3545(id$3590, name$3591, this.context, defctx$3592, phase$3593),
                    props: this.props
                });
            }
            return syntaxFromToken$3550(this.token, {
                context: new Rename$3545(id$3590, name$3591, this.context, defctx$3592, phase$3593),
                props: this.props
            });
        },
        imported: function (id$3595, name$3596, phase$3597) {
            if (this.token.inner) {
                this.token.inner = this.token.inner.map(function (stx$3598) {
                    return stx$3598.imported(id$3595, name$3596, phase$3597);
                });
                return syntaxFromToken$3550(this.token, {
                    context: new Imported$3548(id$3595, name$3596, this.context, phase$3597),
                    props: this.props
                });
            }
            return syntaxFromToken$3550(this.token, {
                context: new Imported$3548(id$3595, name$3596, this.context, phase$3597),
                props: this.props
            });
        },
        addDefCtx: function (defctx$3599) {
            if (this.token.inner) {
                this.token.inner = this.token.inner.map(function (stx$3600) {
                    return stx$3600.addDefCtx(defctx$3599);
                });
                return syntaxFromToken$3550(this.token, {
                    context: new Def$3547(defctx$3599, this.context),
                    props: this.props
                });
            }
            return syntaxFromToken$3550(this.token, {
                context: new Def$3547(defctx$3599, this.context),
                props: this.props
            });
        },
        getDefCtx: function () {
            var ctx$3601 = this.context;
            while (ctx$3601 !== null) {
                if (ctx$3601 instanceof Def$3547) {
                    return ctx$3601.defctx;
                }
                ctx$3601 = ctx$3601.context;
            }
            return null;
        },
        toString: function () {
            var val$3602 = this.token.type === parser$3541.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3602 + ']';
        }
    };
    function syntaxFromToken$3550(token$3603, oldstx$3604) {
        return new Syntax$3549(token$3603, oldstx$3604);
    }
    function mkSyntax$3551(stx$3605, value$3606, type$3607, inner$3608) {
        if (stx$3605 && Array.isArray(stx$3605) && stx$3605.length === 1) {
            stx$3605 = stx$3605[0];
        } else if (stx$3605 && Array.isArray(stx$3605)) {
            throwSyntaxError$3566('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$3605 === undefined) {
            throwSyntaxError$3566('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$3607 === parser$3541.Token.Delimiter) {
            var startLineNumber$3609, startLineStart$3610, endLineNumber$3611, endLineStart$3612, startRange$3613, endRange$3614;
            if (!Array.isArray(inner$3608)) {
                throwSyntaxError$3566('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3605 && stx$3605.token.type === parser$3541.Token.Delimiter) {
                startLineNumber$3609 = stx$3605.token.startLineNumber;
                startLineStart$3610 = stx$3605.token.startLineStart;
                endLineNumber$3611 = stx$3605.token.endLineNumber;
                endLineStart$3612 = stx$3605.token.endLineStart;
                startRange$3613 = stx$3605.token.startRange;
                endRange$3614 = stx$3605.token.endRange;
            } else if (stx$3605 && stx$3605.token) {
                startLineNumber$3609 = stx$3605.token.lineNumber;
                startLineStart$3610 = stx$3605.token.lineStart;
                endLineNumber$3611 = stx$3605.token.lineNumber;
                endLineStart$3612 = stx$3605.token.lineStart;
                startRange$3613 = stx$3605.token.range;
                endRange$3614 = stx$3605.token.range;
            }
            return syntaxFromToken$3550({
                type: parser$3541.Token.Delimiter,
                value: value$3606,
                inner: inner$3608,
                startLineStart: startLineStart$3610,
                startLineNumber: startLineNumber$3609,
                endLineStart: endLineStart$3612,
                endLineNumber: endLineNumber$3611,
                startRange: startRange$3613,
                endRange: endRange$3614
            }, stx$3605);
        } else {
            var lineStart$3615, lineNumber$3616, range$3617;
            if (stx$3605 && stx$3605.token.type === parser$3541.Token.Delimiter) {
                lineStart$3615 = stx$3605.token.startLineStart;
                lineNumber$3616 = stx$3605.token.startLineNumber;
                range$3617 = stx$3605.token.startRange;
            } else if (stx$3605 && stx$3605.token) {
                lineStart$3615 = stx$3605.token.lineStart;
                lineNumber$3616 = stx$3605.token.lineNumber;
                range$3617 = stx$3605.token.range;
            }
            return syntaxFromToken$3550({
                type: type$3607,
                value: value$3606,
                lineStart: lineStart$3615,
                lineNumber: lineNumber$3616,
                range: range$3617
            }, stx$3605);
        }
    }
    function makeValue$3552(val$3618, stx$3619) {
        if (typeof val$3618 === 'boolean') {
            return mkSyntax$3551(stx$3619, val$3618 ? 'true' : 'false', parser$3541.Token.BooleanLiteral);
        } else if (typeof val$3618 === 'number') {
            if (val$3618 !== val$3618) {
                return makeDelim$3557('()', [
                    makeValue$3552(0, stx$3619),
                    makePunc$3556('/', stx$3619),
                    makeValue$3552(0, stx$3619)
                ], stx$3619);
            }
            if (val$3618 < 0) {
                return makeDelim$3557('()', [
                    makePunc$3556('-', stx$3619),
                    makeValue$3552(Math.abs(val$3618), stx$3619)
                ], stx$3619);
            } else {
                return mkSyntax$3551(stx$3619, val$3618, parser$3541.Token.NumericLiteral);
            }
        } else if (typeof val$3618 === 'string') {
            return mkSyntax$3551(stx$3619, val$3618, parser$3541.Token.StringLiteral);
        } else if (val$3618 === null) {
            return mkSyntax$3551(stx$3619, 'null', parser$3541.Token.NullLiteral);
        } else {
            throwSyntaxError$3566('makeValue', 'Cannot make value syntax object from: ' + val$3618);
        }
    }
    function makeRegex$3553(val$3620, flags$3621, stx$3622) {
        var newstx$3623 = mkSyntax$3551(stx$3622, new RegExp(val$3620, flags$3621), parser$3541.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3623.token.literal = val$3620;
        return newstx$3623;
    }
    function makeIdent$3554(val$3624, stx$3625) {
        return mkSyntax$3551(stx$3625, val$3624, parser$3541.Token.Identifier);
    }
    function makeKeyword$3555(val$3626, stx$3627) {
        return mkSyntax$3551(stx$3627, val$3626, parser$3541.Token.Keyword);
    }
    function makePunc$3556(val$3628, stx$3629) {
        return mkSyntax$3551(stx$3629, val$3628, parser$3541.Token.Punctuator);
    }
    function makeDelim$3557(val$3630, inner$3631, stx$3632) {
        return mkSyntax$3551(stx$3632, val$3630, parser$3541.Token.Delimiter, inner$3631);
    }
    function unwrapSyntax$3558(stx$3633) {
        if (Array.isArray(stx$3633) && stx$3633.length === 1) {
            // pull stx out of single element arrays for convenience
            stx$3633 = stx$3633[0];
        }
        if (stx$3633.token) {
            if (stx$3633.token.type === parser$3541.Token.Delimiter) {
                return stx$3633.token;
            } else {
                return stx$3633.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3633);
        }
    }
    function syntaxToTokens$3559(stx$3634) {
        return _$3540.map(stx$3634, function (stx$3635) {
            if (stx$3635.token.inner) {
                stx$3635.token.inner = syntaxToTokens$3559(stx$3635.token.inner);
            }
            return stx$3635.token;
        });
    }
    function tokensToSyntax$3560(tokens$3636) {
        if (!_$3540.isArray(tokens$3636)) {
            tokens$3636 = [tokens$3636];
        }
        return _$3540.map(tokens$3636, function (token$3637) {
            if (token$3637.inner) {
                token$3637.inner = tokensToSyntax$3560(token$3637.inner);
            }
            return syntaxFromToken$3550(token$3637);
        });
    }
    function joinSyntax$3561(tojoin$3638, punc$3639) {
        if (tojoin$3638.length === 0) {
            return [];
        }
        if (punc$3639 === ' ') {
            return tojoin$3638;
        }
        return _$3540.reduce(_$3540.rest(tojoin$3638, 1), function (acc$3640, join$3641) {
            acc$3640.push(cloneSyntax$3563(punc$3639), join$3641);
            return acc$3640;
        }, [_$3540.first(tojoin$3638)]);
    }
    function joinSyntaxArray$3562(tojoin$3642, punc$3643) {
        if (tojoin$3642.length === 0) {
            return [];
        }
        if (punc$3643 === ' ') {
            return _$3540.flatten(tojoin$3642, true);
        }
        return _$3540.reduce(_$3540.rest(tojoin$3642, 1), function (acc$3644, join$3645) {
            acc$3644.push(cloneSyntax$3563(punc$3643));
            Array.prototype.push.apply(acc$3644, join$3645);
            return acc$3644;
        }, _$3540.first(tojoin$3642));
    }
    function cloneSyntax$3563(stx$3646) {
        return syntaxFromToken$3550(_$3540.clone(stx$3646.token), stx$3646);
    }
    function cloneSyntaxArray$3564(arr$3647) {
        return arr$3647.map(function (stx$3648) {
            var o$3649 = cloneSyntax$3563(stx$3648);
            if (o$3649.token.type === parser$3541.Token.Delimiter) {
                o$3649.token.inner = cloneSyntaxArray$3564(o$3649.token.inner);
            }
            return o$3649;
        });
    }
    function MacroSyntaxError$3565(name$3650, message$3651, stx$3652) {
        this.name = name$3650;
        this.message = message$3651;
        this.stx = stx$3652;
    }
    function throwSyntaxError$3566(name$3653, message$3654, stx$3655) {
        if (stx$3655 && Array.isArray(stx$3655)) {
            stx$3655 = stx$3655[0];
        }
        throw new MacroSyntaxError$3565(name$3653, message$3654, stx$3655);
    }
    function SyntaxCaseError$3567(message$3656) {
        this.message = message$3656;
    }
    function throwSyntaxCaseError$3568(message$3657) {
        throw new SyntaxCaseError$3567(message$3657);
    }
    function printSyntaxError$3569(code$3658, err$3659) {
        if (!err$3659.stx) {
            return '[' + err$3659.name + '] ' + err$3659.message;
        }
        var token$3660 = err$3659.stx.token;
        var lineNumber$3661 = _$3540.find([
            token$3660.sm_startLineNumber,
            token$3660.sm_lineNumber,
            token$3660.startLineNumber,
            token$3660.lineNumber
        ], _$3540.isNumber);
        var lineStart$3662 = _$3540.find([
            token$3660.sm_startLineStart,
            token$3660.sm_lineStart,
            token$3660.startLineStart,
            token$3660.lineStart
        ], _$3540.isNumber);
        var start$3663 = (token$3660.sm_startRange || token$3660.sm_range || token$3660.startRange || token$3660.range)[0];
        var offset$3664 = start$3663 - lineStart$3662;
        var line$3665 = '';
        var pre$3666 = lineNumber$3661 + ': ';
        var ch$3667;
        while (ch$3667 = code$3658.charAt(lineStart$3662++)) {
            if (ch$3667 == '\r' || ch$3667 == '\n') {
                break;
            }
            line$3665 += ch$3667;
        }
        return '[' + err$3659.name + '] ' + err$3659.message + '\n' + pre$3666 + line$3665 + '\n' + Array(offset$3664 + pre$3666.length).join(' ') + ' ^';
    }
    function prettyPrint$3570(stxarr$3668, shouldResolve$3669) {
        var indent$3670 = 0;
        var unparsedLines$3671 = stxarr$3668.reduce(function (acc$3672, stx$3673) {
            var s$3674 = shouldResolve$3669 ? expander$3542.resolve(stx$3673) : stx$3673.token.value;
            if (// skip the end of file token
                stx$3673.token.type === parser$3541.Token.EOF) {
                return acc$3672;
            }
            if (stx$3673.token.type === parser$3541.Token.StringLiteral) {
                s$3674 = '"' + s$3674 + '"';
            }
            if (s$3674 == '{') {
                acc$3672[0].str += ' ' + s$3674;
                indent$3670++;
                acc$3672.unshift({
                    indent: indent$3670,
                    str: ''
                });
            } else if (s$3674 == '}') {
                indent$3670--;
                acc$3672.unshift({
                    indent: indent$3670,
                    str: s$3674
                });
                acc$3672.unshift({
                    indent: indent$3670,
                    str: ''
                });
            } else if (s$3674 == ';') {
                acc$3672[0].str += s$3674;
                acc$3672.unshift({
                    indent: indent$3670,
                    str: ''
                });
            } else {
                acc$3672[0].str += (acc$3672[0].str ? ' ' : '') + s$3674;
            }
            return acc$3672;
        }, [{
                indent: 0,
                str: ''
            }]);
        return unparsedLines$3671.reduce(function (acc$3675, line$3676) {
            var ind$3677 = '';
            while (ind$3677.length < line$3676.indent * 2) {
                ind$3677 += ' ';
            }
            return ind$3677 + line$3676.str + '\n' + acc$3675;
        }, '');
    }
    exports$3539.assert = assert$3543;
    exports$3539.unwrapSyntax = unwrapSyntax$3558;
    exports$3539.makeDelim = makeDelim$3557;
    exports$3539.makePunc = makePunc$3556;
    exports$3539.makeKeyword = makeKeyword$3555;
    exports$3539.makeIdent = makeIdent$3554;
    exports$3539.makeRegex = makeRegex$3553;
    exports$3539.makeValue = makeValue$3552;
    exports$3539.Rename = Rename$3545;
    exports$3539.Mark = Mark$3546;
    exports$3539.Def = Def$3547;
    exports$3539.Imported = Imported$3548;
    exports$3539.syntaxFromToken = syntaxFromToken$3550;
    exports$3539.tokensToSyntax = tokensToSyntax$3560;
    exports$3539.syntaxToTokens = syntaxToTokens$3559;
    exports$3539.isSyntax = function (obj$3678) {
        obj$3678 = Array.isArray(obj$3678) ? obj$3678[0] : obj$3678;
        return obj$3678 instanceof Syntax$3549;
    };
    exports$3539.joinSyntax = joinSyntax$3561;
    exports$3539.joinSyntaxArray = joinSyntaxArray$3562;
    exports$3539.cloneSyntax = cloneSyntax$3563;
    exports$3539.cloneSyntaxArray = cloneSyntaxArray$3564;
    exports$3539.prettyPrint = prettyPrint$3570;
    exports$3539.MacroSyntaxError = MacroSyntaxError$3565;
    exports$3539.throwSyntaxError = throwSyntaxError$3566;
    exports$3539.SyntaxCaseError = SyntaxCaseError$3567;
    exports$3539.throwSyntaxCaseError = throwSyntaxCaseError$3568;
    exports$3539.printSyntaxError = printSyntaxError$3569;
}));