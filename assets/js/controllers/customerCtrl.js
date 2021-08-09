'use strict';
/**
 * controllers for UI Bootstrap components
 */



app.controller('customerCtrl', ["$scope", "$http","SweetAlert", "modalProvider", "APP", "notifications", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder", "$compile","modalProvider_compare","$timeout", function ($scope, $http, SweetAlert, modalProvider, APP, notifications, restSessionOut, DTOptionsBuilder, DTColumnBuilder, $compile,modalProvider_compare,$timeout) {

    
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
    $("#ui-datepicker-div").hide();
    $scope.add_editCustomer = function (form_data) {

        if (form_data == 0) {
            $scope.data_inside_modal = {
                button: ['Add', 'Save'],
                data: 0,
            }
            modalProvider
                .openPopupModal(
                    APP.VIEW_PATH + 'customers/addCustomerModalContent.html',
                    'addCustomerController',
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
                    parentController:'customerCtrl'

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
                        'compare-modal'
                    )

            } else {

                $scope.data_inside_modal = {
                    button: ['Add', 'Save'],
                    data: 0,

                }
                modalProvider
                    .openPopupModal(
                        APP.VIEW_PATH + 'customers/addCustomerModalContent.html',
                        'addCustomerController',
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
    }

    $scope.clearAll = function (state, title, msg) {
        if(state != 'close'){
            notifications.Message(state, title, msg);
        }
        $scope.dtInstanceInvoiceRequest.rerender();
    }

    $scope.customer_for_csv = function (){

        $http.get(APP.API + 'list_customer'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            var customer_table_header = '<table><tr><th>Firstname</th><th>Lastname</th><th>Gender</th><th>Mobile</th><th>Email</th><th>Date of birth</th><th>Postal code</th><th>House no</th><th>Address</th><th>Care account no</th><th>Created at</th></tr>';
            var customer_table_footer = '</table>';
            var customer_table_tr = '';
            angular.forEach(response.data.data, function (customer, key) {
                
                customer_table_tr +=  '<tr><td>'+customer.firstname+'</td><td>'+customer.lastname+'</td><td>'+customer.gender+'</td><td>'+customer.mobile+'</td><td>'+customer.email+'</td><td>'+customer.dob+'</td><td>'+customer.postal_code+'</td><td>'+customer.house_no+'</td><td>'+customer.address+'</td><td>'+customer.care_account_no+'</td><td>'+customer.created_at+'</td></tr>';

            });
            
            $scope.html_data = customer_table_header+customer_table_tr+customer_table_footer;
        }).catch(function (request, status, errorThrown) {

        });

    }
    $scope.customer_for_csv()
    $scope.customerRefresh = function (){
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
                    notifications.Message('success', 'Success', 'Customer delete successfully !!');
                    $scope.dtInstanceInvoiceRequest.rerender();
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
                is_active: 1,

            }
        }).then(function (response) {

            
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }

            if (response.data.success) {
                console.log(response.data.data);
                $scope.tableDataLength = response.data.data.length;
                callback({
                    draw: response.data.draw,
                    recordsTotal: response.data.recordsTotal,
                    recordsFiltered: response.data.recordsFiltered,
                    data: response.data.data


                });
                $('.select_all').prop('checked', false);
                $("#customerDatatable_info").parent().addClass('pagination_width');
                $("#customerDatatable_paginate").parent().addClass('pagination_width');
            } else {

            }
        }, function (error) {
        });
    })
        .withDataProp('data')
        .withOption('processing', false)
        .withOption('serverSide', true)
        //.withOption('bStateSave', true)
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
        //  DTColumnBuilder.newColumn('firstname').withTitle('First Name').withOption('sName', 'firstname'),
        DTColumnBuilder.newColumn('firstname').withTitle('First Name').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).withOption('sName', 'firstname'),
        // DTColumnBuilder.newColumn('lastname').withTitle('Last Name').withOption('sName', 'lastname'),
        DTColumnBuilder.newColumn('lastname').withTitle('Last Name').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).withOption('sName', 'lastname'),

        DTColumnBuilder.newColumn('mobile').withTitle('Mobile').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).withOption('sName', 'mobile').renderWith(mobileHtml),
        DTColumnBuilder.newColumn('email').withTitle('Email').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).withOption('sName', 'email'),
        DTColumnBuilder.newColumn('gender').withTitle('Gender').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).withOption('sName', 'gender'),
        DTColumnBuilder.newColumn('dob').withTitle('Birthday').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).renderWith(dobHtml),
        DTColumnBuilder.newColumn('updated_at').withTitle('Last visit').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).renderWith(createdHtml).withOption('sName', 'updated_at'),
        DTColumnBuilder.newColumn('created_at').withTitle('Created').withOption('createdCell', function (td, cellData, rowData, row, col) {
            $(td).unbind('click');
            $(td).bind('click', function () { $scope.$apply(function () { $scope.add_editCustomer(rowData) }); });
        }).renderWith(createdHtml).withOption('sName', 'created_at'),
       
    ];
    $scope.dtColumnInvoiceRequestDefs_main = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }


    function dobHtml(data, type, full, meta) {
        
        if(data ==null)
        {
            return "<span  class='text-nowrap'> - </span>";
        }
        else{

            var ts = new Date(data);
            
            console.log(ts,'ts');
            var dob_date = ts.toDateString().split(' ').slice(1).join(' ')
            return "<span  class='text-nowrap'>" + dob_date + "</span>";
        }
    }

    function createdHtml(data, type, full, meta) {
        var date_data = data.split(' ');
        var ts1 = new Date(date_data[0]);
        var dob_date1 = ts1.toDateString().split(' ').slice(1).join(' ');
        return "<span  class='text-nowrap'>" + dob_date1 + "</span>";
       
    }


    function mobileHtml(data, type, full, meta) {

        var mobile = (data.toString().match(/.{1,2}/g)).join(' ')
        return "<span class='text-nowrap'>" + mobile + "</span>";
    }

    function checkboxRow(data, type, full, meta) {
        return '<div class="checkbox clip-check check-primary ng-scope"><input type="checkbox" id="' + data + '_ischeck_0" class="checkBoxClass" name="check" ng-click="singleCheckBoxClick()" value="' + data + '" />  <label for="' + data + '_ischeck_0"></label></div>';
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
   
  
    $scope.downloadXls = function(){
        
        // var blob = new Blob([document.getElementById('customerDatatable_wrapper').innerHTML], {
            var blob = new Blob([$scope.html_data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "customerDatatable.xls");
    }
    
    $scope.moveToArchive = function () {

        var checkArr = [];
        $.each($("input[name='check']:checked"), function () {
            checkArr.push($(this).val());
        });
        $scope.delete_ids = checkArr;
        if (checkArr.length == 0) {
            notifications.Message('error', 'Error', 'Please select customers for archive.');
            return false;
        }
        //console.log('ids',$scope.delete_ids)

        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to archive selected customers!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, archive it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'archive_customer_all', $scope.delete_ids
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
    

    $scope.fileUpload = function () {

        $scope.data_inside_modal = {
            button: ['Add', 'Save'],

        }

        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'customers/uploadCsvCustomerModalContent.html',
                'uploadCsvCustomerController',
                '',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.clearAll(state, title, msg);
                    }
                },
            )
    }



}]);

