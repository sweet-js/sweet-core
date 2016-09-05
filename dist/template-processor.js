'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processTemplate = processTemplate;
exports.replaceTemplate = replaceTemplate;

var _immutable = require('immutable');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _syntax = require('./syntax');

var _syntax2 = _interopRequireDefault(_syntax);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
Given a syntax list like:

  [foo, bar, $, { 42, +, 24 }, baz]

convert it to:

  [foo, bar, $, { 0 }, baz]

and return another list with the interpolated values at the corresponding
positions.

Requires either lookahead/lookbehind of one (to see the $).
*/

const isDolar = s => s && typeof s.match === 'function' && s.match("identifier") && s.val() === '$';
const isDelimiter = s => s && typeof s.match === 'function' && s.match("delimiter");
const isBraces = s => s && typeof s.match === 'function' && s.match("braces");
const isParens = s => s && typeof s.match === 'function' && s.match("parens");
const isBrackets = s => s && typeof s.match === 'function' && s.match("brackets");

const insertIntoDelimiter = _ramda2.default.cond([[isBraces, (s, r) => _syntax2.default.from("braces", r, s)], [isParens, (s, r) => _syntax2.default.from("parens", r, s)], [isBrackets, (s, r) => _syntax2.default.from("brackets", r, s)]]);

const process = (acc, s) => {
  if (isBraces(s) && isDolar(acc.template.last())) {
    return {
      template: acc.template.push(_syntax2.default.from("braces", _immutable.List.of(_syntax2.default.from("number", acc.interp.size)), s)),
      interp: acc.interp.push(s.inner())
    };
  } else if (isDelimiter(s)) {
    let innerResult = processTemplate(s.inner(), acc.interp);
    return {
      template: acc.template.push(insertIntoDelimiter(s, innerResult.template)),
      interp: innerResult.interp
    };
  } else {
    return {
      template: acc.template.push(s),
      interp: acc.interp
    };
  }
};

function cloneLineNumber(to, from) {
  if (from && to) {
    if (typeof to.setLineNumber === 'function') {
      return to.setLineNumber(from.lineNumber());
    } else if (_immutable.List.isList(to)) {
      return to.map(x => cloneLineNumber(x, from));
    }
  }
  return to;
}

const replace = (acc, s) => {
  let last = acc.template.get(-1);
  let beforeLast = acc.template.get(-2);
  if (isBraces(s) && isDolar(last)) {
    let index = s.inner().first().val();
    (0, _errors.assert)(acc.rep.size > index, "unknown replacement value");
    let replacement = cloneLineNumber(acc.rep.get(index), beforeLast);
    return {
      template: acc.template.pop().concat(replacement),
      rep: acc.rep
    };
  } else if (isDelimiter(s)) {
    let innerResult = replaceTemplate(s.inner(), acc.rep);
    return {
      template: acc.template.push(insertIntoDelimiter(s, innerResult)),
      rep: acc.rep
    };
  } else {
    return {
      template: acc.template.push(s),
      rep: acc.rep
    };
  }
};

function processTemplate(temp) {
  let interp = arguments.length <= 1 || arguments[1] === undefined ? (0, _immutable.List)() : arguments[1];

  return temp.reduce(process, { template: (0, _immutable.List)(), interp: interp });
}

