import test from 'ava';
import fs from 'fs';

import compile from '../src/sweet-loader.js';

const PARSER_TEST_DIR = './test/test262-parser-tests';

let pass = fs.readdirSync(`${PARSER_TEST_DIR}/pass`);
let fail = fs.readdirSync(`${PARSER_TEST_DIR}/fail`);

// TODO: make these pass
const passExcluded = [
  // known problems with the reader
  '953.script.js',
  '952.script.js',
  '951.script.js',
  '950.script.js',
  '949.script.js',
  '947.script.js',
  '315.script.js',
  '314.script.js',
  '311.script.js',
  '299.script.js',
  '1657.script.js',
  '1656.script.js',
  '1655.script.js',
  '1654.script.js',

  '1012.script.js',
  '1058.module.js',
  '1059.module.js',
  '106.script.js',
  '1060.module.js',
  '1061.module.js',
  '1062.module.js',
  '1063.module.js',
  '1073.script.js',
  '1074.script.js',
  '1077.script.js',
  '1116.module.js',
  '1118.module.js',
  '1119.module.js',
  '1120.module.js',
  '1121.module.js',
  '1122.module.js',
  '1123.module.js',
  '1124.module.js',
  '1125.module.js',
  '1126.module.js',
  '1128.script.js',
  '1129.script.js',
  '1130.script.js',
  '1131.script.js',
  '1138.script.js',
  '1166.script.js',
  '1202.script.js',
  '1239.script.js',
  '1240.script.js',
  '1245.script.js',
  '1246.script.js',
  '1247.script.js',
  '1248.script.js',
  '1307.script.js',
  '1319.script.js',
  '1364.script.js',
  '1370.script.js',
  '1427.script.js',
  '1428.script.js',
  '1429.script.js',
  '1430.script.js',
  '1431.script.js',
  '1432.script.js',
  '1434.script.js',
  '1638.script.js',
  '1686.module.js',
  '1687.module.js',
  '1688.module.js',
  '1736.script.js',
  '1739.script.js',
  '1745.script.js',
  '1779.script.js',
  '1844.script.js',
  '285.script.js',
  '295.script.js',
  '296.script.js',
  '301.script.js',
  '350.script.js',
  '413.module.js',
  '414.module.js',
  '415.module.js',
  '416.module.js',
  '417.module.js',
  '418.module.js',
  '419.module.js',
  '516.script.js',
  '533.script.js',
  '538.script.js',
  '680.script.js',
  '681.script.js',
  '995.script.js',
]

function mkTester(subdir) {
  function f(t, fname) {
    let result = compile(`${PARSER_TEST_DIR}/${subdir}/${fname}`).codegen()
    t.not(result, null);
  }
  f.title = (title, fname, expected) => {
    let src = fs.readFileSync(`${PARSER_TEST_DIR}/${subdir}/${fname}`, 'utf8');
    return `${fname}:
${src}
`;
  }
  return f;
}

let passTest = mkTester('pass')


pass.filter(f => !passExcluded.includes(f)).forEach(f => {
  test(passTest, f);
});
