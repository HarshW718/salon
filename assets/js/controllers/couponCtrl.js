'use strict';
/**
 * controllers for UI Bootstrap components
 */



app.controller('couponCtrl', ["$scope", "$http", "SweetAlert", "modalProvider", "APP", "notifications", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder", "$compile", function ($scope, $http, SweetAlert, modalProvider, APP, notifications, restSessionOut, DTOptionsBuilder, DTColumnBuilder, $compile) {

 
    $("#ui-datepicker-div").hide();
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }

    var service_ids = [];
    var taxid = [];
    $scope.service_below_form = false;
    $scope.coupon = {validity:1}


    $scope.service_list_for_coupon = function () {
        var service_data = { service_ids: service_ids, tax_id: ($scope.current_tax_id == undefined) ? 0 : $scope.current_tax_id.id }
       
        $http.post(APP.API + 'service_list_for_coupon', service_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            
            $scope.service_categories = response.data.service_categories;
            $scope.services = response.data.services;
        }).catch(function (request, status, errorThrown) {

        });

    }

    $scope.service_list_for_coupon()


    $scope.showServiceModal = function () {

        $scope.data_inside_modal = {
            all_service_cat: $scope.service_categories,
            all_services: $scope.services,
            service_form_id: ($scope.service_ids_for_form == undefined) ? [] : $scope.service_ids_for_form,
            tax__id: ($scope.current_tax_id == undefined) ? 0 : $scope.current_tax_id.id
        }

        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'coupons/showServicesModalContent.html',
                'showServiceModalController',
                '',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.clearAll(state, title, msg);
                    }
                },
            )
    };
    var services_array = [];

    $scope.clearAll = function (state, title, msg) {
        var service_from_modal = msg
        if (services_array.length != 0) {
            var find_index = services_array.findIndex(function (single_service) {
                return service_from_modal.id == single_service.id
            });
            if (find_index == -1) {
                services_array.push(service_from_modal)
                service_ids.push(service_from_modal.id)
            }
        } else {
            services_array.push(service_from_modal)
            service_ids.push(service_from_modal.id)
            taxid.push(service_from_modal.service_tax)
            $scope.current_tax_id = taxid[0]
            $scope.service_below_form = true;
        }

        $scope.service_list_for_coupon()
        $scope.service_for_form = services_array;
        $scope.service_ids_for_form = service_ids;
        


    }

$scope.removeServiceFrom_Form = function (serviceid) {

        if ($scope.coupon.services != undefined) {
          
            delete $scope.coupon.services[serviceid]
        }
        
        if (services_array.length != 0 && ($scope.service_for_form).length) {

            var find_index_of_id = service_ids.findIndex(function (single_service_id) {
                return serviceid == single_service_id
            });

            if (find_index_of_id != -1) {
                service_ids.splice(find_index_of_id, 1)

            }
            var find_index_for_remove = services_array.findIndex(function (single_service) {
                return serviceid == single_service.id
            });
            if (find_index_for_remove != -1) {
                services_array.splice(find_index_for_remove, 1)
            }
            if (services_array.length == 0) {
                $scope.service_below_form = false;
                taxid = []
                $scope.current_tax_id = {}
            }

            $scope.service_for_form = services_array
            $scope.service_ids_for_form = service_ids;
            $scope.service_list_for_coupon();

        }
    }

    $scope.coupon_form = true;
    $scope.coupon_list = false;
    $scope.showCouponForm = function (edit_data) {
        if (edit_data != 0) {
        if(edit_data.services != null && edit_data.services != undefined){
        edit_data.services = (edit_data.services!=null && edit_data.services!=undefined)?JSON.parse(edit_data.services):{};
                const edit_servicesid = Object.keys(edit_data.services);
                const edit_taxid = edit_data.tax_id
               
                $http.post(APP.API + 'service_list_at_edit', edit_servicesid
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    services_array = response.data.services;
                    service_ids = edit_servicesid
                    $scope.service_for_form = services_array;
                    $scope.service_ids_for_form = service_ids;
                    taxid = response.data.services[0].service_tax
                    $scope.current_tax_id = taxid;
                    $scope.service_list_for_coupon()
                    $scope.service_below_form = true;
                }).catch(function (request, status, errorThrown) {
        
                });
            }
            
            $scope.coupon = edit_data;
       
       
        } else {

            $scope.coupon = {validity:1}
        }
       
        $scope.coupon_form = false;
        $scope.coupon_list = true;

    }
    $scope.hideCouponForm = function () {
        $scope.coupon_form = true;
        $scope.coupon_list = false;
        services_array = []
        $scope.service_for_form = services_array
        service_ids = []
        $scope.service_ids_for_form = service_ids;
        taxid = []
        $scope.current_tax_id = {}
        $scope.service_below_form = false;
        $scope.coupon = {}
        $scope.service_list_for_coupon()

    }



