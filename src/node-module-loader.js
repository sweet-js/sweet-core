import { readFileSync, statSync } from 'fs';

export default function moduleLoader(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (e) {
    return "";
  }
}
