// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
function days_of_a_year(year) 
{
   
  return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
     return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}
function getDateRangeOfWeek(weekNo, y){
    var d1, numOfdaysPastSinceLastMonday, rangeIsFrom, rangeIsTo;
    d1 = new Date(''+y+'');
    numOfdaysPastSinceLastMonday = d1.getDay() - 1;
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    d1.setDate(d1.getDate() + (7 * (weekNo - d1.getWeek())));
    rangeIsFrom = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear();
    d1.setDate(d1.getDate() + 6);
    rangeIsTo = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear() ;
    var weekDt = {
        'week_start_date':rangeIsFrom,
        'week_end_date':rangeIsTo,
    }
    //return rangeIsFrom + " to " + rangeIsTo;
    return weekDt;
};

function GetFormattedDate(dt) {
    var todayTime = new Date(dt);
    var month = todayTime .getMonth() + 1;
    var day = todayTime .getDate();
    var year = todayTime .getFullYear();
    return  day+'-'+month+"-"+ year;
}

app.controller('reportCtrl', ["$http", "restSessionOut", function ($http,restSessionOut) { 
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
    restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $("#ui-datepicker-div").hide();

}]);

app.controller('invoiceReportCtrl', ["$scope", "$http", "$filter", "APP", "restSessionOut","toaster","notifications", function ($scope, $http, $filter, APP, restSessionOut,toaster,notifications) { 
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
    restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $("#ui-datepicker-div").hide();
    $scope.downloadXls = function(){
        var blob = new Blob([document.getElementById('invoiceReportexportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "allInvoice.xls");
    }
    $scope.allInvoice= function(which_one){
        $scope.filterForm.startDate_filter = $filter('date')($scope.filterForm.startDate, "yyyy-MM-dd") 
        $scope.filterForm.endDate_filter = $filter('date')($scope.filterForm.endDate, "yyyy-MM-dd");
        $scope.filterForm.which_one = which_one;
        $http.post(APP.API + 'invoice_report', $scope.filterForm
        ).then(function (response) {
            if(response.data.pdf == 0){
                $scope.invoiceList=response.data.invoiceList;
                $scope.downloadInvoiceCsv = allInvoiceCsv;
                $scope.displayPeriod = true;
            }else if(response.data.invoiceList == 0){
                console.log('response.data.',response.data)
                var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href',response.data.href);
                downloadLink.attr('target','_self');
                downloadLink.attr('download', response.data.pdf_name);
                downloadLink[0].click();

                setTimeout(function () {
                    $scope.deletePDF_file(response.data.pdf_name)
                  }, 1000)
               
            }
            
        }).catch(function (request, status, errorThrown) {});
    }
    $scope.deletePDF_file = function(pdf_file_name){
        $http.get(APP.API + 'invoice_pdf_delete/'+ pdf_file_name
        ).then(function (response) {
            console.log('response',response)
        }).catch(function (request, status, errorThrown) {});

    }
    

    $scope.filterForm = {}
    $scope.yearList = [];
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    $scope.year = date.getFullYear();
    $scope.yearList.push($scope.year);
    $scope.yearForWeek = date.getFullYear();
    $scope.filterForm.startDate =firstDay;
    $scope.filterForm.endDate = lastDay;
    $scope.format='dd-MM-yyyy';
    $scope.psDate = $filter('date')($scope.filterForm.startDate, "yyyy-MM-dd");
    $scope.peDate = $filter('date')($scope.filterForm.endDate, "yyyy-MM-dd");
    $scope.allInvoice('create_report');

    $scope.getWeeks = function(year){
        $scope.weeks = [];
        if(days_of_a_year(year) == 365){
            for(i=1;i<=52;i++){
                var v = 'Week '+i;
                $scope.weeks.push(v);
            }
        }else{
            for(i=1;i<=53;i++){
                var v = 'Week '+i;
                $scope.weeks.push(v);
            }
        }
    }
    $scope.getWeeks($scope.year);

    $scope.changeWeek = function(){
        if($scope.selectedWeek){
            var data = getDateRangeOfWeek($scope.selectedWeek,$scope.yearForWeek);
            var sdate = data.week_start_date.split("-");
            var edate = data.week_end_date.split("-");
            $scope.filterForm.startDate = new Date(sdate[2],(sdate[0]-1),sdate[1]);
            $scope.filterForm.endDate = new Date(edate[2],(edate[0]-1),edate[1]);
            
        }else{
            $scope.filterForm.startDate =firstDay;
            $scope.filterForm.endDate = lastDay;
        }
    }

    $scope.nextDay = function(){
        var today = $scope.filterForm.startDate;
        var tomorrow = new Date();
        tomorrow.setDate($scope.filterForm.startDate.getDate()+1);
        $scope.filterForm.startDate = tomorrow;
        $scope.filterForm.endDate = '';
    }

    $scope.todayDay = function(){
        $scope.filterForm.startDate = new Date();
        $scope.filterForm.endDate = '';
    }
    
    $scope.previousDay = function(){
        var today = $scope.filterForm.startDate;
        var previousDate = new Date();
        previousDate.setDate($scope.filterForm.startDate.getDate()-1);
        $scope.filterForm.startDate = previousDate;
        $scope.filterForm.endDate = '';
    }


    $('#yearList').change(function(){
        var yearVal = $(this).children("option:selected").val();
        $scope.year = yearVal;
    });

    $http.post(APP.API + 'all_payment_methods')
    .then(function (response) {
    try {
        if (response.data.status == "401") {
            restSessionOut.getRstOut();
        }
    } catch (err) { }
    $scope.paymentMethods = response.data.data;
    }).catch(function (request, status, errorThrown) {});

    $scope.createReport = function(frmId,which_one){

        var start_date = moment($scope.filterForm.startDate, 'DD-MM-YYYY'),
        end_date = moment($scope.filterForm.endDate, 'DD-MM-YYYY');
        var date_diff = start_date.diff(end_date,'days');
        if(date_diff > 0){
            notifications.Message('warning','Recheck Dates !!','Start date should less than end date !!')
        }else{
            if(date_diff < -366){
                notifications.Message('warning','Recheck Dates !!','Report will not generate more than one year !!')
            }else{
            if ($("#"+frmId).valid()) {
                $scope.psDate = $filter('date')($scope.filterForm.startDate, "yyyy-MM-dd");
                $scope.peDate = $filter('date')($scope.filterForm.endDate, "yyyy-MM-dd");
                $scope.allInvoice(which_one);

            }else{
                notifications.Message('error', 'Error', 'Please enter Start Date and End Date .')
            }
            }
        }

    }
    $scope.changeStartDate = function(){
        // $scope.salesFilterForm.endDate = $scope.salesFilterForm.startDate;
         $scope.endDateOptions = {
             showWeeks: false,
             startingDay: 1,
             datepickerMode: 'day',
             minDate:new Date($scope.filterForm.startDate.getFullYear(), $scope.filterForm.startDate.getMonth(), $scope.filterForm.startDate.getDate())
         };
     }
     $scope.changeStartDate();
    $scope.yearOption = function(){
        val = 10;
        var year = $scope.year;
        for(i=1;i<=val;i++){
            year = year-1;
            $scope.yearList.push(year)
        }
    }
    $scope.yearOption();

    $scope.getQurterDate = function(quarterNumber){
        var month = '';
        var year = $scope.year;
        if(quarterNumber === 1){
            month = 1;
        }else if(quarterNumber === 2){
            month = 4;
        }else if(quarterNumber === 3){
            month = 7;
        }else if(quarterNumber === 4){
            month = 10;
        }
        
        var q = 3
        var quarter = Math.floor((month/ q));
        var firstDate = new Date(year, quarter * q, 1);
        var lastDate = new Date(firstDate.getFullYear(), firstDate.getMonth() + q, 0);
        $scope.filterForm.startDate = firstDate;
        $scope.filterForm.endDate = lastDate;
        $( ".k-dialog-close" ).trigger( "click" );
    }

    $scope.getQurterDateMonth = function(month){
        var date = new Date(), y = $scope.year, m = month;
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        $scope.filterForm.startDate = firstDay;
        $scope.filterForm.endDate = lastDay;
        $( ".k-dialog-close" ).trigger( "click" );
    }
    $scope.printPdf = function(div) {
      var path = window.location.origin + window.location.pathname;
      var printContents = document.getElementById(div).innerHTML;
      var popupWin = window.open('', '_blank', 'width=1500,height=1000');
      popupWin.document.open();
      popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="'+path+'bower_components/bootstrap/dist/css/bootstrap.min.css"/><link rel="stylesheet" type="text/css" href="'+path+'assets/css/styles.css"/><style type="text/css">table{width:100% !important}</style></head><body onload="window.print()">' + printContents + '</body></html>');
      popupWin.document.close();
    }
     
}]);

app.controller('totalReportCtrl', ["$scope", "$http", "$filter", "APP", "restSessionOut", "toaster","notifications", function ($scope, $http, $filter, APP, restSessionOut, toaster,notifications) { 
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
    restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $scope.downloadXls = function(){
        var blob = new Blob([document.getElementById('totalReportCtrlexportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "totalReport.xls");
    }
    $scope.totalReport= function(which_one){

        $scope.totalReportForm.startDate_filter = $filter('date')($scope.totalReportForm.startDate, "yyyy-MM-dd"); 
        $scope.totalReportForm.endDate_filter = $filter('date')($scope.totalReportForm.endDate, "yyyy-MM-dd");
        $scope.totalReportForm.which_one = which_one
        $http.post(APP.API + 'total_report', $scope.totalReportForm
        ).then(function (response) {
            
            if(response.data.pdf == 0){
            $scope.totalPaymentMethod=response.data.totalPaymentMethod;
            $scope.revenueData=response.data.revenueData;
            $scope.productAmountGroupByTax=response.data.productByTax;
            $scope.serviceAmountGroupByTax=response.data.servicceByTax;
            $scope.displayPeriod = true;
            }else if(response.data.invoiceList == 0){
                var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href',response.data.href);
                downloadLink.attr('target','_self');
                downloadLink.attr('download', response.data.pdf_name);
                downloadLink[0].click();

                setTimeout(function () {
                    $scope.deletePDF_file(response.data.pdf_name)
                  }, 1000)
               
            }


            $scope.deletePDF_file = function(pdf_file_name){
                $http.get(APP.API + 'total_pdf_delete/'+ pdf_file_name
                ).then(function (response) {
                    console.log('response',response)
                }).catch(function (request, status, errorThrown) {});
        
            }




        }).catch(function (request, status, errorThrown) {});
    }
    
    $scope.totalReportForm = {}
    $scope.yearList = [];
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    $scope.year = date.getFullYear();
    $scope.yearList.push($scope.year);
    $scope.yearForWeek = date.getFullYear();
    $scope.totalReportForm.startDate =firstDay;
    $scope.totalReportForm.endDate = lastDay;
    $scope.format='dd-MM-yyyy';
    $scope.psDate = $filter('date')($scope.totalReportForm.startDate, "yyyy-MM-dd");
    $scope.peDate = $filter('date')($scope.totalReportForm.endDate, "yyyy-MM-dd");
    $scope.totalReport('create_report');

    $scope.getWeeks = function(year){
        $scope.weeks = [];
        if(days_of_a_year(year) == 365){
            for(i=1;i<=52;i++){
                var v = 'Week '+i;
                $scope.weeks.push(v);
            }
        }else{
            for(i=1;i<=53;i++){
                var v = 'Week '+i;
                $scope.weeks.push(v);
            }
        }
    }
    $scope.getWeeks($scope.year);

    $scope.changeWeek = function(){
        if($scope.selectedWeek){
            var data = getDateRangeOfWeek($scope.selectedWeek,$scope.yearForWeek);
            var sdate = data.week_start_date.split("-");
            var edate = data.week_end_date.split("-");
            $scope.totalReportForm.startDate = new Date(sdate[2],(sdate[0]-1),sdate[1]);
            $scope.totalReportForm.endDate = new Date(edate[2],(edate[0]-1),edate[1]);
        }else{
            $scope.totalReportForm.startDate =firstDay;
            $scope.totalReportForm.endDate = lastDay;
        }
    }

    $scope.nextDay = function(){
        var today = $scope.totalReportForm.startDate;
        var tomorrow = new Date();
        tomorrow.setDate($scope.totalReportForm.startDate.getDate()+1);
        $scope.totalReportForm.startDate = tomorrow;
        $scope.totalReportForm.endDate = '';
    }

    $scope.todayDay = function(){
        $scope.totalReportForm.startDate = new Date();
        $scope.totalReportForm.endDate = '';
    }
    
    $scope.previousDay = function(){
        var today = $scope.totalReportForm.startDate;
        var previousDate = new Date();
        previousDate.setDate($scope.totalReportForm.startDate.getDate()-1);
        $scope.totalReportForm.startDate = previousDate;
        $scope.totalReportForm.endDate = '';
    }

    
    
    $('#yearList').change(function(){
        var yearVal = $(this).children("option:selected").val();
        $scope.year = yearVal;
    });

    $http({
        url:APP.API + 'get_staff_list',
        method: "get",
    }).then(function (response) {
        $scope.employeeList=response.data.activeData;
        //$scope.inActiveData=response.data.inActiveData;
    })

    $scope.createReport = function(frmId,which_one){

        var start_date = moment($scope.totalReportForm.startDate, 'DD-MM-YYYY'),
        end_date = moment($scope.totalReportForm.endDate, 'DD-MM-YYYY');
        var date_diff = start_date.diff(end_date,'days');
        if(date_diff > 0){
            notifications.Message('warning','Recheck Dates !!','Start date should less than end date !!')
        }else{
            if(date_diff < -366){
                notifications.Message('warning','Recheck Dates !!','Report will not generate more than one year !!')
            }else{
            if ($("#"+frmId).valid()) {
                $scope.psDate = $filter('date')($scope.totalReportForm.startDate, "yyyy-MM-dd");
                $scope.peDate = $filter('date')($scope.totalReportForm.endDate, "yyyy-MM-dd");
                $scope.totalReport(which_one);
            }else{
                notifications.Message('error', 'Error', 'Please enter Start Date and End Date .')
            }
        }
        }
    }



    



    $scope.changeStartDate = function(){
        // $scope.salesFilterForm.endDate = $scope.salesFilterForm.startDate;
         $scope.endDateOptions = {
             showWeeks: false,
             startingDay: 1,
             datepickerMode: 'day',
             minDate:new Date($scope.totalReportForm.startDate.getFullYear(), $scope.totalReportForm.startDate.getMonth(), $scope.totalReportForm.startDate.getDate())
         };
     }
     $scope.changeStartDate();

    $scope.yearOption = function(){
        val = 10;
        var year = $scope.year;
        for(i=1;i<=val;i++){
            year = year-1;
            $scope.yearList.push(year)
        }
    }
    $scope.yearOption();

    $scope.getQurterDate = function(quarterNumber){
        var month = '';
        var year = $scope.year;
        if(quarterNumber === 1){
            month = 1;
        }else if(quarterNumber === 2){
            month = 4;
        }else if(quarterNumber === 3){
            month = 7;
        }else if(quarterNumber === 4){
            month = 10;
        }
        
        var q = 3
        var quarter = Math.floor((month/ q));
        var firstDate = new Date(year, quarter * q, 1);
        var lastDate = new Date(firstDate.getFullYear(), firstDate.getMonth() + q, 0);
        $scope.totalReportForm.startDate = firstDate;
        $scope.totalReportForm.endDate = lastDate;
        $( ".k-dialog-close" ).trigger( "click" );
    }

    $scope.getQurterDateMonth = function(month){
        var date = new Date(), y = $scope.year, m = month;
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        $scope.totalReportForm.startDate = firstDay;
        $scope.totalReportForm.endDate = lastDay;
        $( ".k-dialog-close" ).trigger( "click" );
    }

    $scope.printPdf = function(div) {
        var path = window.location.origin + window.location.pathname;
        var printContents = document.getElementById(div).innerHTML;
        var popupWin = window.open('', '_blank', 'width=1500,height=1000');
        popupWin.document.open();
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="'+path+'bower_components/bootstrap/dist/css/bootstrap.min.css"/><link rel="stylesheet" type="text/css" href="'+path+'assets/css/styles.css"/><style type="text/css">table{width:100% !important}</style></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWin.document.close();
      }

   
    



}]);
app.controller('salesReportCtrl', ["$scope", "$http", "$filter", "APP", "restSessionOut", "toaster","notifications", function ($scope, $http, $filter, APP, restSessionOut,toaster,notifications) { 
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }

    $scope.downloadXls = function(){
        var blob = new Blob([document.getElementById('salesReportexportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "salesReport.xls");
    }

    $scope.displayIncludeVat = true;
    $scope.changeVatProduct = function(){
        if($scope.displayIncludeVat){
            $scope.displayIncludeVat = false;
        }else{
            $scope.displayIncludeVat = true;
        }
    }

    $scope.salesReport= function(which_one){


        $scope.salesFilterForm.startDate_filter = $filter('date')($scope.salesFilterForm.startDate, "yyyy-MM-dd"); 
        $scope.salesFilterForm.endDate_filter = $filter('date')($scope.salesFilterForm.endDate, "yyyy-MM-dd");
        $scope.salesFilterForm.which_one = which_one;
        $scope.salesFilterForm.displayIncludeVat = $scope.displayIncludeVat;
        $http.post(APP.API + 'sales_report', $scope.salesFilterForm
        ).then(function (response) {
            
            
            if(response.data.pdf == 0){
                $scope.product_categories=response.data.product_categories;
                $scope.products=response.data.products;
                $scope.service_categories=response.data.service_categories;
                $scope.services=response.data.services;
                $scope.displayPeriod = true;
                }else if(response.data.invoiceList == 0){
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href',response.data.href);
                    downloadLink.attr('target','_self');
                    downloadLink.attr('download', response.data.pdf_name);
                    downloadLink[0].click();
    
                    setTimeout(function () {
                        $scope.deletePDF_file(response.data.pdf_name)
                      }, 1000)
                   
                }
        
        }).catch(function (request, status, errorThrown) {});
    }
    $scope.deletePDF_file = function(pdf_file_name){
        $http.get(APP.API + 'sales_pdf_delete/'+ pdf_file_name
        ).then(function (response) {
            console.log('response',response)
        }).catch(function (request, status, errorThrown) {});

    }
    
    
    $scope.salesFilterForm = {}
    $scope.yearList = [];
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    $scope.year = date.getFullYear();
    $scope.yearForWeek = date.getFullYear();
    $scope.yearList.push($scope.year);
    $scope.salesFilterForm.startDate =firstDay;
    $scope.salesFilterForm.endDate = lastDay;
    $scope.format='dd-MM-yyyy';
    $scope.psDate = $filter('date')($scope.salesFilterForm.startDate, "yyyy-MM-dd");
    $scope.peDate = $filter('date')($scope.salesFilterForm.endDate, "yyyy-MM-dd");
    
    $scope.salesReport('create_report');

    $scope.getWeeks = function(year){
        $scope.weeks = [];
        if(days_of_a_year(year) == 365){
            for(i=1;i<=52;i++){
                var v = 'Week '+i;
                $scope.weeks.push(v);
            }
        }else{
            for(i=1;i<=53;i++){
                var v = 'Week '+i;
                $scope.weeks.push(v);
            }
        }
    }
    $scope.getWeeks($scope.year);

    $scope.changeStartDate = function(){
        $scope.endDateOptions = {
            showWeeks: false,
            startingDay: 1,
            datepickerMode: 'day',
            minDate:new Date($scope.salesFilterForm.startDate.getFullYear(), $scope.salesFilterForm.startDate.getMonth(), $scope.salesFilterForm.startDate.getDate())
        };
    }
    $scope.changeStartDate();
    
// console.log('$scope.salesFilterForm.startDate',$scope.salesFilterForm.startDate.get);
    


    $scope.changeWeek = function(){
        if($scope.selectedWeek){
            var data = getDateRangeOfWeek($scope.selectedWeek,$scope.yearForWeek);
            var sdate = data.week_start_date.split("-");
            var edate = data.week_end_date.split("-");
            $scope.salesFilterForm.startDate = new Date(sdate[2],(sdate[0]-1),sdate[1]);
            $scope.salesFilterForm.endDate = new Date(edate[2],(edate[0]-1),edate[1]);
        }else{
            $scope.salesFilterForm.startDate =firstDay;
            $scope.salesFilterForm.endDate = lastDay;
        }
    }

    $scope.nextDay = function(){
        var today = $scope.salesFilterForm.startDate;
        var tomorrow = new Date();
        tomorrow.setDate($scope.salesFilterForm.startDate.getDate()+1);
        $scope.salesFilterForm.startDate = tomorrow;
        $scope.salesFilterForm.endDate = '';
    }

    $scope.todayDay = function(){
        $scope.salesFilterForm.startDate = new Date();
        $scope.salesFilterForm.endDate = '';
    }
    
    $scope.previousDay = function(){
        var today = $scope.salesFilterForm.startDate;
        var previousDate = new Date();
        previousDate.setDate($scope.salesFilterForm.startDate.getDate()-1);
        $scope.salesFilterForm.startDate = previousDate;
        $scope.salesFilterForm.endDate = '';
    }

    
    $('#yearList').change(function(){
        var yearVal = $(this).children("option:selected").val();
        $scope.year = yearVal;
    });
    $scope.createReport = function(frmId,which_one){

        var start_date = moment($scope.salesFilterForm.startDate, 'DD-MM-YYYY'),
        end_date = moment($scope.salesFilterForm.endDate, 'DD-MM-YYYY');
        var date_diff = start_date.diff(end_date,'days');
        if(date_diff > 0){
            notifications.Message('warning','Recheck Dates !!','Start date should less than end date !!')
        }else{
            if(date_diff < -366){
                notifications.Message('warning','Recheck Dates !!','Report will not generate more than one year !!')
            }else{
            if ($("#"+frmId).valid()) {
                $scope.psDate = $filter('date')($scope.salesFilterForm.startDate, "yyyy-MM-dd");
                $scope.peDate = $filter('date')($scope.salesFilterForm.endDate, "yyyy-MM-dd");
                $scope.salesReport(which_one);
            }else{
                notifications.Message('error', 'Error', 'Please enter Start Date and End Date .')
            }
        }
        }
    }
    $scope.yearOption = function(){
        val = 10;
        var year = $scope.year;
        for(i=1;i<=val;i++){
            year = year-1;
            $scope.yearList.push(year)
        }
    }
    $scope.yearOption();

    $scope.getQurterDate = function(quarterNumber){
        var month = '';
        var year = $scope.year;
        if(quarterNumber === 1){
            month = 1;
        }else if(quarterNumber === 2){
            month = 4;
        }else if(quarterNumber === 3){
            month = 7;
        }else if(quarterNumber === 4){
            month = 10;
        }
        
        var q = 3
        var quarter = Math.floor((month/ q));
        var firstDate = new Date(year, quarter * q, 1);
        var lastDate = new Date(firstDate.getFullYear(), firstDate.getMonth() + q, 0);
        $scope.salesFilterForm.startDate = firstDate;
        $scope.salesFilterForm.endDate = lastDate;
        $( ".k-dialog-close" ).trigger( "click" );
    }

    $scope.getQurterDateMonth = function(month){
        var date = new Date(), y = $scope.year, m = month;
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        $scope.salesFilterForm.startDate = firstDay;
        $scope.salesFilterForm.endDate = lastDay;
        $( ".k-dialog-close" ).trigger( "click" );
    }
    $scope.printPdf = function(div) {
      var path = window.location.origin + window.location.pathname;
      var printContents = document.getElementById(div).innerHTML;
      var popupWin = window.open('', '_blank', 'width=1500,height=1000');
      popupWin.document.open();
      popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="'+path+'bower_components/bootstrap/dist/css/bootstrap.css"/><link rel="stylesheet" type="text/css" href="'+path+'assets/css/styles.css"/><link rel="stylesheet" type="text/css" href="'+path+'assets/css/custome.css"/><style type="text/css">table{width:100% !important}.services>tbody>tr>td.myCustomClass{text-align:center !important;}.services>tbody>tr>td.myCustomClass1{text-align:center !important;}</style></head><body onload="window.print()">' + printContents + '</body></html>');
      popupWin.document.close();
    }
}]);
app.filter('sumByColumn', function () {
    return function (collection, column) {
    var total = 0;
    angular.forEach(collection, function(item) {
    total += parseFloat(item[column]);
    });
      return total;
    };
  });

