"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isImportDeclaration = exports.isCompiletimeStatement = exports.isCompiletimeDeclaration = exports.isSyntaxDeclarationStatement = exports.isExportSyntax = exports.isParenthesizedExpression = exports.isFunctionWithName = exports.isFunctionTerm = exports.isSyntaxrecDeclaration = exports.isSyntaxDeclaration = exports.isEOF = exports.isVariableDeclarator = exports.isVariableDeclaration = exports.isSyntaxTemplate = exports.isTemplateElement = exports.isSwitchDefault = exports.isSwitchCase = exports.isSuper = exports.isSpreadElement = exports.isScript = exports.isFunctionDeclaration = exports.isFunctionBody = exports.isFormalParameters = exports.isDirective = exports.isCatchClause = exports.isBlock = exports.isPragma = exports.isWithStatement = exports.isWhileStatement = exports.isVariableDeclarationStatement = exports.isTryFinallyStatement = exports.isTryCatchStatement = exports.isThrowStatement = exports.isSwitchStatementWithDefault = exports.isSwitchStatement = exports.isReturnStatement = exports.isLabeledStatement = exports.isIfStatement = exports.isForStatement = exports.isForOfStatement = exports.isForInStatement = exports.isExpressionStatement = exports.isEmptyStatement = exports.isDoWhileStatement = exports.isDebuggerStatement = exports.isCompoundAssignmentExpression = exports.isContinueStatement = exports.isBreakStatement = exports.isBlockStatement = exports.isYieldGeneratorExpression = exports.isYieldExpression = exports.isUpdateExpression = exports.isThisExpression = exports.isTemplateExpression = exports.isStaticMemberExpression = exports.isUnaryExpression = exports.isObjectExpression = exports.isNewTargetExpression = exports.isNewExpression = exports.isIdentifierExpression = exports.isFunctionExpression = exports.isConditionalExpression = exports.isComputedMemberExpression = exports.isComputedAssignmentExpression = exports.isCallExpression = exports.isBinaryExpression = exports.isAssignmentExpression = exports.isArrowExpression = exports.isArrayExpression = exports.isLiteralStringExpression = exports.isLiteralRegExpExpression = exports.isLiteralNumericExpression = exports.isLiteralNullExpression = exports.isLiteralInfinityExpression = exports.isLiteralBooleanExpression = exports.isStaticPropertyName = exports.isComputedPropertyName = exports.isShorthandProperty = exports.isDataProperty = exports.isSetter = exports.isGetter = exports.isMethod = exports.isExportSpecifier = exports.isExportDefault = exports.isExport = exports.isExportFrom = exports.isExportAllFrom = exports.isImportSpecifier = exports.isImportNamespace = exports.isImport = exports.isModule = exports.isClassElement = exports.isClassDeclaration = exports.isClassExpression = exports.isBindingPropertyProperty = exports.isBindingPropertyIdentifier = exports.isObjectBinding = exports.isArrayBinding = exports.isBindingIdentifier = exports.isBindingWithDefault = undefined;

var _immutable = require("immutable");

var _errors = require("./errors");

var _utils = require("./utils");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _termSpec = require("./term-spec");

var _termSpec2 = _interopRequireDefault(_termSpec);

var _ramda = require("ramda");

