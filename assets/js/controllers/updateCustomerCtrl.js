'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('updateCustomerController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", "$log", "FileUploader", "modalProvider_compare", "SweetAlert","notifications","$state","$location","$interval", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut, $log, FileUploader, modalProvider_compare, SweetAlert,notifications,$state,$location,$interval) {

    $scope.appHistoryRowClick = function (invoiceId) {
        $uibModalInstance.close();
        $location.path('app/pages/invoice/'+invoiceId+'/0')
    }

    $scope.tmp = {};
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
    var all_images_in_single_array = []
    $scope.customer_address = {'street':'','city':''}
    $scope.news_letter = {checked:''}
    $scope.customer = {is_news_letter:''}
    $scope.parent_controller = '';
    var compareModalClass = ''
    $scope.memo_form = true;
    $scope.memo_list = false;
    $scope.memo_data = {customer_id:items.data.id};
  
   // $scope.customer_salon_relation();
    $scope.list_appointments = function () { 

        var formdata = {customer_id:items.data.id,appointment_date:0};
        var previous_data = [];
        var coming_data = [];
        var cancel_data = [];

       
        $http.post(APP.API + 'list_appointments_by_customer_for_update', formdata
        ).then(function (response) {
           
            if (response.data.data != '' && typeof (response.data.data) != undefined) {
                const RESPONCE_APPOINTMENTS = response.data.data;
                const TODAY = new Date((new Date()).getUTCFullYear() +"-"+((new Date()).getUTCMonth()+1) +"-"+(new Date()).getUTCDate());
                RESPONCE_APPOINTMENTS.filter(function(appointment) {
                    
                  var APPOINTMENT_DATE = new Date(appointment.appointment_date);
                    if(appointment.appointment_status_id == 3){
                        previous_data.push(appointment);
                    }else if(TODAY > (new Date(appointment.appointment_date))){
                        previous_data.push(appointment);
                    }else if ((TODAY == new Date(appointment.appointment_date) || TODAY < new Date(appointment.appointment_date))  && ((appointment.appointment_status_id == 7) || (appointment.appointment_status_id == 1) || (appointment.appointment_status_id == 2))){
                        coming_data.push(appointment);
                    }else if(appointment.appointment_status_id === 5){
                  
                        let cancel_logs = appointment.appointments_log.filter(obj => {
                            return obj.appointment_status === 5
                          })
                        
                        appointment.appointments_log = cancel_logs[0]
                        if(cancel_logs[0].cancel_reason === 1) {
                            Object.assign(cancel_logs[0],{cancel_reason: 'Cancellation'})
                        } else if(cancel_logs[0].cancel_reason === 2) {
                            Object.assign(cancel_logs[0],{cancel_reason: 'Cancellation not on time'})
                        } else if(cancel_logs[0].cancel_reason === 3) {
                            Object.assign(cancel_logs[0],{cancel_reason: 'No-show Cancellation'})
                        }
                        cancel_data.push(appointment);
                   }

                  });

                  $scope.previous_data = previous_data.sort(function(a,b){
                  return new Date(b.appointment_date+" "+b.start_time).getTime() - new Date(a.appointment_date+" "+a.start_time).getTime()
                  });
                  $scope.coming_data = coming_data.sort(function(a,b){
                    return new Date(b.appointment_date+" "+b.start_time).getTime() - new Date(a.appointment_date+" "+a.start_time).getTime()
                    });
                  $scope.cancel_data = cancel_data.sort(function(a,b){
                    return new Date(b.appointment_date+" "+b.start_time).getTime() - new Date(a.appointment_date+" "+a.start_time).getTime()
                  });
                  $scope.previous_data_display = ($scope.previous_data.length > 0) ? true : false;
                  $scope.coming_data_display = ($scope.coming_data.length > 0) ? true : false;
                  $scope.cancel_data_display = ($scope.cancel_data.length > 0) ? true : false;
                  
            } 

        })

    }
    $scope.list_appointments();



    $scope.list_images = function () {

        $http.get(APP.API + 'list_images/' + items.data.id
        ).then(function (response) {
            console.log('images', response);
            if (response.data.data != '' && typeof (response.data.data) != undefined) {
                $scope.images = response.data.data
                angular.forEach(response.data.data, function (image_chunk) {
                    angular.forEach(image_chunk, function (single_image) {
                        all_images_in_single_array.push(single_image);
                    });
                });
                $scope.all_images = all_images_in_single_array;
                // console.log('all images',all_images_in_single_array)

            } else {
                $scope.images = [];
            }

        })

    }
    $scope.list_images();

    $scope.customer_created_by = function () {

        $http.get(APP.API + 'customer_created_by/' + items.data.created_by
        ).then(function (response) {
            if (response.data.data != '' && typeof (response.data.data) != undefined) {
                $scope.customer_created_by_user = response.data.data[0]

            } else {
                $scope.customer_created_by_user = [];
            }

        })

    }
    $scope.customer_created_by();


    $scope.unpaid_invoice_by_customer_id = function () {

        $http.get(APP.API + 'unpaid_invoice_total_by_customerid/' + items.data.id
        ).then(function (response) {
            var unpaid_amount = 0;
            angular.forEach(response.data.unpaidList,function(single_list){
                unpaid_amount += parseInt(single_list.amount);
            })
            $scope.bankunpaid_amount =  '₹ '+unpaid_amount;
        })

    }
    $scope.unpaid_invoice_by_customer_id();

    $scope.list_memos = function(){
        
        $http.get(APP.API + 'memos_by_customer_id/' + items.data.id
        ).then(function (response) {
            $scope.memos = response.data.data;
            
        })
    }
    $scope.list_memos();



    $scope.showMemoForm = function(memo_data,e){
        if($(e.target).attr('class') == 'fa fa-remove text-large'){
            return false
        }
        $scope.memo_data = (memo_data == 0) ? {customer_id:items.data.id} : memo_data;
        $scope.save_or_update = (memo_data == 0) ? 'save' : 'update';
        $scope.memo_form = false;
        $scope.memo_list = true;
    }
    $scope.hideMemoForm = function(){
        $scope.memo_form = true;
        $scope.memo_list = false;
        $('#id_memoForm').validate().resetForm();
        $scope.list_memos();
    }

    $scope.saveMemoForm = function (){
        if ($('#id_memoForm').valid()) {
                $http.post(APP.API + 'add_memo', $scope.memo_data
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    var return_responce = response.data;
                    if (return_responce.success != false) {
                        $scope.list_memos();
                        $scope.hideMemoForm();
                        notifications.Message('success', 'Success', return_responce.message);
                    }
                }).catch(function (request, status, errorThrown) {
                    var responce_error = request.data;
                    angular.forEach(responce_error.errors, function (error) {
                        for (var i = 0; i < error.length; i++) {
                            // cb.success('error', 'Error', error[i]);
                            toaster.pop('error', 'Error', error[i]);
                        }
                    });
                });
            }
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
    

    $scope.memoDelete = function (memo_data) {

        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to delete this memo ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes,delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_memo', memo_data
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    $scope.list_memos();
                    notifications.Message('success', 'Success', response.data.message);
                    
                }).catch(function (request, status, errorThrown) {

                });
            } 
        });
    }



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

   
    $scope.submitCutomerForm = function () {


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

        if ($('#id_updatecustomerForm').valid()) {

            if($scope.tmp.dt_update != null)
            {

            
            if($scope.tmp.dt_update.getHours() != 0){
                $scope.customer.dob = $scope.tmp.dt_update;
            }else{
          var year = $scope.tmp.dt_update.getFullYear();
          var month = (($scope.tmp.dt_update.getMonth() + 1).length < 2) ? '0' + ($scope.tmp.dt_update.getMonth() + 1) : ($scope.tmp.dt_update.getMonth() + 1);
          var day = (($scope.tmp.dt_update.getDate()).length < 2) ? '0' + $scope.tmp.dt_update.getDate() : $scope.tmp.dt_update.getDate();
          $scope.customer.dob = year + "-" + month + "-" + day
            }
        }
        else{
            $scope.customer.dob = null;
        }
            $scope.customer.is_news_letter = $scope.news_letter.checked;

            if (typeof ($scope.customer.id) !== 'undefined') {
                
                $http.post(APP.API + 'update_customer', $scope.customer
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    var return_responce = response.data;
                    if (return_responce.success != false) {
                        $uibModalInstance.close();
                        cb.success('success', 'Success', return_responce.message);
                    }
                }).catch(function (request, status, errorThrown) {
                    var responce_error = request.data;
                    angular.forEach(responce_error.errors, function (error) {
                        for (var i = 0; i < error.length; i++) {
                            // cb.success('error', 'Error', error[i]);
                            toaster.pop('error', 'Error', error[i]);
                        }
                    });
                });
            }
        } else {
            return false;
        }
    }


    $scope.fillAddress = function () {

        $scope.customer.address = '';
        $scope.customer.address = (($scope.customer_address.street != undefined) ? $scope.customer_address.street : '') + " " + (($scope.customer.house_no != undefined) ? $scope.customer.house_no : '') + " " + (($scope.customer.house_letter != undefined) ? $scope.customer.house_letter : '') ;
    
    
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

    $scope.findAddress = function () {

        if (($scope.customer.postal_code != undefined) && ($scope.customer.house_no != undefined)) {
            if (($scope.customer.postal_code != '') && ($scope.customer.house_no != '')) {
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

            } else {
                toaster.pop('error', 'Faild', 'Please fill postal code and house no.  !!');

            }
        } else {
            toaster.pop('error', 'Faild', 'Please fill postal code and house no.  !!');

        }
        //&number=30
    }


    var uploaderImages = $scope.uploaderImages = new FileUploader({
        url: APP.API + 'customer_images',
        headers: { 'authtoken': auth_token },
        formData: [{ 'id': items.data.id }]

    });


    // FILTERS
    uploaderImages.filters.push({
        name: 'imageFilter',
        fn: function (item/*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            if('|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1){
                return true;
            }else{
                notifications.Message('warning','Failed','This is unsupported file !!');
                return false;
            }
            
        }
    });

    // CALLBACKS

    uploaderImages.onWhenAddingFileFailed = function (item/*{File|FileLikeObject}*/, filter, options) {
        //alert('onWhenAddingFileFailed');
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploaderImages.onAfterAddingFile = function (fileItem) {
        //alert('onAfterAddingFile');
        console.info('onAfterAddingFile', fileItem);
    };
    uploaderImages.onAfterAddingAll = function (addedFileItems) {
        // alert('onAfterAddingAll');
        console.info('onAfterAddingAll', addedFileItems);
        uploaderImages.uploadAll()

    };
    uploaderImages.onBeforeUploadItem = function (item) {
        //alert('onBeforeUploadItem');
        console.info('onBeforeUploadItem', item);
    };
    uploaderImages.onProgressItem = function (fileItem, progress) {
        // alert('onProgressItem');
        console.info('onProgressItem', fileItem, progress);
    };
    uploaderImages.onProgressAll = function (progress) {
        // alert('onProgressAll');
        console.info('onProgressAll', progress);
    };
    uploaderImages.onSuccessItem = function (fileItem, response, status, headers) {
        // alert('onSuccessItem');
        console.info('onSuccessItem', fileItem, response, status, headers);

    };
    uploaderImages.onErrorItem = function (fileItem, response, status, headers) {
        // alert('onErrorItem');
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploaderImages.onCancelItem = function (fileItem, response, status, headers) {
        //alert('onCancelItem');
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploaderImages.onCompleteItem = function (fileItem, response, status, headers) {
        //alert('onCompleteItem');
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploaderImages.onCompleteAll = function () {
        // alert('onCompleteAll');
        console.info('onCompleteAll');
        // uploaderImages.uploadAll()
        $scope.list_images();
    };

    $scope.onImageUpload = function () {
        uploaderImages.onAfterAddingAll();
    }


    $scope.items = items;
    if (items.data != 0) {
       
        $scope.customer = items.data;
        $scope.customer.mobile = items.data.mobile;
        (items.data.dob == null) ? $scope.tmp.dt_update = null :$scope.tmp.dt_update = new Date(items.data.dob);
        
        var street =   (items.data.address != null) ? items.data.address.replace(/\'/g, '').split(/(\d+)/).filter(Boolean) : '';
        $scope.customer_address.street = street[0]
        $scope.news_letter.checked = (items.data.is_news_letter == 1)?true:false;
        $scope.parent_controller = items.parentController
    }
    $scope.selected = {
        item: $scope.items,
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
        cb.success('close', 'close', 'close');
    };

    $scope.today = function () {
        $scope.dt_update = new Date();
    };
    //  $scope.today();

    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;

    $scope.clear = function () {
        $scope.dt_update = null;
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
        // $scope.mydp.opened = true;
        // console.log('$scope.opened_date',$scope.opened_date);
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



    // $scope.createMedicalForm = function(){
    //     $uibModalInstance.close();
    //     $location.path("app/pages/form_list");
    // }

    // $scope.editMedicalForm = function(form_id){
    //     $uibModalInstance.close();
    //     $location.path("app/pages/form_builder/"+form_id);
    // }

    $scope.emailToCustomer = function(data){

        $http.post(APP.API + 'save_medical_consent_mail', data
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    notifications.Message('success', 'Success',response.data.message);
                }).catch(function (request, status, errorThrown) {

                });
        
    }

    $scope.moveToTrash = function () {

        var checkArr = [];
        $.each($("input[name='check_image']:checked"), function () {
            checkArr.push($(this).val());
        });
        $scope.images_ids = checkArr;
        if (checkArr.length == 0) {
            toaster.pop('error', 'Error', 'Please checked at least one image !!');
            return false;
        }
        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to delete selected images !",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes,delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_selected_images', $scope.images_ids
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    $(".select_all").prop("checked", false);
                    toaster.pop('success', 'Success', response.data.message);
                    $scope.list_images();
                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });
    }

    $scope.compareBwTwoImages = function () {

       switch($scope.parent_controller) {
        case 'showAppointmentController':
               // compareModalClass = 'compare-modal-calendar';
                compareModalClass = 'largeWidth-modal';
          break;
        case 'customerCtrl':
                compareModalClass = 'largeWidth-modal';
          break;
      }
        var checkArr = [];
        var two_images = [];
        $.each($("input[name='check_image']:checked"), function () {
            checkArr.push($(this).val());
        });

        if (checkArr.length != 2) {

            toaster.pop('error', 'Failed', 'Please select two images to compare between them !!')

        } else {

            angular.forEach(checkArr, function (key) {
                two_images.push($scope.all_images.find(function (single_image) {
                    return single_image.id == key
                }));
            });

            $scope.data_inside_modal = {
                customer_id: items.data.id,
                data: two_images,
            }
            modalProvider_compare
                .openPopupModal(
                    APP.VIEW_PATH + 'customers/compareImagesModalContent.html',
                    'compareImagesController',
                    'lg',
                    $scope.data_inside_modal,
                    {
                        'success': function (state, title, msg) {
                            $scope.clearAll(state, title, msg);
                        }
                    },
                    compareModalClass

                )
        }
    }
    $scope.voucherList=function(){
        console.log(items.data.id);
        $http.get(APP.API + 'voucher_list/'+items.data.id,
        ).then(function (response) {
           $scope.voucher_list=response.data.voucher_list;
           console.log()
           $scope.uniqueVoucher_list = Array.from(new Set($scope.voucher_list.map(a => a.id)))
             .map(id => {
               return $scope.voucher_list.find(a => a.id === id)
             })
        }).catch(function (request, status, errorThrown) {

        });
    }
    $scope.voucherList();


    //Get Membership List

    $scope.membership_list=function(){
        // console.log(items.data.id);
        $http.get(APP.API + 'customer_coupon_get/'+items.data.id,
        ).then(function (response) {
           $scope.members_list=response.data.data;
           console.log($scope.members_list);
           
        }).catch(function (request, status, errorThrown) {

        });
    }
    $scope.membership_list();


    $scope.couponList=function(){
        $http.get(APP.API + 'coupon_list/'+items.data.id,
        ).then(function (response) {
         //  console.log('response coupon_list',response)

         if(response.data.coupon_list.length > 0){
            angular.forEach(response.data.coupon_list,function(single_coupon){
                if(single_coupon.hmt_used == 0){
                    single_coupon.per_use = 0;
                 }else if(single_coupon.hmt_used > 0){
                    single_coupon.per_use =  (single_coupon.hmt_used/single_coupon.no_of_services*100).toFixed();
                   
                 }
              })
           
            $scope.coupon_list = response.data.coupon_list.filter(function(single_coupon){
                return (single_coupon.where_from == 0);
              });
         }else{
            $scope.coupon_list = [];
         }
          
        }).catch(function (request, status, errorThrown) {

        });
    }
    $scope.couponList();

    if($scope.appHistory==undefined){
        $scope.appHistory={};
    }
    $scope.appHistory.services=0;
    $scope.appHistory.product=0;
    $scope.appHistory.coupon=0;
    $scope.appHistory.since=0;
    $scope.appHistoryList=function(){
         
        $http.get(APP.API + 'app_history_list/'+items.data.id,
        ).then(function (response) {
           $scope.app_history_list=response.data.app_history_list;
           $scope.appHistory.since=response.data.customerData.since;
           $scope.appHistory.lastApp=response.data.customerData.lastApp;
           $scope.remaining_coupon = response.data.remaining_coupon;
           angular.forEach($scope.app_history_list, function (key) {
                if(key.which_one=='service'){
                    $scope.appHistory.services=key.total;
                }else if(key.which_one=='product'){
                    $scope.appHistory.product=key.total;
                }else if(key.which_one=='coupon'){
                    $scope.appHistory.coupon=key.total;
                }
            });
           
        }).catch(function (request, status, errorThrown) {

        });
    }
    $scope.appHistoryList();

    $scope.lanline_validation=false;
    
$scope.constant_medical_form_list = function(){
    $http({
        method: "post",
        url: APP.API + 'dt_form_list',
        data: {
            length: 100000000,
            start: 0,
            draw: 1,
            order: 'id',
        }
    }).then(function (response) {
        $scope.consentFormList = []; //type 1
        $scope.treatmentFormList = []; //type 2
        $scope.medicalFormList = []; //type 3
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) { }
        if (response.data.success && response.data.data.length > 0) {
            angular.forEach(response.data.data, function (value, key) {
                if (value.type == 1) {
                    $scope.consentFormList.push(value);
                }
                if (value.type == 2) {
                    $scope.treatmentFormList.push(value);
                }
                if (value.type == 3) {
                    $scope.medicalFormList.push(value);
                }
            })
        }
    }, function (error) {
    });
}
$scope.constant_medical_form_list();

$scope.consent_form = {customer_id:0,date:new Date()}
$scope.medical_form = {customer_id:0,date:new Date()}
$scope.createConsentForm = function (which_form){
    
   

    if(which_form == 'consent'){


        var year = $scope.consent_form.date.getFullYear();
        var month = (($scope.consent_form.date.getMonth() + 1).length < 2) ? '0' + ($scope.consent_form.date.getMonth() + 1) : ($scope.consent_form.date.getMonth() + 1);
        var day = (($scope.consent_form.date.getDate()).length < 2) ? '0' + $scope.consent_form.date.getDate() : $scope.consent_form.date.getDate();
        var final_date = year+'-'+month+'-'+day;
        var send_data = {form_id:$scope.consent_form.form_id,customer_id:$scope.customer.id,date:final_date}
        
    
    }else if(which_form == 'medical'){

        var year = $scope.medical_form.date.getFullYear();
        var month = (($scope.medical_form.date.getMonth() + 1).length < 2) ? '0' + ($scope.medical_form.date.getMonth() + 1) : ($scope.medical_form.date.getMonth() + 1);
        var day = (($scope.medical_form.date.getDate()).length < 2) ? '0' + $scope.medical_form.date.getDate() : $scope.medical_form.date.getDate();
        var final_date = year+'-'+month+'-'+day;
        var send_data = {form_id:$scope.medical_form.form_id,customer_id:$scope.customer.id,date:final_date}

    }      
    
    if(send_data.form_id != null){
    $http.post(APP.API + 'add_constent_form',send_data,
    ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) { }
        notifications.Message('success', 'Success',response.data.message);
        $scope.forAndList();
       // $scope.getAllCanvas();
   }).catch(function (request, status, errorThrown) {
   });
    }else{
        notifications.Message('error', 'Error','First select form !!');

    } 

}

    
    
$scope.forAndList=function(){
        var data = {customer_id:items.data.id};
        $http.post(
            APP.API + 'dt_form_ans_list',data,
        ).then(function (response) {
            $scope.consentReportList = [];//type 1
            $scope.treatmentReportList = [];//type 2
            $scope.medicalReportList = [];//type 3
            if (response.data.form_ans_list.length > 0) {
                angular.forEach(response.data.form_ans_list, function(value, key) {
                  value.created_at = new Date(value.created_at);
                  if(value.type == 1){
                    $scope.consentReportList.push(value);
                  }
                  if(value.type == 2){
                    $scope.treatmentReportList.push(value); 
                  }
                  if(value.type == 3){
                    $scope.medicalReportList.push(value);
                  }
                })  
            }
            if (response.data.form_ans_list_zero.length > 0) {
                 angular.forEach(response.data.form_ans_list_zero, function(value, key) {
                   value.created_at = new Date(value.created_at);
                   value.service_name = '-----';
                   if(value.type == 1){
                       
                     $scope.consentReportList.push(value);
                   }
                   if(value.type == 2){
                     $scope.treatmentReportList.push(value); 
                   }
                   if(value.type == 3){
                     $scope.medicalReportList.push(value);
                   }
                 })  
             }
            
       }).catch(function (request, status, errorThrown) {
       });
    }
    $scope.forAndList();


    

    $scope.consentRowClick = function (val,e) {
        if($(e.target).attr('class') == 'fa fa-envelope text-azure'){
            return false
        }
        var url1 = '';
        if(val.app_id != 0){
            url1 = "#!/login/reportform/"+val.user_company_id+"/"+val.form_id+"/"+val.customer_id+"/"+val.app_id+"?admin";
        }else if(val.app_id == 0){
            url1 = "#!/login/reportform/0/"+val.form_id+"/0/"+val.id+"?admin";
        }
        var url = window.location.origin + window.location.pathname + url1;
        window.open(url, '_blank');
    };
    $scope.medicalReportRowClick = function (val,e) {
        if($(e.target).attr('class') == 'fa fa-envelope text-azure'){
            return false
        }
        var url1 = '';
        if(val.app_id != 0){
            url1 = "#!/login/reportform/"+val.user_company_id+"/"+val.form_id+"/"+val.customer_id+"/"+val.app_id+"?admin";
        }else if(val.app_id == 0){
            url1 = "#!/login/reportform/0/"+val.form_id+"/0/"+val.id+"?admin";
        }
        var url = window.location.origin + window.location.pathname + url1;
        console.log("url", url);
        window.open(url, '_blank');
    };

    var promise;
    $scope.start = function () {
      $scope.stop();
      promise = $interval(refreshreportforDate, (1000*3));
    };

    // stops the interval
    $scope.stop = function (){
      $interval.cancel(promise);
    };
  
    // starting the interval by default
    $scope.start();
    $scope.$on('$destroy', function () {
      $scope.stop();
    });


    function refreshreportforDate(){
        $scope.forAndList();
    }

    $scope.openCreateMedialCanvas = function(){
            $scope.data_inside_modal = {
                data: items.data,
                type:'create'
            }
            modalProvider_compare
                .openPopupModal(
                    APP.VIEW_PATH + 'customers/medicalCanvasModal.html',
                    'medicalCanvasModalCtrl',
                    'lg',
                    $scope.data_inside_modal,
                    {
                        'success': function (state, title, msg) {
                            $scope.getAllCanvas();
                            $scope.clearAll(state, title, msg);
                        }
                    },
                    'largeWidth-modal'
                )
    }

    $scope.editCanvas = function(id,e){
            if($(e.target).attr('class') == 'fa fa-remove text-large'){
                return false
            }
            $scope.data_inside_modal = {
                data: id,
                type:'update'
            }
            modalProvider_compare
                .openPopupModal(
                    APP.VIEW_PATH + 'customers/medicalCanvasModal.html',
                    'medicalCanvasModalCtrl',
                    'lg',
                    $scope.data_inside_modal,
                    {
                        'success': function (state, title, msg) {
                            $scope.getAllCanvas();
                            $scope.clearAll(state, title, msg);
                        }
                    },
                    'largeWidth-modal'
                )
    }

    $scope.deleteCanvas = function(id){
        
        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to delete this report ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes,delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $scope.delData = {
                    'id':id
                }
                  $http.post(
                    APP.API + 'delete_pedicure_canvas',$scope.delData,
                ).then(function (response) {
                    notifications.Message('success', 'Success',response.data.message);
                    $scope.getAllCanvas();
               }).catch(function (request, status, errorThrown) {
               }); 
            } 
        });         
    }

    $scope.clearAll = function (state, title, msg) {
        notifications.Message(state, title, msg);
    }

    $scope.getAllCanvas = function(){
        $scope.customerId = items.data.id
        $http.post(
            APP.API + 'get_canvas_all',$scope.customerId,
        ).then(function (response) {
             $scope.pedicureList = [];
            if(response.data.data.length > 0){
                angular.forEach(response.data.data, function(value, key) {
                  value.created_at = new Date(value.created_at);
                })
                $scope.pedicureList = response.data.data;
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.getAllCanvas();



    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'day',
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
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);
    $scope.open = function (type) {
    
            if (type == 'consent') {
                $scope.consent_opened = !$scope.consent_opened;
            }else if(type == 'medical') {
                $scope.medical_opened = !$scope.medical_opened;
            }
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
        $scope.dt = d;
    };
    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.dt);
    };
    $scope.clear = function () {
        $scope.dt = null;
    };


}]);
app.controller('medicalCanvasModalCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster","cb","$timeout", function ($scope, $uibModalInstance, $http, items, APP, toaster,cb,$timeout) {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    $scope.isTablet = false;
    if(isTablet){
        $scope.isTablet = true;
    }
    $scope.imagesList = ["legs", "hands", "face"];
    $scope.imageSelected = 'legs';
    $scope.customer_id = items.data.id;
    $scope.showBtn = false;
    window.localStorage.is_uploaded = false;
    $scope.medical_report = {date:new Date()};

    

    $scope.imageChange = function (oldVal) {
        var canvas= document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0,  canvas.width, canvas.height);
        var imageUrl = 'assets/images/sketch/'+$scope.imageSelected+'.png';
        $("#canvas").css("background-image", "url("+imageUrl+")");
        window.localStorage.is_uploaded = false;
    }

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.saveCanvas = function () {        
        $scope.is_uploaded = window.localStorage.is_uploaded;        
        var canvas = document.getElementById('canvas');
        var dataURL = canvas.toDataURL();
        var sketchImg = $scope.imageSelected+'.png';
        if($scope.is_uploaded == "true"){
            
            var bg = $('#canvas').css('background-image');
            var capturedImageData = bg.replace('url(','').replace(')','').replace(/\"/gi, "")
            console.log('capturedImageData',capturedImageData);
            sketchImg = capturedImageData;
        }
        // if (!$scope.selectedService) {
        //     toaster.pop('error', 'Failed', 'Please selecte service.');
        //     return;
        // }
        if (!$scope.pedicureTitle) {
            toaster.pop('error', 'Failed', 'Please fill title.');
            return;
        }
        


        var year = $scope.medical_report.date.getFullYear();
        var month = (($scope.medical_report.date.getMonth() + 1).length < 2) ? '0' + ($scope.medical_report.date.getMonth() + 1) : ($scope.medical_report.date.getMonth() + 1);
        var day = (($scope.medical_report.date.getDate()).length < 2) ? '0' + $scope.medical_report.date.getDate() : $scope.medical_report.date.getDate();
        var final_date = year+'-'+month+'-'+day;
            
        $scope.FormData = {
            "customer_id":$scope.customer_id,   
            //"service_id":$scope.selectedService,
            "title":$scope.pedicureTitle,  
            "allergies":$scope.allergies,
            "note":$scope.note,
            "form_subs":$scope.selectedFormSubs,  
            "sketch_img":sketchImg, 
            "canvas_img":dataURL,
            "is_uploaded":$scope.is_uploaded,
            "pedicure_report_date":final_date
        }


        $("#saveBtn").attr("disabled", true);
        $http.post(
            APP.API + 'save_pedicure_canvas',$scope.FormData,
        ).then(function (response) {
            $uibModalInstance.close();
            cb.success('success', 'Success',response.data.message);
            $("#saveBtn").attr("disabled", false);
       }).catch(function (request, status, errorThrown) {
       });
    
    };


    $scope.uploadPicture1 = function(){
        
        var FD = new FormData()
        var fileInput = document.getElementById('capturedImage')
        var file = document.getElementById('capturedImage').files[0];
        var reader  = new FileReader();
    
        reader.onload = function(e)  {
            console.log("e", e);
            // var canvas= document.getElementById('canvas');
            // var ctx = canvas.getContext('2d');
            // ctx.clearRect(0, 0,  canvas.width, canvas.height);
            $("#canvas").css("background-image", "url("+e.target.result+")");
            $("#canvas").css("background-size","450% 450% !important");
            window.localStorage.is_uploaded = true
        }
    
        reader.readAsDataURL(file);


    }
    $scope.updateCanvas = function () {
        $scope.is_uploaded = window.localStorage.is_uploaded;
        console.log("$scope.updateCanvas -> $scope.is_uploaded", $scope.is_uploaded)
        var canvas = document.getElementById('canvas');
        console.log("$scope.updateCanvas -> canvas", canvas)
        var dataURL = canvas.toDataURL();
        
        var sketchImg = $scope.imageSelected+'.png';
        if($scope.is_uploaded == "true"){
            var bg = $('#canvas').css('background-image');
            var capturedImageData = bg.replace('url(','').replace(')','').replace(/\"/gi, "")
            sketchImg = capturedImageData;
        } 

        $scope.FormData = {
            "id":$scope.editCanvasId,
            "customer_id":$scope.customer_id,   
            //"service_id":$scope.selectedService,  
            "title":$scope.pedicureTitle, 
            "allergies":$scope.allergies,
            "note":$scope.note, 
            "form_subs":$scope.selectedFormSubs,  
            "sketch_img":sketchImg,
            "canvas_img":dataURL,
            "is_uploaded":$scope.is_uploaded,
            "is_tablet":$scope.isTablet,
            "pedicure_report_date":$scope.medical_report.date
        }
        

        $("#updateBtn").attr("disabled", true);
        $http.post(
            APP.API + 'update_pedicure_canvas',$scope.FormData,
        ).then(function (response) {
            $uibModalInstance.close();
            cb.success('success', 'Success',response.data.message);
            $("#updateBtn").attr("disabled", false);
       }).catch(function (request, status, errorThrown) {
       });
    
    };

    
    $scope.list_service = function () {
        $http.get(APP.API + 'list_service'
        ).then(function (response) {
            if(response.data.data.length > 0){
                $scope.serviceList = response.data.data;
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.list_service()

    $scope.selectedFormSubs = '';
    $scope.insertTitleValue = function (id,val) {
        var OldData = CKEDITOR.instances["txtArea"].getData();
        var newVal = OldData + val;
        CKEDITOR.instances["txtArea"].setData(newVal)
        // $('#txtArea').val(function(_, oldVal) {
        //     console.log("oldVal", oldVal);
        //     console.log("val", val);
        //     var newval = oldVal + val;
        //     $scope.selectedFormSubs = newval;
        //     var test = $scope.selectedFormSubs.split(":");
        //     if(test.length > 0){
        //         angular.forEach(test,function(v,i){
        //             test[i] = v.trim();

        //         })
        //         $scope.selectedFormSubs = test.join(":\n");
        //     }else{
        //          $scope.selectedFormSubs = $scope.selectedFormSubs;
        //     }
        //     return newval;
        // });
    }


    $http({
    method: "post",
    url: APP.API + 'dt_form_sub_list',
    data: {
        length: 1000000000000000,
        start: 0,
        column_name: 'id',
    }
    }).then(function (response) {
        $scope.formSubsList = [];
        if(response.data.data.length > 0){
            $scope.formSubsList = response.data.data;
        }
    }, function (error) {
    });

    if(items.type === 'update'){
        $scope.showBtn = true;
        
        $http.post(
            APP.API + 'get_canvas/'+items.data,
        ).then(function (response) {
            if(response.data.data){

                $scope.editCanvasId = response.data.data.id;
                $scope.customer_id = response.data.data.customer_id;
                //$scope.selectedService = response.data.data.service_id;
                $scope.pedicureTitle = response.data.data.title;
                $scope.medical_report = {date: new Date(response.data.data.pedicure_report_date)};
                $scope.allergies = response.data.data.allergies;
                $scope.note = response.data.data.note;
                $scope.selectedService = response.data.data.service_id;
                $scope.selectedFormSubs = response.data.data.form_subs;
                $scope.oldUploaded = response.data.data.sketch_img;
                $scope.is_uploaded = response.data.data.is_uploaded;
                window.localStorage.is_uploaded = $scope.is_uploaded;
                if(response.data.data.is_uploaded == "true"){
                    $scope.imageSelected = response.data.data.sketch_img;
                    $("#canvas").css("background-image", "url("+response.data.data.sketch_img+")");
                }else{
                    $scope.imageSelected = response.data.data.sketch_img.split('.')[0];
                    var imageUrl = 'assets/images/sketch/'+$scope.imageSelected+'.png';
                    $("#canvas").css("background-image", "url("+imageUrl+")");
                }


                const c = document.getElementById("canvas");
                const ctx = c.getContext("2d");
                var img = new Image;
                img.onload = function(){
                    c.width = img.width;
                    c.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                }
                img.src = response.data.data.canvas_img
                }
        })
        .catch(function (request, status, errorThrown) {
        });
    } else {
        $scope.customerId = items.data.id
        $http.post(
            APP.API + 'getCanvasReport',$scope.customerId,
        ).then(function (response) {
        //$http.get(APP.API + 'test').then(function (response) {
             
            if(response.data && response.data.data && response.data.data[0]) {
                $scope.allergies = response.data.data[0].allergies
               /*  console.log("$scope.openCreateMedialCanvas -> response.data.data[0].allergies", response.data.data[0].allergies)
                console.log("$scope.openCreateMedialCanvas -> $scope.allergies", $scope.allergies) */
                $scope.note = response.data.data[0].note
            }
            
        }).catch(function (request, status, errorThrown) {
        });
    }
    
    $scope.copyDescription = function () {
        
        $scope.customerId = items.data.id
        $http.post(
            APP.API + 'getReportDesc',$scope.customerId,
       ).then(function (response) {
        //$http.get(APP.API + 'test').then(function (response) {
            console.log("$scope.copyDescription -> response.data.data[0].form_subs", response.data.data[0].form_subs)
             
            if(response.data && response.data.data && response.data.data[0]) {
                $scope.selectedFormSubs = response.data.data[0].form_subs
            }
            
        }).catch(function (request, status, errorThrown) {
        });
    }

    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'day',
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
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);
    $scope.open = function (type) {
       
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
        $scope.dt = d;
    };
    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.dt);
    };
    $scope.clear = function () {
        $scope.dt = null;
    };

   
    $timeout(function(){
        $(".cke_top").css("display", "none");
        $(".cke_bottom").css("display", "none");
        $('#cke_txtArea').addClass('height-400');
      },1000);

}]);