function replaceTemplate(temp, rep) {
  return temp.reduce(replace, { template: (0, _immutable.List)(), rep: rep }).template;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZW1wbGF0ZS1wcm9jZXNzb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUF3RmdCLGUsR0FBQSxlO1FBSUEsZSxHQUFBLGU7O0FBNUZoQjs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsTUFBTSxVQUFjLEtBQUssS0FBSyxPQUFPLEVBQUUsS0FBVCxLQUFtQixVQUF4QixJQUFzQyxFQUFFLEtBQUYsQ0FBUSxZQUFSLENBQXRDLElBQStELEVBQUUsR0FBRixPQUFZLEdBQXBHO0FBQ0EsTUFBTSxjQUFjLEtBQUssS0FBSyxPQUFPLEVBQUUsS0FBVCxLQUFtQixVQUF4QixJQUFzQyxFQUFFLEtBQUYsQ0FBUSxXQUFSLENBQS9EO0FBQ0EsTUFBTSxXQUFjLEtBQUssS0FBSyxPQUFPLEVBQUUsS0FBVCxLQUFtQixVQUF4QixJQUFzQyxFQUFFLEtBQUYsQ0FBUSxRQUFSLENBQS9EO0FBQ0EsTUFBTSxXQUFjLEtBQUssS0FBSyxPQUFPLEVBQUUsS0FBVCxLQUFtQixVQUF4QixJQUFzQyxFQUFFLEtBQUYsQ0FBUSxRQUFSLENBQS9EO0FBQ0EsTUFBTSxhQUFjLEtBQUssS0FBSyxPQUFPLEVBQUUsS0FBVCxLQUFtQixVQUF4QixJQUFzQyxFQUFFLEtBQUYsQ0FBUSxVQUFSLENBQS9EOztBQUVBLE1BQU0sc0JBQXNCLGdCQUFFLElBQUYsQ0FBTyxDQUNqQyxDQUFDLFFBQUQsRUFBVyxDQUFDLENBQUQsRUFBSSxDQUFKLEtBQVUsaUJBQU8sSUFBUCxDQUFZLFFBQVosRUFBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsQ0FBckIsQ0FEaUMsRUFFakMsQ0FBQyxRQUFELEVBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixLQUFVLGlCQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXNCLENBQXRCLEVBQXlCLENBQXpCLENBQXJCLENBRmlDLEVBR2pDLENBQUMsVUFBRCxFQUFhLENBQUMsQ0FBRCxFQUFJLENBQUosS0FB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YSxJQUFiLENBQWtCLENBQWxCLENBREw7QUFFTCxXQUFLLElBQUk7QUFGSixLQUFQO0FBSUQ7QUFDRixDQXZCRDs7QUF5Qk8sU0FBUyxlQUFULENBQXlCLElBQXpCLEVBQWdEO0FBQUEsTUFBakIsTUFBaUIseURBQVIsc0JBQVE7O0FBQ3JELFNBQU8sS0FBSyxNQUFMLENBQVksT0FBWixFQUFxQixFQUFFLFVBQVUsc0JBQVosRUFBb0IsY0FBcEIsRUFBckIsQ0FBUDtBQUNEOztBQUVNLFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUErQixHQUEvQixFQUFvQztBQUN6QyxTQUFPLEtBQUssTUFBTCxDQUFZLE9BQVosRUFBcUIsRUFBRSxVQUFVLHNCQUFaLEVBQW9CLFFBQXBCLEVBQXJCLEVBQWdELFFBQXZEO0FBQ0QiLCJmaWxlIjoidGVtcGxhdGUtcHJvY2Vzc29yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGlzdCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgXyBmcm9tICdyYW1kYSc7XG5pbXBvcnQgU3ludGF4IGZyb20gJy4vc3ludGF4JztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4vZXJyb3JzJztcblxuLypcbkdpdmVuIGEgc3ludGF4IGxpc3QgbGlrZTpcblxuICBbZm9vLCBiYXIsICQsIHsgNDIsICssIDI0IH0sIGJhel1cblxuY29udmVydCBpdCB0bzpcblxuICBbZm9vLCBiYXIsICQsIHsgMCB9LCBiYXpdXG5cbmFuZCByZXR1cm4gYW5vdGhlciBsaXN0IHdpdGggdGhlIGludGVycG9sYXRlZCB2YWx1ZXMgYXQgdGhlIGNvcnJlc3BvbmRpbmdcbnBvc2l0aW9ucy5cblxuUmVxdWlyZXMgZWl0aGVyIGxvb2thaGVhZC9sb29rYmVoaW5kIG9mIG9uZSAodG8gc2VlIHRoZSAkKS5cbiovXG5cbmNvbnN0IGlzRG9sYXIgICAgID0gcyA9PiBzICYmIHR5cGVvZiBzLm1hdGNoID09PSAnZnVuY3Rpb24nICYmIHMubWF0Y2goXCJpZGVudGlmaWVyXCIpICYmIHMudmFsKCkgPT09ICckJztcbmNvbnN0IGlzRGVsaW1pdGVyID0gcyA9PiBzICYmIHR5cGVvZiBzLm1hdGNoID09PSAnZnVuY3Rpb24nICYmIHMubWF0Y2goXCJkZWxpbWl0ZXJcIik7XG5jb25zdCBpc0JyYWNlcyAgICA9IHMgPT4gcyAmJiB0eXBlb2Ygcy5tYXRjaCA9PT0gJ2Z1bmN0aW9uJyAmJiBzLm1hdGNoKFwiYnJhY2VzXCIpO1xuY29uc3QgaXNQYXJlbnMgICAgPSBzID0+IHMgJiYgdHlwZW9mIHMubWF0Y2ggPT09ICdmdW5jdGlvbicgJiYgcy5tYXRjaChcInBhcmVuc1wiKTtcbmNvbnN0IGlzQnJhY2tldHMgID0gcyA9PiBzICYmIHR5cGVvZiBzLm1hdGNoID09PSAnZnVuY3Rpb24nICYmIHMubWF0Y2goXCJicmFja2V0c1wiKTtcblxuY29uc3QgaW5zZXJ0SW50b0RlbGltaXRlciA9IF8uY29uZChbXG4gIFtpc0JyYWNlcywgKHMsIHIpID0+IFN5bnRheC5mcm9tKFwiYnJhY2VzXCIsIHIsIHMpXSxcbiAgW2lzUGFyZW5zLCAocywgcikgPT4gU3ludGF4LmZyb20oXCJwYXJlbnNcIiwgciwgcyldLFxuICBbaXNCcmFja2V0cywgKHMsIHIpID0+IFN5bnRheC5mcm9tKFwiYnJhY2tldHNcIiwgciwgcyldXG5dKTtcblxuY29uc3QgcHJvY2VzcyA9IChhY2MsIHMpID0+IHtcbiAgaWYgKGlzQnJhY2VzKHMpICYmIGlzRG9sYXIoYWNjLnRlbXBsYXRlLmxhc3QoKSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IGFjYy50ZW1wbGF0ZS5wdXNoKFN5bnRheC5mcm9tKFwiYnJhY2VzXCIsIExpc3Qub2YoU3ludGF4LmZyb20oXCJudW1iZXJcIiwgYWNjLmludGVycC5zaXplKSksIHMpKSxcbiAgICAgIGludGVycDogYWNjLmludGVycC5wdXNoKHMuaW5uZXIoKSlcbiAgICB9O1xuICB9IGVsc2UgaWYgKGlzRGVsaW1pdGVyKHMpKSB7XG4gICAgbGV0IGlubmVyUmVzdWx0ID0gcHJvY2Vzc1RlbXBsYXRlKHMuaW5uZXIoKSwgYWNjLmludGVycCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBhY2MudGVtcGxhdGUucHVzaChpbnNlcnRJbnRvRGVsaW1pdGVyKHMsIGlubmVyUmVzdWx0LnRlbXBsYXRlKSksXG4gICAgICBpbnRlcnA6IGlubmVyUmVzdWx0LmludGVycFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBhY2MudGVtcGxhdGUucHVzaChzKSxcbiAgICAgIGludGVycDogYWNjLmludGVycFxuICAgIH07XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsb25lTGluZU51bWJlcih0bywgZnJvbSkge1xuICBpZiAoZnJvbSAmJiB0byApIHtcbiAgICBpZiAodHlwZW9mIHRvLnNldExpbmVOdW1iZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0by5zZXRMaW5lTnVtYmVyKGZyb20ubGluZU51bWJlcigpKTtcbiAgICB9IGVsc2UgaWYgKExpc3QuaXNMaXN0KHRvKSkge1xuICAgICAgcmV0dXJuIHRvLm1hcCh4ID0+IGNsb25lTGluZU51bWJlcih4LCBmcm9tKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0bztcbn1cblxuY29uc3QgcmVwbGFjZSA9IChhY2MsIHMpID0+IHtcbiAgbGV0IGxhc3QgPSBhY2MudGVtcGxhdGUuZ2V0KC0xKTtcbiAgbGV0IGJlZm9yZUxhc3QgPSBhY2MudGVtcGxhdGUuZ2V0KC0yKTtcbiAgaWYgKGlzQnJhY2VzKHMpICYmIGlzRG9sYXIobGFzdCkpIHtcbiAgICBsZXQgaW5kZXggPSBzLmlubmVyKCkuZmlyc3QoKS52YWwoKTtcbiAgICBhc3NlcnQoYWNjLnJlcC5zaXplID4gaW5kZXgsIFwidW5rbm93biByZXBsYWNlbWVudCB2YWx1ZVwiKTtcbiAgICBsZXQgcmVwbGFjZW1lbnQgPSBjbG9uZUxpbmVOdW1iZXIoYWNjLnJlcC5nZXQoaW5kZXgpLCBiZWZvcmVMYXN0KTtcbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IGFjYy50ZW1wbGF0ZS5wb3AoKS5jb25jYXQocmVwbGFjZW1lbnQpLFxuICAgICAgcmVwOiBhY2MucmVwXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpc0RlbGltaXRlcihzKSkge1xuICAgIGxldCBpbm5lclJlc3VsdCA9IHJlcGxhY2VUZW1wbGF0ZShzLmlubmVyKCksIGFjYy5yZXApO1xuICAgIHJldHVybiB7XG4gICAgICB0ZW1wbGF0ZTogYWNjLnRlbXBsYXRlLnB1c2goaW5zZXJ0SW50b0RlbGltaXRlcihzLCBpbm5lclJlc3VsdCkpLFxuICAgICAgcmVwOiBhY2MucmVwXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IGFjYy50ZW1wbGF0ZS5wdXNoKHMpLFxuICAgICAgcmVwOiBhY2MucmVwXG4gICAgfTtcbiAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NUZW1wbGF0ZSh0ZW1wLCBpbnRlcnAgPSBMaXN0KCkpIHtcbiAgcmV0dXJuIHRlbXAucmVkdWNlKHByb2Nlc3MsIHsgdGVtcGxhdGU6IExpc3QoKSwgaW50ZXJwIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZVRlbXBsYXRlKHRlbXAsIHJlcCkge1xuICByZXR1cm4gdGVtcC5yZWR1Y2UocmVwbGFjZSwgeyB0ZW1wbGF0ZTogTGlzdCgpLCByZXAgfSkudGVtcGxhdGU7XG59XG4iXX0=