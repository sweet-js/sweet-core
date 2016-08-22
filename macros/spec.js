#lang 'sweet.js';

/**
Syntax:

  spec $name $opt(: $base) {
    $(
      $field;
    ) ...
  }

Creates an object `$name` with an optional prototype pointing to `$base` (if
`$base` is missing, then default to `Object.prototype`).

Each object contains two properties:
  - `spec` contains a reference to every object extending `$base`
  - `fields` an array of each field name
**/
export syntax spec = ctx => {
  let name = ctx.next();
  let bodyOrExtends = ctx.next();
  let here = #`here`.get(0);

  function findFields (delim) {
    let fields = #``;
    let innerCtx = delim.inner();

    for (let stx of innerCtx) {
      if (stx.isIdentifier() || stx.isKeyword()) {
        innerCtx.next(); // :
        let type = innerCtx.next().value;
        if (type == null) { throw new Error(`what: ${stx.val()}`) }
        fields = fields.concat(#`{
          fieldName: ${here.fromString(stx.val())},
          fieldType: {
            name: ${here.fromString(type.val())}
          }
        }`)
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
