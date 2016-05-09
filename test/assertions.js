import { parse, compile } from "../src/sweet";
import expect from "expect.js";
import { zip, curry, equals, cond, identity, T, and, compose, type, mapObjIndexed, map, keys, has } from 'ramda';
import { transform } from 'babel-core';
import Reader from "../src/shift-reader";
import { Enforester } from "../src/enforester";
import { List } from "immutable";

export const stmt = x => x.items[0];
export const expr = x => stmt(x).expression;
export const items = x => x.items;

export function makeEnforester(code) {
  let reader = new Reader(code);
  let stxl = reader.read();
  return new Enforester(stxl, List(), {});
}

export function testParseFailure() {
  // TODO
}

function testParseWithOpts(code, acc, expectedAst, options) {
  let parsedAst = parse(code, options, options.includeImports);
  let isString = (x) => type(x) === 'String';
  let isObject = (x) => type(x) === 'Object';
  let isArray = (x) => type(x) === 'Array';

  function checkObjects(expected, actual) {
    let checkWithHygiene = cond([
      [and(isString, equals('<<hygiene>>')), curry((a, b) => true)],
      [isObject, curry((a, b) => checkObjects(a, b))],
      [isArray, curry((a, b) => map(([a, b]) => checkObjects(a, b), zip(a, b)))],
      [T, curry((a, b) => expect(b).to.be(a))]
    ]);

    mapObjIndexed((prop, key, ob) => {
      let checker = checkWithHygiene(prop);
      expect(actual).to.have.property(key);
      checker(actual[key]);
    }, expected);
  }
  checkObjects(expectedAst, acc(parsedAst));
}


export function testParse(code, acc, expectedAst, loader = {}) {
  return testParseWithOpts(code, acc, expectedAst, {
    loc: false,
    moduleResolver: x => x,
    moduleLoader: path => loader[path],
    includeImports: true
  });
}

export function testEval(source, expectedOutput, loader) {
  let result = compile(source, {
    cwd: '.',
    transform,
    moduleResolver: x => x,
    moduleLoader: path => loader[path],
    includeImports: false
  });
  var output;
  eval(result.code);
  expect(output).to.eql(expectedOutput);
}


export function testThrow(source) {
  expect(() => compile(source, { cwd: '.', transform})).to.throwError();
}
