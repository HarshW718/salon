app.controller('invoiceCtrl', ["$scope", "$http", "SweetAlert", "modalProvider", "APP", "notifications", "restSessionOut", "storeAppointmentData","$state","$stateParams","displayInvoiceModal","$cookies","$timeout", function ($scope, $http, SweetAlert, modalProvider, APP, notifications, restSessionOut, storeAppointmentData,$state,$stateParams,displayInvoiceModal,$cookies,$timeout) { 

   
    //$stateParams
    if ($cookies.get('userdata') !== undefined) {
      $scope.loginUserData=JSON.parse($cookies.get('userdata'));
    }
    storeAppointmentData.set({});
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
      restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')){
      restSessionOut.getRstOut();
    }
    $scope.invoice_no = $stateParams.id;
    $scope.template = {};
    $scope.customer = {};
    $scope.invoice = {};

    $scope.create_invoice = function (){
        $http.get(APP.API + 'create_invoice/'+$stateParams.id+'/'+$stateParams.data_id
        ).then(function (response) {
          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) { }
          if(response.data.status == false){
            notifications.Message('info','Information','First create invoice template to watch invoice.')
            $state.go('app.pages.cashdesk-settings', {});
          }else{
            $scope.template.html = response.data.body;
            $scope.customer = response.data.customer;
            $scope.invoice = response.data.invoice;
            $scope.payment_list = response.data.payment_list;
            var index = response.data.payment_list.findIndex(function(single_payment){
           return single_payment.id == 4;});
           //alert(index);
            $scope.display_button = (index == -1) ? false : true; 
            $scope.display_is_received = ($scope.invoice.is_received == 1) ? false : true ; 
            if(displayInvoiceModal.get()){
                $scope.openModal();
                displayInvoiceModal.set(false);
            }
          }
        }).catch(function (request, status, errorThrown) {
        });
    }

    $scope.create_invoice();

    $scope.clickIsReceived = function(which){
      var _title = '';
      if(which == 'is_received'){
        _title = "Is Payment Received !!";
      }else if(which == 'is_not_received'){
        _title = "Is Payment Not Received !!";
      }
      SweetAlert.swal({
        title: _title,
        text: "Are you sure ?",
        // type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        closeOnConfirm: true,
        closeOnCancel: true,
        cancelButtonText: "No",
    },
        function (isConfirm) {
        if(isConfirm){
          var invoice_data = $scope.invoice;
          modalProvider
                  .openPopupModal(
                      APP.VIEW_PATH + 'cashdesk/received_date.html',
                      'receivedDateCtrl',
                      'md',
                      invoice_data,
                      {
                          'success': function (state, title, msg) {
                              notifications.Message('success','Success','Invoice data updated successfully.');
                              $scope.create_invoice()
                          }
                      },
                  )
          // $http.post(APP.API + 'update_invoice_is_received', $scope.invoice
          // ).then(function (response) {
      
          //   if(response.data.status){
          //     $scope.invoice = response.data.invoice;
          //     $scope.display_is_received = ($scope.invoice.is_received == 1) ? false : true ; 
          //     notifications.Message('success','Success',response.data.message);
          //     $state.go('app.pages.cashdesk_main', {});
          //   }
          // }).catch(function (request, status, errorThrown) {
          // });
        }
      });
    }
    $scope.getInvoicePassword = function () {
      $http.get(APP.API + 'get_invoice_password')
          .then(function (response) {
              if(response.data.data){
                  $scope.invoice_password = response.data.data;
              }else{
                  $scope.invoice_password = {};
              }
          }).catch(function (request, status, errorThrown) {}); 
  }
  $scope.getInvoicePassword();

    $scope.toAdjust = function() {
      if($scope.invoice_password.invoice_password == undefined){
        notifications.Message('warning','Warning','Create your invoice password protected !!');
        $timeout(function(){
          $state.go('app.pages.cashdesk-settings', {});
        }, 2000);
      }else{
        SweetAlert.swal({
          title: "Are you sure?",
          text: "Enter password to re-open receipt?",
          type: "input",
          inputType: "password",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, continue it!",
          closeOnConfirm: true,
          closeOnCancel: true,
        
      }, function (typePassword) {
          if (typePassword) {
            if($scope.invoice_password.invoice_password != undefined){
            if(typePassword == $scope.invoice_password.invoice_password){
              $scope.openUnpaidInvoice()
            }else{
              notifications.Message('error','Error','Wrong password entered !!');
            }
           }
          }
      });
      }
    }



    // $scope.toAdjust = function() {

    //   SweetAlert.swal({
    //     content: {
    //       element: "input",
    //       attributes: {
    //         placeholder: "Type your password",
    //         type: "password",
    //       },
    //     },
    //     closeOnConfirm: true,
    //     closeOnCancel: true
    //   });

    // }


    




    $scope.openUnpaidInvoice = function (){
  
      $http.get(APP.API + 'invoice_by_id_for_adjust/' + $scope.invoice_no
      ).then(function (response) {
      $scope.cashdesk_data = response.data.data;
      angular.forEach($scope.cashdesk_data.invoice_data,function(single_invoice_data){
        single_invoice_data.is_single_row_total_paid = 0;
        if(single_invoice_data.service_treatment_date){
          single_invoice_data.service_treatment_date  = new Date(single_invoice_data.service_treatment_date);
        }
      });
      storeAppointmentData.set($scope.cashdesk_data);
      $scope.gotoCashdesk();
      }).catch(function (request, status, errorThrown) {

      });

  }
  $scope.gotoCashdesk = function () {
    $state.go('app.pages.cashdesk', {});
}

    $scope.printDiv = function(divName) {
      var printContents = document.getElementById(divName).innerHTML;
      var popupWin = window.open('', '_blank', 'width=800,height=600');
      popupWin.document.open();
      popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
      popupWin.document.close();
    } 


     $scope.data_pdf =  [{"agence":"CTM","secteur":"Safi","statutImp":"operationnel"}];
     
     $scope.convertIntoPdf = function(){
        html2canvas(document.getElementById('printData'), {
            onrendered: function (canvas) {
                var data = canvas.toDataURL();
                var docDefinition = {
                    content: [{
                        image: data,
                        width: 500,
                    }]
                };
                pdfMake.createPdf(docDefinition).download(Date.now()+"invoice.pdf");
            }
          }
        )}
    

    $scope.openModal = function (){

        modal_html_link = 'cashdesk/openOnInvoiceModalContent.html';
        modal_controller = 'openOnInvoiceCtrl';
        modal_size = '';
        $scope.data_inside_modal = {
         invoice_id : $stateParams.id,
         customer : $scope.customer
        }
    
        modalProvider
          .openPopupModal(
            APP.VIEW_PATH + modal_html_link,
            modal_controller,
            modal_size,
            $scope.data_inside_modal,
            {
              'success': function (state, title, msg) {
                if(state == 'print_invoice'){
                  $scope.printDiv('printData');
                }else if(state == 'pdf_invoice'){
                  $scope.convertIntoPdf()
                }
               // const EDITED_ROW = msg;
              //  $scope.table_data[index].single_row_comment = EDITED_ROW.single_row_comment;
              }
            },
          )
    
      }
    
  var isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone");
  var isiPad = navigator.userAgent.toLowerCase().indexOf("ipad");
  var isiPod = navigator.userAgent.toLowerCase().indexOf("ipod");
  var android = navigator.userAgent.toLowerCase().indexOf("android");


  if (isiPhone > -1) {
      
    (jQuery('#barIcon.hide').length == 1) ? jQuery('#barIcon').removeClass('hide') : jQuery('#barIcon').removeClass('hide');
    jQuery('#leftSideBar').addClass('hide');
      
  }

  if (isiPad > -1) {
      
    (jQuery('#barIcon.hide').length == 1) ? jQuery('#barIcon').removeClass('hide') : jQuery('#barIcon').removeClass('hide');
    jQuery('#leftSideBar').addClass('hide')
      
  }
  if (isiPod > -1) {
      
    (jQuery('#barIcon.hide').length == 1) ? jQuery('#barIcon').removeClass('hide') : jQuery('#barIcon').removeClass('hide');
    jQuery('#leftSideBar').addClass('hide')
      
  }

  if (android > -1) {
      
    (jQuery('#barIcon.hide').length == 1) ? jQuery('#barIcon').removeClass('hide') : jQuery('#barIcon').removeClass('hide');
    jQuery('#leftSideBar').addClass('hide');
      
  }
  $scope.hideSidebar = function () {
    
    if(jQuery('#leftSideBar.hide').length == 1){

      jQuery('#leftSideBar').removeClass('hide');
       
    }else {

      jQuery('#leftSideBar').addClass('hide');
        
    }
  }
}])