app.controller('addCustomerController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", "$log", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut, $log ) {


    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    toaster.options = {
        "positionClass": "toast-top-right",
        "timeOut": 800000
    }

   $scope.customer = { 'dob': '','address':'' ,'house_letter':'','house_no':''};
   $scope.address_string = {'address':''}

  

   $scope.fillAddress = function () {

    $scope.customer.address = '';
    $scope.customer.address = (($scope.customer_address.street != undefined) ? $scope.customer_address.street : '') + " " + (($scope.customer.house_no != undefined) ? $scope.customer.house_no : '') + " " + (($scope.customer.house_letter != undefined) ? $scope.customer.house_letter : '') ;


  }
   

    $scope.findAddress = function () {
       
        if (($scope.customer.postal_code != undefined)   ) {
            if (($scope.customer.postal_code != '') ) {
            var postal_code_houseno = { 'postal_code': $scope.customer.postal_code, 'house_no': $scope.customer.house_no }
            $http.post(APP.API + 'get_customer_address', postal_code_houseno
            ).then(function (response) {
                console.log('response', response);
                if (response.data.success != false) {
                    if (response.data.data != '' && typeof (response.data.data) != undefined) {
                        $scope.customer_address = response.data.data
                        $scope.customer.address = (($scope.customer_address.street != undefined) ? $scope.customer_address.street : '') + " " + (($scope.customer.house_no != undefined) ? $scope.customer.house_no : ''); 
                    
                        $scope.customer.city = ($scope.customer_address.city != undefined) ? $scope.customer_address.city : '' 
                    } else {
                        $scope.customer_address = [];
                        $scope.customer.address = '';
                    }
                } else {
                    toaster.pop('error', 'Error', response.data.message);
                    $scope.customer.address = '';
                }

            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function (error) {
                    for (var i = 0; i < error.length; i++) {
                        toaster.pop('error', 'Error', error[i]);
                    }
                });

            });

        }else{
            toaster.pop('error', 'Faild', 'Please fill postal code and house no.  !!');

        }
        } else {
            toaster.pop('error', 'Faild', 'Please fill postal code and house no.  !!');

        }
        //&number=30
    }
   
    $scope.postalCodeValidation = function (e){
        
        
        if($scope.customer.postal_code.length <= 4){
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 8) { 
            }else{
                $scope.customer.postal_code = '';
            }
        }else if($scope.customer.postal_code.length == 5 || $scope.customer.postal_code.length == 6){
            if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode == 20 || e.keyCode == 8 || e.keyCode == 16) { 
            }else{
                $scope.customer.postal_code = '';
            }
        }
    }
   
    $scope.createBirthdate = function (e) {

        if (((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == 8 || e.keyCode <= 37 || e.keyCode <= 39 || (e.keyCode >= 96 && e.keyCode <= 105))) {
        var birtdate = $('#birthdate_display').val();
        var ele = $('#birthdate_display').val();
        var dashCount = (ele.match(/-/g) || []).length;
        if(e.keyCode !=8){
            if (dashCount < 2) {
                if(ele.length == 2){
                    ele = ele+'-';
                }else if(ele.length == 5){
                    ele = ele+'-';
                }
                var finalVal = ele;
            } else {
                var finalVal = ele;
            }
        }else{
            var finalVal = ele;
        }
        $('#birthdate_display').val(finalVal);
        }else{
            $('#birthdate_display').val('');
        }
        
    }

    $scope.emailValidation = function (){

        
        var patt = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm);
        var email_check = patt.test($scope.customer.email);
        if(email_check){
            $scope.email_validation_message_display = false;
        }else{
            $scope.email_validation_message = "Invalid Email !";
            $scope.email_validation_message_display = true;
        }

        
    }

    
    $scope.submitCutomerForm1 = function () {

        if($scope.customer.gender == undefined){
            $scope.gender_validation_message_display = true;
            $scope.gender_validation_message = "This field is required."

        }else{

            $scope.gender_validation_message_display = false;
            $scope.gender_validation_message = "";
        }


    }
    
    $scope.submitCutomerForm = function () {
    
        if($scope.lanline_validation || $scope.mobile_validation){
                return false;
         }

         if(!/^[a-zA-Z ]*$/g.test($scope.customer.firstname)){
             $scope.firstname_validation_message_display = true;
             $scope.firstname_validation_message = "Only allow alphabet and space.";
             return false;
         }else{
             $scope.firstname_validation_message_display = false;
             $scope.firstname_validation_message = "";
         }
         
         if(!/^[a-zA-Z ]*$/g.test($scope.customer.lastname)){
             $scope.lastname_validation_message_display = true;
             $scope.lastname_validation_message = "Only allow alphabet and space.";
             return false;
         }else{
             $scope.lastname_validation_message_display = false;
             $scope.lastname_validation_message = "";
         }
        
        if ($('#id_customerForm').valid()) {
            
            if($scope.customer.gender == undefined){
                $scope.gender_validation_message_display = true;
                $scope.gender_validation_message = "This field is required."
    
            }else{
    
                $scope.gender_validation_message_display = false;
                $scope.gender_validation_message = "";
            }
            
            // if (true) {
           
                console.log('$scope.dt',$scope.dt)
                $scope.customer.dob="";
                    if($scope.dt!=undefined && $scope.dt != "undesfined"){
                        $scope.customer.dob = moment($scope.dt).format('YYYY-MM-DD');
                    }
                
                console.log($scope.customer.dob);
            $http.post(APP.API + 'add_customer', $scope.customer
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
        $scope.customer = items.data;

    }
    $scope.selected = {
        item: $scope.items,
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

   
    $scope.today = function () {
        $scope.dt = null;
    };
    //  $scope.today();

    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;

    $scope.clear = function () {
        $scope.dt = null;
    };
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'year',
    };
    $scope.dateDisabledOptions = {
        dateDisabled: disabled,
        showWeeks: false,
        startingDay: 1
    };
    $scope.startOptions = {
        showWeeks: false,
        startingDay: 1,
        minDate: $scope.minDate,
        maxDate: $scope.maxDate
    };
    $scope.endOptions = {
        showWeeks: false,
        startingDay: 1,
        minDate: $scope.minDate,
        maxDate: $scope.maxDate
    };
    // Disable weekend selection
    function disabled(data) {
        var date = data.date, mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }


    $scope.setDate = function (year, month, day) {
        $scope.dt = null;
    };
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);

    $scope.open = function () {
        $scope.opened = !$scope.opened;
    };


    $scope.endOpen = function () {
        $scope.endOptions.minDate = $scope.start;
        $scope.startOpened = false;
        $scope.endOpened = !$scope.endOpened;
    };
    $scope.startOpen = function () {
        $scope.startOptions.maxDate = $scope.end;
        $scope.endOpened = false;
        $scope.startOpened = !$scope.startOpened;
    };


    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];

    $scope.hstep = 1;
    $scope.mstep = 15;

    // Time Picker
    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.ismeridian = true;
    $scope.toggleMode = function () {
        $scope.ismeridian = !$scope.ismeridian;
    };

    $scope.update = function () {
        var d = new Date();
        d.setHours(14);
        d.setMinutes(0);
        $scope.dt = null;
    };

    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.dt);
    };

    $scope.clear = function () {
        $scope.dt = null;
    };
    $scope.lanline_validation=false;
    $scope.mobile_validation=false;
    
    $scope.addSpace=function(id){

        var ele = document.getElementById(id);
        ele = ele.value.split(' ').join(''); // Remove dash (-) if mistakenly entered.
        
        var finalVal = ele.match(/.{1,2}/g).join(' ');
        var isValid = false;
        var regex = /^[0-9\s]*$/;
        isValid = regex.test(finalVal);
        
        if(!isValid){
        if(id=='landline'){
        $scope.lanline_validation=true;
        }else {
        $scope.mobile_validation=true;
        }
        
        }else {
        if(id=='landline'){
        $scope.lanline_validation=false;
        }else {
        $scope.mobile_validation=false;
        }
        }
        if(id=='landline'){
        $scope.customer.landline=finalVal;
        }else {
        $scope.customer.mobile=finalVal;
        }
        document.getElementById(id).value = finalVal;
        }


}]);


app.controller('uploadCsvCustomerController', ["$scope", "$uibModalInstance", "$http", "items", "APP",  "cb", "restSessionOut", function ($scope,  $uibModalInstance, $http, items, APP, cb, restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }

    $scope.uploadFile = function (element) {
        $scope.file = element;

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
        table = "<table class='table table-bordered'>" + tr + "</table>";
    }
    // $scope.submitCsvData1 = function () {

    //     console.log('$scope.csvData', $scope.csvData);

    // }

    $scope.submitCsvData = function () {
        if ($scope.csvData != undefined) {
            $http.post(APP.API + 'upload_csv_data_customer', $scope.csvData
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
            cb.success('error', 'Error', 'Recheck csv file !!');
        }
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
        $uibModalInstance.close();
    };

}])


app.filter('space', function () {
    return function (column) {
        
        column=column.toString();
        column = column.split(' ').join('');
        column = column.match(/.{1,2}/g).join(' ');
    return column;
    };
  });