app.controller('compareImagesController', ["$scope", "$uibModalInstance", "$http", "items", "toaster", "restSessionOut",  function ($scope, $uibModalInstance, $http, items, toaster, restSessionOut) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    toaster.options = {
        "positionClass": "toast-top-right",
        "timeOut": 800000
    }


    $scope.items = items;
    if (items.data != 0) {
        $scope.images = items.data;

    }


         $scope.zoom_in_out = function(image_id){
            var $section = $('#tmp_'+image_id);
            $section.find('#panzoom_'+image_id).panzoom({
              $zoomIn: $section.find("#zoom-in_"+image_id),
              $zoomOut: $section.find("#zoom-out_"+image_id),
              $reset: $section.find("#reset_"+image_id),
              startTransform: 'scale(1.1)',
              increment: 0.1,
              minScale: 1,
              contain: 'invert'
            }).panzoom('zoom');

         }
        $scope.rotateDegree = 0
        $scope.rotate = function(image_id){
            $scope.rotateDegree +=90
            $('#panzoom_'+image_id).css({'transform': 'rotate('+$scope.rotateDegree+'deg)'});
        }

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    setTimeout(function() {
        $('.dummyClass').click()
    },500);

}])



app.filter("groupBy",["$parse","$filter",function($parse,$filter){
    return function(array,groupByField){
              var result = [];
              var prev_item = null;
              var groupKey = false;
              var filteredData = $filter('orderBy')(array,-groupByField);
              filteredData = (filteredData == undefined) ? []:filteredData;

              for(var i=0;i<filteredData.length;i++){
                groupKey = false;
                if(prev_item !== null){
                  if(prev_item[groupByField] !== filteredData[i][groupByField]){
                    groupKey = true;
                  }
                } else {
                  groupKey = true;  
                }
                if(groupKey){
                  filteredData[i]['group_by_key'] =true;  
                } else {
                  filteredData[i]['group_by_key'] =false;  
                }
                result.push(filteredData[i]);
                prev_item = filteredData[i];
              }
              return result;
    }
  }])
