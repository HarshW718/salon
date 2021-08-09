app.controller('cashdeskMainCtrl', ["$cookies","$scope", "$http", "modalProvider", "APP", "restSessionOut", "storeAppointmentData", "$state", "_storeUnpaidInvoiceData", "storeAppointmentData","notifications", function ($cookies,$scope, $http,modalProvider, APP, restSessionOut, storeAppointmentData, $state, _storeUnpaidInvoiceData, storeAppointmentData,notifications) {

    //$stateParams
    if ($cookies.get('userdata') !== undefined) {
      $scope.loginUserData=JSON.parse($cookies.get('userdata'));
    }

    storeAppointmentData.set({});
    $("#ui-datepicker-div").hide();
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    if ($scope.paymentMethod == undefined) {
        $scope.paymentMethod = {};
    }
    $scope.paymentMethod.revenue = parseFloat(0.00);
    $scope.paymentMethod.cash = 0.00;
    $scope.paymentMethod.pin = 0.00;
    $scope.paymentMethod.credit_card = 0.00;
    $scope.paymentMethod.invoice = 0.00;
    $scope.paymentMethod.gift = 0.00;
    $scope.dt = new Date();
    $scope.dt_end = new Date();
    $scope.openInvoice = function () {
        $scope.paymentMethod.revenue = parseFloat(0.00);
        //$scope.paymentMethod.cash = 0.00;
        //$scope.paymentMethod.pin = 0.00;
        //$scope.paymentMethod.credit_card = 0.00;
        //$scope.paymentMethod.invoice = 0.00;
        //$scope.paymentMethod.gift = 0.00;
        var invoiceDate = moment($scope.dt).format('YYYY-MM-DD');
        var invoiceDate_end = moment($scope.dt_end).format('YYYY-MM-DD');


        var check_invoiceDate = moment($scope.dt,"DD.MM.YYYY");
        var check_invoiceDate_end = moment($scope.dt_end,"DD.MM.YYYY");

        var date_diff = check_invoiceDate_end.diff(check_invoiceDate,'days');
        if(date_diff < 0){
            notifications.Message('error','Error','End date should be greater or same as start date !!')
            $scope.dt = new Date();
            $scope.dt_end = new Date();
        }else{

            $http.get(APP.API + 'open_invoice?date=' + invoiceDate+ '&page=cashdesk_main&date_end='+invoiceDate_end
            ).then(function (response) {
                $scope.invoiceList = response.data.invoiceList;
                $scope.paymentList = response.data.paymentList;
                //$scope.cashOutAmount = response.data.cashOutAmout;
                angular.forEach($scope.paymentList, function (value, key) {
                    $scope.paymentMethod.revenue = parseFloat($scope.paymentMethod.revenue) + parseFloat(value.amount);
                    if (value.id == 1) {
                        $scope.paymentMethod.cash = value.amount;
                    }
                    //if (value.id == 2) {
                    //    $scope.paymentMethod.pin = value.amount;
                    //}
                    if (value.id == 3) {
                        $scope.paymentMethod.credit_card = value.amount;
                    }
                    //if (value.id == 4) {
                    //    $scope.paymentMethod.invoice = value.amount;
                    //}
                    //if (value.id == 5) {
                    //    $scope.paymentMethod.gift = value.amount;
                    //}
                });
                
            }).catch(function (request, status, errorThrown) {
            });


        }
        

      
        //invoiceDate_end, 'days' // 1

        
    }
    $scope.openInvoice();
    $scope.nextdate = function () {
        $scope.dt = new Date($scope.dt);
        $scope.dt = $scope.dt.setDate($scope.dt.getDate() + 1);

        $scope.dt_end = new Date($scope.dt_end);
        $scope.dt_end = $scope.dt_end.setDate($scope.dt_end.getDate() + 1);
        
        $scope.openInvoice();
    }
    $scope.dateChange = function () {
         $scope.dt = new Date($scope.dt);
         $scope.dt_end = new Date($scope.dt_end);
         $scope.openInvoice();
    }
    $scope.predate = function () {
        $scope.dt = new Date($scope.dt);
        $scope.dt = $scope.dt.setDate($scope.dt.getDate() - 1);

        $scope.dt_end = new Date($scope.dt_end);
        $scope.dt_end = $scope.dt_end.setDate($scope.dt_end.getDate() - 1);
        $scope.openInvoice();
    }
    $scope.openCustomerModal = function () {
        modal_html_link = 'cashdesk/customerModalContent.html';
        modal_controller = 'customerModelCtrl';
        modal_size = '';
        $scope.data_inside_modal = {
            // edited_row: single_data
        }
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + modal_html_link,
                modal_controller,
                modal_size,
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                    }
                },
            )
    }
    $scope.open = function () {
        $scope.opened = !$scope.opened;
    };
    $scope.open_end = function () {
        $scope.opened_end = !$scope.opened_end;
    };
    $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.hideSidebar = function () {
        if(jQuery('#leftside.hide').length == 1){
            jQuery('#leftside').removeClass('hide');
            $scope.mailClass = 'col-md-10';
            $scope.sideClass = 'col-md-2 cashdesk-left-sidebar';
        }else {
            jQuery('#leftside').addClass('hide');
            $scope.mailClass = 'col-md-12';
            $scope.sideClass = 'hide';
        }
    }
