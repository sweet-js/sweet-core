import { writeFileSync, mkdtempSync } from 'fs';
import { execSync } from 'child_process';
import { compile } from '../../src/sweet';
import NodeLoader from '../../src/node-loader';
import { sync as rimraf } from 'rimraf';

// write each module to a temp dir, compile them with sweet,
// compile with babel to get commonjs modules, then assert on
// the console log in main.js
export function compileToCjs(t, inputModules, expected) {
  let tmp = mkdtempSync(`./`);
  let loader = new NodeLoader(tmp);
  for (let fname of Object.keys(inputModules)) {
    let path = `${tmp}/${fname}`;
    writeFileSync(path, inputModules[fname], 'utf8');
    let outfile = compile(path, loader);
    writeFileSync(`${tmp}/${fname}.esm`, outfile.code, 'utf8');
    execSync(
      `babel --out-file ${tmp}/${fname} ${tmp}/${fname}.esm --no-babelrc --plugins=transform-es2015-modules-commonjs`,
    );
  }
  let result = execSync(`node ${tmp}/main.js`).toString().trim();
  t.is(result, expected);
  rimraf(tmp);
}
compileToCjs.title = (title, inputStore, expected) =>
  `${title}
${Array.from(Object.entries(inputStore))
    .map(([modName, modSrc]) => `${modName}\n----\n${modSrc}\n----`)
    .join('\n')}
> ${expected}`;
