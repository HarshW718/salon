'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('giftUseCtrl', ["$scope", "$uibModal","SweetAlert","restSessionOut", function ($scope, $uibModal,SweetAlert,restSessionOut) {
    
     var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $scope.gift_form = true;
    $scope.gift_list = false;
    $scope.showGiftForm = function (){
        $scope.gift_form = false;
        $scope.gift_list = true;
    }
    $scope.hideGiftForm = function (){
        $scope.gift_form = true;
        $scope.gift_list = false;
    }



        $scope.add_items = ['Add','Save'];
        $scope.addCompany = function () {
            
            var modalInstance = $uibModal.open({
                templateUrl: 'addCompanyModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'sm',
                resolve: {
                    items: function () {
                        return $scope.add_items;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
               
            });
        };
        $scope.edit_items = ['Edit','Update'];
        $scope.editCompany = function () {
            
            var modalInstance = $uibModal.open({
                templateUrl: 'addCompanyModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'sm',
                resolve: {
                    items: function () {
                        return $scope.edit_items;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
               
            });
        };
        $scope.edit_items = ['Edit','Update'];
        $scope.showServices = function () {
            
              var modalInstance = $uibModal.open({
                  templateUrl: 'showServiceModalContent.html',
                  controller: 'ModalServiceCtrl',
                  //size: 'lg',
                  resolve: {
                      items: function () {
                          return $scope.edit_items;
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
        
          $scope.deleteCompany = function () {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Your will not be able to recover this imaginary file!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!"
            }, function () {
                SweetAlert.swal({
                    title: "Booyah!",
                    confirmButtonColor: "#007AFF"
                });
            });
        };
        $scope.test = function () {
            alert();
        }


}]);

app.controller('ModalServiceCtrl', ["$scope", "$uibModalInstance", "items","restSessionOut", function ($scope, $uibModalInstance, items,restSessionOut) {

 var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
   
    $scope.hide_show_1 = false;
    $scope.hide_show_2 = false;
    $scope.category1 = function (index) {

        if ($scope['hide_show_' + index] != true) {
            $scope['hide_show_' + index] = true;
        } else {
            $scope['hide_show_' + index] = false;
        }
        // 'value' + i;

    }
    

}]);
