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
    rule { ($loc) } => {}
}

macro check {
    rule { (function ($arg:ident) { $check ... }, $name:lit) } => {}
    
    rule { ($handle:ident, function ($arg:ident) { $check ... }, $name:lit) } => {}
}

macro mkContract{
    rule { ($name, $rest ...) } => {}
}


// so many cases...makes the syntax pretty, though
macro fun {
    rule { $params -> $ret function $handle $args $body } => {
        function $handle $args $body
    }
    
    rule { $params -> $ret $[#] $this function $handle $args $body } => {
        function $handle $args $body
    }
    rule { $params -> ! ($argl:ident, $result:ident) -> {$check ...} function $handle $args $body } => {
        function $handle $args $body
    }
    rule { $params -> $ret $[#] $this var $handle = $def:expr } => {
        var $handle = $def
    }
    rule { $params -> ! ($argl:ident, $result:ident) -> {$check ...} var $handle = $def:expr } => {
        var $handle = $def
    }

    // no new
    rule { $params --> $ret function $handle $args $body } => {
        function $handle $args $body
    }

    rule { $params --> $ret $[#] $this function $handle $args $body } => {
        function $handle $args $body
    }

    rule { $params --> ! ($argl:ident, $result:ident) -> {$check ...} function $handle $args $body } => {
        function $handle $args $body
    }

    rule { $params --> $ret var $handle = $def:expr } => {
        var $handle = $def
    }

    rule { $params --> $ret $[#] $this var $handle = $def:expr } => {
        var $handle = $def
    }

    rule { $params --> ! ($argl:ident, $result:ident) -> {$check ...} var $handle = $def:expr } => {
        var $handle = $def
    }

    // only new - note that newOnly functions don't take a 'this' contract
    rule { $params ==> $ret function $handle $args $body } => {
        function $handle $args $body

    }

    rule { $params ==> $ret $[#] $this function $handle $args $body } => {
        function $handle $args $body
    }

    rule { $params ==> ! ($argl:ident, $result:ident) -> {$check ...} function $handle $args $body } => {
        function $handle $args $body
    }

    rule { $params ==> $ret var $handle = $def:expr } => {
        var $handle = $def
    }

    rule { $params ==> $ret $[#] $this var $handle = $def:expr } => {
        var $handle = $def
    }

    rule { $params ==> ! ($argl:ident, $result:ident) -> {$check ...} var $handle = $def:expr } => {
        var $handle = $def
    }
}

macro obj {
    rule { $contract var $handle:ident = $obj } => {
	    var $handle = $obj
    }
    rule { $contract $[|] invariant $[:] ! ($var:ident) -> { $check ... } var $handle:ident = $obj } => {
	    var $handle = $obj
    }
}

macro arr {
    rule { $contract var $handle:ident = $arr } => {
	    var $handle = $arr
    }
}
