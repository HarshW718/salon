'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('productsCategoriesCtrl', ["$scope","$uibModal","SweetAlert", function ($scope, $uibModal,SweetAlert) {
        
        $scope.product_category_form = true;
        $scope.product_category_list = false;
        $scope.showCategoryForm = function (){
            $scope.product_category_form = false;
            $scope.product_category_list = true;
        }
        $scope.hideCategoryForm = function (){
            $scope.product_category_form = true;
            $scope.product_category_list = false;
        }
        $scope.add_items = ['Add','Save'];
        $scope.addCategory = function () {
            
            var modalInstance = $uibModal.open({
                templateUrl: 'addCategoryModalContent.html',
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
        $scope.editCategory = function () {
            
            var modalInstance = $uibModal.open({
                templateUrl: 'addCategoryModalContent.html',
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
        
          $scope.deleteCategory = function () {
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


}]);

