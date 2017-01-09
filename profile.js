/**
 * Copyright 2015 Shape Security, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var fs = require('fs');
var path = require('path');
var parse = require('./build/src/sweet').parse;
var NodeLoader = require('./build/src/node-loader').default;

function benchmarkParsing(fileName) {
  var loader = new NodeLoader(path.dirname(fs.realpathSync(__filename)));
  var start = Date.now(), N = 100;
  for (var i = 0; i < N; i++) {
    parse(fileName, loader);
  }
  var time = Date.now() - start;
  console.log((time / N).toFixed(2) + "ms");
}

benchmarkParsing('./node_modules/angular/angular.js');
