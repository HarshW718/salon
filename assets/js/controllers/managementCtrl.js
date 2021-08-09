'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('managementCtrl', ["$scope","$uibModal","$location","restSessionOut","$http", function ($scope, $uibModal,$location,restSessionOut,$http) {
    
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }

        
        $scope.items = ['item1', 'item2', 'item3'];
        $scope.addCustomers = function () {
          // alert('new customers');
            var modalInstance = $uibModal.open({
                templateUrl: 'addCustomerModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
               
            });
        };

        $scope.showCustomers = function (id) {
            
              var modalInstance = $uibModal.open({
                  templateUrl: 'showCustomerModalContent.html',
                  controller: 'ModalInstanceCtrl',
                  size: 'lg',
                  resolve: {
                      items: function () {
                          return $scope.items;
                      }
                  }
              });
              modalInstance.result.then(function (selectedItem) {
                  $scope.selected = selectedItem;
              }, function () {
                 
              });
          };
          $scope.showUpload = function(){

            alert('show upload');
          }
        
          $scope.go = function ( path ) {
              
           // $location.path( '/services' );
            $location.url('#!/app/pages/services');
          };


}]);

