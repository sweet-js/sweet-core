/*
 * This is a JavaScript Scratchpad.
 *
 * Enter some JavaScript, then Right Click or choose from the Execute Menu:
 * 1. Run to evaluate the selected text,
 * 2. Inspect to bring up an Object Inspector on the result, or,
 * 3. Display to insert the result in a comment after the selection.
 */
var i = 0;
function f() {};

// Function Declarations
f(); function foo() {} /42/i
/*
/42/i
*/
{false} function foo() {} /42/i
/*
/42/i
*/
if (false) false 
function foo() {} /42/i
/*
/42/i
*/
i = 0;function foo() {} /42/i
/*
/42/i
*/
if (false) {} function foo() {} /42/i
/*
/42/i
*/
function foo() {} function foo() {} /42/i
/*
/42/i
*/
if (false) function foo() {} /42/i
/*
/42/i
*/
{function foo() {} /42/i}
/*
/42/i
*/
foo
function foo() {} /42/i
/*
/42/i
*/
42
function foo() {} /42/i
/*
/42/i
*/
[2,3]
function foo() {} /42/i
/*
/42/i
*/
{a: 2}
function foo() {} /42/i
/*
/42/i
*/
"foo"
function foo() {} /42/i
/*
/42/i
*/
/42/i
function foo() {} /42/i
/*
/42/i
*/
for (;;) {
    break
    function foo() {} /42/i
}
/*
undefined
*/

debugger 
function foo() {} /42/i
/*
/42/i
*/

switch ("foo") {
    case "foo": {true;}
    case function foo() {} /42/i: {true;}
}
/*
undefined
*/
if(false) 
false 
else 
function foo() {} /42/i
/*
/42/i
*/
[42][0]
function foo() {} /42/i
/*
/42/i
*/



// Function Expressions
x = function foo() {} /42/i
/*
NaN
*/
x = 42 / function foo() {} /42/i
/*
NaN
*/
42 >> function foo() {} /42/i
/*
42
*/
i = 0;+function foo() {} /42/i
/*
NaN
*/
(function foo() {} /42/i)
/*
NaN
*/
foo /
function foo() {} /42/i
/*
NaN
*/
new function foo() {} /42/i
/*
NaN
*/
typeof function foo() {} /42/i
/*
NaN
*/
2 in function foo() {} /42/i
/*
Exception: invalid 'in' operand NaN
@Scratchpad:1
*/
(function foo() {
   return function foo() {} /42/i
})()
/*
NaN
*/
do function foo() {} /42/ while (false);
/*
Exception: missing while after do-loop body
Scratchpad:1
*/
void function foo() {} /42/i
/*
NaN
*/
[function foo() {} /42/i]
/*
NaN
*/
4,
function foo() {} /42/i
/*
NaN
*/
++function foo() {} /42/i
/*
Exception: invalid increment operand
Scratchpad:1
*/

x /= function foo() {} /42/i
/*
NaN
*/


// parse errors
if (false) false function foo() {} /42/i
/*
Exception: missing ; before statement
Scratchpad:1
*/
