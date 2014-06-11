/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is jsfunfuzz.
 *
 * The Initial Developer of the Original Code is
 * Jesse Ruderman.
 * Portions created by the Initial Developer are Copyright (C) 2006-2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */




/********************
 * ENGINE DETECTION *
 ********************/

// jsfunfuzz is best run in a command-line shell.  It can also run in
// a web browser, but you might have trouble reproducing bugs that way.

var ENGINE_UNKNOWN = 0;
var ENGINE_SPIDERMONKEY = 1;
var ENGINE_JAVASCRIPTCORE = 2;
var ENGINE_NODE = 3;

var engine = ENGINE_UNKNOWN;
var jsshell = (typeof window == "undefined");
var isnode = (typeof exports !== 'undefined')
if (isnode) {
  engine = ENGINE_NODE;
  dump = console.log;
  dumpln = function(s) { dump(s + "\n"); }
  printImportant = function(s) { dumpln(s); }
} else if (jsshell) {
  dump = print;
  dumpln = print;
  printImportant = function(s) { dumpln("***"); dumpln(s); }
  if (typeof line2pc == "function") {
    engine = ENGINE_SPIDERMONKEY;
    version(180); // 170: make "yield" and "let" work. 180: sane for..in.
    options("anonfunfix");
  } else if (typeof debug == "function") {
    engine = ENGINE_JAVASCRIPTCORE;
  }
} else {
  if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf("WebKit") != -1) {
    engine = ENGINE_JAVASCRIPTCORE;
    // This worked in Safari 3.0, but it might not work in Safari 3.1.
    dump = function(s) { console.log(s); }
  } else if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf("Gecko") != -1) {
    engine = ENGINE_SPIDERMONKEY;
  } else if (typeof dump != "function") {
    // In other browsers, jsfunfuzz does not know how to log anything.
    dump = function() { };
  }
  dumpln = function(s) { dump(s + "\n"); }

  printImportant = function(s) {
    dumpln(s);
    var p = document.createElement("pre");
    p.appendChild(document.createTextNode(s));
    document.body.appendChild(p);
  }
}

if (typeof gc == "undefined")
  gc = function(){};

function simpleSource(s)
{
  function hexify(c)
  {
    var code = c.charCodeAt(0);
    var hex = code.toString(16);
    while (hex.length < 4)
      hex = "0" + hex;
    return "\\u" + hex;
  }

  if (typeof s == "string")
    return "\"" + s.replace(/\\/g, "\\\\")
                   .replace(/\"/g, "\\\"")
                   .replace(/\0/g, "\\0")
                   .replace(/\n/g, "\\n")
                   .replace(/[^ -~]/g, hexify) // not space (32) through tilde (126)
                   + "\"";
  else
    return "" + s; // hope this is right ;)  should work for numbers.
}

var haveRealUneval = (typeof uneval == "function");
if (!haveRealUneval)
  uneval = simpleSource;

if (engine == ENGINE_UNKNOWN)
  printImportant("Targeting an unknown JavaScript engine!");
else if (engine == ENGINE_SPIDERMONKEY)
  printImportant("Targeting SpiderMonkey / Gecko.");
else if (engine == ENGINE_JAVASCRIPTCORE)
  printImportant("Targeting JavaScriptCore / WebKit.");

function printAndStop(s)
{
  printImportant(s)
  if (jsshell)
    quit();
}


/***********************
 * AVOIDING KNOWN BUGS *
 ***********************/

