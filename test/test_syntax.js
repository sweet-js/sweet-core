import Syntax, { makeIdentifier } from "../src/syntax";
import expect from "expect.js";

import { Symbol, gensym } from "../src/symbol";

describe('syntax object', () => {
    describe('resolve', () => {
        it('should resolve to the name originally given if there is no scope set', () => {
            let id = makeIdentifier('foo');
            expect(id.resolve()).to.be('foo');
        });

        it('should do what I want', () => {
            let name = Symbol('name');
            // let scope = makeScope();
            // scope.addBinding
            // let id = makeIdentifier('foo');
        });
    });
});
