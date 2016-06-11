"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vm = require("vm");

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Store {
  constructor() {
    this.map = new Map();
    this.nodeContext = _vm2.default.createContext();
  }
  has(key_727) {
    return this.map.has(key_727);
  }
  get(key_728) {
    return this.map.get(key_728);
  }
  set(key_729, val_730) {
    this.nodeContext[key_729] = val_730;
    return this.map.set(key_729, val_730);
  }
  getNodeContext() {
    return this.nodeContext;
  }
}
exports.default = Store;