$scope.openUnpaidInvoice = function (invoice_id) {
        $http.get(APP.API + 'invoice_by_id/' + invoice_id
        ).then(function (response) {
            storeAppointmentData.set(response.data.data)
            $scope.gotoCashdesk();

        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.gotoCashdesk = function () {
        $state.go('app.pages.cashdesk', {});
    }
    $scope.gift_list = function () {
        $scope.data_inside_modal = {
            giftList: 'sdf',
        }
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'gift/gift_list.html',
                'giftListController',
                'md',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.clearAll(state, title, msg);
                    }
                },
            )
    }



    var isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone");
    var isiPad = navigator.userAgent.toLowerCase().indexOf("ipad");
    var isiPod = navigator.userAgent.toLowerCase().indexOf("ipod");
    var android = navigator.userAgent.toLowerCase().indexOf("android");
    if (isiPhone > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    } else if (isiPad > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    } else if (isiPod > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    } else if (android > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    } else {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').removeClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-10';
        $scope.sideClass = 'col-md-2 cashdesk-left-sidebar';
    }
}]);
app.controller('giftListController', ["$scope", "$http", "APP", "$uibModalInstance", function ($scope, $http, APP, $uibModalInstance) {
    if ($scope.allGifts == undefined) {
        $scope.allGifts = [];
    }
    $scope.is_use = 0;
    $scope.is_not_use = 1;
    $http.get(APP.API + 'all_gifts'
    ).then(function (response) {
        $scope.allGifts = response.data.gift_list;
    }).catch(function (request, status, errorThrown) {
    });
    $scope.applyFilter = function (type) {
        if (type == 0) {
            $scope.is_use = 0;
            $scope.is_not_use = 1;
        } else if (type == 1) {
            $scope.is_not_use = 1;
            $scope.is_use = 1;
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

}]);
app.filter('trusted', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html)
    }
});


