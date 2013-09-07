---
layout: default
---




Sweet.js brings hygienic macros from languages like Scheme and Rust to
JavaScript. Macros allow you to sweeten the syntax of JavaScript and
craft the language you've always wanted.



Do you want to use class syntax but don't want to wait for ES6? Add
classes yourself with macros!

<textarea class="editor">
// Define the class macro here...
macro class {
  case $className {
    constructor $cparams $cbody
    $($mname $mparams $mbody) ... 
  } => {

    function $className $cparams $cbody

    $($className.prototype.$mname
      = function $mname $mparams $mbody; ) ...
  }
}

// An now classes are a part of JavaScript!
class Person {
  constructor(name) {
    this.name = name;
  }

  say(msg) {
    console.log(this.name + " says: " + msg);
  }
}
var bob = new Person("Bob");
bob.say("Macros are sweet!");
</textarea>

How about a better switch?

<textarea class="editor">
macro _arms {
  case (default => $value:expr) => {
    else {
      return $value;
    }
  }
  case (case $cond:expr => $value:expr) => {
    if($cond) {
      return $value;
    }
  }
  case (
    $(case $cond:expr => $value:expr) $rest ...
  ) => {
    _arms (case $cond => $value)
    _arms ($rest ...)
  }
}
macro cond {
  case { $arms ... } => {
    (function() {
      _arms($arms ...)
    })();
  }
}

var x = [];
var type = cond {
  case (x === null) => "null"
  case Array.isArray(x) => "array"
  case (typeof x === "object") => "object"
  default => typeof x
}

</textarea>


To get a better sense of what macros can do, check out some
<a href="https://github.com/mozilla/sweet.js/wiki/Example-macros">example macros</a>
or play around with macros in the <a href="browser/editor.html">editor</a>.

## Getting sweet.js

Install the sweet.js compiler via npm:

<pre><code class="language-markup">
  $ npm install -g sweet.js
</code></pre>

Use the <code>sjs</code> binary to compile your sweet.js code:

<pre><code class="language-markup">
  $ sjs -o output.js my_sweet_code.js
</code></pre>

Sweet.js is still a work in progress so expect bugs and missing features.

* Report issues on <a
  href="https://github.com/mozilla/sweet.js/issues">github</a>.
* Discuss sweet.js on the <a
      href="https://groups.google.com/forum/#!forum/sweetjs">mailing
      list</a> or the IRC channel #sweet.js on irc.mozilla.org.
* Ping <a href="https://twitter.com/disnet">@disnet</a> on Twitter.


## Writing macros

You can think of macros as functions that take little bits of syntax
and convert it to new bits of syntax at compile-time. Macros are
created with the <code>macro</code> keyword:

<pre><code class="language-javascript">
macro id {
  case ($x) => { $x }
}
</code></pre>

This can be read as "define a macro named 'id' that matches a single
token surrounded by parenthesis and when invoked returns just the
matched token".


<textarea class="editor">
macro id {
  case ($x) => { $x }
}

var x = id ("foo")
</textarea>


A pattern name that begin with "<code>$</code>" in the left hand side
of the macro definition matches any token and binds it to that name in
macro body while everything else matches literally.


<textarea class="editor">
macro m {
  case ($x becomes $y) => {
    $x = $y;
  }
}
m (a becomes b)
</textarea>



A pattern name can be restricted to a particular parse class by using
<code>$name:class</code> in which case rather than matching only a
single token the pattern matches all the tokens matched by the parse
class.

<pre><code class="language-javascript">
macro m {
  case ($x:expr) => {
    // ...
  }
}
m (2 + 5 * 10)
</code></pre>

For instance:

<textarea class="editor">
macro m {
  case ($x:expr) => {
    $x
  }
}
m (2 + 5 * 10)
</textarea>

The commonly used parse classes that have short names are
<code>expr</code> (matches an expression),
<code>ident</code> (matches an identifier), and
<code>lit</code> (matches a literal). 

Repeated patterns can be matched with the <code>...</code> syntax.

<pre><code class="language-javascript">
macro m {
  case ($x ...) => {
    // ...
  }
}
m (1 2 3 4)
</code></pre>



A repeated pattern with a separator between each item can be matched
by adding <code>(,)</code> between <code>...</code> and the pattern
being repeated.


<textarea  class="editor">
macro m {
  case ($x (,) ...) => {
    [$x (,) ...]
  }
}
m (1, 2, 3, 4)
</textarea>




Repeated groups of patterns can be matched using <code>$()</code>.

<textarea class="editor">
macro m {
  case ( $($id:ident = $val:expr) (,) ...) => {
    $(var $id = $val;) ...
  }
}
m (x = 10, y = 2+10)
</textarea>



Macros can match on multiple cases.


<textarea class="editor">
macro m {
  case ($x:lit) => { $x }
  case ($x:lit, $y:lit) => { [$x, $y] }
}

m (1);
m (1, 2)
</textarea>


And macros can call themselves.

<textarea class="editor">
macro m {
  case ($base) => { [$base] }
  case ($head $tail ...) => { [$head, m ($tail ...)] }
}
m (1 2 3 4 5)  // --> [1, [2, [3, [4, [5]]]]]
</textarea>

