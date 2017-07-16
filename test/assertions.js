import { List } from 'immutable';

import read from '../src/reader/token-reader';
import { compile, parse } from '../src/sweet';
import { Enforester } from '../src/enforester';
import StoreLoader from '../src/store-loader';

export const stmt = x => x.items[0];
export const expr = x => stmt(x).expression;
export const items = x => x.items;

export function makeEnforester(code) {
  let stxl = read(code);
  return new Enforester(stxl, List(), {});
}

export function getAst(code) {
  const store = new Map();
  store.set('main.js', code);

  const loader = new StoreLoader(__dirname, store);
  return parse('main.js', loader);
}

function testParseWithOpts(t, acc, code, expectedAst) {
  try {
    t.deepEqual(expectedAst, acc(getAst(code)));
  } catch (e) {
    throw new Error(e.message);
  }
}

export function testParse(t, acc, code, expectedAst) {
  return testParseWithOpts(t, acc, code, expectedAst);
}

export function testParseComparison(t, acc, codeA, codeB) {
  testParse(t, acc, codeA, acc(getAst(codeB)));
}

export function testParseFailure() {
  // TODO
}

export function testEval(store, cb) {
  let loader = new StoreLoader(__dirname, store);
  let result = compile('main.js', loader).code;

  var output;
  try {
    eval(result);
  } catch (e) {
    throw new Error(
      `Syntax error: ${e.message}

${result}`,
    );
  }
  return cb(output);
}

export function evalWithStore(t, inputStore, expected) {
  let store = new Map();
  for (let key of Object.keys(inputStore)) {
    store.set(key, inputStore[key]);
  }
  testEval(store, output => t.is(output, expected));
}
evalWithStore.title = (title, inputStore, expected) =>
  `${title}
${Array.from(Object.entries(inputStore))
    .map(([modName, modSrc]) => `${modName}\n----\n${modSrc}\n----`)
    .join('\n')}
> ${expected}`;

export function evalWithOutput(t, input, expected) {
  let store = new Map();
  store.set('main.js', input);
  testEval(store, output => t.is(output, expected));
}
evalWithOutput.title = (title, input, expected) =>
  `${title}
${input}
> ${expected}`;

export function evalThrows(t, input) {
  let store = new Map();
  store.set('main.js', input);
  t.throws(() => testEval(store, () => {}));
}
evalThrows.title = (title, input) =>
  `${title}
${input}
> should have thrown`;

export function testThrow(source) {
  // expect(() => compile(source, { cwd: '.', transform})).to.throwError();
}
