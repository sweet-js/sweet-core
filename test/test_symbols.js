import expect from "expect.js";

import { Symbol, gensym } from "../src/symbol";

describe('symbols ', () => {
    it('with the same names should be ===', () => {
        let s1 = Symbol('foo');
        let s2 = Symbol('foo');

        expect(s1).to.be(s2);
    });

    it('with two different names should not be ===', () => {
        let s1 = Symbol('foo');
        let s2 = Symbol('bar');

        expect(s1).to.not.be(s2);
    });

    it('two gensyms should not be ===', () => {
        let s1 = gensym();
        let s2 = gensym();

        expect(s1).to.not.be(s2);
    });

    it('two symbols recreated from the names of two gensyms should not be ===', () => {
        let s1 = gensym();
        let s2 = gensym();

        expect(Symbol(s1.name)).to.not.be(Symbol(s2.name));
    });

    it('a symbol recreated from the name of a gensym should not be === with the original gensym', () => {
        let s1 = gensym();

        expect(Symbol(s1.name)).to.not.be(s1);
    });
});
