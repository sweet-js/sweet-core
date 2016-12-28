export default class Store extends Map {
  constructor(backingObject) {
    super();
    this.backingObject = backingObject;
  }

  set(key, val) {
    super.set(key, val);
    this.backingObject[key] = val;
  }

  getBackingObject() {
    return this.backingObject;
  }
}