function whatToTestSpidermonkey(code)
{
  return {

    // Exclude things here if decompiling the function causes a crash.
    allowDecompile: true
      && !(code.match( /for.*for.*in.*in/ )),         // avoid bug 376370

    // Exclude things here if decompiling returns something bogus that won't compile.
    checkRecompiling: true
      && (code.indexOf("#") == -1)                    // avoid bug 367731
      && !( code.match( /for.*\(.*in.*const/ )) // avoid bug 352083, with for loops or array comprehensions
      && !( code.match( /arguments.*\:\:/ ))       // avoid bug 355506
      && !( code.match( /\:.*for.*\(.*var.*\)/ ))  // avoid bug 352921
      && !( code.match( /\:.*for.*\(.*let.*\)/ ))  // avoid bug 352921
      && !( code.match( /do.*let.*while/ ))   // avoid bug 352421
      && !( code.match( /for.*let.*\).*function/ )) // avoid bug 352735 (more rebracing stuff)
      && !( code.match( /for.*\(.*\(.*in.*;.*;.*\)/ )) // avoid bug 353255
      && !( code.match( /new.*\.\./ )) // avoid bug 382339
      && !( code.match( /new.*\.\(/ )) // avoid bug 377059 most of the time
      && !( code.match( /while.*for.*in/ )) // avoid bug 381963
      ,

    // Exclude things here if decompiling returns something incorrect or non-canonical, but that will compile.
    checkForMismatch: true
      && !( code.match( /const.*if/ ))               // avoid bug 352985
      && !( code.match( /if.*const/ ))               // avoid bug 352985
      && !( code.match( /const.*arguments/ ))        // avoid bug 355480
      && !( code.match( /var.*arguments/ ))          // avoid bug 355480
      && !( code.match( /let.*,/ ))                  // avoid bug 382400
      && !( code.match( /for.*;.*;/ ))               // avoid bug 381195 :(
      && !( code.match( /\[.*\].*=.*\[.*=.*\]/ ))    // avoid bug 376558
      && !( code.match( /with.*try.*function/ ))     // avoid bug 418285
      && !( code.match( /if.*try.*function/ ))       // avoid bug 418285
      && (code.indexOf("-0") == -1)        // constant folding isn't perfect
      && (code.indexOf("-1") == -1)        // constant folding isn't perfect
      && (code.indexOf("default") == -1)   // avoid bug 355509 harder
      && (code.indexOf("delete") == -1)    // avoid bug 352027, which won't be fixed for a while :(
      && (code.indexOf("const") == -1)     // avoid bug 352985, bug 353020, and bug 355480 :(
      && (code.indexOf("import") == -1)    // avoid bug 350681
      && (code.indexOf("export") == -1)    // avoid bug 350681
      && (code.indexOf("?") == -1)         // avoid bug 355203
      && (code.indexOf("p.z") == -1)       // avoid bug 355672 (this is the most common trigger)

      // avoid bug 352085: keep operators that coerce to number (or integer)
      // at constant-folding time (?) away from strings
      &&
           (
             (code.indexOf("\"") == -1 && code.indexOf("\'") == -1)
             ||
             (
                  (code.indexOf("%")  == -1)
               && (code.indexOf("/")  == -1)
               && (code.indexOf("*")  == -1)
               && (code.indexOf("-")  == -1)
               && (code.indexOf(">>") == -1)
               && (code.indexOf("<<") == -1)
             )
          )
      ,

    allowExec: true
      && code.indexOf("for..in")  == -1 // for (x.y in x) causes infinite loops :(
      && code.indexOf("finally")  == -1 // avoid bug 380018 and bug 381107 :(
      && code.indexOf("valueOf")  == -1 // avoid bug 355829
      && code.indexOf("<>")       == -1 // avoid bug 334628, hopefully
      && (jsshell || code.indexOf("nogeckoex") == -1)
      && !( code.match( /delete.*Function/ )) // avoid bug 352604 (exclusion needed despite the realFunction stuff?!)
      && !( code.match( /function.*::.*=/ )) // avoid ????
      ,

    allowIter: true,

    checkUneval: true
      // exclusions won't be perfect, since functions can return things they don't
      // appear to contain, e.g. with "return x;"
      && (code.indexOf("<") == -1 || code.indexOf(".") == -1)  // avoid bug 379525
      && (code.indexOf("<>") == -1)                            // avoid bug 334628
      && code.indexOf("RegExp") == -1                          // avoid bug 362582
  };
}


function whatToTestJavaScriptCore(code)
{
  return {

    // Exclude things here if decompiling the function causes a crash.
    allowDecompile: true,

    checkRecompiling: true,

    checkForMismatch: true
      && !code.match( /new.*\(.*\).*\./ )      // avoid bug 17931
      && !code.match( /new.*\(.*\).*\[/ )      // avoid bug 17931
      ,

    allowExec: true
      && !code.match(/with.*const/)            // avoid bug 17924
      && !code.match(/catch.*const/)           // avoid bug 17924
      && !code.match(/break.*finally/)         // avoid bug 17932
      && !code.match(/continue.*finally/)      // avoid bug 17932
      ,

    allowIter: false, // JavaScriptCore does not support |yield| and |Iterator|

    checkUneval: false // JavaScriptCore does not support |uneval|

  };
}

function whatToTestGeneric(code)
{
  return {
    allowDecompile: true,
    checkRecompiling: true,
    checkForMismatch: true,
    allowExec: true,
    allowIter: ("Iterator" in this),
    checkUneval: haveRealUneval
  };
}

if (engine == ENGINE_SPIDERMONKEY)
  whatToTest = whatToTestSpidermonkey;
else if (engine == ENGINE_JAVASCRIPTCORE)
  whatToTest = whatToTestJavaScriptCore;
else
  whatToTest = whatToTestGeneric;





/*******************
 * DRIVING & TESTS *
 *******************/

var allMakers = [];
function totallyRandom(depth) {
  var dr = depth + (rnd(5) - 2); // !

  return (rndElt(allMakers))(dr);
}

function init()
{
  for (var f in exports)
    if (f.indexOf("make") == 0 && typeof exports[f] == "function")
      allMakers.push(exports[f]);
}

function start()
{
  init();
  // dumpln(uneval([f.name for each (f in allMakers)]));

  count = 0;

  if (jsshell) {
    // Number of iterations: 20000 is good for use with multi_timed_run.py.  (~40 seconds on a PowerBook G4; reduction isn't bad.)
    // Raise for use without multi_timed_run.py (perhaps to Infinity).
    // Lower for use with WAY_TOO_MUCH_GC, to 70 or so.
    for (var i = 0; i < 20000; ++i)
      testOne();
    dumpln("It's looking good!"); // Magic string that multi_timed_run.py looks for
  } else {
    setTimeout(testStuffForAWhile, 200);
  }
}

function testStuffForAWhile()
{
  for (var j = 0; j < 100; ++j)
    testOne();

  if (count % 10000 < 100)
    printImportant("Iterations: " + count);

  setTimeout(testStuffForAWhile, 30);
}

function testOne()
{
  ++count;

  var code = makeStatement(8);

//  if (rnd(10) == 1) {
//    var dp = "/*infloop-deParen*/" + rndElt(deParen(code));
//    if (dp)
//      code = dp;
//  }
  dumpln("count=" + count + "; tryItOut(" + uneval(code) + ");");

  tryItOut(code);
}


function tryItOut(code)
{
  // regexps can't match across lines, so strip line breaks.
  var wtt = whatToTest(code.replace(/\n/g, " ").replace(/\r/g, " "));

  // This section applies to all engines, so it should only be used for avoiding hangs.
  wtt.allowExec = wtt.allowExec
    && code.indexOf("infloop") == -1
    && !( code.match( /const.*for/ )) // can be an infinite loop: function() { const x = 1; for each(x in ({a1:1})) dumpln(3); }
    && !( code.match( /for.*const/ )) // can be an infinite loop: for each(x in ...); const x;
    && !( code.match( /for.*in.*uneval/ )) // can be slow to loop through the huge string uneval(this), for example
    && !( code.match( /for.*for.*for.*for.*for/ )) // nested for loops (array comprehensions, etc) can take a while
    ;


  if(verbose) {
    dumpln("Verbose, count: " + count);
    dumpln("allowExec=" + wtt.allowExec + ", allowDecompile=" + wtt.allowDecompile + ", checkRecompiling=" + wtt.checkRecompiling + ", checkForMismatch=" + wtt.checkForMismatch + ", allowIter=" + wtt.allowIter + ", checkUneval=" + wtt.checkUneval);
  }

  // tryHalves(code);

  var f = tryCompiling(code, wtt.allowExec);


  if (0) {
    if (wtt.allowExec && ('sandbox' in this)) {
      f = null;
      if (trySandboxEval(code, false)) {
        dumpln("Trying it again to see if it's a 'real leak' (???)")
        trySandboxEval(code, true);
      }
    }
    return;
  }

  if (f && wtt.allowDecompile) {
    tryRoundTripStuff(f, code, wtt.checkRecompiling, wtt.checkForMismatch);
  }

  var rv = null;
  if (wtt.allowExec && f) {
    rv = tryRunning(f);
    tryEnsureSanity();

    if (0 && engine == ENGINE_SPIDERMONKEY) {
      tryTestDVG(code);
      tryEnsureSanity();
    }
  }

  if (wtt.allowIter && rv && typeof rv == "object") {
    tryIteration(rv);
    tryEnsureSanity();
  }

  // "checkRecompiling && checkForMismatch" here to catch returned functions
  if (wtt.checkRecompiling && wtt.checkForMismatch && wtt.checkUneval && rv && typeof rv == "object") {
    testUneval(rv);
  }

  if (count % 1000 == 0) {
    dumpln("Paranoid GC!")
    dumpln(count);
    realGC();
  }

  if(verbose)
    dumpln("Done trying out that function!");

  dumpln("");
}

function tryTestDVG(code)
{
  var fullCode = "(function() { try { \n" + code + "\n; throw 1; } catch(exx) { this.nnn.nnn } })()";

  try {
    eval(fullCode);
  } catch(e) {
    if (e.message != "this.nnn is undefined") {
      printAndStop("Wrong error message: " + e);
    }
  }
}




function tryCompiling(code, allowExec)
{
  try {

    // Try two methods of creating functions, just in case there are differences.
    if (count % 2 == 0 && allowExec) {
      if (verbose)
        dumpln("About to compile, using eval hack.")
      return eval("(function(){" + code + "});"); // Disadvantage: "}" can "escape", allowing code to *execute* that we only intended to compile.  Hence the allowExec check.
    }
    else {
      if (verbose)
        dumpln("About to compile, using new Function.")
      return new Function(code);
    }
  } catch(compileError) {
    dumpln("Compiling threw: " + errorToString(compileError));
    return null;
  }
}


function trySandboxEval(code, isRetry)
{
  // (function(){})() wrapping allows "return" when it's allowed outside.
  // The line breaks are to allow single-line comments within code ("//" and "<!--").

  if (!sandbox) {
    sandbox = evalcx("");
  }

  var rv = null;
  try {
    rv = evalcx("(function(){\n" + code + "\n})();", sandbox);
  } catch(e) {
    rv = "Error from sandbox: " + errorToString(e);
  }

  try {
    if (typeof rv != "undefined")
      dumpln(rv);
  } catch(e) {
    dumpln("Sandbox error printing: " + errorToString(e));
  }
  rv = null;

  if (1 || count % 100 == 0) { // count % 100 *here* is sketchy.
    dumpln("Done with this sandbox.");
    sandbox = null;
    gc();
    var currentHeapCount = countHeap()
    dumpln("countHeap: " + currentHeapCount);
    if (currentHeapCount > maxHeapCount) {
      if (maxHeapCount != 0)
        dumpln("A new record by " + (currentHeapCount - maxHeapCount) + "!");
      if (isRetry)
        throw new Error("Found a leak!");
      maxHeapCount = currentHeapCount;
      return true;
    }
  }

  return false;
}



function tryRoundTripStuff(f, code, checkRecompiling, checkForMismatch)
{
  if (verbose)
    dumpln("About to do the 'toString' round-trip test");

  // Functions are prettier with line breaks, so test toString before uneval.
  checkRoundTripToString(f, code, checkRecompiling, checkForMismatch);

  if (checkRecompiling && checkForMismatch && engine == ENGINE_SPIDERMONKEY) {
    try {
      checkForExtraParens(f, code);
    } catch(e) { /* bug 355667 is annoying here too */ }
  }

  if (haveRealUneval) {
    if (verbose)
      dumpln("About to do the 'uneval' round-trip test");
    checkRoundTripUneval(f, code, checkRecompiling, checkForMismatch);
  }
}


function tryRunning(f)
{
  try {
    if (verbose)
      dumpln("About to run it!");
    rv = f();
    if (verbose)
      dumpln("It ran!");
    return rv;
  } catch(runError) {
    if(verbose)
      dumpln("Running threw!  About to toString to error.");
    dumpln("Running threw: " + errorToString(runError));
    return null;
  }
}

// Store things now so we can restore sanity later.
var realEval = eval;
var realFunction = Function;
var realGC = gc;

function tryEnsureSanity()
{
  // At least one bug in the past has put exceptions in strange places.  This also catches "eval getter" issues.
  try { eval("") } catch(e) { dumpln("That really shouldn't have thrown: " + errorToString(e)); }

  // Restore important stuff that might have been broken as soon as possible :)

  if ('unwatch' in this) {
    this.unwatch("eval")
    this.unwatch("Function")
    this.unwatch("gc")
  }

  if ('__defineSetter__' in this) {
    // The only way to get rid of getters/setters is to delete the property.
    delete eval;
    // delete Function; // doh, this triggers bug 352604!
    delete gc;
  }

  eval = realEval;
  Function = realFunction;
  gc = realGC;

  // These can fail if the page creates a getter for "eval", for example.
  if (!eval)
    printImportant("WTF did my |eval| go?");
  if (eval != realEval)
    printImportant("WTF did my |eval| get replaced by?")
  if (Function != realFunction)
    printImportant("WTF did my |Function| get replaced by?")
}

function tryIteration(rv)
{
  try {
    if (!(Iterator(rv) === rv))
      return; // not an iterator
  }
  catch(e) {
    // Is it a bug that it's possible to end up here?  Probably not!
    dumpln("Error while trying to determine whether it's an iterator!");
    dumpln("The error was: " + e);
    return;
  }

  dumpln("It's an iterator!");
  try {
    var iterCount = 0;
    var iterValue;
    // To keep Safari-compatibility, don't use "let", "each", etc.
    for /* each */ ( /* let */ iterValue in rv)
      ++iterCount;
    dumpln("Iterating succeeded, iterCount == " + iterCount);
  } catch (iterError) {
    dumpln("Iterating threw!");
    dumpln("Iterating threw: " + errorToString(iterError));
  }
}







function testUneval(o)
{
  // If it happens to return an object, especially an array or hash,
  // let's test uneval.  Note that this is a different code path than decompiling
  // an array literal within a function, although the two code paths often have
  // similar bugs!

  var uo, euo, ueuo;

  try {
    uo = uneval(o);
  } catch(e) {
    if (errorToString(e).indexOf("called on incompatible") != -1) {
      dumpln("Ignoring bug 379528!".toUpperCase());
      return;
    }
    else
      throw e;
  }


  if (uo == "({})") {
    // ?
    return;
  }


  var uowlb = uo.replace(/\n/g, " ").replace(/\r/g, " ");

  dumpln("uneval returned the string: " + uo);
  if (    true

      &&  uo.indexOf("[native code]") == -1                // ignore bug 384756
      &&  uo.indexOf(":<") == -1  // ignore the combination of bug 334628 with bug 379519(a)
      && (uo.indexOf("#") == -1 || uo.indexOf("<") == -1)  // ignore bug 379519(b)
      && (uo.indexOf("#") == -1)                           // ignore bug 328745 (ugh)
      && (uo.indexOf("{") == -1 || uo.indexOf(":") == -1)  // ignore bug 379525 hard (ugh!)
      &&  uo.indexOf("NaN") == -1                          // ignore bug 379521
      &&  uo.indexOf("Infinity") == -1                     // ignore bug 379521
      &&  uo.indexOf("[,") == -1                           // avoid  bug 379551
      &&  uo.indexOf(", ,") == -1                          // avoid  bug 379551
      &&  uo.indexOf(",]") == -1                           // avoid  bug 334628 / bug 379525?
      &&  uo.indexOf("[function") == -1                    // avoid  bug 380379?
      &&  uo.indexOf("[(function") == -1                   // avoid  bug 380379?
      &&  uo.indexOf("new Error") == -1                    // ignore bug 380578
      && !uowlb.match(/<.*\/.*>.*<.*\/.*>/)                // ignore bug 334628
      && !(uo == "{}" && !jsshell)                         // ignore bug 380959
     )
  {
    // count=946; tryItOut("return (({ set x x (x) { yield  /x/g  } , x setter: ({}).hasOwnProperty }));");
    uo = uo.replace(/\[native code\]/g, "");

    try {
      euo = eval(uo); // if this throws, something's wrong with uneval, probably
    } catch(e) {
      dumpln("The string returned by uneval failed to eval!");
      printAndStop(e);
      return;
    }
    ueuo = uneval(euo);
    if (ueuo != uo) {
      printAndStop("Mismatch with uneval/eval on the function's return value! " + "\n" + uo + "\n" + ueuo);
    }
  } else {
    dumpln("Skipping re-eval test");
  }
}



function tryHalves(code)
{
  // See if there are any especially horrible bugs that appear when the parser has to start/stop in the middle of something. this is kinda evil.

  // Stray "}"s are likely in secondHalf, so use new Function rather than eval.  "}" can't escape from new Function :)

  var f, firstHalf, secondHalf;

  try {

    firstHalf = code.substr(0, code.length / 2);
    if (verbose)
      dumpln("First half: " + firstHalf);
    f = new Function(firstHalf);
    "" + f;
  }
  catch(e) {
    if (verbose)
      dumpln("First half compilation error: " + e);
  }

  try {
    secondHalf = code.substr(code.length / 2, code.length);
    if (verbose)
      dumpln("Second half: " + secondHalf);
    f = new Function(secondHalf);
    "" + f;
  }
  catch(e) {
    if (verbose)
      dumpln("Second half compilation error: " + e);
  }
}

function errorToString(e)
{
  try {
    return ("" + e);
  } catch (e2) {
    return "Can't toString the error!!";
  }
}



// Function round-trip with implicit toString
function checkRoundTripToString(f, code, checkRecompiling, checkForMismatch)
{
  var uf, g;
  try {
    uf = "" + f;
  } catch(e) { reportRoundTripIssue("Round-trip with implicit toString: can't toString", code, null, null, errorToString(e)); return; }

  checkForCookies(uf);

  if (checkRecompiling) {
    try {
      g = eval("(" + uf + ")");
      if (checkForMismatch && (""+g) != (""+f) ) {
        reportRoundTripIssue("Round-trip with implicit toString", code, f, g, "mismatch");
      }
    } catch(e) {
      reportRoundTripIssue("Round-trip with implicit toString: error", code, f, g, errorToString(e));
    }
  }
}

// Function round-trip with uneval
function checkRoundTripUneval(f, code, checkRecompiling, checkForMismatch)
{
  var g, uf, ug;
  try {
    uf = uneval(f);
  } catch(e) { reportRoundTripIssue("Round-trip with uneval: can't uneval", code, null, null, errorToString(e)); return; }

  checkForCookies(uf)

  if (checkRecompiling) {
    try {
      g = eval("(" + uf + ")");
      ug = uneval(g);
      if (checkForMismatch && ug != uf) {
        reportRoundTripIssue("Round-trip with uneval: mismatch", code, uf, ug, "mismatch");
      }
    } catch(e) { reportRoundTripIssue("Round-trip with uneval: error", code, uf, ug, errorToString(e)); }
  }
}

function checkForCookies(code)
{
  // http://lxr.mozilla.org/seamonkey/source/js/src/jsopcode.c#1613
  // These are things that shouldn't appear in decompilations.
  if (code.indexOf("/*EXCEPTION") != -1
   || code.indexOf("/*RETSUB") != -1
   || code.indexOf("/*FORELEM") != -1
   || code.indexOf("/*WITH") != -1)
    printAndStop(code)
}

function reportRoundTripIssue(issue, code, fs, gs, e)
{
  if (e.indexOf("missing variable name") != -1) {
    dumpln("Bug 355667 sure is annoying!");
    return;
  }

  var message = issue + "\n\n" +
                "Code: " + uneval(code) + "\n\n" +
                "fs: " + fs + "\n\n" +
                "gs: " + gs + "\n\n" +
                "error: " + e;

  printAndStop(message);
}



function extractCode(f)
{
  // throw away the first and last lines of the function's string representation
  // (this happens to work on spidermonkey trunk, dunno about anywhere else)
  var uf = "" + f;
  var lines = uf.split("\n");
  var innerLines = lines.slice(1, -1);
  return innerLines.join("\n");
}

function compiles(code)
{
  try {
    new Function(code);
    return true;
  } catch(e) {
    return false;
  }
}

// Returns an array of strings of length (code.length-2),
// each having one pair of matching parens removed.
// Assumes all parens in code are significant.  This assumption fails
// for strings or regexps, but whatever.
function deParen(code)
{
  // Get a list of locations of parens.
  var parenPairs = []; // array of { left : int, right : int } (indices into code string)
  var unmatched = []; // stack of indices into parenPairs

  var i, c;

  for (i = 0; i < code.length; ++i) {
    c = code.charCodeAt(i);
    if (c == 40) {
      // left paren
      unmatched.push(parenPairs.length);
      parenPairs.push({ left: i });
    } else if (c == 41) {
      // right paren
      if (unmatched.length == 0)
        return []; // eep! unmatched rparen!
      parenPairs[unmatched.pop()].right = i;
    }
  }

  if (unmatched.length > 0)
    return []; // eep! unmatched lparen!

  var rs = [];

  // Don't add spaces in place of the parens, because we don't
  // want to detect things like (5).x as being unnecessary use
  // of parens.

  for (i = 0; i < parenPairs.length; ++i) {
    var left = parenPairs[i].left, right = parenPairs[i].right;
    rs.push(
        code.substr(0, left)
      + code.substr(left + 1, right - (left + 1))
      + code.substr(right + 1)
    );
  }

  return rs;
}

// print(uneval(deParen("for (i = 0; (false); ++i) { x(); }")));
// print(uneval(deParen("[]")));

function checkForExtraParens(f, code)
{
  var code = code.replace(/\n/g, " ").replace(/\r/g, " "); // regexps can't match across lines

  var uf = "" + f;

  // numbers get more parens than they need
  if (uf.match(/\(\d/)) return;

  if (uf.indexOf("(<") != -1) return; // bug 381204
  if (uf.indexOf(".(") != -1) return; // bug 381207
  if (uf.indexOf("else if") != -1) return; // bug 381742
  if (code.indexOf("new") != -1) return; // "new" is weird. what can i say?
  if (code.indexOf("let") != -1) return; // reasonable to overparenthesize "let" (see expclo#c33)
  if (code.match(/for.*in.*=/)) return; // bug 381213
  if (code.match(/\:.*function/)) return; // why?
  if (uf.indexOf("(function") != -1) return; // expression closures over-parenthesize

  if (code.match(/for.*yield/)) return; // why?
  if (uf.indexOf("= (yield") != -1) return;
  if (uf.indexOf(":(yield") != -1) return;
  if (uf.indexOf(": (yield") != -1) return;
  if (uf.indexOf(", (yield") != -1) return;
  if (uf.indexOf("[(yield") != -1) return;
  if (uf.indexOf("yield") != -1) return; // i give up on yield

  // Sanity check
  var euf = eval("(" + uf + ")");
  var ueuf = "" + euf;
  if (ueuf != uf)
    printAndStop("Shouldn't the earlier round-trip test have caught this?");

  var dps = deParen(uf);
  // skip the first, which is the function's formal params.

  for (i = 1; i < dps.length; ++i) {
    var uf2 = dps[i];

    try {
      var euf2 = eval("(" + uf2 + ")");
    } catch(e) { /* print("The latter did not compile.  That's fine."); */ continue; }

    var ueuf2 = "" + euf2

    if (ueuf2 == ueuf) {
      print(uf);
      print("    vs    ");
      print(uf2);
      print("Both decompile as:");
      print(ueuf);
      printAndStop("Unexpected match!!!  Extra parens!?");
    }
  }
}



/**************
 * RANDOMNESS *
 **************/

function rnd(n)
{
  return Math.floor(Math.random() * n);
}

function rndElt(a)
{
  return a[rnd(a.length)];
}



/**************************
 * TOKEN-LEVEL GENERATION *
 **************************/


// Each input to |cat| should be a token or so, OR a bigger logical piece (such as a call to makeExpr).  Smaller than a token is ok too ;)

// When "torture" is true, it may do any of the following:
// * skip a token
// * skip all the tokens to the left
// * skip all the tokens to the right
// * insert unterminated comments
// * insert line breaks
// * insert entire expressions
// * insert any token

// Even when not in "torture" mode, it may sneak in extra line breaks.

// Why did I decide to toString at every step, instead of making larger and larger arrays (or more and more deeply nested arrays?).  no particular reason...

function cat(toks)
{
  if (rnd(170) == 0)
    return totallyRandom(2);

  var torture = (rnd(170) == 57);
  if (torture)
    dumpln("Torture!!!");

  var s = maybeLineBreak();
  for (var i = 0; i < toks.length; ++i) {

    // Catch bugs in the fuzzer.  An easy mistake is
    //   return /*foo*/ + ...
    // instead of
    //   return "/*foo*/" + ...
    // Unary plus in the first one coerces the string that follows to number!
    if(typeof(toks[i]) != "string") {
      dumpln("Strange item in the array passed to Tmean: toks[" + i + "] == " + toks[i]);
      dumpln(Tmean.caller)
      dumpln(Tmean.caller.caller)
      printAndStop('yarr')
    }

    if (!(torture && rnd(12) == 0))
      s += toks[i];

    s += maybeLineBreak();

    if (torture) switch(rnd(120)) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
        s += maybeSpace() + totallyRandom(2) + maybeSpace();
        break;
      case 5:
        s = "(" + s + ")"; // randomly parenthesize some *prefix* of it.
        break;
      case 6:
        s = ""; // throw away everything before this point
        break;
      case 7:
        return s; // throw away everything after this point
      case 8:
        s += UNTERMINATED_COMMENT;
        break;
      case 9:
        s += UNTERMINATED_STRING_LITERAL;
        break;
      case 10:
        if (rnd(2))
          s += "(";
        s += UNTERMINATED_REGEXP_LITERAL;
        break;
      default:
    }

  }

  return s;
}

// For reference and debugging.
/*
function catNice(toks)
{
  var s = ""
  var i;
  for (i=0; i<toks.length; ++i) {
    if(typeof(toks[i]) != "string")
      printAndStop("Strange toks[i]: " + toks[i]);

    s += toks[i];
  }

  return s;
}
*/


var UNTERMINATED_COMMENT = "/*"; /* this comment is here so my text editor won't get confused */
var UNTERMINATED_STRING_LITERAL = "'";
var UNTERMINATED_REGEXP_LITERAL = "/";

function maybeLineBreak()
{
  if (rnd(900) == 3)
    return rndElt(["\r", "\n", "//h\n", "/*\n*/"]); // line break to trigger semicolon insertion and stuff
  else if (rnd(400) == 3)
    return rnd(2) ? "\u000C" : "\t"; // weird space-like characters
  else
    return "";
}

function maybeSpace()
{
  if (rnd(2) == 0)
    return " ";
  else
    return "";
}

function stripSemicolon(c)
{
  var len = c.length;
  if (c.charAt(len - 1) == ";")
    return c.substr(0, len - 1);
  else
    return c;
}




/*************************
 * HIGH-LEVEL GENERATION *
 *************************/


var TOTALLY_RANDOM = 100;

exports.makeStatement = makeStatement;
function makeStatement(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = rnd(depth); // instead of depth - 1;

  if (depth < rnd(8)) // frequently for small depth, infrequently for large depth
    return makeLittleStatement(dr);

  return (rndElt(statementMakers))(dr)
}

var varBinder = ["var ", "let ", "const ", ""];

var statementMakers = [
  // Late-defined consts can cause problems, so let's late-define them!
  function(dr) { return cat([makeStatement(dr), " const ", makeId(dr), ";"]); },

  function(dr) { return cat([makeStatement(dr), makeStatement(dr)]); },
  function(dr) { return cat([makeStatement(dr-1), "\n", makeStatement(dr-1), "\n"]); },

  // Stripping semilcolons.  What happens if semicolons are missing?  Especially with line breaks used in place of semicolons (semicolon insertion).
  function(dr) { return cat([stripSemicolon(makeStatement(dr)), "\n", makeStatement(dr)]); },
  function(dr) { return cat([stripSemicolon(makeStatement(dr)), "\n"                   ]); },
  function(dr) { return stripSemicolon(makeStatement(dr)); }, // usually invalid, but can be ok e.g. at the end of a block with curly braces

  // Blocks and loops
  function(dr) { return cat(["{", makeStatement(dr), " }"]); },
  function(dr) { return cat(["{", makeStatement(dr-1), makeStatement(dr-1), " }"]); },

  function(dr) { return cat([maybeLabel(), "with", "(", makeExpr(dr), ")", makeStatementOrBlock(dr)]); },
  function(dr) { return cat([maybeLabel(), "with", "(", "{", makeId(dr), ": ", makeExpr(dr), "}", ")", makeStatementOrBlock(dr)]); },

  // C-style "for" loops
  // Two kinds of "for" loops: one with an expression as the first part, one with a var or let binding 'statement' as the first part.
  // I'm not sure if arbitrary statements are allowed there; I think not.
  function(dr) { return "/*infloop*/" + cat([maybeLabel(), "for", "(", makeExpr(dr), "; ", makeExpr(dr), "; ", makeExpr(dr), ") ", makeStatementOrBlock(dr)]); },
  function(dr) { return "/*infloop*/" + cat([maybeLabel(), "for", "(", rndElt(varBinder), makeId(dr),                                       "; ", makeExpr(dr), "; ", makeExpr(dr), ") ", makeStatementOrBlock(dr)]); },
  function(dr) { return "/*infloop*/" + cat([maybeLabel(), "for", "(", rndElt(varBinder), makeDestructuringLValue(dr), " = ", makeExpr(dr), "; ", makeExpr(dr), "; ", makeExpr(dr), ") ", makeStatementOrBlock(dr)]); },

  // "for..in" loops

  // -- for (key in obj)
  function(dr) { return "/*for..in*/" + cat([maybeLabel(), "for", "(", rndElt(varBinder), makeForInLHS(dr), " in ", makeExpr(dr-2), ") ", makeStatementOrBlock(dr)]); },
  // -- for (key in generator())
  function(dr) { return "/*for..in*/" + cat([maybeLabel(), "for", "(", rndElt(varBinder), makeForInLHS(dr), " in ", "(", "(", makeFunction(dr), ")", "(", makeExpr(dr), ")", ")", ")", makeStatementOrBlock(dr)]); },
  // -- for each (value in obj)
  function(dr) { return "/*for..in*/" + "/* nogeckoex bug 349964 */" + cat([maybeLabel(), " for ", " each", "(", rndElt(varBinder), makeLValue(dr), " in ", makeExpr(dr-2), ") ", makeStatementOrBlock(dr)]); },

  // Modify something during a loop -- perhaps the thing being looped over
  // Since we use "let" to bind the for-variables, and only do wacky stuff once, I *think* this is unlikely to hang.
//  function(dr) { return "let forCount = 0; for (let " + makeId(dr) + " in " + makeExpr(dr) + ") { if (forCount++ == " + rnd(3) + ") { " + makeStatement(dr-1) + " } }"; },

  // Hoisty "for..in" loops.  I don't know why this construct exists, but it does, and it hoists the initial-value expression above the loop.
  // With "var" or "const", the entire thing is hoisted.
  // With "let", only the value is hoisted, and it can be elim'ed as a useless statement.
  function(dr) { return "/*for..in*/" + cat([maybeLabel(), "for", "(", rndElt(varBinder), makeId(dr), " = ", makeExpr(dr), " in ", makeExpr(dr-2), ") ", makeStatementOrBlock(dr)]); },
  function(dr) { return "/*for..in*/" + cat([maybeLabel(), "for", "(", rndElt(varBinder), "[", makeId(dr), ", ", makeId(dr), "]", " = ", makeExpr(dr), " in ", makeExpr(dr-2), ") ", makeStatementOrBlock(dr)]); },

  function(dr) { return cat([maybeLabel(), "while((", makeExpr(dr), ") && 0)" /*don't split this, it's needed to avoid marking as infloop*/, makeStatementOrBlock(dr)]); },
  function(dr) { return "/*infloop*/" + cat([maybeLabel(), "while", "(", makeExpr(dr), ")", makeStatementOrBlock(dr)]); },
  function(dr) { return cat([maybeLabel(), "do ", makeStatementOrBlock(dr), " while((", makeExpr(dr), ") && 0)" /*don't split this, it's needed to avoid marking as infloop*/, ";"]); },
  function(dr) { return "/*infloop*/" + cat([maybeLabel(), "do ", makeStatementOrBlock(dr), " while", "(", makeExpr(dr), ");"]); },

  // Switch statement
  function(dr) { return cat([maybeLabel(), "switch", "(", makeExpr(dr), ")", " { ", makeSwitchBody(dr), " }"]); },

  // Let blocks, with and without multiple bindings, with and without initial values
  function(dr) { return cat(["let ", "(", makeLetHead(dr), ")", " { ", makeStatement(dr), " }"]); },

  // Conditionals, perhaps with 'else if' / 'else'
  function(dr) { return cat([maybeLabel(), "if(", makeExpr(dr), ") ", makeStatementOrBlock(dr)]); },
  function(dr) { return cat([maybeLabel(), "if(", makeExpr(dr), ") ", makeStatementOrBlock(dr-1), " else ", makeStatementOrBlock(dr-1)]); },
  function(dr) { return cat([maybeLabel(), "if(", makeExpr(dr), ") ", makeStatementOrBlock(dr-1), " else ", " if ", "(", makeExpr(dr), ") ", makeStatementOrBlock(dr-1)]); },
  function(dr) { return cat([maybeLabel(), "if(", makeExpr(dr), ") ", makeStatementOrBlock(dr-1), " else ", " if ", "(", makeExpr(dr), ") ", makeStatementOrBlock(dr-1), " else ", makeStatementOrBlock(dr-1)]); },

  // A tricky pair of if/else cases.
  // In the SECOND case, braces must be preserved to keep the final "else" associated with the first "if".
  function(dr) { return cat([maybeLabel(), "if(", makeExpr(dr), ") ", "{", " if ", "(", makeExpr(dr), ") ", makeStatementOrBlock(dr-1), " else ", makeStatementOrBlock(dr-1), "}"]); },
  function(dr) { return cat([maybeLabel(), "if(", makeExpr(dr), ") ", "{", " if ", "(", makeExpr(dr), ") ", makeStatementOrBlock(dr-1), "}", " else ", makeStatementOrBlock(dr-1)]); },

  // Exception-related statements :)
  function(dr) { return makeExceptionyStatement(dr-1); makeExceptionyStatement(dr-1); },
  function(dr) { return makeExceptionyStatement(dr-1); makeExceptionyStatement(dr-1); },
  function(dr) { return makeExceptionyStatement(dr); },
  function(dr) { return makeExceptionyStatement(dr); },
  function(dr) { return makeExceptionyStatement(dr); },
  function(dr) { return makeExceptionyStatement(dr); },
  function(dr) { return makeExceptionyStatement(dr); },

  // Labels. (JavaScript does not have goto, but it does have break-to-label and continue-to-label).
  function(dr) { return cat(["L", ": ", makeStatementOrBlock(dr)]); },

  // Functions which are called?
  // Tends to trigger OOM bugs
  // function(dr) { return cat(["/*hhh*/function ", "x", "(", ")", "{", makeStatement(dr), "}", " ", "x", "(", makeActualArgList(dr), ")"]); }
];

function maybeLabel()
{
  if (rnd(4) == 1)
    return cat([rndElt(["L", "M"]), ":"]);
  else
    return "";
}




exports.makeSwitchBody = makeSwitchBody;
function makeSwitchBody(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var haveSomething = false;
  var haveDefault = false;
  var output = "";

  do {

    if (!haveSomething || rnd(2)) {
      // Want a case/default (or, if this is the beginning, "need").

      if (!haveDefault && rnd(2)) {
        output += "default: ";
        haveDefault = true;
      }
      else {
        // cases with numbers (integers?) have special optimizations that affect order when decompiling,
        // so be sure to test those well in addition to testing complicated expressions.
        output += "case " + (rnd(2) ? rnd(10) : makeExpr(depth)) + ": ";
      }

      haveSomething = true;
    }

    // Might want a statement.
    if (rnd(2))
      output += makeStatement(depth)

    // Might want to break, or might want to fall through.
    if (rnd(2))
      output += "break; ";

    if (rnd(2))
      --depth;

  } while (depth && rnd(5));

  return output;
}

exports.makeLittleStatement = makeLittleStatement;
function makeLittleStatement(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = depth - 1;

  if (rnd(4) == 1)
    return makeStatement(dr);

  return (rndElt(littleStatementMakers))(dr);
}

var littleStatementMakers =
[
  // Tiny
  function(dr) { return cat([";"]); }, // e.g. empty "if" block
  function(dr) { return cat(["{", "}"]); ; }, // e.g. empty "if" block
  function(dr) { return cat([""]); },

  // Force garbage collection
  function(dr) { return "gc()"; },

  // Throw stuff.
  function(dr) { return cat(["throw ", makeExpr(dr), ";"]); },

  // Break/continue [to label].
  function(dr) { return cat([rndElt(["continue", "break"]), " ", rndElt(["L", "M", "", ""]), ";"]); },

  // Import and export.  (I have not idea what these actually do.)
  function(dr) { return cat(["export ", makeId(dr), ";"]); },
  function(dr) { return cat(["export ", "*", ";"]); },
  function(dr) { return cat(["import ", makeId(dr), ".", makeId(dr), ";"]); },
  function(dr) { return cat(["import ", makeId(dr), ".", "*", ";"]); },

  // Named and unnamed functions (which have different behaviors in different places: both can be expressions,
  // but unnamed functions "want" to be expressions and named functions "want" to be special statements)
  function(dr) { return makeFunction(dr); },

  // Return, yield
  function(dr) { return cat(["return ", makeExpr(dr), ";"]); },
  function(dr) { return "return;"; }, // return without a value is allowed in generators; return with a value is not.
  function(dr) { return cat(["yield ", makeExpr(dr), ";"]); }, // note: yield can also be a left-unary operator, or something like that
  function(dr) { return "yield;"; },

  // Expression statements
  function(dr) { return cat([makeExpr(dr), ";"]); },
  function(dr) { return cat(["(", makeExpr(dr), ")", ";"]); },

  // Various kinds of variable declarations, with and without initial values (assignment).
  function(dr) { return cat([rndElt(varBinder), makeLetHead(dr), ";"]); }, // e.g. "const [a,b] = [3,4];"
  function(dr) { return cat([rndElt(varBinder), makeLetHead(dr), ";"]); }, // e.g. "const [a,b] = [3,4];"
  function(dr) { return cat([rndElt(varBinder), makeLetHead(dr), ";"]); }, // e.g. "const [a,b] = [3,4];"
];


// makeStatementOrBlock exists because often, things have different behaviors depending on where there are braces.
// for example, if braces are added or removed, the meaning of "let" can change.
exports.makeStatementOrBlock = makeStatementOrBlock;
function makeStatementOrBlock(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = depth - 1;
  return (rndElt(statementBlockMakers))(dr)
}
var statementBlockMakers = [
  function(dr) { return makeStatement(dr); },
  function(dr) { return makeStatement(dr); },
  function(dr) { return cat(["{", makeStatement(dr), " }"]); },
  function(dr) { return cat(["{", makeStatement(dr-1), makeStatement(dr-1), " }"]); },
]


// Extra-hard testing for try/catch/finally and related things.

exports.makeExceptionyStatement = makeExceptionyStatement;
function makeExceptionyStatement(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = depth - 1;
  if (dr < 1)
    return makeLittleStatement(dr);

  return (rndElt(exceptionyStatementMakers))(dr);
}

var exceptionyStatementMakers = [
  function(dr) { return makeTryBlock(dr); },

  function(dr) { return makeStatement(dr); },
  function(dr) { return makeLittleStatement(dr); },

  function(dr) { return "return;" }, // return without a value can be mixed with yield
  function(dr) { return cat(["return ", makeExpr(dr), ";"]); },
  function(dr) { return cat(["yield ", makeExpr(dr), ";"]); },
  function(dr) { return cat(["throw ", makeId(dr), ";"]); },
  function(dr) { return "throw StopIteration;"; },
  function(dr) { return "this.zzz.zzz;"; }, // throws; also tests js_DecompileValueGenerator in various locations
  function(dr) { return cat([makeId(dr), " = ", makeId(dr), ";"]); },
  function(dr) { return cat([makeLValue(dr), " = ", makeId(dr), ";"]); },

  // Iteration uses StopIteration internally.
  // Iteration is also useful to test because it asserts that there is no pending exception.
  function(dr) { return "for(let y in []);"; },
  function(dr) { return "for(let y in [5,6,7,8]) " + makeExceptionyStatement(dr); },

  // Brendan says these are scary places to throw: with, let block, lambda called immediately in let expr.
  // And I think he was right.
  function(dr) { return "with({}) "   + makeExceptionyStatement(dr);         },
  function(dr) { return "with({}) { " + makeExceptionyStatement(dr) + " } "; },
  function(dr) { return "let(" + makeLetHead(dr) + ") { " + makeExceptionyStatement(dr); + "}"},
  function(dr) { return "let(" + makeLetHead(dr) + ") ((function(){" + makeExceptionyStatement(dr) + "})());" },

  // Commented out due to causing too much noise on stderr and causing a nonzero exit code :/
/*
  // Generator close hooks: called during GC in this case!!!
  function(dr) { return "(function () { try { yield " + makeExpr(dr) + " } finally { " + makeStatement(dr) + " } })().next()"; },

  function(dr) { return "(function () { try { yield " + makeExpr(dr) + " } finally { " + makeStatement(dr) + " } })()"; },
  function(dr) { return "(function () { try { yield " + makeExpr(dr) + " } finally { " + makeStatement(dr) + " } })"; },
  function(dr) {
    return "function gen() { try { yield 1; } finally { " + makeStatement(dr) + " } } var i = gen(); i.next(); i = null;";
  }

*/
];

exports.makeTryBlock = makeTryBlock;
function makeTryBlock(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  // Catches: 1/6 chance of having none
  // Catches: maybe 2 + 1/2
  // So approximately 4 recursions into makeExceptionyStatement on average!
  // Therefore we want to keep the chance of recursing too much down...

  var dr = depth - rnd(3);


  var s = cat(["try", " { ", makeExceptionyStatement(dr), " } "]);

  var numCatches = 0;

  while(rnd(3) == 0) {
    // Add a guarded catch, using an expression or a function call.
    ++numCatches;
    if (rnd(2))
      s += cat(["catch", "(", makeId(dr), " if ",                 makeExpr(dr),                    ")", " { ", makeExceptionyStatement(dr), " } "]);
    else
      s += cat(["catch", "(", makeId(dr), " if ", "(function(){", makeExceptionyStatement(dr), "})())", " { ", makeExceptionyStatement(dr), " } "]);
  }

  if (rnd(2)) {
    // Add an unguarded catch.
    ++numCatches;
    s +=   cat(["catch", "(", makeId(dr),                                                          ")", " { ", makeExceptionyStatement(dr), " } "]);
  }

  if (numCatches == 0 || rnd(2) == 1) {
    // Add a finally.
    s += cat(["finally", " { ", makeExceptionyStatement(dr), " } "]);
  }

  return s;
}



// Creates a string that sorta makes sense as an expression
exports.makeExpr = makeExpr;
function makeExpr(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  if (depth <= 0 || (rnd(7) == 1))
    return makeTerm(depth - 1);

  var dr = rnd(depth); // depth - 1;

  var expr = (rndElt(exprMakers))(dr);

  if (rnd(4) == 1)
    return "(" + expr + ")";
  else
    return expr;
}

var binaryOps = [
  // Long-standing JavaScript operators, roughly in order from http://www.codehouse.com/javascript/precedence/
  " * ", " / ", " % ", " + ", " - ", " << ", " >> ", " >>> ", " < ", " > ", " <= ", " >= ", " instanceof ", " in ", " == ", " != ", " === ", " !== ",
  " & ", " | ", " ^ ", " && ", " || ", " = ", " *= ", " /= ", " %= ", " += ", " -= ", " <<= ", " >>= ", " >>>=", " &= ", " ^= ", " |= ", " , ",

  // . is special, so test it as a group of right-unary ops, a special exprMaker for property access, and a special exprMaker for the xml filtering predicate operator
  // " . ",

  // Added by E4X
  // " :: ", " .. ", " @ ",
  // // Frequent combinations of E4X things (and "*" namespace, which isn't produced by this fuzzer otherwise)
  // " .@ ", " .@*:: ", " .@x:: ",
];

var leftUnaryOps = [
  "--", "++",
  "!", "+", "-", "~",
  "void ", "typeof ", "delete ",
  "new ", // but note that "new" can also be a very strange left-binary operator
  "yield " // see http://www.python.org/dev/peps/pep-0342/ .  Often needs to be parenthesized, so there's also a special exprMaker for it.
];

var rightUnaryOps = [
  "++", "--",
  // // E4X
  // ".*", ".@foo", ".@*"
];


var specialProperties = [
  "prop",
  "__iterator__", "__count__",
  "__noSuchMethod__",
  "__parent__", "__proto__", "constructor", "prototype"
]


var exprMakers =
[
  // Left-unary operators
  function(dr) { return cat([rndElt(leftUnaryOps), makeExpr(dr)]); },
  function(dr) { return cat([rndElt(leftUnaryOps), makeExpr(dr)]); },
  function(dr) { return cat([rndElt(leftUnaryOps), makeExpr(dr)]); },

  // Right-unary operators
  function(dr) { return cat([makeExpr(dr), rndElt(rightUnaryOps)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(rightUnaryOps)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(rightUnaryOps)]); },

  // Special properties: we love to set them!
  function(dr) { return cat([makeExpr(dr), ".", rndElt(specialProperties)]); },
  function(dr) { return cat([makeExpr(dr), ".", rndElt(specialProperties), " = ", makeExpr(dr)]); },
  function(dr) { return cat([makeId(dr),   ".", rndElt(specialProperties), " = ", makeExpr(dr)]); },

  // Binary operators
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), rndElt(binaryOps), makeExpr(dr)]); },

  // Ternary operator
  function(dr) { return cat([makeExpr(dr), " ? ", makeExpr(dr), " : ", makeExpr(dr)]); },
  function(dr) { return cat([makeExpr(dr), " ? ", makeExpr(dr), " : ", makeExpr(dr)]); },

  // In most contexts, yield expressions must be parenthesized, so including explicitly parenthesized yields makes actually-compiling yields appear more often.
  function(dr) { return cat(["yield ", makeExpr(dr)]); },
  function(dr) { return cat(["(", "yield ", makeExpr(dr), ")"]); },

  // Array functions (including extras).  The most interesting are map and filter, I think.
  // These are mostly interesting to fuzzers in the sense of "what happens if i do strange things from a filter function?"  e.g. modify the array.. :)
  // This fuzzer isn't the best for attacking this kind of thing, since it's unlikely that the code in the function will attempt to modify the array or make it go away.
  // The second parameter to "map" is used as the "this" for the function.
  function(dr) { return cat(["[11,12,13,14]",        ".", rndElt(["map", "filter", "some", "sort"]) ]); },
  function(dr) { return cat(["[15,16,17,18]",        ".", rndElt(["map", "filter", "some", "sort"]), "(", makeFunction(dr), ", ", makeExpr(dr), ")"]); },
  function(dr) { return cat(["[", makeExpr(dr), "]", ".", rndElt(["map", "filter", "some", "sort"]), "(", makeFunction(dr), ")"]); },

  // RegExp replace.  This is interesting for same same reason as array extras.
  function(dr) { return cat(["'fafafa'", ".", "replace", "(", "/", "a", "/", "g", ", ", makeFunction(dr), ")"]); },

  // XML filtering predicate operator!  It isn't lexed specially; there can be a space between the dot and the lparen.
  function(dr) { return cat([makeId(dr),  ".", "(", makeExpr(dr), ")"]); },
  // function(dr) { return cat([makeE4X(dr),  ".", "(", makeExpr(dr), ")"]); },

  // Dot (property access)
  function(dr) { return cat([makeId(dr),    ".", makeId(dr)]); },
  function(dr) { return cat([makeExpr(dr),  ".", makeId(dr)]); },

  // Index into array
  function(dr) { return cat([     makeExpr(dr),      "[", makeExpr(dr), "]"]); },
  function(dr) { return cat(["(", makeExpr(dr), ")", "[", makeExpr(dr), "]"]); },

  // Containment in an array or object (or, if this happens to end up on the LHS of an assignment, destructuring)
  function(dr) { return cat([maybeSharpDecl(), "[", makeExpr(dr), "]"]); },
  function(dr) { return cat([maybeSharpDecl(), "(", "{", makeId(dr), ": ", makeExpr(dr), "}", ")"]); },

  // Sharps on random stuff?
  function(dr) { return cat([maybeSharpDecl(), makeExpr(dr)]); },

  // Functions: called immediately/not
  function(dr) { return makeFunction(dr); },
  function(dr) { return cat(["(", makeFunction(dr), ")", "(", makeActualArgList(dr), ")"]); },

  // Try to call things that may or may not be functions.
  function(dr) { return cat([     makeExpr(dr),          "(", makeActualArgList(dr), ")"]); },
  function(dr) { return cat(["(", makeExpr(dr),     ")", "(", makeActualArgList(dr), ")"]); },
  function(dr) { return cat([     makeFunction(dr),      "(", makeActualArgList(dr), ")"]); },

  // Try to test function.call heavily.
  function(dr) { return cat(["(", makeFunction(dr), ")", ".", "call", "(", makeExpr(dr), ", ", makeActualArgList(dr), ")"]); },

  // Binary "new", with and without clarifying parentheses, with expressions or functions
  function(dr) { return cat(["new ",      makeExpr(dr),          "(", makeActualArgList(dr), ")"]); },
  function(dr) { return cat(["new ", "(", makeExpr(dr), ")",     "(", makeActualArgList(dr), ")"]); },

  function(dr) { return cat(["new ",      makeFunction(dr),      "(", makeActualArgList(dr), ")"]); },
  function(dr) { return cat(["new ", "(", makeFunction(dr), ")", "(", makeActualArgList(dr), ")"]); },

  // Sometimes we do crazy stuff, like putting a statement where an expression should go.  This frequently causes a syntax error.
  function(dr) { return stripSemicolon(makeLittleStatement(dr)); },
  function(dr) { return ""; },

  // Let expressions -- note the lack of curly braces.
  function(dr) { return cat(["let ", "(", makeLetHead(dr), ") ", makeExpr(dr)]); },

  // Array comprehensions (JavaScript 1.7)
  function(dr) { return cat(["[", makeExpr(dr), makeComprehension(dr), "]"]); },

  // Generator expressions (JavaScript 1.8)
  function(dr) { return cat([     makeExpr(dr), makeComprehension(dr)     ]); },
  function(dr) { return cat(["(", makeExpr(dr), makeComprehension(dr), ")"]); },


  function(dr) { return cat([" /* Comment */", makeExpr(dr)]); },
  function(dr) { return cat(["\n", makeExpr(dr)]); }, // perhaps trigger semicolon insertion and stuff
  function(dr) { return cat([makeExpr(dr), "\n"]); },

  function(dr) { return cat([makeLValue(dr)]); },

  // Assignment (can be destructuring)
  function(dr) { return cat([makeLValue(dr), " = ", makeExpr(dr)]); },
  function(dr) { return cat([makeLValue(dr), " = ", makeExpr(dr)]); },
  function(dr) { return cat([makeLValue(dr), " = ", makeExpr(dr)]); },
  function(dr) { return cat([makeLValue(dr), " = ", makeExpr(dr)]); },

  // Destructuring assignment
  function(dr) { return cat([makeDestructuringLValue(dr), " = ", makeExpr(dr)]); },
  function(dr) { return cat([makeDestructuringLValue(dr), " = ", makeExpr(dr)]); },
  function(dr) { return cat([makeDestructuringLValue(dr), " = ", makeExpr(dr)]); },
  function(dr) { return cat([makeDestructuringLValue(dr), " = ", makeExpr(dr)]); },

  // Destructuring assignment with lots of group assignment
  function(dr) { return cat([makeDestructuringLValue(dr), " = ", makeDestructuringLValue(dr)]); },

  // Modifying assignment, with operators that do various coercions
  function(dr) { return cat([makeLValue(dr), rndElt(["|=", "%=", "+=", "-="]), makeExpr(dr)]); },

  // Watchpoints (similar to setters)
  function(dr) { return cat([makeExpr(dr), ".", "watch", "(", uneval(makeId(dr)), ", ", makeFunction(dr), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "unwatch", "(", uneval(makeId(dr)), ")"]); },

  // New-style getter/setter, imperative
  function(dr) { return cat([makeExpr(dr), ".", "__defineGetter__", "(", uneval(makeId(dr)), ", ", makeFunction(dr), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "__defineSetter__", "(", uneval(makeId(dr)), ", ", makeFunction(dr), ")"]); },
  function(dr) { return cat(["this", ".", "__defineGetter__", "(", uneval(makeId(dr)), ", ", makeFunction(dr), ")"]); },
  function(dr) { return cat(["this", ".", "__defineSetter__", "(", uneval(makeId(dr)), ", ", makeFunction(dr), ")"]); },

  // Old-style getter/setter, imperative
  function(dr) { return cat([makeId(dr), ".", makeId(dr), " ", rndElt(["getter", "setter"]), "= ", makeFunction(dr)]); },

  // Object literal
  function(dr) { return cat(["(", "{", makeObjLiteralPart(dr), " }", ")"]); },
  function(dr) { return cat(["(", "{", makeObjLiteralPart(dr), ", ", makeObjLiteralPart(dr), " }", ")"]); },

  // Test js_ReportIsNotFunction heavily.
  function(dr) { return "(p={}, (p.z = " + makeExpr(dr) + ")())"; },

  // Test js_ReportIsNotFunction heavily.
  // Test decompilation for ".keyword" a bit.
  // Test throwing-into-generator sometimes.
  function(dr) { return cat([makeExpr(dr), ".", "throw", "(", makeExpr(dr), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "yoyo",   "(", makeExpr(dr), ")"]); },

  // Throws, but more importantly, tests js_DecompileValueGenerator in various contexts.
  function(dr) { return "this.zzz.zzz"; },

  // Test eval in various contexts. (but avoid clobbering eval)
  // Test the special "obj.eval" and "eval(..., obj)" forms.
  function(dr) { return makeExpr(dr) + ".eval(" + makeExpr(dr) + ")"; },
  function(dr) { return "eval(" + uneval(makeExpr(dr)) + ", " + makeExpr(dr) + ")"; },
  function(dr) { return "eval(" + uneval(makeStatement(dr)) + ", " + makeExpr(dr) + ")"; },

  // Uneval needs more testing than it will get accidentally.  No cat() because I don't want uneval clobbered (assigned to) accidentally.
  function(dr) { return "(uneval(" + makeExpr(dr) + "))"; },

  // Object.prototype stuff
  function(dr) { return cat([makeExpr(dr), ".", "hasOwnProperty", "(", uneval(makeId(dr)), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "propertyIsEnumerable", "(", uneval(makeId(dr)), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "isPrototypeOf", "(", makeExpr(dr), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "__lookupGetter__", "(", uneval(makeId(dr)), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "__lookupSetter__", "(", uneval(makeId(dr)), ")"]); },
  function(dr) { return cat([makeExpr(dr), ".", "valueOf", "(", uneval("number"), ")"]); },

  // Constructors.  No "T" -- don't screw with the constructors themselves; just call them.
  function(dr) { return "new " + rndElt(constructors) + "(" + makeActualArgList(dr) + ")"; },
  function(dr) { return          rndElt(constructors) + "(" + makeActualArgList(dr) + ")"; }
];

