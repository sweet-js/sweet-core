
import test from 'ava';
import { compile } from '../src/sweet.js';

function compileLib(t, input) {
  // just want to assert no errors were thrown and we got back *something*
  let result = compile(input);
  t.not(result.code, '');
} 
compileLib.title = (title, input) => `Compiling: ${input}`;

test(compileLib, './node_modules/jquery/dist/jquery.js');
test(compileLib, './node_modules/angular/angular.js');
