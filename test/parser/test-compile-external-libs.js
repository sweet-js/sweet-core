import test from 'ava';
import { compile } from '../../src/sweet.js';
import NodeLoader from '../../src/node-loader';

function compileLib(t, input) {
  // just want to assert no errors were thrown and we got back *something*
  let result = compile(input, new NodeLoader(__dirname));
  t.not(result.code, '');
}
compileLib.title = (title, input) => `Compiling: ${input}`;

test(compileLib, '../../node_modules/jquery/dist/jquery.js');
test(compileLib, '../../node_modules/angular/angular.js');
