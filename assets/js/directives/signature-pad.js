'use strict';

app.directive("signaturePad", [
  "$window",
  function($window) {
    "use strict";

    var signaturePad,
      canvas,
      element,
      EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
    return {
      restrict: "EA",
      replace: true,
      template: '<div class="signature"><canvas></canvas></div>',
      scope: {
        accept: "=",
        clear: "=",
        dataurl: "=",
        height: "@",
        width: "@"
      },
      controller: [
        "$scope",
        function($scope) {
            
          $scope.accept = function() {
              
            var signature = {};

            if (!$scope.signaturePad.isEmpty()) {
              signature.dataUrl = $scope.signaturePad.toDataURL();
              signature.isEmpty = false;
            } else {
              signature.dataUrl = EMPTY_IMAGE;
              signature.isEmpty = true;
            }

            return signature;
          };

          $scope.clear = function() {
            $scope.signaturePad.clear();
          };

          $scope.$watch("dataurl", function(dataUrl) {
            if (dataUrl) {
              $scope.signaturePad.fromDataURL(dataUrl);
            }
          });
        }
      ],
      link: function(scope, element) {
        canvas = element.find("canvas")[0];

        scope.onResize = function() {
          var canvas = element.find("canvas")[0];
          var ratio = Math.max($window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          // canvas.height = canvas.offsetHeight * ratio;
          canvas.height = 300;
          canvas.getContext("2d").scale(ratio, ratio);
        };
        scope.onResize();
        scope.signaturePad = new SignaturePad(canvas);
        angular.element($window).bind("resize", function() {
          scope.onResize();
        });
      }
    };
  }
]);