var R = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Term {
  constructor(type_1345, props_1346) {
    this.type = type_1345;
    this.loc = null;
    for (let prop of Object.keys(props_1346)) {
      this[prop] = props_1346[prop];
    }
  }
  extend(props_1347) {
    let newProps_1348 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (props_1347.hasOwnProperty(field)) {
        newProps_1348[field] = props_1347[field];
      } else {
        newProps_1348[field] = this[field];
      }
    }
    return new Term(this.type, newProps_1348);
  }
  gen() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? { includeImports: true } : arguments[0];

    let includeImports = _ref.includeImports;

    let next_1349 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1349[field] = null;
      } else if (this[field] instanceof Term) {
        next_1349[field] = this[field].gen(includeImports);
      } else if (_immutable.List.isList(this[field])) {
        let pred = includeImports ? R.complement(isCompiletimeStatement_1343) : R.both(R.complement(isImportDeclaration_1344), R.complement(isCompiletimeStatement_1343));
        next_1349[field] = this[field].filter(pred).map(term_1350 => term_1350 instanceof Term ? term_1350.gen(includeImports) : term_1350);
      } else {
        next_1349[field] = this[field];
      }
    }
    return new Term(this.type, next_1349);
  }
  visit(f_1351) {
    let next_1352 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1352[field] = null;
      } else if (_immutable.List.isList(this[field])) {
        next_1352[field] = this[field].map(field_1353 => field_1353 != null ? f_1351(field_1353) : null);
      } else {
        next_1352[field] = f_1351(this[field]);
      }
    }
    return this.extend(next_1352);
  }
  addScope(scope_1354, bindings_1355, phase_1356, options_1357) {
    return this.visit(term_1358 => {
      if (typeof term_1358.addScope === "function") {
        return term_1358.addScope(scope_1354, bindings_1355, phase_1356, options_1357);
      }
      return term_1358;
    });
  }
  removeScope(scope_1359, phase_1360) {
    return this.visit(term_1361 => {
      if (typeof term_1361.removeScope === "function") {
        return term_1361.removeScope(scope_1359, phase_1360);
      }
      return term_1361;
    });
  }
  lineNumber() {
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (typeof this[field] && this[field].lineNumber === "function") {
        return this[field].lineNumber();
      }
    }
  }
  setLineNumber(line_1362) {
    let next_1363 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1363[field] = null;
      } else if (typeof this[field].setLineNumber === "function") {
        next_1363[field] = this[field].setLineNumber(line_1362);
      } else if (_immutable.List.isList(this[field])) {
        next_1363[field] = this[field].map(f_1364 => f_1364.setLineNumber(line_1362));
      } else {
        next_1363[field] = this[field];
      }
    }
    return new Term(this.type, next_1363);
  }
}
exports.default = Term;
const isBindingWithDefault_1245 = R.whereEq({ type: "BindingWithDefault" });
;
const isBindingIdentifier_1246 = R.whereEq({ type: "BindingIdentifier" });
;
const isArrayBinding_1247 = R.whereEq({ type: "ArrayBinding" });
;
const isObjectBinding_1248 = R.whereEq({ type: "ObjectBinding" });
;
const isBindingPropertyIdentifier_1249 = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isBindingPropertyProperty_1250 = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isClassExpression_1251 = R.whereEq({ type: "ClassExpression" });
;
const isClassDeclaration_1252 = R.whereEq({ type: "ClassDeclaration" });
;
const isClassElement_1253 = R.whereEq({ type: "ClassElement" });
;
const isModule_1254 = R.whereEq({ type: "Module" });
;
const isImport_1255 = R.whereEq({ type: "Import" });
;
const isImportNamespace_1256 = R.whereEq({ type: "ImportNamespace" });
;
const isImportSpecifier_1257 = R.whereEq({ type: "ImportSpecifier" });
;
const isExportAllFrom_1258 = R.whereEq({ type: "ExportAllFrom" });
;
const isExportFrom_1259 = R.whereEq({ type: "ExportFrom" });
;
const isExport_1260 = R.whereEq({ type: "Export" });
;
const isExportDefault_1261 = R.whereEq({ type: "ExportDefault" });
;
const isExportSpecifier_1262 = R.whereEq({ type: "ExportSpecifier" });
;
const isMethod_1263 = R.whereEq({ type: "Method" });
;
const isGetter_1264 = R.whereEq({ type: "Getter" });
;
const isSetter_1265 = R.whereEq({ type: "Setter" });
;
const isDataProperty_1266 = R.whereEq({ type: "DataProperty" });
;
const isShorthandProperty_1267 = R.whereEq({ type: "ShorthandProperty" });
;
const isComputedPropertyName_1268 = R.whereEq({ type: "ComputedPropertyName" });
;
const isStaticPropertyName_1269 = R.whereEq({ type: "StaticPropertyName" });
;
const isLiteralBooleanExpression_1270 = R.whereEq({ type: "LiteralBooleanExpression" });
;
const isLiteralInfinityExpression_1271 = R.whereEq({ type: "LiteralInfinityExpression" });
;
const isLiteralNullExpression_1272 = R.whereEq({ type: "LiteralNullExpression" });
;
const isLiteralNumericExpression_1273 = R.whereEq({ type: "LiteralNumericExpression" });
;
const isLiteralRegExpExpression_1274 = R.whereEq({ type: "LiteralRegExpExpression" });
;
const isLiteralStringExpression_1275 = R.whereEq({ type: "LiteralStringExpression" });
;
const isArrayExpression_1276 = R.whereEq({ type: "ArrayExpression" });
;
const isArrowExpression_1277 = R.whereEq({ type: "ArrowExpression" });
;
const isAssignmentExpression_1278 = R.whereEq({ type: "AssignmentExpression" });
;
const isBinaryExpression_1279 = R.whereEq({ type: "BinaryExpression" });
;
const isCallExpression_1280 = R.whereEq({ type: "CallExpression" });
;
const isComputedAssignmentExpression_1281 = R.whereEq({ type: "ComputedAssignmentExpression" });
;
const isComputedMemberExpression_1282 = R.whereEq({ type: "ComputedMemberExpression" });
;
const isConditionalExpression_1283 = R.whereEq({ type: "ConditionalExpression" });
;
const isFunctionExpression_1284 = R.whereEq({ type: "FunctionExpression" });
;
const isIdentifierExpression_1285 = R.whereEq({ type: "IdentifierExpression" });
;
const isNewExpression_1286 = R.whereEq({ type: "NewExpression" });
;
const isNewTargetExpression_1287 = R.whereEq({ type: "NewTargetExpression" });
;
const isObjectExpression_1288 = R.whereEq({ type: "ObjectExpression" });
;
const isUnaryExpression_1289 = R.whereEq({ type: "UnaryExpression" });
;
const isStaticMemberExpression_1290 = R.whereEq({ type: "StaticMemberExpression" });
;
const isTemplateExpression_1291 = R.whereEq({ type: "TemplateExpression" });
;
const isThisExpression_1292 = R.whereEq({ type: "ThisExpression" });
;
const isUpdateExpression_1293 = R.whereEq({ type: "UpdateExpression" });
;
const isYieldExpression_1294 = R.whereEq({ type: "YieldExpression" });
;
const isYieldGeneratorExpression_1295 = R.whereEq({ type: "YieldGeneratorExpression" });
;
const isBlockStatement_1296 = R.whereEq({ type: "BlockStatement" });
;
const isBreakStatement_1297 = R.whereEq({ type: "BreakStatement" });
;
const isContinueStatement_1298 = R.whereEq({ type: "ContinueStatement" });
;
const isCompoundAssignmentExpression_1299 = R.whereEq({ type: "CompoundAssignmentExpression" });
;
const isDebuggerStatement_1300 = R.whereEq({ type: "DebuggerStatement" });
;
const isDoWhileStatement_1301 = R.whereEq({ type: "DoWhileStatement" });
;
const isEmptyStatement_1302 = R.whereEq({ type: "EmptyStatement" });
;
const isExpressionStatement_1303 = R.whereEq({ type: "ExpressionStatement" });
;
const isForInStatement_1304 = R.whereEq({ type: "ForInStatement" });
;
const isForOfStatement_1305 = R.whereEq({ type: "ForOfStatement" });
;
const isForStatement_1306 = R.whereEq({ type: "ForStatement" });
;
const isIfStatement_1307 = R.whereEq({ type: "IfStatement" });
;
const isLabeledStatement_1308 = R.whereEq({ type: "LabeledStatement" });
;
const isReturnStatement_1309 = R.whereEq({ type: "ReturnStatement" });
;
const isSwitchStatement_1310 = R.whereEq({ type: "SwitchStatement" });
;
const isSwitchStatementWithDefault_1311 = R.whereEq({ type: "SwitchStatementWithDefault" });
;
const isThrowStatement_1312 = R.whereEq({ type: "ThrowStatement" });
;
const isTryCatchStatement_1313 = R.whereEq({ type: "TryCatchStatement" });
;
const isTryFinallyStatement_1314 = R.whereEq({ type: "TryFinallyStatement" });
;
const isVariableDeclarationStatement_1315 = R.whereEq({ type: "VariableDeclarationStatement" });
;
const isWhileStatement_1316 = R.whereEq({ type: "WhileStatement" });
;
const isWithStatement_1317 = R.whereEq({ type: "WithStatement" });
;
const isPragma_1318 = R.whereEq({ type: "Pragma" });
;
const isBlock_1319 = R.whereEq({ type: "Block" });
;
const isCatchClause_1320 = R.whereEq({ type: "CatchClause" });
;
const isDirective_1321 = R.whereEq({ type: "Directive" });
;
const isFormalParameters_1322 = R.whereEq({ type: "FormalParameters" });
;
const isFunctionBody_1323 = R.whereEq({ type: "FunctionBody" });
;
const isFunctionDeclaration_1324 = R.whereEq({ type: "FunctionDeclaration" });
;
const isScript_1325 = R.whereEq({ type: "Script" });
;
const isSpreadElement_1326 = R.whereEq({ type: "SpreadElement" });
;
const isSuper_1327 = R.whereEq({ type: "Super" });
;
const isSwitchCase_1328 = R.whereEq({ type: "SwitchCase" });
;
const isSwitchDefault_1329 = R.whereEq({ type: "SwitchDefault" });
;
const isTemplateElement_1330 = R.whereEq({ type: "TemplateElement" });
;
const isSyntaxTemplate_1331 = R.whereEq({ type: "SyntaxTemplate" });
;
const isVariableDeclaration_1332 = R.whereEq({ type: "VariableDeclaration" });
;
const isVariableDeclarator_1333 = R.whereEq({ type: "VariableDeclarator" });
;
const isEOF_1334 = R.whereEq({ type: "EOF" });
;
const isSyntaxDeclaration_1335 = R.both(isVariableDeclaration_1332, R.whereEq({ kind: "syntax" }));
;
const isSyntaxrecDeclaration_1336 = R.both(isVariableDeclaration_1332, R.whereEq({ kind: "syntaxrec" }));
;
const isFunctionTerm_1337 = R.either(isFunctionDeclaration_1324, isFunctionExpression_1284);
;
const isFunctionWithName_1338 = R.and(isFunctionTerm_1337, R.complement(R.where({ name: R.isNil })));
;
const isParenthesizedExpression_1339 = R.whereEq({ type: "ParenthesizedExpression" });
;
const isExportSyntax_1340 = R.both(isExport_1260, exp_1365 => R.or(isSyntaxDeclaration_1335(exp_1365.declaration), isSyntaxrecDeclaration_1336(exp_1365.declaration)));
;
const isSyntaxDeclarationStatement_1341 = R.both(isVariableDeclarationStatement_1315, decl_1366 => isCompiletimeDeclaration_1342(decl_1366.declaration));
;
const isCompiletimeDeclaration_1342 = R.either(isSyntaxDeclaration_1335, isSyntaxrecDeclaration_1336);
;
const isCompiletimeStatement_1343 = term_1367 => {
  return term_1367 instanceof Term && isVariableDeclarationStatement_1315(term_1367) && isCompiletimeDeclaration_1342(term_1367.declaration);
};
;
const isImportDeclaration_1344 = R.either(isImport_1255, isImportNamespace_1256);
;
exports.isBindingWithDefault = isBindingWithDefault_1245;
exports.isBindingIdentifier = isBindingIdentifier_1246;
exports.isArrayBinding = isArrayBinding_1247;
exports.isObjectBinding = isObjectBinding_1248;
exports.isBindingPropertyIdentifier = isBindingPropertyIdentifier_1249;
exports.isBindingPropertyProperty = isBindingPropertyProperty_1250;
exports.isClassExpression = isClassExpression_1251;
exports.isClassDeclaration = isClassDeclaration_1252;
exports.isClassElement = isClassElement_1253;
exports.isModule = isModule_1254;
exports.isImport = isImport_1255;
exports.isImportNamespace = isImportNamespace_1256;
exports.isImportSpecifier = isImportSpecifier_1257;
exports.isExportAllFrom = isExportAllFrom_1258;
exports.isExportFrom = isExportFrom_1259;
exports.isExport = isExport_1260;
exports.isExportDefault = isExportDefault_1261;
exports.isExportSpecifier = isExportSpecifier_1262;
exports.isMethod = isMethod_1263;
exports.isGetter = isGetter_1264;
exports.isSetter = isSetter_1265;
exports.isDataProperty = isDataProperty_1266;
exports.isShorthandProperty = isShorthandProperty_1267;
exports.isComputedPropertyName = isComputedPropertyName_1268;
exports.isStaticPropertyName = isStaticPropertyName_1269;
exports.isLiteralBooleanExpression = isLiteralBooleanExpression_1270;
exports.isLiteralInfinityExpression = isLiteralInfinityExpression_1271;
exports.isLiteralNullExpression = isLiteralNullExpression_1272;
exports.isLiteralNumericExpression = isLiteralNumericExpression_1273;
exports.isLiteralRegExpExpression = isLiteralRegExpExpression_1274;
exports.isLiteralStringExpression = isLiteralStringExpression_1275;
exports.isArrayExpression = isArrayExpression_1276;
exports.isArrowExpression = isArrowExpression_1277;
exports.isAssignmentExpression = isAssignmentExpression_1278;
exports.isBinaryExpression = isBinaryExpression_1279;
exports.isCallExpression = isCallExpression_1280;
exports.isComputedAssignmentExpression = isComputedAssignmentExpression_1281;
exports.isComputedMemberExpression = isComputedMemberExpression_1282;
exports.isConditionalExpression = isConditionalExpression_1283;
exports.isFunctionExpression = isFunctionExpression_1284;
exports.isIdentifierExpression = isIdentifierExpression_1285;
exports.isNewExpression = isNewExpression_1286;
exports.isNewTargetExpression = isNewTargetExpression_1287;
exports.isObjectExpression = isObjectExpression_1288;
exports.isUnaryExpression = isUnaryExpression_1289;
exports.isStaticMemberExpression = isStaticMemberExpression_1290;
exports.isTemplateExpression = isTemplateExpression_1291;
exports.isThisExpression = isThisExpression_1292;
exports.isUpdateExpression = isUpdateExpression_1293;
exports.isYieldExpression = isYieldExpression_1294;
exports.isYieldGeneratorExpression = isYieldGeneratorExpression_1295;
exports.isBlockStatement = isBlockStatement_1296;
exports.isBreakStatement = isBreakStatement_1297;
exports.isContinueStatement = isContinueStatement_1298;
exports.isCompoundAssignmentExpression = isCompoundAssignmentExpression_1299;
exports.isDebuggerStatement = isDebuggerStatement_1300;
exports.isDoWhileStatement = isDoWhileStatement_1301;
exports.isEmptyStatement = isEmptyStatement_1302;
exports.isExpressionStatement = isExpressionStatement_1303;
exports.isForInStatement = isForInStatement_1304;
exports.isForOfStatement = isForOfStatement_1305;
exports.isForStatement = isForStatement_1306;
exports.isIfStatement = isIfStatement_1307;
exports.isLabeledStatement = isLabeledStatement_1308;
exports.isReturnStatement = isReturnStatement_1309;
exports.isSwitchStatement = isSwitchStatement_1310;
exports.isSwitchStatementWithDefault = isSwitchStatementWithDefault_1311;
exports.isThrowStatement = isThrowStatement_1312;
exports.isTryCatchStatement = isTryCatchStatement_1313;
exports.isTryFinallyStatement = isTryFinallyStatement_1314;
exports.isVariableDeclarationStatement = isVariableDeclarationStatement_1315;
exports.isWhileStatement = isWhileStatement_1316;
exports.isWithStatement = isWithStatement_1317;
exports.isPragma = isPragma_1318;
exports.isBlock = isBlock_1319;
exports.isCatchClause = isCatchClause_1320;
exports.isDirective = isDirective_1321;
exports.isFormalParameters = isFormalParameters_1322;
exports.isFunctionBody = isFunctionBody_1323;
exports.isFunctionDeclaration = isFunctionDeclaration_1324;
exports.isScript = isScript_1325;
exports.isSpreadElement = isSpreadElement_1326;
exports.isSuper = isSuper_1327;
exports.isSwitchCase = isSwitchCase_1328;
exports.isSwitchDefault = isSwitchDefault_1329;
exports.isTemplateElement = isTemplateElement_1330;
exports.isSyntaxTemplate = isSyntaxTemplate_1331;
exports.isVariableDeclaration = isVariableDeclaration_1332;
exports.isVariableDeclarator = isVariableDeclarator_1333;
exports.isEOF = isEOF_1334;
exports.isSyntaxDeclaration = isSyntaxDeclaration_1335;
exports.isSyntaxrecDeclaration = isSyntaxrecDeclaration_1336;
exports.isFunctionTerm = isFunctionTerm_1337;
exports.isFunctionWithName = isFunctionWithName_1338;
exports.isParenthesizedExpression = isParenthesizedExpression_1339;
exports.isExportSyntax = isExportSyntax_1340;
exports.isSyntaxDeclarationStatement = isSyntaxDeclarationStatement_1341;
exports.isCompiletimeDeclaration = isCompiletimeDeclaration_1342;
exports.isCompiletimeStatement = isCompiletimeStatement_1343;
exports.isImportDeclaration = isImportDeclaration_1344;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm1zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQWEsQzs7Ozs7O0FBQ0UsTUFBTSxJQUFOLENBQVc7QUFDeEIsY0FBWSxTQUFaLEVBQXVCLFVBQXZCLEVBQW1DO0FBQ2pDLFNBQUssSUFBTCxHQUFZLFNBQVo7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFYO0FBQ0EsU0FBSyxJQUFJLElBQVQsSUFBaUIsT0FBTyxJQUFQLENBQVksVUFBWixDQUFqQixFQUEwQztBQUN4QyxXQUFLLElBQUwsSUFBYSxXQUFXLElBQVgsQ0FBYjtBQUNEO0FBQ0Y7QUFDRCxTQUFPLFVBQVAsRUFBbUI7QUFDakIsUUFBSSxnQkFBZ0IsRUFBcEI7QUFDQSxTQUFLLElBQUksS0FBVCxJQUFrQixtQkFBUyxJQUFULENBQWMsS0FBSyxJQUFuQixFQUF5QixNQUEzQyxFQUFtRDtBQUNqRCxVQUFJLFdBQVcsY0FBWCxDQUEwQixLQUExQixDQUFKLEVBQXNDO0FBQ3BDLHNCQUFjLEtBQWQsSUFBdUIsV0FBVyxLQUFYLENBQXZCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsc0JBQWMsS0FBZCxJQUF1QixLQUFLLEtBQUwsQ0FBdkI7QUFDRDtBQUNGO0FBQ0QsV0FBTyxJQUFJLElBQUosQ0FBUyxLQUFLLElBQWQsRUFBb0IsYUFBcEIsQ0FBUDtBQUNEO0FBQ0QsUUFBK0M7QUFBQSxxRUFBeEIsRUFBQyxnQkFBZ0IsSUFBakIsRUFBd0I7O0FBQUEsUUFBMUMsY0FBMEMsUUFBMUMsY0FBMEM7O0FBQzdDLFFBQUksWUFBWSxFQUFoQjtBQUNBLFNBQUssSUFBSSxLQUFULElBQWtCLG1CQUFTLElBQVQsQ0FBYyxLQUFLLElBQW5CLEVBQXlCLE1BQTNDLEVBQW1EO0FBQ2pELFVBQUksS0FBSyxLQUFMLEtBQWUsSUFBbkIsRUFBeUI7QUFDdkIsa0JBQVUsS0FBVixJQUFtQixJQUFuQjtBQUNELE9BRkQsTUFFTyxJQUFJLEtBQUssS0FBTCxhQUF1QixJQUEzQixFQUFpQztBQUN0QyxrQkFBVSxLQUFWLElBQW1CLEtBQUssS0FBTCxFQUFZLEdBQVosQ0FBZ0IsY0FBaEIsQ0FBbkI7QUFDRCxPQUZNLE1BRUEsSUFBSSxnQkFBSyxNQUFMLENBQVksS0FBSyxLQUFMLENBQVosQ0FBSixFQUE4QjtBQUNuQyxZQUFJLE9BQU8saUJBQWlCLEVBQUUsVUFBRixDQUFhLDJCQUFiLENBQWpCLEdBQTZELEVBQUUsSUFBRixDQUFPLEVBQUUsVUFBRixDQUFhLHdCQUFiLENBQVAsRUFBK0MsRUFBRSxVQUFGLENBQWEsMkJBQWIsQ0FBL0MsQ0FBeEU7QUFDQSxrQkFBVSxLQUFWLElBQW1CLEtBQUssS0FBTCxFQUFZLE1BQVosQ0FBbUIsSUFBbkIsRUFBeUIsR0FBekIsQ0FBNkIsYUFBYSxxQkFBcUIsSUFBckIsR0FBNEIsVUFBVSxHQUFWLENBQWMsY0FBZCxDQUE1QixHQUE0RCxTQUF0RyxDQUFuQjtBQUNELE9BSE0sTUFHQTtBQUNMLGtCQUFVLEtBQVYsSUFBbUIsS0FBSyxLQUFMLENBQW5CO0FBQ0Q7QUFDRjtBQUNELFdBQU8sSUFBSSxJQUFKLENBQVMsS0FBSyxJQUFkLEVBQW9CLFNBQXBCLENBQVA7QUFDRDtBQUNELFFBQU0sTUFBTixFQUFjO0FBQ1osUUFBSSxZQUFZLEVBQWhCO0FBQ0EsU0FBSyxJQUFJLEtBQVQsSUFBa0IsbUJBQVMsSUFBVCxDQUFjLEtBQUssSUFBbkIsRUFBeUIsTUFBM0MsRUFBbUQ7QUFDakQsVUFBSSxLQUFLLEtBQUwsS0FBZSxJQUFuQixFQUF5QjtBQUN2QixrQkFBVSxLQUFWLElBQW1CLElBQW5CO0FBQ0QsT0FGRCxNQUVPLElBQUksZ0JBQUssTUFBTCxDQUFZLEtBQUssS0FBTCxDQUFaLENBQUosRUFBOEI7QUFDbkMsa0JBQVUsS0FBVixJQUFtQixLQUFLLEtBQUwsRUFBWSxHQUFaLENBQWdCLGNBQWMsY0FBYyxJQUFkLEdBQXFCLE9BQU8sVUFBUCxDQUFyQixHQUEwQyxJQUF4RSxDQUFuQjtBQUNELE9BRk0sTUFFQTtBQUNMLGtCQUFVLEtBQVYsSUFBbUIsT0FBTyxLQUFLLEtBQUwsQ0FBUCxDQUFuQjtBQUNEO0FBQ0Y7QUFDRCxXQUFPLEtBQUssTUFBTCxDQUFZLFNBQVosQ0FBUDtBQUNEO0FBQ0QsV0FBUyxVQUFULEVBQXFCLGFBQXJCLEVBQW9DLFVBQXBDLEVBQWdELFlBQWhELEVBQThEO0FBQzVELFdBQU8sS0FBSyxLQUFMLENBQVcsYUFBYTtBQUM3QixVQUFJLE9BQU8sVUFBVSxRQUFqQixLQUE4QixVQUFsQyxFQUE4QztBQUM1QyxlQUFPLFVBQVUsUUFBVixDQUFtQixVQUFuQixFQUErQixhQUEvQixFQUE4QyxVQUE5QyxFQUEwRCxZQUExRCxDQUFQO0FBQ0Q7QUFDRCxhQUFPLFNBQVA7QUFDRCxLQUxNLENBQVA7QUFNRDtBQUNELGNBQVksVUFBWixFQUF3QixVQUF4QixFQUFvQztBQUNsQyxXQUFPLEtBQUssS0FBTCxDQUFXLGFBQWE7QUFDN0IsVUFBSSxPQUFPLFVBQVUsV0FBakIsS0FBaUMsVUFBckMsRUFBaUQ7QUFDL0MsZUFBTyxVQUFVLFdBQVYsQ0FBc0IsVUFBdEIsRUFBa0MsVUFBbEMsQ0FBUDtBQUNEO0FBQ0QsYUFBTyxTQUFQO0FBQ0QsS0FMTSxDQUFQO0FBTUQ7QUFDRCxlQUFhO0FBQ1gsU0FBSyxJQUFJLEtBQVQsSUFBa0IsbUJBQVMsSUFBVCxDQUFjLEtBQUssSUFBbkIsRUFBeUIsTUFBM0MsRUFBbUQ7QUFDakQsVUFBSSxPQUFPLEtBQUssS0FBTCxDQUFQLElBQXNCLEtBQUssS0FBTCxFQUFZLFVBQVosS0FBMkIsVUFBckQsRUFBaUU7QUFDL0QsZUFBTyxLQUFLLEtBQUwsRUFBWSxVQUFaLEVBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFDRCxnQkFBYyxTQUFkLEVBQXlCO0FBQ3ZCLFFBQUksWUFBWSxFQUFoQjtBQUNBLFNBQUssSUFBSSxLQUFULElBQWtCLG1CQUFTLElBQVQsQ0FBYyxLQUFLLElBQW5CLEVBQXlCLE1BQTNDLEVBQW1EO0FBQ2pELFVBQUksS0FBSyxLQUFMLEtBQWUsSUFBbkIsRUFBeUI7QUFDdkIsa0JBQVUsS0FBVixJQUFtQixJQUFuQjtBQUNELE9BRkQsTUFFTyxJQUFJLE9BQU8sS0FBSyxLQUFMLEVBQVksYUFBbkIsS0FBcUMsVUFBekMsRUFBcUQ7QUFDMUQsa0JBQVUsS0FBVixJQUFtQixLQUFLLEtBQUwsRUFBWSxhQUFaLENBQTBCLFNBQTFCLENBQW5CO0FBQ0QsT0FGTSxNQUVBLElBQUksZ0JBQUssTUFBTCxDQUFZLEtBQUssS0FBTCxDQUFaLENBQUosRUFBOEI7QUFDbkMsa0JBQVUsS0FBVixJQUFtQixLQUFLLEtBQUwsRUFBWSxHQUFaLENBQWdCLFVBQVUsT0FBTyxhQUFQLENBQXFCLFNBQXJCLENBQTFCLENBQW5CO0FBQ0QsT0FGTSxNQUVBO0FBQ0wsa0JBQVUsS0FBVixJQUFtQixLQUFLLEtBQUwsQ0FBbkI7QUFDRDtBQUNGO0FBQ0QsV0FBTyxJQUFJLElBQUosQ0FBUyxLQUFLLElBQWQsRUFBb0IsU0FBcEIsQ0FBUDtBQUNEO0FBckZ1QjtrQkFBTCxJO0FBdUZyQixNQUFNLDRCQUE0QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sb0JBQVAsRUFBVixDQUFsQztBQUNBO0FBQ0EsTUFBTSwyQkFBMkIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLG1CQUFQLEVBQVYsQ0FBakM7QUFDQTtBQUNBLE1BQU0sc0JBQXNCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxjQUFQLEVBQVYsQ0FBNUI7QUFDQTtBQUNBLE1BQU0sdUJBQXVCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxlQUFQLEVBQVYsQ0FBN0I7QUFDQTtBQUNBLE1BQU0sbUNBQW1DLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSwyQkFBUCxFQUFWLENBQXpDO0FBQ0E7QUFDQSxNQUFNLGlDQUFpQyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sMkJBQVAsRUFBVixDQUF2QztBQUNBO0FBQ0EsTUFBTSx5QkFBeUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGlCQUFQLEVBQVYsQ0FBL0I7QUFDQTtBQUNBLE1BQU0sMEJBQTBCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxrQkFBUCxFQUFWLENBQWhDO0FBQ0E7QUFDQSxNQUFNLHNCQUFzQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sY0FBUCxFQUFWLENBQTVCO0FBQ0E7QUFDQSxNQUFNLGdCQUFnQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sUUFBUCxFQUFWLENBQXRCO0FBQ0E7QUFDQSxNQUFNLGdCQUFnQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sUUFBUCxFQUFWLENBQXRCO0FBQ0E7QUFDQSxNQUFNLHlCQUF5QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0saUJBQVAsRUFBVixDQUEvQjtBQUNBO0FBQ0EsTUFBTSx5QkFBeUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGlCQUFQLEVBQVYsQ0FBL0I7QUFDQTtBQUNBLE1BQU0sdUJBQXVCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxlQUFQLEVBQVYsQ0FBN0I7QUFDQTtBQUNBLE1BQU0sb0JBQW9CLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxZQUFQLEVBQVYsQ0FBMUI7QUFDQTtBQUNBLE1BQU0sZ0JBQWdCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxRQUFQLEVBQVYsQ0FBdEI7QUFDQTtBQUNBLE1BQU0sdUJBQXVCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxlQUFQLEVBQVYsQ0FBN0I7QUFDQTtBQUNBLE1BQU0seUJBQXlCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxpQkFBUCxFQUFWLENBQS9CO0FBQ0E7QUFDQSxNQUFNLGdCQUFnQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sUUFBUCxFQUFWLENBQXRCO0FBQ0E7QUFDQSxNQUFNLGdCQUFnQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sUUFBUCxFQUFWLENBQXRCO0FBQ0E7QUFDQSxNQUFNLGdCQUFnQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sUUFBUCxFQUFWLENBQXRCO0FBQ0E7QUFDQSxNQUFNLHNCQUFzQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sY0FBUCxFQUFWLENBQTVCO0FBQ0E7QUFDQSxNQUFNLDJCQUEyQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sbUJBQVAsRUFBVixDQUFqQztBQUNBO0FBQ0EsTUFBTSw4QkFBOEIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHNCQUFQLEVBQVYsQ0FBcEM7QUFDQTtBQUNBLE1BQU0sNEJBQTRCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxvQkFBUCxFQUFWLENBQWxDO0FBQ0E7QUFDQSxNQUFNLGtDQUFrQyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sMEJBQVAsRUFBVixDQUF4QztBQUNBO0FBQ0EsTUFBTSxtQ0FBbUMsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLDJCQUFQLEVBQVYsQ0FBekM7QUFDQTtBQUNBLE1BQU0sK0JBQStCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSx1QkFBUCxFQUFWLENBQXJDO0FBQ0E7QUFDQSxNQUFNLGtDQUFrQyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sMEJBQVAsRUFBVixDQUF4QztBQUNBO0FBQ0EsTUFBTSxpQ0FBaUMsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHlCQUFQLEVBQVYsQ0FBdkM7QUFDQTtBQUNBLE1BQU0saUNBQWlDLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSx5QkFBUCxFQUFWLENBQXZDO0FBQ0E7QUFDQSxNQUFNLHlCQUF5QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0saUJBQVAsRUFBVixDQUEvQjtBQUNBO0FBQ0EsTUFBTSx5QkFBeUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGlCQUFQLEVBQVYsQ0FBL0I7QUFDQTtBQUNBLE1BQU0sOEJBQThCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxzQkFBUCxFQUFWLENBQXBDO0FBQ0E7QUFDQSxNQUFNLDBCQUEwQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sa0JBQVAsRUFBVixDQUFoQztBQUNBO0FBQ0EsTUFBTSx3QkFBd0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGdCQUFQLEVBQVYsQ0FBOUI7QUFDQTtBQUNBLE1BQU0sc0NBQXNDLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSw4QkFBUCxFQUFWLENBQTVDO0FBQ0E7QUFDQSxNQUFNLGtDQUFrQyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sMEJBQVAsRUFBVixDQUF4QztBQUNBO0FBQ0EsTUFBTSwrQkFBK0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHVCQUFQLEVBQVYsQ0FBckM7QUFDQTtBQUNBLE1BQU0sNEJBQTRCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxvQkFBUCxFQUFWLENBQWxDO0FBQ0E7QUFDQSxNQUFNLDhCQUE4QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sc0JBQVAsRUFBVixDQUFwQztBQUNBO0FBQ0EsTUFBTSx1QkFBdUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGVBQVAsRUFBVixDQUE3QjtBQUNBO0FBQ0EsTUFBTSw2QkFBNkIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFQLEVBQVYsQ0FBbkM7QUFDQTtBQUNBLE1BQU0sMEJBQTBCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxrQkFBUCxFQUFWLENBQWhDO0FBQ0E7QUFDQSxNQUFNLHlCQUF5QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0saUJBQVAsRUFBVixDQUEvQjtBQUNBO0FBQ0EsTUFBTSxnQ0FBZ0MsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHdCQUFQLEVBQVYsQ0FBdEM7QUFDQTtBQUNBLE1BQU0sNEJBQTRCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxvQkFBUCxFQUFWLENBQWxDO0FBQ0E7QUFDQSxNQUFNLHdCQUF3QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sZ0JBQVAsRUFBVixDQUE5QjtBQUNBO0FBQ0EsTUFBTSwwQkFBMEIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGtCQUFQLEVBQVYsQ0FBaEM7QUFDQTtBQUNBLE1BQU0seUJBQXlCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxpQkFBUCxFQUFWLENBQS9CO0FBQ0E7QUFDQSxNQUFNLGtDQUFrQyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sMEJBQVAsRUFBVixDQUF4QztBQUNBO0FBQ0EsTUFBTSx3QkFBd0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGdCQUFQLEVBQVYsQ0FBOUI7QUFDQTtBQUNBLE1BQU0sd0JBQXdCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxnQkFBUCxFQUFWLENBQTlCO0FBQ0E7QUFDQSxNQUFNLDJCQUEyQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sbUJBQVAsRUFBVixDQUFqQztBQUNBO0FBQ0EsTUFBTSxzQ0FBc0MsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLDhCQUFQLEVBQVYsQ0FBNUM7QUFDQTtBQUNBLE1BQU0sMkJBQTJCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxtQkFBUCxFQUFWLENBQWpDO0FBQ0E7QUFDQSxNQUFNLDBCQUEwQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sa0JBQVAsRUFBVixDQUFoQztBQUNBO0FBQ0EsTUFBTSx3QkFBd0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGdCQUFQLEVBQVYsQ0FBOUI7QUFDQTtBQUNBLE1BQU0sNkJBQTZCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBUCxFQUFWLENBQW5DO0FBQ0E7QUFDQSxNQUFNLHdCQUF3QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sZ0JBQVAsRUFBVixDQUE5QjtBQUNBO0FBQ0EsTUFBTSx3QkFBd0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGdCQUFQLEVBQVYsQ0FBOUI7QUFDQTtBQUNBLE1BQU0sc0JBQXNCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxjQUFQLEVBQVYsQ0FBNUI7QUFDQTtBQUNBLE1BQU0scUJBQXFCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxhQUFQLEVBQVYsQ0FBM0I7QUFDQTtBQUNBLE1BQU0sMEJBQTBCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxrQkFBUCxFQUFWLENBQWhDO0FBQ0E7QUFDQSxNQUFNLHlCQUF5QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0saUJBQVAsRUFBVixDQUEvQjtBQUNBO0FBQ0EsTUFBTSx5QkFBeUIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGlCQUFQLEVBQVYsQ0FBL0I7QUFDQTtBQUNBLE1BQU0sb0NBQW9DLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSw0QkFBUCxFQUFWLENBQTFDO0FBQ0E7QUFDQSxNQUFNLHdCQUF3QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sZ0JBQVAsRUFBVixDQUE5QjtBQUNBO0FBQ0EsTUFBTSwyQkFBMkIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLG1CQUFQLEVBQVYsQ0FBakM7QUFDQTtBQUNBLE1BQU0sNkJBQTZCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBUCxFQUFWLENBQW5DO0FBQ0E7QUFDQSxNQUFNLHNDQUFzQyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sOEJBQVAsRUFBVixDQUE1QztBQUNBO0FBQ0EsTUFBTSx3QkFBd0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGdCQUFQLEVBQVYsQ0FBOUI7QUFDQTtBQUNBLE1BQU0sdUJBQXVCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxlQUFQLEVBQVYsQ0FBN0I7QUFDQTtBQUNBLE1BQU0sZ0JBQWdCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxRQUFQLEVBQVYsQ0FBdEI7QUFDQTtBQUNBLE1BQU0sZUFBZSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sT0FBUCxFQUFWLENBQXJCO0FBQ0E7QUFDQSxNQUFNLHFCQUFxQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sYUFBUCxFQUFWLENBQTNCO0FBQ0E7QUFDQSxNQUFNLG1CQUFtQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sV0FBUCxFQUFWLENBQXpCO0FBQ0E7QUFDQSxNQUFNLDBCQUEwQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sa0JBQVAsRUFBVixDQUFoQztBQUNBO0FBQ0EsTUFBTSxzQkFBc0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGNBQVAsRUFBVixDQUE1QjtBQUNBO0FBQ0EsTUFBTSw2QkFBNkIsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLHFCQUFQLEVBQVYsQ0FBbkM7QUFDQTtBQUNBLE1BQU0sZ0JBQWdCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxRQUFQLEVBQVYsQ0FBdEI7QUFDQTtBQUNBLE1BQU0sdUJBQXVCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxlQUFQLEVBQVYsQ0FBN0I7QUFDQTtBQUNBLE1BQU0sZUFBZSxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sT0FBUCxFQUFWLENBQXJCO0FBQ0E7QUFDQSxNQUFNLG9CQUFvQixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sWUFBUCxFQUFWLENBQTFCO0FBQ0E7QUFDQSxNQUFNLHVCQUF1QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sZUFBUCxFQUFWLENBQTdCO0FBQ0E7QUFDQSxNQUFNLHlCQUF5QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0saUJBQVAsRUFBVixDQUEvQjtBQUNBO0FBQ0EsTUFBTSx3QkFBd0IsRUFBRSxPQUFGLENBQVUsRUFBQyxNQUFNLGdCQUFQLEVBQVYsQ0FBOUI7QUFDQTtBQUNBLE1BQU0sNkJBQTZCLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxxQkFBUCxFQUFWLENBQW5DO0FBQ0E7QUFDQSxNQUFNLDRCQUE0QixFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sb0JBQVAsRUFBVixDQUFsQztBQUNBO0FBQ0EsTUFBTSxhQUFhLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxLQUFQLEVBQVYsQ0FBbkI7QUFDQTtBQUNBLE1BQU0sMkJBQTJCLEVBQUUsSUFBRixDQUFPLDBCQUFQLEVBQW1DLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxRQUFQLEVBQVYsQ0FBbkMsQ0FBakM7QUFDQTtBQUNBLE1BQU0sOEJBQThCLEVBQUUsSUFBRixDQUFPLDBCQUFQLEVBQW1DLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxXQUFQLEVBQVYsQ0FBbkMsQ0FBcEM7QUFDQTtBQUNBLE1BQU0sc0JBQXNCLEVBQUUsTUFBRixDQUFTLDBCQUFULEVBQXFDLHlCQUFyQyxDQUE1QjtBQUNBO0FBQ0EsTUFBTSwwQkFBMEIsRUFBRSxHQUFGLENBQU0sbUJBQU4sRUFBMkIsRUFBRSxVQUFGLENBQWEsRUFBRSxLQUFGLENBQVEsRUFBQyxNQUFNLEVBQUUsS0FBVCxFQUFSLENBQWIsQ0FBM0IsQ0FBaEM7QUFDQTtBQUNBLE1BQU0saUNBQWlDLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSx5QkFBUCxFQUFWLENBQXZDO0FBQ0E7QUFDQSxNQUFNLHNCQUFzQixFQUFFLElBQUYsQ0FBTyxhQUFQLEVBQXNCLFlBQVksRUFBRSxFQUFGLENBQUsseUJBQXlCLFNBQVMsV0FBbEMsQ0FBTCxFQUFxRCw0QkFBNEIsU0FBUyxXQUFyQyxDQUFyRCxDQUFsQyxDQUE1QjtBQUNBO0FBQ0EsTUFBTSxvQ0FBb0MsRUFBRSxJQUFGLENBQU8sbUNBQVAsRUFBNEMsYUFBYSw4QkFBOEIsVUFBVSxXQUF4QyxDQUF6RCxDQUExQztBQUNBO0FBQ0EsTUFBTSxnQ0FBZ0MsRUFBRSxNQUFGLENBQVMsd0JBQVQsRUFBbUMsMkJBQW5DLENBQXRDO0FBQ0E7QUFDQSxNQUFNLDhCQUE4QixhQUFhO0FBQy9DLFNBQU8scUJBQXFCLElBQXJCLElBQTZCLG9DQUFvQyxTQUFwQyxDQUE3QixJQUErRSw4QkFBOEIsVUFBVSxXQUF4QyxDQUF0RjtBQUNELENBRkQ7QUFHQTtBQUNBLE1BQU0sMkJBQTJCLEVBQUUsTUFBRixDQUFTLGFBQVQsRUFBd0Isc0JBQXhCLENBQWpDO0FBQ0E7UUFDcUMsb0IsR0FBN0IseUI7UUFDNEIsbUIsR0FBNUIsd0I7UUFDdUIsYyxHQUF2QixtQjtRQUN3QixlLEdBQXhCLG9CO1FBQ29DLDJCLEdBQXBDLGdDO1FBQ2tDLHlCLEdBQWxDLDhCO1FBQzBCLGlCLEdBQTFCLHNCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDaUIsUSxHQUFqQixhO1FBQ2lCLFEsR0FBakIsYTtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUN3QixlLEdBQXhCLG9CO1FBQ3FCLFksR0FBckIsaUI7UUFDaUIsUSxHQUFqQixhO1FBQ3dCLGUsR0FBeEIsb0I7UUFDMEIsaUIsR0FBMUIsc0I7UUFDaUIsUSxHQUFqQixhO1FBQ2lCLFEsR0FBakIsYTtRQUNpQixRLEdBQWpCLGE7UUFDdUIsYyxHQUF2QixtQjtRQUM0QixtQixHQUE1Qix3QjtRQUMrQixzQixHQUEvQiwyQjtRQUM2QixvQixHQUE3Qix5QjtRQUNtQywwQixHQUFuQywrQjtRQUNvQywyQixHQUFwQyxnQztRQUNnQyx1QixHQUFoQyw0QjtRQUNtQywwQixHQUFuQywrQjtRQUNrQyx5QixHQUFsQyw4QjtRQUNrQyx5QixHQUFsQyw4QjtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUMrQixzQixHQUEvQiwyQjtRQUMyQixrQixHQUEzQix1QjtRQUN5QixnQixHQUF6QixxQjtRQUN1Qyw4QixHQUF2QyxtQztRQUNtQywwQixHQUFuQywrQjtRQUNnQyx1QixHQUFoQyw0QjtRQUM2QixvQixHQUE3Qix5QjtRQUMrQixzQixHQUEvQiwyQjtRQUN3QixlLEdBQXhCLG9CO1FBQzhCLHFCLEdBQTlCLDBCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQzBCLGlCLEdBQTFCLHNCO1FBQ2lDLHdCLEdBQWpDLDZCO1FBQzZCLG9CLEdBQTdCLHlCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQzBCLGlCLEdBQTFCLHNCO1FBQ21DLDBCLEdBQW5DLCtCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzRCLG1CLEdBQTVCLHdCO1FBQ3VDLDhCLEdBQXZDLG1DO1FBQzRCLG1CLEdBQTVCLHdCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzhCLHFCLEdBQTlCLDBCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDc0IsYSxHQUF0QixrQjtRQUMyQixrQixHQUEzQix1QjtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUNxQyw0QixHQUFyQyxpQztRQUN5QixnQixHQUF6QixxQjtRQUM0QixtQixHQUE1Qix3QjtRQUM4QixxQixHQUE5QiwwQjtRQUN1Qyw4QixHQUF2QyxtQztRQUN5QixnQixHQUF6QixxQjtRQUN3QixlLEdBQXhCLG9CO1FBQ2lCLFEsR0FBakIsYTtRQUNnQixPLEdBQWhCLFk7UUFDc0IsYSxHQUF0QixrQjtRQUNvQixXLEdBQXBCLGdCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDOEIscUIsR0FBOUIsMEI7UUFDaUIsUSxHQUFqQixhO1FBQ3dCLGUsR0FBeEIsb0I7UUFDZ0IsTyxHQUFoQixZO1FBQ3FCLFksR0FBckIsaUI7UUFDd0IsZSxHQUF4QixvQjtRQUMwQixpQixHQUExQixzQjtRQUN5QixnQixHQUF6QixxQjtRQUM4QixxQixHQUE5QiwwQjtRQUM2QixvQixHQUE3Qix5QjtRQUNjLEssR0FBZCxVO1FBQzRCLG1CLEdBQTVCLHdCO1FBQytCLHNCLEdBQS9CLDJCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDMkIsa0IsR0FBM0IsdUI7UUFDa0MseUIsR0FBbEMsOEI7UUFDdUIsYyxHQUF2QixtQjtRQUNxQyw0QixHQUFyQyxpQztRQUNpQyx3QixHQUFqQyw2QjtRQUMrQixzQixHQUEvQiwyQjtRQUM0QixtQixHQUE1Qix3QiIsImZpbGUiOiJ0ZXJtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHthc3NlcnQsIGV4cGVjdH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge21peGlufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBUZXJtU3BlYyBmcm9tIFwiLi90ZXJtLXNwZWNcIjtcbmltcG9ydCAgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVybSB7XG4gIGNvbnN0cnVjdG9yKHR5cGVfMTM0NSwgcHJvcHNfMTM0Nikge1xuICAgIHRoaXMudHlwZSA9IHR5cGVfMTM0NTtcbiAgICB0aGlzLmxvYyA9IG51bGw7XG4gICAgZm9yIChsZXQgcHJvcCBvZiBPYmplY3Qua2V5cyhwcm9wc18xMzQ2KSkge1xuICAgICAgdGhpc1twcm9wXSA9IHByb3BzXzEzNDZbcHJvcF07XG4gICAgfVxuICB9XG4gIGV4dGVuZChwcm9wc18xMzQ3KSB7XG4gICAgbGV0IG5ld1Byb3BzXzEzNDggPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAocHJvcHNfMTM0Ny5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgICAgbmV3UHJvcHNfMTM0OFtmaWVsZF0gPSBwcm9wc18xMzQ3W2ZpZWxkXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Byb3BzXzEzNDhbZmllbGRdID0gdGhpc1tmaWVsZF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0aGlzLnR5cGUsIG5ld1Byb3BzXzEzNDgpO1xuICB9XG4gIGdlbih7aW5jbHVkZUltcG9ydHN9ID0ge2luY2x1ZGVJbXBvcnRzOiB0cnVlfSkge1xuICAgIGxldCBuZXh0XzEzNDkgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAodGhpc1tmaWVsZF0gPT0gbnVsbCkge1xuICAgICAgICBuZXh0XzEzNDlbZmllbGRdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodGhpc1tmaWVsZF0gaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICAgIG5leHRfMTM0OVtmaWVsZF0gPSB0aGlzW2ZpZWxkXS5nZW4oaW5jbHVkZUltcG9ydHMpO1xuICAgICAgfSBlbHNlIGlmIChMaXN0LmlzTGlzdCh0aGlzW2ZpZWxkXSkpIHtcbiAgICAgICAgbGV0IHByZWQgPSBpbmNsdWRlSW1wb3J0cyA/IFIuY29tcGxlbWVudChpc0NvbXBpbGV0aW1lU3RhdGVtZW50XzEzNDMpIDogUi5ib3RoKFIuY29tcGxlbWVudChpc0ltcG9ydERlY2xhcmF0aW9uXzEzNDQpLCBSLmNvbXBsZW1lbnQoaXNDb21waWxldGltZVN0YXRlbWVudF8xMzQzKSk7XG4gICAgICAgIG5leHRfMTM0OVtmaWVsZF0gPSB0aGlzW2ZpZWxkXS5maWx0ZXIocHJlZCkubWFwKHRlcm1fMTM1MCA9PiB0ZXJtXzEzNTAgaW5zdGFuY2VvZiBUZXJtID8gdGVybV8xMzUwLmdlbihpbmNsdWRlSW1wb3J0cykgOiB0ZXJtXzEzNTApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dF8xMzQ5W2ZpZWxkXSA9IHRoaXNbZmllbGRdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odGhpcy50eXBlLCBuZXh0XzEzNDkpO1xuICB9XG4gIHZpc2l0KGZfMTM1MSkge1xuICAgIGxldCBuZXh0XzEzNTIgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAodGhpc1tmaWVsZF0gPT0gbnVsbCkge1xuICAgICAgICBuZXh0XzEzNTJbZmllbGRdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoTGlzdC5pc0xpc3QodGhpc1tmaWVsZF0pKSB7XG4gICAgICAgIG5leHRfMTM1MltmaWVsZF0gPSB0aGlzW2ZpZWxkXS5tYXAoZmllbGRfMTM1MyA9PiBmaWVsZF8xMzUzICE9IG51bGwgPyBmXzEzNTEoZmllbGRfMTM1MykgOiBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfMTM1MltmaWVsZF0gPSBmXzEzNTEodGhpc1tmaWVsZF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHRlbmQobmV4dF8xMzUyKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV8xMzU0LCBiaW5kaW5nc18xMzU1LCBwaGFzZV8xMzU2LCBvcHRpb25zXzEzNTcpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh0ZXJtXzEzNTggPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0ZXJtXzEzNTguYWRkU2NvcGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGVybV8xMzU4LmFkZFNjb3BlKHNjb3BlXzEzNTQsIGJpbmRpbmdzXzEzNTUsIHBoYXNlXzEzNTYsIG9wdGlvbnNfMTM1Nyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVybV8xMzU4O1xuICAgIH0pO1xuICB9XG4gIHJlbW92ZVNjb3BlKHNjb3BlXzEzNTksIHBoYXNlXzEzNjApIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh0ZXJtXzEzNjEgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0ZXJtXzEzNjEucmVtb3ZlU2NvcGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGVybV8xMzYxLnJlbW92ZVNjb3BlKHNjb3BlXzEzNTksIHBoYXNlXzEzNjApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRlcm1fMTM2MTtcbiAgICB9KTtcbiAgfVxuICBsaW5lTnVtYmVyKCkge1xuICAgIGZvciAobGV0IGZpZWxkIG9mIFRlcm1TcGVjLnNwZWNbdGhpcy50eXBlXS5maWVsZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1tmaWVsZF0gJiYgdGhpc1tmaWVsZF0ubGluZU51bWJlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzW2ZpZWxkXS5saW5lTnVtYmVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV8xMzYyKSB7XG4gICAgbGV0IG5leHRfMTM2MyA9IHt9O1xuICAgIGZvciAobGV0IGZpZWxkIG9mIFRlcm1TcGVjLnNwZWNbdGhpcy50eXBlXS5maWVsZHMpIHtcbiAgICAgIGlmICh0aGlzW2ZpZWxkXSA9PSBudWxsKSB7XG4gICAgICAgIG5leHRfMTM2M1tmaWVsZF0gPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpc1tmaWVsZF0uc2V0TGluZU51bWJlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG5leHRfMTM2M1tmaWVsZF0gPSB0aGlzW2ZpZWxkXS5zZXRMaW5lTnVtYmVyKGxpbmVfMTM2Mik7XG4gICAgICB9IGVsc2UgaWYgKExpc3QuaXNMaXN0KHRoaXNbZmllbGRdKSkge1xuICAgICAgICBuZXh0XzEzNjNbZmllbGRdID0gdGhpc1tmaWVsZF0ubWFwKGZfMTM2NCA9PiBmXzEzNjQuc2V0TGluZU51bWJlcihsaW5lXzEzNjIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfMTM2M1tmaWVsZF0gPSB0aGlzW2ZpZWxkXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHRoaXMudHlwZSwgbmV4dF8xMzYzKTtcbiAgfVxufVxuY29uc3QgaXNCaW5kaW5nV2l0aERlZmF1bHRfMTI0NSA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5kaW5nV2l0aERlZmF1bHRcIn0pO1xuO1xuY29uc3QgaXNCaW5kaW5nSWRlbnRpZmllcl8xMjQ2ID0gUi53aGVyZUVxKHt0eXBlOiBcIkJpbmRpbmdJZGVudGlmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzQXJyYXlCaW5kaW5nXzEyNDcgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyYXlCaW5kaW5nXCJ9KTtcbjtcbmNvbnN0IGlzT2JqZWN0QmluZGluZ18xMjQ4ID0gUi53aGVyZUVxKHt0eXBlOiBcIk9iamVjdEJpbmRpbmdcIn0pO1xuO1xuY29uc3QgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXzEyNDkgPSBSLndoZXJlRXEoe3R5cGU6IFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwifSk7XG47XG5jb25zdCBpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XzEyNTAgPSBSLndoZXJlRXEoe3R5cGU6IFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwifSk7XG47XG5jb25zdCBpc0NsYXNzRXhwcmVzc2lvbl8xMjUxID0gUi53aGVyZUVxKHt0eXBlOiBcIkNsYXNzRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0NsYXNzRGVjbGFyYXRpb25fMTI1MiA9IFIud2hlcmVFcSh7dHlwZTogXCJDbGFzc0RlY2xhcmF0aW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ2xhc3NFbGVtZW50XzEyNTMgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ2xhc3NFbGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzTW9kdWxlXzEyNTQgPSBSLndoZXJlRXEoe3R5cGU6IFwiTW9kdWxlXCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0XzEyNTUgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0XCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0TmFtZXNwYWNlXzEyNTYgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0TmFtZXNwYWNlXCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0U3BlY2lmaWVyXzEyNTcgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0U3BlY2lmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzRXhwb3J0QWxsRnJvbV8xMjU4ID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydEFsbEZyb21cIn0pO1xuO1xuY29uc3QgaXNFeHBvcnRGcm9tXzEyNTkgPSBSLndoZXJlRXEoe3R5cGU6IFwiRXhwb3J0RnJvbVwifSk7XG47XG5jb25zdCBpc0V4cG9ydF8xMjYwID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydFwifSk7XG47XG5jb25zdCBpc0V4cG9ydERlZmF1bHRfMTI2MSA9IFIud2hlcmVFcSh7dHlwZTogXCJFeHBvcnREZWZhdWx0XCJ9KTtcbjtcbmNvbnN0IGlzRXhwb3J0U3BlY2lmaWVyXzEyNjIgPSBSLndoZXJlRXEoe3R5cGU6IFwiRXhwb3J0U3BlY2lmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzTWV0aG9kXzEyNjMgPSBSLndoZXJlRXEoe3R5cGU6IFwiTWV0aG9kXCJ9KTtcbjtcbmNvbnN0IGlzR2V0dGVyXzEyNjQgPSBSLndoZXJlRXEoe3R5cGU6IFwiR2V0dGVyXCJ9KTtcbjtcbmNvbnN0IGlzU2V0dGVyXzEyNjUgPSBSLndoZXJlRXEoe3R5cGU6IFwiU2V0dGVyXCJ9KTtcbjtcbmNvbnN0IGlzRGF0YVByb3BlcnR5XzEyNjYgPSBSLndoZXJlRXEoe3R5cGU6IFwiRGF0YVByb3BlcnR5XCJ9KTtcbjtcbmNvbnN0IGlzU2hvcnRoYW5kUHJvcGVydHlfMTI2NyA9IFIud2hlcmVFcSh7dHlwZTogXCJTaG9ydGhhbmRQcm9wZXJ0eVwifSk7XG47XG5jb25zdCBpc0NvbXB1dGVkUHJvcGVydHlOYW1lXzEyNjggPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIn0pO1xuO1xuY29uc3QgaXNTdGF0aWNQcm9wZXJ0eU5hbWVfMTI2OSA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25fMTI3MCA9IFIud2hlcmVFcSh7dHlwZTogXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uXzEyNzEgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxOdWxsRXhwcmVzc2lvbl8xMjcyID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxOdW1lcmljRXhwcmVzc2lvbl8xMjczID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxSZWdFeHBFeHByZXNzaW9uXzEyNzQgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbl8xMjc1ID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXJyYXlFeHByZXNzaW9uXzEyNzYgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyYXlFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXJyb3dFeHByZXNzaW9uXzEyNzcgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyb3dFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXNzaWdubWVudEV4cHJlc3Npb25fMTI3OCA9IFIud2hlcmVFcSh7dHlwZTogXCJBc3NpZ25tZW50RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0JpbmFyeUV4cHJlc3Npb25fMTI3OSA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ2FsbEV4cHJlc3Npb25fMTI4MCA9IFIud2hlcmVFcSh7dHlwZTogXCJDYWxsRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0NvbXB1dGVkQXNzaWdubWVudEV4cHJlc3Npb25fMTI4MSA9IFIud2hlcmVFcSh7dHlwZTogXCJDb21wdXRlZEFzc2lnbm1lbnRFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXzEyODIgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ29uZGl0aW9uYWxFeHByZXNzaW9uXzEyODMgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25FeHByZXNzaW9uXzEyODQgPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25FeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzSWRlbnRpZmllckV4cHJlc3Npb25fMTI4NSA9IFIud2hlcmVFcSh7dHlwZTogXCJJZGVudGlmaWVyRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc05ld0V4cHJlc3Npb25fMTI4NiA9IFIud2hlcmVFcSh7dHlwZTogXCJOZXdFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzTmV3VGFyZ2V0RXhwcmVzc2lvbl8xMjg3ID0gUi53aGVyZUVxKHt0eXBlOiBcIk5ld1RhcmdldEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNPYmplY3RFeHByZXNzaW9uXzEyODggPSBSLndoZXJlRXEoe3R5cGU6IFwiT2JqZWN0RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1VuYXJ5RXhwcmVzc2lvbl8xMjg5ID0gUi53aGVyZUVxKHt0eXBlOiBcIlVuYXJ5RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1N0YXRpY01lbWJlckV4cHJlc3Npb25fMTI5MCA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzVGVtcGxhdGVFeHByZXNzaW9uXzEyOTEgPSBSLndoZXJlRXEoe3R5cGU6IFwiVGVtcGxhdGVFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzVGhpc0V4cHJlc3Npb25fMTI5MiA9IFIud2hlcmVFcSh7dHlwZTogXCJUaGlzRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1VwZGF0ZUV4cHJlc3Npb25fMTI5MyA9IFIud2hlcmVFcSh7dHlwZTogXCJVcGRhdGVFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzWWllbGRFeHByZXNzaW9uXzEyOTQgPSBSLndoZXJlRXEoe3R5cGU6IFwiWWllbGRFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXzEyOTUgPSBSLndoZXJlRXEoe3R5cGU6IFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQmxvY2tTdGF0ZW1lbnRfMTI5NiA9IFIud2hlcmVFcSh7dHlwZTogXCJCbG9ja1N0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0JyZWFrU3RhdGVtZW50XzEyOTcgPSBSLndoZXJlRXEoe3R5cGU6IFwiQnJlYWtTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNDb250aW51ZVN0YXRlbWVudF8xMjk4ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbnRpbnVlU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjk5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNEZWJ1Z2dlclN0YXRlbWVudF8xMzAwID0gUi53aGVyZUVxKHt0eXBlOiBcIkRlYnVnZ2VyU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRG9XaGlsZVN0YXRlbWVudF8xMzAxID0gUi53aGVyZUVxKHt0eXBlOiBcIkRvV2hpbGVTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNFbXB0eVN0YXRlbWVudF8xMzAyID0gUi53aGVyZUVxKHt0eXBlOiBcIkVtcHR5U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRXhwcmVzc2lvblN0YXRlbWVudF8xMzAzID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNGb3JJblN0YXRlbWVudF8xMzA0ID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvckluU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRm9yT2ZTdGF0ZW1lbnRfMTMwNSA9IFIud2hlcmVFcSh7dHlwZTogXCJGb3JPZlN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0ZvclN0YXRlbWVudF8xMzA2ID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvclN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0lmU3RhdGVtZW50XzEzMDcgPSBSLndoZXJlRXEoe3R5cGU6IFwiSWZTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNMYWJlbGVkU3RhdGVtZW50XzEzMDggPSBSLndoZXJlRXEoe3R5cGU6IFwiTGFiZWxlZFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1JldHVyblN0YXRlbWVudF8xMzA5ID0gUi53aGVyZUVxKHt0eXBlOiBcIlJldHVyblN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1N3aXRjaFN0YXRlbWVudF8xMzEwID0gUi53aGVyZUVxKHt0eXBlOiBcIlN3aXRjaFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1N3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XzEzMTEgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIn0pO1xuO1xuY29uc3QgaXNUaHJvd1N0YXRlbWVudF8xMzEyID0gUi53aGVyZUVxKHt0eXBlOiBcIlRocm93U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzVHJ5Q2F0Y2hTdGF0ZW1lbnRfMTMxMyA9IFIud2hlcmVFcSh7dHlwZTogXCJUcnlDYXRjaFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1RyeUZpbmFsbHlTdGF0ZW1lbnRfMTMxNCA9IFIud2hlcmVFcSh7dHlwZTogXCJUcnlGaW5hbGx5U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudF8xMzE1ID0gUi53aGVyZUVxKHt0eXBlOiBcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNXaGlsZVN0YXRlbWVudF8xMzE2ID0gUi53aGVyZUVxKHt0eXBlOiBcIldoaWxlU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzV2l0aFN0YXRlbWVudF8xMzE3ID0gUi53aGVyZUVxKHt0eXBlOiBcIldpdGhTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNQcmFnbWFfMTMxOCA9IFIud2hlcmVFcSh7dHlwZTogXCJQcmFnbWFcIn0pO1xuO1xuY29uc3QgaXNCbG9ja18xMzE5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkJsb2NrXCJ9KTtcbjtcbmNvbnN0IGlzQ2F0Y2hDbGF1c2VfMTMyMCA9IFIud2hlcmVFcSh7dHlwZTogXCJDYXRjaENsYXVzZVwifSk7XG47XG5jb25zdCBpc0RpcmVjdGl2ZV8xMzIxID0gUi53aGVyZUVxKHt0eXBlOiBcIkRpcmVjdGl2ZVwifSk7XG47XG5jb25zdCBpc0Zvcm1hbFBhcmFtZXRlcnNfMTMyMiA9IFIud2hlcmVFcSh7dHlwZTogXCJGb3JtYWxQYXJhbWV0ZXJzXCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25Cb2R5XzEzMjMgPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25Cb2R5XCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25EZWNsYXJhdGlvbl8xMzI0ID0gUi53aGVyZUVxKHt0eXBlOiBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIn0pO1xuO1xuY29uc3QgaXNTY3JpcHRfMTMyNSA9IFIud2hlcmVFcSh7dHlwZTogXCJTY3JpcHRcIn0pO1xuO1xuY29uc3QgaXNTcHJlYWRFbGVtZW50XzEzMjYgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3ByZWFkRWxlbWVudFwifSk7XG47XG5jb25zdCBpc1N1cGVyXzEzMjcgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3VwZXJcIn0pO1xuO1xuY29uc3QgaXNTd2l0Y2hDYXNlXzEzMjggPSBSLndoZXJlRXEoe3R5cGU6IFwiU3dpdGNoQ2FzZVwifSk7XG47XG5jb25zdCBpc1N3aXRjaERlZmF1bHRfMTMyOSA9IFIud2hlcmVFcSh7dHlwZTogXCJTd2l0Y2hEZWZhdWx0XCJ9KTtcbjtcbmNvbnN0IGlzVGVtcGxhdGVFbGVtZW50XzEzMzAgPSBSLndoZXJlRXEoe3R5cGU6IFwiVGVtcGxhdGVFbGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzU3ludGF4VGVtcGxhdGVfMTMzMSA9IFIud2hlcmVFcSh7dHlwZTogXCJTeW50YXhUZW1wbGF0ZVwifSk7XG47XG5jb25zdCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25fMTMzMiA9IFIud2hlcmVFcSh7dHlwZTogXCJWYXJpYWJsZURlY2xhcmF0aW9uXCJ9KTtcbjtcbmNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdG9yXzEzMzMgPSBSLndoZXJlRXEoe3R5cGU6IFwiVmFyaWFibGVEZWNsYXJhdG9yXCJ9KTtcbjtcbmNvbnN0IGlzRU9GXzEzMzQgPSBSLndoZXJlRXEoe3R5cGU6IFwiRU9GXCJ9KTtcbjtcbmNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb25fMTMzNSA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb25fMTMzMiwgUi53aGVyZUVxKHtraW5kOiBcInN5bnRheFwifSkpO1xuO1xuY29uc3QgaXNTeW50YXhyZWNEZWNsYXJhdGlvbl8xMzM2ID0gUi5ib3RoKGlzVmFyaWFibGVEZWNsYXJhdGlvbl8xMzMyLCBSLndoZXJlRXEoe2tpbmQ6IFwic3ludGF4cmVjXCJ9KSk7XG47XG5jb25zdCBpc0Z1bmN0aW9uVGVybV8xMzM3ID0gUi5laXRoZXIoaXNGdW5jdGlvbkRlY2xhcmF0aW9uXzEzMjQsIGlzRnVuY3Rpb25FeHByZXNzaW9uXzEyODQpO1xuO1xuY29uc3QgaXNGdW5jdGlvbldpdGhOYW1lXzEzMzggPSBSLmFuZChpc0Z1bmN0aW9uVGVybV8xMzM3LCBSLmNvbXBsZW1lbnQoUi53aGVyZSh7bmFtZTogUi5pc05pbH0pKSk7XG47XG5jb25zdCBpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uXzEzMzkgPSBSLndoZXJlRXEoe3R5cGU6IFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNFeHBvcnRTeW50YXhfMTM0MCA9IFIuYm90aChpc0V4cG9ydF8xMjYwLCBleHBfMTM2NSA9PiBSLm9yKGlzU3ludGF4RGVjbGFyYXRpb25fMTMzNShleHBfMTM2NS5kZWNsYXJhdGlvbiksIGlzU3ludGF4cmVjRGVjbGFyYXRpb25fMTMzNihleHBfMTM2NS5kZWNsYXJhdGlvbikpKTtcbjtcbmNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb25TdGF0ZW1lbnRfMTM0MSA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMxNSwgZGVjbF8xMzY2ID0+IGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzQyKGRlY2xfMTM2Ni5kZWNsYXJhdGlvbikpO1xuO1xuY29uc3QgaXNDb21waWxldGltZURlY2xhcmF0aW9uXzEzNDIgPSBSLmVpdGhlcihpc1N5bnRheERlY2xhcmF0aW9uXzEzMzUsIGlzU3ludGF4cmVjRGVjbGFyYXRpb25fMTMzNik7XG47XG5jb25zdCBpc0NvbXBpbGV0aW1lU3RhdGVtZW50XzEzNDMgPSB0ZXJtXzEzNjcgPT4ge1xuICByZXR1cm4gdGVybV8xMzY3IGluc3RhbmNlb2YgVGVybSAmJiBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMxNSh0ZXJtXzEzNjcpICYmIGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzQyKHRlcm1fMTM2Ny5kZWNsYXJhdGlvbik7XG59O1xuO1xuY29uc3QgaXNJbXBvcnREZWNsYXJhdGlvbl8xMzQ0ID0gUi5laXRoZXIoaXNJbXBvcnRfMTI1NSwgaXNJbXBvcnROYW1lc3BhY2VfMTI1Nik7XG47XG5leHBvcnQge2lzQmluZGluZ1dpdGhEZWZhdWx0XzEyNDUgYXMgaXNCaW5kaW5nV2l0aERlZmF1bHR9O1xuZXhwb3J0IHtpc0JpbmRpbmdJZGVudGlmaWVyXzEyNDYgYXMgaXNCaW5kaW5nSWRlbnRpZmllcn07XG5leHBvcnQge2lzQXJyYXlCaW5kaW5nXzEyNDcgYXMgaXNBcnJheUJpbmRpbmd9O1xuZXhwb3J0IHtpc09iamVjdEJpbmRpbmdfMTI0OCBhcyBpc09iamVjdEJpbmRpbmd9O1xuZXhwb3J0IHtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJfMTI0OSBhcyBpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJ9O1xuZXhwb3J0IHtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XzEyNTAgYXMgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eX07XG5leHBvcnQge2lzQ2xhc3NFeHByZXNzaW9uXzEyNTEgYXMgaXNDbGFzc0V4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NsYXNzRGVjbGFyYXRpb25fMTI1MiBhcyBpc0NsYXNzRGVjbGFyYXRpb259O1xuZXhwb3J0IHtpc0NsYXNzRWxlbWVudF8xMjUzIGFzIGlzQ2xhc3NFbGVtZW50fTtcbmV4cG9ydCB7aXNNb2R1bGVfMTI1NCBhcyBpc01vZHVsZX07XG5leHBvcnQge2lzSW1wb3J0XzEyNTUgYXMgaXNJbXBvcnR9O1xuZXhwb3J0IHtpc0ltcG9ydE5hbWVzcGFjZV8xMjU2IGFzIGlzSW1wb3J0TmFtZXNwYWNlfTtcbmV4cG9ydCB7aXNJbXBvcnRTcGVjaWZpZXJfMTI1NyBhcyBpc0ltcG9ydFNwZWNpZmllcn07XG5leHBvcnQge2lzRXhwb3J0QWxsRnJvbV8xMjU4IGFzIGlzRXhwb3J0QWxsRnJvbX07XG5leHBvcnQge2lzRXhwb3J0RnJvbV8xMjU5IGFzIGlzRXhwb3J0RnJvbX07XG5leHBvcnQge2lzRXhwb3J0XzEyNjAgYXMgaXNFeHBvcnR9O1xuZXhwb3J0IHtpc0V4cG9ydERlZmF1bHRfMTI2MSBhcyBpc0V4cG9ydERlZmF1bHR9O1xuZXhwb3J0IHtpc0V4cG9ydFNwZWNpZmllcl8xMjYyIGFzIGlzRXhwb3J0U3BlY2lmaWVyfTtcbmV4cG9ydCB7aXNNZXRob2RfMTI2MyBhcyBpc01ldGhvZH07XG5leHBvcnQge2lzR2V0dGVyXzEyNjQgYXMgaXNHZXR0ZXJ9O1xuZXhwb3J0IHtpc1NldHRlcl8xMjY1IGFzIGlzU2V0dGVyfTtcbmV4cG9ydCB7aXNEYXRhUHJvcGVydHlfMTI2NiBhcyBpc0RhdGFQcm9wZXJ0eX07XG5leHBvcnQge2lzU2hvcnRoYW5kUHJvcGVydHlfMTI2NyBhcyBpc1Nob3J0aGFuZFByb3BlcnR5fTtcbmV4cG9ydCB7aXNDb21wdXRlZFByb3BlcnR5TmFtZV8xMjY4IGFzIGlzQ29tcHV0ZWRQcm9wZXJ0eU5hbWV9O1xuZXhwb3J0IHtpc1N0YXRpY1Byb3BlcnR5TmFtZV8xMjY5IGFzIGlzU3RhdGljUHJvcGVydHlOYW1lfTtcbmV4cG9ydCB7aXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25fMTI3MCBhcyBpc0xpdGVyYWxCb29sZWFuRXhwcmVzc2lvbn07XG5leHBvcnQge2lzTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbl8xMjcxIGFzIGlzTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbn07XG5leHBvcnQge2lzTGl0ZXJhbE51bGxFeHByZXNzaW9uXzEyNzIgYXMgaXNMaXRlcmFsTnVsbEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0xpdGVyYWxOdW1lcmljRXhwcmVzc2lvbl8xMjczIGFzIGlzTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbl8xMjc0IGFzIGlzTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0xpdGVyYWxTdHJpbmdFeHByZXNzaW9uXzEyNzUgYXMgaXNMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbn07XG5leHBvcnQge2lzQXJyYXlFeHByZXNzaW9uXzEyNzYgYXMgaXNBcnJheUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0Fycm93RXhwcmVzc2lvbl8xMjc3IGFzIGlzQXJyb3dFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjc4IGFzIGlzQXNzaWdubWVudEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0JpbmFyeUV4cHJlc3Npb25fMTI3OSBhcyBpc0JpbmFyeUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NhbGxFeHByZXNzaW9uXzEyODAgYXMgaXNDYWxsRXhwcmVzc2lvbn07XG5leHBvcnQge2lzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjgxIGFzIGlzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbn07XG5leHBvcnQge2lzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXzEyODIgYXMgaXNDb21wdXRlZE1lbWJlckV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NvbmRpdGlvbmFsRXhwcmVzc2lvbl8xMjgzIGFzIGlzQ29uZGl0aW9uYWxFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNGdW5jdGlvbkV4cHJlc3Npb25fMTI4NCBhcyBpc0Z1bmN0aW9uRXhwcmVzc2lvbn07XG5leHBvcnQge2lzSWRlbnRpZmllckV4cHJlc3Npb25fMTI4NSBhcyBpc0lkZW50aWZpZXJFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNOZXdFeHByZXNzaW9uXzEyODYgYXMgaXNOZXdFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNOZXdUYXJnZXRFeHByZXNzaW9uXzEyODcgYXMgaXNOZXdUYXJnZXRFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNPYmplY3RFeHByZXNzaW9uXzEyODggYXMgaXNPYmplY3RFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNVbmFyeUV4cHJlc3Npb25fMTI4OSBhcyBpc1VuYXJ5RXhwcmVzc2lvbn07XG5leHBvcnQge2lzU3RhdGljTWVtYmVyRXhwcmVzc2lvbl8xMjkwIGFzIGlzU3RhdGljTWVtYmVyRXhwcmVzc2lvbn07XG5leHBvcnQge2lzVGVtcGxhdGVFeHByZXNzaW9uXzEyOTEgYXMgaXNUZW1wbGF0ZUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc1RoaXNFeHByZXNzaW9uXzEyOTIgYXMgaXNUaGlzRXhwcmVzc2lvbn07XG5leHBvcnQge2lzVXBkYXRlRXhwcmVzc2lvbl8xMjkzIGFzIGlzVXBkYXRlRXhwcmVzc2lvbn07XG5leHBvcnQge2lzWWllbGRFeHByZXNzaW9uXzEyOTQgYXMgaXNZaWVsZEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc1lpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbl8xMjk1IGFzIGlzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNCbG9ja1N0YXRlbWVudF8xMjk2IGFzIGlzQmxvY2tTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0JyZWFrU3RhdGVtZW50XzEyOTcgYXMgaXNCcmVha1N0YXRlbWVudH07XG5leHBvcnQge2lzQ29udGludWVTdGF0ZW1lbnRfMTI5OCBhcyBpc0NvbnRpbnVlU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXzEyOTkgYXMgaXNDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNEZWJ1Z2dlclN0YXRlbWVudF8xMzAwIGFzIGlzRGVidWdnZXJTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0RvV2hpbGVTdGF0ZW1lbnRfMTMwMSBhcyBpc0RvV2hpbGVTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0VtcHR5U3RhdGVtZW50XzEzMDIgYXMgaXNFbXB0eVN0YXRlbWVudH07XG5leHBvcnQge2lzRXhwcmVzc2lvblN0YXRlbWVudF8xMzAzIGFzIGlzRXhwcmVzc2lvblN0YXRlbWVudH07XG5leHBvcnQge2lzRm9ySW5TdGF0ZW1lbnRfMTMwNCBhcyBpc0ZvckluU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNGb3JPZlN0YXRlbWVudF8xMzA1IGFzIGlzRm9yT2ZTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0ZvclN0YXRlbWVudF8xMzA2IGFzIGlzRm9yU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNJZlN0YXRlbWVudF8xMzA3IGFzIGlzSWZTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0xhYmVsZWRTdGF0ZW1lbnRfMTMwOCBhcyBpc0xhYmVsZWRTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc1JldHVyblN0YXRlbWVudF8xMzA5IGFzIGlzUmV0dXJuU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNTd2l0Y2hTdGF0ZW1lbnRfMTMxMCBhcyBpc1N3aXRjaFN0YXRlbWVudH07XG5leHBvcnQge2lzU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRfMTMxMSBhcyBpc1N3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0fTtcbmV4cG9ydCB7aXNUaHJvd1N0YXRlbWVudF8xMzEyIGFzIGlzVGhyb3dTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc1RyeUNhdGNoU3RhdGVtZW50XzEzMTMgYXMgaXNUcnlDYXRjaFN0YXRlbWVudH07XG5leHBvcnQge2lzVHJ5RmluYWxseVN0YXRlbWVudF8xMzE0IGFzIGlzVHJ5RmluYWxseVN0YXRlbWVudH07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudF8xMzE1IGFzIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudH07XG5leHBvcnQge2lzV2hpbGVTdGF0ZW1lbnRfMTMxNiBhcyBpc1doaWxlU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNXaXRoU3RhdGVtZW50XzEzMTcgYXMgaXNXaXRoU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNQcmFnbWFfMTMxOCBhcyBpc1ByYWdtYX07XG5leHBvcnQge2lzQmxvY2tfMTMxOSBhcyBpc0Jsb2NrfTtcbmV4cG9ydCB7aXNDYXRjaENsYXVzZV8xMzIwIGFzIGlzQ2F0Y2hDbGF1c2V9O1xuZXhwb3J0IHtpc0RpcmVjdGl2ZV8xMzIxIGFzIGlzRGlyZWN0aXZlfTtcbmV4cG9ydCB7aXNGb3JtYWxQYXJhbWV0ZXJzXzEzMjIgYXMgaXNGb3JtYWxQYXJhbWV0ZXJzfTtcbmV4cG9ydCB7aXNGdW5jdGlvbkJvZHlfMTMyMyBhcyBpc0Z1bmN0aW9uQm9keX07XG5leHBvcnQge2lzRnVuY3Rpb25EZWNsYXJhdGlvbl8xMzI0IGFzIGlzRnVuY3Rpb25EZWNsYXJhdGlvbn07XG5leHBvcnQge2lzU2NyaXB0XzEzMjUgYXMgaXNTY3JpcHR9O1xuZXhwb3J0IHtpc1NwcmVhZEVsZW1lbnRfMTMyNiBhcyBpc1NwcmVhZEVsZW1lbnR9O1xuZXhwb3J0IHtpc1N1cGVyXzEzMjcgYXMgaXNTdXBlcn07XG5leHBvcnQge2lzU3dpdGNoQ2FzZV8xMzI4IGFzIGlzU3dpdGNoQ2FzZX07XG5leHBvcnQge2lzU3dpdGNoRGVmYXVsdF8xMzI5IGFzIGlzU3dpdGNoRGVmYXVsdH07XG5leHBvcnQge2lzVGVtcGxhdGVFbGVtZW50XzEzMzAgYXMgaXNUZW1wbGF0ZUVsZW1lbnR9O1xuZXhwb3J0IHtpc1N5bnRheFRlbXBsYXRlXzEzMzEgYXMgaXNTeW50YXhUZW1wbGF0ZX07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdGlvbl8xMzMyIGFzIGlzVmFyaWFibGVEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdG9yXzEzMzMgYXMgaXNWYXJpYWJsZURlY2xhcmF0b3J9O1xuZXhwb3J0IHtpc0VPRl8xMzM0IGFzIGlzRU9GfTtcbmV4cG9ydCB7aXNTeW50YXhEZWNsYXJhdGlvbl8xMzM1IGFzIGlzU3ludGF4RGVjbGFyYXRpb259O1xuZXhwb3J0IHtpc1N5bnRheHJlY0RlY2xhcmF0aW9uXzEzMzYgYXMgaXNTeW50YXhyZWNEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzRnVuY3Rpb25UZXJtXzEzMzcgYXMgaXNGdW5jdGlvblRlcm19O1xuZXhwb3J0IHtpc0Z1bmN0aW9uV2l0aE5hbWVfMTMzOCBhcyBpc0Z1bmN0aW9uV2l0aE5hbWV9O1xuZXhwb3J0IHtpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uXzEzMzkgYXMgaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbn07XG5leHBvcnQge2lzRXhwb3J0U3ludGF4XzEzNDAgYXMgaXNFeHBvcnRTeW50YXh9O1xuZXhwb3J0IHtpc1N5bnRheERlY2xhcmF0aW9uU3RhdGVtZW50XzEzNDEgYXMgaXNTeW50YXhEZWNsYXJhdGlvblN0YXRlbWVudH07XG5leHBvcnQge2lzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzQyIGFzIGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzQ29tcGlsZXRpbWVTdGF0ZW1lbnRfMTM0MyBhcyBpc0NvbXBpbGV0aW1lU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNJbXBvcnREZWNsYXJhdGlvbl8xMzQ0IGFzIGlzSW1wb3J0RGVjbGFyYXRpb259Il19