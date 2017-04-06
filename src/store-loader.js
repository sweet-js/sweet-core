// @flow
import SweetLoader from './sweet-loader';
import vm from 'vm';
import Store from './store';

export default class extends SweetLoader {
  store: Map<string, string>;

  constructor(
    baseDir: string,
    store: Map<string, string>,
    noBabel: boolean = false,
  ) {
    super(baseDir, { noBabel });
    this.store = store;
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
    return new Store(vm.createContext());
  }

  eval(source: string, store: Store) {
    return vm.runInContext(source, store.getBackingObject());
  }
}