var constructors = [
  "Error", "RangeError", "Exception",
  "Function", "Date", "RegExp", "String", "Array", "Object", "Number", "Boolean",
  "Iterator"
];

function maybeSharpDecl()
{
  if (rnd(3) == 0)
    return cat(["#", "" + (rnd(3)), "="]);
  else
    return "";
}


exports.makeObjLiteralPart = makeObjLiteralPart;
function makeObjLiteralPart(dr)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(dr);

  switch(rnd(8))
  {
    // Old-style literal getter/setter
    case 0: return cat([makeId(dr), " getter: ", makeFunction(dr)]);
    case 1: return cat([makeId(dr), " setter: ", makeFunction(dr)]);

    // New-style literal getter/setter
    case 2: return cat([" get ", makeId(dr), maybeName(dr), "(", makeFormalArgList(dr-1), ")", makeFunctionBody(dr)]);
    case 3: return cat([" set ", makeId(dr), maybeName(dr), "(", makeFormalArgList(dr-1), ")", makeFunctionBody(dr)]);



/*
    case 3: return cat(["toString: ", makeFunction(dr), "}", ")"]);
    case 4: return cat(["toString: function() { return this; } }", ")"]); }, // bwahaha
    case 5: return cat(["toString: function() { return " + makeExpr(dr) + "; } }", ")"]); },
    case 6: return cat(["valueOf: ", makeFunction(dr), "}", ")"]); },
    case 7: return cat(["valueOf: function() { return " + makeExpr(dr) + "; } }", ")"]); },
*/

    default: return cat([makeId(dr), ": ", makeExpr(dr)]);
  }
}




