import Syntax, { makeIdentifier } from "../src/syntax";
import expect from "expect.js";
import Scope from "../src/scope";
import BindingMap from "../src/bindingMap";

import Reader from "../src/shift-reader";
import { serialize, deserialize } from "../src/serializer";

import { Symbol, gensym } from "../src/symbol";

describe('syntax objects', () => {
    it('that have no bindings or scopes should resolve to their original name ', () => {
        let foo = makeIdentifier('foo');
        expect(foo.resolve()).to.be('foo');
    });

    it('where one identifier has a scope and associated binding and the other does not will resolve to different names', () => {
        let bindings = new BindingMap();
        let scope1 = new Scope(bindings, "1");

        let foo = makeIdentifier('foo');
        let foo_1 = makeIdentifier('foo');

        foo_1 = foo_1.addScope(scope1);

        bindings.add(foo_1, gensym('foo'));

        expect(foo.resolve()).to.not.be(foo_1.resolve());
    });

    it('resolve to different bindings when both identifiers have a binding on a different scope', () => {
        let bindings = new BindingMap();
        let scope1 = new Scope(bindings, "1");
        let scope2 = new Scope(bindings, "2");

        let foo_1 = makeIdentifier('foo');
        let foo_2 = makeIdentifier('foo');

        foo_1 = foo_1.addScope(scope1);
        foo_2 = foo_2.addScope(scope2);

        bindings.add(foo_1, gensym('foo'));
        bindings.add(foo_2, gensym('foo'));

        expect(foo_1.resolve()).to.not.be(foo_2.resolve());
    });

    it('should resolve when syntax object has a scopeset that is a superset of the binding', () => {
        let bindings = new BindingMap();
        let scope1 = new Scope(bindings, "1");
        let scope2 = new Scope(bindings, "2");
        let scope3 = new Scope(bindings, "3");

        let foo_1 = makeIdentifier('foo');
        let foo_123 = makeIdentifier('foo');

        foo_1 = foo_1.addScope(scope1);

        foo_123 = foo_123.addScope(scope1)
                         .addScope(scope2)
                         .addScope(scope3);

        bindings.add(foo_1, gensym('foo'));

        expect(foo_1.resolve()).to.be(foo_123.resolve());
    });

    it('should throw an error for ambiguous scops sets', () => {
        let bindings = new BindingMap();
        let scope1 = new Scope(bindings, "1");
        let scope2 = new Scope(bindings, "2");
        let scope3 = new Scope(bindings, "3");

        let foo_13 = makeIdentifier('foo');
        let foo_12 = makeIdentifier('foo');
        let foo_123 = makeIdentifier('foo');

        foo_13 = foo_13.addScope(scope1)
                       .addScope(scope3);

        foo_12 = foo_12.addScope(scope1)
                       .addScope(scope2);

        foo_123 = foo_123.addScope(scope1)
                         .addScope(scope2)
                         .addScope(scope3);

        bindings.add(foo_13, gensym('foo'));
        bindings.add(foo_12, gensym('foo'));

        expect(() => foo_123.resolve()).to.throwError();
    });
});

describe('serializing', () => {
    it('should work for a numeric literal', () => {
        let reader = new Reader("42");
        let json = serialize.write(reader.read());
        let stxl = deserialize.read(json);

        expect(stxl.get(0).isNumericLiteral()).to.be(true);
        expect(stxl.get(0).val()).to.be(42);
    });

    it('should work for a string literal', () => {
        let reader = new Reader("'foo'");
        let json = serialize.write(reader.read());
        let stxl = deserialize.read(json);

        expect(stxl.get(0).isStringLiteral()).to.be(true);
        expect(stxl.get(0).val()).to.be('foo');
    });

    it('should work for a paren delimiter', () => {
        let reader = new Reader("( 42 )");
        let json = serialize.write(reader.read());
        let stxl = deserialize.read(json);

        expect(stxl.get(0).isParenDelimiter()).to.be(true);
        expect(stxl.get(0).inner().get(0).isNumericLiteral()).to.be(true);
        expect(stxl.get(0).inner().get(0).val()).to.be(42);
    });
});
