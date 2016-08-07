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
  constructor(type_1334, props_1335) {
    this.type = type_1334;
    this.loc = null;
    for (let prop of Object.keys(props_1335)) {
      this[prop] = props_1335[prop];
    }
  }
  extend(props_1336) {
    let newProps_1337 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (props_1336.hasOwnProperty(field)) {
        newProps_1337[field] = props_1336[field];
      } else {
        newProps_1337[field] = this[field];
      }
    }
    return new Term(this.type, newProps_1337);
  }
  gen() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? { includeImports: true } : arguments[0];

    let includeImports = _ref.includeImports;

    let next_1338 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1338[field] = null;
      } else if (this[field] instanceof Term) {
        next_1338[field] = this[field].gen(includeImports);
      } else if (_immutable.List.isList(this[field])) {
        let pred = includeImports ? R.complement(isCompiletimeStatement_1332) : R.both(R.complement(isImportDeclaration_1333), R.complement(isCompiletimeStatement_1332));
        next_1338[field] = this[field].filter(pred).map(term_1339 => term_1339 instanceof Term ? term_1339.gen(includeImports) : term_1339);
      } else {
        next_1338[field] = this[field];
      }
    }
    return new Term(this.type, next_1338);
  }
  visit(f_1340) {
    let next_1341 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1341[field] = null;
      } else if (_immutable.List.isList(this[field])) {
        next_1341[field] = this[field].map(field_1342 => field_1342 != null ? f_1340(field_1342) : null);
      } else {
        next_1341[field] = f_1340(this[field]);
      }
    }
    return this.extend(next_1341);
  }
  addScope(scope_1343, bindings_1344, phase_1345, options_1346) {
    return this.visit(term_1347 => {
      if (typeof term_1347.addScope === "function") {
        return term_1347.addScope(scope_1343, bindings_1344, phase_1345, options_1346);
      }
      return term_1347;
    });
  }
  removeScope(scope_1348, phase_1349) {
    return this.visit(term_1350 => {
      if (typeof term_1350.removeScope === "function") {
        return term_1350.removeScope(scope_1348, phase_1349);
      }
      return term_1350;
    });
  }
  lineNumber() {
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (typeof this[field] && this[field].lineNumber === "function") {
        return this[field].lineNumber();
      }
    }
  }
  setLineNumber(line_1351) {
    let next_1352 = {};
    for (let field of _termSpec2.default.spec[this.type].fields) {
      if (this[field] == null) {
        next_1352[field] = null;
      } else if (typeof this[field].setLineNumber === "function") {
        next_1352[field] = this[field].setLineNumber(line_1351);
      } else if (_immutable.List.isList(this[field])) {
        next_1352[field] = this[field].map(f_1353 => f_1353.setLineNumber(line_1351));
      } else {
        next_1352[field] = this[field];
      }
    }
    return new Term(this.type, next_1352);
  }
}
exports.default = Term;
const isBindingWithDefault_1234 = R.whereEq({ type: "BindingWithDefault" });
;
const isBindingIdentifier_1235 = R.whereEq({ type: "BindingIdentifier" });
;
const isArrayBinding_1236 = R.whereEq({ type: "ArrayBinding" });
;
const isObjectBinding_1237 = R.whereEq({ type: "ObjectBinding" });
;
const isBindingPropertyIdentifier_1238 = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isBindingPropertyProperty_1239 = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isClassExpression_1240 = R.whereEq({ type: "ClassExpression" });
;
const isClassDeclaration_1241 = R.whereEq({ type: "ClassDeclaration" });
;
const isClassElement_1242 = R.whereEq({ type: "ClassElement" });
;
const isModule_1243 = R.whereEq({ type: "Module" });
;
const isImport_1244 = R.whereEq({ type: "Import" });
;
const isImportNamespace_1245 = R.whereEq({ type: "ImportNamespace" });
;
const isImportSpecifier_1246 = R.whereEq({ type: "ImportSpecifier" });
;
const isExportAllFrom_1247 = R.whereEq({ type: "ExportAllFrom" });
;
const isExportFrom_1248 = R.whereEq({ type: "ExportFrom" });
;
const isExport_1249 = R.whereEq({ type: "Export" });
;
const isExportDefault_1250 = R.whereEq({ type: "ExportDefault" });
;
const isExportSpecifier_1251 = R.whereEq({ type: "ExportSpecifier" });
;
const isMethod_1252 = R.whereEq({ type: "Method" });
;
const isGetter_1253 = R.whereEq({ type: "Getter" });
;
const isSetter_1254 = R.whereEq({ type: "Setter" });
;
const isDataProperty_1255 = R.whereEq({ type: "DataProperty" });
;
const isShorthandProperty_1256 = R.whereEq({ type: "ShorthandProperty" });
;
const isComputedPropertyName_1257 = R.whereEq({ type: "ComputedPropertyName" });
;
const isStaticPropertyName_1258 = R.whereEq({ type: "StaticPropertyName" });
;
const isLiteralBooleanExpression_1259 = R.whereEq({ type: "LiteralBooleanExpression" });
;
const isLiteralInfinityExpression_1260 = R.whereEq({ type: "LiteralInfinityExpression" });
;
const isLiteralNullExpression_1261 = R.whereEq({ type: "LiteralNullExpression" });
;
const isLiteralNumericExpression_1262 = R.whereEq({ type: "LiteralNumericExpression" });
;
const isLiteralRegExpExpression_1263 = R.whereEq({ type: "LiteralRegExpExpression" });
;
const isLiteralStringExpression_1264 = R.whereEq({ type: "LiteralStringExpression" });
;
const isArrayExpression_1265 = R.whereEq({ type: "ArrayExpression" });
;
const isArrowExpression_1266 = R.whereEq({ type: "ArrowExpression" });
;
const isAssignmentExpression_1267 = R.whereEq({ type: "AssignmentExpression" });
;
const isBinaryExpression_1268 = R.whereEq({ type: "BinaryExpression" });
;
const isCallExpression_1269 = R.whereEq({ type: "CallExpression" });
;
const isComputedAssignmentExpression_1270 = R.whereEq({ type: "ComputedAssignmentExpression" });
;
const isComputedMemberExpression_1271 = R.whereEq({ type: "ComputedMemberExpression" });
;
const isConditionalExpression_1272 = R.whereEq({ type: "ConditionalExpression" });
;
const isFunctionExpression_1273 = R.whereEq({ type: "FunctionExpression" });
;
const isIdentifierExpression_1274 = R.whereEq({ type: "IdentifierExpression" });
;
const isNewExpression_1275 = R.whereEq({ type: "NewExpression" });
;
const isNewTargetExpression_1276 = R.whereEq({ type: "NewTargetExpression" });
;
const isObjectExpression_1277 = R.whereEq({ type: "ObjectExpression" });
;
const isUnaryExpression_1278 = R.whereEq({ type: "UnaryExpression" });
;
const isStaticMemberExpression_1279 = R.whereEq({ type: "StaticMemberExpression" });
;
const isTemplateExpression_1280 = R.whereEq({ type: "TemplateExpression" });
;
const isThisExpression_1281 = R.whereEq({ type: "ThisExpression" });
;
const isUpdateExpression_1282 = R.whereEq({ type: "UpdateExpression" });
;
const isYieldExpression_1283 = R.whereEq({ type: "YieldExpression" });
;
const isYieldGeneratorExpression_1284 = R.whereEq({ type: "YieldGeneratorExpression" });
;
const isBlockStatement_1285 = R.whereEq({ type: "BlockStatement" });
;
const isBreakStatement_1286 = R.whereEq({ type: "BreakStatement" });
;
const isContinueStatement_1287 = R.whereEq({ type: "ContinueStatement" });
;
const isCompoundAssignmentExpression_1288 = R.whereEq({ type: "CompoundAssignmentExpression" });
;
const isDebuggerStatement_1289 = R.whereEq({ type: "DebuggerStatement" });
;
const isDoWhileStatement_1290 = R.whereEq({ type: "DoWhileStatement" });
;
const isEmptyStatement_1291 = R.whereEq({ type: "EmptyStatement" });
;
const isExpressionStatement_1292 = R.whereEq({ type: "ExpressionStatement" });
;
const isForInStatement_1293 = R.whereEq({ type: "ForInStatement" });
;
const isForOfStatement_1294 = R.whereEq({ type: "ForOfStatement" });
;
const isForStatement_1295 = R.whereEq({ type: "ForStatement" });
;
const isIfStatement_1296 = R.whereEq({ type: "IfStatement" });
;
const isLabeledStatement_1297 = R.whereEq({ type: "LabeledStatement" });
;
const isReturnStatement_1298 = R.whereEq({ type: "ReturnStatement" });
;
const isSwitchStatement_1299 = R.whereEq({ type: "SwitchStatement" });
;
const isSwitchStatementWithDefault_1300 = R.whereEq({ type: "SwitchStatementWithDefault" });
;
const isThrowStatement_1301 = R.whereEq({ type: "ThrowStatement" });
;
const isTryCatchStatement_1302 = R.whereEq({ type: "TryCatchStatement" });
;
const isTryFinallyStatement_1303 = R.whereEq({ type: "TryFinallyStatement" });
;
const isVariableDeclarationStatement_1304 = R.whereEq({ type: "VariableDeclarationStatement" });
;
const isWhileStatement_1305 = R.whereEq({ type: "WhileStatement" });
;
const isWithStatement_1306 = R.whereEq({ type: "WithStatement" });
;
const isPragma_1307 = R.whereEq({ type: "Pragma" });
;
const isBlock_1308 = R.whereEq({ type: "Block" });
;
const isCatchClause_1309 = R.whereEq({ type: "CatchClause" });
;
const isDirective_1310 = R.whereEq({ type: "Directive" });
;
const isFormalParameters_1311 = R.whereEq({ type: "FormalParameters" });
;
const isFunctionBody_1312 = R.whereEq({ type: "FunctionBody" });
;
const isFunctionDeclaration_1313 = R.whereEq({ type: "FunctionDeclaration" });
;
const isScript_1314 = R.whereEq({ type: "Script" });
;
const isSpreadElement_1315 = R.whereEq({ type: "SpreadElement" });
;
const isSuper_1316 = R.whereEq({ type: "Super" });
;
const isSwitchCase_1317 = R.whereEq({ type: "SwitchCase" });
;
const isSwitchDefault_1318 = R.whereEq({ type: "SwitchDefault" });
;
const isTemplateElement_1319 = R.whereEq({ type: "TemplateElement" });
;
const isSyntaxTemplate_1320 = R.whereEq({ type: "SyntaxTemplate" });
;
const isVariableDeclaration_1321 = R.whereEq({ type: "VariableDeclaration" });
;
const isVariableDeclarator_1322 = R.whereEq({ type: "VariableDeclarator" });
;
const isEOF_1323 = R.whereEq({ type: "EOF" });
;
const isSyntaxDeclaration_1324 = R.both(isVariableDeclaration_1321, R.whereEq({ kind: "syntax" }));
;
const isSyntaxrecDeclaration_1325 = R.both(isVariableDeclaration_1321, R.whereEq({ kind: "syntaxrec" }));
;
const isFunctionTerm_1326 = R.either(isFunctionDeclaration_1313, isFunctionExpression_1273);
;
const isFunctionWithName_1327 = R.and(isFunctionTerm_1326, R.complement(R.where({ name: R.isNil })));
;
const isParenthesizedExpression_1328 = R.whereEq({ type: "ParenthesizedExpression" });
;
const isExportSyntax_1329 = R.both(isExport_1249, exp_1354 => R.or(isSyntaxDeclaration_1324(exp_1354.declaration), isSyntaxrecDeclaration_1325(exp_1354.declaration)));
;
const isSyntaxDeclarationStatement_1330 = R.both(isVariableDeclarationStatement_1304, decl_1355 => isCompiletimeDeclaration_1331(decl_1355.declaration));
;
const isCompiletimeDeclaration_1331 = R.either(isSyntaxDeclaration_1324, isSyntaxrecDeclaration_1325);
;
const isCompiletimeStatement_1332 = term_1356 => {
  return term_1356 instanceof Term && isVariableDeclarationStatement_1304(term_1356) && isCompiletimeDeclaration_1331(term_1356.declaration);
};
;
const isImportDeclaration_1333 = R.either(isImport_1244, isImportNamespace_1245);
;
exports.isBindingWithDefault = isBindingWithDefault_1234;
exports.isBindingIdentifier = isBindingIdentifier_1235;
exports.isArrayBinding = isArrayBinding_1236;
exports.isObjectBinding = isObjectBinding_1237;
exports.isBindingPropertyIdentifier = isBindingPropertyIdentifier_1238;
exports.isBindingPropertyProperty = isBindingPropertyProperty_1239;
exports.isClassExpression = isClassExpression_1240;
exports.isClassDeclaration = isClassDeclaration_1241;
exports.isClassElement = isClassElement_1242;
exports.isModule = isModule_1243;
exports.isImport = isImport_1244;
exports.isImportNamespace = isImportNamespace_1245;
exports.isImportSpecifier = isImportSpecifier_1246;
exports.isExportAllFrom = isExportAllFrom_1247;
exports.isExportFrom = isExportFrom_1248;
exports.isExport = isExport_1249;
exports.isExportDefault = isExportDefault_1250;
exports.isExportSpecifier = isExportSpecifier_1251;
exports.isMethod = isMethod_1252;
exports.isGetter = isGetter_1253;
exports.isSetter = isSetter_1254;
exports.isDataProperty = isDataProperty_1255;
exports.isShorthandProperty = isShorthandProperty_1256;
exports.isComputedPropertyName = isComputedPropertyName_1257;
exports.isStaticPropertyName = isStaticPropertyName_1258;
exports.isLiteralBooleanExpression = isLiteralBooleanExpression_1259;
exports.isLiteralInfinityExpression = isLiteralInfinityExpression_1260;
exports.isLiteralNullExpression = isLiteralNullExpression_1261;
exports.isLiteralNumericExpression = isLiteralNumericExpression_1262;
exports.isLiteralRegExpExpression = isLiteralRegExpExpression_1263;
exports.isLiteralStringExpression = isLiteralStringExpression_1264;
exports.isArrayExpression = isArrayExpression_1265;
exports.isArrowExpression = isArrowExpression_1266;
exports.isAssignmentExpression = isAssignmentExpression_1267;
exports.isBinaryExpression = isBinaryExpression_1268;
exports.isCallExpression = isCallExpression_1269;
exports.isComputedAssignmentExpression = isComputedAssignmentExpression_1270;
exports.isComputedMemberExpression = isComputedMemberExpression_1271;
exports.isConditionalExpression = isConditionalExpression_1272;
exports.isFunctionExpression = isFunctionExpression_1273;
exports.isIdentifierExpression = isIdentifierExpression_1274;
exports.isNewExpression = isNewExpression_1275;
exports.isNewTargetExpression = isNewTargetExpression_1276;
exports.isObjectExpression = isObjectExpression_1277;
exports.isUnaryExpression = isUnaryExpression_1278;
exports.isStaticMemberExpression = isStaticMemberExpression_1279;
exports.isTemplateExpression = isTemplateExpression_1280;
exports.isThisExpression = isThisExpression_1281;
exports.isUpdateExpression = isUpdateExpression_1282;
exports.isYieldExpression = isYieldExpression_1283;
exports.isYieldGeneratorExpression = isYieldGeneratorExpression_1284;
exports.isBlockStatement = isBlockStatement_1285;
exports.isBreakStatement = isBreakStatement_1286;
exports.isContinueStatement = isContinueStatement_1287;
exports.isCompoundAssignmentExpression = isCompoundAssignmentExpression_1288;
exports.isDebuggerStatement = isDebuggerStatement_1289;
exports.isDoWhileStatement = isDoWhileStatement_1290;
exports.isEmptyStatement = isEmptyStatement_1291;
exports.isExpressionStatement = isExpressionStatement_1292;
exports.isForInStatement = isForInStatement_1293;
exports.isForOfStatement = isForOfStatement_1294;
exports.isForStatement = isForStatement_1295;
exports.isIfStatement = isIfStatement_1296;
exports.isLabeledStatement = isLabeledStatement_1297;
exports.isReturnStatement = isReturnStatement_1298;
exports.isSwitchStatement = isSwitchStatement_1299;
exports.isSwitchStatementWithDefault = isSwitchStatementWithDefault_1300;
exports.isThrowStatement = isThrowStatement_1301;
exports.isTryCatchStatement = isTryCatchStatement_1302;
exports.isTryFinallyStatement = isTryFinallyStatement_1303;
exports.isVariableDeclarationStatement = isVariableDeclarationStatement_1304;
exports.isWhileStatement = isWhileStatement_1305;
exports.isWithStatement = isWithStatement_1306;
exports.isPragma = isPragma_1307;
exports.isBlock = isBlock_1308;
exports.isCatchClause = isCatchClause_1309;
exports.isDirective = isDirective_1310;
exports.isFormalParameters = isFormalParameters_1311;
exports.isFunctionBody = isFunctionBody_1312;
exports.isFunctionDeclaration = isFunctionDeclaration_1313;
exports.isScript = isScript_1314;
exports.isSpreadElement = isSpreadElement_1315;
exports.isSuper = isSuper_1316;
exports.isSwitchCase = isSwitchCase_1317;
exports.isSwitchDefault = isSwitchDefault_1318;
exports.isTemplateElement = isTemplateElement_1319;
exports.isSyntaxTemplate = isSyntaxTemplate_1320;
exports.isVariableDeclaration = isVariableDeclaration_1321;
exports.isVariableDeclarator = isVariableDeclarator_1322;
exports.isEOF = isEOF_1323;
exports.isSyntaxDeclaration = isSyntaxDeclaration_1324;
exports.isSyntaxrecDeclaration = isSyntaxrecDeclaration_1325;
exports.isFunctionTerm = isFunctionTerm_1326;
exports.isFunctionWithName = isFunctionWithName_1327;
exports.isParenthesizedExpression = isParenthesizedExpression_1328;
exports.isExportSyntax = isExportSyntax_1329;
exports.isSyntaxDeclarationStatement = isSyntaxDeclarationStatement_1330;
exports.isCompiletimeDeclaration = isCompiletimeDeclaration_1331;
exports.isCompiletimeStatement = isCompiletimeStatement_1332;
exports.isImportDeclaration = isImportDeclaration_1333;
//# sourceMappingURL=data:application/json;base64,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LEdBQTFCLHNCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDaUIsUSxHQUFqQixhO1FBQ2lCLFEsR0FBakIsYTtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUN3QixlLEdBQXhCLG9CO1FBQ3FCLFksR0FBckIsaUI7UUFDaUIsUSxHQUFqQixhO1FBQ3dCLGUsR0FBeEIsb0I7UUFDMEIsaUIsR0FBMUIsc0I7UUFDaUIsUSxHQUFqQixhO1FBQ2lCLFEsR0FBakIsYTtRQUNpQixRLEdBQWpCLGE7UUFDdUIsYyxHQUF2QixtQjtRQUM0QixtQixHQUE1Qix3QjtRQUMrQixzQixHQUEvQiwyQjtRQUM2QixvQixHQUE3Qix5QjtRQUNtQywwQixHQUFuQywrQjtRQUNvQywyQixHQUFwQyxnQztRQUNnQyx1QixHQUFoQyw0QjtRQUNtQywwQixHQUFuQywrQjtRQUNrQyx5QixHQUFsQyw4QjtRQUNrQyx5QixHQUFsQyw4QjtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUMrQixzQixHQUEvQiwyQjtRQUMyQixrQixHQUEzQix1QjtRQUN5QixnQixHQUF6QixxQjtRQUN1Qyw4QixHQUF2QyxtQztRQUNtQywwQixHQUFuQywrQjtRQUNnQyx1QixHQUFoQyw0QjtRQUM2QixvQixHQUE3Qix5QjtRQUMrQixzQixHQUEvQiwyQjtRQUN3QixlLEdBQXhCLG9CO1FBQzhCLHFCLEdBQTlCLDBCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQzBCLGlCLEdBQTFCLHNCO1FBQ2lDLHdCLEdBQWpDLDZCO1FBQzZCLG9CLEdBQTdCLHlCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQzBCLGlCLEdBQTFCLHNCO1FBQ21DLDBCLEdBQW5DLCtCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzRCLG1CLEdBQTVCLHdCO1FBQ3VDLDhCLEdBQXZDLG1DO1FBQzRCLG1CLEdBQTVCLHdCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQzhCLHFCLEdBQTlCLDBCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3lCLGdCLEdBQXpCLHFCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDc0IsYSxHQUF0QixrQjtRQUMyQixrQixHQUEzQix1QjtRQUMwQixpQixHQUExQixzQjtRQUMwQixpQixHQUExQixzQjtRQUNxQyw0QixHQUFyQyxpQztRQUN5QixnQixHQUF6QixxQjtRQUM0QixtQixHQUE1Qix3QjtRQUM4QixxQixHQUE5QiwwQjtRQUN1Qyw4QixHQUF2QyxtQztRQUN5QixnQixHQUF6QixxQjtRQUN3QixlLEdBQXhCLG9CO1FBQ2lCLFEsR0FBakIsYTtRQUNnQixPLEdBQWhCLFk7UUFDc0IsYSxHQUF0QixrQjtRQUNvQixXLEdBQXBCLGdCO1FBQzJCLGtCLEdBQTNCLHVCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDOEIscUIsR0FBOUIsMEI7UUFDaUIsUSxHQUFqQixhO1FBQ3dCLGUsR0FBeEIsb0I7UUFDZ0IsTyxHQUFoQixZO1FBQ3FCLFksR0FBckIsaUI7UUFDd0IsZSxHQUF4QixvQjtRQUMwQixpQixHQUExQixzQjtRQUN5QixnQixHQUF6QixxQjtRQUM4QixxQixHQUE5QiwwQjtRQUM2QixvQixHQUE3Qix5QjtRQUNjLEssR0FBZCxVO1FBQzRCLG1CLEdBQTVCLHdCO1FBQytCLHNCLEdBQS9CLDJCO1FBQ3VCLGMsR0FBdkIsbUI7UUFDMkIsa0IsR0FBM0IsdUI7UUFDa0MseUIsR0FBbEMsOEI7UUFDdUIsYyxHQUF2QixtQjtRQUNxQyw0QixHQUFyQyxpQztRQUNpQyx3QixHQUFqQyw2QjtRQUMrQixzQixHQUEvQiwyQjtRQUM0QixtQixHQUE1Qix3QiIsImZpbGUiOiJ0ZXJtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHthc3NlcnQsIGV4cGVjdH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge21peGlufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCBUZXJtU3BlYyBmcm9tIFwiLi90ZXJtLXNwZWNcIjtcbmltcG9ydCAgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVybSB7XG4gIGNvbnN0cnVjdG9yKHR5cGVfMTMzNCwgcHJvcHNfMTMzNSkge1xuICAgIHRoaXMudHlwZSA9IHR5cGVfMTMzNDtcbiAgICB0aGlzLmxvYyA9IG51bGw7XG4gICAgZm9yIChsZXQgcHJvcCBvZiBPYmplY3Qua2V5cyhwcm9wc18xMzM1KSkge1xuICAgICAgdGhpc1twcm9wXSA9IHByb3BzXzEzMzVbcHJvcF07XG4gICAgfVxuICB9XG4gIGV4dGVuZChwcm9wc18xMzM2KSB7XG4gICAgbGV0IG5ld1Byb3BzXzEzMzcgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAocHJvcHNfMTMzNi5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgICAgbmV3UHJvcHNfMTMzN1tmaWVsZF0gPSBwcm9wc18xMzM2W2ZpZWxkXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Byb3BzXzEzMzdbZmllbGRdID0gdGhpc1tmaWVsZF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0aGlzLnR5cGUsIG5ld1Byb3BzXzEzMzcpO1xuICB9XG4gIGdlbih7aW5jbHVkZUltcG9ydHN9ID0ge2luY2x1ZGVJbXBvcnRzOiB0cnVlfSkge1xuICAgIGxldCBuZXh0XzEzMzggPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAodGhpc1tmaWVsZF0gPT0gbnVsbCkge1xuICAgICAgICBuZXh0XzEzMzhbZmllbGRdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodGhpc1tmaWVsZF0gaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICAgIG5leHRfMTMzOFtmaWVsZF0gPSB0aGlzW2ZpZWxkXS5nZW4oaW5jbHVkZUltcG9ydHMpO1xuICAgICAgfSBlbHNlIGlmIChMaXN0LmlzTGlzdCh0aGlzW2ZpZWxkXSkpIHtcbiAgICAgICAgbGV0IHByZWQgPSBpbmNsdWRlSW1wb3J0cyA/IFIuY29tcGxlbWVudChpc0NvbXBpbGV0aW1lU3RhdGVtZW50XzEzMzIpIDogUi5ib3RoKFIuY29tcGxlbWVudChpc0ltcG9ydERlY2xhcmF0aW9uXzEzMzMpLCBSLmNvbXBsZW1lbnQoaXNDb21waWxldGltZVN0YXRlbWVudF8xMzMyKSk7XG4gICAgICAgIG5leHRfMTMzOFtmaWVsZF0gPSB0aGlzW2ZpZWxkXS5maWx0ZXIocHJlZCkubWFwKHRlcm1fMTMzOSA9PiB0ZXJtXzEzMzkgaW5zdGFuY2VvZiBUZXJtID8gdGVybV8xMzM5LmdlbihpbmNsdWRlSW1wb3J0cykgOiB0ZXJtXzEzMzkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dF8xMzM4W2ZpZWxkXSA9IHRoaXNbZmllbGRdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odGhpcy50eXBlLCBuZXh0XzEzMzgpO1xuICB9XG4gIHZpc2l0KGZfMTM0MCkge1xuICAgIGxldCBuZXh0XzEzNDEgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5zcGVjW3RoaXMudHlwZV0uZmllbGRzKSB7XG4gICAgICBpZiAodGhpc1tmaWVsZF0gPT0gbnVsbCkge1xuICAgICAgICBuZXh0XzEzNDFbZmllbGRdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoTGlzdC5pc0xpc3QodGhpc1tmaWVsZF0pKSB7XG4gICAgICAgIG5leHRfMTM0MVtmaWVsZF0gPSB0aGlzW2ZpZWxkXS5tYXAoZmllbGRfMTM0MiA9PiBmaWVsZF8xMzQyICE9IG51bGwgPyBmXzEzNDAoZmllbGRfMTM0MikgOiBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfMTM0MVtmaWVsZF0gPSBmXzEzNDAodGhpc1tmaWVsZF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHRlbmQobmV4dF8xMzQxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV8xMzQzLCBiaW5kaW5nc18xMzQ0LCBwaGFzZV8xMzQ1LCBvcHRpb25zXzEzNDYpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh0ZXJtXzEzNDcgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0ZXJtXzEzNDcuYWRkU2NvcGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGVybV8xMzQ3LmFkZFNjb3BlKHNjb3BlXzEzNDMsIGJpbmRpbmdzXzEzNDQsIHBoYXNlXzEzNDUsIG9wdGlvbnNfMTM0Nik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVybV8xMzQ3O1xuICAgIH0pO1xuICB9XG4gIHJlbW92ZVNjb3BlKHNjb3BlXzEzNDgsIHBoYXNlXzEzNDkpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh0ZXJtXzEzNTAgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0ZXJtXzEzNTAucmVtb3ZlU2NvcGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGVybV8xMzUwLnJlbW92ZVNjb3BlKHNjb3BlXzEzNDgsIHBoYXNlXzEzNDkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRlcm1fMTM1MDtcbiAgICB9KTtcbiAgfVxuICBsaW5lTnVtYmVyKCkge1xuICAgIGZvciAobGV0IGZpZWxkIG9mIFRlcm1TcGVjLnNwZWNbdGhpcy50eXBlXS5maWVsZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1tmaWVsZF0gJiYgdGhpc1tmaWVsZF0ubGluZU51bWJlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzW2ZpZWxkXS5saW5lTnVtYmVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV8xMzUxKSB7XG4gICAgbGV0IG5leHRfMTM1MiA9IHt9O1xuICAgIGZvciAobGV0IGZpZWxkIG9mIFRlcm1TcGVjLnNwZWNbdGhpcy50eXBlXS5maWVsZHMpIHtcbiAgICAgIGlmICh0aGlzW2ZpZWxkXSA9PSBudWxsKSB7XG4gICAgICAgIG5leHRfMTM1MltmaWVsZF0gPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpc1tmaWVsZF0uc2V0TGluZU51bWJlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG5leHRfMTM1MltmaWVsZF0gPSB0aGlzW2ZpZWxkXS5zZXRMaW5lTnVtYmVyKGxpbmVfMTM1MSk7XG4gICAgICB9IGVsc2UgaWYgKExpc3QuaXNMaXN0KHRoaXNbZmllbGRdKSkge1xuICAgICAgICBuZXh0XzEzNTJbZmllbGRdID0gdGhpc1tmaWVsZF0ubWFwKGZfMTM1MyA9PiBmXzEzNTMuc2V0TGluZU51bWJlcihsaW5lXzEzNTEpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfMTM1MltmaWVsZF0gPSB0aGlzW2ZpZWxkXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHRoaXMudHlwZSwgbmV4dF8xMzUyKTtcbiAgfVxufVxuY29uc3QgaXNCaW5kaW5nV2l0aERlZmF1bHRfMTIzNCA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5kaW5nV2l0aERlZmF1bHRcIn0pO1xuO1xuY29uc3QgaXNCaW5kaW5nSWRlbnRpZmllcl8xMjM1ID0gUi53aGVyZUVxKHt0eXBlOiBcIkJpbmRpbmdJZGVudGlmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzQXJyYXlCaW5kaW5nXzEyMzYgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyYXlCaW5kaW5nXCJ9KTtcbjtcbmNvbnN0IGlzT2JqZWN0QmluZGluZ18xMjM3ID0gUi53aGVyZUVxKHt0eXBlOiBcIk9iamVjdEJpbmRpbmdcIn0pO1xuO1xuY29uc3QgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXzEyMzggPSBSLndoZXJlRXEoe3R5cGU6IFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwifSk7XG47XG5jb25zdCBpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XzEyMzkgPSBSLndoZXJlRXEoe3R5cGU6IFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwifSk7XG47XG5jb25zdCBpc0NsYXNzRXhwcmVzc2lvbl8xMjQwID0gUi53aGVyZUVxKHt0eXBlOiBcIkNsYXNzRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0NsYXNzRGVjbGFyYXRpb25fMTI0MSA9IFIud2hlcmVFcSh7dHlwZTogXCJDbGFzc0RlY2xhcmF0aW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ2xhc3NFbGVtZW50XzEyNDIgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ2xhc3NFbGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzTW9kdWxlXzEyNDMgPSBSLndoZXJlRXEoe3R5cGU6IFwiTW9kdWxlXCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0XzEyNDQgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0XCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0TmFtZXNwYWNlXzEyNDUgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0TmFtZXNwYWNlXCJ9KTtcbjtcbmNvbnN0IGlzSW1wb3J0U3BlY2lmaWVyXzEyNDYgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0U3BlY2lmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzRXhwb3J0QWxsRnJvbV8xMjQ3ID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydEFsbEZyb21cIn0pO1xuO1xuY29uc3QgaXNFeHBvcnRGcm9tXzEyNDggPSBSLndoZXJlRXEoe3R5cGU6IFwiRXhwb3J0RnJvbVwifSk7XG47XG5jb25zdCBpc0V4cG9ydF8xMjQ5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydFwifSk7XG47XG5jb25zdCBpc0V4cG9ydERlZmF1bHRfMTI1MCA9IFIud2hlcmVFcSh7dHlwZTogXCJFeHBvcnREZWZhdWx0XCJ9KTtcbjtcbmNvbnN0IGlzRXhwb3J0U3BlY2lmaWVyXzEyNTEgPSBSLndoZXJlRXEoe3R5cGU6IFwiRXhwb3J0U3BlY2lmaWVyXCJ9KTtcbjtcbmNvbnN0IGlzTWV0aG9kXzEyNTIgPSBSLndoZXJlRXEoe3R5cGU6IFwiTWV0aG9kXCJ9KTtcbjtcbmNvbnN0IGlzR2V0dGVyXzEyNTMgPSBSLndoZXJlRXEoe3R5cGU6IFwiR2V0dGVyXCJ9KTtcbjtcbmNvbnN0IGlzU2V0dGVyXzEyNTQgPSBSLndoZXJlRXEoe3R5cGU6IFwiU2V0dGVyXCJ9KTtcbjtcbmNvbnN0IGlzRGF0YVByb3BlcnR5XzEyNTUgPSBSLndoZXJlRXEoe3R5cGU6IFwiRGF0YVByb3BlcnR5XCJ9KTtcbjtcbmNvbnN0IGlzU2hvcnRoYW5kUHJvcGVydHlfMTI1NiA9IFIud2hlcmVFcSh7dHlwZTogXCJTaG9ydGhhbmRQcm9wZXJ0eVwifSk7XG47XG5jb25zdCBpc0NvbXB1dGVkUHJvcGVydHlOYW1lXzEyNTcgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIn0pO1xuO1xuY29uc3QgaXNTdGF0aWNQcm9wZXJ0eU5hbWVfMTI1OCA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25fMTI1OSA9IFIud2hlcmVFcSh7dHlwZTogXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uXzEyNjAgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxOdWxsRXhwcmVzc2lvbl8xMjYxID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxOdW1lcmljRXhwcmVzc2lvbl8xMjYyID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0xpdGVyYWxSZWdFeHBFeHByZXNzaW9uXzEyNjMgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbl8xMjY0ID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXJyYXlFeHByZXNzaW9uXzEyNjUgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyYXlFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXJyb3dFeHByZXNzaW9uXzEyNjYgPSBSLndoZXJlRXEoe3R5cGU6IFwiQXJyb3dFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQXNzaWdubWVudEV4cHJlc3Npb25fMTI2NyA9IFIud2hlcmVFcSh7dHlwZTogXCJBc3NpZ25tZW50RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0JpbmFyeUV4cHJlc3Npb25fMTI2OCA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ2FsbEV4cHJlc3Npb25fMTI2OSA9IFIud2hlcmVFcSh7dHlwZTogXCJDYWxsRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc0NvbXB1dGVkQXNzaWdubWVudEV4cHJlc3Npb25fMTI3MCA9IFIud2hlcmVFcSh7dHlwZTogXCJDb21wdXRlZEFzc2lnbm1lbnRFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXzEyNzEgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQ29uZGl0aW9uYWxFeHByZXNzaW9uXzEyNzIgPSBSLndoZXJlRXEoe3R5cGU6IFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25FeHByZXNzaW9uXzEyNzMgPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25FeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzSWRlbnRpZmllckV4cHJlc3Npb25fMTI3NCA9IFIud2hlcmVFcSh7dHlwZTogXCJJZGVudGlmaWVyRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc05ld0V4cHJlc3Npb25fMTI3NSA9IFIud2hlcmVFcSh7dHlwZTogXCJOZXdFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzTmV3VGFyZ2V0RXhwcmVzc2lvbl8xMjc2ID0gUi53aGVyZUVxKHt0eXBlOiBcIk5ld1RhcmdldEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNPYmplY3RFeHByZXNzaW9uXzEyNzcgPSBSLndoZXJlRXEoe3R5cGU6IFwiT2JqZWN0RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1VuYXJ5RXhwcmVzc2lvbl8xMjc4ID0gUi53aGVyZUVxKHt0eXBlOiBcIlVuYXJ5RXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1N0YXRpY01lbWJlckV4cHJlc3Npb25fMTI3OSA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzVGVtcGxhdGVFeHByZXNzaW9uXzEyODAgPSBSLndoZXJlRXEoe3R5cGU6IFwiVGVtcGxhdGVFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzVGhpc0V4cHJlc3Npb25fMTI4MSA9IFIud2hlcmVFcSh7dHlwZTogXCJUaGlzRXhwcmVzc2lvblwifSk7XG47XG5jb25zdCBpc1VwZGF0ZUV4cHJlc3Npb25fMTI4MiA9IFIud2hlcmVFcSh7dHlwZTogXCJVcGRhdGVFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzWWllbGRFeHByZXNzaW9uXzEyODMgPSBSLndoZXJlRXEoe3R5cGU6IFwiWWllbGRFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXzEyODQgPSBSLndoZXJlRXEoe3R5cGU6IFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGlzQmxvY2tTdGF0ZW1lbnRfMTI4NSA9IFIud2hlcmVFcSh7dHlwZTogXCJCbG9ja1N0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0JyZWFrU3RhdGVtZW50XzEyODYgPSBSLndoZXJlRXEoe3R5cGU6IFwiQnJlYWtTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNDb250aW51ZVN0YXRlbWVudF8xMjg3ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbnRpbnVlU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjg4ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNEZWJ1Z2dlclN0YXRlbWVudF8xMjg5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkRlYnVnZ2VyU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRG9XaGlsZVN0YXRlbWVudF8xMjkwID0gUi53aGVyZUVxKHt0eXBlOiBcIkRvV2hpbGVTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNFbXB0eVN0YXRlbWVudF8xMjkxID0gUi53aGVyZUVxKHt0eXBlOiBcIkVtcHR5U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRXhwcmVzc2lvblN0YXRlbWVudF8xMjkyID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNGb3JJblN0YXRlbWVudF8xMjkzID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvckluU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzRm9yT2ZTdGF0ZW1lbnRfMTI5NCA9IFIud2hlcmVFcSh7dHlwZTogXCJGb3JPZlN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0ZvclN0YXRlbWVudF8xMjk1ID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvclN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc0lmU3RhdGVtZW50XzEyOTYgPSBSLndoZXJlRXEoe3R5cGU6IFwiSWZTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNMYWJlbGVkU3RhdGVtZW50XzEyOTcgPSBSLndoZXJlRXEoe3R5cGU6IFwiTGFiZWxlZFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1JldHVyblN0YXRlbWVudF8xMjk4ID0gUi53aGVyZUVxKHt0eXBlOiBcIlJldHVyblN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1N3aXRjaFN0YXRlbWVudF8xMjk5ID0gUi53aGVyZUVxKHt0eXBlOiBcIlN3aXRjaFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1N3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XzEzMDAgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIn0pO1xuO1xuY29uc3QgaXNUaHJvd1N0YXRlbWVudF8xMzAxID0gUi53aGVyZUVxKHt0eXBlOiBcIlRocm93U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzVHJ5Q2F0Y2hTdGF0ZW1lbnRfMTMwMiA9IFIud2hlcmVFcSh7dHlwZTogXCJUcnlDYXRjaFN0YXRlbWVudFwifSk7XG47XG5jb25zdCBpc1RyeUZpbmFsbHlTdGF0ZW1lbnRfMTMwMyA9IFIud2hlcmVFcSh7dHlwZTogXCJUcnlGaW5hbGx5U3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudF8xMzA0ID0gUi53aGVyZUVxKHt0eXBlOiBcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNXaGlsZVN0YXRlbWVudF8xMzA1ID0gUi53aGVyZUVxKHt0eXBlOiBcIldoaWxlU3RhdGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzV2l0aFN0YXRlbWVudF8xMzA2ID0gUi53aGVyZUVxKHt0eXBlOiBcIldpdGhTdGF0ZW1lbnRcIn0pO1xuO1xuY29uc3QgaXNQcmFnbWFfMTMwNyA9IFIud2hlcmVFcSh7dHlwZTogXCJQcmFnbWFcIn0pO1xuO1xuY29uc3QgaXNCbG9ja18xMzA4ID0gUi53aGVyZUVxKHt0eXBlOiBcIkJsb2NrXCJ9KTtcbjtcbmNvbnN0IGlzQ2F0Y2hDbGF1c2VfMTMwOSA9IFIud2hlcmVFcSh7dHlwZTogXCJDYXRjaENsYXVzZVwifSk7XG47XG5jb25zdCBpc0RpcmVjdGl2ZV8xMzEwID0gUi53aGVyZUVxKHt0eXBlOiBcIkRpcmVjdGl2ZVwifSk7XG47XG5jb25zdCBpc0Zvcm1hbFBhcmFtZXRlcnNfMTMxMSA9IFIud2hlcmVFcSh7dHlwZTogXCJGb3JtYWxQYXJhbWV0ZXJzXCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25Cb2R5XzEzMTIgPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25Cb2R5XCJ9KTtcbjtcbmNvbnN0IGlzRnVuY3Rpb25EZWNsYXJhdGlvbl8xMzEzID0gUi53aGVyZUVxKHt0eXBlOiBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIn0pO1xuO1xuY29uc3QgaXNTY3JpcHRfMTMxNCA9IFIud2hlcmVFcSh7dHlwZTogXCJTY3JpcHRcIn0pO1xuO1xuY29uc3QgaXNTcHJlYWRFbGVtZW50XzEzMTUgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3ByZWFkRWxlbWVudFwifSk7XG47XG5jb25zdCBpc1N1cGVyXzEzMTYgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3VwZXJcIn0pO1xuO1xuY29uc3QgaXNTd2l0Y2hDYXNlXzEzMTcgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3dpdGNoQ2FzZVwifSk7XG47XG5jb25zdCBpc1N3aXRjaERlZmF1bHRfMTMxOCA9IFIud2hlcmVFcSh7dHlwZTogXCJTd2l0Y2hEZWZhdWx0XCJ9KTtcbjtcbmNvbnN0IGlzVGVtcGxhdGVFbGVtZW50XzEzMTkgPSBSLndoZXJlRXEoe3R5cGU6IFwiVGVtcGxhdGVFbGVtZW50XCJ9KTtcbjtcbmNvbnN0IGlzU3ludGF4VGVtcGxhdGVfMTMyMCA9IFIud2hlcmVFcSh7dHlwZTogXCJTeW50YXhUZW1wbGF0ZVwifSk7XG47XG5jb25zdCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25fMTMyMSA9IFIud2hlcmVFcSh7dHlwZTogXCJWYXJpYWJsZURlY2xhcmF0aW9uXCJ9KTtcbjtcbmNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdG9yXzEzMjIgPSBSLndoZXJlRXEoe3R5cGU6IFwiVmFyaWFibGVEZWNsYXJhdG9yXCJ9KTtcbjtcbmNvbnN0IGlzRU9GXzEzMjMgPSBSLndoZXJlRXEoe3R5cGU6IFwiRU9GXCJ9KTtcbjtcbmNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb25fMTMyNCA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb25fMTMyMSwgUi53aGVyZUVxKHtraW5kOiBcInN5bnRheFwifSkpO1xuO1xuY29uc3QgaXNTeW50YXhyZWNEZWNsYXJhdGlvbl8xMzI1ID0gUi5ib3RoKGlzVmFyaWFibGVEZWNsYXJhdGlvbl8xMzIxLCBSLndoZXJlRXEoe2tpbmQ6IFwic3ludGF4cmVjXCJ9KSk7XG47XG5jb25zdCBpc0Z1bmN0aW9uVGVybV8xMzI2ID0gUi5laXRoZXIoaXNGdW5jdGlvbkRlY2xhcmF0aW9uXzEzMTMsIGlzRnVuY3Rpb25FeHByZXNzaW9uXzEyNzMpO1xuO1xuY29uc3QgaXNGdW5jdGlvbldpdGhOYW1lXzEzMjcgPSBSLmFuZChpc0Z1bmN0aW9uVGVybV8xMzI2LCBSLmNvbXBsZW1lbnQoUi53aGVyZSh7bmFtZTogUi5pc05pbH0pKSk7XG47XG5jb25zdCBpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uXzEzMjggPSBSLndoZXJlRXEoe3R5cGU6IFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIn0pO1xuO1xuY29uc3QgaXNFeHBvcnRTeW50YXhfMTMyOSA9IFIuYm90aChpc0V4cG9ydF8xMjQ5LCBleHBfMTM1NCA9PiBSLm9yKGlzU3ludGF4RGVjbGFyYXRpb25fMTMyNChleHBfMTM1NC5kZWNsYXJhdGlvbiksIGlzU3ludGF4cmVjRGVjbGFyYXRpb25fMTMyNShleHBfMTM1NC5kZWNsYXJhdGlvbikpKTtcbjtcbmNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMzMCA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMwNCwgZGVjbF8xMzU1ID0+IGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzMxKGRlY2xfMTM1NS5kZWNsYXJhdGlvbikpO1xuO1xuY29uc3QgaXNDb21waWxldGltZURlY2xhcmF0aW9uXzEzMzEgPSBSLmVpdGhlcihpc1N5bnRheERlY2xhcmF0aW9uXzEzMjQsIGlzU3ludGF4cmVjRGVjbGFyYXRpb25fMTMyNSk7XG47XG5jb25zdCBpc0NvbXBpbGV0aW1lU3RhdGVtZW50XzEzMzIgPSB0ZXJtXzEzNTYgPT4ge1xuICByZXR1cm4gdGVybV8xMzU2IGluc3RhbmNlb2YgVGVybSAmJiBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRfMTMwNCh0ZXJtXzEzNTYpICYmIGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzMxKHRlcm1fMTM1Ni5kZWNsYXJhdGlvbik7XG59O1xuO1xuY29uc3QgaXNJbXBvcnREZWNsYXJhdGlvbl8xMzMzID0gUi5laXRoZXIoaXNJbXBvcnRfMTI0NCwgaXNJbXBvcnROYW1lc3BhY2VfMTI0NSk7XG47XG5leHBvcnQge2lzQmluZGluZ1dpdGhEZWZhdWx0XzEyMzQgYXMgaXNCaW5kaW5nV2l0aERlZmF1bHR9O1xuZXhwb3J0IHtpc0JpbmRpbmdJZGVudGlmaWVyXzEyMzUgYXMgaXNCaW5kaW5nSWRlbnRpZmllcn07XG5leHBvcnQge2lzQXJyYXlCaW5kaW5nXzEyMzYgYXMgaXNBcnJheUJpbmRpbmd9O1xuZXhwb3J0IHtpc09iamVjdEJpbmRpbmdfMTIzNyBhcyBpc09iamVjdEJpbmRpbmd9O1xuZXhwb3J0IHtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJfMTIzOCBhcyBpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJ9O1xuZXhwb3J0IHtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XzEyMzkgYXMgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eX07XG5leHBvcnQge2lzQ2xhc3NFeHByZXNzaW9uXzEyNDAgYXMgaXNDbGFzc0V4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NsYXNzRGVjbGFyYXRpb25fMTI0MSBhcyBpc0NsYXNzRGVjbGFyYXRpb259O1xuZXhwb3J0IHtpc0NsYXNzRWxlbWVudF8xMjQyIGFzIGlzQ2xhc3NFbGVtZW50fTtcbmV4cG9ydCB7aXNNb2R1bGVfMTI0MyBhcyBpc01vZHVsZX07XG5leHBvcnQge2lzSW1wb3J0XzEyNDQgYXMgaXNJbXBvcnR9O1xuZXhwb3J0IHtpc0ltcG9ydE5hbWVzcGFjZV8xMjQ1IGFzIGlzSW1wb3J0TmFtZXNwYWNlfTtcbmV4cG9ydCB7aXNJbXBvcnRTcGVjaWZpZXJfMTI0NiBhcyBpc0ltcG9ydFNwZWNpZmllcn07XG5leHBvcnQge2lzRXhwb3J0QWxsRnJvbV8xMjQ3IGFzIGlzRXhwb3J0QWxsRnJvbX07XG5leHBvcnQge2lzRXhwb3J0RnJvbV8xMjQ4IGFzIGlzRXhwb3J0RnJvbX07XG5leHBvcnQge2lzRXhwb3J0XzEyNDkgYXMgaXNFeHBvcnR9O1xuZXhwb3J0IHtpc0V4cG9ydERlZmF1bHRfMTI1MCBhcyBpc0V4cG9ydERlZmF1bHR9O1xuZXhwb3J0IHtpc0V4cG9ydFNwZWNpZmllcl8xMjUxIGFzIGlzRXhwb3J0U3BlY2lmaWVyfTtcbmV4cG9ydCB7aXNNZXRob2RfMTI1MiBhcyBpc01ldGhvZH07XG5leHBvcnQge2lzR2V0dGVyXzEyNTMgYXMgaXNHZXR0ZXJ9O1xuZXhwb3J0IHtpc1NldHRlcl8xMjU0IGFzIGlzU2V0dGVyfTtcbmV4cG9ydCB7aXNEYXRhUHJvcGVydHlfMTI1NSBhcyBpc0RhdGFQcm9wZXJ0eX07XG5leHBvcnQge2lzU2hvcnRoYW5kUHJvcGVydHlfMTI1NiBhcyBpc1Nob3J0aGFuZFByb3BlcnR5fTtcbmV4cG9ydCB7aXNDb21wdXRlZFByb3BlcnR5TmFtZV8xMjU3IGFzIGlzQ29tcHV0ZWRQcm9wZXJ0eU5hbWV9O1xuZXhwb3J0IHtpc1N0YXRpY1Byb3BlcnR5TmFtZV8xMjU4IGFzIGlzU3RhdGljUHJvcGVydHlOYW1lfTtcbmV4cG9ydCB7aXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25fMTI1OSBhcyBpc0xpdGVyYWxCb29sZWFuRXhwcmVzc2lvbn07XG5leHBvcnQge2lzTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbl8xMjYwIGFzIGlzTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbn07XG5leHBvcnQge2lzTGl0ZXJhbE51bGxFeHByZXNzaW9uXzEyNjEgYXMgaXNMaXRlcmFsTnVsbEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0xpdGVyYWxOdW1lcmljRXhwcmVzc2lvbl8xMjYyIGFzIGlzTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbl8xMjYzIGFzIGlzTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0xpdGVyYWxTdHJpbmdFeHByZXNzaW9uXzEyNjQgYXMgaXNMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbn07XG5leHBvcnQge2lzQXJyYXlFeHByZXNzaW9uXzEyNjUgYXMgaXNBcnJheUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0Fycm93RXhwcmVzc2lvbl8xMjY2IGFzIGlzQXJyb3dFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjY3IGFzIGlzQXNzaWdubWVudEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0JpbmFyeUV4cHJlc3Npb25fMTI2OCBhcyBpc0JpbmFyeUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NhbGxFeHByZXNzaW9uXzEyNjkgYXMgaXNDYWxsRXhwcmVzc2lvbn07XG5leHBvcnQge2lzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbl8xMjcwIGFzIGlzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbn07XG5leHBvcnQge2lzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXzEyNzEgYXMgaXNDb21wdXRlZE1lbWJlckV4cHJlc3Npb259O1xuZXhwb3J0IHtpc0NvbmRpdGlvbmFsRXhwcmVzc2lvbl8xMjcyIGFzIGlzQ29uZGl0aW9uYWxFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNGdW5jdGlvbkV4cHJlc3Npb25fMTI3MyBhcyBpc0Z1bmN0aW9uRXhwcmVzc2lvbn07XG5leHBvcnQge2lzSWRlbnRpZmllckV4cHJlc3Npb25fMTI3NCBhcyBpc0lkZW50aWZpZXJFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNOZXdFeHByZXNzaW9uXzEyNzUgYXMgaXNOZXdFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNOZXdUYXJnZXRFeHByZXNzaW9uXzEyNzYgYXMgaXNOZXdUYXJnZXRFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNPYmplY3RFeHByZXNzaW9uXzEyNzcgYXMgaXNPYmplY3RFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNVbmFyeUV4cHJlc3Npb25fMTI3OCBhcyBpc1VuYXJ5RXhwcmVzc2lvbn07XG5leHBvcnQge2lzU3RhdGljTWVtYmVyRXhwcmVzc2lvbl8xMjc5IGFzIGlzU3RhdGljTWVtYmVyRXhwcmVzc2lvbn07XG5leHBvcnQge2lzVGVtcGxhdGVFeHByZXNzaW9uXzEyODAgYXMgaXNUZW1wbGF0ZUV4cHJlc3Npb259O1xuZXhwb3J0IHtpc1RoaXNFeHByZXNzaW9uXzEyODEgYXMgaXNUaGlzRXhwcmVzc2lvbn07XG5leHBvcnQge2lzVXBkYXRlRXhwcmVzc2lvbl8xMjgyIGFzIGlzVXBkYXRlRXhwcmVzc2lvbn07XG5leHBvcnQge2lzWWllbGRFeHByZXNzaW9uXzEyODMgYXMgaXNZaWVsZEV4cHJlc3Npb259O1xuZXhwb3J0IHtpc1lpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbl8xMjg0IGFzIGlzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNCbG9ja1N0YXRlbWVudF8xMjg1IGFzIGlzQmxvY2tTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0JyZWFrU3RhdGVtZW50XzEyODYgYXMgaXNCcmVha1N0YXRlbWVudH07XG5leHBvcnQge2lzQ29udGludWVTdGF0ZW1lbnRfMTI4NyBhcyBpc0NvbnRpbnVlU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXzEyODggYXMgaXNDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9ufTtcbmV4cG9ydCB7aXNEZWJ1Z2dlclN0YXRlbWVudF8xMjg5IGFzIGlzRGVidWdnZXJTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0RvV2hpbGVTdGF0ZW1lbnRfMTI5MCBhcyBpc0RvV2hpbGVTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0VtcHR5U3RhdGVtZW50XzEyOTEgYXMgaXNFbXB0eVN0YXRlbWVudH07XG5leHBvcnQge2lzRXhwcmVzc2lvblN0YXRlbWVudF8xMjkyIGFzIGlzRXhwcmVzc2lvblN0YXRlbWVudH07XG5leHBvcnQge2lzRm9ySW5TdGF0ZW1lbnRfMTI5MyBhcyBpc0ZvckluU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNGb3JPZlN0YXRlbWVudF8xMjk0IGFzIGlzRm9yT2ZTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0ZvclN0YXRlbWVudF8xMjk1IGFzIGlzRm9yU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNJZlN0YXRlbWVudF8xMjk2IGFzIGlzSWZTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc0xhYmVsZWRTdGF0ZW1lbnRfMTI5NyBhcyBpc0xhYmVsZWRTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc1JldHVyblN0YXRlbWVudF8xMjk4IGFzIGlzUmV0dXJuU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNTd2l0Y2hTdGF0ZW1lbnRfMTI5OSBhcyBpc1N3aXRjaFN0YXRlbWVudH07XG5leHBvcnQge2lzU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRfMTMwMCBhcyBpc1N3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0fTtcbmV4cG9ydCB7aXNUaHJvd1N0YXRlbWVudF8xMzAxIGFzIGlzVGhyb3dTdGF0ZW1lbnR9O1xuZXhwb3J0IHtpc1RyeUNhdGNoU3RhdGVtZW50XzEzMDIgYXMgaXNUcnlDYXRjaFN0YXRlbWVudH07XG5leHBvcnQge2lzVHJ5RmluYWxseVN0YXRlbWVudF8xMzAzIGFzIGlzVHJ5RmluYWxseVN0YXRlbWVudH07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudF8xMzA0IGFzIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudH07XG5leHBvcnQge2lzV2hpbGVTdGF0ZW1lbnRfMTMwNSBhcyBpc1doaWxlU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNXaXRoU3RhdGVtZW50XzEzMDYgYXMgaXNXaXRoU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNQcmFnbWFfMTMwNyBhcyBpc1ByYWdtYX07XG5leHBvcnQge2lzQmxvY2tfMTMwOCBhcyBpc0Jsb2NrfTtcbmV4cG9ydCB7aXNDYXRjaENsYXVzZV8xMzA5IGFzIGlzQ2F0Y2hDbGF1c2V9O1xuZXhwb3J0IHtpc0RpcmVjdGl2ZV8xMzEwIGFzIGlzRGlyZWN0aXZlfTtcbmV4cG9ydCB7aXNGb3JtYWxQYXJhbWV0ZXJzXzEzMTEgYXMgaXNGb3JtYWxQYXJhbWV0ZXJzfTtcbmV4cG9ydCB7aXNGdW5jdGlvbkJvZHlfMTMxMiBhcyBpc0Z1bmN0aW9uQm9keX07XG5leHBvcnQge2lzRnVuY3Rpb25EZWNsYXJhdGlvbl8xMzEzIGFzIGlzRnVuY3Rpb25EZWNsYXJhdGlvbn07XG5leHBvcnQge2lzU2NyaXB0XzEzMTQgYXMgaXNTY3JpcHR9O1xuZXhwb3J0IHtpc1NwcmVhZEVsZW1lbnRfMTMxNSBhcyBpc1NwcmVhZEVsZW1lbnR9O1xuZXhwb3J0IHtpc1N1cGVyXzEzMTYgYXMgaXNTdXBlcn07XG5leHBvcnQge2lzU3dpdGNoQ2FzZV8xMzE3IGFzIGlzU3dpdGNoQ2FzZX07XG5leHBvcnQge2lzU3dpdGNoRGVmYXVsdF8xMzE4IGFzIGlzU3dpdGNoRGVmYXVsdH07XG5leHBvcnQge2lzVGVtcGxhdGVFbGVtZW50XzEzMTkgYXMgaXNUZW1wbGF0ZUVsZW1lbnR9O1xuZXhwb3J0IHtpc1N5bnRheFRlbXBsYXRlXzEzMjAgYXMgaXNTeW50YXhUZW1wbGF0ZX07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdGlvbl8xMzIxIGFzIGlzVmFyaWFibGVEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzVmFyaWFibGVEZWNsYXJhdG9yXzEzMjIgYXMgaXNWYXJpYWJsZURlY2xhcmF0b3J9O1xuZXhwb3J0IHtpc0VPRl8xMzIzIGFzIGlzRU9GfTtcbmV4cG9ydCB7aXNTeW50YXhEZWNsYXJhdGlvbl8xMzI0IGFzIGlzU3ludGF4RGVjbGFyYXRpb259O1xuZXhwb3J0IHtpc1N5bnRheHJlY0RlY2xhcmF0aW9uXzEzMjUgYXMgaXNTeW50YXhyZWNEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzRnVuY3Rpb25UZXJtXzEzMjYgYXMgaXNGdW5jdGlvblRlcm19O1xuZXhwb3J0IHtpc0Z1bmN0aW9uV2l0aE5hbWVfMTMyNyBhcyBpc0Z1bmN0aW9uV2l0aE5hbWV9O1xuZXhwb3J0IHtpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uXzEzMjggYXMgaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbn07XG5leHBvcnQge2lzRXhwb3J0U3ludGF4XzEzMjkgYXMgaXNFeHBvcnRTeW50YXh9O1xuZXhwb3J0IHtpc1N5bnRheERlY2xhcmF0aW9uU3RhdGVtZW50XzEzMzAgYXMgaXNTeW50YXhEZWNsYXJhdGlvblN0YXRlbWVudH07XG5leHBvcnQge2lzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbl8xMzMxIGFzIGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbn07XG5leHBvcnQge2lzQ29tcGlsZXRpbWVTdGF0ZW1lbnRfMTMzMiBhcyBpc0NvbXBpbGV0aW1lU3RhdGVtZW50fTtcbmV4cG9ydCB7aXNJbXBvcnREZWNsYXJhdGlvbl8xMzMzIGFzIGlzSW1wb3J0RGVjbGFyYXRpb259Il19