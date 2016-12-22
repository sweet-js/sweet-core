'use strict';
/*
This file makes debugging sweet.js easier. Uses the built version of sweet.js
to compile 'test.js'. You can use node-inspector to step through the expansion
process:

	npm install -g node-inspector
	node-debug debug.js
*/

require('babel-register');
var compile = require('./src/sweet-loader.js').default;
let fs = require('fs');

debugger;

const PARSER_TEST_DIR = './test/test262-parser-tests';

let pass = fs.readdirSync(`${PARSER_TEST_DIR}/pass`);
let fail = fs.readdirSync(`${PARSER_TEST_DIR}/fail`);

// TODO: make these pass
const passExcluded = [
  '1012.script.js',
  '1051.module.js',
  '1052.module.js',
  '1053.module.js',
  '1054.module.js',
  '1055.module.js',
  '1056.module.js',
  '1057.module.js',
  '1058.module.js',
  '1059.module.js',
  '106.script.js',
  '1060.module.js',
  '1061.module.js',
  '1062.module.js',
  '1063.module.js',
  '1064.module.js',
  '1065.module.js',
  '1066.module.js',
  '1067.module.js',
  '1068.module.js',
  '1069.module.js',
  '1070.module.js',
  '1073.script.js',
  '1074.script.js',
  '1077.script.js',
  '1116.module.js',
  '1117.module.js',
  '1118.module.js',
  '1119.module.js',
  '1120.module.js',
  '1121.module.js',
  '1122.module.js',
  '1123.module.js',
  '1124.module.js',
  '1125.module.js',
  '1126.module.js',
  '1127.module.js',
  '1128.script.js',
  '1129.script.js',
  '1130.script.js',
  '1131.script.js',
  '1138.script.js',
  '1166.script.js',
  '117.script.js',
  '1202.script.js',
  '1239.script.js',
  '1240.script.js',
  '1245.script.js',
  '1246.script.js',
  '1247.script.js',
  '1248.script.js',
  '128.script.js',
  '1307.script.js',
  '1319.script.js',
  '1334.script.js',
  '1335.script.js',
  '1364.script.js',
  '1370.script.js',
  '140.script.js',
  '1427.script.js',
  '1428.script.js',
  '1429.script.js',
  '1430.script.js',
  '1431.script.js',
  '1432.script.js',
  '1434.script.js',
  '1467.script.js',
  '1623.script.js',
  '1638.script.js',
  '1686.module.js',
  '1687.module.js',
  '1688.module.js',
  '1689.module.js',
  '1690.module.js',
  '1691.module.js',
  '1692.module.js',
  '1693.module.js',
  '1694.module.js',
  '1695.module.js',
  '1698.module.js',
  '1699.module.js',
  '1700.module.js',
  '1701.module.js',
  '1736.script.js',
  '1739.script.js',
  '1745.script.js',
  '1779.script.js',
  '1789.script.js',
  '1844.script.js',
  '1954.script.js',
  '285.script.js',
  '290.script.js',
  '295.script.js',
  '296.script.js',
  '297.script.js',
  '301.script.js',
  '350.script.js',
  '37.script.js',
  '389.script.js',
  '391.script.js',
  '393.script.js',
  '397.module.js',
  '398.module.js',
  '400.module.js',
  '401.module.js',
  '402.module.js',
  '403.module.js',
  '404.module.js',
  '405.module.js',
  '406.module.js',
  '407.module.js',
  '408.module.js',
  '409.module.js',
  '411.module.js',
  '412.module.js',
  '413.module.js',
  '414.module.js',
  '415.module.js',
  '416.module.js',
  '417.module.js',
  '418.module.js',
  '419.module.js',
  '420.module.js',
  '516.script.js',
  '523.module.js',
  '533.script.js',
  '538.script.js',
  '546.module.js',
  '551.module.js',
  '572.script.js',
  '583.script.js',
  '608.script.js',
  '679.script.js',
  '680.script.js',
  '681.script.js',
  '84.script.js',
  '95.script.js',
  '993.script.js',
  '995.script.js',
]

function mkTester(subdir) {
  function f(fname) {
    let result = compile(`${PARSER_TEST_DIR}/${subdir}/${fname}`).codegen()
    if (result == null) {
      throw new Error('un expected null result');
    }
  }
  return f;
}

let passTest = mkTester('pass')

pass.filter(f => !passExcluded.includes(f)).forEach(f => {
  console.log(f);
  passTest(f);
});
