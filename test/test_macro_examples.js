var expect = require("expect.js")

// not testing anything specific, just that various
// example macros work
describe("macro examples", function() {
  // it("def", function() {
  //   macro def {
  //     case $name:ident $params $body => {
  //       function $name $params $body
  //     }
  //   }
  //   def add (a, b) {
  //     return a + b;
  //   }

  //   expect(add(1,2)).to.be(3);
  // });

  // it("class", function() {
  //   macro class {
  //     case $className:ident { 
  //       constructor $constParam $constBody
  //       $($methodName:ident $methodParam $methodBody) ...
  //     } => {

  //       function $className $constParam $constBody

  //       $(
  //         $className.prototype.$methodName = function $methodName $methodParam $methodBody;
  //       ) ...

  //     }
  //   }  

  //   class Person {

  //     constructor(name) {
  //       this.name = name;
  //     }

  //     say (msg) {
  //       return "Macros are sweet!";
  //     }

  //     sayy (msg) {
  //       return "Macros are sweet!";
  //     }

  //   }
  //   var bob = new Person("Bob");
  //   var v = bob.say();
  //   expect(v).to.be("Macros are sweet!")
  //   var z = bob.sayy();
  //   expect(z).to.be("Macros are sweet!")
  // });

  // it("extended class", function() {
  //   macro class {
  //     case $className:ident {
  //        constructor $constParam $constBody } => {
  //           function $className $constParam $constBody
  //        }

  //     case $className:ident 
  //     {
  //       constructor $constParam $constBody
  //       $($methodName:ident $methodParam $methodBody) ... 
  //     } 
  //     => {

  //       function $className $constParam $constBody

  //       $($className.prototype.$methodName
  //         = function $methodName $methodParam $methodBody; ) ...
  //     }

  //     case $className:ident < $super:lit 
  //     {
  //       constructor $constParam $constBody
  //       $($methodName:ident $methodParam $methodBody) ... 
  //     } 
  //     => {


  //       function $className $constParam $constBody
  //       $className.prototype = new $super.prototype();

  //       $($className.prototype.$methodName
  //         = function $methodName $methodParam $methodBody; ) ...
  //     }
  //   } 

  //   class Thing {
  //     constructor() {
  //       console.log('look you made a thing');
  //     }
  //   }

  //   class Person 
  //   {
  //     constructor(name) {
  //        this.name = name;
  //     }

  //     func() {
  //        console.log(func);
  //     }
  //   }

  //   class Me < Person 
  //   {
  //     constructor(name) {
  //        this.name = name;
  //     }

  //     anotherFunc(arg1, arg2) {
  //        console.log(arg1, arg2)
  //     }
  //   } 
  // });



});
