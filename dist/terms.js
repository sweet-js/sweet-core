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
  constructor(type_1333, props_1334) {
    this.type = type_1333;
    this.loc = null;
    for (let prop of Object.keys(props_1334)) {
      this[prop] = props_1334[prop];
    }
  }
  extend(props_1335) {
    let newProps_1336 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (props_1335.hasOwnProperty(field)) {
        newProps_1336[field] = props_1335[field];
      } else {
        newProps_1336[field] = this[field];
      }
    }
    return new Term(this.type, newProps_1336);
  }
  gen() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? { includeImports: true } : arguments[0];

    let includeImports = _ref.includeImports;

    let next_1337 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1337[field] = null;
      } else if (this[field] instanceof Term) {
        next_1337[field] = this[field].gen(includeImports);
      } else if (_immutable.List.isList(this[field])) {
        let pred = includeImports ? R.complement(isCompiletimeStatement_1331) : R.both(R.complement(isImportDeclaration_1332), R.complement(isCompiletimeStatement_1331));
        next_1337[field] = this[field].filter(pred).map(term_1338 => term_1338 instanceof Term ? term_1338.gen(includeImports) : term_1338);
      } else {
        next_1337[field] = this[field];
      }
    }
    return new Term(this.type, next_1337);
  }
  visit(f_1339) {
    let next_1340 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1340[field] = null;
      } else if (_immutable.List.isList(this[field])) {
        next_1340[field] = this[field].map(field_1341 => field_1341 != null ? f_1339(field_1341) : null);
      } else {
        next_1340[field] = f_1339(this[field]);
      }
    }
    return this.extend(next_1340);
  }
  addScope(scope_1342, bindings_1343, phase_1344, options_1345) {
    return this.visit(term_1346 => {
      if (typeof term_1346.addScope === "function") {
        return term_1346.addScope(scope_1342, bindings_1343, phase_1344, options_1345);
      }
      return term_1346;
    });
  }
  removeScope(scope_1347, phase_1348) {
    return this.visit(term_1349 => {
      if (typeof term_1349.removeScope === "function") {
        return term_1349.removeScope(scope_1347, phase_1348);
      }
      return term_1349;
    });
  }
  lineNumber() {
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (typeof this[field] && this[field].lineNumber === "function") {
        return this[field].lineNumber();
      }
    }
  }
  setLineNumber(line_1350) {
    let next_1351 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1351[field] = null;
      } else if (typeof this[field].setLineNumber === "function") {
        next_1351[field] = this[field].setLineNumber(line_1350);
      } else if (_immutable.List.isList(this[field])) {
        next_1351[field] = this[field].map(f_1352 => f_1352.setLineNumber(line_1350));
      } else {
        next_1351[field] = this[field];
      }
    }
    return new Term(this.type, next_1351);
  }
}
exports.default = Term;
const isBindingWithDefault_1233 = R.whereEq({ type: "BindingWithDefault" });
;
const isBindingIdentifier_1234 = R.whereEq({ type: "BindingIdentifier" });
;
const isArrayBinding_1235 = R.whereEq({ type: "ArrayBinding" });
;
const isObjectBinding_1236 = R.whereEq({ type: "ObjectBinding" });
;
const isBindingPropertyIdentifier_1237 = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isBindingPropertyProperty_1238 = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isClassExpression_1239 = R.whereEq({ type: "ClassExpression" });
;
const isClassDeclaration_1240 = R.whereEq({ type: "ClassDeclaration" });
;
const isClassElement_1241 = R.whereEq({ type: "ClassElement" });
;
const isModule_1242 = R.whereEq({ type: "Module" });
;
const isImport_1243 = R.whereEq({ type: "Import" });
;
const isImportNamespace_1244 = R.whereEq({ type: "ImportNamespace" });
;
const isImportSpecifier_1245 = R.whereEq({ type: "ImportSpecifier" });
;
const isExportAllFrom_1246 = R.whereEq({ type: "ExportAllFrom" });
;
const isExportFrom_1247 = R.whereEq({ type: "ExportFrom" });
;
const isExport_1248 = R.whereEq({ type: "Export" });
;
const isExportDefault_1249 = R.whereEq({ type: "ExportDefault" });
;
const isExportSpecifier_1250 = R.whereEq({ type: "ExportSpecifier" });
;
const isMethod_1251 = R.whereEq({ type: "Method" });
;
const isGetter_1252 = R.whereEq({ type: "Getter" });
;
const isSetter_1253 = R.whereEq({ type: "Setter" });
;
const isDataProperty_1254 = R.whereEq({ type: "DataProperty" });
;
const isShorthandProperty_1255 = R.whereEq({ type: "ShorthandProperty" });
;
const isComputedPropertyName_1256 = R.whereEq({ type: "ComputedPropertyName" });
;
const isStaticPropertyName_1257 = R.whereEq({ type: "StaticPropertyName" });
;
const isLiteralBooleanExpression_1258 = R.whereEq({ type: "LiteralBooleanExpression" });
;
const isLiteralInfinityExpression_1259 = R.whereEq({ type: "LiteralInfinityExpression" });
;
const isLiteralNullExpression_1260 = R.whereEq({ type: "LiteralNullExpression" });
;
const isLiteralNumericExpression_1261 = R.whereEq({ type: "LiteralNumericExpression" });
;
const isLiteralRegExpExpression_1262 = R.whereEq({ type: "LiteralRegExpExpression" });
;
const isLiteralStringExpression_1263 = R.whereEq({ type: "LiteralStringExpression" });
;
const isArrayExpression_1264 = R.whereEq({ type: "ArrayExpression" });
;
const isArrowExpression_1265 = R.whereEq({ type: "ArrowExpression" });
;
const isAssignmentExpression_1266 = R.whereEq({ type: "AssignmentExpression" });
;
const isBinaryExpression_1267 = R.whereEq({ type: "BinaryExpression" });
;
const isCallExpression_1268 = R.whereEq({ type: "CallExpression" });
;
const isComputedAssignmentExpression_1269 = R.whereEq({ type: "ComputedAssignmentExpression" });
;
const isComputedMemberExpression_1270 = R.whereEq({ type: "ComputedMemberExpression" });
;
const isConditionalExpression_1271 = R.whereEq({ type: "ConditionalExpression" });
;
const isFunctionExpression_1272 = R.whereEq({ type: "FunctionExpression" });
;
const isIdentifierExpression_1273 = R.whereEq({ type: "IdentifierExpression" });
;
const isNewExpression_1274 = R.whereEq({ type: "NewExpression" });
;
const isNewTargetExpression_1275 = R.whereEq({ type: "NewTargetExpression" });
;
const isObjectExpression_1276 = R.whereEq({ type: "ObjectExpression" });
;
const isUnaryExpression_1277 = R.whereEq({ type: "UnaryExpression" });
;
const isStaticMemberExpression_1278 = R.whereEq({ type: "StaticMemberExpression" });
;
const isTemplateExpression_1279 = R.whereEq({ type: "TemplateExpression" });
;
const isThisExpression_1280 = R.whereEq({ type: "ThisExpression" });
;
const isUpdateExpression_1281 = R.whereEq({ type: "UpdateExpression" });
;
const isYieldExpression_1282 = R.whereEq({ type: "YieldExpression" });
;
const isYieldGeneratorExpression_1283 = R.whereEq({ type: "YieldGeneratorExpression" });
;
const isBlockStatement_1284 = R.whereEq({ type: "BlockStatement" });
;
const isBreakStatement_1285 = R.whereEq({ type: "BreakStatement" });
;
const isContinueStatement_1286 = R.whereEq({ type: "ContinueStatement" });
;
const isCompoundAssignmentExpression_1287 = R.whereEq({ type: "CompoundAssignmentExpression" });
;
const isDebuggerStatement_1288 = R.whereEq({ type: "DebuggerStatement" });
;
const isDoWhileStatement_1289 = R.whereEq({ type: "DoWhileStatement" });
;
const isEmptyStatement_1290 = R.whereEq({ type: "EmptyStatement" });
;
const isExpressionStatement_1291 = R.whereEq({ type: "ExpressionStatement" });
;
const isForInStatement_1292 = R.whereEq({ type: "ForInStatement" });
;
const isForOfStatement_1293 = R.whereEq({ type: "ForOfStatement" });
;
const isForStatement_1294 = R.whereEq({ type: "ForStatement" });
;
const isIfStatement_1295 = R.whereEq({ type: "IfStatement" });
;
const isLabeledStatement_1296 = R.whereEq({ type: "LabeledStatement" });
;
const isReturnStatement_1297 = R.whereEq({ type: "ReturnStatement" });
;
const isSwitchStatement_1298 = R.whereEq({ type: "SwitchStatement" });
;
const isSwitchStatementWithDefault_1299 = R.whereEq({ type: "SwitchStatementWithDefault" });
;
const isThrowStatement_1300 = R.whereEq({ type: "ThrowStatement" });
;
const isTryCatchStatement_1301 = R.whereEq({ type: "TryCatchStatement" });
;
const isTryFinallyStatement_1302 = R.whereEq({ type: "TryFinallyStatement" });
;
const isVariableDeclarationStatement_1303 = R.whereEq({ type: "VariableDeclarationStatement" });
;
const isWhileStatement_1304 = R.whereEq({ type: "WhileStatement" });
;
const isWithStatement_1305 = R.whereEq({ type: "WithStatement" });
;
const isPragma_1306 = R.whereEq({ type: "Pragma" });
;
const isBlock_1307 = R.whereEq({ type: "Block" });
;
const isCatchClause_1308 = R.whereEq({ type: "CatchClause" });
;
const isDirective_1309 = R.whereEq({ type: "Directive" });
;
const isFormalParameters_1310 = R.whereEq({ type: "FormalParameters" });
;
const isFunctionBody_1311 = R.whereEq({ type: "FunctionBody" });
;
const isFunctionDeclaration_1312 = R.whereEq({ type: "FunctionDeclaration" });
;
const isScript_1313 = R.whereEq({ type: "Script" });
;
const isSpreadElement_1314 = R.whereEq({ type: "SpreadElement" });
;
const isSuper_1315 = R.whereEq({ type: "Super" });
;
const isSwitchCase_1316 = R.whereEq({ type: "SwitchCase" });
;
const isSwitchDefault_1317 = R.whereEq({ type: "SwitchDefault" });
;
const isTemplateElement_1318 = R.whereEq({ type: "TemplateElement" });
;
const isSyntaxTemplate_1319 = R.whereEq({ type: "SyntaxTemplate" });
;
const isVariableDeclaration_1320 = R.whereEq({ type: "VariableDeclaration" });
;
const isVariableDeclarator_1321 = R.whereEq({ type: "VariableDeclarator" });
;
const isEOF_1322 = R.whereEq({ type: "EOF" });
;
const isSyntaxDeclaration_1323 = R.both(isVariableDeclaration_1320, R.whereEq({ kind: "syntax" }));
;
const isSyntaxrecDeclaration_1324 = R.both(isVariableDeclaration_1320, R.whereEq({ kind: "syntaxrec" }));
;
const isFunctionTerm_1325 = R.either(isFunctionDeclaration_1312, isFunctionExpression_1272);
;
const isFunctionWithName_1326 = R.and(isFunctionTerm_1325, R.complement(R.where({ name: R.isNil })));
;
const isParenthesizedExpression_1327 = R.whereEq({ type: "ParenthesizedExpression" });
;
const isExportSyntax_1328 = R.both(isExport_1248, exp_1353 => R.or(isSyntaxDeclaration_1323(exp_1353.declaration), isSyntaxrecDeclaration_1324(exp_1353.declaration)));
;
const isSyntaxDeclarationStatement_1329 = R.both(isVariableDeclarationStatement_1303, decl_1354 => isCompiletimeDeclaration_1330(decl_1354.declaration));
;
const isCompiletimeDeclaration_1330 = R.either(isSyntaxDeclaration_1323, isSyntaxrecDeclaration_1324);
;
const isCompiletimeStatement_1331 = term_1355 => {
  return term_1355 instanceof Term && isVariableDeclarationStatement_1303(term_1355) && isCompiletimeDeclaration_1330(term_1355.declaration);
};
;
const isImportDeclaration_1332 = R.either(isImport_1243, isImportNamespace_1244);
;
exports.isBindingWithDefault = isBindingWithDefault_1233;
exports.isBindingIdentifier = isBindingIdentifier_1234;
exports.isArrayBinding = isArrayBinding_1235;
exports.isObjectBinding = isObjectBinding_1236;
exports.isBindingPropertyIdentifier = isBindingPropertyIdentifier_1237;
exports.isBindingPropertyProperty = isBindingPropertyProperty_1238;
exports.isClassExpression = isClassExpression_1239;
exports.isClassDeclaration = isClassDeclaration_1240;
exports.isClassElement = isClassElement_1241;
exports.isModule = isModule_1242;
exports.isImport = isImport_1243;
exports.isImportNamespace = isImportNamespace_1244;
exports.isImportSpecifier = isImportSpecifier_1245;
exports.isExportAllFrom = isExportAllFrom_1246;
exports.isExportFrom = isExportFrom_1247;
exports.isExport = isExport_1248;
exports.isExportDefault = isExportDefault_1249;
exports.isExportSpecifier = isExportSpecifier_1250;
exports.isMethod = isMethod_1251;
exports.isGetter = isGetter_1252;
exports.isSetter = isSetter_1253;
exports.isDataProperty = isDataProperty_1254;
exports.isShorthandProperty = isShorthandProperty_1255;
exports.isComputedPropertyName = isComputedPropertyName_1256;
exports.isStaticPropertyName = isStaticPropertyName_1257;
exports.isLiteralBooleanExpression = isLiteralBooleanExpression_1258;
exports.isLiteralInfinityExpression = isLiteralInfinityExpression_1259;
exports.isLiteralNullExpression = isLiteralNullExpression_1260;
exports.isLiteralNumericExpression = isLiteralNumericExpression_1261;
exports.isLiteralRegExpExpression = isLiteralRegExpExpression_1262;
exports.isLiteralStringExpression = isLiteralStringExpression_1263;
exports.isArrayExpression = isArrayExpression_1264;
exports.isArrowExpression = isArrowExpression_1265;
exports.isAssignmentExpression = isAssignmentExpression_1266;
exports.isBinaryExpression = isBinaryExpression_1267;
exports.isCallExpression = isCallExpression_1268;
exports.isComputedAssignmentExpression = isComputedAssignmentExpression_1269;
exports.isComputedMemberExpression = isComputedMemberExpression_1270;
exports.isConditionalExpression = isConditionalExpression_1271;
exports.isFunctionExpression = isFunctionExpression_1272;
exports.isIdentifierExpression = isIdentifierExpression_1273;
exports.isNewExpression = isNewExpression_1274;
exports.isNewTargetExpression = isNewTargetExpression_1275;
exports.isObjectExpression = isObjectExpression_1276;
exports.isUnaryExpression = isUnaryExpression_1277;
exports.isStaticMemberExpression = isStaticMemberExpression_1278;
exports.isTemplateExpression = isTemplateExpression_1279;
exports.isThisExpression = isThisExpression_1280;
exports.isUpdateExpression = isUpdateExpression_1281;
exports.isYieldExpression = isYieldExpression_1282;
exports.isYieldGeneratorExpression = isYieldGeneratorExpression_1283;
exports.isBlockStatement = isBlockStatement_1284;
exports.isBreakStatement = isBreakStatement_1285;
exports.isContinueStatement = isContinueStatement_1286;
exports.isCompoundAssignmentExpression = isCompoundAssignmentExpression_1287;
exports.isDebuggerStatement = isDebuggerStatement_1288;
exports.isDoWhileStatement = isDoWhileStatement_1289;
exports.isEmptyStatement = isEmptyStatement_1290;
exports.isExpressionStatement = isExpressionStatement_1291;
exports.isForInStatement = isForInStatement_1292;
exports.isForOfStatement = isForOfStatement_1293;
exports.isForStatement = isForStatement_1294;
exports.isIfStatement = isIfStatement_1295;
exports.isLabeledStatement = isLabeledStatement_1296;
exports.isReturnStatement = isReturnStatement_1297;
exports.isSwitchStatement = isSwitchStatement_1298;
exports.isSwitchStatementWithDefault = isSwitchStatementWithDefault_1299;
exports.isThrowStatement = isThrowStatement_1300;
exports.isTryCatchStatement = isTryCatchStatement_1301;
exports.isTryFinallyStatement = isTryFinallyStatement_1302;
exports.isVariableDeclarationStatement = isVariableDeclarationStatement_1303;
exports.isWhileStatement = isWhileStatement_1304;
exports.isWithStatement = isWithStatement_1305;
exports.isPragma = isPragma_1306;
exports.isBlock = isBlock_1307;
exports.isCatchClause = isCatchClause_1308;
exports.isDirective = isDirective_1309;
exports.isFormalParameters = isFormalParameters_1310;
exports.isFunctionBody = isFunctionBody_1311;
exports.isFunctionDeclaration = isFunctionDeclaration_1312;
exports.isScript = isScript_1313;
exports.isSpreadElement = isSpreadElement_1314;
exports.isSuper = isSuper_1315;
exports.isSwitchCase = isSwitchCase_1316;
exports.isSwitchDefault = isSwitchDefault_1317;
exports.isTemplateElement = isTemplateElement_1318;
exports.isSyntaxTemplate = isSyntaxTemplate_1319;
exports.isVariableDeclaration = isVariableDeclaration_1320;
exports.isVariableDeclarator = isVariableDeclarator_1321;
exports.isEOF = isEOF_1322;
exports.isSyntaxDeclaration = isSyntaxDeclaration_1323;
exports.isSyntaxrecDeclaration = isSyntaxrecDeclaration_1324;
exports.isFunctionTerm = isFunctionTerm_1325;
exports.isFunctionWithName = isFunctionWithName_1326;
exports.isParenthesizedExpression = isParenthesizedExpression_1327;
exports.isExportSyntax = isExportSyntax_1328;
exports.isSyntaxDeclarationStatement = isSyntaxDeclarationStatement_1329;
exports.isCompiletimeDeclaration = isCompiletimeDeclaration_1330;
exports.isCompiletimeStatement = isCompiletimeStatement_1331;
exports.isImportDeclaration = isImportDeclaration_1332;
//# sourceMappingURL=data:application/json;base64,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LEdBQTFCLHNCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDaUIsUSxHQUFqQixhO1FBQ2lCLFEsR0FBakIsYTtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUN3QixlLEdBQXhCLG9CO1FBQ3FCLFksR0FBckIsaUI7UUFDaUIsUSxHQUFqQixhO1FBQ3dCLGUsR0FBeEIsb0I7UUFDMEIsaUIsR0FBMUIsc0I7UUFDaUIsUSxHQUFqQixhO1FBQ2lCLFEsR0FBakIsYTtRQUNpQixRLEdBQWpCLGE7UUFDdUIsYyxHQUF2QixtQjtRQUM0QixtQixHQUE1Qix3QjtRQUMrQixzQixHQUEvQiwyQjtRQUM2QixvQixHQUE3Qix5QjtRQUNtQywwQixHQUFuQywrQjtRQUNvQywyQixHQUFwQyxnQztRQUNnQyx1QixHQUFoQyw0QjtRQUNtQywwQixHQUFuQywrQjtRQUNrQyx5QixHQUFsQyw4QjtRQUNrQyx5QixHQUFsQyw4QjtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUMrQixzQixHQUEvQiwyQjtRQUMyQixrQixHQUEzQix1QjtRQUN5QixnQixHQUF6QixxQjtRQUN1Qyw4QixHQUF2QyxtQztRQUNtQywwQixHQUFuQywrQjtRQUNnQyx1QixHQUFoQyw0QjtRQUM2QixvQixHQUE3Qix5QjtRQUMrQixzQixHQUEvQiwyQjtRQUN3QixlLEdBQXhCLG9CO1FBQzhCLHFCLEdBQTlCLDBCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQzBCLGlCLEdBQTFCLHNCO1FBQ2lDLHdCLEdBQWpDLDZCO1FBQzZCLG9CLEdBQTdCLHlCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQzBCLGlCLEdBQTFCLHNCO1FBQ21DLDBCLEdBQW5DLCtCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzRCLG1CLEdBQTVCLHdCO1FBQ3VDLDhCLEdBQXZDLG1DO1FBQzRCLG1CLEdBQTVCLHdCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzhCLHFCLEdBQTlCLDBCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDc0IsYSxHQUF0QixrQjtRQUMyQixrQixHQUEzQix1QjtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUNxQyw0QixHQUFyQyxpQztRQUN5QixnQixHQUF6QixxQjtRQUM0QixtQixHQUE1Qix3QjtRQUM4QixxQixHQUE5QiwwQjtRQUN1Qyw4QixHQUF2QyxtQztRQUN5QixnQixHQUF6QixxQjtRQUN3QixlLEdBQXhCLG9CO1FBQ2lCLFEsR0FBakIsYTtRQUNnQixPLEdBQWhCLFk7UUFDc0IsYSxHQUF0QixrQjtRQUNvQixXLEdBQXBCLGdCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDOEIscUIsR0FBOUIsMEI7UUFDaUIsUSxHQUFqQixhO1FBQ3dCLGUsR0FBeEIsb0I7UUFDZ0IsTyxHQUFoQixZO1FBQ3FCLFksR0FBckIsaUI7UUFDd0IsZSxHQUF4QixvQjtRQUMwQixpQixHQUExQixzQjtRQUN5QixnQixHQUF6QixxQjtRQUM4QixxQixHQUE5QiwwQjtRQUM2QixvQixHQUE3Qix5QjtRQUNjLEssR0FBZCxVO1FBQzRCLG1CLEdBQTVCLHdCO1FBQytCLHNCLEdBQS9CLDJCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDMkIsa0IsR0FBM0IsdUI7UUFDa0MseUIsR0FBbEMsOEI7UUFDdUIsYyxHQUF2QixtQjtRQUNxQyw0QixHQUFyQyxpQztRQUNpQyx3QixHQUFqQyw2QjtRQUMrQixzQixHQUEvQiwyQjtRQUM0QixtQixHQUE1Qix3QiIsImZpbGUiOiJ0ZXJtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHthc3NlcnQsIGV4cGVjdH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge21peGlufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBUZXJtU3BlYyBmcm9tIFwiLi90ZXJtLXNwZWNcIjtcbmltcG9ydCAgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVybSB7XG4gIGNvbnN0cnVjdG9yKHR5cGVfMTMzMywgcHJvcHNfMTMzNCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGVfMTMzMztcbiAgICB0aGlzLmxvYyA9IG51bGw7XG4gICAgZm9yIChsZXQgcHJvcCBvZiBPYmplY3Qua2V5cyhwcm9wc18xMzM0KSkge1xuICAgICAgdGhpc1twcm9wXSA9IHByb3BzXzEzMzRbcHJvcF07XG4gICAgfVxuICB9XG4gIGV4dGVuZChwcm9wc18xMzM1KSB7XG4gICAgbGV0IG5ld1Byb3BzXzEzMzYgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAocHJvcHNfMTMzNS5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgICAgbmV3UHJvcHNfMTMzNltmaWVsZF0gPSBwcm9wc18xMzM1W2ZpZWxkXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Byb3BzXzEzMzZbZmllbGRdID0gdGhpc1tmaWVsZF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0aGlzLnR5cGUsIG5ld1Byb3BzXzEzMzYpO1xuICB9XG4gIGdlbih7aW5jbHVkZUltcG9ydHN9ID0ge2luY2x1ZGVJbXBvcnRzOiB0cnVlfSkge1xuICAgIGxldCBuZXh0XzEzMzcgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAodGhpc1tmaWVsZF0gPT0gbnVsbCkge1xuICAgICAgICBuZXh0XzEzMzdbZmllbGRdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodGhpc1tmaWVsZF0gaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICAgIG5leHRfMTMzN1tmaWVsZF0gPSB0aGlzW2ZpZWxkXS5nZW4oaW5jbHVkZUltcG9ydHMpO1xuICAgICAgfSBlbHNlIGlmIChMaXN0LmlzTGlzdCh0aGlzW2ZpZWxkXSkpIHtcbiAgICAgICAgbGV0IHByZWQgPSBpbmNsdWRlSW1wb3J0cyA/IFIuY29tcGxlbWVudChpc0NvbXBpbGV0aW1lU3RhdGVtZW50XzEzMzEpIDogUi5ib3RoKFIuY29tcGxlbWVudChpc0ltcG9ydERlY2xhcmF0aW9uXzEzMzIpLCBSLmNvbXBsZW1lbnQoaXNDb21waWxldGltZVN0YXRlbWVudF8xMzMxKSk7XG4gICAgICAgIG5leHRfMTMzN1tmaWVsZF0gPSB0aGlzW2ZpZWxkXS5maWx0ZXIocHJlZCkubWFwKHRlcm1fMTMzOCA9PiB0ZXJtXzEzMzggaW5zdGFuY2VvZiBUZXJtID8gdGVybV8xMzM4LmdlbihpbmNsdWRlSW1wb3J0cykgOiB0ZXJtXzEzMzgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dF8xMzM3W2ZpZWxkXSA9IHRoaXNbZmllbGRdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odGhpcy50eXBlLCBuZXh0XzEzMzcpO1xuICB9XG4gIHZpc2l0KGZfMTMzOSkge1xuICAgIGxldCBuZXh0XzEzNDAgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAodGhpc1tmaWVsZF0gPT0gbnVsbCkge1xuICAgICAgICBuZXh0XzEzNDBbZmllbGRdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoTGlzdC5pc0xpc3QodGhpc1tmaWVsZF0pKSB7XG4gICAgICAgIG5leHRfMTM0MFtmaWVsZF0gPSB0aGlzW2ZpZWxkXS5tYXAoZmllbGRfMTM0MSA9PiBmaWVsZF8xMzQxICE9IG51bGwgPyBmXzEzMzkoZmllbGRfMTM0MSkgOiBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfMTM0MFtmaWVsZF0gPSBmXzEzMzkodGhpc1tmaWVsZF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHRlbmQobmV4dF8xMzQwKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV8xMzQyLCBiaW5kaW5nc18xMzQzLCBwaGFzZV8xMzQ0LCBvcHRpb25zXzEzNDUpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh0ZXJtXzEzNDYgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0ZXJtXzEzNDYuYWRkU2NvcGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGVybV8xMzQ2LmFkZFNjb3BlKHNjb3BlXzEzNDIsIGJpbmRpbmdzXzEzNDMsIHBoYXNlXzEzNDQsIG9wdGlvbnNfMTM0NSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVybV8xMzQ2O1xuICAgIH0pO1xuICB9XG4gIHJlbW92ZVNjb3BlKHNjb3BlXzEzNDcsIHBoYXNlXzEzNDgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh0ZXJtXzEzNDkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0ZXJtXzEzNDkucmVtb3ZlU2NvcGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGVybV8xMzQ5LnJlbW92ZVNjb3BlKHNjb3BlXzEzNDcsIHBoYXNlXzEzNDgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRlcm1fMTM0OTtcbiAgICB9KTtcbiAgfVxuICBsaW5lTnVtYmVyKCkge1xuICAgIGZvciAobGV0IGZpZWxkIG9mIFRlcm1TcGVjLnNwZWNbdGhpcy50eXBlXS5maWVsZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1tmaWVsZF0gJiYgdGhpc1tmaWVsZF0ubGluZU51bWJlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzW2ZpZWxkXS5saW5lTnVtYmVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV8xMzUwKSB7XG4gICAgbGV0IG5leHRfMTM1MSA9IHt9O1xuICAgIGZvciAobGV0IGZpZWxkIG9mIFRlcm1TcGVjLnNwZWNbdGhpcy50eXBlXS5maWVsZHMpIHtcbiAgICAgIGlmICh0aGlzW2ZpZWxkXSA9PSBudWxsKSB7XG4gICAgICAgIG5leHRfMTM1MVtmaWVsZF0gPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpc1tmaWVsZF0uc2V0TGluZU51bWJlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG5leHRfMTM1MVtmaWVsZF0gPSB0aGlzW2ZpZWxkXS5zZXRMaW5lTnVtYmVyKGxpbmVfMTM1MCk7XG4gICAgICB9IGVsc2UgaWYgKExpc3QuaXNMaXN0KHRoaXNbZmllbGRdKSkge1xuICAgICAgICBuZXh0XzEzNTFbZmllbGRdID0gdGhpc1tmaWVsZF0ubWFwKGZfMTM1MiA9PiBmXzEzNTIuc2V0TGluZU51bWJlcihsaW5lXzEzNTApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfMTM1MVtmaWVsZF0gPSB0aGlzW2ZpZWxkXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHRoaXMudHlwZSwgbmV4dF8xMzUxKTtcbiAgfVxufVxuY29uc3QgaXNCaW5kaW5nV2l0aERlZmF1bHRfMTIzMyA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5kaW5nV2l0aERlZmF1bHRcIn0pO1xuO1xuY29uc3QgaXNCaW5kaW5nSWRlbnRpZmllcl8xMjM0ID0gUi53aGVyZUVxKHt0eXBlOiBcIkJpbmRpbmdJZGVudGlmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzQXJyYXlCaW5kaW5nXzEyMzUgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyYXlCaW5kaW5nXCJ9KTtcbjtcbmNvbnN0IGlzT2JqZWN0QmluZGluZ18xMjM2ID0gUi53aGVyZUVxKHt0eXBlOiBcIk9iamVjdEJpbmRpbmdcIn0pO1xuO1xuY29uc3QgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXzEyMzcgPSBSLndoZXJlRXEoe3R5cGU6IFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwifSk7XG47XG5jb25zdCBpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XzEyMzggPSBSLndoZXJlRXEoe3R5cGU6IFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwifSk7XG47XG5jb25zdCBpc0NsYXNzRXhwcmVzc2lvbl8xMjM5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNsYXNzRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0NsYXNzRGVjbGFyYXRpb25fMTI0MCA9IFIud2hlcmVFcSh7dHlwZTogXCJDbGFzc0RlY2xhcmF0aW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ2xhc3NFbGVtZW50XzEyNDEgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ2xhc3NFbGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzTW9kdWxlXzEyNDIgPSBSLndoZXJlRXEoe3R5cGU6IFwiTW9kdWxlXCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0XzEyNDMgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0XCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0TmFtZXNwYWNlXzEyNDQgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0TmFtZXNwYWNlXCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0U3BlY2lmaWVyXzEyNDUgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0U3BlY2lmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzRXhwb3J0QWxsRnJvbV8xMjQ2ID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydEFsbEZyb21cIn0pO1xuO1xuY29uc3QgaXNFeHBvcnRGcm9tXzEyNDcgPSBSLndoZXJlRXEoe3R5cGU6IFwiRXhwb3J0RnJvbVwifSk7XG47XG5jb25zdCBpc0V4cG9ydF8xMjQ4ID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydFwifSk7XG47XG5jb25zdCBpc0V4cG9ydERlZmF1bHRfMTI0OSA9IFIud2hlcmVFcSh7dHlwZTogXCJFeHBvcnREZWZhdWx0XCJ9KTtcbjtcbmNvbnN0IGlzRXhwb3J0U3BlY2lmaWVyXzEyNTAgPSBSLndoZXJlRXEoe3R5cGU6IFwiRXhwb3J0U3BlY2lmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzTWV0aG9kXzEyNTEgPSBSLndoZXJlRXEoe3R5cGU6IFwiTWV0aG9kXCJ9KTtcbjtcbmNvbnN0IGlzR2V0dGVyXzEyNTIgPSBSLndoZXJlRXEoe3R5cGU6IFwiR2V0dGVyXCJ9KTtcbjtcbmNvbnN0IGlzU2V0dGVyXzEyNTMgPSBSLndoZXJlRXEoe3R5cGU6IFwiU2V0dGVyXCJ9KTtcbjtcbmNvbnN0IGlzRGF0YVByb3BlcnR5XzEyNTQgPSBSLndoZXJlRXEoe3R5cGU6IFwiRGF0YVByb3BlcnR5XCJ9KTtcbjtcbmNvbnN0IGlzU2hvcnRoYW5kUHJvcGVydHlfMTI1NSA9IFIud2hlcmVFcSh7dHlwZTogXCJTaG9ydGhhbmRQcm9wZXJ0eVwifSk7XG47XG5jb25zdCBpc0NvbXB1dGVkUHJvcGVydHlOYW1lXzEyNTYgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIn0pO1xuO1xuY29uc3QgaXNTdGF0aWNQcm9wZXJ0eU5hbWVfMTI1NyA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25fMTI1OCA9IFIud2hlcmVFcSh7dHlwZTogXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uXzEyNTkgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxOdWxsRXhwcmVzc2lvbl8xMjYwID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxOdW1lcmljRXhwcmVzc2lvbl8xMjYxID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxSZWdFeHBFeHByZXNzaW9uXzEyNjIgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbl8xMjYzID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXJyYXlFeHByZXNzaW9uXzEyNjQgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyYXlFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXJyb3dFeHByZXNzaW9uXzEyNjUgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyb3dFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXNzaWdubWVudEV4cHJlc3Npb25fMTI2NiA9IFIud2hlcmVFcSh7dHlwZTogXCJBc3NpZ25tZW50RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0JpbmFyeUV4cHJlc3Npb25fMTI2NyA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ2FsbEV4cHJlc3Npb25fMTI2OCA9IFIud2hlcmVFcSh7dHlwZTogXCJDYWxsRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0NvbXB1dGVkQXNzaWdubWVudEV4cHJlc3Npb25fMTI2OSA9IFIud2hlcmVFcSh7dHlwZTogXCJDb21wdXRlZEFzc2lnbm1lbnRFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXzEyNzAgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ29uZGl0aW9uYWxFeHByZXNzaW9uXzEyNzEgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25FeHByZXNzaW9uXzEyNzIgPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25FeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzSWRlbnRpZmllckV4cHJlc3Npb25fMTI3MyA9IFIud2hlcmVFcSh7dHlwZTogXCJJZGVudGlmaWVyRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc05ld0V4cHJlc3Npb25fMTI3NCA9IFIud2hlcmVFcSh7dHlwZTogXCJOZXdFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzTmV3VGFyZ2V0RXhwcmVzc2lvbl8xMjc1ID0gUi53aGVyZUVxKHt0eXBlOiBcIk5ld1RhcmdldEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNPYmplY3RFeHByZXNzaW9uXzEyNzYgPSBSLndoZXJlRXEoe3R5cGU6IFwiT2JqZWN0RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1VuYXJ5RXhwcmVzc2lvbl8xMjc3ID0gUi53aGVyZUVxKHt0eXBlOiBcIlVuYXJ5RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1N0YXRpY01lbWJlckV4cHJlc3Npb25fMTI3OCA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzVGVtcGxhdGVFeHByZXNzaW9uXzEyNzkgPSBSLndoZXJlRXEoe3R5cGU6IFwiVGVtcGxhdGVFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzVGhpc0V4cHJlc3Npb25fMTI4MCA9IFIud2hlcmVFcSh7dHlwZTogXCJUaGlzRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1VwZGF0ZUV4cHJlc3Npb25fMTI4MSA9IFIud2hlcmVFcSh7dHlwZTogXCJVcGRhdGVFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzWWllbGRFeHByZXNzaW9uXzEyODIgPSBSLndoZXJlRXEoe3R5cGU6IFwiWWllbGRFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXzEyODMgPSBSLndoZXJlRXEoe3R5cGU6IFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQmxvY2tTdGF0ZW1lbnRfMTI4NCA9IFIud2hlcmVFcSh7dHlwZTogXCJCbG9ja1N0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0JyZWFrU3RhdGVtZW50XzEyODUgPSBSLndoZXJlRXEoe3R5cGU6IFwiQnJlYWtTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNDb250aW51ZVN0YXRlbWVudF8xMjg2ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbnRpbnVlU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjg3ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNEZWJ1Z2dlclN0YXRlbWVudF8xMjg4ID0gUi53aGVyZUVxKHt0eXBlOiBcIkRlYnVnZ2VyU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRG9XaGlsZVN0YXRlbWVudF8xMjg5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkRvV2hpbGVTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNFbXB0eVN0YXRlbWVudF8xMjkwID0gUi53aGVyZUVxKHt0eXBlOiBcIkVtcHR5U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRXhwcmVzc2lvblN0YXRlbWVudF8xMjkxID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNGb3JJblN0YXRlbWVudF8xMjkyID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvckluU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRm9yT2ZTdGF0ZW1lbnRfMTI5MyA9IFIud2hlcmVFcSh7dHlwZTogXCJGb3JPZlN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0ZvclN0YXRlbWVudF8xMjk0ID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvclN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0lmU3RhdGVtZW50XzEyOTUgPSBSLndoZXJlRXEoe3R5cGU6IFwiSWZTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNMYWJlbGVkU3RhdGVtZW50XzEyOTYgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGFiZWxlZFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1JldHVyblN0YXRlbWVudF8xMjk3ID0gUi53aGVyZUVxKHt0eXBlOiBcIlJldHVyblN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1N3aXRjaFN0YXRlbWVudF8xMjk4ID0gUi53aGVyZUVxKHt0eXBlOiBcIlN3aXRjaFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1N3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XzEyOTkgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIn0pO1xuO1xuY29uc3QgaXNUaHJvd1N0YXRlbWVudF8xMzAwID0gUi53aGVyZUVxKHt0eXBlOiBcIlRocm93U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzVHJ5Q2F0Y2hTdGF0ZW1lbnRfMTMwMSA9IFIud2hlcmVFcSh7dHlwZTogXCJUcnlDYXRjaFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1RyeUZpbmFsbHlTdGF0ZW1lbnRfMTMwMiA9IFIud2hlcmVFcSh7dHlwZTogXCJUcnlGaW5hbGx5U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudF8xMzAzID0gUi53aGVyZUVxKHt0eXBlOiBcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNXaGlsZVN0YXRlbWVudF8xMzA0ID0gUi53aGVyZUVxKHt0eXBlOiBcIldoaWxlU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzV2l0aFN0YXRlbWVudF8xMzA1ID0gUi53aGVyZUVxKHt0eXBlOiBcIldpdGhTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNQcmFnbWFfMTMwNiA9IFIud2hlcmVFcSh7dHlwZTogXCJQcmFnbWFcIn0pO1xuO1xuY29uc3QgaXNCbG9ja18xMzA3ID0gUi53aGVyZUVxKHt0eXBlOiBcIkJsb2NrXCJ9KTtcbjtcbmNvbnN0IGlzQ2F0Y2hDbGF1c2VfMTMwOCA9IFIud2hlcmVFcSh7dHlwZTogXCJDYXRjaENsYXVzZVwifSk7XG47XG5jb25zdCBpc0RpcmVjdGl2ZV8xMzA5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkRpcmVjdGl2ZVwifSk7XG47XG5jb25zdCBpc0Zvcm1hbFBhcmFtZXRlcnNfMTMxMCA9IFIud2hlcmVFcSh7dHlwZTogXCJGb3JtYWxQYXJhbWV0ZXJzXCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25Cb2R5XzEzMTEgPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25Cb2R5XCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25EZWNsYXJhdGlvbl8xMzEyID0gUi53aGVyZUVxKHt0eXBlOiBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIn0pO1xuO1xuY29uc3QgaXNTY3JpcHRfMTMxMyA9IFIud2hlcmVFcSh7dHlwZTogXCJTY3JpcHRcIn0pO1xuO1xuY29uc3QgaXNTcHJlYWRFbGVtZW50XzEzMTQgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3ByZWFkRWxlbWVudFwifSk7XG47XG5jb25zdCBpc1N1cGVyXzEzMTUgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3VwZXJcIn0pO1xuO1xuY29uc3QgaXNTd2l0Y2hDYXNlXzEzMTYgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3dpdGNoQ2FzZVwifSk7XG47XG5jb25zdCBpc1N3aXRjaERlZmF1bHRfMTMxNyA9IFIud2hlcmVFcSh7dHlwZTogXCJTd2l0Y2hEZWZhdWx0XCJ9KTtcbjtcbmNvbnN0IGlzVGVtcGxhdGVFbGVtZW50XzEzMTggPSBSLndoZXJlRXEoe3R5cGU6IFwiVGVtcGxhdGVFbGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzU3ludGF4VGVtcGxhdGVfMTMxOSA9IFIud2hlcmVFcSh7dHlwZTogXCJTeW50YXhUZW1wbGF0ZVwifSk7XG47XG5jb25zdCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25fMTMyMCA9IFIud2hlcmVFcSh7dHlwZTogXCJWYXJpYWJsZURlY2xhcmF0aW9uXCJ9KTtcbjtcbmNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdG9yXzEzMjEgPSBSLndoZXJlRXEoe3R5cGU6IFwiVmFyaWFibGVEZWNsYXJhdG9yXCJ9KTtcbjtcbmNvbnN0IGlzRU9GXzEzMjIgPSBSLndoZXJlRXEoe3R5cGU6IFwiRU9GXCJ9KTtcbjtcbmNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb25fMTMyMyA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb25fMTMyMCwgUi53aGVyZUVxKHtraW5kOiBcInN5bnRheFwifSkpO1xuO1xuY29uc3QgaXNTeW50YXhyZWNEZWNsYXJhdGlvbl8xMzI0ID0gUi5ib3RoKGlzVmFyaWFibGVEZWNsYXJhdGlvbl8xMzIwLCBSLndoZXJlRXEoe2tpbmQ6IFwic3ludGF4cmVjXCJ9KSk7XG47XG5jb25zdCBpc0Z1bmN0aW9uVGVybV8xMzI1ID0gUi5laXRoZXIoaXNGdW5jdGlvbkRlY2xhcmF0aW9uXzEzMTIsIGlzRnVuY3Rpb25FeHByZXNzaW9uXzEyNzIpO1xuO1xuY29uc3QgaXNGdW5jdGlvbldpdGhOYW1lXzEzMjYgPSBSLmFuZChpc0Z1bmN0aW9uVGVybV8xMzI1LCBSLmNvbXBsZW1lbnQoUi53aGVyZSh7bmFtZTogUi5pc05pbH0pKSk7XG47XG5jb25zdCBpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uXzEzMjcgPSBSLndoZXJlRXEoe3R5cGU6IFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNFeHBvcnRTeW50YXhfMTMyOCA9IFIuYm90aChpc0V4cG9ydF8xMjQ4LCBleHBfMTM1MyA9PiBSLm9yKGlzU3ludGF4RGVjbGFyYXRpb25fMTMyMyhleHBfMTM1My5kZWNsYXJhdGlvbiksIGlzU3ludGF4cmVjRGVjbGFyYXRpb25fMTMyNChleHBfMTM1My5kZWNsYXJhdGlvbikpKTtcbjtcbmNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMyOSA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMwMywgZGVjbF8xMzU0ID0+IGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzMwKGRlY2xfMTM1NC5kZWNsYXJhdGlvbikpO1xuO1xuY29uc3QgaXNDb21waWxldGltZURlY2xhcmF0aW9uXzEzMzAgPSBSLmVpdGhlcihpc1N5bnRheERlY2xhcmF0aW9uXzEzMjMsIGlzU3ludGF4cmVjRGVjbGFyYXRpb25fMTMyNCk7XG47XG5jb25zdCBpc0NvbXBpbGV0aW1lU3RhdGVtZW50XzEzMzEgPSB0ZXJtXzEzNTUgPT4ge1xuICByZXR1cm4gdGVybV8xMzU1IGluc3RhbmNlb2YgVGVybSAmJiBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMwMyh0ZXJtXzEzNTUpICYmIGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzMwKHRlcm1fMTM1NS5kZWNsYXJhdGlvbik7XG59O1xuO1xuY29uc3QgaXNJbXBvcnREZWNsYXJhdGlvbl8xMzMyID0gUi5laXRoZXIoaXNJbXBvcnRfMTI0MywgaXNJbXBvcnROYW1lc3BhY2VfMTI0NCk7XG47XG5leHBvcnQge2lzQmluZGluZ1dpdGhEZWZhdWx0XzEyMzMgYXMgaXNCaW5kaW5nV2l0aERlZmF1bHR9O1xuZXhwb3J0IHtpc0JpbmRpbmdJZGVudGlmaWVyXzEyMzQgYXMgaXNCaW5kaW5nSWRlbnRpZmllcn07XG5leHBvcnQge2lzQXJyYXlCaW5kaW5nXzEyMzUgYXMgaXNBcnJheUJpbmRpbmd9O1xuZXhwb3J0IHtpc09iamVjdEJpbmRpbmdfMTIzNiBhcyBpc09iamVjdEJpbmRpbmd9O1xuZXhwb3J0IHtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJfMTIzNyBhcyBpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJ9O1xuZXhwb3J0IHtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XzEyMzggYXMgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eX07XG5leHBvcnQge2lzQ2xhc3NFeHByZXNzaW9uXzEyMzkgYXMgaXNDbGFzc0V4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NsYXNzRGVjbGFyYXRpb25fMTI0MCBhcyBpc0NsYXNzRGVjbGFyYXRpb259O1xuZXhwb3J0IHtpc0NsYXNzRWxlbWVudF8xMjQxIGFzIGlzQ2xhc3NFbGVtZW50fTtcbmV4cG9ydCB7aXNNb2R1bGVfMTI0MiBhcyBpc01vZHVsZX07XG5leHBvcnQge2lzSW1wb3J0XzEyNDMgYXMgaXNJbXBvcnR9O1xuZXhwb3J0IHtpc0ltcG9ydE5hbWVzcGFjZV8xMjQ0IGFzIGlzSW1wb3J0TmFtZXNwYWNlfTtcbmV4cG9ydCB7aXNJbXBvcnRTcGVjaWZpZXJfMTI0NSBhcyBpc0ltcG9ydFNwZWNpZmllcn07XG5leHBvcnQge2lzRXhwb3J0QWxsRnJvbV8xMjQ2IGFzIGlzRXhwb3J0QWxsRnJvbX07XG5leHBvcnQge2lzRXhwb3J0RnJvbV8xMjQ3IGFzIGlzRXhwb3J0RnJvbX07XG5leHBvcnQge2lzRXhwb3J0XzEyNDggYXMgaXNFeHBvcnR9O1xuZXhwb3J0IHtpc0V4cG9ydERlZmF1bHRfMTI0OSBhcyBpc0V4cG9ydERlZmF1bHR9O1xuZXhwb3J0IHtpc0V4cG9ydFNwZWNpZmllcl8xMjUwIGFzIGlzRXhwb3J0U3BlY2lmaWVyfTtcbmV4cG9ydCB7aXNNZXRob2RfMTI1MSBhcyBpc01ldGhvZH07XG5leHBvcnQge2lzR2V0dGVyXzEyNTIgYXMgaXNHZXR0ZXJ9O1xuZXhwb3J0IHtpc1NldHRlcl8xMjUzIGFzIGlzU2V0dGVyfTtcbmV4cG9ydCB7aXNEYXRhUHJvcGVydHlfMTI1NCBhcyBpc0RhdGFQcm9wZXJ0eX07XG5leHBvcnQge2lzU2hvcnRoYW5kUHJvcGVydHlfMTI1NSBhcyBpc1Nob3J0aGFuZFByb3BlcnR5fTtcbmV4cG9ydCB7aXNDb21wdXRlZFByb3BlcnR5TmFtZV8xMjU2IGFzIGlzQ29tcHV0ZWRQcm9wZXJ0eU5hbWV9O1xuZXhwb3J0IHtpc1N0YXRpY1Byb3BlcnR5TmFtZV8xMjU3IGFzIGlzU3RhdGljUHJvcGVydHlOYW1lfTtcbmV4cG9ydCB7aXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25fMTI1OCBhcyBpc0xpdGVyYWxCb29sZWFuRXhwcmVzc2lvbn07XG5leHBvcnQge2lzTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbl8xMjU5IGFzIGlzTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbn07XG5leHBvcnQge2lzTGl0ZXJhbE51bGxFeHByZXNzaW9uXzEyNjAgYXMgaXNMaXRlcmFsTnVsbEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0xpdGVyYWxOdW1lcmljRXhwcmVzc2lvbl8xMjYxIGFzIGlzTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbl8xMjYyIGFzIGlzTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0xpdGVyYWxTdHJpbmdFeHByZXNzaW9uXzEyNjMgYXMgaXNMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbn07XG5leHBvcnQge2lzQXJyYXlFeHByZXNzaW9uXzEyNjQgYXMgaXNBcnJheUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0Fycm93RXhwcmVzc2lvbl8xMjY1IGFzIGlzQXJyb3dFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjY2IGFzIGlzQXNzaWdubWVudEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0JpbmFyeUV4cHJlc3Npb25fMTI2NyBhcyBpc0JpbmFyeUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NhbGxFeHByZXNzaW9uXzEyNjggYXMgaXNDYWxsRXhwcmVzc2lvbn07XG5leHBvcnQge2lzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjY5IGFzIGlzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbn07XG5leHBvcnQge2lzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXzEyNzAgYXMgaXNDb21wdXRlZE1lbWJlckV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NvbmRpdGlvbmFsRXhwcmVzc2lvbl8xMjcxIGFzIGlzQ29uZGl0aW9uYWxFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNGdW5jdGlvbkV4cHJlc3Npb25fMTI3MiBhcyBpc0Z1bmN0aW9uRXhwcmVzc2lvbn07XG5leHBvcnQge2lzSWRlbnRpZmllckV4cHJlc3Npb25fMTI3MyBhcyBpc0lkZW50aWZpZXJFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNOZXdFeHByZXNzaW9uXzEyNzQgYXMgaXNOZXdFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNOZXdUYXJnZXRFeHByZXNzaW9uXzEyNzUgYXMgaXNOZXdUYXJnZXRFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNPYmplY3RFeHByZXNzaW9uXzEyNzYgYXMgaXNPYmplY3RFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNVbmFyeUV4cHJlc3Npb25fMTI3NyBhcyBpc1VuYXJ5RXhwcmVzc2lvbn07XG5leHBvcnQge2lzU3RhdGljTWVtYmVyRXhwcmVzc2lvbl8xMjc4IGFzIGlzU3RhdGljTWVtYmVyRXhwcmVzc2lvbn07XG5leHBvcnQge2lzVGVtcGxhdGVFeHByZXNzaW9uXzEyNzkgYXMgaXNUZW1wbGF0ZUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc1RoaXNFeHByZXNzaW9uXzEyODAgYXMgaXNUaGlzRXhwcmVzc2lvbn07XG5leHBvcnQge2lzVXBkYXRlRXhwcmVzc2lvbl8xMjgxIGFzIGlzVXBkYXRlRXhwcmVzc2lvbn07XG5leHBvcnQge2lzWWllbGRFeHByZXNzaW9uXzEyODIgYXMgaXNZaWVsZEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc1lpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbl8xMjgzIGFzIGlzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNCbG9ja1N0YXRlbWVudF8xMjg0IGFzIGlzQmxvY2tTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0JyZWFrU3RhdGVtZW50XzEyODUgYXMgaXNCcmVha1N0YXRlbWVudH07XG5leHBvcnQge2lzQ29udGludWVTdGF0ZW1lbnRfMTI4NiBhcyBpc0NvbnRpbnVlU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXzEyODcgYXMgaXNDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNEZWJ1Z2dlclN0YXRlbWVudF8xMjg4IGFzIGlzRGVidWdnZXJTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0RvV2hpbGVTdGF0ZW1lbnRfMTI4OSBhcyBpc0RvV2hpbGVTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0VtcHR5U3RhdGVtZW50XzEyOTAgYXMgaXNFbXB0eVN0YXRlbWVudH07XG5leHBvcnQge2lzRXhwcmVzc2lvblN0YXRlbWVudF8xMjkxIGFzIGlzRXhwcmVzc2lvblN0YXRlbWVudH07XG5leHBvcnQge2lzRm9ySW5TdGF0ZW1lbnRfMTI5MiBhcyBpc0ZvckluU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNGb3JPZlN0YXRlbWVudF8xMjkzIGFzIGlzRm9yT2ZTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0ZvclN0YXRlbWVudF8xMjk0IGFzIGlzRm9yU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNJZlN0YXRlbWVudF8xMjk1IGFzIGlzSWZTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0xhYmVsZWRTdGF0ZW1lbnRfMTI5NiBhcyBpc0xhYmVsZWRTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc1JldHVyblN0YXRlbWVudF8xMjk3IGFzIGlzUmV0dXJuU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNTd2l0Y2hTdGF0ZW1lbnRfMTI5OCBhcyBpc1N3aXRjaFN0YXRlbWVudH07XG5leHBvcnQge2lzU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRfMTI5OSBhcyBpc1N3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0fTtcbmV4cG9ydCB7aXNUaHJvd1N0YXRlbWVudF8xMzAwIGFzIGlzVGhyb3dTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc1RyeUNhdGNoU3RhdGVtZW50XzEzMDEgYXMgaXNUcnlDYXRjaFN0YXRlbWVudH07XG5leHBvcnQge2lzVHJ5RmluYWxseVN0YXRlbWVudF8xMzAyIGFzIGlzVHJ5RmluYWxseVN0YXRlbWVudH07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudF8xMzAzIGFzIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudH07XG5leHBvcnQge2lzV2hpbGVTdGF0ZW1lbnRfMTMwNCBhcyBpc1doaWxlU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNXaXRoU3RhdGVtZW50XzEzMDUgYXMgaXNXaXRoU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNQcmFnbWFfMTMwNiBhcyBpc1ByYWdtYX07XG5leHBvcnQge2lzQmxvY2tfMTMwNyBhcyBpc0Jsb2NrfTtcbmV4cG9ydCB7aXNDYXRjaENsYXVzZV8xMzA4IGFzIGlzQ2F0Y2hDbGF1c2V9O1xuZXhwb3J0IHtpc0RpcmVjdGl2ZV8xMzA5IGFzIGlzRGlyZWN0aXZlfTtcbmV4cG9ydCB7aXNGb3JtYWxQYXJhbWV0ZXJzXzEzMTAgYXMgaXNGb3JtYWxQYXJhbWV0ZXJzfTtcbmV4cG9ydCB7aXNGdW5jdGlvbkJvZHlfMTMxMSBhcyBpc0Z1bmN0aW9uQm9keX07XG5leHBvcnQge2lzRnVuY3Rpb25EZWNsYXJhdGlvbl8xMzEyIGFzIGlzRnVuY3Rpb25EZWNsYXJhdGlvbn07XG5leHBvcnQge2lzU2NyaXB0XzEzMTMgYXMgaXNTY3JpcHR9O1xuZXhwb3J0IHtpc1NwcmVhZEVsZW1lbnRfMTMxNCBhcyBpc1NwcmVhZEVsZW1lbnR9O1xuZXhwb3J0IHtpc1N1cGVyXzEzMTUgYXMgaXNTdXBlcn07XG5leHBvcnQge2lzU3dpdGNoQ2FzZV8xMzE2IGFzIGlzU3dpdGNoQ2FzZX07XG5leHBvcnQge2lzU3dpdGNoRGVmYXVsdF8xMzE3IGFzIGlzU3dpdGNoRGVmYXVsdH07XG5leHBvcnQge2lzVGVtcGxhdGVFbGVtZW50XzEzMTggYXMgaXNUZW1wbGF0ZUVsZW1lbnR9O1xuZXhwb3J0IHtpc1N5bnRheFRlbXBsYXRlXzEzMTkgYXMgaXNTeW50YXhUZW1wbGF0ZX07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdGlvbl8xMzIwIGFzIGlzVmFyaWFibGVEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdG9yXzEzMjEgYXMgaXNWYXJpYWJsZURlY2xhcmF0b3J9O1xuZXhwb3J0IHtpc0VPRl8xMzIyIGFzIGlzRU9GfTtcbmV4cG9ydCB7aXNTeW50YXhEZWNsYXJhdGlvbl8xMzIzIGFzIGlzU3ludGF4RGVjbGFyYXRpb259O1xuZXhwb3J0IHtpc1N5bnRheHJlY0RlY2xhcmF0aW9uXzEzMjQgYXMgaXNTeW50YXhyZWNEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzRnVuY3Rpb25UZXJtXzEzMjUgYXMgaXNGdW5jdGlvblRlcm19O1xuZXhwb3J0IHtpc0Z1bmN0aW9uV2l0aE5hbWVfMTMyNiBhcyBpc0Z1bmN0aW9uV2l0aE5hbWV9O1xuZXhwb3J0IHtpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uXzEzMjcgYXMgaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbn07XG5leHBvcnQge2lzRXhwb3J0U3ludGF4XzEzMjggYXMgaXNFeHBvcnRTeW50YXh9O1xuZXhwb3J0IHtpc1N5bnRheERlY2xhcmF0aW9uU3RhdGVtZW50XzEzMjkgYXMgaXNTeW50YXhEZWNsYXJhdGlvblN0YXRlbWVudH07XG5leHBvcnQge2lzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzMwIGFzIGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzQ29tcGlsZXRpbWVTdGF0ZW1lbnRfMTMzMSBhcyBpc0NvbXBpbGV0aW1lU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNJbXBvcnREZWNsYXJhdGlvbl8xMzMyIGFzIGlzSW1wb3J0RGVjbGFyYXRpb259Il19