exports.makeFunction = makeFunction;
function makeFunction(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = depth - 1;

  if(rnd(5) == 1)
    return makeExpr(dr);

  return (rndElt(functionMakers))(dr);
}


exports.makeFunPrefix = makeFunPrefix;
function makeFunPrefix(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  switch(rnd(20)) {
// Leaving this stuff out until bug 381203 is fixed.
// Eventually this stuff should be moved from functionMakers to somewhere
// like statementMakers, right?
//    case 0: return "getter ";
//    case 1: return "setter ";
    default: return "";
  }
}

function maybeName(depth)
{
  if (rnd(2) == 0)
    return " " + makeId(depth) + " ";
  else
    return "";
}

exports.makeFunctionBody = makeFunctionBody;
function makeFunctionBody(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  switch(rnd(4)) {
    case 0: return cat([" { ", makeStatement(depth - 1),   " } "]);
    case 1: return cat([" { ", "return ", makeExpr(depth), " } "]);
    case 2: return cat([" { ", "yield ",  makeExpr(depth), " } "]);
    case 3: return makeExpr(depth); // make an "expression closure"
  }
}




var functionMakers = [
  // Note that a function with a name is sometimes considered a statement rather than an expression.

  // Functions and expression closures
  function(dr) { return cat([makeFunPrefix(dr), "function", " ", maybeName(dr), "(", makeFormalArgList(dr), ")", makeFunctionBody(dr)]); },
  function(dr) { return cat([makeFunPrefix(dr), "function", " ", maybeName(dr), "(", makeFormalArgList(dr), ")", makeFunctionBody(dr)]); },
  function(dr) { return cat([makeFunPrefix(dr), "function", " ", maybeName(dr), "(", makeFormalArgList(dr), ")", makeFunctionBody(dr)]); },
  function(dr) { return cat([makeFunPrefix(dr), "function", " ", maybeName(dr), "(", makeFormalArgList(dr), ")", makeFunctionBody(dr)]); },


  // The identity function
  function(dr) { return "function(q) { return q; }" },

  // A generator that does something
  function(dr) { return "function(y) { yield y; " + makeStatement(dr) + "; yield y; }" },

  // A generator expression -- kinda a function??
  function(dr) { return "(1 for (x in []))"; },

  // Special functions that might have interesting results, especially when called "directly" by things like string.replace or array.map.
  function(dr) { return "eval" }, // eval is interesting both for its "no indirect calls" feature and for the way it's implemented -- a special bytecode.
  function(dr) { return "new Function" }, // this won't be interpreted the same way for each caller of makeFunction, but that's ok
  function(dr) { return "(new Function(" + uneval(makeStatement(dr)) + "))"; },
  function(dr) { return "Function" }, // without "new"!  it does seem to work...
  function(dr) { return "gc" },
  function(dr) { return "Math.sin" },
  function(dr) { return "Math.pow" },
  function(dr) { return "/a/gi" }, // in Firefox, at least, regular expressions can be used as functions: e.g. "hahaa".replace(/a+/g, /aa/g) is "hnullhaa"!
  function(dr) { return "[1,2,3,4].map" },
  function(dr) { return "[1,2,3,4].slice" },
  function(dr) { return "'haha'.split" },
  function(dr) { return "({}).hasOwnProperty" },
  function(dr) { return "({}).__lookupGetter__" },
  function(dr) { return cat(["(", makeFunction(dr), ")", ".", "call"]); },
  function(dr) { return cat(["(", makeFunction(dr), ")", ".", "apply"]); },
  function(dr) { return cat(["(", makeExpr(dr), ")", ".", "watch"]); },
  function(dr) { return cat(["(", makeExpr(dr), ")", ".", "__defineSetter__"]); },
];



