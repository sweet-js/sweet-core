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

(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports,
                require('underscore'),
                require('./parser'),
                require("./patterns"),
                require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports',
                'underscore',
                'parser',
                'syntax',
                'scopedEval',
                'patterns',
                'escodegen'], factory);
    }
}(this, function(exports, _, parser, patternModule, gen) {
    'use strict';
    // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    var codegen = typeof escodegen !== "undefined" ? escodegen : gen;


    function asPattern(src) {
        return _.initial(patternModule.loadPattern(parser.read(src)));
    }

    var rulePattern = asPattern("rule { $p ... } => { $e ... }");
    var expandP = _.initial(parser.read("$p..."));
    var expandE = _.initial(parser.read("$e..."));

    // Pre-order traversal of read tree, provides rest tokens at each step
    //
    // fn :: a -> Token -> a
    // stx :: [Token] (can be nested)
    // initial :: a
    function foldReadTree(fn, stx, initial) {
        var current = initial;
        for (var i = 0; i < stx.length; i++) {
            current = fn(current, stx.slice(i));
            if (stx[i].token.type === parser.Token.Delimiter) {
                current = foldReadTree(fn, stx[i].token.inner, current);
            }
        }
        return current;
    }

    function findMacroRules(stx) {
        return foldReadTree(function(macros, rest) {
            var res = patternModule.matchPatterns(rulePattern, rest, {env: {}});
            if (res.success) macros.push({
                pattern: patternModule.transcribe(expandP, 0, res.patternEnv),
                expansion: patternModule.transcribe(expandE, 0, res.patternEnv)
            });
            return macros;
        }, stx, []);
    }

    function findReverseMatches(stx) {
        debugger;
        var patterns = findMacroRules(stx).map(function(rule) {
            return patternModule.loadPattern(rule.expansion);
        });
        return foldReadTree(function(matches, rest) {
            for (var i = 0; i < patterns.length; i++) {
                var ctx = {env: {}};
                var res = patternModule.matchPatterns(patterns[i], rest, ctx, true);
                // if matched and actually consumed tokens
                if (res.success && rest.length > res.rest.length) {
                    // TODO add replemcement and test whether it compiles
                    matches.push({
                        matchedTokens: _.initial(rest, res.rest.length),
                        replacement: "<not implemented yet>"
                    });
                }
            }
            return matches;
        }, stx, []);
    }

    exports.findMacroRules = findMacroRules;
    exports.findReverseMatches = findReverseMatches;
}));
