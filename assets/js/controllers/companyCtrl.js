'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('companyCtrl', ["$scope","$uibModal","SweetAlert","restSessionOut", function ($scope, $uibModal,SweetAlert,restSessionOut) {
    
     var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $("#ui-datepicker-div").hide();
    $scope.company_form = true;
    $scope.company_list = false;
    $scope.showCompanyForm = function (){
        $scope.company_form = false;
        $scope.company_list = true;
    }
    $scope.hideCompanyForm = function (){
        $scope.company_form = true;
        $scope.company_list = false;
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
        
          $scope.deleteCompany = function () {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to delete selected company!",
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


}]);