exports.makeLetHead = makeLetHead;
function makeLetHead(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  if (rnd(2) == 1)
    return makeLetHeadItem(depth);
  else
    return makeLetHeadItem(depth) + ", " + makeLetHeadItem(depth - 1);
}

exports.makeLetHeadItem = makeLetHeadItem;
function makeLetHeadItem(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = depth - 1;

  // 0 or more things being declared
  var lhs = (rnd(3) == 1) ? makeDestructuringLValue(dr) : makeId(dr);

  // initial value
  var rhs = (rnd(2) == 1) ? (" = " + makeExpr(dr)) : "";

  return lhs + rhs;
}


exports.makeActualArgList = makeActualArgList;
function makeActualArgList(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var nArgs = rnd(3);

  if (nArgs == 0)
    return "";

  var argList = makeExpr(depth);

  for (var i = 1; i < nArgs; ++i)
    argList += ", " + makeExpr(depth - i);

  return argList;
}

exports.makeFormalArgList = makeFormalArgList;
function makeFormalArgList(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var nArgs = rnd(3);

  if (nArgs == 0)
    return "";

  var argList = makeFormalArg(depth)

  for (var i = 1; i < nArgs; ++i)
    argList += ", " + makeFormalArg(depth - i);

  return argList;
}

exports.makeFormalArg = makeFormalArg;
function makeFormalArg(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  if (rnd(4) == 1)
    return makeDestructuringLValue(depth);

  return makeId(depth);
}


