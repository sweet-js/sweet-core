import test from 'ava';
import NodeLoader from '../../src/node-loader';

test('a node loader should normalize a path that is missing the extension', t => {
  let loader = new NodeLoader(__dirname);
  t.regex(loader.normalize('./test-node-loader'), /.*test-node-loader\.js/);
});
