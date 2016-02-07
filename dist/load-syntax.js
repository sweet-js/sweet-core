'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _ = _interopRequireWildcard(_ramda);

var _termExpander = require('./term-expander');

var _termExpander2 = _interopRequireDefault(_termExpander);

var _immutable = require('immutable');

var _parseReducer = require('./parse-reducer.js');

var _parseReducer2 = _interopRequireDefault(_parseReducer);

var _shiftReducer = require('shift-reducer');

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _serializer = require('./serializer');

var _syntax = require('./syntax');

var _syntax2 = _interopRequireDefault(_syntax);

var _shiftCodegen = require('shift-codegen');

var _shiftCodegen2 = _interopRequireDefault(_shiftCodegen);

var _babelCore = require('babel-core');

var _transforms = require('./transforms');

var _terms = require('./terms');

var _terms2 = _interopRequireDefault(_terms);

var _shiftReader = require('./shift-reader');

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _templateProcessor = require('./template-processor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// indirect eval so in the global scope
var geval = eval;

function sanitizeReplacementValues(values) {
  if (Array.isArray(values)) {
    return sanitizeReplacementValues((0, _immutable.List)(values));
  } else if (_immutable.List.isList(values)) {
    return values.map(sanitizeReplacementValues);
  } else if (values == null) {
    throw new Error("replacement values for syntax template must not but null or undefined");
  }
  return values;
}

// (Expression, Context) -> [function]
function loadForCompiletime(expr, context) {
  var deserializer = (0, _serializer.makeDeserializer)(context.bindings);
  var sandbox = {
    syntaxQuote: function syntaxQuote(strings) {
      for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }

      var ctx = deserializer.read(_.last(values));
      var reader = new _shiftReader2.default(strings, ctx.context, _.take(values.length - 1, values));
      return reader.read();
    },
    syntaxTemplate: function syntaxTemplate(str) {
      for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      return (0, _templateProcessor.replaceTemplate)(deserializer.read(str), sanitizeReplacementValues(values));
    }
  };

  var sandboxKeys = (0, _immutable.List)(Object.keys(sandbox));
  var sandboxVals = sandboxKeys.map(function (k) {
    return sandbox[k];
  }).toArray();

  var parsed = (0, _shiftReducer2.default)(new _parseReducer2.default(), new _terms2.default("Module", {
    directives: (0, _immutable.List)(),
    items: _immutable.List.of(new _terms2.default("ExpressionStatement", {
      expression: new _terms2.default("FunctionExpression", {
        isGenerator: false,
        name: null,
        params: new _terms2.default("FormalParameters", {
          items: sandboxKeys.map(function (param) {
            return new _terms2.default("BindingIdentifier", {
              name: _syntax2.default.fromIdentifier(param)
            });
          }),
          rest: null
        }),
        body: new _terms2.default("FunctionBody", {
          directives: _immutable.List.of(new _terms2.default('Directive', {
            rawValue: 'use strict'
          })),
          statements: _immutable.List.of(new _terms2.default("ReturnStatement", {
            expression: expr
          }))
        })
      })
    }))
  }));

  // TODO: should just pass an AST to babel but the estree converter still
  // needs some work so until then just gen a string
  // let estree = convert.toSpiderMonkey(parsed);
  // let result = transform.fromAst(wrapForCompiletime(estree, sandboxKeys));

  // let result = babel.transform(wrapForCompiletime(estree, sandboxKeys));
  var gen = (0, _shiftCodegen2.default)(parsed, new _shiftCodegen.FormattedCodeGen());
  var result = (0, _babelCore.transform)(gen);
  return geval(result.code).apply(undefined, sandboxVals);
}

// function wrapForCompiletime(ast, keys) {
//   // todo: hygiene
//   let params = keys.map(k => new Identifier(k));
//   let body = new ReturnStatement(ast);
//   let fn = new FunctionExpression(null, params, new BlockStatement([body]));
//   return new Program([new ExpressionStatement(fn)]);
// }

var loadSyntax = _.cond([[_.where({ binding: _terms.isBindingIdentifier }), _.curry(function (_ref, context, env) {
  var binding = _ref.binding;
  var init = _ref.init;

  // finish the expansion early for the initialization
  var termExpander = new _termExpander2.default(context);
  var initValue = loadForCompiletime(termExpander.expand(init), context);

  env.set(binding.name.resolve(), new _transforms.CompiletimeTransform(initValue));
})], [_.T, function (_) {
  return assert(false, "not implemented yet");
}]]);

exports.default = loadSyntax;
//# sourceMappingURL=load-syntax.js.map