exports.makeId = makeId;
function makeId(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = depth; // !

  switch(rnd(200))
  {
  case 0:
    return makeTerm(dr);
  case 1:
    return makeExpr(dr);
  case 2: case 3: case 4: case 5:
    return makeLValue(dr);
  case 6: case 7:
    return makeDestructuringLValue(dr);
  case 8: case 9: case 10:
    // some keywords that can be used as identifiers in some contexts (e.g. variables, function names, argument names)
    // but that's annoying, and some of these cause lots of syntax errors.
    return rndElt(["get", "set", "getter", "setter", "delete", "let", "yield", "each"]);
  case 11: case 12: case 13:
    return "function::" + makeId(dr);
  case 14:
    return "x::" + makeId(dr);
  case 15: case 16:
    return rndElt(specialProperties);
  }

  return rndElt(["x", "x", "x", "x", "x", "x", "x", "x", // repeat "x" so it's likely to be bound more than once, causing "already bound" errors, elimination of assign-to-const, or conflicts
                 "x1", "x2", "x3", "x4", "x5",
                 "y", "window", "this", "\u3056", "NaN",
//                 "valueOf", "toString", // e.g. valueOf getter :P // bug 381242, etc
                 "functional", // perhaps decompiler code looks for "function"?
                 " " // [k, v] becomes [, v] -- test how holes are handled in unexpected destructuring
                  ]);

  // window is a const (in the browser), so some attempts to redeclare it will cause errors

  // eval is interesting because it cannot be called indirectly. and maybe also because it has its own opcode in jsopcode.tbl.
  // but bad things happen if you have "eval setter"... so let's not put eval in this list.
}


