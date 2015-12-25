import stampit from "stampit";

export const Cloneable = stampit.init(({ instance, stamp }) => {
  // Avoid adding the same method to the prototype twice.
  if (!stamp.fixed.methods.clone) {
    stamp.fixed.methods.clone = function () {
      return stamp(this);
    };
  }
});

export const Frozen = stampit().init(({instance}) => {
  Object.freeze(instance);
});
