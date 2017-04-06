import { compile as sweetCompile } from './sweet';
import StoreLoader from './store-loader';
import Store from './store';

class BrowserStoreLoader extends StoreLoader {
  store: Map<string, string>;

  constructor(baseDir: string, store: Map<string, string>) {
    super(baseDir, store, true);
  }

  fetch({ name, address }: { name: string, address: any }) {
    if (this.store.has(address.path)) {
      return this.store.get(address.path);
    }
    throw new Error(
      `The module ${name} is not in the debug store: addr.path is ${address.path}`,
    );
  }

  freshStore() {
    return new Store({});
  }

  eval(source: string, store: Store) {
    return (0, eval)(source);
  }
}

export function compile(source, helpers) {
  let s = new Map();
  s.set('main.js', source);
  s.set('sweet.js/helpers.js', helpers);
  s.set('sweet.js/helpers', helpers);
  let loader = new BrowserStoreLoader('.', s);
  return sweetCompile('main.js', loader);
}
