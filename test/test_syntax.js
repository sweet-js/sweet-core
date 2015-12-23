import Syntax, { makeIdentifier } from "../src/syntax";
import expect from "expect.js";
import Scope from "../src/scope";
import BindingMap from "../src/bindingMap";

import { Symbol, gensym } from "../src/symbol";

describe('syntax objects', () => {
    it('that have no bindings or scopes should resolve to their original name ', () => {
        let id = makeIdentifier('foo');
        expect(id.resolve()).to.be('foo');
    });

    it('where one identifier has a scope and associated binding and the other does not will resolve to different names', () => {
        let id = makeIdentifier('foo');
        let id2 = makeIdentifier('foo');

        let bindings = new BindingMap();
        let scope = new Scope(bindings, "debug");
        id = id.addScope(scope);

        bindings.add(id, gensym('foo'));

        expect(id.resolve()).to.not.be(id2.resolve());
    });
});
