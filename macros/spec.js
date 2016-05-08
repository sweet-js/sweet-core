#lang 'sweet.js';

export syntax spec = ctx => {
  let name = ctx.next();
  let bodyOrExtends = ctx.next();

  function findFields (delim) {
    let fields = [];
    for (let stx of delim.inner()) {
      if (stx.isStringLiteral()) {
        fields.push(stx);
        fields.push(#`,`.get(0));
      }
    }
    return #`[${fields}]`;
  }

  if ((!bodyOrExtends.done) && bodyOrExtends.value.isBraces()) {
    let fields = findFields(bodyOrExtends.value);
    return #`
      const ${name.value} = Object.create(Object.prototype, {
        spec: { value: {}, writable: true, configurable: false, enumerable: true },
        fields: { value: ${fields}, writable: false, configurable: false, enumerable: true }
      });
    `;
  } else {
    let base = ctx.next();
    let body = ctx.next();
    let fields = findFields(body.value);
    return #`
      const ${name.value} = Object.create(${base.value}, {
        fields: { value: ${fields}, writable: false, configurable: false, enumerable: true }
      });
      ${name.value}.spec.${name.value} = ${name.value};
    `;
  }
};
