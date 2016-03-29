import { List } from 'immutable';
import { Maybe } from 'ramda-fantasy';
import _ from 'ramda';
import Syntax from './syntax';
import { assert } from './errors';

/*
Given a syntax list like:

  [foo, bar, $, { 42, +, 24 }, baz]

convert it to:

  [foo, bar, $, { 0 }, baz]

and return another list with the interpolated values at the corresponding
positions.

Requires either lookahead/lookbehind of one (to see the $).
*/

const isDolar     = s => s && s instanceof Syntax && s.isIdentifier() && s.val() === '$';
const isDelimiter = s => s && typeof s.isDelimiter === 'function' && s.isDelimiter();
const isBraces    = s => s && typeof s.isBraces === 'function' && s.isBraces();
const isParens    = s => s && typeof s.isParens === 'function' && s.isParens();
const isBrackets  = s => s && typeof s.isBrackets === 'function' && s.isBrackets();

const insertIntoDelimiter = _.cond([
  [isBraces, (s, r) => Syntax.fromBraces(r, s)],
  [isParens, (s, r) => Syntax.fromParens(r, s)],
  [isBrackets, (s, r) => Syntax.fromBrackets(r, s)]
]);

const process = (acc, s) => {
  if (isBraces(s) && isDolar(acc.template.last())) {
    return {
      template: acc.template.push(Syntax.fromBraces(List.of(Syntax.fromNumber(acc.interp.size)), s)),
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
  if (from && to && typeof to.setLineNumber === 'function') {
    return to.setLineNumber(from.lineNumber());
  } 
  return to;
}

const replace = (acc, s) => {
  let last = acc.template.get(-1);
  let beforeLast = acc.template.get(-2);
  if (isBraces(s) && isDolar(last)) {
    let index = s.inner().first().val();
    assert(acc.rep.size > index, "unknown replacement value");
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

export function processTemplate(temp, interp = List()) {
  return temp.reduce(process, { template: List(), interp });
}

export function replaceTemplate(temp, rep) {
  return temp.reduce(replace, { template: List(), rep }).template;
}