$scope.saveCouponForm = function () {
        var php_api = ($scope.coupon.id != undefined && $scope.coupon.id != null) ? 'update_coupon': 'add_coupon';
        if($scope.coupon.services == undefined){
            notifications.Message('warning','Select Service','Choose at least one service !!');
            return false;
        }
        if ($scope.coupon.sale_price == undefined ) {
            $scope.sale_price_validation_message_display = true;
            $scope.sale_price_validation_message = "This field is required."
        } else {
            $scope.sale_price_validation_message_display = false;
            $scope.sale_price_validation_message = "";
        }
        if ($scope.coupon.validity == undefined || $scope.coupon.validity == null) {
            $scope.validity_validation_message_display = true;
            $scope.validity_validation_message = "This field is required.";
        } else if($scope.coupon.validity == 0) {
            $scope.validity_validation_message_display = true;
            $scope.validity_validation_message = "Validity 0 not allowed.";
        }else{
            $scope.validity_validation_message_display = false;
            $scope.validity_validation_message = "";
        }

        if ($('#id_couponForm').valid()) {
        if(!$scope.sale_price_validation_message_display && !$scope.validity_validation_message_display){
        $scope.coupon.tax_id = $scope.current_tax_id.id;
        $http.post(APP.API + php_api, $scope.coupon
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            var return_responce = response.data;
            if (return_responce.success != false) {

                notifications.Message('success', 'Success', return_responce.message);
                $scope.dtInstanceInvoiceRequest.rerender();
                $scope.hideCouponForm();
            } else {
                notifications.Message('error', 'Error', 'Error from database');
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    cb.success('error', 'Error', error[i]);
                }
            });
        });

        }
        }

    }

    $scope.dtIntanceInvoiceRequestCallback_main = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;

    $scope.dtOptionInvoiceRequest_main = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
            var sque = data.order[0].dir;
            var columnmna = data.columns[data.order[0].column].name;
        $http({
            method: "post",
            url: APP.API + 'dt_coupons_list',
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
                $("#couponDatatable_paginate").parent().addClass('pagination_width');
                $("#couponDatatable_paginate").parent().addClass('pagination_width');
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

    $scope.dtColumnInvoiceRequest_main = [
       // DTColumnBuilder.withOption('sName', 'id').notSortable(),
        //DTColumnBuilder.newColumn('id').notSortable().renderWith(idHtml),
       
       
       
        DTColumnBuilder.newColumn('description').withTitle('Coupons').withOption('sName', 'description').renderWith(descriptionHtml),
        DTColumnBuilder.newColumn('sale_price').withTitle('Price').withOption('sName', 'sale_price').renderWith(sale_priceHtml),
        DTColumnBuilder.newColumn('created_at').withTitle('Created').withOption('sName', 'created_at'),
        DTColumnBuilder.newColumn('email').withTitle('By').withOption('sName', 'email'),
        DTColumnBuilder.newColumn('id').withTitle("Action").renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs_main = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }
    // function idHtml(data, type, full, meta){
    //     return "";
    // }
    function sale_priceHtml(data, type, full, meta){
        return "<span><i class='fa fa-inr'></i> "+data+"</span>";
    }

    function actionList(data, type, full, meta) {
        //var full_string = JSON.stringify(full);
        return "<a class='margin-left-10' title='Delete coupon'><i ng-click='deleteCoupon(" + full.id + ")' class='fa fa-remove text-large'></i></a>";
    }

    function descriptionHtml(data, type, full, meta) {
        var full_string = JSON.stringify(full);
        return "<a class='margin-left-10 text-orange' ng-click='showCouponForm(" + full_string + ")' >" + data + "</a>";
    }


    $scope.deleteCoupon1 = function (delete_coupon_id){


    }


    $scope.deleteCoupon = function (delete_coupon_id) {
        var delete_coupon = {id:delete_coupon_id}
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete this coupon!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {

            if (isConfirm) {
                $http.post(APP.API + 'delete_coupon', delete_coupon
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                        if(response.data.success){
                            notifications.Message('success', 'Success', response.data.message);
                            $scope.dtInstanceInvoiceRequest.rerender();
                            $scope.hideCouponForm();
                        }else{
                            notifications.Message('warning', 'Coupon in used', response.data.message);
                        }
                    }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });
    }


}]);
