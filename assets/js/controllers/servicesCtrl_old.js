'use strict';
/**
 * controllers for UI Bootstrap components
 */


app.controller('servicesCtrl', ["$scope", "$filter", "NgTableParams", "$uibModal", "$timeout", "SweetAlert", 'modalProvider', 'APP', 'notifications', "$http","restSessionOut", function ($scope, $filter, NgTableParams, $uibModal, $timeout, SweetAlert, modalProvider, APP, notifications, $http, restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    $scope.list_service_category = function(get__cat_id){
        
        if(get__cat_id != 0){

        $http.get(APP.API + 'single_service_category/'+get__cat_id
        ).then(function (response) {
             try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
           // console.log('responce',response)
            //console.log('return_data', response.data);
            $scope.service_categories = response.data.data;
            //const peopleArray = Object.keys(peopleObj).map(i => peopleObj[i])
        }).catch(function (request, status, errorThrown) {
    
        });

        }else{
        $http.get(APP.API + 'list_service_category'
        ).then(function (response) {
             try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
           // console.log('responce',response)
            //console.log('return_data', response.data);
            $scope.service_categories = response.data.data;
           

            //const peopleArray = Object.keys(peopleObj).map(i => peopleObj[i])
        }).catch(function (request, status, errorThrown) {
    
        });
    }

    }
    
    $scope.list_service = function(get__service_id){


     if(get__service_id != 0){

        $http.get(APP.API + 'single_service/'+get__service_id
    ).then(function (response) {
         try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
       console.log('return_data', response.data);
        $scope.services = response.data.data;
       
    }).catch(function (request, status, errorThrown) {

    });

        }else{
    $http.get(APP.API + 'list_service'
    ).then(function (response) {
         try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
       console.log('return_data', response.data);
        $scope.services = response.data.data;
        $scope.service_categories_array = response.data.data_array;
    }).catch(function (request, status, errorThrown) {

    });
     }
     }
     
     $scope.list_service_category(0);
     $scope.list_service(0);
$scope.onSelected = function (selectedItem) {
    $scope.list_service_category(selectedItem.category_id);
    $scope.list_service(selectedItem.id);
  
    }
    $http.get(APP.API + 'list_tax'
    ).then(function (response) {
         try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
        console.log('return_data', response.data);
        $scope.taxes = response.data.data;
    }).catch(function (request, status, errorThrown) {
    });

    $scope.add_editService = function (form_data) {
        if (form_data != 0) {
            if (typeof (form_data) != 'object') {
                $scope.data_inside_modal = {
                    button: ['Add', 'Save'],
                    data: {category_id: form_data} ,
                    durations: [
                        { 'id': 5 },
                        { 'id': 10 },
                        { 'id': 15 },
                        { 'id': 20 },
                    ],
                    service_categories: $scope.service_categories,
                    taxes: $scope.taxes,

                }
            } else {
                $scope.data_inside_modal = {
                    button: ['Edit', 'Update'],
                    data: form_data,
                    durations: [
                        { 'id': 5 },
                        { 'id': 10 },
                        { 'id': 15 },
                        { 'id': 20 },
                    ],
                    service_categories: $scope.service_categories,
                    taxes: $scope.taxes,

                }
            }
        } else {

            $scope.data_inside_modal = {
                button: ['Add', 'Save'],
                data: 0,
                durations: [
                    { 'id': 5 },
                    { 'id': 10 },
                    { 'id': 15 },
                    { 'id': 20 },
                ],
                service_categories: $scope.service_categories,
                taxes: $scope.taxes,

            }
        }
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'services/addServiceModalContent.html',
                'addServiceController',
                '',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.clearAll(state, title, msg);
                    }
                },
            )
    };

    $scope.clearAll = function (state, title, msg) {
        notifications.Message(state, title, msg);
        $scope.list_service(0);
        // notifications.Message('success', 'Success', 'Service category add successfully !!');
    }


    $scope.deleteService = function (service_id) {
        $scope.delete_service_id = { id: service_id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete selected service!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {

            if (isConfirm) {
                $http.post(APP.API + 'delete_service', $scope.delete_service_id
                ).then(function (response) {
                     try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
                    console.log('return_data', response.data);
                    notifications.Message('error', 'Delete', 'Service delete successfully !!');
                    $scope.list_service();
                    

                }).catch(function (request, status, errorThrown) {

                });
            } else {
               
            }
        });
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


app.controller('addServiceController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb","restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb,restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    $scope.submitServiceForm = function () {
        if ($('#id_serviceForm').valid()) {
        if (typeof ($scope.service.id) !== 'undefined') {
            $http.post(APP.API + 'update_service', $scope.service
            ).then(function (response) {

                 try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
                console.log('return_data', response.data);
                var return_responce = response.data;
                if (return_responce.success != false) {
                    $uibModalInstance.close();
                    cb.success('success', 'Success', return_responce.message);
                } else {
                    cb.success('warning', 'Alredy Exist', return_responce.message);
                }
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function (error) {
                    console.log('error', error)
                    for (var i = 0; i < error.length; i++) {
                        cb.success('error', 'Error', error[i]);
                    }
                });
            });
        } else {
            $http.post(APP.API + 'add_service', $scope.service
            ).then(function (response) {

                 try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
                console.log('return_data', response.data);
                var return_responce = response.data;
                if (return_responce.success != false) {
                    $uibModalInstance.close();
                    cb.success('success', 'Success', return_responce.message);
                } else {
                    cb.success('error', 'Error', return_responce.message);
                }

            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function (error) {
                    console.log('error', error)
                    for (var i = 0; i < error.length; i++) {
                        cb.success('error', 'Error', error[i]);
                    }
                });
            });
        }
     }else{
        return false;
    }
    }
    $scope.items = items;
    if (items.data != 0) {
        $scope.service = items.data;
    }

    $scope.isInvalid = function (field) {
        return $scope.serviceCategoryForm[field].$invalid && $scope.serviceCategoryForm[field].$dirty;
    };

    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

  

}]);

