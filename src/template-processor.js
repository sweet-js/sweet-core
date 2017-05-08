import { List } from 'immutable';
import _ from 'ramda';
import { assert } from './errors';
import * as T from 'sweet-spec';
import Syntax from './syntax';

/*
Given a syntax list like:

  [foo, bar, $, { 42, +, 24 }, baz]

convert it to:

  [foo, bar, $, { 0 }, baz]

and return another list with the interpolated values at the corresponding
positions.

Requires either lookahead/lookbehind of one (to see the $).
*/

const isDolar = (s: T.SyntaxTerm) =>
  s instanceof T.RawSyntax &&
  typeof s.value.match === 'function' &&
  s.value.match('identifier') &&
  s.value.val() === '$';
const isDelimiter = (s: T.SyntaxTerm) => s instanceof T.RawDelimiter;
const isBraces = (s: T.SyntaxTerm) =>
  s instanceof T.RawDelimiter && s.kind === 'braces';
const isParens = (s: T.SyntaxTerm) =>
  s instanceof T.RawDelimiter && s.kind === 'parens';
const isBrackets = (s: T.SyntaxTerm) =>
  s instanceof T.RawDelimiter && s.kind === 'brackets';

type DelimKind = 'braces' | 'parens' | 'brackets';

const mkDelimiter = (
  kind: DelimKind,
  inner: List<T.SyntaxTerm>,
  from: T.RawDelimiter,
) => {
  return new T.RawDelimiter({
    kind,
    // $FlowFixMe: flow doesn't know arrays are actually lists
    inner: List.of(from.inner.first()).concat(inner).concat(from.inner.last()),
  });
};

const insertIntoDelimiter = _.cond([
  [isBraces, (s, r) => mkDelimiter('braces', r, s)],
  [isParens, (s, r) => mkDelimiter('parens', r, s)],
  [isBrackets, (s, r) => mkDelimiter('brackets', r, s)],
]);

const process = (
  acc: { template: List<T.SyntaxTerm>, interp: List<List<T.SyntaxTerm>> },
  s: T.SyntaxTerm,
) => {
  if (isBraces(s) && isDolar(acc.template.last())) {
    let idx = Syntax.fromNumber(acc.interp.size, s.inner.first().value);
    return {
      template: acc.template.push(
        mkDelimiter(
          'braces',
          List.of(
            new T.RawSyntax({
              value: idx,
            }),
          ),
          s,
        ),
      ),
      interp: acc.interp.push(s.inner.slice(1, s.inner.size - 1)),
    };
  } else if (isDelimiter(s)) {
    let innerResult = processTemplate(
      s.inner.slice(1, s.inner.size - 1),
      acc.interp,
    );
    return {
      template: acc.template.push(insertIntoDelimiter(s, innerResult.template)),
      interp: innerResult.interp,
    };
  } else {
    return {
      template: acc.template.push(s),
      interp: acc.interp,
    };
  }
};

function getLineNumber(t: T.SyntaxTerm) {
  if (t instanceof T.RawSyntax) {
    return t.value.lineNumber();
  }
  return t.inner.first().value.lineNumber();
}

function setLineNumber(t: T.Term | List<T.Term>, lineNumber: number) {
  if (t instanceof T.RawSyntax) {
    return t.extend({
      value: t.value.setLineNumber(lineNumber),
    });
  } else if (t instanceof T.RawDelimiter) {
    return t.extend({
      inner: t.inner.map(tt => setLineNumber(tt, lineNumber)),
    });
  } else if (List.isList(t)) {
    return t.map(tt => setLineNumber(tt, lineNumber));
  }
  // TODO: need to handle line numbers for all AST nodes
  return t;
}

function cloneLineNumber(to: T.Term, from: T.SyntaxTerm) {
  if (from && to) {
    return setLineNumber(to, getLineNumber(from));
  }
  return to;
}

const replace = (
  acc: { template: List<T.SyntaxTerm>, rep: List<T.Term | List<T.Term>> },
  s: T.SyntaxTerm,
) => {
  let last = acc.template.get(-1);
  let beforeLast = acc.template.get(-2);
  if (isBraces(s) && isDolar(last)) {
    let index = s.inner.get(1).value.val();
    assert(acc.rep.size > index, 'unknown replacement value');
    // TODO: figure out holistic solution to line nubmers and ASI
    let replacement = cloneLineNumber(acc.rep.get(index), beforeLast);
    // let replacement = acc.rep.get(index);
    return {
      template: acc.template.pop().concat(replacement),
      rep: acc.rep,
    };
  } else if (isDelimiter(s)) {
    let innerResult = replaceTemplate(
      s.inner.slice(1, s.inner.size - 1),
      acc.rep,
    );
    return {
      template: acc.template.push(insertIntoDelimiter(s, innerResult)),
      rep: acc.rep,
    };
  } else {
    return {
      template: acc.template.push(s),
      rep: acc.rep,
    };
  }
};

export function processTemplate(
  temp: List<T.SyntaxTerm>,
  interp: List<T.SyntaxTerm> = List(),
) {
  return temp.reduce(process, { template: List(), interp });
}

export function replaceTemplate(temp: List<T.SyntaxTerm>, rep: any) {
  return temp.reduce(replace, { template: List(), rep }).template;
}
