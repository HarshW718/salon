
app.controller('editCompanyCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", "SweetAlert", "block_duration", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut, SweetAlert, block_duration) {
        $scope.cancel = function () {
            $uibModalInstance.close();
        };

        $scope.myHTML = items.invoiceSetting;
    }])
app.filter('trusted', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html)
    }
});