app.controller('openOnInvoiceCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "cb", "restSessionOut", "notifications","$state", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut, notifications,$state) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
      restSessionOut.getRstOut();
    }

    $scope.goToCashdeskList = function(){
      $uibModalInstance.close();
      $state.go('app.pages.cashdesk_main', {});
    }

    $scope.goToAgenda = function (){
      $uibModalInstance.close();
      $state.go('app.pages.calendar', {});

    }

    $scope.goToPrint = function (){
      $uibModalInstance.close();
      cb.success('print_invoice','print_invoice','print_invoice');
  
    }

    $scope.goToPDF = function (){
      $uibModalInstance.close();
      cb.success('pdf_invoice','pdf_invoice','pdf_invoice');
    }
    $scope.email = {check:false,email_address:items.customer.email}
    
    $scope.gotToEmail = function(){

      var patt = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm);
      var email_check = patt.test($scope.email.email_address);
      if(email_check){
         
        var send_data = {
          invoice_id:items.invoice_id,
          send_as_pdf:($scope.email.check == true) ? 1 : 0,
          customer_email:$scope.email.email_address
        };
        $http.post(APP.API + 'save_invoice_email', send_data
        ).then(function (response) {
          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) { }
          if(response.data.status ==  true){
             $uibModalInstance.close();
          }


          }).catch(function (request, status, errorThrown) {
    
          });

      }else{
         notifications.Message('error','Error','Invalid email !!')
      }
    }
  


  $scope.cancel = function () {
    $uibModalInstance.close();
    // cb.success('on_close', 'cancel', "On modal close communicate to main modal");
  };




}])
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
