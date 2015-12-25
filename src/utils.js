export function mixin(target, source) {
  class F extends target {
  }

  Object.getOwnPropertyNames(source.prototype).forEach(name => {
    if (name !== "constructor") {
      let newProp = Object.getOwnPropertyDescriptor(source.prototype, name);
      Object.defineProperty(F.prototype, name, newProp);
    }
  });
  return F;
}
