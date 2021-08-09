app.controller('bankTransferCtrl', ["$scope", "$http", "modalProvider", "APP", "restSessionOut", "storeAppointmentData", "$state", "_storeUnpaidInvoiceData", "storeAppointmentData","SweetAlert","notifications",function ($scope, $http,modalProvider, APP, restSessionOut, storeAppointmentData, $state, _storeUnpaidInvoiceData, storeAppointmentData,SweetAlert,notifications) {


    storeAppointmentData.set({});
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
    $("#ui-datepicker-div").hide();
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
        $scope.paymentMethod.cash = 0.00;
        $scope.paymentMethod.pin = 0.00;
        $scope.paymentMethod.credit_card = 0.00;
        $scope.paymentMethod.invoice = 0.00;
        $scope.paymentMethod.gift = 0.00;
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

       // var sendData = {date:invoiceDate,page_name:'bank_transfer'}
         $http.get(APP.API + 'open_invoice?date=' + invoiceDate+ '&page=bank_transfer&date_end='+invoiceDate_end
            ).then(function (response) {
            $scope.invoiceList = response.data.invoiceList;
            console.log('$scope.invoiceList',$scope.invoiceList);
            
        }).catch(function (request, status, errorThrown) {
        });
    }
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
    
    $scope.clickIsReceived = function(invoice){
    var invoice_data = invoice;
    modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'cashdesk/received_date.html',
                'receivedDateCtrl',
                'md',
                invoice_data,
                {
                    'success': function (state, title, msg) {
                        $scope.clickIsReceivedModalClose(state, title, msg);
                    }
                },
            )
    }
    $scope.clickIsReceivedModalClose = function(){
        $scope.openInvoice(); 
        notifications.Message('success','Success',response.data.message);
    }
  
      $scope.clickIsNotReceived = function(invoice){
        
        SweetAlert.swal({
          title: "Is Payment Not Received !!",
          text: "Are you sure ?",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes",
          closeOnConfirm: true,
          closeOnCancel: true,
          cancelButtonText: "No",
      },
          function (isConfirm) {
          if(isConfirm){
            //invoice.is_received = 0;
            $http.post(APP.API + 'update_invoice_is_received', invoice
            ).then(function (response) {
                $scope.openInvoice(); 
                notifications.Message('success','Success',response.data.message);
            }).catch(function (request, status, errorThrown) {
            });
          }
        });
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
        /* console.log("here too") */
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



app.controller('receivedDateCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP",  "cb", "restSessionOut", function ($scope,  $uibModalInstance, $http, items, APP, cb, restSessionOut) {

   // console.log('items',items);
    $scope.ok = function () {

      
        items.is_received_date = $scope.dt; 
        $http.post(APP.API + 'update_invoice_is_received', items
        ).then(function (response) {
    
          if(response.data.status){
            cb.success('success', 'Success', response.data.message);
          }
    
        }).catch(function (request, status, errorThrown) {
        });
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };


    $scope.today = function () {
        $scope.dt = new Date();
    };
      $scope.today();

    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;

    $scope.clear = function () {
        $scope.dt = null;
    };
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'day',
       
        // minDate:new Date(1980, 12, 31),
        
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
        $scope.dt = new Date(year, month, day);
    };
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2018, 5, 22);
    $scope.minDate = new Date(1990, 12, 31);

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
        mstep: [1, 5, 10, 15, 25, 30],
        
    };

    $scope.ismeridian = true;
    $scope.toggleMode = function () {
        $scope.ismeridian = !$scope.ismeridian;
    };

    $scope.update = function () {
        var d = new Date();
        d.setHours(14);
        d.setMinutes(0);
        $scope.dt = d;
    };

    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.dt);
    };

    $scope.clear = function () {
        $scope.dt = null;
    };

}])


app.filter('trusted', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html)
    }
});