app.controller('customerModelCtrl', ["$scope", "$http", "APP", "notifications", "restSessionOut", "$state", "$uibModalInstance","storeAppointmentData", function ($scope, $http, APP, notifications, restSessionOut, $state, $uibModalInstance,storeAppointmentData) {

    $scope.people = [];
    $scope.yourFunction = function (search) {
        var search_data = { search: search }
        $http.post(APP.API + 'customer_for_appointment', search_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            
            $scope.people = response.data.data;

        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.yourFunction(null)
    $scope.customer = {};
    $scope.customer_address = { 'street': '', 'house_no': '' };
    $scope.tmp = {};
    $scope.onSelectCallback = function (item) {
        $scope.customer = item;
        var street = (item.address != null) ? item.address.replace(/\'/g, '').split(/(\d+)/).filter(Boolean) : '';
        $scope.customer_address.street = street[0]
        $scope.tmp.dt_update = new Date(item.dob);
        $scope.formData = true;
    };
    $scope.customerList = true;
    $scope.newCustomer = function () {
        $scope.customer = {};
        $scope.tmp = {};
        $scope.formData = true;
        $scope.customerList = false;
        $scope.closeBtn = true;
    }
    $scope.oldCustomer = function () {
        $scope.formData = false;
        $scope.customerList = true;
        $scope.person.selected = '';
    }
    $scope.fillAddress = function () {
        $scope.customer.address = '';
        $scope.customer.address = (($scope.customer_address.street != undefined) ? $scope.customer_address.street : '') + " " + (($scope.customer.house_no != undefined) ? $scope.customer.house_no : '') + " " + (($scope.customer.house_letter != undefined) ? $scope.customer.house_letter : '');
    }
    $scope.findAddress = function () {
        if (($scope.customer.postal_code != undefined)) {
            if (($scope.customer.postal_code != '')) {
                var postal_code_houseno = { 'postal_code': $scope.customer.postal_code, 'house_no': $scope.customer.house_no }
                $http.post(APP.API + 'get_customer_address', postal_code_houseno
                ).then(function (response) {
                    
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
                        notifications.Message('error', 'Error', response.data.message);
                        $scope.customer.address = '';
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
                notifications.Message('error', 'Faild', 'Please fill postal code and house no.  !!');
            }
        } else {
            notifications.Message('error', 'Faild', 'Please fill postal code and house no.  !!');
        }
        //&number=30
    }
    $scope.cashdesk_data = {};
    $scope.submitAppointmentForm = function () {
        if ($scope.customer.gender == undefined) {
            $scope.gender_validation_message_display = true;
            $scope.gender_validation_message = "This field is required."
        } else {
            $scope.gender_validation_message_display = false;
            $scope.gender_validation_message = "";
        }
        
        $scope.customer.dob = moment($scope.tmp.dt_update).format('YYYY-MM-DD');
        var php_api_link = ($scope.customer.id == undefined) ? 'add_customer' : 'update_customer';
        if ($('#id_customerForm').valid()) {
            $http.post(APP.API + php_api_link, $scope.customer
            ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) { }
                    $scope.cashdesk_data.customer = response.data.customer;
                    $scope.cashdesk_data.id =  undefined;
                    $scope.cashdesk_data.to_pay_id = 0;
                    $scope.cashdesk_data.invoice_data = [];
                    storeAppointmentData.set($scope.cashdesk_data)
                    $state.go('app.pages.cashdesk', {});
                    $uibModalInstance.close();
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function (error) {
                    for (var i = 0; i < error.length; i++) {
                        notifications.Message('error', 'Error', error[i]);
                    }
                });
            });
        }
    }
    $scope.postalCodeValidation = function (e){
        
        //alert($scope.customer.postal_code.length);
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

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.today = function () {
        $scope.dt_update = new Date();
    };
    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;
    $scope.clear = function () {
        $scope.dt_update = null;
    };
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'year'
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
        $scope.dt_update = new Date(year, month, day);
    };
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);
    $scope.open_update = function () {
        if (typeof ($scope.mydp) === 'undefined') {
            $scope.mydp = {};
        }
        $scope.mydp.opened_date = !$scope.mydp.opened_date;
        $scope.clear();
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
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
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
        $scope.dt_update = d;
    };
    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.dt_update);
    };
    $scope.clear = function () {
        $scope.dt_update = null;
    };
    $scope.mytime = new Date();
    $scope.mytime1 = new Date();
    $scope.hstep = 1;
    $scope.mstep = 15;
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
        $scope.mytime = d;
    };
}])

app.controller('CashdeskInCtrl', ["$scope", "$http", "APP", "notifications", "restSessionOut", "$state", "$uibModalInstance","storeAppointmentData", function ($scope, $http, APP, notifications, restSessionOut, $state, $uibModalInstance,storeAppointmentData) {

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.cash_in = {status:1};
    $scope.saveCashIn = function () {
        //console.log('$scope.cash_in',$scope.cash_in);
        $http.post(APP.API + 'cash_counter_in', $scope.cash_in
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if(response.data.success){
                notifications.Message('success','Success',response.data.message);
            }
            $uibModalInstance.close();

        }).catch(function (request, status, errorThrown) {
        });
    }




}]);


app.controller('CashdeskOutCtrl', ["$scope", "$http", "APP", "notifications", "restSessionOut", "$state", "$uibModalInstance","storeAppointmentData","cb", function ($scope, $http, APP, notifications, restSessionOut, $state, $uibModalInstance,storeAppointmentData,cb) {
    
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.cash_out = {status:0};
    $scope.saveCashOut = function () {
        $http.post(APP.API + 'cash_counter_in', $scope.cash_out
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if(response.data.success){
                notifications.Message('success','Success',response.data.message);
            }
            $uibModalInstance.close();
            cb.success('success', 'Success',response.data.message);
        }).catch(function (request, status, errorThrown) {
        });
    }



}]);
