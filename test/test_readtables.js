var expect = require("expect.js");
var sweet = require("../build/lib/sweet");
var parser = require("../build/lib/parser");
var syn = require("../build/lib/syntax");
var _ = require("underscore");

var read = _.wrap(parser.read, function(read_func, read_arg) {
    return syn.syntaxToTokens(read_func(read_arg));
});

describe("readtables", function() {
    it("should replace a single token", function() {
        parser.setReadtable(parser.currentReadtable().extend({
            '*': function(ch, parser) {
                parser.scanPunctuator();
                return {
                    type: parser.Token.StringLiteral,
                    value: 'Hello'
                };
            }
        }));

        var tokens = read('foo * bar');
        expect(tokens[0].value).to.be('foo');
        expect(tokens[1].value).to.be('Hello');
        expect(tokens[2].value).to.be('bar');
    });

    it("should splice in several tokens", function() {
        parser.setReadtable(parser.currentReadtable().extend({
            '^': function(ch, parser) {
                parser.scanPunctuator();
                return [
                    {  type: parser.Token.StringLiteral,
                       value: 'splice1' },
                    {  type: parser.Token.StringLiteral,
                       value: 'splice2' }
                ];
            }
        }));

        var tokens = read('foo ^ bar');
        expect(tokens[0].value).to.be('foo');
        expect(tokens[1].value).to.be('splice1');
        expect(tokens[2].value).to.be('splice2');
        expect(tokens[3].value).to.be('bar');
    });

    it("should only trigger on punctuators", function() {
        parser.setReadtable(parser.currentReadtable().extend({
            'a': function(ch, parser) {
                throw new Error('bad');
            },
            '$': function(ch, parser) {
                throw new Error('bad');
            },
            '(': function(ch, parser) {
                throw new Error('bad');
            },
            '{': function(ch, parser) {
                throw new Error('bad');
            },
            '&': function(ch, parser) {
                parser.scanPunctuator();
                return {
                    type: parser.Token.StringLiteral,
                    value: 'good'
                };
            }
        }));

        var tokens = read('maple apply foo$bar $ (a, b) () {a, b} {} &');
        expect(tokens[tokens.length-2].value).to.be('good');
    }),

    it("should handle recursive invocations", function() {
        parser.setReadtable(parser.currentReadtable().extend({
            '^': function(ch, parser) {
                parser.scanPunctuator();
                var token = parser.readToken([]);

                // readToken can add more tokens to the buffer if
                // another readtable was invoked, which can be
                // confusing, but it's up to you to interact with it
                // properly
                while(parser.peekQueued()) {
                    token.value += '-' + parser.readToken([]).value;
                }
                
                return [
                    {  type: parser.Token.StringLiteral,
                       value: token.value },
                    {  type: parser.Token.StringLiteral,
                       value: 'good' }
                ];
            }
        }));

        var tokens = read('^^foo');
        expect(tokens[0].value).to.be('foo-good');
        expect(tokens[1].value).to.be('good');
    })
})
