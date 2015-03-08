#lang "js";

function foo(x, b) {
    function bar(x, y) {
        return x + y + b;
    }
    return x;
}
