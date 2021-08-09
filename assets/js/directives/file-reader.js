'use strict';

app.directive('fileReader', [function () {
    return {
        require: 'ngModel',
        scope: { format: '@', upload: '&upload' },
        link: function (scope, el, attrs, ngModel) {
            // change event is fired when file is selected
            el.bind('change', function (event) {
                var files = event.target.files[0];
                console.log('files',files);
                if (files) {
                    console.log('infiles',files);
                    var r = new FileReader();
                    r.onload = function (e) {
                        var contents = e.target.result;
                        scope.upload({ file: contents });
                        scope.$apply(function () {
                            ngModel.$setViewValue(el.val());
                            ngModel.$render();
                        });
                    }
                    r.readAsText(files);
                }
            })
        }
    }
}]);