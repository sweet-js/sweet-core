'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeReplacementValues = sanitizeReplacementValues;
exports.evalRuntimeValues = evalRuntimeValues;
exports.evalCompiletimeValue = evalCompiletimeValue;

var _ramda = require('ramda');

var _ = _interopRequireWildcard(_ramda);

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

var _terms = require('./terms');

var _terms2 = _interopRequireDefault(_terms);

var _shiftReader = require('./shift-reader');

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _macroContext = require('./macro-context');

var _templateProcessor = require('./template-processor');

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function sanitizeReplacementValues(values) {
  if (Array.isArray(values)) {
    return sanitizeReplacementValues((0, _immutable.List)(values));
  } else if (_immutable.List.isList(values)) {
    return values.map(sanitizeReplacementValues);
  } else if (values == null) {
    throw new Error("replacement values for syntax template must not be null or undefined");
  } else if (typeof values.next === 'function') {
    return sanitizeReplacementValues((0, _immutable.List)(values));
  }
  return (0, _macroContext.unwrap)(values);
}

function evalRuntimeValues(terms, context) {
  let prepped = terms.reduce((acc, term) => {
    if ((0, _terms.isExport)(term)) {
      if ((0, _terms.isVariableDeclaration)(term.declaration)) {
        return acc.concat(new _terms2.default('VariableDeclarationStatement', {
          declaration: term.declaration
        })).concat(term.declaration.declarators.map(decl => {
          return new _terms2.default('ExpressionStatement', {
            expression: new _terms2.default('AssignmentExpression', {
              binding: new _terms2.default('StaticMemberExpression', {
                object: new _terms2.default('IdentifierExpression', {
                  name: _syntax2.default.fromIdentifier('exports')
                }),
                property: decl.binding.name
              }),
              expression: new _terms2.default('IdentifierExpression', {
                name: decl.binding.name
              })
            })
          });
        }));
      }
    } else if ((0, _terms.isImport)(term)) {
      return acc;
    }
    return acc.concat(term);
  }, (0, _immutable.List)());
  let parsed = (0, _shiftReducer2.default)(new _parseReducer2.default(context, false), new _terms2.default('Module', {
    directives: (0, _immutable.List)(),
    items: prepped
  }).gen(false));

  let gen = (0, _shiftCodegen2.default)(parsed, new _shiftCodegen.FormattedCodeGen());
  let result = context.transform(gen, {
    babelrc: true,
    filename: context.filename
  });

  let exportsObj = {};
  context.store.set('exports', exportsObj);

  _vm2.default.runInContext(result.code, context.store.getNodeContext());
  return exportsObj;
}

