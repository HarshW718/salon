'use strict';
/**
 * controllers for UI Bootstrap components
 */



app.controller('productCtrl', ["$scope", "$http", "SweetAlert", "modalProvider", "APP", "notifications", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder", "$compile", function ($scope, $http, SweetAlert, modalProvider, APP, notifications, restSessionOut, DTOptionsBuilder, DTColumnBuilder, $compile) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    var productsCsv = [];
    $scope.list_product = function () {
        $http.get(APP.API + 'list_product'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            var product_table_header = '<table><tr><th>Category</th><th>Type</th><th>EAN</th><th>SKU</th><th>Product</th><th>Purchase</th><th>Sale</th><th>BTW</th><th>Supplier</th><th>Stock</th><th>Minimal</th><th>Shortage</th></tr>';
            var product_table_footer = '</table>';
            var product_table_tr = '';
            angular.forEach(response.data.data, function (product, key) {
                
                var _type = product.type == '1' ? 'Salon' : 'Homecare';
                var _tax = (product.product_tax == null) ? '---' : product.product_tax.name;
                product_table_tr +=  '<tr><td>'+ product.product_category.name+'</td><td>'+_type+'</td><td>'+product.ean+'</td><td>'+product.sku+'</td><td>'+product.name+'</td><td>'+product.purchase_price+'</td><td>'+product.sale_price+'</td><td>'+_tax+'</td><td>'+product.product_company.name+'</td><td>'+product.stocke+'</td><td>'+product.min_stocke+'</td><td>'+(product.stocke - product.min_stocke)+'</td></tr>';

            });
            
            //$scope.downloadCsv = productsCsv;
            $scope.html_data = product_table_header+product_table_tr+product_table_footer;
            console.log('$scope.html_data',$scope.html_data)
            $scope.products_length = response.data.data.length;
        }).catch(function (request, status, errorThrown) {

        });

    }
    $scope.list_product();
    $http.get(APP.API + 'list_product_category'
    ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) { }
        $scope.products_category = response.data.product_categories;
    }).catch(function (request, status, errorThrown) {

    });
    $http.get(APP.API + 'list_company'
    ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) { }
        $scope.products_company = response.data.data;
    }).catch(function (request, status, errorThrown) {

    });

    $http.get(APP.API + 'list_tax'
    ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) { }
        $scope.taxes = response.data.data;
    }).catch(function (request, status, errorThrown) {
    });

    $scope.downloadXls = function(){
        
        // var blob = new Blob([document.getElementById('customerDatatable_wrapper').innerHTML], {
            var blob = new Blob([$scope.html_data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "productDatatable.xls");
    }

    $scope.add_editProduct = function (form_data) {
      
        if (form_data == 0) {
            $scope.data_inside_modal = {
                button: ['Add', 'Save'],
                data: 0,
                product_categories: $scope.products_category,
                product_companies: $scope.products_company,
                taxes: $scope.taxes,
            }
            modalProvider
                .openPopupModal(
                    APP.VIEW_PATH + 'products/addProductModalContent.html',
                    'addProductController',
                    'lg',
                    $scope.data_inside_modal,
                    {
                        'success': function (state, title, msg) {
                            $scope.clearAll(state, title, msg);
                        }
                    },
                )
        } else {
           
                    if (form_data != '') {
                        $scope.data_inside_modal = {
                            button: ['Edit', 'Update'],
                            data: form_data,
                            product_categories: $scope.products_category,
                            product_companies: $scope.products_company,
                            taxes: $scope.taxes,
                        }
                    } else {

                        $scope.data_inside_modal = {
                            button: ['Add', 'Save'],
                            data: 0,
                            product_categories: $scope.products_category,
                            product_companies: $scope.products_company,
                            taxes: $scope.taxes,
                        }
                    }
                    modalProvider
                        .openPopupModal(
                            APP.VIEW_PATH + 'products/addProductModalContent.html',
                            'addProductController',
                            'lg',
                            $scope.data_inside_modal,
                            {
                                'success': function (state, title, msg) {
                                    $scope.clearAll(state, title, msg);
                                }
                            },
                        )
                
        }
    }
    
    $scope.sync_request = function () {
      
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'products/syncProductModal.html',
                'syncProductController',
                'lg',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.clearAll(state, title, msg);
                    }
                },
            )
        
    }
    
    $scope.clearAll = function (state, title, msg) {
        notifications.Message(state, title, msg);
        $scope.dtInstanceInvoiceRequest.rerender();
    }

    $scope.deleteProduct = function (product_id) {
        $scope.delete_product_id = { id: product_id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete selected product!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {

            if (isConfirm) {
                $http.post(APP.API + 'delete_product', $scope.delete_product_id
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    notifications.Message('success', 'Success', 'Product delete successfully !!');
                    $scope.dtInstanceInvoiceRequest.rerender();
                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });
    }
    $scope.refresh = function () {
        $scope.dtInstanceInvoiceRequest.rerender();
    }
    $scope.selected = {};

    $scope.checkAll = function () {

        if ($scope.checkbox_top == undefined) {
            $scope.checkbox_top = true;
            angular.forEach($scope.products, function (product) {
                $scope.selected[product.id] = true;
            });
        } else if ($scope.checkbox_top == true) {
            $scope.checkbox_top = false;
            angular.forEach($scope.products, function (product) {
                $scope.selected[product.id] = false;
            });
        } else if ($scope.checkbox_top == false) {
            $scope.checkbox_top = true;
            angular.forEach($scope.products, function (product) {
                $scope.selected[product.id] = true;
            });

        }
    };


    $scope.singleCheck = function (product_id) {
        angular.forEach($scope.products, function (product) {
            if (product.id == product_id) {
                $scope.selected[product.id] = $scope.selected[product_id];
            }

        });
    };

    $scope.moveToTrash = function () {

        var checkArr = [];
        $.each($("input[name='check']:checked"), function () {
            checkArr.push($(this).val());
        });
        $scope.delete_ids = checkArr;
        if (checkArr.length == 0) {
            notifications.Message('error', 'Error', 'Please select product for delete');
            return false;
        }
        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to delete selected product!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_product_all', $scope.delete_ids
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    $(".select_all").prop("checked", false);
                    notifications.Message('success', 'Success', 'Selected product delete successfully !!');
                    $scope.dtInstanceInvoiceRequest.rerender();
                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });

    }
    $scope.fileUpload = function () {

        $scope.data_inside_modal = {
            button: ['Add', 'Save'],

        }

        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'products/uploadProductModalContent.html',
                'uploadProductController',
                '',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.clearAll(state, title, msg);
                    }
                },
            )



    }
    
    $scope.dtIntanceInvoiceRequestCallback_main = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;
    var titleHtml = '<div class="checkbox clip-check check-primary ng-scope"><input type="checkbox" id="0_ischeck_0" class="select_all" ng-click="clickme()"><label for="0_ischeck_0"></label></div>';
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
            url: APP.API + 'newProductList',
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
                $scope.tableDataLength = response.data.data.length;
                callback({
                    draw: response.data.draw,
                    recordsTotal: response.data.recordsTotal,
                    recordsFiltered: response.data.recordsFiltered,
                    data: response.data.data
                });
                $('.select_all').prop('checked', false);
                $("#productDatatable_info").parent().addClass('pagination_width');
                $("#productDatatable_paginate").parent().addClass('pagination_width');
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
        //DTColumnBuilder.newColumn('id').withTitle("ID").withOption('sName', 'id'),
        DTColumnBuilder.newColumn('id').withTitle(titleHtml).notSortable().withOption('sName', 'id').renderWith(checkboxRow),
        /* DTColumnBuilder.newColumn('id').withTitle("<input type='checkbox'").withOption('sName', '').renderWith(displayOngoningCheckbox), */
        DTColumnBuilder.newColumn('name').withTitle('Product Name').withOption('sName', 'name'),
        DTColumnBuilder.newColumn('category_name').withTitle('Category').withOption('sName', 'category_name'),
        DTColumnBuilder.newColumn('company_name').withTitle('Supplier').withOption('sName', 'company_name'),
        // DTColumnBuilder.newColumn('ean').withTitle('Ean').withOption('sName', 'ean'),
        // DTColumnBuilder.newColumn('sku').withTitle('SKU').withOption('sName', 'sku'),
        // DTColumnBuilder.newColumn('tax_name').withTitle('Tax').withOption('sName', 'tax_name'),
        DTColumnBuilder.newColumn('stocke').withTitle('Stock').withOption('sName', 'stocke').renderWith(stockelist),
        DTColumnBuilder.newColumn('min_stocke').withTitle('Minimum').withOption('sName', 'min_stocke'),

        DTColumnBuilder.newColumn('shortage').withTitle('Shortage').withOption('sName', 'shortage').renderWith(shortagelist),
        DTColumnBuilder.newColumn('sale_price').withTitle('Sale Price').withOption('sName', 'sale_price'),
        DTColumnBuilder.newColumn('purchase_price').withTitle('Purchase Price').withOption('sName', 'purchase_price'),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs_main = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }
    function checkboxRow(data, type, full, meta) {
        return '<div class="checkbox clip-check check-primary ng-scope"><input type="checkbox" id="' + data + '_ischeck_0" class="checkBoxClass" ng-click="singleCheckBoxClick()" name="check" value="' + data + '" />  <label for="' + data + '_ischeck_0"></label></div>';
    }
    function displayOngoningCheckbox(data, type, full, meta) {
        //return '<input type="checkbox" id="' + full.id + '"   class="ongoingCheckbox" name="match_ids[]"  value="' + full.id + '" >';
        return '<input type="checkbox" id="' + full.id + '_checkbox" ng-change="singleCheck(' + full.id + ')" class="ongoingCheckbox" ng-model="selected[' + full.id + ']" value="' + full.id + '">'
    }

    function actionList(data, type, full, meta) {
       
        var full_string = JSON.stringify(full);
        return "<a ng-click='add_editProduct(" + full_string + ")' title='Edit product' ><i class='fa fa-edit text-large'></i></a><a class='margin-left-10' title='Delete product'><i ng-click='deleteProduct(" + full.id + ")' class='fa fa-remove text-large'></i></a>";
    }
   
    function shortagelist(data, type, full, meta) {
        if (data < 0) {
            return '<span class="text-red">' + data * -1 + '</span>';
        } else {
            return '';
        }
    }
    function stockelist(data, type, full, meta) {
        if (data == 0) {
            return '<span class="text-red">' + data + '</span>';
        } else {
            return data;
        }
    }
    $scope.clickme = function () {
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


    $scope.main_products_table = true;
    $scope.mobile_products_table =false;
    var for_mobile_table = false;
    $scope.mobileDisplay = function () {

       // alert(for_mobile_table)

        if(for_mobile_table != false){
            for_mobile_table = false;
        }else{
            for_mobile_table = true;
        }

        $scope.main_products_table = (!for_mobile_table);
        $scope.mobile_products_table = for_mobile_table;
    }

    $scope.dtIntanceInvoiceRequestCallback_mobile = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;
    $scope.dtOptionInvoiceRequest_mobile = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
        if (data.order[0].column == 0) {
            var sque = 'desc';
            var columnmna = 'id';
        } else {
            var sque = data.order[0].dir;
            var columnmna = data.columns[data.order[0].column].name;
        }
        $http({
            method: "post",
            url: APP.API + 'newProductList',
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
       

    $scope.dtColumnInvoiceRequest_mobile = [
        DTColumnBuilder.newColumn('name').withTitle('Product Name').withOption('sName', 'name').renderWith(nameHtml),
        DTColumnBuilder.newColumn('shortage').withTitle('Shortage').withOption('sName', 'shortage').renderWith(shortagelist),
    ];
    $scope.dtColumnInvoiceRequestDefs_mobile = [

    ];

    function nameHtml(data, type, full, meta){
        return '<span >' + data + '</span>';
    }

    function shortagelist(data, type, full, meta) {
        if (data < 0) {
            return '<span class="text-red">' + data * -1 + '</span>';
        } else {
            return '';
        }
    }
    


}]);


