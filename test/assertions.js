import { parse, compile } from "../src/sweet";
import expect from "expect.js";
import { zip, curry, equals, cond, identity, T, and, compose, type, mapObjIndexed, map, keys, has } from 'ramda';
import { transform } from 'babel-core';
import Reader from "../src/shift-reader";
import { Enforester } from "../src/enforester";
import { List } from "immutable";

function expr(program) {
  return stmt(program).expression;
}

function stmt(program) {
  return program.items[0];
}

function makeEnforester(code) {
  let reader = new Reader(code);
  let stxl = reader.read();
  return new Enforester(stxl, List(), {});
}

export function testParseFailure() {
  // TODO
}

function testParseWithOpts(code, acc, expectedAst, options) {
  let parsedAst = parse(code, options);
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

export function testModule(code, loader, expectedAst) {
  return testParseWithOpts(code, x => x, expectedAst, {
    loc: false,
    moduleResolver: x => x,
    moduleLoader: path => loader[path]
  });
}

// if a property has the string <<hygiene> it is ignored
function testParse(code, acc, expectedAst) {
  return testParseWithOpts(code, acc, expectedAst, {
    loc: false,
    moduleResolver: () => "",
    moduleLoader: () => "",
  });
}

function testEval(source, expectedOutput) {
  let result = compile(source, { cwd: '.', transform });
  var output;
  eval(result.code);
  expect(output).to.eql(expectedOutput);
}

export function testThrow(source) {
  expect(() => compile(source, { cwd: '.', transform})).to.throwError();
}

export {
  makeEnforester, expr, stmt, testParse, testEval
};
