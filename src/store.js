import vm from 'vm';

export default class Store {
  constructor() {
    this.map = new Map();
    this.nodeContext = vm.createContext();
  }

  has(key) {
    return this.map.has(key);
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, val) {
    this.nodeContext[key] = val;
    return this.map.set(key, val);
  }

  getNodeContext() {
    return this.nodeContext;
  }
}