exports.makeComprehension = makeComprehension;
function makeComprehension(dr)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(dr);

  if (dr < 0)
    return "";

  switch(rnd(4)) {
  case 0:
    return "";
  case 1:
    return cat([" for ",          "(", makeForInLHS(dr), " in ", makeExpr(dr-2), ")"]) + makeComprehension(dr - 1);
  case 2:
    return cat([" for ", "each ", "(", makeId(dr),       " in ", makeExpr(dr-2), ")"]) + makeComprehension(dr - 1);
  case 3:
    return cat([" if ", "(", makeExpr(dr-2), ")"]); // this is always last (and must be preceded by a "for", oh well)
  }
}




// for..in LHS can be a single variable OR it can be a destructuring array of exactly two elements.
exports.makeForInLHS = makeForInLHS;
function makeForInLHS(dr)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(dr);

// JS 1.7 only (removed in JS 1.8)
//
//  if (version() == 170 && rnd(4) == 0)
//    return cat(["[", makeLValue(dr), ", ", makeLValue(dr), "]"]);

  return makeLValue(dr);
}


exports.makeLValue = makeLValue;
function makeLValue(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  if (depth <= 0 || (rnd(2) == 1))
    return makeId(depth - 1);

  var dr = rnd(depth);

  return (rndElt(lvalueMakers))(dr);
}


