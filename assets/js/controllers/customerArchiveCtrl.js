'use strict';
/**
 * controllers for UI Bootstrap components
 */


app.controller('customerArchiveCtrl', ["$scope", "$http", "SweetAlert", "APP", "notifications", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder", "$compile","modalProvider_compare", function ($scope, $http, SweetAlert, APP, notifications, restSessionOut, DTOptionsBuilder, DTColumnBuilder, $compile,modalProvider_compare) {

    $("#ui-datepicker-div").hide();
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }

    // var productsCsv = [];
    // $scope.list_custoers = function () {
    //     $http.get(APP.API + 'list_custoers'
    //     ).then(function (response) {
    //         try {
    //             if (response.data.status == "401") {
    //                 restSessionOut.getRstOut();
    //             }
    //         } catch (err) { }
    //         angular.forEach(response.data.data, function (product, key) {
    //             productsCsv[key] = { 'Category': product.product_category.name, 'Type': product.type == '1' ? 'Salon' : 'Sell', 'EAN': product.ean, 'SKU': product.sku, 'Product': product.name, 'Purchase': product.purchase_price, 'Sale': product.sale_price, 'BTW': (product.product_tax == null) ? '---' : product.product_tax.name, 'Supplier': product.product_company.name, 'Stock': product.stocke, 'Minimal': product.min_stocke, 'Shortage': (product.stocke - product.min_stocke) }

    //         });

    //         $scope.downloadCsv = productsCsv;
    //         $scope.products_length = response.data.data.length;
    //     }).catch(function (request, status, errorThrown) {

    //     });

    // }
    // $scope.list_custoers();

    $scope.add_editCustomer = function (form_data) {

        if (form_data != '') {

            $scope.data_inside_modal = {
                button: ['Edit', 'Update'],
                data: form_data,
            }
            modalProvider_compare
                .openPopupModal(
                    APP.VIEW_PATH + 'customers/updateCustomerModalContent.html',
                    'updateCustomerController',
                    'lg',
                    $scope.data_inside_modal,
                    {
                        'success': function (state, title, msg) {
                            $scope.clearAll(state, title, msg);
                        }
                    },
                    'largeWidth-modal'
                )
        }

    }

    $scope.clearAll = function (state, title, msg) {
        notifications.Message(state, title, msg);
        $scope.dtInstanceInvoiceRequest.rerender();
    }


    $scope.deleteCustomer = function (customer_id) {
        $scope.delete_customer_id = { id: customer_id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete selected customer!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {

            if (isConfirm) {
                $http.post(APP.API + 'delete_customer', $scope.delete_customer_id
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    if(response.data.success){
                        notifications.Message('success', 'Success', response.data.message);
                        $scope.dtInstanceInvoiceRequest.rerender();
                    }else{
                        notifications.Message('warning', 'Can not deleted !', response.data.message);
                    }
                    
                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });
    }

    $scope.dtIntanceInvoiceRequestCallback_main = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;
    var titleHtml = '<div class="checkbox clip-check check-primary ng-scope"><input type="checkbox" id="0_ischeck_0" class="select_all" ng-click="checkdMe()"><label for="0_ischeck_0"></label></div>';
    $scope.dtOptionInvoiceRequest_main = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
        if (data.order[0].column == 0) {
            var sque = 'desc';
            var columnmna = 'id';
        } else {
            var sque = data.order[0].dir;
            var columnmna = data.columns[data.order[0].column].name;
        }
        $http({
            method: "post",
            url: APP.API + 'dt_list_customers',
            data: {
                length: data.length,
                start: data.start,
                draw: data.draw,
                column_name: columnmna,
                order: sque,
                search: data.search.value,
                is_active: 0,

            }
        }).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }

            if (response.data.success) {
                $scope.tableDataLength = response.data.data.length;
                callback({
                    draw: response.data.draw,
                    recordsTotal: response.data.recordsTotal,
                    recordsFiltered: response.data.recordsFiltered,
                    data: response.data.data
                });
                $('.select_all').prop('checked', false);
                $("#customerArchiveDatatable_paginate").parent().addClass('pagination_width');
                $("#customerArchiveDatatable_paginate").parent().addClass('pagination_width');
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
        DTColumnBuilder.newColumn('id').withTitle(titleHtml).notSortable().withOption('sName', 'id').renderWith(checkboxRow),
        DTColumnBuilder.newColumn('firstname').withTitle('First Name').withOption('createdCell', function(td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function() 
            {$scope.$apply(function() { $scope.add_editCustomer(rowData)});});}),
        DTColumnBuilder.newColumn('lastname').withTitle('Last Name').withOption('createdCell', function(td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function() 
            {$scope.$apply(function() { $scope.add_editCustomer(rowData)});});}),
       
        DTColumnBuilder.newColumn('mobile').withTitle('Mobile').withOption('createdCell', function (td, cellData, rowData, row, col) {
                $(td).unbind('click');
                $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
            }).withOption('sName', 'mobile').renderWith(mobileHtml),
        
        DTColumnBuilder.newColumn('email').withTitle('Email').withOption('createdCell', function(td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function() 
            {$scope.$apply(function() { $scope.add_editCustomer(rowData)});});}),
        DTColumnBuilder.newColumn('gender').withTitle('Gender').withOption('createdCell', function(td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function() 
            {$scope.$apply(function() { $scope.add_editCustomer(rowData)});});}),
        DTColumnBuilder.newColumn('dob').withTitle('Birthday').withOption('createdCell', function(td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function() 
            {$scope.$apply(function() { $scope.add_editCustomer(rowData)});});}).renderWith(dobHtml),
        DTColumnBuilder.newColumn('created_at').withTitle('Last visit').withOption('createdCell', function(td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function() 
            {$scope.$apply(function() { $scope.add_editCustomer(rowData)});});}).renderWith(createdHtml),
        DTColumnBuilder.newColumn('created_at').withTitle('Created').withOption('createdCell', function(td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function() 
            {$scope.$apply(function() { $scope.add_editCustomer(rowData)});});}).renderWith(createdHtml),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs_main = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }

    function actionList(data, type, full, meta) {

        return "<a class='margin-left-10' title='Delete'><i ng-click='deleteCustomer(" + full.id + ")' class='fa fa-remove text-large'></i></a>";
    }

    function dobHtml(data, type, full, meta) {
        var ts = new Date(data);
        var dob_date = ts.toDateString().split(' ').slice(1).join(' ')
        return "<span  class='text-nowrap'>" + dob_date + "</span>";
    }

    function mobileHtml(data, type, full, meta) {
        var mobile = (data.toString().match(/.{1,2}/g)).join(' ')
        return "<span  class='text-nowrap'>" + mobile + "</span>";
    }

    function createdHtml(data, type, full, meta) {
        var date_data = data.split(' ');
        var ts = new Date(date_data[0]);
        var dob_date = ts.toDateString().split(' ').slice(1).join(' ')
        return "<span  class='text-nowrap'>" + dob_date + "</span>";
        
    }

    function checkboxRow(data, type, full, meta) {
        return '<div class="checkbox clip-check check-primary ng-scope"><input type="checkbox" id="' + data + '_ischeck_0" class="checkBoxClass" ng-click="singleCheckBoxClick()"  name="check" value="' + data + '" />  <label for="' + data + '_ischeck_0"></label></div>';
    }

    $scope.checkdMe = function () {
        if ($(".select_all").is(":checked")) {
            $('.checkBoxClass').prop('checked', true);
        } else {
            $('.checkBoxClass').prop('checked', false);
        }
    }

    $scope.singleCheckBoxClick = function(){
        var checkArr = [];
        $.each($("input[name='check']:checked"), function () {
            checkArr.push($(this).val());
        });
        if(checkArr.length == $scope.tableDataLength){
            $('.select_all').prop('checked', true);
        }else{
            $('.select_all').prop('checked', false);
        }
    }

    $scope.moveArchiveToNormal = function () {
        var checkArr = [];
        $.each($("input[name='check']:checked"), function () {
            checkArr.push($(this).val());
        });
        $scope.delete_ids = checkArr;
        if (checkArr.length == 0) {
            notifications.Message('error', 'Error', 'Please select customers to remove from archive.');
            return false;
        }
        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to remove selected customers from archive !",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes,remove from archive!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'remove_from_archive_customer_all', $scope.delete_ids
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    $(".select_all").prop("checked", false);
                    notifications.Message('success', 'Success', response.data.message);
                    $scope.dtInstanceInvoiceRequest.rerender();
                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });
    }
    $scope.moveArchiveToTrash = function () {
        var checkArr = [];
        $.each($("input[name='check']:checked"), function () {
            checkArr.push($(this).val());
        });
        $scope.delete_ids = checkArr;
        if (checkArr.length == 0) {
            notifications.Message('error', 'Error', 'Please select customers for delete');
            return false;
        }
        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to delete selected customers !",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes,delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_customer_all', $scope.delete_ids
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    if(response.data.success){
                    $(".select_all").prop("checked", false);
                    notifications.Message('success', 'Success', response.data.message);
                    $scope.dtInstanceInvoiceRequest.rerender();
                    }else{
                        notifications.Message('warning', 'Can not deleted !', response.data.message);
                    }
                }).catch(function (request, status, errorThrown) {
                });
            } else {
            }
        });
    }

    $scope.refreshCustomerArchive = function(){
        $scope.dtInstanceInvoiceRequest.rerender();
    }
}]);

