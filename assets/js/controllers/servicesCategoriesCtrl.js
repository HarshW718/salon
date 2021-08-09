'use strict';
//var path = 'api/api/';

/**
 * controllers for UI Bootstrap components
 */
app.controller('servicesCategoriesCtrl', ["$scope", "SweetAlert", 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', 'modalProvider', 'APP', 'notifications', 'restSessionOut', function ($scope, SweetAlert, DTOptionsBuilder, DTColumnBuilder, $compile, $http, modalProvider, APP, notifications, restSessionOut) {


    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }

    $scope.add_editCategory = function (form_data) {
        if (form_data != 0) {
            $scope.data_inside_modal = {
                button: ['Edit', 'Update'],
                data: form_data
            }
        } else {

            $scope.data_inside_modal = {
                button: ['Add', 'Save'],
                data: 0,
            }
        }
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'services_categories/addCategoryModalContent.html',
                'addServiceCategoryController',
                'sm',
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
        $scope.dtInstanceInvoiceRequest.rerender();

        // notifications.Message('success', 'Success', 'Service category add successfully !!');
    }

    $scope.deleteCategory = function (service_category_id) {
        $scope.cat_id = { id: service_category_id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete selected category!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_service_category', $scope.cat_id
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    console.log('return_data', response.data);
                    if (response.data.success != true) {
                        notifications.Message('warning', 'Warning', response.data.message);
                    } else {
                        notifications.Message('success', 'Success', response.data.message);
                        $scope.dtInstanceInvoiceRequest.rerender();
                    }



                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });
    };












    //For Data Table Start



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
            url: APP.API + 'dt_category_list',
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
        .withPaginationType('full_numbers')




    $scope.dtColumnInvoiceRequest = [
        DTColumnBuilder.newColumn('name').withTitle('Category Name').renderWith(nameHtml),
        DTColumnBuilder.newColumn('name').withTitle('Type').renderWith(typeHtml),
        DTColumnBuilder.newColumn('name').withTitle('Color').renderWith(colorHtml),
        DTColumnBuilder.newColumn('gender').withTitle('Gender').renderWith(genderHtml),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }


    function actionList(data, type, full, meta) {

        var full_string = JSON.stringify(full);
        return "<a ng-click='add_editCategory(" + full_string + ")' title='Edit service category'   ><i class='fa fa-edit text-large'></i></a><a class='margin-left-10' title='Delete service category' ><i ng-click='deleteCategory(" + full.id + ")' class='fa fa-remove text-large'></i></a>";

    }
    function nameHtml(data, type, full, meta) {

        return "<span><i class='fa fa-list-alt text-large'></i> " + full.name + " </span>";

    }

    function typeHtml(data, type, full, meta) {

        // var full_string = JSON.stringify(full);
        var cat_type = (full.type == 1) ? 'Machine' : 'Service';
        return "<span> " + cat_type + " </span>";

    }

    function genderHtml(data, type, full, meta) {

        //  return '<h3 class="text-center"><i class="fa fa-square" ng-style="{color:red}" ></i></h3>';
        if(full.gender == 1)
        {
            return "<span> male </span>";
        }
        else if(full.gender == 2)
        {
            return "<span> female </span>";
        }
        else
        {
            return "<span> other </span>";
        }
        


    }

    function colorHtml(data, type, full, meta) {

        //  return '<h3 class="text-center"><i class="fa fa-square" ng-style="{color:red}" ></i></h3>';
        return '<h3 class="text-center"><i class="fa fa-square" style="color:' + full.color + ';" ></i></h3>';


    }



}]);

app.controller('addServiceCategoryController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    toaster.options = {
        "positionClass": "toast-top-right",
        "timeOut": 800000
    }

    var php_api_link = '';

    $scope.submitServiceCategoryForm = function () {
        if ($('#id_serviceCategoryForm').valid()) {

            if($scope.service_category.gender == undefined)
            {
                $scope.gender_validation = true;
                $scope.gender_validation_message = "Gender field is required";
            }
            php_api_link = (typeof ($scope.service_category.id) !== 'undefined') ? 'update_service_category' : 'add_service_category';
            $http.post(APP.API + php_api_link, $scope.service_category
            ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) { }

                var return_responce = response.data;
                console.log(return_responce);
                if (return_responce.success != false) {
                    $uibModalInstance.close();
                    cb.success('success', 'Success', return_responce.message);
                }
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                console.log(responce_error);
                angular.forEach(responce_error.errors, function (error) {
                    console.log('error', error)
                    for (var i = 0; i < error.length; i++) {
                        toaster.pop('error', 'Error', error[i]);
                    }
                });
            });

        } else {
            return false;
        }
    }
    $scope.items = items;
    if (items.data != 0) {
        $scope.service_category = items.data;
    }
    $scope.cat_types = [
        { 'id': 1, 'label': 'Machine' },
        { 'id': 2, 'label': 'Service' },
    ]

    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.toaster = {
        type: 'success',
        title: 'Title',
        text: 'Message'
    };
    $scope.pop = function () {
        // toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
        toaster.pop('success', 'Success', 'Data Insert');
    };

}]);