var lvalueMakers = [
  // Simple variable names :)
  function(dr) { return cat([makeId(dr)]); },

  // Destructuring
  function(dr) { return makeDestructuringLValue(dr); },
  function(dr) { return makeDestructuringLValue(dr); },

  // Properties
  function(dr) { return cat([makeId(dr), ".", makeId(dr)]); },
  function(dr) { return cat([makeExpr(dr), ".", makeId(dr)]); },
  function(dr) { return cat([makeExpr(dr), "[", "'", makeId(dr), "'", "]"]); },

  // Special properties
  function(dr) { return cat([makeId(dr), ".", rndElt(specialProperties)]); },

  // Certain functions can act as lvalues!  See JS_HAS_LVALUE_RETURN in js engine source.
  function(dr) { return cat([makeId(dr), "(", makeExpr(dr), ")"]); },
  function(dr) { return cat(["(", makeExpr(dr), ")", "(", makeExpr(dr), ")"]); },

  // Parenthesized lvalues can cause problems ;)
  function(dr) { return cat(["(", makeLValue(dr), ")"]); },

  function(dr) { return makeExpr(dr); } // intentionally bogus, but not quite garbage.
];

exports.makeDestructuringLValue = makeDestructuringLValue;
function makeDestructuringLValue(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  var dr = depth - 1;

  if (dr < 0 || rnd(4) == 1)
    return makeId(dr);

  if (rnd(6) == 1)
    return makeLValue(dr);

  return (rndElt(destructuringLValueMakers))(dr);
}

var destructuringLValueMakers = [
  // destructuring assignment: arrays
  function(dr)
  {
    var len = rnd(6);
    if (len == 0)
      return "[]";

    var Ti = [];
    Ti.push("[");
    Ti.push(maybeMakeDestructuringLValue(dr));
    for (var i = 1; i < len; ++i) {
      Ti.push(", ");
      Ti.push(maybeMakeDestructuringLValue(dr));
    }

    Ti.push("]");

    return cat(Ti);
  },

  // destructuring assignment: objects
  function(dr) { return cat(["(", "{ ", makeId(dr), ": ", makeDestructuringLValue(dr), " }", ")"]); },
  function(dr) { return cat(["(", "{ ", makeId(dr), ": ", makeDestructuringLValue(dr), ", ", makeId(dr), ": ", makeDestructuringLValue(dr), " }", ")"]); },
];

// Allow "holes".
function maybeMakeDestructuringLValue(depth)
{
  if (rnd(2) == 0)
    return ""

  return makeDestructuringLValue(depth)
}



exports.makeTerm = makeTerm;
function makeTerm(depth)
{
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

  return (rndElt(termMakers))(depth);
}

var termMakers = [
  // Variable names
  function(dr) { return makeId(dr); },

  // Simple literals (no recursion required to make them)
  function(dr) { return rndElt([
    // Arrays
    "[]", "[1]", "[[]]", "[[1]]", "[,]", "[,,]", "[1,,]",
    // Objects
    "{}", "({})", "({a1:1})",
    // Possibly-destructuring arrays
    "[z1]", "[z1,,]", "[,,z1]",
    // Possibly-destructuring objects
    "({a2:z2})",
    // Sharp use
    "#1#",
    // Sharp creation and use
    "#1=[#1#]", "#3={a:#3#}",
    "function(id) { return id }",
    "function ([y]) { }",
    "(function ([y]) { })()",

    "arguments"
    ]);
  },
  function(dr) { return rndElt([ "0.1", ".2", "3", "1.3", "4.", "5.0000000000000000000000", "1.2e3", "1e81", "1e+81", "1e-81", "1e4", "0", "-0", "(-0)", "-1", "(-1)", "0x99", "033", (""+Math.PI), "3/0", "-3/0", "0/0" /*, "(0x50505050 >> 1)" */ ]); },
  function(dr) { return rndElt([ "true", "false", "undefined", "null"]); },
  function(dr) { return rndElt([ "this", "window" ]); },
  function(dr) { return rndElt([" \"\" ", " '' ", " /x/ ", " /x/g "]) },

  // E4X literals
  // function(dr) { return rndElt([ "<x/>", "<y><z/></y>"]); },
  // function(dr) { return rndElt([ "@foo" /* makes sense in filtering predicates, at least... */, "*", "*::*"]); },
  // function(dr) { return makeE4X(dr) }, // xml
  // function(dr) { return cat(["<", ">", makeE4X(dr), "<", "/", ">"]); }, // xml list
];



function maybeMakeTerm(depth)
{
  if (rnd(2))
    return makeTerm(depth - 1);
  else
    return "";
}


exports.makeCrazyToken = makeCrazyToken;
function makeCrazyToken()
{
  if (rnd(2) == 0) {
    // This can be more aggressive once bug 368694 is fixed.
    return String.fromCharCode(32 + rnd(128 - 32));
  }

  return rndElt([

  // Some of this is from reading jsscan.h.

  // Comments; comments hiding line breaks.
  "//", UNTERMINATED_COMMENT, (UNTERMINATED_COMMENT + "\n"), "/*\n*/",

  // groupers (which will usually be unmatched if they come from here ;)
  "[", "]",
  "{", "}",
  "(", ")",

  // a few operators
  "!", "@", "%", "^", "*", "|", ":", "?", "'", "\"", ",", ".", "/",
  "~", "_", "+", "=", "-", "++", "--", "+=", "%=", "|=", "-=",
  "#", "#1", "#1=", // usually an "invalid character", but used as sharps too

  // most real keywords plus a few reserved keywords
  " in ", " instanceof ", " let ", " new ", " get ", " for ", " if ", " else ", " else if ", " try ", " catch ", " finally ", " export ", " import ", " void ", " with ",
  " default ", " goto ", " case ", " switch ", " do ", " /*infloop*/while ", " return ", " yield ", " break ", " continue ", " typeof ", " var ", " const ",

  // several keywords can be used as identifiers. these are just a few of them.
  " enum ", // JS_HAS_RESERVED_ECMA_KEYWORDS
  " debugger ", // JS_HAS_DEBUGGER_KEYWORD
  " super ", // TOK_PRIMARY!

  " this ", // TOK_PRIMARY!
  " null ", // TOK_PRIMARY!
  " undefined ", // not a keyword, but a default part of the global object
  "\n", // trigger semicolon insertion, also acts as whitespace where it might not be expected
  "\r",
  "\u2028", // LINE_SEPARATOR?
  "\u2029", // PARA_SEPARATOR?
  "<" + "!" + "--", // beginning of HTML-style to-end-of-line comment (!)
  "--" + ">", // end of HTML-style comment
  "",
  "\0", // confuse anything that tries to guess where a string ends. but note: "illegal character"!
  ]);
}


// function makeE4X(depth)
// {
//   if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

//   if (depth <= 0)
//     return cat(["<", "x", ">", "<", "y", "/", ">", "<", "/", "x", ">"]);

//   var dr = depth - 1;

//   var y = [
//     function(dr) { return '<employee id="1"><name>Joe</name><age>20</age></employee>' },
//     function(dr) { return cat(["<", ">", makeSubE4X(dr), "<", "/", ">"]); }, // xml list

//     function(dr) { return cat(["<", ">", makeExpr(dr), "<", "/", ">"]); }, // bogus or text
//     function(dr) { return cat(["<", "zzz", ">", makeExpr(dr), "<", "/", "zzz", ">"]); }, // bogus or text

//     // mimic parts of this example at a time, from the e4x spec: <x><{tagname} {attributename}={attributevalue+attributevalue}>{content}</{tagname}></x>;

//     function(dr) { var tagId = makeId(dr); return cat(["<", "{", tagId, "}", ">", makeSubE4X(dr), "<", "/", "{", tagId, "}", ">"]); },
//     function(dr) { var attrId = makeId(dr); var attrValExpr = makeExpr(dr); return cat(["<", "xxx", " ", "{", attrId, "}", "=", "{", attrValExpr, "}", " ", "/", ">"]); },
//     function(dr) { var contentId = makeId(dr); return cat(["<", "xxx", ">", "{", contentId, "}", "<", "/", "xxx", ">"]); },

//     // namespace stuff
//     function(dr) { var contentId = makeId(dr); return cat(['<', 'bbb', ' ', 'xmlns', '=', '"', makeExpr(dr), '"', '>', makeSubE4X(dr), '<', '/', 'bbb', '>']); },
//     function(dr) { var contentId = makeId(dr); return cat(['<', 'bbb', ' ', 'xmlns', ':', 'ccc', '=', '"', makeExpr(dr), '"', '>', '<', 'ccc', ':', 'eee', '>', '<', '/', 'ccc', ':', 'eee', '>', '<', '/', 'bbb', '>']); },

//     function(dr) { return makeExpr(dr); },

//     function(dr) { return makeSubE4X(dr); }, // naked cdata things, etc.
//   ]

//   return (rndElt(y))(dr);
// }

// function makeSubE4X(depth)
// {
//   if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(depth);

// // Bug 380431
// //  if (rnd(8) == 0)
// //    return "<" + "!" + "[" + "CDATA[" + makeExpr(depth - 1) + "]" + "]" + ">"

//   if (depth < -2)
//     return "";

//   var y = [
//     function(depth) { return cat(["<", "ccc", ":", "ddd", ">", makeSubE4X(depth - 1), "<", "/", "ccc", ":", "ddd", ">"]); },
//     function(depth) { return makeE4X(depth) + makeSubE4X(depth - 1); },
//     function(depth) { return "yyy"; },
//     function(depth) { return cat(["<", "!", "--", "yy", "--", ">"]); }, // XML comment
// // Bug 380431
// //    function(depth) { return cat(["<", "!", "[", "CDATA", "[", "zz", "]", "]", ">"]); }, // XML cdata section
//     function(depth) { return " "; },
//     function(depth) { return ""; },
//   ];

//   return (rndElt(y))(depth);
// }








var count;
var verbose = false;


var maxHeapCount = 0;
var sandbox = null;
// https://bugzilla.mozilla.org/show_bug.cgi?id=394853#c19
//try { eval("/") } catch(e) { }
// Remember the number of countHeap.
tryItOut("");
init();


/**************************************
 * To reproduce a crash or assertion: *
 **************************************/

// 1. Comment "start();" out.
// start();

// 2. Paste the "tryItOut" lines from the run's output in here.
//         grep tryIt LOGFILE | grep -v "function tryIt"
// If you're lucky, you'll only need the last line.  Otherwise, use Lithium to
// figure out which lines are needed.
// DDBEGIN
// DDEND
// 3. Run it.
