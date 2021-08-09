
app.controller('showServiceModalController', ["$scope", "$uibModalInstance", "$http", "items", "APP",  "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }

    $scope.search_service_table = true;
    
    if (items) {
        $scope.all_service_cat = items.all_service_cat;
        $scope.all_services = items.all_services;
        $scope.service_form_ids = items.service_form_id;
        $scope.tax__id = items.tax__id
    }
    $scope.hide_show_1 = false;
    $scope.hide_show_2 = false;
    $scope.category1 = function (index) {

        if ($scope['hide_show_' + index] != true) {
            $scope['hide_show_' + index] = true;
        } else {
            $scope['hide_show_' + index] = false;
        }

    }
    $scope.onKeyUp = function () {
        var serach_value = $scope.search;
        if (serach_value.search_service != undefined) {
            $scope.main_table = true;
            $scope.search_service_table = false;
        } else {
            $scope.main_table = false;
            $scope.search_service_table = true;

        }
        var searc_data = { search: $scope.search, ids: $scope.service_form_ids, taxid: $scope.tax__id }

       

        $http.post(APP.API + 'search_service_for_coupon', searc_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
    
            $scope.searched_services = response.data.data;
            //const peopleArray = Object.keys(peopleObj).map(i => peopleObj[i])
        }).catch(function (request, status, errorThrown) {

        });

    }
    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.add_Service_inForm = function (service) {
        $uibModalInstance.close();
        cb.success('service', 'service_data', service);

    }

}]);
