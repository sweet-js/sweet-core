var expect = require("expect.js");

// Dumping regression tests that don't have obvious or simple
// descriptions or code. Each test should have the github issue
// for reference.

describe("various regressions", function() {
    it("This was failing to parse because of a `;` #375", function() {
        (function () {
            "use strict";
            angular.module('cells', [ ])
                .directive('s', [function () {
                    return {
                        link: function ($scope, iElement, iAttrs, dCell) {
                            $scope.$watch('show_base_s', function (newValue, oldValue) {
                                //if (newValue === oldValue) return;
                                $scope.before[0]++;
                            });
                        },
                    };
                }])
            ;
        });
    });
});
