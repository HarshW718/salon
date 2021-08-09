app.controller('sync_requestCtrl', ["$scope", "restSessionOut", "$http", "APP", "notifications", 'DTOptionsBuilder', 'DTColumnBuilder','$compile', function ($scope, restSessionOut, $http, APP, notifications, DTOptionsBuilder, DTColumnBuilder, $compile) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    
    if($scope.company==undefined){
        $scope.company={};
    }
    
    $scope.sendSinkRequest = function () {
        
        if($scope.company.email.length>0){
            $http.post(APP.API + 'send_sync_request', $scope.company

            ).then(function (response) {
                
                if(response.data.success==false){

                    $scope.company={};
                    $scope.dtInstanceInvoiceRequest.rerender();
                    notifications.Message('success','Success',response.data.message)
                }else {
                    
                    notifications.Message('error','Error',response.data.message);
                }

            });
        }else {
            notifications.Message('error','Error',"Please insert email id which company with you want to sync");
            return false;
        }
   
    }
    
    $scope.dtIntanceInvoiceRequestCallback = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;
    //  var titleHtml = '<div class="checkbox clip-check check-primary ng-scope"><input type="checkbox" id="0_ischeck_0" class="select_all" ng-click="clickme()"><label for="0_ischeck_0"></label></div>';
    $scope.dtOptionInvoiceRequest = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
        if (data.order[0].column == 0) {
            var sque = 'desc';
            var columnmna = 'id';
        } else {
            var sque = data.order[0].dir;
            var columnmna = data.columns[data.order[0].column].name;
        }

        $http({
            method: "post",
            url: APP.API + 'dt_sync_list',
            data: {

                length: data.length,
                start: data.start,
                draw: data.draw,
                column_name: columnmna,
                order: sque,
                search: data.search.value,


            }
        }).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }

            if (response.data.success) {
                callback({
                    draw: response.data.draw,
                    recordsTotal: response.data.recordsTotal,
                    recordsFiltered: response.data.recordsFiltered,
                    data: response.data.data
                });
            } else {

            }
        }, function (error) {
        });
    })
        .withDataProp('data')
        .withOption('processing', false)
        .withOption('serverSide', true)
        .withOption('createdRow', createdRow)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('destroy', true)
        .withDisplayLength(10)
        .withBootstrap()
        .withPaginationType('simple')




    $scope.dtColumnInvoiceRequest = [
        DTColumnBuilder.newColumn('email').withTitle('Company email'),
        DTColumnBuilder.newColumn('is_allow').withTitle('Status'),
       
    ];
    $scope.dtColumnInvoiceRequestDefs = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }



}])

