import resolve from 'resolve';

export default function resolveModule(path, cwd) {
  return resolve.sync(path, { basedir: cwd });
}