// (Expression, Context) -> [function]
function evalCompiletimeValue(expr, context) {
  let deserializer = (0, _serializer.makeDeserializer)(context.bindings);
  let sandbox = {
    syntaxQuote: function syntaxQuote(strings) {
      for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }

      let ctx = deserializer.read(_.last(values));
      let reader = new _shiftReader2.default(strings, ctx, _.take(values.length - 1, values));
      return reader.read();
    },
    syntaxTemplate: function syntaxTemplate(str) {
      for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      return (0, _templateProcessor.replaceTemplate)(deserializer.read(str), sanitizeReplacementValues(values));
    }
  };

  let sandboxKeys = (0, _immutable.List)(Object.keys(sandbox));
  let sandboxVals = sandboxKeys.map(k => sandbox[k]).toArray();

  let parsed = (0, _shiftReducer2.default)(new _parseReducer2.default(context), new _terms2.default("Module", {
    directives: (0, _immutable.List)(),
    items: _immutable.List.of(new _terms2.default("ExpressionStatement", {
      expression: new _terms2.default("FunctionExpression", {
        isGenerator: false,
        name: null,
        params: new _terms2.default("FormalParameters", {
          items: sandboxKeys.map(param => {
            return new _terms2.default("BindingIdentifier", {
              name: _syntax2.default.from("identifier", param)
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

  let gen = (0, _shiftCodegen2.default)(parsed, new _shiftCodegen.FormattedCodeGen());
  let result = context.transform(gen, {
    babelrc: true,
    filename: context.filename
  });

  let val = _vm2.default.runInContext(result.code, context.store.getNodeContext());
  return val.apply(undefined, sandboxVals);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2FkLXN5bnRheC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQWdCZ0IseUIsR0FBQSx5QjtRQWFBLGlCLEdBQUEsaUI7UUE4Q0Esb0IsR0FBQSxvQjs7QUEzRWhCOztJQUFZLEM7O0FBQ1o7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7O0FBRUE7O0FBRUE7Ozs7Ozs7O0FBRU8sU0FBUyx5QkFBVCxDQUFtQyxNQUFuQyxFQUEyQztBQUNoRCxNQUFJLE1BQU0sT0FBTixDQUFjLE1BQWQsQ0FBSixFQUEyQjtBQUN6QixXQUFPLDBCQUEwQixxQkFBSyxNQUFMLENBQTFCLENBQVA7QUFDRCxHQUZELE1BRU8sSUFBSSxnQkFBSyxNQUFMLENBQVksTUFBWixDQUFKLEVBQXlCO0FBQzlCLFdBQU8sT0FBTyxHQUFQLENBQVcseUJBQVgsQ0FBUDtBQUNELEdBRk0sTUFFQSxJQUFJLFVBQVUsSUFBZCxFQUFvQjtBQUN6QixVQUFNLElBQUksS0FBSixDQUFVLHNFQUFWLENBQU47QUFDRCxHQUZNLE1BRUEsSUFBSSxPQUFPLE9BQU8sSUFBZCxLQUF1QixVQUEzQixFQUF1QztBQUM1QyxXQUFPLDBCQUEwQixxQkFBSyxNQUFMLENBQTFCLENBQVA7QUFDRDtBQUNELFNBQU8sMEJBQU8sTUFBUCxDQUFQO0FBQ0Q7O0FBRU0sU0FBUyxpQkFBVCxDQUEyQixLQUEzQixFQUFrQyxPQUFsQyxFQUEyQztBQUNoRCxNQUFJLFVBQVUsTUFBTSxNQUFOLENBQWEsQ0FBQyxHQUFELEVBQU0sSUFBTixLQUFlO0FBQ3hDLFFBQUkscUJBQVMsSUFBVCxDQUFKLEVBQW9CO0FBQ2xCLFVBQUksa0NBQXNCLEtBQUssV0FBM0IsQ0FBSixFQUE2QztBQUMzQyxlQUFPLElBQUksTUFBSixDQUFXLG9CQUFTLDhCQUFULEVBQXlDO0FBQ3pELHVCQUFhLEtBQUs7QUFEdUMsU0FBekMsQ0FBWCxFQUVILE1B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LElBRm1DO0FBR3pDLGdCQUFRLG9CQUFTLGtCQUFULEVBQTZCO0FBQ25DLGlCQUFPLFlBQVksR0FBWixDQUFnQixTQUFTO0FBQzlCLG1CQUFPLG9CQUFTLG1CQUFULEVBQThCO0FBQ25DLG9CQUFNLGlCQUFPLElBQVAsQ0FBWSxZQUFaLEVBQTBCLEtBQTFCO0FBRDZCLGFBQTlCLENBQVA7QUFHRCxXQUpNLENBRDRCO0FBTW5DLGdCQUFNO0FBTjZCLFNBQTdCLENBSGlDO0FBV3pDLGNBQU0sb0JBQVMsY0FBVCxFQUF5QjtBQUM3QixzQkFBWSxnQkFBSyxFQUFMLENBQVEsb0JBQVMsV0FBVCxFQUFzQjtBQUN4QyxzQkFBVTtBQUQ4QixXQUF0QixDQUFSLENBRGlCO0FBSTdCLHNCQUFZLGdCQUFLLEVBQUwsQ0FBUSxvQkFBUyxpQkFBVCxFQUE0QjtBQUM5Qyx3QkFBWTtBQURrQyxXQUE1QixDQUFSO0FBSmlCLFNBQXpCO0FBWG1DLE9BQS9CO0FBRGlDLEtBQWhDLENBQVI7QUFGMEQsR0FBbkIsQ0FBbkMsQ0FBYjs7QUEwQkEsTUFBSSxNQUFNLDRCQUFRLE1BQVIsRUFBZ0Isb0NBQWhCLENBQVY7QUFDQSxNQUFJLFNBQVMsUUFBUSxTQUFSLENBQWtCLEdBQWxCLEVBQXVCO0FBQ2xDLGFBQVMsSUFEeUI7QUFFbEMsY0FBVSxRQUFRO0FBRmdCLEdBQXZCLENBQWI7O0FBS0EsTUFBSSxNQUFNLGFBQUcsWUFBSCxDQUFnQixPQUFPLElBQXZCLEVBQTZCLFFBQVEsS0FBUixDQUFjLGNBQWQsRUFBN0IsQ0FBVjtBQUNBLFNBQU8sSUFBSSxLQUFKLENBQVUsU0FBVixFQUFxQixXQUFyQixDQUFQO0FBQ0QiLCJmaWxlIjoibG9hZC1zeW50YXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gJ3JhbWRhJztcbmltcG9ydCB7IExpc3QgfSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IFBhcnNlUmVkdWNlciBmcm9tICcuL3BhcnNlLXJlZHVjZXIuanMnO1xuaW1wb3J0IHJlZHVjZXIgZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCB7IG1ha2VEZXNlcmlhbGl6ZXIgfSBmcm9tICcuL3NlcmlhbGl6ZXInO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBjb2RlZ2VuLCB7IEZvcm1hdHRlZENvZGVHZW4gfSBmcm9tICdzaGlmdC1jb2RlZ2VuJztcbmltcG9ydCBUZXJtLCB7IGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNJbXBvcnQsIGlzRXhwb3J0IH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCBSZWFkZXIgZnJvbSAnLi9zaGlmdC1yZWFkZXInO1xuXG5pbXBvcnQgeyB1bndyYXAgfSBmcm9tICcuL21hY3JvLWNvbnRleHQnO1xuXG5pbXBvcnQgeyByZXBsYWNlVGVtcGxhdGUgfSBmcm9tICcuL3RlbXBsYXRlLXByb2Nlc3Nvcic7XG5cbmltcG9ydCB2bSBmcm9tIFwidm1cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXModmFsdWVzKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcbiAgICByZXR1cm4gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhMaXN0KHZhbHVlcykpO1xuICB9IGVsc2UgaWYgKExpc3QuaXNMaXN0KHZhbHVlcykpIHtcbiAgICByZXR1cm4gdmFsdWVzLm1hcChzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKTtcbiAgfSBlbHNlIGlmICh2YWx1ZXMgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInJlcGxhY2VtZW50IHZhbHVlcyBmb3Igc3ludGF4IHRlbXBsYXRlIG11c3Qgbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZXMubmV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKExpc3QodmFsdWVzKSk7XG4gIH1cbiAgcmV0dXJuIHVud3JhcCh2YWx1ZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZhbFJ1bnRpbWVWYWx1ZXModGVybXMsIGNvbnRleHQpIHtcbiAgbGV0IHByZXBwZWQgPSB0ZXJtcy5yZWR1Y2UoKGFjYywgdGVybSkgPT4ge1xuICAgIGlmIChpc0V4cG9ydCh0ZXJtKSkge1xuICAgICAgaWYgKGlzVmFyaWFibGVEZWNsYXJhdGlvbih0ZXJtLmRlY2xhcmF0aW9uKSkge1xuICAgICAgICByZXR1cm4gYWNjLmNvbmNhdChuZXcgVGVybSgnVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCcsIHtcbiAgICAgICAgICBkZWNsYXJhdGlvbjogdGVybS5kZWNsYXJhdGlvblxuICAgICAgICB9KSkuY29uY2F0KHRlcm0uZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMubWFwKGRlY2wgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybSgnRXhwcmVzc2lvblN0YXRlbWVudCcsIHtcbiAgICAgICAgICAgIGV4cHJlc3Npb246IG5ldyBUZXJtKCdBc3NpZ25tZW50RXhwcmVzc2lvbicsIHtcbiAgICAgICAgICAgICAgYmluZGluZzogbmV3IFRlcm0oJ1N0YXRpY01lbWJlckV4cHJlc3Npb24nLCB7XG4gICAgICAgICAgICAgICAgb2JqZWN0OiBuZXcgVGVybSgnSWRlbnRpZmllckV4cHJlc3Npb24nLCB7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIoJ2V4cG9ydHMnKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBkZWNsLmJpbmRpbmcubmFtZVxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgZXhwcmVzc2lvbjogbmV3IFRlcm0oJ0lkZW50aWZpZXJFeHByZXNzaW9uJywge1xuICAgICAgICAgICAgICAgIG5hbWU6IGRlY2wuYmluZGluZy5uYW1lXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0ltcG9ydCh0ZXJtKSkge1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9XG4gICAgcmV0dXJuIGFjYy5jb25jYXQodGVybSk7XG4gIH0sIExpc3QoKSk7XG4gIGxldCBwYXJzZWQgPSByZWR1Y2VyKG5ldyBQYXJzZVJlZHVjZXIoY29udGV4dCwgZmFsc2UpLCBuZXcgVGVybSgnTW9kdWxlJywge1xuICAgIGRpcmVjdGl2ZXM6IExpc3QoKSxcbiAgICBpdGVtczogcHJlcHBlZFxuICB9KS5nZW4oZmFsc2UpKTtcblxuICBsZXQgZ2VuID0gY29kZWdlbihwYXJzZWQsIG5ldyBGb3JtYXR0ZWRDb2RlR2VuKTtcbiAgbGV0IHJlc3VsdCA9IGNvbnRleHQudHJhbnNmb3JtKGdlbiwge1xuICAgIGJhYmVscmM6IHRydWUsXG4gICAgZmlsZW5hbWU6IGNvbnRleHQuZmlsZW5hbWVcbiAgfSk7XG5cbiAgbGV0IGV4cG9ydHNPYmogPSB7fTtcbiAgY29udGV4dC5zdG9yZS5zZXQoJ2V4cG9ydHMnLCBleHBvcnRzT2JqKTtcblxuICB2bS5ydW5JbkNvbnRleHQocmVzdWx0LmNvZGUsIGNvbnRleHQuc3RvcmUuZ2V0Tm9kZUNvbnRleHQoKSk7XG4gIHJldHVybiBleHBvcnRzT2JqO1xufVxuXG4vLyAoRXhwcmVzc2lvbiwgQ29udGV4dCkgLT4gW2Z1bmN0aW9uXVxuZXhwb3J0IGZ1bmN0aW9uIGV2YWxDb21waWxldGltZVZhbHVlKGV4cHIsIGNvbnRleHQpIHtcbiAgbGV0IGRlc2VyaWFsaXplciA9IG1ha2VEZXNlcmlhbGl6ZXIoY29udGV4dC5iaW5kaW5ncyk7XG4gIGxldCBzYW5kYm94ID0ge1xuICAgIHN5bnRheFF1b3RlOiBmdW5jdGlvbiAoc3RyaW5ncywgLi4udmFsdWVzKSB7XG4gICAgICBsZXQgY3R4ID0gZGVzZXJpYWxpemVyLnJlYWQoXy5sYXN0KHZhbHVlcykpO1xuICAgICAgbGV0IHJlYWRlciA9IG5ldyBSZWFkZXIoc3RyaW5ncywgY3R4LCBfLnRha2UodmFsdWVzLmxlbmd0aCAtIDEsIHZhbHVlcykpO1xuICAgICAgcmV0dXJuIHJlYWRlci5yZWFkKCk7XG4gICAgfSxcbiAgICBzeW50YXhUZW1wbGF0ZTogZnVuY3Rpb24oc3RyLCAuLi52YWx1ZXMpIHtcbiAgICAgIHJldHVybiByZXBsYWNlVGVtcGxhdGUoZGVzZXJpYWxpemVyLnJlYWQoc3RyKSwgc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyh2YWx1ZXMpKTtcbiAgICB9XG4gIH07XG5cbiAgbGV0IHNhbmRib3hLZXlzID0gTGlzdChPYmplY3Qua2V5cyhzYW5kYm94KSk7XG4gIGxldCBzYW5kYm94VmFscyA9IHNhbmRib3hLZXlzLm1hcChrID0+IHNhbmRib3hba10pLnRvQXJyYXkoKTtcblxuICBsZXQgcGFyc2VkID0gcmVkdWNlcihuZXcgUGFyc2VSZWR1Y2VyKGNvbnRleHQpLCBuZXcgVGVybShcIk1vZHVsZVwiLCB7XG4gICAgZGlyZWN0aXZlczogTGlzdCgpLFxuICAgIGl0ZW1zOiBMaXN0Lm9mKG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7XG4gICAgICBleHByZXNzaW9uOiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7XG4gICAgICAgIGlzR2VuZXJhdG9yOiBmYWxzZSxcbiAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgcGFyYW1zOiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge1xuICAgICAgICAgIGl0ZW1zOiBzYW5kYm94S2V5cy5tYXAocGFyYW0gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge1xuICAgICAgICAgICAgICBuYW1lOiBTeW50YXguZnJvbShcImlkZW50aWZpZXJcIiwgcGFyYW0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgICByZXN0OiBudWxsXG4gICAgICAgIH0pLFxuICAgICAgICBib2R5OiBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7XG4gICAgICAgICAgZGlyZWN0aXZlczogTGlzdC5vZihuZXcgVGVybSgnRGlyZWN0aXZlJywge1xuICAgICAgICAgICAgcmF3VmFsdWU6ICd1c2Ugc3RyaWN0J1xuICAgICAgICAgIH0pKSxcbiAgICAgICAgICBzdGF0ZW1lbnRzOiBMaXN0Lm9mKG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtcbiAgICAgICAgICAgIGV4cHJlc3Npb246IGV4cHJcbiAgICAgICAgICB9KSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSkpXG4gIH0pKTtcblxuICBsZXQgZ2VuID0gY29kZWdlbihwYXJzZWQsIG5ldyBGb3JtYXR0ZWRDb2RlR2VuKTtcbiAgbGV0IHJlc3VsdCA9IGNvbnRleHQudHJhbnNmb3JtKGdlbiwge1xuICAgIGJhYmVscmM6IHRydWUsXG4gICAgZmlsZW5hbWU6IGNvbnRleHQuZmlsZW5hbWVcbiAgfSk7XG5cbiAgbGV0IHZhbCA9IHZtLnJ1bkluQ29udGV4dChyZXN1bHQuY29kZSwgY29udGV4dC5zdG9yZS5nZXROb2RlQ29udGV4dCgpKTtcbiAgcmV0dXJuIHZhbC5hcHBseSh1bmRlZmluZWQsIHNhbmRib3hWYWxzKTtcbn1cbiJdfQ==