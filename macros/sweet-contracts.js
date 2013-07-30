/*
  Copyright (C) 2013 Oren Leiman <oleiman@ucsc.edu>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
var C;

macro setupContracts {
    rule { ($loc) } => {
	    C = $loc
    }
}

macro check {
    rule { (function ($arg:ident) { $check ... }, $name:lit) } => {
	    C.check(function ($arg) { $check ... }, $name)
    }
    
    rule { ($handle:ident, function ($arg:ident) { $check ... }, $name:lit) } => {
	    var $handle = C.check(function ($arg) { $check ... }, $name)
    }
}

macro mkContract{
    rule { ($name, $rest ...) } => {
        C.$name = vbl $rest ...
    }
}

macro vbl {
    rule { () } => { }

    rule { ($[?] $comb1, $rest ...) } => {
	    vbl (? $comb1), vbl ($rest ...)
    }

    rule { ($p_type -> $ret_type $[|] $rest ...) } => {
	    C.fun(vbl ($p_type), vbl ($ret_type), {
	        vbl ($rest ...)
	    })
    }

    rule { ($key:ident $[:] ! ($arg) -> { $check ... }, $rest ...) } => {
	    $key: function($arg) { $check ... }, vbl ($rest ...)
    }

    rule { ($key:ident $[:] ! ($arg) -> { $check ... }) } => {
	    $key: function($arg) { $check ... }
    }

    rule { ($p_type -> $ret_type, $rest ...) } => {
    	vbl ($p_type -> $ret_type), vbl ($rest ...)
    }

    rule { {$key $[:] $rest ...} $[|] invariant $[:] !($arg:ident) -> {$check ...} } => {
    	C.object({ $key: vbl ($rest ...) }, 
    		 { invariant: function($arg) { $check ... } })
    }

    rule { {$key $[:] $rest ...} } => {
	    C.object({$key: vbl ($rest ...)})
    }

    rule { ($key $[:] $rest ...) } => {
	    $key: vbl ($rest ...)
    }

    rule { ([$comb, $arr ...], $rest ...) } => {
    	C.arr([vbl ($comb), vbl ($arr ...)]), vbl ($rest ...)
    }

    rule { ($comb1 or $comb2, $rest ...) } => {
    	C.or(vbl ($comb1), vbl ($comb2)), vbl ($rest ...)
    }

    rule { ($comb1 or $comb2 $rest ...) } => {
    	C.or(vbl ($comb1), vbl ($comb2)), vbl ($rest ...)
    }

    rule { ($comb1 and $comb2, $rest ...) } => {
    	C.and(vbl ($comb1), vbl ($comb2)), vbl ($rest ...)
    }

    rule { ($comb1 and $comb2 $rest ...) } => {
    	C.and(vbl ($comb1), vbl ($comb2)), vbl ($rest ...)
    }

    rule { ($comb:ident, $rest ...) } => {
	    C.$comb, vbl ($rest ...)
    }

    rule { ($comb, $rest ...) } => {
	    vbl $comb, vbl ($rest ...)
    }

    // base cases
    rule { $p_type -> $ret_type $[|] $opts } => {
    	C.fun ([vbl $p_type], vbl $ret_type, {
    	    opts $opts
    	})
    }

    rule { ($p_type -> $ret_type) } => {
	    C.fun ([vbl $p_type], vbl $ret_type)
    }

    rule { (! ($args:ident, $result:ident) -> { $check ... }) } => {
	    function ($args) {
	        return C.check(
		        function ($result) { $check ... }, 'dependent')
	    }
    }

    rule { [$arr ...] } => {
    	C.arr([vbl ($arr ...)])
    }

    rule { ($comb1 and $comb2) } => {
	    C.and(vbl ($comb1), vbl ($comb2))
    }
    rule { ($comb1 or $comb2) } => {
	    C.or(vbl ($comb1), vbl ($comb2))
    }

    rule { ($key: ! ($arg) -> { $check ...} ) } => {
	    function ($arg) {
	        $check ...
	    }
    }

    // broken in latest sweet.js
    // rule { ($comb $[...]) } => {
    // 	C.___(vbl ($comb))
    // }

    rule { ($[?] $comb) } => {
	    C.opt(vbl ($comb))
    }

    rule { ($comb) } => {
    	vbl $comb
    }

    rule { $comb:ident } => {
	    C.$comb
    }
}

// so many cases...makes the syntax pretty, though
macro fun {
    rule { $params -> $ret function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret),
    	    function $args $body);
    }
    
    rule { $params -> $ret $[#] $this function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {this: vbl $this}),
    	    function $args $body);
    }
    rule { $params -> ! ($argl:ident, $result:ident) -> {$check ...} function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl (! ($argl, $result) -> {$check ...})),
    	    function $args $body);
    }
    rule { $params -> $ret $[#] $this var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {this: vbl $this}),
    	    $def);
    }
    rule { $params -> ! ($argl:ident, $result:ident) -> {$check ...} var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl (! ($argl, $result) -> {$check ...})),
    	    $def);
    }

    // no new
    rule { $params --> $ret function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {callOnly: true}),
    	    function $args $body);
    }

    rule { $params --> $ret $[#] $this function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {callOnly: true, this: vbl $this}),
    	    function $args $body);
    }

    rule { $params --> ! ($argl:ident, $result:ident) -> {$check ...} function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl (! ($argl, $result) -> {$check ...}), {callOnly: true}),
    	    function $args $body);
    }

    rule { $params --> $ret var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {callOnly: true}),
    	    $def);
    }

    rule { $params --> $ret $[#] $this var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {callOnly: true, this: vbl $this}),
    	    $def);
    }

    rule { $params --> ! ($argl:ident, $result:ident) -> {$check ...} var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl (! ($argl, $result) -> {$check ...}), {callOnly: true}),
    	    $def);
    }

    // only new - note that newOnly functions don't take a 'this' contract
    rule { $params ==> $ret function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {newOnly: true}),
    	    function $args $body);
    }

    rule { $params ==> $ret $[#] $this function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {newOnly: true}),
    	    function $args $body);
    }

    rule { $params ==> ! ($argl:ident, $result:ident) -> {$check ...} function $handle $args $body } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl (! ($argl, $result) -> {$check ...}), {newOnly: true}),
    	    function $args $body);
    }

    rule { $params ==> $ret var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {newOnly: true}),
    	    $def);
    }

    rule { $params ==> $ret $[#] $this var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl $ret, {newOnly: true}),
    	    $def);
    }

    rule { $params ==> ! ($argl:ident, $result:ident) -> {$check ...} var $handle = $def:expr } => {
    	var $handle = C.guard(
    	    C.fun([vbl $params], vbl (! ($argl, $result) -> {$check ...}), {newOnly: true}),
    	    $def);
    }
}

macro obj {
    rule { $contract var $handle:ident = $obj } => {
	    var $handle = C.guard(vbl $contract, $obj);
    }
    rule { $contract $[|] invariant $[:] ! ($var:ident) -> { $check ... } var $handle:ident = $obj } => {
        var $handle = C.guard(vbl $contract | invariant: !($var) -> { $check ... }, $obj);
    }
}

macro arr {
    rule { $contract var $handle:ident = $arr } => {
	    var $handle = C.guard(vbl $contract, $arr)
    }
}
