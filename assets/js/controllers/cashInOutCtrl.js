
app.controller('cashInOutCtrl', ["$scope", "$http", "modalProvider", "APP", "restSessionOut", "storeAppointmentData", "$state", "_storeUnpaidInvoiceData", "storeAppointmentData","SweetAlert","DTOptionsBuilder", "DTColumnBuilder","$compile","$filter", function ($scope, $http,modalProvider, APP, restSessionOut, storeAppointmentData, $state, _storeUnpaidInvoiceData, storeAppointmentData,SweetAlert,DTOptionsBuilder, DTColumnBuilder,$compile,$filter) {


    storeAppointmentData.set({});
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
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
    // var date = new Date();
    // $scope.dt = new Date(date.getFullYear(), date.getMonth(), 1);
    // $scope.end_dt = new Date(date.getFullYear(), date.getMonth() + 1, 0);

   // var date = new Date();
    $scope.dt = '';
    $scope.end_dt = '';





    
    
    $scope.dateChange = function () {
         $scope.dt = new Date($scope.dt);
         $scope.endDateOptions = {
            showWeeks: false,
            startingDay: 1,
            datepickerMode: 'day',
            minDate:new Date($scope.dt.getFullYear(), $scope.dt.getMonth(), $scope.dt.getDate())
        };
         $scope.dtInstanceInvoiceRequest.rerender();
        
       
    }
    $scope.enddateChange = function () {
        
        $scope.end_dt = new Date($scope.end_dt);
        $scope.dtInstanceInvoiceRequest.rerender();
      
   }
   
    
    $scope.open = function () {
        $scope.opened = !$scope.opened;
    };
    $scope.end_open = function () {
        $scope.end_opened = !$scope.end_opened;
    };
    $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.clearDate = function(){
        $scope.dt = '';
        $scope.end_dt = '';
        $scope.dtInstanceInvoiceRequest.rerender();

    }
    $scope.changeStartDate = function(){
        if($scope.dt != ''){
            $scope.endDateOptions = {
                showWeeks: false,
                startingDay: 1,
                datepickerMode: 'day',
                minDate:new Date($scope.dt.getFullYear(), $scope.dt.getMonth(), $scope.dt.getDate())
            };
        }
        
    }
    $scope.changeStartDate();


    $scope.dtIntanceInvoiceRequestCallback_main = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;

    $scope.dtOptionInvoiceRequest_main = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
            var sque = data.order[0].dir;
           // var columnmna = data.columns[data.order[0].column].name;
        $http({
            method: "post",
            url: APP.API + 'dt_cash_in_out',
            data: {
                length: data.length,
                start: data.start,
                draw: data.draw,
                column_name: 'id',
                order: sque,
                search: data.search.value,
                current_date:$scope.dt,
                start_date: ($scope.dt != '') ? $filter('date')($scope.dt, "yyyy-MM-dd"):'',
                end_date: ($scope.end_dt != '') ? $filter('date')($scope.end_dt, "yyyy-MM-dd"):'',
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

    $scope.dtColumnInvoiceRequest_main = [
       // DTColumnBuilder.withOption('sName', 'id').notSortable(),
        //DTColumnBuilder.newColumn('id').notSortable().renderWith(idHtml),
       
        
       
        DTColumnBuilder.newColumn('payment_date').withTitle('Date').withOption('sName', 'payment_date').renderWith(paymentDate),
        DTColumnBuilder.newColumn('invoice_no').withTitle('Invoice No.').withOption('sName', 'invoice_no'),
        DTColumnBuilder.newColumn('amount').withTitle('Amount(+/-)').withOption('sName', 'amount').renderWith(amountInOut),
        DTColumnBuilder.newColumn('note').withTitle('Note').withOption('sName', 'note'),

        DTColumnBuilder.newColumn('current_cash').withTitle('Total Amount').withOption('sName', 'current_cash').renderWith(currentCash),
        
    ];
    $scope.dtColumnInvoiceRequestDefs_main = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }
    // function idHtml(data, type, full, meta){
    //     return "";
    // }
   

    function paymentDate(data, type, full, meta) {
        var d = data.split(' ')[0];
        var cur_date = new Date(d);
        var year = cur_date.getFullYear();
        var month = ((cur_date.getMonth() + 1).length < 2) ? '0' + (cur_date.getMonth() + 1) : (cur_date.getMonth() + 1);
        var day = ((cur_date.getDate()).length < 2) ? '0' + cur_date.getDate() : cur_date.getDate();
        var final_date = day+'-'+month+'-'+year;
        return final_date;

    }
    function amountInOut(data, type, full, meta){
        if(full.status == 1){
            return '+'+data;
        }else{
            return '-'+data;
        }
        
    }

    function currentCash(data, type, full, meta){

        return '₹'+data;

        
    }





    var isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone");
    var isiPad = navigator.userAgent.toLowerCase().indexOf("ipad");
    var isiPod = navigator.userAgent.toLowerCase().indexOf("ipod");
    var android = navigator.userAgent.toLowerCase().indexOf("android");
    if (isiPhone > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    }else {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').removeClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-10';
        $scope.sideClass = 'col-md-2 cashdesk-left-sidebar';
    }
    if (isiPad > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    }else {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').removeClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-10';
        $scope.sideClass = 'col-md-2 cashdesk-left-sidebar';
    }
    if (isiPod > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    }else {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').removeClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-10';
        $scope.sideClass = 'col-md-2 cashdesk-left-sidebar';
    }
    if (android > -1) {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').addClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-12';
        $scope.sideClass = 'hide';
    }else {
        (jQuery('#leftside.hide').length == 1) ? jQuery('#leftside').removeClass('hide') : jQuery('#leftside').addClass('hide');
        $scope.mailClass = 'col-md-10';
        $scope.sideClass = 'col-md-2 cashdesk-left-sidebar';
    }
}]);
app.filter('trusted', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html)
    }
});
