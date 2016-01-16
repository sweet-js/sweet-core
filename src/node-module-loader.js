import { readFileSync } from 'fs';

export default function moduleLoader(path) {
  return readFileSync(path, 'utf8');
}
