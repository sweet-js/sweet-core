'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = moduleLoader;

var _fs = require('fs');

function moduleLoader(path) {
  return (0, _fs.readFileSync)(path, 'utf8');
}
//# sourceMappingURL=node-module-loader.js.map
