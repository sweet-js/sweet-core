/*
  Copyright (C) 2015 Tim Disney <tim@disnet.me>


  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
// DONE
// support simple macro classes
// get replacement
//
// TODO
// check whether replacement compiles
// do not match own macro definition
// coalesce replacements
// replace all
// editor integration
//
// Future:
// custom macro classes
// scope-sensitive reverse matching
// nested macros
// named bindings
// verbatim labeled statements
(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'), require('./patterns'), require('./syntax'), require('./expander'), require('./sweet'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'scopedEval',
            'patterns',
            'escodegen'
        ], factory);
    }
}(this, function (exports$2, _, parser, patternModule, syntax, expander, sweet, gen) {
    'use strict';
    // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    var codegen = typeof escodegen !== 'undefined' ? escodegen : gen;
    function asPattern(src) {
        return _.initial(patternModule.loadPattern(parser.read(src)));
    }
    var macroPattern = asPattern('macro $n { $e ... }');
    var rulePattern = asPattern('rule { $p ... } => { $e ... }');
    var expandN = _.initial(parser.read('$n'));
    var expandP = _.initial(parser.read('$p...'));
    var expandE = _.initial(parser.read('$e...'));
    // Pre-order traversal of read tree, provides rest tokens at each step
    //
    // fn :: a -> Token -> a
    // stx :: [Token] (can be nested)
    // initial :: a
    function foldReadTree(fn, stx, initial, path) {
        var current = initial;
        if (!path) {
            path = [stx];
        } else {
            path.push(stx);
        }
        for (var i = 0; i < stx.length; i++) {
            path.push(i);
            current = fn(current, _.first(stx, i), _.rest(stx, i), path);
            var tok = stx[i].token ? stx[i].token : stx[i];
            if (tok.type === parser.Token.Delimiter) {
                current = foldReadTree(fn, tok.inner, current, path);
            }
            path.pop();
        }
        path.pop();
        return current;
    }
    // create a new tree by walking the path up and replacing nodes
    function replaceInTree(newStx, path) {
        if (path.length === 0) {
            return newStx;
        }
        var parentIdx = path.pop();
        var parentStx = path.pop();
        var parentCopy = _.clone(parentStx[parentIdx]);
        parentCopy.token = _.clone(parentCopy.token);
        parentCopy.token.inner = newstx;
        var newParentStx = _(parentStx).toArray();
        newParentStx[parentIdx] = parentCopy;
        return replaceInTree(newParentStx, path);
    }
    function findMacros(stx) {
        return foldReadTree(function (macros, init, rest, path) {
            var res = patternModule.matchPatterns(macroPattern, rest, { env: {} }, true);
            if (res.success) {
                var name = patternModule.transcribe(expandN, 0, res.patternEnv);
                var con = patternModule.transcribe(expandE, 0, res.patternEnv);
                return macros.concat(findMacroRules(name, con));
            }
            return macros;
        }, stx, []);
    }
    function findMacroRules(name, stx) {
        return foldReadTree(function (macros, init, rest, path) {
            var res = patternModule.matchPatterns(rulePattern, rest, { env: {} }, true);
            if (res.success)
                macros.push(new MacroRule(name, res.patternEnv));
            return macros;
        }, stx, []);
    }
    function MacroRule(name, patternEnv) {
        this.expansion = patternModule.transcribe(expandE, 0, patternEnv);
        this.expansionRule = patternModule.loadPattern(this.expansion);
        this.pattern = patternModule.transcribe(expandP, 0, patternEnv);
        this.pattern = name.concat(this.pattern);
        this.patternRule = patternModule.loadPattern(this.pattern);
        this.addClassesToExpansionPattern();
    }
    MacroRule.prototype.addClassesToExpansionPattern = function () {
        var env = {};
        foldReadTree(function (t, init, rest, path) {
            var tok = rest[0];
            if (!tok)
                return;
            if (tok.type === parser.Token.Identifier && tok.class != 'token') {
                env[tok.value] = tok.class;
            }
        }, this.patternRule);
        foldReadTree(function (t, init, rest, path) {
            var tok = rest[0];
            if (!tok)
                return;
            if (tok.type === parser.Token.Identifier && env[tok.value]) {
                tok.class = env[tok.value];
            }
        }, this.expansionRule);
    };
    MacroRule.prototype.removeClasses = function (rest) {
        this.pattern = _(this.pattern).filter(function (token) {
        });
    };
    MacroRule.prototype.isInMacro = function (token) {
        var range = token.range;
        if (token.type === parser.Token.Delimiter) {
            range = [
                token.startRange[0],
                token.endRange[1]
            ];
        }
        var firstTok = this.pattern[0].token;
        var start = firstTok.type === parser.Token.Delimiter ? firstTok.startRange[0] : firstTok.range[0];
        var lastTok = _.last(this.expansion).token;
        var end = lastTok.type === parser.Token.Delimiter ? lastTok.endRange[1] : lastTok.range[1];
        return range[1] >= start && range[0] <= end;
    };
    MacroRule.prototype.tryMatch = function (init, rest, path) {
        var c = { env: {} };
        if (rest.length === 0 || this.isInMacro(rest[0].token))
            return;
        var res = patternModule.matchPatterns(this.expansionRule, rest, c, true);
        if (!res.success || rest.length === res.rest.length)
            return;
        var rep = patternModule.transcribe(this.pattern, 0, res.patternEnv);
        var newStx = _.flatten([
                init,
                rep,
                res.rest
            ], true);
        var newTree = replaceInTree(newStx, _.initial(path, 2));
        try {
            // this might fail with an exception
            parser.parse(sweet.expandSyntax(newTree, []));
            return {
                matchedTokens: _.initial(rest, res.rest.length),
                replacement: syntax.prettyPrint(expander.flatten(rep)),
                replacedSrc: syntax.prettyPrint(expander.flatten(newTree))
            };
        } catch (e) {
            return;
        }
    };
    function findReverseMatches(stx) {
        var macros = findMacros(stx);
        return foldReadTree(function (matches, init, rest, path) {
            for (var i = 0; i < macros.length; i++) {
                var match = macros[i].tryMatch(init, rest, path);
                if (match)
                    matches.push(match);
            }
            return matches;
        }, stx, []);
    }
    exports$2.findMacros = findMacros;
    exports$2.findReverseMatches = findReverseMatches;
}));
//# sourceMappingURL=reverse.js.map