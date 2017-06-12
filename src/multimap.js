// @flow
import { List } from 'immutable';

export default class Multimap<K, V> extends Map<K, List<V>> {
  add(key: K, value: V) {
    let bucket = this.get(key);
    if (bucket != null) {
      this.set(key, bucket.push(value));
    } else {
      this.set(key, List.of(value));
    }
  }

  containsAt(key: K, value: V) {
    let bucket = this.get(key);
    if (bucket != null) {
      return bucket.contains(value);
    }
    return false;
  }
}
