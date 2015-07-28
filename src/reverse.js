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

// TODO
// custom macro classes
// scope-sensitive reverse matching
// nested macros
// optional semicolon/expr-parens insertion
// verbatim labeled statements

(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports,
                require('underscore'),
                require('./parser'),
                require("./patterns"),
                require("./syntax"),
                require("./expander"),
                require("./sweet"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports',
                'underscore',
                'parser',
                'patterns',
                'syntax',
                'expander',
                'sweet'], factory);
    }
}(this, function(exports, _, parser, patternModule, syntax, expander, sweet) {
    'use strict';

    function asPattern(src) {
        return _.initial(patternModule.loadPattern(parser.read(src)));
    }

    var macroPattern = asPattern("macro $n { $e ... }");
    var rulePattern = asPattern("rule { $p ... } => { $e ... }");
    var expandN = _.initial(parser.read("$n"));
    var expandP = _.initial(parser.read("$p..."));
    var expandE = _.initial(parser.read("$e..."));

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
        var parentCopy = Object.create(Object.getPrototypeOf(parentStx[parentIdx]));
        for (var key in parentStx[parentIdx]) {
            if (parentStx[parentIdx].hasOwnProperty(key)) {
                parentCopy[key] = parentStx[parentIdx][key];
            }
        }
        parentCopy.token = _.clone(parentCopy.token);
        parentCopy.token.inner = newStx;
        var newParentStx = _(parentStx).toArray();
        newParentStx[parentIdx] = parentCopy;
        return replaceInTree(newParentStx, path);
    }

    function findMacros(src) {
        var stx = parser.read(src);
        return foldReadTree(function(macros, init, rest, path) {
            var res = patternModule.matchPatterns(macroPattern, rest,
                                                  {env: {}}, true);
            if (res.success) {
                var name = patternModule.transcribe(expandN, 0, res.patternEnv);
                var con = patternModule.transcribe(expandE, 0, res.patternEnv);
                return macros.concat(findMacroRules(name, con));
            }
            return macros;
        }, stx, []);
    }

    function findMacroRules(name, m) {
        return foldReadTree(function(macros, init, rest, path) {
            var res = patternModule.matchPatterns(rulePattern, rest,
                                                  {env: {}}, true);
            if (res.success) macros.push(new MacroRule(name, res.patternEnv));
            return macros;
        }, m, []);
    }

    function MacroRule(name, patternEnv) {
        this.expansion = patternModule.transcribe(expandE, 0, patternEnv);
        this.expansionRule = patternModule.loadPattern(this.expansion);
        this.pattern = patternModule.transcribe(expandP, 0, patternEnv);
        this.pattern = name.concat(this.pattern);
        this.patternRule = patternModule.loadPattern(this.pattern);
        this.findPatternEnvLevels();
        this.addClassesToExpansionPattern();
        this.removeClassesFromPattern();
    }

    MacroRule.prototype.getSimpleClasses = function() {
        var env = {};
        foldReadTree(function(t, init, rest, path) {
            var tok = rest[0];
            if (!tok) return;
            if (tok.type === parser.Token.Identifier && tok.class != 'token') {
                env[tok.value] = tok.class;
            }
        }, this.patternRule);
        return env;
    }

    MacroRule.prototype.addClassesToExpansionPattern = function() {
        var env = this.getSimpleClasses();
        foldReadTree(function(t, init, rest, path) {
            var tok = rest[0];
            if (!tok) return;
            if (tok.type === parser.Token.Identifier && env[tok.value]) {
                tok.class = env[tok.value];
            }
        }, this.expansionRule);
    }

    MacroRule.prototype.removeClassesFromPattern = function() {
        var env = this.getSimpleClasses();
        foldReadTree(function(t, init, rest, path) {
            var tok = rest[0].token;
            if (!tok) return;
            if (tok.type === parser.Token.Identifier && env[tok.value]) {
                if (rest[1] && rest[1].token.value === ':') {
                    var idx = path[path.length - 1];
                    var stx = path[path.length - 2];
                    stx.splice(idx + 1, 2);
                }
            }
        }, this.pattern);
    }

    function startRange(token) {
        if (!token) return Number.MAX_VALUE;
        if (token.token) token = token.token;
        if (token.type === parser.Token.Delimiter) {
            return token.startRange[0];
        }
        return token.range[0];
    }

    function endRange(token) {
        if (!token) return 0;
        if (token.token) token = token.token;
        if (token.type === parser.Token.Delimiter) {
            return token.endRange[1];
        }
        return token.range[1];
    }

    MacroRule.prototype.isInMacro = function(token) {
        var start = startRange(this.pattern[0]);
        var end = endRange(_.last(this.expansion));
        return endRange(token) >= start && startRange(token) <= end;
    }

    MacroRule.prototype.levelsOfPath = function(path) {
        if (path.length === 0) {
            return 0;
        }
        var parentIdx = path.pop();
        var parentStx = path.pop();
        var repeat = parentStx[parentIdx].repeat;
        return (repeat ? 1 : 0) + this.levelsOfPath(path);
    }

    MacroRule.prototype.findPatternEnvLevels = function() {
        var self = this;
        this.envLevels = {};
        foldReadTree(function(t, init, rest, path) {
            var tok = rest[0];
            if (!tok) return;
            if (tok.type === parser.Token.Identifier &&
                tok.class === 'token' &&
                tok.value[0] === '$') {
                self.envLevels[tok.value] = {
                    level: self.levelsOfPath(_(path).toArray())
                };
            }
        }, this.patternRule);
    }

    MacroRule.prototype.tryMatch = function(init, rest, path, src, expanded) {
        var c = {env: {}};
        if (rest.length === 0 || this.isInMacro(rest[0])) return;
        var res = patternModule.matchPatterns(this.expansionRule, rest, c, true, _.clone(this.envLevels));
        // This is necessary because of Github issue #174
        if (!_.all(res.patternEnv, function(v) { return !!v.match; })) return;
        if (!res.success || rest.length === res.rest.length) return;
        var matched =  _.initial(rest, res.rest.length);
        var rep = patternModule.transcribe(this.pattern, 0, res.patternEnv);
        var newStx = _.flatten([init, rep, res.rest], true);
        // var newTree = replaceInTree(newStx, _.initial(path, 2));
        var prefix = src.slice(0, startRange(rest[0]));
        var suffix = src.slice(Math.min(src.length, startRange(res.rest[0])));
        var repSrc = syntax.prettyPrint(expander.flatten(rep));
        var newSrc = prefix + repSrc + suffix;
        try {
            // this might fail with an exception
            var newExpanded = {
                inner: sweet.expand(newSrc),
                type: parser.Token.Delimiter
            };
            if (patternModule.isEquivPatternEnvToken(expanded, newExpanded)) {
                return {
                    matchedTokens: matched,
                    matchedSrc: syntax.prettyPrint(expander.flatten(matched)),
                    replacement: repSrc,
                    replacedSrc: newSrc
                }
            }
        } catch(e) { }
    }

    function findReverseMatches(src) {
        var stx = parser.read(src);
        stx = expander.adjustLineContext(stx, stx[0]);
        var macros = findMacros(src);
        var expanded = {
            inner: sweet.expand(src),
            type: parser.Token.Delimiter
        };
        var res = foldReadTree(function(matches, init, rest, path) {
            for (var i = 0; i < macros.length; i++) {
                var match = macros[i].tryMatch(init, rest, path, src, expanded);
                if (match) matches.push(match);
            }
            return matches;
        }, stx, []);
        return res;
    }

    exports.findMacros = findMacros;
    exports.findReverseMatches = findReverseMatches;
}));