app.controller('addProductController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    toaster.options = {
        "positionClass": "toast-top-right",
        "timeOut": 800000
    }
    //define option

    $scope.product_typeOptions = [{'id':1,'name':'Salon'},{'id':2,'name':'Homecare'}];
    var php_api_link = '';
   
    $scope.submitProductForm = function () {
        if ($('#id_productForm').valid()) {
               php_api_link = (typeof($scope.product.id) !== 'undefined') ? 'update_product' : 'add_product';
                $http.post(APP.API + php_api_link, $scope.product
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    var return_responce = response.data;
                    debugger
                    console.log(return_responce);
                    if (return_responce.success != false) {
                        $uibModalInstance.close();
                        cb.success('success', 'Success', return_responce.message);
                    } 
                }).catch(function (request, status, errorThrown) {
                    var responce_error = request.data;
                    angular.forEach(responce_error.errors, function (error) {
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
        console.log(items.data);
        $scope.product = items.data;
    }
    $scope.selected = {
        item: ['add', 'edit']

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

app.controller('productsCategoriesCtrl', ["$scope", "$http", "SweetAlert", "APP", "notifications", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder", "$compile", function ($scope, $http, SweetAlert, APP, notifications, restSessionOut, DTOptionsBuilder, DTColumnBuilder, $compile) {

    var auth_token = localStorage.getItem('auth_token');
    var vm = this;
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if ($scope.product_category == undefined) {
        $scope.product_category = {};
    }
    $scope.product_category_form = true;
    $scope.product_category_list = false;
    $scope.showCategoryForm = function () {
        $scope.product_category_form = false;
        $scope.product_category.name = '';
        $scope.product_category_list = true;
    }
    $scope.hideCategoryForm = function () {
        $scope.dtInstanceInvoiceRequest.rerender();
        $scope.product_category_form = true;
        $scope.product_category_list = false;
       // $('#id_productCategoryForm').resetForm();

    }
    $scope.editProductCategory = function (edit_data) {
        $scope.product_category_form = false;
        $scope.product_category_list = true;
        $scope.product_category = edit_data;

    }

    var php_api_link = '';

    $scope.submitProductCategoryForm = function () {

        if ($('#id_productCategoryForm').valid()) {
           // angular.isUndefined($scope.product_category.id)

                php_api_link =  (typeof($scope.product_category.id) !== 'undefined') ? 'update_product_category' : 'add_product_category';
                $http.post(APP.API + php_api_link, $scope.product_category
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    var return_responce = response.data;
                    var return_responce = response.data;
                    if (return_responce.success != false) {
                        $scope.dtInstanceInvoiceRequest.rerender();
                        $scope.product_category_form = true;
                        $scope.product_category_list = false;
                        notifications.Message('success', 'Success', return_responce.message);
                    } else {
                        notifications.Message('error', 'Error', return_responce.message);
                    }
                }).catch(function (request, status, errorThrown) {
                    var responce_error = request.data;
                    angular.forEach(responce_error.errors, function (error) {
                        for (var i = 0; i < error.length; i++) {
                            notifications.Message('error', 'Error', error[i]);
                        }
                    });
                });
           
        } else {
            return false;
        }
    }


    $scope.deleteProductCategory = function (product_category_id) {
        $scope.delete_product_category_id = { id: product_category_id };
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
                $http.post(APP.API + 'delete_product_category', $scope.delete_product_category_id
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
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
            url: APP.API + 'dt_product_category_list',
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
        

    $scope.dtColumnInvoiceRequest = [
        DTColumnBuilder.newColumn('name').withTitle('Category Name').renderWith(nameHtml),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }


    function actionList(data, type, full, meta) {

        var full_string = JSON.stringify(full);
        return "<a ng-click='editProductCategory(" + full_string + ")'><i class='fa fa-edit text-large'></i></a><a class='margin-left-10'><i ng-click='deleteProductCategory(" + full.id + ")' class='fa fa-remove text-large'></i></a>";

    }
    function nameHtml(data, type, full, meta) {

        var full_string = JSON.stringify(full);
        return "<span><i class='fa fa-list-alt text-large'></i> " + full.name + " </span>";

    }

}]);

app.controller('productsCompaniesCtrl', ["$scope", "$http", "SweetAlert",  "APP", "notifications", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder", "$compile", function ($scope, $http,  SweetAlert, APP, notifications, restSessionOut, DTOptionsBuilder, DTColumnBuilder, $compile) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    $scope.company_form = true;
    $scope.company_list = false;
    if ($scope.product_company == undefined) {
        $scope.product_company = {};
    }
    $scope.showCompanyForm = function () {
        $scope.product_company.name = '';
        $scope.company_form = false;
        $scope.company_list = true;
    }
    $scope.hideCompanyForm = function () {
        $scope.dtInstanceInvoiceRequest.rerender();
        $scope.company_form = true;
        $scope.company_list = false;
    }

    $scope.editProductCompany = function (edit_data) {
        $scope.company_form = false;
        $scope.company_list = true;
        $scope.product_company = edit_data;

    }


    var php_api_link = '';
    $scope.submitProductCompanyForm = function () {

        if ($('#id_productCompanyForm').valid()) {

                php_api_link = (typeof($scope.product_company.id) !== 'undefined') ? 'update_company' : 'add_company';
                $http.post(APP.API + php_api_link, $scope.product_company
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    var return_responce = response.data;
                    var return_responce = response.data;
                    if (return_responce.success != false) {
                        $scope.dtInstanceInvoiceRequest.rerender();
                        $scope.company_form = true;
                        $scope.company_list = false;
                        notifications.Message('success', 'Success', return_responce.message);
                    } else {
                        notifications.Message('error', 'Error', return_responce.message);
                    }
                }).catch(function (request, status, errorThrown) {
                    var responce_error = request.data;
                    angular.forEach(responce_error.errors, function (error) {
                        for (var i = 0; i < error.length; i++) {
                            notifications.Message('error', 'Error', error[i]);
                        }
                    });
                });
           
        } else {
            return false;
        }
    }

    $scope.deleteProductCompany = function (product_company_id) {
        $scope.delete_product_company_id = { id: product_company_id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete selected company!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {

            if (isConfirm) {
                $http.post(APP.API + 'delete_company', $scope.delete_product_company_id
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
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
    }


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
            url: APP.API + 'dt_company_list',
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
        


    $scope.dtColumnInvoiceRequest = [
        DTColumnBuilder.newColumn('name').withTitle('Supplier').renderWith(nameHtml),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }


    function actionList(data, type, full, meta) {
        var full_string = JSON.stringify(full);
        return "<a ng-click='editProductCompany(" + full_string + ")'><i class='fa fa-edit text-large'></i></a><a class='margin-left-10'><i ng-click='deleteProductCompany(" + full.id + ")' class='fa fa-remove text-large'></i></a>";

    }

    function nameHtml(data, type, full, meta) {
        var full_string = JSON.stringify(full);
        return "<span><i class='fa fa-building-o text-large'></i> " + full.name + " </span>";
    }

}]);


app.controller('uploadProductController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }

    $scope.uploadFile = function (element) {
        $scope.file = element;


        console.log('$scope.file',$scope.file);
        
        var line = $scope.file.split("\n");
        var x, y;
        var table = "";
        var tr = "";
        var td = ""
        var column = []
        var final_data = [];

        for (x = 0; x <= line.length; x++) {

            if (line[x] != undefined) {
                final_data[x] = line[x];
                column[x] = line[x].split(",");
                tr += "<tr>";
                for (y = 0; y <= column[x].length; y++) {
                    if (column[x][y] != undefined) {

                        if (x == 0) {
                            td += "<th scope='col'>" + column[x][y] + "</th>";
                        } else {
                            td += "<td>" + column[x][y] + "</td>";
                        }

                    }

                }
                tr += td + "</tr>";
                td = "";
            }

        }
      
        $scope.csvData = final_data;
    
    }


    $scope.submitCsvData = function () {

        $http.post(APP.API + 'upload_csv_data', $scope.csvData
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            var return_responce = response.data;
            var return_responce = response.data;
            if (return_responce.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', return_responce.message);
            } else {
                cb.success('error', 'Error', return_responce.message);
                angular.element("input[type='file']").val(null);
                $scope.csvData = '';
               
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    notifications.Message('error', 'Error', error[i]);
                }
            });
        });

    }

    $scope.items = items;
    if (items.data != 0) {
        $scope.product = items.data;
    }
    $scope.selected = {
        item: ['add', 'edit']

    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);
