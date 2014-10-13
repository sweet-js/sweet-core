_c$600 = function () {
    'use strict';
    if (typeof require === 'function') {
        // importing patches Proxy to be in line with the new direct proxies
        require('harmony-reflect');
    }
    var Blame = {
            create: function (name, pos, neg, lineNumber) {
                var o = new BlameObj(name, pos, neg, lineNumber);
                Object.freeze(o);
                return o;
            },
            clone: function (old, props) {
                var propsObj = {};
                for (var prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        propsObj[prop] = { value: props[prop] };
                    }
                }
                var o = Object.create(old, propsObj);
                Object.freeze(o);
                return o;
            }
        };
    function BlameObj(name, pos, neg, lineNumber) {
        this.name = name;
        this.pos = pos;
        this.neg = neg;
        this.lineNumber = lineNumber;
    }
    BlameObj.prototype.swap = function () {
        return Blame.clone(this, {
            pos: this.neg,
            neg: this.pos
        });
    };
    BlameObj.prototype.addExpected = function (expected, override) {
        if (this.expected === undefined || override) {
            return Blame.clone(this, { expected: expected });
        }
        return Blame.clone(this, {});
    };
    BlameObj.prototype.addGiven = function (given) {
        return Blame.clone(this, { given: given });
    };
    BlameObj.prototype.addLocation = function (loc) {
        return Blame.clone(this, { loc: this.loc != null ? this.loc.concat(loc) : [loc] });
    };
    BlameObj.prototype.addParents = function (parent) {
        return Blame.clone(this, { parents: this.parents != null ? this.parents.concat(parent) : [parent] });
    };
    function assert(cond, msg) {
        if (!cond) {
            throw new Error(msg);
        }
    }
    function Contract(name, type, proj) {
        this.name = name;
        this.type = type;
        this.proj = proj;
    }
    Contract.prototype.toString = function toString() {
        return this.name;
    };
    function addQuotes(val) {
        if (typeof val === 'string') {
            return '\'' + val + '\'';
        }
        return val;
    }
    function raiseBlame(blame) {
        var lineMessage = blame.lineNumber !== undefined ? 'function ' + blame.name + ' guarded at line: ' + blame.lineNumber + '\n' : '';
        var msg = blame.name + ': contract violation\n' + 'expected: ' + blame.expected + '\n' + 'given: ' + addQuotes(blame.given) + '\n' + 'in: ' + blame.loc.slice().reverse().join('\n    ') + '\n' + '    ' + blame.parents[0] + '\n' + lineMessage + 'blaming: ' + blame.pos + '\n';
        throw new Error(msg);
    }
    function check(predicate, name) {
        var c = new Contract(name, 'check', function (blame) {
                return function (val) {
                    if (predicate(val)) {
                        return val;
                    } else {
                        raiseBlame(blame.addExpected(name).addGiven(val));
                    }
                };
            });
        return c;
    }
    function addTh(a0) {
        if (a0 === 0) {
            return '0th';
        }
        if (a0 === 1) {
            return '1st';
        }
        if (a0 === 2) {
            return '2nd';
        }
        if (a0 === 3) {
            return '3rd';
        }
        var x = a0;
        return x + 'th';
    }
    function pluralize(a0, a1) {
        if (a0 === 0) {
            var str = a1;
            return str + 's';
        }
        if (a0 === 1) {
            var str = a1;
            return str;
        }
        var n = a0;
        var str = a1;
        return str + 's';
    }
    function fun(dom, rng, options) {
        var domName = '(' + dom.join(', ') + ')';
        var contractName = domName + ' -> ' + rng;
        var c = new Contract(contractName, 'fun', function (blame) {
                return function (f) {
                    blame = blame.addParents(contractName);
                    if (typeof f !== 'function') {
                        raiseBlame(blame.addExpected('a function that takes ' + dom.length + pluralize(dom.length, ' argument')).addGiven(f));
                    }
                    function applyTrap(target, thisVal, args) {
                        var checkedArgs = [];
                        for (var i = 0; i < dom.length; i++) {
                            if (dom[i].type === 'optional' && args[i] === undefined) {
                                continue;
                            } else {
                                var domProj = dom[i].proj(blame.swap().addLocation('the ' + addTh(i + 1) + ' argument of'));
                                checkedArgs.push(domProj(args[i]));
                            }
                        }
                        checkedArgs = checkedArgs.concat(args.slice(i));
                        assert(rng instanceof Contract, 'The range is not a contract');
                        var rawResult = target.apply(thisVal, checkedArgs);
                        var rngProj = rng.proj(blame.addLocation('the return of'));
                        return rngProj(rawResult);
                    }
                    // only use expensive proxies when needed (to distinguish between apply and construct)
                    if (options && options.needs_proxy) {
                        var p = new Proxy(f, {
                                apply: function (target, thisVal, args) {
                                    return applyTrap(target, thisVal, args);
                                }
                            });
                        return p;
                    } else {
                        return function () {
                            return applyTrap(f, this, Array.prototype.slice.call(arguments));
                        };
                    }
                };
            });
        return c;
    }
    function optional(contract, options) {
        var contractName = 'opt ' + contract;
        return new Contract(contractName, 'optional', function (blame) {
            return function (val) {
                var proj = contract.proj(blame);
                return proj(val);
            };
        });
    }
    function repeat(contract, options) {
        var contractName = '....' + contract;
        return new Contract(contractName, 'repeat', function (blame) {
            return function (val) {
                var proj = contract.proj(blame);
                return proj(val);
            };
        });
    }
    function array(arrContract, options) {
        var proxyPrefix = options && options.proxy ? '!' : '';
        var contractName = proxyPrefix + '[' + arrContract.map(function (c$2) {
                return c$2;
            }).join(', ') + ']';
        var contractNum = arrContract.length;
        var c = new Contract(contractName, 'array', function (blame) {
                return function (arr) {
                    if (typeof arr === 'number' || typeof arr === 'string' || typeof arr === 'boolean' || arr == null) {
                        raiseBlame(blame.addGiven(arr).addExpected('an array with at least ' + contractNum + pluralize(contractNum, ' field')));
                    }
                    for (var ctxIdx = 0, arrIdx = 0; ctxIdx < arrContract.length; ctxIdx++) {
                        if (arrContract[ctxIdx].type === 'repeat' && arr.length <= ctxIdx) {
                            break;
                        }
                        var fieldProj = arrContract[ctxIdx].proj(blame.addLocation('the ' + addTh(arrIdx) + ' field of'));
                        var checkedField = fieldProj(arr[arrIdx]);
                        arr[arrIdx] = checkedField;
                        if (arrContract[ctxIdx].type === 'repeat') {
                            if (ctxIdx !== arrContract.length - 1) {
                                throw new Error('The repeated contract must come last in ' + contractName);
                            }
                            for (; arrIdx < arr.length; arrIdx++) {
                                var repeatProj = arrContract[ctxIdx].proj(blame.addLocation('the ' + addTh(arrIdx) + ' field of'));
                                arr[arrIdx] = repeatProj(arr[arrIdx]);
                            }
                        }
                        arrIdx++;
                    }
                    if (options && options.proxy) {
                        return new Proxy(arr, {
                            set: function (target, key, value) {
                                var lastContract = arrContract[arrContract.length - 1];
                                var fieldProj$2;
                                if (arrContract[key] !== undefined && arrContract[key].type !== 'repeat') {
                                    fieldProj$2 = arrContract[key].proj(blame.swap().addLocation('the ' + addTh(key) + ' field of'));
                                    target[key] = fieldProj$2(value);
                                } else if (lastContract && lastContract.type === 'repeat') {
                                    fieldProj$2 = lastContract.proj(blame.swap().addLocation('the ' + addTh(key) + ' field of'));
                                    target[key] = fieldProj$2(value);
                                }
                            }
                        });
                    } else {
                        return arr;
                    }
                };
            });
        return c;
    }
    function object(objContract, options) {
        var contractKeys = Object.keys(objContract);
        var proxyPrefix = options && options.proxy ? '!' : '';
        var contractName = proxyPrefix + '{' + contractKeys.map(function (prop) {
                return prop + ': ' + objContract[prop];
            }).join(', ') + '}';
        var keyNum = contractKeys.length;
        var c = new Contract(contractName, 'object', function (blame) {
                return function (obj) {
                    if (typeof obj === 'number' || typeof obj === 'string' || typeof obj === 'boolean' || obj == null) {
                        raiseBlame(blame.addGiven(obj).addExpected('an object with at least ' + keyNum + pluralize(keyNum, ' key')));
                    }
                    contractKeys.forEach(function (key) {
                        if (!(objContract[key].type === 'optional' && obj[key] === undefined)) {
                            var propProj = objContract[key].proj(blame.addLocation('the ' + key + ' property of'));
                            var checkedProperty = propProj(obj[key]);
                            obj[key] = checkedProperty;
                        }
                    });
                    if (options && options.proxy) {
                        return new Proxy(obj, {
                            set: function (target, key, value) {
                                if (objContract.hasOwnProperty(key)) {
                                    var propProj = objContract[key].proj(blame.swap().addLocation('setting the ' + key + ' property of'));
                                    var checkedProperty = propProj(value);
                                    target[key] = checkedProperty;
                                } else {
                                    target[key] = value;
                                }
                            }
                        });
                    } else {
                        return obj;
                    }
                };
            });
        return c;
    }
    function or(left, right) {
        var contractName = left + ' or ' + right;
        return new Contract(contractName, 'or', function (blame) {
            return function (val) {
                try {
                    var leftProj = left.proj(blame.addExpected(contractName, true));
                    return leftProj(val);
                } catch (b) {
                    var rightProj = right.proj(blame.addExpected(contractName, true));
                    return rightProj(val);
                }
            };
        });
    }
    function guard(contract, value, name) {
        var proj = contract.proj(Blame.create(name, 'function ' + name, '(calling context for ' + name + ')'));
        return proj(value);
    }
    return {
        Num: check(function (val) {
            return typeof val === 'number';
        }, 'Num'),
        Str: check(function (val) {
            return typeof val === 'string';
        }, 'Str'),
        Bool: check(function (val) {
            return typeof val === 'boolean';
        }, 'Bool'),
        Odd: check(function (val) {
            return val % 2 === 1;
        }, 'Odd'),
        Even: check(function (val) {
            return val % 2 !== 1;
        }, 'Even'),
        Pos: check(function (val) {
            return val >= 0;
        }, 'Pos'),
        Nat: check(function (val) {
            return val > 0;
        }, 'Nat'),
        Neg: check(function (val) {
            return val < 0;
        }, 'Neg'),
        Any: check(function (val) {
            return true;
        }, 'Any'),
        None: check(function (val) {
            return false;
        }, 'None'),
        Null: check(function (val) {
            return null === val;
        }, 'Null'),
        Undefined: check(function (val) {
            return void 0 === val;
        }, 'Null'),
        Void: check(function (val) {
            return null == val;
        }, 'Null'),
        fun: fun,
        or: or,
        repeat: repeat,
        optional: optional,
        object: object,
        array: array,
        Blame: Blame,
        guard: guard
    };
}();
(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory);
    }
}(this, function (exports$2, _, parser, expander) {
    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }
    // Keep an incrementing global counter so that a particular
    // each new context object is assigned a unique "instance number"
    // that it can be identified by. This helps with the memoization
    // of the recursive resolveCtx implementation in expander.js.
    // The memoization addresses issue #232.
    var globalContextInstanceNumber = 1;
    _c$600.Token = _c$600.object({
        type: _c$600.optional(_c$600.Num),
        value: _c$600.optional(_c$600.Any),
        range: _c$600.optional(_c$600.array([
            _c$600.Num,
            _c$600.Num
        ]))
    });
    _c$600.Context = _c$600.or(_c$600.Null, _c$600.object({ context: _c$600.object({}) }));
    _c$600.Syntax = _c$600.object({
        token: _c$600.Token,
        context: _c$600.Context
    });
    // (CSyntax, Str) -> CContext
    function Rename(id, name, ctx, defctx) {
        defctx = defctx || null;
        this.id = id;
        this.name = name;
        this.context = ctx;
        this.def = defctx;
        this.instNum = globalContextInstanceNumber++;
    }
    // (Num) -> CContext
    function Mark(mark, ctx) {
        this.mark = mark;
        this.context = ctx;
        this.instNum = globalContextInstanceNumber++;
    }
    function Def(defctx, ctx) {
        this.defctx = defctx;
        this.context = ctx;
        this.instNum = globalContextInstanceNumber++;
    }
    function Syntax(token, oldstx) {
        this.token = token;
        this.context = oldstx && oldstx.context ? oldstx.context : null;
        this.deferredContext = oldstx && oldstx.deferredContext ? oldstx.deferredContext : null;
    }
    Syntax.prototype = {
        mark: function (newMark) {
            if (this.token.inner) {
                return syntaxFromToken(this.token, {
                    deferredContext: new Mark(newMark, this.deferredContext),
                    context: new Mark(newMark, this.context)
                });
            }
            return syntaxFromToken(this.token, { context: new Mark(newMark, this.context) });
        },
        rename: function (id, name, defctx) {
            // defer renaming of delimiters
            if (this.token.inner) {
                return syntaxFromToken(this.token, {
                    deferredContext: new Rename(id, name, this.deferredContext, defctx),
                    context: new Rename(id, name, this.context, defctx)
                });
            }
            return syntaxFromToken(this.token, { context: new Rename(id, name, this.context, defctx) });
        },
        addDefCtx: function (defctx) {
            if (this.token.inner) {
                return syntaxFromToken(this.token, {
                    deferredContext: new Def(defctx, this.deferredContext),
                    context: new Def(defctx, this.context)
                });
            }
            return syntaxFromToken(this.token, { context: new Def(defctx, this.context) });
        },
        getDefCtx: function () {
            var ctx = this.context;
            while (ctx !== null) {
                if (ctx instanceof Def) {
                    return ctx.defctx;
                }
                ctx = ctx.context;
            }
            return null;
        },
        expose: function () {
            assert(this.token.type === parser.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext(stxCtx, ctx) {
                if (ctx == null) {
                    return stxCtx;
                } else if (ctx instanceof Rename) {
                    return new Rename(ctx.id, ctx.name, applyContext(stxCtx, ctx.context), ctx.def);
                } else if (ctx instanceof Mark) {
                    return new Mark(ctx.mark, applyContext(stxCtx, ctx.context));
                } else if (ctx instanceof Def) {
                    return new Def(ctx.defctx, applyContext(stxCtx, ctx.context));
                } else {
                    assert(false, 'unknown context type');
                }
            }
            var self = this;
            this.token.inner = _.map(this.token.inner, function (stx) {
                // when not a syntax object (aka a TermTree) then no need to push down the expose
                if (!stx.token) {
                    return stx;
                }
                if (stx.token.inner) {
                    return syntaxFromToken(stx.token, {
                        deferredContext: applyContext(stx.deferredContext, self.deferredContext),
                        context: applyContext(stx.context, self.deferredContext)
                    });
                } else {
                    return syntaxFromToken(stx.token, { context: applyContext(stx.context, self.deferredContext) });
                }
            });
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val = this.token.type === parser.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    var inner_syntaxFromToken = _c$600.fun([
            _c$600.Token,
            _c$600.or(_c$600.Null, _c$600.Syntax)
        ], _c$600.Syntax).proj(_c$600.Blame.create('syntaxFromToken', 'function syntaxFromToken', '(calling context for syntaxFromToken)', 163))(function syntaxFromToken$2(token, oldstx) {
            return new Syntax(token, oldstx);
        });
    function syntaxFromToken(token, oldstx) {
        return inner_syntaxFromToken.apply(this, arguments);
    }
    function mkSyntax(stx, value, type, inner) {
        if (stx && Array.isArray(stx) && stx.length === 1) {
            stx = stx[0];
        } else if (stx && Array.isArray(stx)) {
            throwSyntaxError('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx === undefined) {
            throwSyntaxError('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type === parser.Token.Delimiter) {
            var startLineNumber, startLineStart, endLineNumber, endLineStart, startRange, endRange;
            if (!Array.isArray(inner)) {
                throwSyntaxError('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx && stx.token.type === parser.Token.Delimiter) {
                startLineNumber = stx.token.startLineNumber;
                startLineStart = stx.token.startLineStart;
                endLineNumber = stx.token.endLineNumber;
                endLineStart = stx.token.endLineStart;
                startRange = stx.token.startRange;
                endRange = stx.token.endRange;
            } else if (stx && stx.token) {
                startLineNumber = stx.token.lineNumber;
                startLineStart = stx.token.lineStart;
                endLineNumber = stx.token.lineNumber;
                endLineStart = stx.token.lineStart;
                startRange = stx.token.range;
                endRange = stx.token.range;
            }
            return syntaxFromToken({
                type: parser.Token.Delimiter,
                value: value,
                inner: inner,
                startLineStart: startLineStart,
                startLineNumber: startLineNumber,
                endLineStart: endLineStart,
                endLineNumber: endLineNumber,
                startRange: startRange,
                endRange: endRange
            }, stx);
        } else {
            var lineStart, lineNumber, range;
            if (stx && stx.token.type === parser.Token.Delimiter) {
                lineStart = stx.token.startLineStart;
                lineNumber = stx.token.startLineNumber;
                range = stx.token.startRange;
            } else if (stx && stx.token) {
                lineStart = stx.token.lineStart;
                lineNumber = stx.token.lineNumber;
                range = stx.token.range;
            }
            return syntaxFromToken({
                type: type,
                value: value,
                lineStart: lineStart,
                lineNumber: lineNumber,
                range: range
            }, stx);
        }
    }
    function makeValue(val, stx) {
        if (typeof val === 'boolean') {
            return mkSyntax(stx, val ? 'true' : 'false', parser.Token.BooleanLiteral);
        } else if (typeof val === 'number') {
            if (val !== val) {
                return makeDelim('()', [
                    makeValue(0, stx),
                    makePunc('/', stx),
                    makeValue(0, stx)
                ], stx);
            }
            if (val < 0) {
                return makeDelim('()', [
                    makePunc('-', stx),
                    makeValue(Math.abs(val), stx)
                ], stx);
            } else {
                return mkSyntax(stx, val, parser.Token.NumericLiteral);
            }
        } else if (typeof val === 'string') {
            return mkSyntax(stx, val, parser.Token.StringLiteral);
        } else if (val === null) {
            return mkSyntax(stx, 'null', parser.Token.NullLiteral);
        } else {
            throwSyntaxError('makeValue', 'Cannot make value syntax object from: ' + val);
        }
    }
    function makeRegex(val, flags, stx) {
        var newstx = mkSyntax(stx, new RegExp(val, flags), parser.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx.token.literal = val;
        return newstx;
    }
    function makeIdent(val, stx) {
        return mkSyntax(stx, val, parser.Token.Identifier);
    }
    function makeKeyword(val, stx) {
        return mkSyntax(stx, val, parser.Token.Keyword);
    }
    function makePunc(val, stx) {
        return mkSyntax(stx, val, parser.Token.Punctuator);
    }
    function makeDelim(val, inner, stx) {
        return mkSyntax(stx, val, parser.Token.Delimiter, inner);
    }
    function unwrapSyntax(stx) {
        if (Array.isArray(stx) && stx.length === 1) {
            // pull stx out of single element arrays for convenience
            stx = stx[0];
        }
        if (stx.token) {
            if (stx.token.type === parser.Token.Delimiter) {
                return stx.token;
            } else {
                return stx.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens(stx) {
        return _.map(stx, function (stx$2) {
            if (stx$2.token.inner) {
                stx$2.token.inner = syntaxToTokens(stx$2.token.inner);
            }
            return stx$2.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax(tokens) {
        if (!_.isArray(tokens)) {
            tokens = [tokens];
        }
        return _.map(tokens, function (token) {
            if (token.inner) {
                token.inner = tokensToSyntax(token.inner);
            }
            return syntaxFromToken(token);
        });
    }
    // ([...CSyntax], Syntax) -> [...CSyntax])
    function joinSyntax(tojoin, punc) {
        if (tojoin.length === 0) {
            return [];
        }
        if (punc === ' ') {
            return tojoin;
        }
        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            acc.push(cloneSyntax(punc), join);
            return acc;
        }, [_.first(tojoin)]);
    }
    // ([...[...CSyntax]], Syntax) -> [...CSyntax]
    function joinSyntaxArray(tojoin, punc) {
        if (tojoin.length === 0) {
            return [];
        }
        if (punc === ' ') {
            return _.flatten(tojoin, true);
        }
        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            acc.push(cloneSyntax(punc));
            Array.prototype.push.apply(acc, join);
            return acc;
        }, _.first(tojoin));
    }
    function cloneSyntax(stx) {
        return syntaxFromToken(_.clone(stx.token), stx);
    }
    function cloneSyntaxArray(arr) {
        return arr.map(function (stx) {
            var o = cloneSyntax(stx);
            if (o.token.type === parser.Token.Delimiter) {
                o.token.inner = cloneSyntaxArray(o.token.inner);
            }
            return o;
        });
    }
    function MacroSyntaxError(name, message, stx) {
        this.name = name;
        this.message = message;
        this.stx = stx;
    }
    function throwSyntaxError(name, message, stx) {
        if (stx && Array.isArray(stx)) {
            stx = stx[0];
        }
        throw new MacroSyntaxError(name, message, stx);
    }
    function SyntaxCaseError(message) {
        this.message = message;
    }
    function throwSyntaxCaseError(message) {
        throw new SyntaxCaseError(message);
    }
    function printSyntaxError(code, err) {
        if (!err.stx) {
            return '[' + err.name + '] ' + err.message;
        }
        var token = err.stx.token;
        var lineNumber = _.find([
                token.sm_startLineNumber,
                token.sm_lineNumber,
                token.startLineNumber,
                token.lineNumber
            ], _.isNumber);
        var lineStart = _.find([
                token.sm_startLineStart,
                token.sm_lineStart,
                token.startLineStart,
                token.lineStart
            ], _.isNumber);
        var start = (token.sm_startRange || token.sm_range || token.startRange || token.range)[0];
        var offset = start - lineStart;
        var line = '';
        var pre = lineNumber + ': ';
        var ch;
        while (ch = code.charAt(lineStart++)) {
            if (ch == '\r' || ch == '\n') {
                break;
            }
            line += ch;
        }
        return '[' + err.name + '] ' + err.message + '\n' + pre + line + '\n' + Array(offset + pre.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint(stxarr, shouldResolve) {
        var indent = 0;
        var unparsedLines = stxarr.reduce(function (acc, stx) {
                var s = shouldResolve ? expander.resolve(stx) : stx.token.value;
                // skip the end of file token
                if (stx.token.type === parser.Token.EOF) {
                    return acc;
                }
                if (stx.token.type === parser.Token.StringLiteral) {
                    s = '"' + s + '"';
                }
                if (s == '{') {
                    acc[0].str += ' ' + s;
                    indent++;
                    acc.unshift({
                        indent: indent,
                        str: ''
                    });
                } else if (s == '}') {
                    indent--;
                    acc.unshift({
                        indent: indent,
                        str: s
                    });
                    acc.unshift({
                        indent: indent,
                        str: ''
                    });
                } else if (s == ';') {
                    acc[0].str += s;
                    acc.unshift({
                        indent: indent,
                        str: ''
                    });
                } else {
                    acc[0].str += (acc[0].str ? ' ' : '') + s;
                }
                return acc;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines.reduce(function (acc, line) {
            var ind = '';
            while (ind.length < line.indent * 2) {
                ind += ' ';
            }
            return ind + line.str + '\n' + acc;
        }, '');
    }
    exports$2.assert = assert;
    exports$2.unwrapSyntax = unwrapSyntax;
    exports$2.makeDelim = makeDelim;
    exports$2.makePunc = makePunc;
    exports$2.makeKeyword = makeKeyword;
    exports$2.makeIdent = makeIdent;
    exports$2.makeRegex = makeRegex;
    exports$2.makeValue = makeValue;
    exports$2.Rename = Rename;
    exports$2.Mark = Mark;
    exports$2.Def = Def;
    exports$2.syntaxFromToken = syntaxFromToken;
    exports$2.tokensToSyntax = tokensToSyntax;
    exports$2.syntaxToTokens = syntaxToTokens;
    exports$2.isSyntax = function (obj) {
        obj = Array.isArray(obj) ? obj[0] : obj;
        return obj instanceof Syntax;
    };
    exports$2.joinSyntax = joinSyntax;
    exports$2.joinSyntaxArray = joinSyntaxArray;
    exports$2.cloneSyntax = cloneSyntax;
    exports$2.cloneSyntaxArray = cloneSyntaxArray;
    exports$2.prettyPrint = prettyPrint;
    exports$2.MacroSyntaxError = MacroSyntaxError;
    exports$2.throwSyntaxError = throwSyntaxError;
    exports$2.SyntaxCaseError = SyntaxCaseError;
    exports$2.throwSyntaxCaseError = throwSyntaxCaseError;
    exports$2.printSyntaxError = printSyntaxError;
}));
//# sourceMappingURL=syntax.js.map